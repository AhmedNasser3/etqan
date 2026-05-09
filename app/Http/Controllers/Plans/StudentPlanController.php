<?php

namespace App\Http\Controllers\Plans;

use App\Http\Controllers\Controller;
use App\Models\Plans\CircleStudentBooking;
use App\Models\Student\StudentPlanDetail;
use App\Models\Auth\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StudentPlanController extends Controller
{
    public function getUserPlans(Request $request)
    {
        $user   = $request->user();
        $userId = $user ? $user->id : null;

        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل دخول',
                'data'    => [],
                'stats'   => $this->calculateStats([]),
            ], 401);
        }

        $allBookings       = CircleStudentBooking::where('user_id', $userId)->count();
        $confirmedBookings = CircleStudentBooking::where('user_id', $userId)
            ->where('status', 'confirmed')->count();

        $bookings = CircleStudentBooking::where('user_id', $userId)
            ->where('status', 'confirmed')
            ->with([
                'plan:id,plan_name,total_months',
                'planCircleSchedule',
                'studentPlanDetails:id,circle_student_booking_id,day_number,new_memorization,review_memorization,status,session_time',
            ])
            ->latest('started_at')
            ->get();

        $planData = [];

        foreach ($bookings as $booking) {
            $schedule = $booking->planCircleSchedule;

            $repeatType = $schedule?->repeat_type ?? 'daily';
            $repeatDays = [];

            if ($repeatType === 'specific_days' && $schedule?->repeat_days) {
                $decoded    = is_array($schedule->repeat_days)
                    ? $schedule->repeat_days
                    : json_decode($schedule->repeat_days, true);
                $repeatDays = $decoded ?? [];
            }

            // ✅ الحل: استخدم schedule_date كنقطة بداية حقيقية
            // لأنه التاريخ الفعلي لأول حصة في الجدول
            // لو مفيش schedule_date نرجع لـ started_at أو created_at
            $startDate = Carbon::parse(
                $schedule?->schedule_date
                    ?? $booking->started_at
                    ?? $booking->created_at
                    ?? now()
            )->startOfDay();

            Log::debug('📅 Start Date Source', [
                'booking_id'    => $booking->id,
                'schedule_date' => $schedule?->schedule_date,
                'started_at'    => $booking->started_at,
                'used_date'     => $startDate->format('Y-m-d'),
                'repeat_type'   => $repeatType,
                'repeat_days'   => $repeatDays,
            ]);

            $planDetails = $booking->studentPlanDetails ?? collect([]);

            foreach ($planDetails as $detail) {
                $sessionDate = $this->calculateSessionDate(
                    $startDate,
                    (int) $detail->day_number,
                    $repeatType,
                    $repeatDays
                );

                $planData[] = [
                    'id'           => (int) $detail->id,
                    'date'         => $sessionDate->format('Y-m-d'),
                    'day'          => $this->getArabicDayName($sessionDate),
                    'hifz'         => $detail->new_memorization   ?? 'لا يوجد',
                    'review'       => $detail->review_memorization ?? 'لا يوجد',
                    'status'       => $this->formatStatus($detail->status),
                    'session_time' => $detail->session_time,
                    'day_number'   => (int) $detail->day_number,
                    'booking_id'   => (int) $booking->id,
                    'repeat_type'  => $repeatType,
                    'repeat_days'  => $this->buildRepeatDaysArabic($repeatType, $repeatDays),
                ];
            }
        }

        $planData = collect($planData)->sortBy('date')->values()->all();

        return response()->json([
            'success' => true,
            'data'    => $planData,
            'stats'   => $this->calculateStats($planData),
            'debug'   => [
                'user_id'            => $userId,
                'all_bookings'       => $allBookings,
                'confirmed_bookings' => $confirmedBookings,
                'total_plan_items'   => count($planData),
            ],
        ]);
    }

    /**
     * daily:         startDate + (dayNumber - 1) يوم عادي
     *
     * specific_days: startDate نفسها هي day_number=1 بالظبط
     *                لأن schedule_date = التاريخ الفعلي لأول حصة
     *                فبس نعد الأيام المسموح بها التالية
     */
    private function calculateSessionDate(
        Carbon $startDate,
        int    $dayNumber,
        string $repeatType,
        array  $repeatDays
    ): Carbon {
        if ($repeatType === 'daily') {
            return $startDate->copy()->addDays($dayNumber - 1);
        }

        if (empty($repeatDays)) {
            return $startDate->copy()->addDays($dayNumber - 1);
        }

        $dayMap = [
            'sunday'    => Carbon::SUNDAY,
            'monday'    => Carbon::MONDAY,
            'tuesday'   => Carbon::TUESDAY,
            'wednesday' => Carbon::WEDNESDAY,
            'thursday'  => Carbon::THURSDAY,
            'friday'    => Carbon::FRIDAY,
            'saturday'  => Carbon::SATURDAY,
        ];

        $allowedDays = array_values(array_filter(
            array_map(fn($d) => $dayMap[strtolower(trim($d))] ?? null, $repeatDays)
        ));

        if (empty($allowedDays)) {
            return $startDate->copy()->addDays($dayNumber - 1);
        }

        // ✅ schedule_date هو أول يوم مسموح = day_number 1
        // نبدأ منه مباشرة بدون بحث
        $current = $startDate->copy();
        $count   = 1;

        if ($count === $dayNumber) {
            return $current;
        }

        $limit = 0;
        while ($limit < 730) {
            $current->addDay();
            $limit++;

            if (in_array($current->dayOfWeek, $allowedDays, true)) {
                $count++;
                if ($count === $dayNumber) {
                    return $current;
                }
            }
        }

        Log::warning('calculateSessionDate: exceeded limit', [
            'day_number'  => $dayNumber,
            'repeat_days' => $repeatDays,
            'start_date'  => $startDate->toDateString(),
        ]);

        return $startDate->copy()->addDays($dayNumber - 1);
    }

    private function buildRepeatDaysArabic(string $repeatType, array $repeatDays): array
    {
        if ($repeatType === 'daily' || empty($repeatDays)) {
            return ['يومياً'];
        }

        $map = [
            'sunday'    => 'الأحد',
            'monday'    => 'الإثنين',
            'tuesday'   => 'الثلاثاء',
            'wednesday' => 'الأربعاء',
            'thursday'  => 'الخميس',
            'friday'    => 'الجمعة',
            'saturday'  => 'السبت',
        ];

        return array_values(
            array_map(fn($d) => $map[strtolower(trim($d))] ?? $d, $repeatDays)
        );
    }

    public function demoPlans()
    {
        $startDate = Carbon::now()->subDays(3);
        $demoData  = [
            [
                'id'           => 1,
                'date'         => $startDate->copy()->format('Y-m-d'),
                'day'          => $this->getArabicDayName($startDate->copy()),
                'hifz'         => 'البقرة ٤٦-٥٠',
                'review'       => 'البقرة ١-١٠',
                'status'       => 'completed',
                'session_time' => '18:00:00',
                'day_number'   => 1,
                'booking_id'   => 999,
                'repeat_type'  => 'specific_days',
                'repeat_days'  => ['الأحد', 'الثلاثاء', 'الجمعة'],
            ],
            [
                'id'           => 2,
                'date'         => $startDate->copy()->addDays(2)->format('Y-m-d'),
                'day'          => $this->getArabicDayName($startDate->copy()->addDays(2)),
                'hifz'         => 'البقرة ٥١-٥٥',
                'review'       => 'البقرة ١١-٢٠',
                'status'       => 'pending',
                'session_time' => '18:00:00',
                'day_number'   => 2,
                'booking_id'   => 999,
                'repeat_type'  => 'specific_days',
                'repeat_days'  => ['الأحد', 'الثلاثاء', 'الجمعة'],
            ],
        ];

        return response()->json([
            'success' => true,
            'data'    => $demoData,
            'stats'   => $this->calculateStats($demoData),
            'debug'   => ['demo_mode' => true],
        ]);
    }

    private function getArabicDayName(Carbon $date): string
    {
        $days = [
            0 => 'الأحد',
            1 => 'الإثنين',
            2 => 'الثلاثاء',
            3 => 'الأربعاء',
            4 => 'الخميس',
            5 => 'الجمعة',
            6 => 'السبت',
        ];
        return $days[$date->dayOfWeek] ?? 'غير معروف';
    }

    private function formatStatus(string $status): string
    {
        return match ($status) {
            'مكتمل'        => 'completed',
            'قيد الانتظار' => 'pending',
            'إعادة'        => 'retry',
            default        => 'pending',
        };
    }

    private function calculateStats(array $planData): array
    {
        $total     = count($planData);
        $completed = collect($planData)->where('status', 'completed')->count();
        $progress  = $total > 0 ? round(($completed / $total) * 100) : 0;

        return [
            'total_days'          => $total,
            'completed_days'      => $completed,
            'progress_percentage' => $progress,
            'today_goal'          => $this->getTodayGoal($planData),
            'points'              => $total > 0
                ? ($completed * 10) . '/' . ($total * 10)
                : '0/0',
        ];
    }

    private function getTodayGoal(array $planData): ?array
    {
        $today = now()->format('Y-m-d');
        foreach ($planData as $plan) {
            if ($plan['date'] === $today) {
                return ['hifz' => $plan['hifz'], 'review' => $plan['review']];
            }
        }
        return null;
    }
}
