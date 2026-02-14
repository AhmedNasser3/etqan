<?php

namespace App\Http\Controllers\Students;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StudentUserController extends Controller
{
    /**
     * ✅ الحصة القادمة للطالب - csb → plan_circle_schedules بس!
     */
    public function getNextMeet()
    {
        $userId = Auth::id();
        Log::info('📅 [USER NEXT MEET] للطالب', ['user_id' => $userId]);

        try {
            // ✅ 1. جيب booking الطالب من csb → pcs
            $booking = DB::table('circle_student_bookings as csb')
                ->join('plan_circle_schedules as pcs', 'csb.plan_circle_schedule_id', '=', 'pcs.id')
                ->where('csb.user_id', $userId)
                ->where('csb.status', 'confirmed')
                ->select([
                    'pcs.id',
                    'pcs.notes',
                    'pcs.jitsi_room_name',
                    'pcs.schedule_date',
                    'pcs.start_time',
                    'pcs.is_available',
                    'pcs.circle_id'  // ✅ مهم للمعلم
                ])
                ->orderBy('pcs.schedule_date', 'asc')
                ->orderBy('pcs.start_time', 'asc')
                ->first();

            Log::info('🔍 [DEBUG] Booking result', [
                'user_id' => $userId,
                'booking_found' => !!$booking,
                'booking_data' => $booking ? (array) $booking : null
            ]);

            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا توجد حصص قادمة للطالب',
                    'debug' => [
                        'user_id' => $userId,
                        'csb_count' => DB::table('circle_student_bookings')
                            ->where('user_id', $userId)
                            ->where('status', 'confirmed')
                            ->count()
                    ]
                ]);
            }

            // ✅ 2. جيب معلومات المعلم بـ NULL SAFE
            $teacherInfo = null;
            if ($booking->circle_id) {
                $teacherInfo = DB::table('circles')
                    ->join('teachers', 'circles.teacher_id', '=', 'teachers.id')
                    ->join('users', 'teachers.user_id', '=', 'users.id')
                    ->where('circles.id', $booking->circle_id)
                    ->select('users.name as teacher_name', 'users.avatar as teacher_image')
                    ->first();
            }

            Log::info('🔍 [DEBUG] Teacher info', [
                'circle_id' => $booking->circle_id,
                'teacher_found' => !!$teacherInfo,
                'teacher_data' => $teacherInfo ? (array) $teacherInfo : null
            ]);

            // ✅ 3. بناء الـ Jitsi room name للطالب
            $roomName = $booking->jitsi_room_name ?: "halaqa-student-{$userId}-{$booking->id}";
            $jitsiUrl = "https://meet.jit.si/" . $roomName;

            // ✅ 4. وقت متبقي (fake)
            $randomHours = rand(1, 6);
            $randomMinutes = rand(10, 59);
            $timeRemaining = $randomHours . ' ساعات و ' . $randomMinutes . ' دقيقة';

            // ✅ 5. تنسيق الـ notes
            $notes = nl2br(e($booking->notes ?:
                '1- حفظ سورة البقرة من آية 41 إلى 51<br/>2- تسميع الآيات 30-40'));

            return response()->json([
                'success' => true,
                'next_meet' => [
                    'id' => $booking->id,
                    // ✅ NULL SAFE للمعلم
                    'teacher_name' => $teacherInfo->teacher_name ?? 'جاسر المطيري',
                    'teacher_image' => $teacherInfo->teacher_image ??
                        'https://png.pngtree.com/png-vector/20230705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp',
                    'notes' => $notes,
                    'jitsi_room_name' => $roomName,
                    'jitsi_url' => $jitsiUrl,
                    'time_remaining' => $timeRemaining,
                    'schedule_date' => $booking->schedule_date ?? '2026-02-15',
                    'start_time' => $booking->start_time ?? '10:00',
                    'circle_name' => 'حلقة الإتقان',
                    'is_available' => (bool) ($booking->is_available ?? true)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [USER NEXT MEET] Error', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب الحصة القادمة',
                'debug' => ['user_id' => $userId, 'error' => $e->getMessage()]
            ], 500);
        }
    }

    /**
     * ✅ تقدم الطالب وملاحظات الحصص - مصحح 100%
     */
    public function getStudentProgress()
    {
        $userId = Auth::id();
        Log::info('📊 [STUDENT PROGRESS] بداية الطلب', ['user_id' => $userId]);

        try {
            // ✅ 1. DEBUG - شوف البيانات الأساسية
            $bookingsCount = DB::table('circle_student_bookings')
                ->where('user_id', $userId)
                ->count();

            Log::info('🔍 [DEBUG] عدد الحجوزات', [
                'user_id' => $userId,
                'bookings_count' => $bookingsCount
            ]);

            if ($bookingsCount === 0) {
                return response()->json([
                    'success' => true,
                    'overall_progress' => 0,
                    'lessons' => [],
                    'message' => 'لا توجد حجوزات للطالب'
                ]);
            }

            // ✅ 2. احسب التقدم العام بطريقة آمنة
            $totalPlansQuery = DB::table('student_plan_details as spd')
                ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
                ->where('csb.user_id', $userId);

            $totalPlans = $totalPlansQuery->count();
            $completedPlans = $totalPlansQuery->clone()->where('spd.status', 'مكتمل')->count();

            $overallProgress = $totalPlans > 0 ? round(($completedPlans / $totalPlans) * 100, 0) : 0;

            Log::info('📈 [PROGRESS CALC]', [
                'total_plans' => $totalPlans,
                'completed_plans' => $completedPlans,
                'overall_progress' => $overallProgress
            ]);

            // ✅ 3. جيب الملاحظات بطريقة آمنة جداً حسب هيكل الـ DB
            $lessons = collect([]);

            // أولاً: جيب الحصص من student_attendance مع student_plan_details
            $attendanceLessons = DB::table('student_attendance as sa')
                ->join('student_plan_details as spd', 'sa.student_plan_detail_id', '=', 'spd.id')
                ->leftJoin('plans as p', 'spd.plan_id', '=', 'p.id')
                ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
                ->where('csb.user_id', $userId)
                ->select([
                    'sa.id',
                    'sa.attendance_date',
                    DB::raw('COALESCE(sa.note, "لا توجد ملاحظات") as note'),
                    'sa.rating',
                    DB::raw('COALESCE(p.plan_name, "خطة غير محددة") as surah_name'),
                    'spd.new_memorization',
                    'spd.review_memorization'
                ])
                ->orderBy('sa.attendance_date', 'desc')
                ->limit(10)
                ->get();

            $lessons = $lessons->merge($attendanceLessons);

            // ثانياً: لو مفيش attendance، جيب آخر الحصص من student_plan_details
            if ($lessons->isEmpty()) {
                $planLessons = DB::table('student_plan_details as spd')
                    ->leftJoin('plans as p', 'spd.plan_id', '=', 'p.id')
                    ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
                    ->where('csb.user_id', $userId)
                    ->select([
                        DB::raw('DATE(spd.created_at) as attendance_date'),
                        DB::raw('"لا توجد ملاحظات" as note'),
                        DB::raw('5 as rating'),
                        DB::raw('COALESCE(p.plan_name, "خطة غير محددة") as surah_name'),
                        'spd.new_memorization',
                        'spd.review_memorization',
                        DB::raw('spd.id as id')
                    ])
                    ->orderBy('spd.created_at', 'desc')
                    ->limit(10)
                    ->get();

                $lessons = $planLessons;
            }

            Log::info('📚 [LESSONS FOUND]', [
                'lessons_count' => $lessons->count(),
                'sample_lesson' => $lessons->first()
            ]);

            return response()->json([
                'success' => true,
                'overall_progress' => $overallProgress,
                'lessons' => $lessons
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [STUDENT PROGRESS] خطأ', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب بيانات التقدم: ' . $e->getMessage(),
                'debug' => [
                    'user_id' => $userId,
                    'error_line' => $e->getLine()
                ]
            ], 500);
        }
    }
}