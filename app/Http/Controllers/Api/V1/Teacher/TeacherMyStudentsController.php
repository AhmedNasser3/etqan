<?php

namespace App\Http\Controllers\Api\V1\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TeacherMyStudentsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $teacherRecord = DB::table('teachers')
            ->where('user_id', $user->id)
            ->first();

        if (! $teacherRecord) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح — لست معلماً مسجلاً',
            ], 403);
        }

        $search   = $request->get('search');
        $circleId = $request->get('circle_id');
        $planId   = $request->get('plan_id');
        $perPage  = (int) $request->get('per_page', 15);

        $userId         = $user->id;
        $teacherId      = $teacherRecord->id;

        $query = DB::table('circle_student_bookings as csb')
            ->join('plan_circle_schedules as pcs',
                'pcs.id', '=', 'csb.plan_circle_schedule_id')
            ->join('circles as c', 'c.id', '=', 'pcs.circle_id')
            ->join('plans as pl', 'pl.id', '=', 'csb.plan_id')
            ->join('users as u', 'u.id', '=', 'csb.user_id')
            ->leftJoin('students as st', 'st.user_id', '=', 'csb.user_id')
            ->leftJoin('plan_details as pd', 'pd.id', '=', 'csb.plan_details_id')

            // ── الشرط الأساسي: طلاب هذا المعلم فقط
            ->where(function ($q) use ($userId, $teacherId) {
                $q->where('pcs.teacher_id', $userId)
                  ->orWhere('c.teacher_id', $teacherId);
            })

            ->when($search, function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('u.name', 'like', "%{$search}%")
                       ->orWhere('u.phone', 'like', "%{$search}%");
                });
            })
            ->when($circleId, fn($q) => $q->where('pcs.circle_id', $circleId))
            ->when($planId,   fn($q) => $q->where('csb.plan_id', $planId))

            ->select([
                'csb.id              as booking_id',
                'csb.plan_id',
                'csb.plan_details_id',
                'csb.plan_circle_schedule_id',
                'csb.status          as booking_status',
                'csb.progress_status',
                'csb.current_day',
                'csb.completed_days',
                'csb.total_days',
                'csb.started_at',
                'csb.completed_at',

                'u.id                as student_id',
                'u.name              as student_name',
                'u.phone             as student_phone',
                'u.avatar            as student_avatar',
                'u.gender',
                'u.birth_date',

                'st.grade_level',
                'st.health_status',
                'st.reading_level',
                'st.notes            as student_notes',

                'c.id                as circle_id',
                'c.name              as circle_name',

                'pl.plan_name',
                'pl.total_months',

                'pcs.start_time',
                'pcs.end_time',
                'pcs.day_of_week',
                'pcs.schedule_date',
                'pcs.duration_minutes',

                'pd.new_memorization    as current_memorization',
                'pd.review_memorization as current_review',
                'pd.day_number          as plan_day_number',
            ])
            ->distinct();

        $paginated = $query->paginate($perPage);

        $bookingIds = collect($paginated->items())->pluck('booking_id')->unique()->toArray();

        // ── student_plan_details لكل حجز
        $planDetails = DB::table('student_plan_details as spd')
            ->whereIn('spd.circle_student_booking_id', $bookingIds)
            ->select([
                'spd.circle_student_booking_id',
                'spd.id as plan_detail_id',
                'spd.day_number',
                'spd.status',
                'spd.new_memorization',
                'spd.review_memorization',
                'spd.session_time',
            ])
            ->get()
            ->groupBy('circle_student_booking_id');

        // ── student_attendance لكل plan_detail
        $planDetailIds = $planDetails->flatten()->pluck('plan_detail_id')->unique()->toArray();

        $attendanceRecords = DB::table('student_attendance as sa')
            ->whereIn('sa.student_plan_detail_id', $planDetailIds)
            ->select([
                'sa.student_plan_detail_id',
                'sa.status as att_status',
                'sa.note',
                'sa.rating',
                'sa.created_at',
            ])
            ->get()
            ->groupBy('student_plan_detail_id');

        // ── student_achievements
        $studentIds = collect($paginated->items())->pluck('student_id')->unique()->toArray();

        $achievements = DB::table('student_achievements')
            ->whereIn('user_id', $studentIds)
            ->select(
                'user_id',
                DB::raw('SUM(points) as total_points'),
                DB::raw('COUNT(*) as total_records')
            )
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        // ── تجميع البيانات
        $items = collect($paginated->items())->map(function ($booking) use (
            $planDetails,
            $attendanceRecords,
            $achievements
        ) {
            $details = $planDetails->get($booking->booking_id, collect());

            // كل سجلات الحضور لهذا الطالب
            $allAttendance = collect();
            foreach ($details as $detail) {
                $att = $attendanceRecords->get($detail->plan_detail_id, collect());
                $allAttendance = $allAttendance->merge($att);
            }

            $totalSessions  = $allAttendance->count();
            $presentCount   = $allAttendance->where('att_status', 'حاضر')->count();
            $absentCount    = $allAttendance->where('att_status', 'غائب')->count();
            $attendanceRate = $totalSessions > 0
                ? round(($presentCount / $totalSessions) * 100, 1)
                : 0;

            $ratings   = $allAttendance->whereNotNull('rating')->where('rating', '>', 0)->pluck('rating');
            $avgRating = $ratings->count() > 0 ? round($ratings->avg(), 1) : 0;

            $lastNote = $allAttendance
                ->whereNotNull('note')
                ->sortByDesc('created_at')
                ->first();

            $completedDays = $details->where('status', 'مكتمل')->count();
            $pendingDays   = $details->where('status', 'قيد الانتظار')->count();
            $retakeDays    = $details->where('status', 'إعادة')->count();
            $totalDays     = $details->count();
            $progressPct   = $totalDays > 0
                ? round(($completedDays / $totalDays) * 100)
                : 0;

            $recentSessions = $details
                ->sortByDesc('day_number')
                ->take(5)
                ->map(function ($d) use ($attendanceRecords) {
                    $att = $attendanceRecords->get($d->plan_detail_id)?->first();
                    return [
                        'day_number'          => $d->day_number,
                        'status'              => $d->status,
                        'new_memorization'    => $d->new_memorization,
                        'review_memorization' => $d->review_memorization,
                        'session_time'        => $d->session_time,
                        'attendance'          => $att?->att_status ?? '—',
                        'note'                => $att?->note,
                        'rating'              => $att?->rating ?? 0,
                    ];
                })
                ->values();

            $ach = $achievements->get($booking->student_id);

            return [
                'booking_id'              => $booking->booking_id,
                'plan_id'                 => $booking->plan_id,
                'plan_circle_schedule_id' => $booking->plan_circle_schedule_id,
                'booking_status'          => $booking->booking_status,
                'progress_status'         => $booking->progress_status,
                'started_at'              => $booking->started_at,
                'completed_at'            => $booking->completed_at,

                'student' => [
                    'id'           => $booking->student_id,
                    'name'         => $booking->student_name,
                    'phone'        => $booking->student_phone,
                    'avatar'       => $booking->student_avatar,
                    'gender'       => $booking->gender,
                    'birth_date'   => $booking->birth_date,
                    'grade_level'  => $booking->grade_level,
                    'health_status'=> $booking->health_status,
                    'reading_level'=> $booking->reading_level,
                    'notes'        => $booking->student_notes,
                ],

                'circle' => [
                    'id'   => $booking->circle_id,
                    'name' => $booking->circle_name,
                ],

                'plan' => [
                    'id'           => $booking->plan_id,
                    'name'         => $booking->plan_name,
                    'total_months' => $booking->total_months,
                ],

                'schedule' => [
                    'day_of_week'      => $booking->day_of_week,
                    'start_time'       => $booking->start_time,
                    'end_time'         => $booking->end_time,
                    'duration_minutes' => $booking->duration_minutes,
                    'schedule_date'    => $booking->schedule_date,
                ],

                'current_plan_day' => [
                    'day_number'   => $booking->plan_day_number,
                    'memorization' => $booking->current_memorization,
                    'review'       => $booking->current_review,
                ],

                'stats' => [
                    'total_sessions'  => $totalSessions,
                    'present_count'   => $presentCount,
                    'absent_count'    => $absentCount,
                    'attendance_rate' => $attendanceRate,
                    'avg_rating'      => $avgRating,
                    'completed_days'  => $completedDays,
                    'pending_days'    => $pendingDays,
                    'retake_days'     => $retakeDays,
                    'total_plan_days' => $totalDays,
                    'progress_pct'    => $progressPct,
                    'current_day'     => $booking->current_day,
                    'total_days'      => $booking->total_days,
                ],

                'last_note'       => $lastNote?->note,
                'recent_sessions' => $recentSessions,

                'achievements' => [
                    'total_points'  => $ach?->total_points ?? 0,
                    'total_records' => $ach?->total_records ?? 0,
                ],
            ];
        });

        // ── إحصائيات إجمالية
        $summary = [
            'total_students' => $paginated->total(),
            'total_circles'  => collect($paginated->items())->pluck('circle_id')->unique()->count(),
            'avg_attendance' => round($items->avg(fn($i) => $i['stats']['attendance_rate']), 1),
            'avg_progress'   => round($items->avg(fn($i) => $i['stats']['progress_pct']), 1),
        ];

        return response()->json([
            'success'  => true,
            'summary'  => $summary,
            'students' => $items,
            'meta'     => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    public function filters(Request $request)
    {
        $user = Auth::user();

        $teacherRecord = DB::table('teachers')
            ->where('user_id', $user->id)
            ->first();

        $userId    = $user->id;
        $teacherId = $teacherRecord?->id;

        $circles = DB::table('circles as c')
            ->join('plan_circle_schedules as pcs', 'pcs.circle_id', '=', 'c.id')
            ->where(function ($q) use ($userId, $teacherId) {
                $q->where('pcs.teacher_id', $userId)
                  ->orWhere('c.teacher_id', $teacherId);
            })
            ->select('c.id', 'c.name')
            ->distinct()
            ->get();

        $plans = DB::table('plans as pl')
            ->join('circle_student_bookings as csb', 'csb.plan_id', '=', 'pl.id')
            ->join('plan_circle_schedules as pcs', 'pcs.id', '=', 'csb.plan_circle_schedule_id')
            ->join('circles as c', 'c.id', '=', 'pcs.circle_id')
            ->where(function ($q) use ($userId, $teacherId) {
                $q->where('pcs.teacher_id', $userId)
                  ->orWhere('c.teacher_id', $teacherId);
            })
            ->select('pl.id', 'pl.plan_name as name')
            ->distinct()
            ->get();

        return response()->json([
            'success' => true,
            'circles' => $circles,
            'plans'   => $plans,
        ]);
    }
}
