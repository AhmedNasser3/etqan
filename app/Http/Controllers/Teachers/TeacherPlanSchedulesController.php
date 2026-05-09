<?php

namespace App\Http\Controllers\Teachers;

use App\Http\Controllers\Controller;
use App\Models\Auth\Teacher;
use App\Models\Plans\PlanCircleSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TeacherPlanSchedulesController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        $schedules = PlanCircleSchedule::where('teacher_id', $currentUser->id)
            ->with(['plan:id,name', 'circle:id,name'])
            ->orderBy('schedule_date', 'desc')
            ->orderBy('start_time', 'asc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data'         => $schedules->getCollection()->map(fn($s) => $this->formatSchedule($s)),
            'current_page' => $schedules->currentPage(),
            'last_page'    => $schedules->lastPage(),
            'per_page'     => $schedules->perPage(),
            'total'        => $schedules->total(),
        ]);
    }

    public function show($id)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $schedule = PlanCircleSchedule::where('teacher_id', $currentUser->id)
            ->with(['plan:id,name', 'circle:id,name'])
            ->findOrFail($id);

        return response()->json(['data' => $this->formatSchedule($schedule)]);
    }

    public function availableSchedules(Request $request)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        $schedules = PlanCircleSchedule::where('teacher_id', $currentUser->id)
            ->where('is_available', true)
            ->with(['plan:id,name', 'circle:id,name'])
            ->orderBy('schedule_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->limit(20)
            ->get();

        return response()->json([
            'data'            => $schedules->map(fn($s) => $this->formatSchedule($s)),
            'total_available' => $schedules->count(),
        ]);
    }

    public function stats(Request $request)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        $total     = PlanCircleSchedule::where('teacher_id', $currentUser->id)->count();
        $available = PlanCircleSchedule::where('teacher_id', $currentUser->id)->where('is_available', true)->count();
        $future    = PlanCircleSchedule::where('teacher_id', $currentUser->id)->where('schedule_date', '>=', now()->toDateString())->count();
        $full      = PlanCircleSchedule::where('teacher_id', $currentUser->id)->whereRaw('booked_students >= max_students')->count();

        return response()->json([
            'total_schedules'     => $total,
            'available_schedules' => $available,
            'future_schedules'    => $future,
            'full_schedules'      => $full,
            'availability_rate'   => $total > 0 ? round(($available / $total) * 100, 1) : 0,
        ]);
    }

    /**
     * ✅ الـ endpoint الرئيسي للفرونت
     * بيجيب كل الحلقات المتاحة للمعلم مع repeat_type و repeat_days
     */
    public function getTeacherPlanSchedules(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'غير مصرح'], 401);
        }

        $schedules = PlanCircleSchedule::where('teacher_id', $user->id)
            ->where('is_available', true)
            ->with(['plan:id,plan_name', 'circle:id,name'])
            ->orderBy('schedule_date', 'desc')
            ->orderBy('start_time')
            ->limit(20)
            ->get();

        return response()->json(
            $schedules->map(fn($s) => $this->formatSchedule($s))
        );
    }

    // =========================================================
    // Helpers
    // =========================================================

    private function formatSchedule(PlanCircleSchedule $schedule): array
    {
        $repeatType = $schedule->repeat_type ?? 'daily';
        $repeatDays = [];

        if ($repeatType === 'specific_days' && $schedule->repeat_days) {
            $decoded    = is_array($schedule->repeat_days)
                ? $schedule->repeat_days
                : json_decode($schedule->repeat_days, true);
            $repeatDays = $decoded ?? [];
        }

        return [
            'id'                  => $schedule->id,
            'plan_id'             => $schedule->plan_id,
            'plan_name'           => $schedule->plan->plan_name ?? $schedule->plan->name ?? 'غير محدد',
            'circle_id'           => $schedule->circle_id,
            'circle_name'         => $schedule->circle->name ?? 'غير محدد',
            'teacher_id'          => $schedule->teacher_id,
            'schedule_date'       => $schedule->schedule_date instanceof \Carbon\Carbon
                ? $schedule->schedule_date->format('Y-m-d')
                : $schedule->schedule_date,
            'start_time'          => $schedule->start_time,
            'end_time'            => $schedule->end_time,
            'duration_minutes'    => $schedule->duration_minutes,
            'day_of_week'         => $schedule->day_of_week,
            'day_of_week_ar'      => $this->getArabicDay($schedule->day_of_week),
            'repeat_type'         => $repeatType,
            'repeat_days'         => $repeatDays,
            'repeat_days_ar'      => $this->buildRepeatDaysArabic($repeatType, $repeatDays),
            'schedule_days_label' => $this->buildDaysLabel($repeatType, $repeatDays),
            'plan_end_date'       => $schedule->plan_end_date,
            'max_students'        => $schedule->max_students,
            'booked_students'     => $schedule->booked_students,
            'remaining_slots'     => ($schedule->max_students ?? 0) - $schedule->booked_students,
            'is_available'        => $schedule->is_available,
            'notes'               => $schedule->notes,
            'jitsi_room_name'     => $schedule->jitsi_room_name,
        ];
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

    private function buildDaysLabel(string $repeatType, array $repeatDays): string
    {
        if ($repeatType === 'daily' || empty($repeatDays)) {
            return 'يومياً';
        }

        return implode('، ', $this->buildRepeatDaysArabic($repeatType, $repeatDays));
    }

    private function getArabicDay(string $day): string
    {
        $days = [
            'sunday'    => 'الأحد',
            'monday'    => 'الإثنين',
            'tuesday'   => 'الثلاثاء',
            'wednesday' => 'الأربعاء',
            'thursday'  => 'الخميس',
            'friday'    => 'الجمعة',
            'saturday'  => 'السبت',
        ];
        return $days[strtolower($day)] ?? $day;
    }
}
