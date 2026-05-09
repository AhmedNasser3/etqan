<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentDashboardController extends Controller
{
    private function getStudentUser(Request $request)
    {
        $user = $request->user();
        abort_if(!$user, 401, 'Unauthenticated');
        return $user;
    }

    /**
     * GET /api/v1/student/dashboard
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->getStudentUser($request);

        // ── الطالب ──
        $student = DB::table('students')
            ->where('user_id', $user->id)
            ->first();

        // ── الحضور ──
        $totalAttendance = DB::table('student_attendance')
            ->where('user_id', $user->id)
            ->count();

        $presentCount = DB::table('student_attendance')
            ->where('user_id', $user->id)
            ->where('status', 'حاضر')
            ->count();

        $attendanceRate = $totalAttendance > 0
            ? round(($presentCount / $totalAttendance) * 100)
            : 0;

        // ── النقاط ──
        $achievementsData = DB::table('student_achievements')
            ->where('user_id', $user->id)
            ->selectRaw('SUM(CASE WHEN points_action = "added" THEN points ELSE 0 END) as total_added')
            ->selectRaw('SUM(CASE WHEN points_action = "deducted" THEN points ELSE 0 END) as total_deducted')
            ->first();

        $totalPoints = max(0, ($achievementsData->total_added ?? 0) - ($achievementsData->total_deducted ?? 0));

        // ── تقدم الخطة ──
        $totalPlanDays = DB::table('student_plan_details')
            ->whereIn('circle_student_booking_id', function ($sub) use ($user) {
                $sub->select('id')->from('circle_student_bookings')
                    ->where('user_id', $user->id);
            })
            ->count();

        $completedDays = DB::table('student_plan_details')
            ->where('status', 'مكتمل')
            ->whereIn('circle_student_booking_id', function ($sub) use ($user) {
                $sub->select('id')->from('circle_student_bookings')
                    ->where('user_id', $user->id);
            })
            ->count();

        $quranProgress = $totalPlanDays > 0
            ? round(($completedDays / $totalPlanDays) * 100)
            : 0;

        // ── آخر 10 تسميعات ──
        $recentPlanDetails = DB::table('student_plan_details as spd')
            ->join('plan_circle_schedules as pcs', 'pcs.id', '=', 'spd.plan_circle_schedule_id')
            ->whereIn('spd.circle_student_booking_id', function ($sub) use ($user) {
                $sub->select('id')->from('circle_student_bookings')
                    ->where('user_id', $user->id);
            })
            ->select(
                'spd.id',
                'pcs.schedule_date as session_date',
                'spd.new_memorization',
                'spd.review_memorization',
                'spd.status',
                'spd.day_number',
            )
            ->orderByDesc('pcs.schedule_date')
            ->limit(10)
            ->get();

        // ── الجلسة القادمة من plan_circle_schedules ──
        $nextSession = DB::table('plan_circle_schedules as pcs')
            ->join('circles as c', 'c.id', '=', 'pcs.circle_id')
            ->join('teachers as t', 't.id', '=', 'c.teacher_id')
            ->join('users as tu', 'tu.id', '=', 't.user_id')
            ->whereIn('pcs.id', function ($sub) use ($user) {
                $sub->select('plan_circle_schedule_id')
                    ->from('circle_student_bookings')
                    ->where('user_id', $user->id);
            })
            ->where('pcs.schedule_date', '>=', now()->toDateString())
            ->select(
                'pcs.id',
                'pcs.schedule_date as schedule_date',
                'pcs.start_time',
                'pcs.end_time',
                'c.name as circle_name',
                'tu.name as teacher_name',
            )
            ->orderBy('pcs.schedule_date')
            ->orderBy('pcs.start_time')
            ->first();

        // ── لو مافيش جلسة قادمة، نجيب أقرب تسميعة بحالة إعادة أو قيد الانتظار فقط ──
        // (غائب لا تُعرض كحصة قادمة)
        $pendingDetail = null;
        if (!$nextSession) {
            $pendingDetail = DB::table('student_plan_details as spd')
                ->join('plan_circle_schedules as pcs', 'pcs.id', '=', 'spd.plan_circle_schedule_id')
                ->join('circles as c', 'c.id', '=', 'spd.circle_id')
                ->join('teachers as t', 't.id', '=', 'spd.teacher_id')
                ->join('users as tu', 'tu.id', '=', 't.user_id')
                ->whereIn('spd.circle_student_booking_id', function ($sub) use ($user) {
                    $sub->select('id')->from('circle_student_bookings')
                        ->where('user_id', $user->id);
                })
                ->whereIn('spd.status', ['إعادة', 'قيد الانتظار'])
                ->select(
                    'spd.id',
                    'pcs.schedule_date as schedule_date',
                    'pcs.start_time',
                    'pcs.end_time',
                    'c.name as circle_name',
                    'tu.name as teacher_name',
                    'spd.status as detail_status',
                    'spd.new_memorization',
                    'spd.review_memorization',
                    'spd.day_number',
                )
                ->orderByDesc('pcs.schedule_date')
                ->first();
        }

        // ── الإنجازات ──
        $badges = DB::table('student_achievements')
            ->where('user_id', $user->id)
            ->whereNotNull('achievement_type')
            ->selectRaw('achievement_type, MAX(created_at) as earned_at, MAX(points) as pts')
            ->groupBy('achievement_type')
            ->get();

        return response()->json([
            'student'        => $student,
            'user'           => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'gender' => $user->gender,
                'phone'  => $user->phone,
                'status' => $user->status,
            ],
            'stats'          => [
                'attendance_rate' => $attendanceRate,
                'present_count'   => $presentCount,
                'total_sessions'  => $totalAttendance,
                'total_points'    => $totalPoints,
                'quran_progress'  => $quranProgress,
                'completed_days'  => $completedDays,
                'total_plan_days' => $totalPlanDays,
            ],
            'next_session'   => $nextSession,
            'pending_detail' => $pendingDetail,
            'recent_details' => $recentPlanDetails,
            'badges'         => $badges,
        ]);
    }

    /**
     * GET /api/v1/student/attendance
     */
    public function attendance(Request $request): JsonResponse
    {
        $user = $this->getStudentUser($request);

        $records = DB::table('student_attendance as sa')
            ->join('plan_circle_schedules as pcs', 'pcs.id', '=', 'sa.plan_circle_schedule_id')
            ->where('sa.user_id', $user->id)
            ->select(
                'sa.id',
                'sa.status',
                'sa.note',
                'sa.rating',
                'pcs.schedule_date as session_date',
                'pcs.start_time',
                'pcs.end_time',
            )
            ->orderByDesc('pcs.schedule_date')
            ->limit(50)
            ->get();

        return response()->json(['data' => $records]);
    }

    /**
     * GET /api/v1/student/achievements
     */
    public function achievements(Request $request): JsonResponse
    {
        $user = $this->getStudentUser($request);

        $rows = DB::table('student_achievements')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $rows]);
    }

    /**
     * GET /api/v1/student/plan-details
     */
    public function planDetails(Request $request): JsonResponse
    {
        $user = $this->getStudentUser($request);

        $rows = DB::table('student_plan_details as spd')
            ->join('plan_circle_schedules as pcs', 'pcs.id', '=', 'spd.plan_circle_schedule_id')
            ->whereIn('spd.circle_student_booking_id', function ($sub) use ($user) {
                $sub->select('id')->from('circle_student_bookings')
                    ->where('user_id', $user->id);
            })
            ->select(
                'spd.id',
                'spd.status',
                'spd.day_number',
                'spd.new_memorization',
                'spd.review_memorization',
                'pcs.schedule_date as session_date',
                'pcs.start_time',
            )
            ->orderByDesc('pcs.schedule_date')
            ->get();

        return response()->json(['data' => $rows]);
    }

    /**
     * GET /api/v1/student/next-session
     */
    public function nextSession(Request $request): JsonResponse
    {
        $user = $this->getStudentUser($request);

        $session = DB::table('plan_circle_schedules as pcs')
            ->join('circles as c', 'c.id', '=', 'pcs.circle_id')
            ->join('teachers as t', 't.id', '=', 'c.teacher_id')
            ->join('users as tu', 'tu.id', '=', 't.user_id')
            ->whereIn('pcs.id', function ($sub) use ($user) {
                $sub->select('plan_circle_schedule_id')
                    ->from('circle_student_bookings')
                    ->where('user_id', $user->id);
            })
            ->where('pcs.schedule_date', '>=', now()->toDateString())
            ->select(
                'pcs.id',
                'pcs.schedule_date as schedule_date',
                'pcs.start_time',
                'pcs.end_time',
                'c.name as circle_name',
                'tu.name as teacher_name',
            )
            ->orderBy('pcs.schedule_date')
            ->orderBy('pcs.start_time')
            ->first();

        return response()->json(['data' => $session]);
    }
}
