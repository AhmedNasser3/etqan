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
     *  الحصة القادمة للطالب - csb → plan_circle_schedules بس!
     */
    public function getNextMeet()
    {
        $userId = Auth::id();
        Log::info('📅 [USER NEXT MEET] للطالب', ['user_id' => $userId]);

        try {
            //  1. جيب booking الطالب من csb → pcs
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
                    'pcs.circle_id'
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

            //  2. جيب معلومات المعلم بـ NULL SAFE
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

            //  3. بناء الـ Jitsi room name للطالب
            $roomName = $booking->jitsi_room_name ?: "halaqa-student-{$userId}-{$booking->id}";
            $jitsiUrl = "https://meet.jit.si/" . $roomName;

            //  4. وقت متبقي (fake)
            $randomHours = rand(1, 6);
            $randomMinutes = rand(10, 59);
            $timeRemaining = $randomHours . ' ساعات و ' . $randomMinutes . ' دقيقة';

            //  5. تنسيق الـ notes
            $notes = nl2br(e($booking->notes ?:
                '1- حفظ سورة البقرة من آية 41 إلى 51<br/>2- تسميع الآيات 30-40'));

            return response()->json([
                'success' => true,
                'next_meet' => [
                    'id' => $booking->id,
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
     *  تقدم الطالب وملاحظات الحصص - مُصحح نهائياً
     */
    public function getStudentProgress()
    {
        $userId = Auth::id();
        Log::info('📊 [STUDENT PROGRESS] بداية الطلب', ['user_id' => $userId]);

        try {
            //  1. احسب التقدم العام
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

            //  2. جيب الملاحظات من student_attendance مع created_at
            $lessonsQuery = DB::table('student_attendance as sa')
                ->join('student_plan_details as spd', 'sa.student_plan_detail_id', '=', 'spd.id')
                ->leftJoin('plans as p', 'spd.plan_id', '=', 'p.id')
                ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
                ->where('csb.user_id', $userId)
                ->select([
                    'sa.id',
                    DB::raw('DATE_FORMAT(sa.created_at, "%Y-%m-%d") as attendance_date'),
                    DB::raw('COALESCE(sa.note, "لا توجد ملاحظات") as note'),
                    'sa.rating as rating',
                    DB::raw('COALESCE(p.plan_name, "خطة غير محددة") as surah_name'),
                    'spd.new_memorization',
                    'spd.review_memorization'
                ])
                ->orderBy('sa.created_at', 'desc')
                ->limit(10);

            $lessons = $lessonsQuery->get();

            //  3. لو مفيش attendance، جيب من student_plan_details
            if ($lessons->isEmpty()) {
                Log::info('📚 [NO ATTENDANCE] جاري جلب من student_plan_details');
                $lessons = DB::table('student_plan_details as spd')
                    ->leftJoin('plans as p', 'spd.plan_id', '=', 'p.id')
                    ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
                    ->where('csb.user_id', $userId)
                    ->select([
                        'spd.id',
                        DB::raw('DATE_FORMAT(spd.created_at, "%Y-%m-%d") as attendance_date'),
                        DB::raw('"لا توجد ملاحظات" as note'),
                        DB::raw('5 as rating'),
                        DB::raw('COALESCE(p.plan_name, "خطة غير محددة") as surah_name'),
                        'spd.new_memorization',
                        'spd.review_memorization'
                    ])
                    ->orderBy('spd.created_at', 'desc')
                    ->limit(10)
                    ->get();
            }

            Log::info(' [SUCCESS]', [
                'user_id' => $userId,
                'lessons_count' => count($lessons),
                'sample_lesson' => $lessons[0] ?? 'لا توجد دروس'
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
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب بيانات التقدم: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     *  حضور وغياب الطالب من student_attendance
     */
    public function getStudentPresence()
    {
        $userId = Auth::id();
        Log::info('📋 [STUDENT PRESENCE] بداية الطلب', ['user_id' => $userId]);

        try {
            //  جيب سجلات الحضور والغياب من student_attendance
            $presenceRecords = DB::table('student_attendance as sa')
                ->join('student_plan_details as spd', 'sa.student_plan_detail_id', '=', 'spd.id')
                ->leftJoin('plans as p', 'spd.plan_id', '=', 'p.id')
                ->join('plan_circle_schedules as pcs', 'sa.plan_circle_schedule_id', '=', 'pcs.id')
                ->leftJoin('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
                ->where('sa.user_id', $userId)
                ->select([
                    'sa.id',
                    DB::raw('DATE_FORMAT(pcs.schedule_date, "%Y-%m-%d") as attendance_date'),
                    DB::raw('COALESCE(p.plan_name, "خطة غير محددة") as surah_name'),
                    'spd.new_memorization',
                    'spd.review_memorization',
                    'sa.status',
                    'sa.note',
                    DB::raw('DATE_FORMAT(sa.created_at, "%Y-%m-%d %H:%i") as recorded_at')
                ])
                ->orderBy('pcs.schedule_date', 'desc')
                ->orderBy('pcs.start_time', 'asc')
                ->limit(10)
                ->get();

            //  لو مفيش سجلات، جيب الحصص المحجوزة
            if ($presenceRecords->isEmpty()) {
                $presenceRecords = DB::table('circle_student_bookings as csb')
                    ->join('plan_circle_schedules as pcs', 'csb.plan_circle_schedule_id', '=', 'pcs.id')
                    ->leftJoin('student_plan_details as spd', 'csb.id', '=', 'spd.circle_student_booking_id')
                    ->leftJoin('plans as p', 'spd.plan_id', '=', 'p.id')
                    ->where('csb.user_id', $userId)
                    ->where('csb.status', 'confirmed')
                    ->select([
                        'pcs.id',
                        DB::raw('DATE_FORMAT(pcs.schedule_date, "%Y-%m-%d") as attendance_date'),
                        DB::raw('COALESCE(p.plan_name, "خطة غير محددة") as surah_name'),
                        'spd.new_memorization',
                        'spd.review_memorization',
                        DB::raw('"لم يتم تسجيل" as status'),
                        DB::raw('NULL as note'),
                        DB::raw('DATE_FORMAT(pcs.schedule_date, "%Y-%m-%d %H:%i") as recorded_at')
                    ])
                    ->orderBy('pcs.schedule_date', 'desc')
                    ->limit(10)
                    ->get();
            }

            //  إحصائيات الحضور
            $totalRecords = count($presenceRecords);
            $presentCount = $presenceRecords->where('status', 'حاضر')->count();
            $absentCount = $totalRecords - $presentCount;
            $attendanceRate = $totalRecords > 0 ? round(($presentCount / $totalRecords) * 100, 1) : 0;

            Log::info(' [PRESENCE SUCCESS]', [
                'user_id' => $userId,
                'total_records' => $totalRecords,
                'present_count' => $presentCount,
                'attendance_rate' => $attendanceRate
            ]);

            return response()->json([
                'success' => true,
                'presence_records' => $presenceRecords,
                'stats' => [
                    'total' => $totalRecords,
                    'present' => $presentCount,
                    'absent' => $absentCount,
                    'attendance_rate' => $attendanceRate
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [STUDENT PRESENCE] خطأ', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب بيانات الحضور والغياب'
            ], 500);
        }
    }

    /**
     *  جلب بيانات المجمع الخاص بالطالب مع الإحصائيات
     */
    public function getUserComplex()
    {
        $userId = Auth::id();
        Log::info('🏛️ [USER COMPLEX] بداية الطلب', ['user_id' => $userId]);

        try {
            //  1. جيب center_id الطالب من users
            $userCenter = DB::table('users')
                ->where('id', $userId)
                ->where('status', 'active')
                ->value('center_id');

            if (!$userCenter) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يوجد مجمع مرتبط بحسابك'
                ]);
            }

            Log::info('🏛️ [CENTER FOUND]', [
                'user_id' => $userId,
                'center_id' => $userCenter
            ]);

            //  2. جيب بيانات المركز
            $center = DB::table('centers')
                ->where('id', $userCenter)
                ->where('is_active', true)
                ->select('id', 'name', 'logo', 'phone', 'address', 'settings')
                ->first();

            if (!$center) {
                return response()->json([
                    'success' => false,
                    'message' => 'المجمع غير مفعل'
                ]);
            }

            //  3. إحصائيات الطلاب (من students → users.center_id)
            $studentsCount = DB::table('students')
                ->join('users', 'students.user_id', '=', 'users.id')
                ->where('users.center_id', $userCenter)
                ->where('users.status', 'active')
                ->count();

            //  4. إحصائيات المعلمين (من teacher_payrolls → users.center_id)
            $teachersCount = DB::table('teacher_payrolls')
                ->join('users', 'teacher_payrolls.user_id', '=', 'users.id')
                ->where('users.center_id', $userCenter)
                ->where('users.status', 'active')
                ->distinct('teacher_payrolls.teacher_id')
                ->count();

            //  5. إحصائيات الحلقات (من circles)
            $circlesCount = DB::table('circles')
                ->where('center_id', $userCenter)
                ->count();

            //  6. إحصائيات الخطط (من plans)
            $plansCount = DB::table('plans')
                ->where('center_id', $userCenter)
                ->count();

            //  7. إحصائيات المساجد (من mosques)
            $mosquesCount = DB::table('mosques')
                ->where('center_id', $userCenter)
                ->where('is_active', true)
                ->count();

            Log::info(' [COMPLEX STATS]', [
                'center_id' => $userCenter,
                'students' => $studentsCount,
                'teachers' => $teachersCount,
                'circles' => $circlesCount,
                'plans' => $plansCount,
                'mosques' => $mosquesCount
            ]);

            return response()->json([
                'success' => true,
                'complex' => [
                    'title' => $center->name,
                    'description' => $center->settings && isset($center->settings['description'])
                        ? $center->settings['description']
                        : 'مجمع قرآني كريم يُعنى بخدمة القرآن وعلومه، يضم برامج تعليمية وإجازات بالسند المتصل.',
                    'img' => $center->logo ?: 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=مجمع+القرآن',
                    'stats' => [
                        ['label' => 'الطلاب', 'value' => (string) $studentsCount, 'icon' => '👥'],
                        ['label' => 'المعلمين', 'value' => (string) $teachersCount, 'icon' => '👨‍🏫'],
                        ['label' => 'الحلقات', 'value' => (string) $circlesCount, 'icon' => '⭕'],
                        ['label' => 'الخطط', 'value' => (string) $plansCount, 'icon' => '📋'],
                        ['label' => 'المساجد', 'value' => (string) $mosquesCount, 'icon' => '🕌']
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ [USER COMPLEX] خطأ', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'خطأ في جلب بيانات المجمع'
            ], 500);
        }
    }
}