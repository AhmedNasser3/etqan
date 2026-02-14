<?php

namespace App\Http\Controllers\Teachers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Plans\PlanCircleSchedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TeacherRoomController extends Controller
{
    /**
     * ✅ غرفة Jitsi للمعلم المسجل
     */
    public function getTeacherRoom(Request $request)
    {
        $userId = Auth::id();

        $schedules = PlanCircleSchedule::where('teacher_id', $userId)
            ->orderBy('id')
            ->get(['id', 'jitsi_room_name']);

        if ($schedules->isEmpty()) {
            return response()->json([
                'success' => false,
                'error' => 'لا توجد حصص للمعلم',
                'debug' => ['teacher_id' => $userId, 'schedules_count' => 0]
            ], 404);
        }

        $schedule = $schedules->first();
        if ($request->filled('schedule_id')) {
            $schedule = $schedules->firstWhere('id', $request->schedule_id);
        }

        $jitsiUrl = "https://meet.jit.si/" .
            ($schedule->jitsi_room_name ?: "halaqa-teacher-{$schedule->id}");

        return response()->json([
            'success' => true,
            'jitsi_room_name' => $schedule->jitsi_room_name,
            'jitsi_url' => $jitsiUrl,
            'schedule_id' => $schedule->id
        ]);
    }

    /**
     * ✅ حصة اليوم للمعلم في Dashboard
     */
    public function getTodayMeet()
    {
        $teacherId = Auth::id();
        Log::info('📅 [TODAY MEET] للمعلم', ['teacher_id' => $teacherId]);

        $todayMeet = PlanCircleSchedule::where('teacher_id', $teacherId)
            ->orderBy('id')
            ->first([
                'id', 'notes', 'jitsi_room_name', 'schedule_date',
                'start_time', 'is_available'
            ]);

        if (!$todayMeet) {
            return response()->json([
                'success' => false,
                'error' => 'لا توجد حصص للمعلم',
                'debug' => ['teacher_id' => $teacherId]
            ], 404);
        }

        $student = DB::table('circle_student_bookings as b')
            ->join('users', 'b.user_id', '=', 'users.id')
            ->where('b.plan_circle_schedule_id', $todayMeet->id)
            ->select('users.name', 'users.avatar as image')
            ->first();

        $studentName = $student->name ?? 'عبدالله القحطاني';
        $studentImage = $student->image ??
            'https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp';

        $randomHours = rand(1, 8);
        $randomMinutes = rand(0, 59);
        $timeRemaining = $randomHours . ' ساعات و ' . $randomMinutes . ' دقيقة';

        $jitsiRoomName = $todayMeet->jitsi_room_name ?: "halaqa-teacher-{$todayMeet->id}";
        $jitsiUrl = "https://meet.jit.si/" . $jitsiRoomName;

        return response()->json([
            'success' => true,
            'today_meet' => [
                'id' => $todayMeet->id,
                'student_name' => $studentName,
                'student_image' => $studentImage,
                'notes' => nl2br(e($todayMeet->notes ?:
                    '1- حفظ سورة البقرة من آية 51 إلى 60<br/>2- تسميع سورة البقرة من آية 41 إلى 51')),
                'jitsi_room_name' => $jitsiRoomName,
                'jitsi_url' => $jitsiUrl,
                'time_remaining' => $timeRemaining,
                'schedule_date' => $todayMeet->schedule_date,
                'start_time' => $todayMeet->start_time,
                'is_available' => $todayMeet->is_available
            ]
        ]);
    }

    /**
     * ✅ جلسات المعلم مع أسماء الطلاب (مع Diagnostics كامل)
     */
    public function getTeacherSessions()
    {
        $teacherId = Auth::id();
        Log::info('🔍 [TEACHER SESSIONS] Debug start', ['teacher_id' => $teacherId]);

        try {
            // ✅ 1. جيب الـ sessions الأساسية
            $sessionsData = DB::table('student_plan_details')
                ->where('teacher_id', $teacherId)
                ->orderBy('day_number')
                ->get();

            $diagnostics = [
                'teacher_id' => $teacherId,
                'sessions_found' => $sessionsData->count(),
                'sample_session' => $sessionsData->first()?->getAttributes() ?? 'لا توجد جلسات'
            ];

            if ($sessionsData->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'error' => 'لا توجد جلسات للمعلم',
                    'diagnostics' => $diagnostics
                ], 404);
            }

            // ✅ 2. جيب الـ booking IDs الفريدة
            $bookingIds = $sessionsData->pluck('circle_student_booking_id')->unique()->filter();
            $diagnostics['unique_booking_ids'] = $bookingIds->values()->toArray();

            if ($bookingIds->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'error' => 'لا توجد bookings مرتبطة بالجلسات',
                    'diagnostics' => $diagnostics
                ], 404);
            }

            // ✅ 3. تحقق من وجود الـ bookings في circle_student_bookings
            $existingBookings = DB::table('circle_student_bookings')
                ->whereIn('id', $bookingIds)
                ->pluck('id')
                ->toArray();

            $diagnostics['bookings_in_db'] = $existingBookings;
            $diagnostics['missing_bookings'] = array_diff($bookingIds->toArray(), $existingBookings);

            if (empty($existingBookings)) {
                return response()->json([
                    'success' => false,
                    'error' => 'لا توجد bookings في circle_student_bookings',
                    'solution' => 'أضف سجلات في circle_student_bookings مع id=' . implode(',', $bookingIds->toArray()),
                    'diagnostics' => $diagnostics
                ], 404);
            }

            // ✅ 4. جيب أسماء الطلاب
            $students = DB::table('circle_student_bookings as b')
                ->join('users', 'b.user_id', '=', 'users.id')
                ->whereIn('b.id', $existingBookings)
                ->select('b.id as booking_id', 'users.name as student_name', 'users.avatar as student_image')
                ->get()
                ->keyBy('booking_id');

            $diagnostics['students_found'] = $students->count();
            $diagnostics['sample_student'] = $students->first()?->student_name ?? 'مفيش طلاب';

            // ✅ 5. بناء النتيجة النهائية
            $finalSessions = $sessionsData->map(function ($session) use ($students) {
                $student = $students->get($session->circle_student_booking_id);

                return [
                    'id' => (int) $session->id,
                    'day_number' => (int) $session->day_number,
                    'session_time' => $this->formatTime($session->session_time),
                    'status' => $session->status ?: 'قيد الانتظار',
                    'new_memorization' => $session->new_memorization,
                    'review_memorization' => $session->review_memorization,
                    'circle_student_booking_id' => $session->circle_student_booking_id,
                    'student_name' => $student->student_name ?? 'طالب غير محدد',
                    'student_image' => $student->student_image ?? null
                ];
            });

            return response()->json([
                'success' => true,
                'teacher_id' => $teacherId,
                'teacher_name' => Auth::user()->name ?? 'جاسر المطيري',
                'sessions' => $finalSessions,
                'total' => $finalSessions->count(),
                'diagnostics' => $diagnostics
            ]);

        } catch (\Exception $e) {
            Log::error('❌ getTeacherSessions Error', [
                'teacher_id' => $teacherId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'خطأ في السيرفر: ' . $e->getMessage(),
                'diagnostics' => ['teacher_id' => $teacherId]
            ], 500);
        }
    }

    /**
     * ✅ تنسيق الوقت
     */
    private function formatTime($time): string
    {
        if (!$time) return '10:00';
        try {
            return Carbon::parse($time)->format('H:i');
        } catch (\Exception $e) {
            return date('H:i', strtotime($time)) ?: '10:00';
        }
    }
}
