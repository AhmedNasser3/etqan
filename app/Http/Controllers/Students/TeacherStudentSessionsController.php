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
     * ✅ جلب الجلسة الحالية للمعلم
     */
    public function getTeacherStudentSessions(Request $request)
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
                'success' => true,
                'message' => 'لست مسجل كمعلم',
                'teacher_id' => null,
                'session' => null,
                'total' => 0
            ]);
        }

        $teacherId = $teacher->id;

        $lastCompletedSession = StudentPlanDetail::where('teacher_id', $teacherId)
            ->where('status', 'مكتمل')
            ->orderBy('day_number', 'desc')
            ->orderBy('session_time', 'desc')
            ->first();

        $lastDayNumber = $lastCompletedSession ? $lastCompletedSession->day_number : 0;

        $nextPendingSession = StudentPlanDetail::where('teacher_id', $teacherId)
            ->where('status', 'قيد الانتظار')
            ->where('day_number', '>', $lastDayNumber)
            ->orderBy('day_number', 'asc')
            ->orderBy('session_time', 'asc')
            ->first();

        if (!$nextPendingSession) {
            $nextPendingSession = StudentPlanDetail::where('teacher_id', $teacherId)
                ->where('status', 'قيد الانتظار')
                ->orderBy('day_number', 'asc')
                ->orderBy('session_time', 'asc')
                ->first();
        }

        $session = null;
        if ($nextPendingSession) {
            $student = DB::table('circle_student_bookings as b')
                ->join('users', 'b.user_id', '=', 'users.id')
                ->where('b.id', $nextPendingSession->circle_student_booking_id)
                ->select('b.id as booking_id', 'users.id as user_id', 'users.name as student_name', 'users.avatar as student_image')
                ->first();

            $attendance = StudentAttendance::where('student_plan_detail_id', $nextPendingSession->id)->first();

            $session = [
                'id' => $nextPendingSession->id,
                'day_number' => $nextPendingSession->day_number,
                'session_time' => $nextPendingSession->session_time,
                'status' => $nextPendingSession->status,
                'new_memorization' => $nextPendingSession->new_memorization ?? null,
                'review_memorization' => $nextPendingSession->review_memorization ?? null,
                'circle_student_booking_id' => $nextPendingSession->circle_student_booking_id,
                'plan_id' => $nextPendingSession->plan_id,
                'circle_id' => $nextPendingSession->circle_id,
                'plan_circle_schedule_id' => $nextPendingSession->plan_circle_schedule_id,
                'student_name' => $student->student_name ?? 'طالب غير محدد',
                'student_id' => $student->user_id ?? null,
                'student_image' => $student->student_image ?? null,
                'attendance_status' => $attendance ? $attendance->status : null,
                'attendance_note' => $attendance ? $attendance->note : null,
                'attendance_rating' => $attendance ? $attendance->rating : 0,
            ];
        }

        return response()->json([
            'success' => true,
            'user_id' => $user->id,
            'teacher_id' => $teacherId,
            'teacher_name' => $user->name,
            'teacher_role' => $teacher->role ?? null,
            'session' => $session,
            'total' => $session ? 1 : 0
        ]);
    }

    /**
     * ✅ تعديل حالة الجلسة + الحضور والغياب
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
            'status' => ['required', Rule::in(['مكتمل', 'قيد الانتظار', 'إعادة'])],
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

        DB::beginTransaction();

        try {
            // ✅ 1. تحديث حالة الجلسة
            $session->update([
                'status' => $sessionStatus
            ]);

            // ✅ 2. جيب بيانات الطالب
            $studentBooking = DB::table('circle_student_bookings')
                ->where('id', $session->circle_student_booking_id)
                ->first();

            if (!$studentBooking) {
                throw new \Exception('حجز الطالب غير موجود');
            }

            // ✅ 3. تحقق لو الطالب + student_plan_detail_id موجودين قبل كده
            $existingAttendance = StudentAttendance::where('user_id', $studentBooking->user_id)
                ->where('student_plan_detail_id', $session->id)
                ->first();

            if ($existingAttendance) {
                // ✅ موجود = UPDATE
                $existingAttendance->update([
                    'status' => $attendanceStatus,
                    'note' => $note,
                    'rating' => $rating
                ]);
                $attendanceMessage = 'تم تعديل سجل الحضور';
                $attendanceAction = 'updated';
            } else {
                // ✅ مش موجود = CREATE جديد
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
                'new_status' => $sessionStatus,
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
     * ✅ جلب سجل الحضور للجلسة الحالية
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