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
        // 🔥 DEBUG 1: User Authentication
        $user = $request->user();
        $userId = $user ? $user->id : null;

        Log::info('🔍 StudentPlanController - User Check', [
            'user_id' => $userId,
            'user_authenticated' => $user ? '' : '❌',
            'user_email' => $user ? ($user->email ?? 'غير موجود') : 'غير مسجل'
        ]);

        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل دخول',
                'data' => [],
                'stats' => $this->calculateStats([])
            ], 401);
        }

        // 🔥 DEBUG 2: Check ALL bookings first
        $allBookings = CircleStudentBooking::where('user_id', $userId)->count();
        $confirmedBookings = CircleStudentBooking::where('user_id', $userId)
            ->where('status', 'confirmed')->count();

        Log::info('📊 Booking Stats', [
            'all_bookings' => $allBookings,
            'confirmed_bookings' => $confirmedBookings
        ]);

        // 🔥 Get bookings مع relation loading صحيح
        $bookingsQuery = CircleStudentBooking::where('user_id', $userId)
            ->where('status', 'confirmed')
            ->with([
                'plan:id,plan_name,total_months',
                'planCircleSchedule:id,schedule_date,start_time',
                'studentPlanDetails:id,circle_student_booking_id,day_number,new_memorization,review_memorization,status,session_time'
            ])
            ->latest('started_at');

        $bookings = $bookingsQuery->get();

        Log::info('🔗 Bookings Loaded', [
            'bookings_count' => $bookings->count(),
            'first_booking' => $bookings->first() ? $bookings->first()->only(['id', 'started_at', 'created_at']) : null
        ]);

        $planData = [];

        foreach ($bookings as $booking) {
            //  استخدم created_at لو started_at مش موجود
            $startDate = Carbon::parse(
                $booking->started_at ?? $booking->created_at ?? now()->subDays(7)
            )->startOfDay();

            Log::debug('📅 Start Date', [
                'booking_id' => $booking->id,
                'started_at' => $booking->started_at,
                'created_at' => $booking->created_at,
                'calculated_start' => $startDate->format('Y-m-d')
            ]);

            //  جلب الـ plan details بطريقة آمنة
            $planDetails = $booking->studentPlanDetails ?? collect([]);

            Log::debug('📚 Plan Details', [
                'booking_id' => $booking->id,
                'details_count' => $planDetails->count()
            ]);

            foreach ($planDetails as $detail) {
                $sessionDate = $startDate->copy()->addDays($detail->day_number - 1);

                $planData[] = [
                    'id' => (int) $detail->id,
                    'date' => $sessionDate->format('Y-m-d'),
                    'day' => $this->getArabicDayName($sessionDate),
                    'hifz' => $detail->new_memorization ?? 'لا يوجد',
                    'review' => $detail->review_memorization ?? 'لا يوجد',
                    'status' => $this->formatStatus($detail->status),
                    'session_time' => $detail->session_time,
                    'day_number' => (int) $detail->day_number,
                    'booking_id' => (int) $booking->id,
                ];
            }
        }

        //  ترتيب حسب التاريخ
        $planData = collect($planData)->sortBy('date')->values()->all();

        Log::info(' Final Data Ready', [
            'total_items' => count($planData),
            'date_range' => [
                'first_date' => $planData ? $planData[0]['date'] : null,
                'last_date' => $planData ? end($planData)['date'] : null
            ]
        ]);

        $stats = $this->calculateStats($planData);

        return response()->json([
            'success' => true,
            'data' => $planData,
            'stats' => $stats,
            'debug' => [
                'user_id' => $userId,
                'all_bookings' => $allBookings,
                'confirmed_bookings' => $confirmedBookings,
                'total_plan_items' => count($planData)
            ]
        ]);
    }

    /**
     * 🔥 Demo Response للـ Testing
     */
    public function demoPlans()
    {
        $startDate = Carbon::now()->subDays(3);
        $demoData = [
            [
                'id' => 1,
                'date' => $startDate->copy()->addDays(0)->format('Y-m-d'),
                'day' => $this->getArabicDayName($startDate->copy()->addDays(0)),
                'hifz' => 'البقرة ٤٦-٥٠',
                'review' => 'البقرة ١-١٠',
                'status' => 'completed',
                'session_time' => '18:00:00',
                'day_number' => 1,
                'booking_id' => 999
            ],
            [
                'id' => 2,
                'date' => $startDate->copy()->addDays(1)->format('Y-m-d'),
                'day' => $this->getArabicDayName($startDate->copy()->addDays(1)),
                'hifz' => 'البقرة ٥١-٥٥',
                'review' => 'البقرة ١١-٢٠',
                'status' => 'pending',
                'session_time' => '18:00:00',
                'day_number' => 2,
                'booking_id' => 999
            ],
            [
                'id' => 3,
                'date' => $startDate->copy()->addDays(2)->format('Y-m-d'),
                'day' => $this->getArabicDayName($startDate->copy()->addDays(2)),
                'hifz' => 'البقرة ٥٦-٦٠',
                'review' => 'البقرة ٢١-٣٠',
                'status' => 'retry',
                'session_time' => '18:00:00',
                'day_number' => 3,
                'booking_id' => 999
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $demoData,
            'stats' => $this->calculateStats($demoData),
            'debug' => ['demo_mode' => true]
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
            6 => 'السبت'
        ];

        return $days[$date->dayOfWeek] ?? 'غير معروف';
    }

    private function formatStatus(string $status): string
    {
        switch ($status) {
            case 'مكتمل':
                return 'completed';
            case 'قيد الانتظار':
                return 'pending';
            case 'إعادة':
                return 'retry';
            default:
                return 'pending';
        }
    }

    private function calculateStats(array $planData): array
    {
        $total = count($planData);
        $completedCount = 0;

        foreach ($planData as $item) {
            if ($item['status'] === 'completed') {
                $completedCount++;
            }
        }

        $completed = $completedCount;
        $progress = $total > 0 ? round(($completed / $total) * 100) : 0;

        return [
            'total_days' => $total,
            'completed_days' => $completed,
            'progress_percentage' => $progress,
            'today_goal' => $this->getTodayGoal($planData),
            'points' => $total > 0 ? $completed * 10 . '/' . $total * 10 : '0/0'
        ];
    }

    private function getTodayGoal(array $planData): ?array
    {
        $today = now()->format('Y-m-d');

        foreach ($planData as $plan) {
            if ($plan['date'] === $today) {
                return [
                    'hifz' => $plan['hifz'],
                    'review' => $plan['review']
                ];
            }
        }

        return null;
    }
}
