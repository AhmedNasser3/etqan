<?php

namespace App\Http\Controllers\Teachers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class TeacherAttendanceReportController extends Controller
{
    public function index(Request $request)
    {
        $centerId  = Auth::user()->center_id;
        $perPage   = min((int) ($request->per_page ?? 8), 100);
        $page      = max((int) ($request->page ?? 1), 1);
        $search    = trim($request->search ?? '');
        $status    = trim($request->status ?? '');
        $dateFrom  = $request->date_from  ?? Carbon::now()->startOfMonth()->toDateString();
        $dateTo    = $request->date_to    ?? Carbon::now()->toDateString();

        // ── المعلمون ────────────────────────────────────────────
        $query = DB::table('teachers as t')
            ->join('users as u', 't.user_id', '=', 'u.id')
            ->where('u.center_id', $centerId)
            ->when($search, fn($q) =>
                $q->where(fn($q2) =>
                    $q2->where('u.name',  'like', "%{$search}%")
                       ->orWhere('u.email', 'like', "%{$search}%")
                       ->orWhere('u.phone', 'like', "%{$search}%")
                )
            )
            ->when($status, fn($q) => $q->where('u.status', $status))
            ->select(
                't.id as teacher_id',
                'u.id as user_id',
                'u.name',
                'u.email',
                'u.phone',
                'u.avatar',
                'u.status',
                'u.created_at',
                'u.last_login_at',
                't.role as teacher_role',
                't.session_time',
                't.notes',
            );

        $total    = $query->count();
        $teachers = $query->orderBy('u.name')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        if ($teachers->isEmpty()) {
            return response()->json([
                'data'       => [],
                'pagination' => $this->pagination($page, $perPage, $total),
                'stats'      => $this->centerStats($centerId, $dateFrom, $dateTo),
            ]);
        }

        $userIds    = $teachers->pluck('user_id')->toArray();
        $teacherIds = $teachers->pluck('teacher_id')->toArray();
        $today      = Carbon::today()->toDateString();

        // ── جلسات الفترة ────────────────────────────────────────
        $logs = DB::table('session_logs')
            ->whereIn('user_id', $userIds)
            ->whereBetween('session_date', [$dateFrom, $dateTo])
            ->orderBy('joined_at')
            ->get()
            ->groupBy('user_id');

        // ── الحلقات مع عدد الطلاب ────────────────────────────────
        // تصحيح: استخدام جدول students بدلاً من circle_students غير الموجود
        // جدول students يحتوي على حقل circle (اسم الحلقة) وليس circle_id
        $circles = DB::table('circles as c')
            ->whereIn('c.teacher_id', $teacherIds)
            ->where('c.center_id', $centerId)
            ->select(
                'c.id',
                'c.name',
                'c.teacher_id',
                DB::raw('(
                    SELECT COUNT(*)
                    FROM students s
                    JOIN users su ON s.user_id = su.id
                    WHERE s.circle = c.name
                    AND su.status = "active"
                ) as students_count'),
            )
            ->get();

        // ربط teacher_id بـ user_id عبر جدول teachers
        $teacherIdToUserId = $teachers->pluck('user_id', 'teacher_id');

        $circlesGrouped = $circles->groupBy(function ($c) use ($teacherIdToUserId) {
            return $teacherIdToUserId[$c->teacher_id] ?? null;
        });

        // ── المواعيد ─────────────────────────────────────────────
        $schedules = DB::table('plan_circle_schedules as pcs')
            ->join('plans as pl',   'pcs.plan_id',   '=', 'pl.id')
            ->join('circles as ci', 'pcs.circle_id', '=', 'ci.id')
            ->whereIn('pcs.teacher_id', $userIds)
            ->where('pcs.is_available', true)
            ->select(
                'pcs.teacher_id as user_id',
                'pcs.id as schedule_id',
                'pcs.start_time',
                'pcs.end_time',
                'pcs.day_of_week',
                'pcs.max_students',
                'pcs.booked_students',
                'pl.plan_name',
                'ci.name as circle_name',
            )
            ->get()
            ->groupBy('user_id');

        // ── تجميع ────────────────────────────────────────────────
        $data = $teachers->map(function ($t) use (
            $logs, $circlesGrouped, $schedules, $today, $dateFrom, $dateTo
        ) {
            $uid      = $t->user_id;
            $userLogs = $logs[$uid] ?? collect();
            $todayLog = $userLogs->filter(fn($l) => $l->session_date === $today);

            // إجماليات
            $totalMins    = (int) $userLogs->sum('duration_minutes');
            $hoursMonth   = round($totalMins / 60, 2);
            $daysAttended = $userLogs->pluck('session_date')->unique()->count();

            // آخر جلسة
            $lastLog     = $userLogs->sortByDesc('joined_at')->first();
            $lastCheckin = $lastLog
                ? Carbon::parse($lastLog->joined_at)->format('H:i')
                : null;

            // حالة اليوم
            $attendanceToday = null;
            $delayMinutes    = 0;
            if ($todayLog->isNotEmpty()) {
                $first       = $todayLog->sortBy('joined_at')->first();
                $sessionHour = $t->session_time
                    ? (int) explode(':', $t->session_time)[0]
                    : null;
                $joinHour    = (int) Carbon::parse($first->joined_at)->format('H');

                if ($sessionHour !== null && $joinHour > $sessionHour) {
                    $attendanceToday = 'late';
                    $delayMinutes    = (int) Carbon::parse($t->session_time)
                        ->diffInMinutes(Carbon::parse($first->joined_at));
                } else {
                    $attendanceToday = 'present';
                }
            }

            // جلسات يومية
            $dailySessions = $userLogs
                ->groupBy('session_date')
                ->map(function ($dayLogs, $date) {
                    $mins = (int) $dayLogs->sum('duration_minutes');
                    $first = $dayLogs->sortBy('joined_at')->first();
                    $last  = $dayLogs->whereNotNull('left_at')->sortByDesc('left_at')->first();
                    return [
                        'date'             => $date,
                        'day_name'         => Carbon::parse($date)->locale('ar')->isoFormat('dddd'),
                        'sessions_count'   => $dayLogs->count(),
                        'total_minutes'    => $mins,
                        'total_hours'      => round($mins / 60, 2),
                        'duration_label'   => $this->fmt($mins),
                        'first_joined'     => Carbon::parse($first->joined_at)->format('H:i'),
                        'last_left'        => $last
                            ? Carbon::parse($last->left_at)->format('H:i')
                            : null,
                        'sessions' => $dayLogs->map(fn($l) => [
                            'log_id'           => $l->id,
                            'circle_name'      => $l->circle_name ?? null,
                            'joined_at'        => Carbon::parse($l->joined_at)->format('H:i:s'),
                            'left_at'          => $l->left_at
                                ? Carbon::parse($l->left_at)->format('H:i:s')
                                : null,
                            'duration_minutes' => (int) $l->duration_minutes,
                            'is_open'          => is_null($l->left_at),
                        ])->values(),
                    ];
                })
                ->sortKeysDesc()
                ->values();

            // الحلقات
            $teacherCircles = ($circlesGrouped[$uid] ?? collect())->map(fn($c) => [
                'id'             => $c->id,
                'name'           => $c->name,
                'students_count' => (int) $c->students_count,
            ])->values();

            // الجداول
            $teacherSchedules = ($schedules[$uid] ?? collect())->map(fn($s) => [
                'schedule_id'  => $s->schedule_id,
                'plan_name'    => $s->plan_name,
                'circle_name'  => $s->circle_name,
                'day_of_week'  => $s->day_of_week,
                'time_range'   => substr($s->start_time, 0, 5) . ' - ' . substr($s->end_time, 0, 5),
                'max_students' => $s->max_students,
                'booked'       => (int) $s->booked_students,
            ])->values();

            // خطة مختصرة للواجهة
            $firstS = $teacherSchedules->first();
            $plan   = $firstS ? [
                'title'         => $firstS['plan_name'],
                'circle_name'   => $firstS['circle_name'],
                'time_range'    => $firstS['time_range'],
                'weekly_days'   => $teacherSchedules->pluck('day_of_week')->unique()->values(),
                'sessions_done' => $userLogs->count(),
            ] : null;

            return [
                'teacher_id'            => $t->teacher_id,
                'user_id'               => $uid,
                'name'                  => $t->name,
                'email'                 => $t->email,
                'phone'                 => $t->phone,
                'avatar'                => $t->avatar,
                'status'                => $t->status,
                'created_at'            => $t->created_at,
                'last_login_at'         => $t->last_login_at,
                'teacher'               => [
                    'role'         => $t->teacher_role,
                    'session_time' => $t->session_time,
                    'notes'        => $t->notes,
                ],
                'circles'               => $teacherCircles,
                'circles_count'         => $teacherCircles->count(),
                'students_count'        => $teacherCircles->sum('students_count'),
                'schedules'             => $teacherSchedules,
                'plan'                  => $plan,
                'attendance_today'      => $attendanceToday,
                'last_checkin'          => $lastCheckin,
                'delay_minutes'         => $delayMinutes,
                'days_attended'         => $daysAttended,
                'total_sessions'        => $userLogs->count(),
                'total_minutes'         => $totalMins,
                'hours_this_period'     => $hoursMonth,
                'duration_label'        => $this->fmt($totalMins),
                'daily_sessions'        => $dailySessions,
                'period'                => ['from' => $dateFrom, 'to' => $dateTo],
            ];
        });

        return response()->json([
            'data'       => $data->values(),
            'pagination' => $this->pagination($page, $perPage, $total),
            'stats'      => $this->centerStats($centerId, $dateFrom, $dateTo),
        ]);
    }

    public function show(Request $request, $teacherId)
    {
        $centerId = Auth::user()->center_id;
        $dateFrom = $request->date_from ?? Carbon::now()->startOfMonth()->toDateString();
        $dateTo   = $request->date_to   ?? Carbon::now()->toDateString();

        $teacher = DB::table('teachers as t')
            ->join('users as u', 't.user_id', '=', 'u.id')
            ->where('t.id', $teacherId)
            ->where('u.center_id', $centerId)
            ->select(
                't.id as teacher_id', 'u.id as user_id', 'u.name',
                'u.email', 'u.phone', 'u.avatar', 'u.status',
                'u.created_at', 'u.last_login_at',
                't.role as teacher_role', 't.session_time', 't.notes',
            )
            ->first();

        if (!$teacher) {
            return response()->json(['message' => 'المعلم غير موجود'], 404);
        }

        $allLogs = DB::table('session_logs')
            ->where('user_id', $teacher->user_id)
            ->whereBetween('session_date', [$dateFrom, $dateTo])
            ->orderBy('joined_at', 'desc')
            ->get();

        $totalMins = (int) $allLogs->sum('duration_minutes');

        $daily = $allLogs->groupBy('session_date')->map(function ($dayLogs, $date) {
            $mins  = (int) $dayLogs->sum('duration_minutes');
            $first = $dayLogs->sortBy('joined_at')->first();
            $last  = $dayLogs->whereNotNull('left_at')->sortByDesc('left_at')->first();
            return [
                'date'           => $date,
                'day_name'       => Carbon::parse($date)->locale('ar')->isoFormat('dddd'),
                'sessions_count' => $dayLogs->count(),
                'total_minutes'  => $mins,
                'total_hours'    => round($mins / 60, 2),
                'duration_label' => $this->fmt($mins),
                'first_joined'   => Carbon::parse($first->joined_at)->format('H:i'),
                'last_left'      => $last ? Carbon::parse($last->left_at)->format('H:i') : null,
                'sessions'       => $dayLogs->map(fn($l) => [
                    'log_id'           => $l->id,
                    'circle_name'      => $l->circle_name ?? null,
                    'joined_at'        => Carbon::parse($l->joined_at)->format('H:i:s'),
                    'left_at'          => $l->left_at
                        ? Carbon::parse($l->left_at)->format('H:i:s') : null,
                    'duration_minutes' => (int) $l->duration_minutes,
                    'is_open'          => is_null($l->left_at),
                ])->values(),
            ];
        })->sortKeysDesc()->values();

        return response()->json([
            'teacher_id'      => $teacher->teacher_id,
            'user_id'         => $teacher->user_id,
            'name'            => $teacher->name,
            'email'           => $teacher->email,
            'phone'           => $teacher->phone,
            'status'          => $teacher->status,
            'teacher'         => [
                'role'         => $teacher->teacher_role,
                'session_time' => $teacher->session_time,
                'notes'        => $teacher->notes,
            ],
            'period'          => ['from' => $dateFrom, 'to' => $dateTo],
            'total_sessions'  => $allLogs->count(),
            'total_minutes'   => $totalMins,
            'total_hours'     => round($totalMins / 60, 2),
            'duration_label'  => $this->fmt($totalMins),
            'days_attended'   => $allLogs->pluck('session_date')->unique()->count(),
            'daily_sessions'  => $daily,
        ]);
    }

    private function centerStats(int $centerId, string $from, string $to): array
    {
        $teachers = DB::table('teachers as t')
            ->join('users as u', 't.user_id', '=', 'u.id')
            ->where('u.center_id', $centerId)
            ->select('u.id as user_id', 'u.status')
            ->get();

        $userIds   = $teachers->pluck('user_id')->toArray();
        $totalMins = (int) DB::table('session_logs')
            ->whereIn('user_id', $userIds)
            ->whereBetween('session_date', [$from, $to])
            ->sum('duration_minutes');
        $activeLogs = DB::table('session_logs')
            ->whereIn('user_id', $userIds)
            ->where('session_date', Carbon::today()->toDateString())
            ->distinct('user_id')->count('user_id');

        return [
            'total'              => $teachers->count(),
            'active'             => $teachers->where('status', 'active')->count(),
            'pending'            => $teachers->where('status', 'pending')->count(),
            'suspended'          => $teachers->whereIn('status', ['suspended', 'inactive'])->count(),
            'present_today'      => $activeLogs,
            'total_hours_period' => round($totalMins / 60, 2),
            'duration_label'     => $this->fmt($totalMins),
        ];
    }

    private function pagination(int $page, int $perPage, int $total): array
    {
        $last = max(1, (int) ceil($total / $perPage));
        return [
            'current_page' => $page,
            'per_page'     => $perPage,
            'total'        => $total,
            'last_page'    => $last,
            'from'         => ($page - 1) * $perPage + 1,
            'to'           => min($page * $perPage, $total),
        ];
    }

    private function fmt(int $m): string
    {
        if ($m <= 0) return '0 دقيقة';
        $h = intdiv($m, 60);
        $r = $m % 60;
        return implode(' و ', array_filter([
            $h ? "{$h} ساعة" : '',
            $r ? "{$r} دقيقة" : '',
        ]));
    }
}
