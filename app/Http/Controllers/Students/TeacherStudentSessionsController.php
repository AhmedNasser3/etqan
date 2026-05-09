<?php

namespace App\Http\Controllers\Students;

use App\Http\Controllers\Controller;
use App\Models\Auth\Teacher;
use App\Models\Student\StudentPlanDetail;
use App\Models\Students\StudentAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TeacherStudentSessionsController extends Controller
{
    /**
     * جلب الجلسة الحالية للمعلم
     */
/**
 * جلب الجلسة الحالية للمعلم
 */
public function getTeacherStudentSessions(Request $request)
{
    $user = Auth::user();
    if (!$user) {
        return response()->json(['success' => false, 'message' => 'تحتاج تسجيل دخول'], 401);
    }

    $teacher = Teacher::where('user_id', $user->id)->first();
    if (!$teacher) {
        return response()->json(['success' => true, 'sessions' => [], 'total' => 0]);
    }

    $teacherId = $teacher->id;

    // ✅ جيب كل booking_ids الخاصة بالمعلم
    $bookingIds = StudentPlanDetail::where('teacher_id', $teacherId)
        ->distinct()
        ->pluck('circle_student_booking_id');

    $sessions = collect();

    foreach ($bookingIds as $bookingId) {
        // ✅ لكل طالب — جيب أقرب حصة لسه مش مكتملة
        $nextSession = StudentPlanDetail::where('teacher_id', $teacherId)
            ->where('circle_student_booking_id', $bookingId)
            ->whereIn('status', ['قيد الانتظار', 'إعادة'])
            ->orderByRaw("FIELD(status, 'إعادة', 'قيد الانتظار')") // إعادة أولوية أعلى
            ->orderBy('day_number', 'asc')
            ->first();

        // الطالب خلص كل حصصه — تجاهله
        if (!$nextSession) continue;

        $student = DB::table('circle_student_bookings as b')
            ->join('users', 'b.user_id', '=', 'users.id')
            ->where('b.id', $bookingId)
            ->select('users.id as user_id', 'users.name as student_name', 'users.avatar as student_image')
            ->first();

        $attendance = \App\Models\Students\StudentAttendance::where('student_plan_detail_id', $nextSession->id)->first();

        $sessions->push([
            'id'                        => $nextSession->id,
            'day_number'                => $nextSession->day_number,
            'session_time'              => $nextSession->session_time,
            'status'                    => $nextSession->status,
            'new_memorization'          => $nextSession->new_memorization,
            'review_memorization'       => $nextSession->review_memorization,
            'circle_student_booking_id' => $bookingId,
            'plan_id'                   => $nextSession->plan_id,
            'circle_id'                 => $nextSession->circle_id,
            'plan_circle_schedule_id'   => $nextSession->plan_circle_schedule_id,
            'student_name'              => $student->student_name ?? 'طالب غير محدد',
            'student_id'                => $student->user_id ?? null,
            'student_image'             => $student->student_image ?? null,
            'attendance_status'         => $attendance?->status,
            'attendance_note'           => $attendance?->note,
            'attendance_rating'         => $attendance?->rating ?? 0,
        ]);
    }

    // ✅ ترتيب — إعادة أولاً ثم قيد الانتظار
    $sorted = $sessions->sortByDesc(fn($s) => $s['status'] === 'إعادة')->values();

    return response()->json([
        'success'      => true,
        'teacher_id'   => $teacherId,
        'teacher_name' => $user->name,
        'sessions'     => $sorted,
        'total'        => $sorted->count()
    ]);
}


    /**
     * تعديل حالة الجلسة + الحضور والغياب
     */
    public function updateSessionStatus(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'تحتاج تسجيل دخول'
            ], 401);
        }

        $teacher = Teacher::where('user_id', $user->id)->first();
        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'لست مسجل كمعلم'
            ], 403);
        }

        $request->validate([
            'session_id' => 'required|exists:student_plan_details,id',
            'status' => ['required', Rule::in(['مكتمل', 'غائب', 'قيد الانتظار', 'إعادة'])], //  أضفت "غائب"
            'attendance_status' => ['required', Rule::in(['حاضر', 'غائب'])],
            'note' => 'nullable|string|max:500',
            'rating' => 'nullable|integer|min:0|max:5'
        ]);

        $sessionId = $request->session_id;
        $sessionStatus = $request->status;
        $attendanceStatus = $request->attendance_status;
        $note = $request->note;
        $rating = $request->rating ?? 0;

        $session = StudentPlanDetail::where('id', $sessionId)
            ->where('teacher_id', $teacher->id)
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'الجلسة غير موجودة أو لا تخصك'
            ], 404);
        }

        //  منطق ذكي للـ status بناءً على الـ attendance_status
        $finalSessionStatus = $this->determineSessionStatus($sessionStatus, $attendanceStatus);

        DB::beginTransaction();

        try {
            // 1. تحديث حالة الجلسة بالـ status النهائي
            $session->update([
                'status' => $finalSessionStatus
            ]);

            // 2. جيب بيانات الطالب
            $studentBooking = DB::table('circle_student_bookings')
                ->where('id', $session->circle_student_booking_id)
                ->first();

            if (!$studentBooking) {
                throw new \Exception('حجز الطالب غير موجود');
            }

            // 3. تحقق لو الطالب + student_plan_detail_id موجودين قبل كده
            $existingAttendance = StudentAttendance::where('user_id', $studentBooking->user_id)
                ->where('student_plan_detail_id', $session->id)
                ->first();

            if ($existingAttendance) {
                // موجود = UPDATE
                $existingAttendance->update([
                    'status' => $attendanceStatus,
                    'note' => $note,
                    'rating' => $rating
                ]);
                $attendanceMessage = 'تم تعديل سجل الحضور';
                $attendanceAction = 'updated';
            } else {
                // مش موجود = CREATE جديد
                StudentAttendance::create([
                    'user_id' => $studentBooking->user_id,
                    'plan_circle_schedule_id' => $session->plan_circle_schedule_id,
                    'student_plan_detail_id' => $session->id,
                    'status' => $attendanceStatus,
                    'note' => $note,
                    'rating' => $rating
                ]);
                $attendanceMessage = 'تم إنشاء سجل حضور جديد';
                $attendanceAction = 'created';
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "تم تحديث الجلسة بنجاح، {$attendanceMessage}",
                'session_id' => $sessionId,
                'new_status' => $finalSessionStatus,
                'attendance_status' => $attendanceStatus,
                'attendance_action' => $attendanceAction
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     *  دالة ذكية لتحديد الـ status النهائي بناءً على المدخلات
     */
    private function determineSessionStatus($requestedStatus, $attendanceStatus)
    {
        // إذا كان الـ attendance_status = غائب، خلي الـ status = غائب
        if ($attendanceStatus === 'غائب') {
            return 'غائب';
        }

        // إذا كان الـ requested status = مكتمل أو قيد الانتظار أو إعادة، استخدمه
        if (in_array($requestedStatus, ['مكتمل', 'قيد الانتظار', 'إعادة'])) {
            return $requestedStatus;
        }

        // الافتراضي = مكتمل للحاضر
        return 'مكتمل';
    }

    /**
     * جلب سجل الحضور للجلسة الحالية
     */
    public function getSessionAttendance(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'تحتاج تسجيل دخول'
            ], 401);
        }

        $teacher = Teacher::where('user_id', $user->id)->first();
        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'لست مسجل كمعلم'
            ], 403);
        }

        $request->validate([
            'session_id' => 'required|exists:student_plan_details,id'
        ]);

        $session = StudentPlanDetail::where('id', $request->session_id)
            ->where('teacher_id', $teacher->id)
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'الجلسة غير موجودة'
            ], 404);
        }

        $attendance = StudentAttendance::where('student_plan_detail_id', $session->id)
            ->with('student:id,name,avatar')
            ->first();

        return response()->json([
            'success' => true,
            'attendance' => $attendance ? [
                'id' => $attendance->id,
                'status' => $attendance->status,
                'note' => $attendance->note,
                'rating' => $attendance->rating,
                'created_at' => $attendance->created_at->format('Y-m-d H:i'),
                'updated_at' => $attendance->updated_at->format('Y-m-d H:i'),
                'student' => $attendance->student
            ] : null
        ]);
    }
}
