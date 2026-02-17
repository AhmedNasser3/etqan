<?php

// app/Http/Controllers/Teachers/TeacherPlanSchedulesController.php

namespace App\Http\Controllers\Teachers;

use App\Http\Controllers\Controller;
use App\Models\Auth\Teacher;
use App\Models\Plans\PlanCircleSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherPlanSchedulesController extends Controller
{
    /**
     * ✅ INDEX - جدول الخطط الخاص بالمعلم (teacher_id = auth()->id)
     */
    public function index(Request $request)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        // ✅ التحقق أن اليوزر معلم
        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        // ✅ جلب الخطط الخاصة بالمعلم فقط (teacher_id === auth user id)
        $schedules = PlanCircleSchedule::where('teacher_id', $currentUser->id)
            ->with(['plan:id,name', 'circle:id,name'])
            ->orderBy('schedule_date', 'desc')
            ->orderBy('start_time', 'asc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $schedules->getCollection()->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'plan_id' => $schedule->plan_id,
                    'plan_name' => $schedule->plan->name ?? 'غير محدد',
                    'circle_id' => $schedule->circle_id,
                    'circle_name' => $schedule->circle->name ?? 'غير محدد',
                    'teacher_id' => $schedule->teacher_id,
                    'schedule_date' => $schedule->schedule_date,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'duration_minutes' => $schedule->duration_minutes,
                    'day_of_week' => $schedule->day_of_week,
                    'max_students' => $schedule->max_students,
                    'booked_students' => $schedule->booked_students,
                    'remaining_slots' => $schedule->max_students - $schedule->booked_students,
                    'is_available' => $schedule->is_available,
                    'notes' => $schedule->notes,
                    'created_at_formatted' => $schedule->created_at->format('Y-m-d H:i'),
                ];
            }),
            'current_page' => $schedules->currentPage(),
            'last_page' => $schedules->lastPage(),
            'per_page' => $schedules->perPage(),
            'total' => $schedules->total(),
        ]);
    }

    /**
     * ✅ SHOW - عرض جدول واحد
     */
    public function show($id)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $schedule = PlanCircleSchedule::where('teacher_id', $currentUser->id)
            ->with(['plan:id,name', 'circle:id,name'])
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $schedule->id,
                'plan_id' => $schedule->plan_id,
                'plan_name' => $schedule->plan->name ?? 'غير محدد',
                'circle_id' => $schedule->circle_id,
                'circle_name' => $schedule->circle->name ?? 'غير محدد',
                'teacher_id' => $schedule->teacher_id,
                'schedule_date' => $schedule->schedule_date,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'duration_minutes' => $schedule->duration_minutes,
                'day_of_week' => $schedule->day_of_week,
                'max_students' => $schedule->max_students,
                'booked_students' => $schedule->booked_students,
                'remaining_slots' => $schedule->max_students - $schedule->booked_students,
                'is_available' => $schedule->is_available,
                'notes' => $schedule->notes,
            ]
        ]);
    }

    /**
     * ✅ جلب الخطط المتاحة للمعلم
     */
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
            ->where('schedule_date', '>=', now()->toDateString())
            ->with(['plan:id,name', 'circle:id,name'])
            ->orderBy('schedule_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->limit(20)
            ->get();

        return response()->json([
            'data' => $schedules->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'plan_name' => $schedule->plan->name ?? 'غير محدد',
                    'circle_name' => $schedule->circle->name ?? 'غير محدد',
                    'schedule_date' => $schedule->schedule_date,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'remaining_slots' => $schedule->max_students - $schedule->booked_students,
                    'is_available' => $schedule->is_available,
                ];
            }),
            'total_available' => $schedules->count()
        ]);
    }

    /**
     * ✅ إحصائيات الخطط
     */
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

        $totalSchedules = PlanCircleSchedule::where('teacher_id', $currentUser->id)->count();
        $availableSchedules = PlanCircleSchedule::where('teacher_id', $currentUser->id)
            ->where('is_available', true)->count();
        $futureSchedules = PlanCircleSchedule::where('teacher_id', $currentUser->id)
            ->where('schedule_date', '>=', now()->toDateString())->count();
        $fullSchedules = PlanCircleSchedule::where('teacher_id', $currentUser->id)
            ->whereRaw('booked_students >= max_students')->count();

        return response()->json([
            'total_schedules' => $totalSchedules,
            'available_schedules' => $availableSchedules,
            'future_schedules' => $futureSchedules,
            'full_schedules' => $fullSchedules,
            'availability_rate' => $totalSchedules > 0 ? round(($availableSchedules / $totalSchedules) * 100, 1) : 0
        ]);
    }
}