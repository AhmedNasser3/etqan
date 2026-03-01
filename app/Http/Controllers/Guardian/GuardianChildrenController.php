<?php
// GuardianChildrenController.php -  كامل مع كل البيانات والـ JOINs المطلوبة

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Student;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class GuardianChildrenController extends Controller
{
    public function index()
    {
        $guardianId = Auth::id();
        \Log::info("🔍 Guardian ID: {$guardianId}");

        if (!$guardianId) {
            return response()->json(['success' => false, 'message' => 'غير مسجل دخول'], 401);
        }

        // 1. جلب الطلاب بتوع الـ Guardian
        $students = Student::where('guardian_id', $guardianId)
            ->with('user:id,name,email,phone,birth_date,gender,avatar')
            ->pluck('user_id', 'id')
            ->toArray();

        \Log::info("🔍 Students found: " . count($students));

        if (empty($students)) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'لا يوجد أبناء مسجلين'
            ]);
        }

        //  2. الحجوزات مع تفاصيل الخطة + الجدول الزمني + المعلم
        $bookingsRaw = DB::table('circle_student_bookings as b')
            ->join('plans as p', 'b.plan_id', '=', 'p.id')
            ->leftJoin('plan_circle_schedules as s', 'b.plan_circle_schedule_id', '=', 's.id')
            ->leftJoin('users as t', 's.teacher_id', '=', 't.id')
            ->whereIn('b.user_id', array_values($students))
            ->select(
                'b.*',
                'p.plan_name',
                's.schedule_date',
                's.start_time',
                't.name as teacher_name'
            )
            ->get();

        \Log::info("🔍 Raw bookings count: " . $bookingsRaw->count());

        //  3. الحضور مع تفاصيل الخطة
        $attendanceRaw = DB::table('student_attendance as a')
            ->leftJoin('plan_circle_schedules as s', 'a.plan_circle_schedule_id', '=', 's.id')
            ->whereIn('a.user_id', array_values($students))
            ->select(
                'a.*',
                's.schedule_date',
                's.start_time'
            )
            ->orderBy('a.created_at', 'desc')
            ->get();

        \Log::info("🔍 Raw attendance count: " . $attendanceRaw->count());

        //  4. تفاصيل الخطة للطالب (student_plan_details)
        $planDetailsRaw = DB::table('student_plan_details as spd')
            ->join('circle_student_bookings as b', 'spd.circle_student_booking_id', '=', 'b.id')
            ->whereIn('b.user_id', array_values($students))
            ->select(
                'spd.*',
                'b.user_id'
            )
            ->get();

        \Log::info("🔍 Plan details count: " . $planDetailsRaw->count());

        //  5. الإنجازات
        $achievementsRaw = DB::table('student_achievements')
            ->whereIn('user_id', array_values($students))
            ->select('id', 'user_id', 'points', 'points_action', 'reason', 'achievement_type', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        \Log::info("🔍 Raw achievements count: " . $achievementsRaw->count());

        // 6. تجميع البيانات حسب الطالب
        $childrenData = Student::where('guardian_id', $guardianId)
            ->with('user:id,name,email,phone,birth_date,gender,avatar')
            ->get()
            ->map(function ($student) use ($bookingsRaw, $attendanceRaw, $planDetailsRaw, $achievementsRaw) {
                $userId = $student->user_id;

                // فلترة البيانات للطالب ده بس
                $studentBookings = $bookingsRaw->where('user_id', $userId);
                $studentAttendance = $attendanceRaw->where('user_id', $userId);
                $studentPlanDetails = $planDetailsRaw->where('user_id', $userId);
                $studentAchievements = $achievementsRaw->where('user_id', $userId);

                \Log::info("🔍 Student {$student->user->name}: bookings={$studentBookings->count()}, attendance={$studentAttendance->count()}, plan_details={$studentPlanDetails->count()}");

                return [
                    'id' => $student->id,
                    'user' => [
                        'id' => $student->user->id,
                        'name' => $student->user->name,
                        'email' => $student->user->email,
                        'phone' => $student->user->phone,
                        'birth_date' => $student->user->birth_date?->format('Y-m-d'),
                        'gender' => $student->user->gender,
                        'avatar' => $student->user->avatar,
                    ],
                    'student_info' => [
                        'id_number' => $student->id_number,
                        'grade_level' => $student->grade_level,
                        'circle' => $student->circle,
                        'health_status' => $student->health_status,
                        'reading_level' => $student->reading_level,
                        'session_time' => $student->session_time,
                        'notes' => $student->notes,
                    ],
                    'stats' => [
                        //  إحصائيات الحجوزات
                        'bookings_count' => $studentBookings->count(),
                        'active_bookings' => $studentBookings->where('status', 'confirmed')->count(),

                        //  إحصائيات الإنجازات
                        'achievements_count' => $studentAchievements->count(),
                        'total_points' => $studentAchievements->sum('points'),

                        //  إحصائيات الحضور التقليدية
                        'present_days' => $studentAttendance->where('status', 'حاضر')->count(),
                        'absent_days' => $studentAttendance->where('status', 'غائب')->count(),
                        'total_attendance' => $studentAttendance->count(),
                        'attendance_rate' => $studentAttendance->count() > 0
                            ? round(($studentAttendance->where('status', 'حاضر')->count() / $studentAttendance->count()) * 100, 1)
                            : 0,
                        'avg_rating' => $studentAttendance->avg('rating'),

                        //  إحصائيات تفاصيل الخطة (الجديدة المطلوبة)
                        'total_plan_details' => $studentPlanDetails->count(),
                        'completed_plan_details' => $studentPlanDetails->where('status', 'مكتمل')->count(),
                        'pending_plan_details' => $studentPlanDetails->whereIn('status', ['قيد الانتظار', 'إعادة'])->count(),
                        'plan_completion_rate' => $studentPlanDetails->count() > 0
                            ? round(($studentPlanDetails->where('status', 'مكتمل')->count() / $studentPlanDetails->count()) * 100, 1)
                            : 0,
                    ],
                    'plans' => $studentBookings->map(function ($booking) {
                        return [
                            'id' => $booking->id,
                            'plan_name' => $booking->plan_name, //  من جدول plans
                            'status' => $booking->status,
                            'progress_status' => $booking->progress_status,
                            'current_day' => $booking->current_day,
                            'completed_days' => $booking->completed_days,
                            'total_days' => $booking->total_days,
                            'progress_rate' => $booking->total_days > 0
                                ? round(($booking->completed_days / $booking->total_days) * 100, 1)
                                : 0,
                            'schedule_info' => [
                                'date' => $booking->schedule_date,
                                'time' => $booking->start_time,
                                'teacher_name' => $booking->teacher_name,
                            ]
                        ];
                    }),
                    'recent_attendance' => $studentAttendance->take(5)->map(fn($record) => [
                        'date' => Carbon::parse($record->created_at)->format('Y-m-d H:i'),
                        'status' => $record->status,
                        'note' => $record->note,
                        'rating' => $record->rating,
                        'schedule_date' => $record->schedule_date,
                        'schedule_time' => $record->start_time,
                    ]),
                    'recent_achievements' => $studentAchievements->take(3)->map(fn($ach) => [
                        'points' => $ach->points,
                        'reason' => $ach->reason,
                        'date' => Carbon::parse($ach->created_at)->format('Y-m-d'),
                        'type' => $ach->achievement_type
                    ]),
                    'plan_details_stats' => [
                        'total' => $studentPlanDetails->count(),
                        'completed' => $studentPlanDetails->where('status', 'مكتمل')->count(),
                        'pending' => $studentPlanDetails->whereIn('status', ['قيد الانتظار', 'إعادة'])->count(),
                        'rate' => $studentPlanDetails->count() > 0
                            ? round(($studentPlanDetails->where('status', 'مكتمل')->count() / $studentPlanDetails->count()) * 100, 1)
                            : 0,
                    ]
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $childrenData,
            'message' => 'تم جلب بيانات أبنائك كاملة بنجاح'
            // شيل الـ debug للـ production
        ]);
    }
}