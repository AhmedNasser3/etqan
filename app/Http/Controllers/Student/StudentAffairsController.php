<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use App\Models\Plans\CircleStudentBooking;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Student\StudentAchievement;
use App\Models\Student\StudentPlanDetail;
use App\Models\Students\StudentAttendance;
use App\Models\Tenant\Student;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class StudentAffairsController extends Controller
{
    public function resolveCenterId(Request $request): ?int
    {
        if (Auth::check() && Auth::user()->center_id) {
            return (int) Auth::user()->center_id;
        }
        $id = $request->header('X-Center-Id') ?? $request->query('center_id');
        return ($id && is_numeric($id)) ? (int) $id : null;
    }

    public function index(Request $request)
    {
        $centerId = $this->resolveCenterId($request);
        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $query = Student::whereHas('user', fn($q) => $q->where('center_id', $centerId));

        $mosqueId = $request->header('X-Mosque-Id') ?? $request->query('mosque_id');
        if ($mosqueId && is_numeric($mosqueId)) {
            $query->whereHas('circle', fn($q) => $q->where('mosque_id', (int)$mosqueId));
        }

        if ($request->grade && $request->grade !== 'الكل') {
            $query->where('grade_level', $request->grade);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('id_number', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($q2) =>
                      $q2->where('name', 'like', "%{$request->search}%")
                         ->orWhere('phone', 'like', "%{$request->search}%")
                  );
            });
        }

        $query->with(['user:id,name,email,phone,birth_date,avatar', 'guardian:id,name,phone']);
        $students = $query->orderBy('id_number', 'asc')->paginate(15);

        $mappedData = $students->getCollection()->map(function ($student) use ($centerId) {
            return [
                'id'                       => $student->id,
                'name'                     => $student->user->name ?? 'غير محدد',
                'idNumber'                 => $student->id_number,
                'age'                      => $student->user->birth_date
                    ? $this->calculateAge($student->user->birth_date) . ' سنوات'
                    : 'غير محدد',
                'grade'                    => $student->grade_level ?? 'غير محدد',
                'circle'                   => $student->circle ?? 'غير محدد',
                'guardianName'             => $student->guardian->name ?? 'غير محدد',
                'guardianPhone'            => $student->guardian->phone ?? $student->user->phone ?? 'غير محدد',
                'attendanceRate'           => $this->getAttendanceRate($student->id, $centerId),
                'balance'                  => $this->getBalance($student->id),
                'status'                   => $student->status ?? 'نشط',
                'img'                      => $student->user->avatar ?? '',
                'guardian_phone_formatted' => $this->formatPhone($student->guardian->phone ?? $student->user->phone ?? ''),
            ];
        });

        return response()->json([
            'data'         => $mappedData,
            'current_page' => $students->currentPage(),
            'last_page'    => $students->lastPage(),
            'per_page'     => $students->perPage(),
            'total'        => $students->total(),
            'stats'        => $this->getStats($centerId),
            'grades'       => Student::distinct()->pluck('grade_level')->filter(),
        ]);
    }

    public function show($id)
    {
        try {
            $centerId = $this->resolveCenterId(request());

            $student = Student::whereHas('user', fn($q) => $q->where('center_id', $centerId))
                ->with([
                    'user:id,name,email,phone,birth_date,avatar',
                    'guardian:id,name,phone,email',
                ])
                ->find($id);

            if (!$student) {
                return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
            }

            // جلب بيانات الحجز والخطة
            $booking = CircleStudentBooking::where('user_id', $student->user_id)
                ->with([
                    'plan:id,plan_name,total_months',
                    'planCircleSchedule:id,plan_id,circle_id,teacher_id,schedule_date,start_time,end_time,jitsi_room_name',
                    'planCircleSchedule.circle:id,name,mosque_id',
                    'planCircleSchedule.circle.mosque:id,name',
                    'planCircleSchedule.teacher:id,name',
                ])
                ->latest()
                ->first();

            // إحصائيات الحضور
            $attendanceStats = $this->getStudentAttendanceStats($student->user_id);

            // إحصائيات الإنجازات والنقاط
            $achievementStats = $this->getStudentAchievements($student->user_id);

            // تفاصيل الخطة (الأيام المكتملة)
            $planProgress = null;
            if ($booking) {
                $planProgress = StudentPlanDetail::where('circle_student_booking_id', $booking->id)
                    ->orderBy('day_number')
                    ->get(['id', 'day_number', 'plan_day_number', 'new_memorization', 'review_memorization', 'status', 'session_time'])
                    ->toArray();
            }

            // رابط Jitsi
            $jitsiUrl = null;
            if ($booking?->planCircleSchedule?->jitsi_room_name) {
                $roomName = $booking->planCircleSchedule->jitsi_room_name;
                $jitsiUrl = "https://meet.jit.si/{$roomName}";
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id'             => $student->id,
                    'id_number'      => $student->id_number ?? '',
                    'grade_level'    => $student->grade_level ?? '',
                    'health_status'  => $student->health_status ?? '',
                    'reading_level'  => $student->reading_level ?? '',
                    'session_time'   => $student->session_time ?? '',
                    'notes'          => $student->notes ?? '',
                    'status'         => $student->status ?? 'نشط',
                    'name'           => $student->user->name ?? '',
                    'email'          => $student->user->email ?? '',
                    'phone'          => $student->user->phone ?? '',
                    'birth_date'     => $student->user->birth_date ?? '',
                    'avatar'         => $student->user->avatar ?? '',
                    'guardian_name'  => $student->guardian->name ?? '',
                    'guardian_phone' => $student->guardian->phone ?? '',
                    'guardian_email' => $student->guardian->email ?? '',

                    // بيانات الخطة والحلقة
                    'booking' => $booking ? [
                        'id'              => $booking->id,
                        'status'          => $booking->status,
                        'progress_status' => $booking->progress_status,
                        'start_mode'      => $booking->start_mode,
                        'current_day'     => $booking->current_day,
                        'completed_days'  => $booking->completed_days,
                        'total_days'      => $booking->total_days,
                        'started_at'      => $booking->started_at,
                        'plan_name'       => $booking->plan->plan_name ?? '',
                        'total_months'    => $booking->plan->total_months ?? 0,
                        'circle_name'     => $booking->planCircleSchedule->circle->name ?? '',
                        'mosque_name'     => $booking->planCircleSchedule->circle->mosque->name ?? '',
                        'teacher_name'    => $booking->planCircleSchedule->teacher->name ?? '',
                        'schedule_time'   => $booking->planCircleSchedule
                            ? date('g:i A', strtotime($booking->planCircleSchedule->start_time))
                              . ' - '
                              . date('g:i A', strtotime($booking->planCircleSchedule->end_time))
                            : '',
                        'jitsi_url'       => $jitsiUrl,
                        'jitsi_room'      => $booking->planCircleSchedule->jitsi_room_name ?? '',
                    ] : null,

                    // إحصائيات الحضور
                    'attendance' => $attendanceStats,

                    // الإنجازات والنقاط
                    'achievements' => $achievementStats,

                    // تفاصيل الخطة
                    'plan_progress' => $planProgress,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('خطأ في جلب بيانات الطالب: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'خطأ في جلب البيانات'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $centerId = $this->resolveCenterId($request);

        $request->validate([
            'id_number'     => 'required|string|max:20',
            'grade_level'   => 'required|string|max:50',
            'circle'        => 'nullable|string|max:100',
            'status'        => ['nullable', Rule::in(['نشط', 'معلق', 'موقوف'])],
            'health_status' => 'nullable|string|max:50',
            'reading_level' => 'nullable|string|max:50',
            'session_time'  => 'nullable|string|max:50',
            'notes'         => 'nullable|string',
        ]);

        $student = Student::whereHas('user', fn($q) => $q->where('center_id', $centerId))
            ->findOrFail($id);

        $updateData = $request->only([
            'id_number', 'grade_level', 'circle',
            'health_status', 'reading_level', 'session_time', 'notes',
        ]);
        if ($request->status) $updateData['status'] = $request->status;

        $student->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الطالب بنجاح',
            'student' => $student->fresh(['user', 'guardian']),
        ]);
    }

    public function whatsappReminder($id)
    {
        $centerId = $this->resolveCenterId(request());
        $student = Student::whereHas('user', fn($q) => $q->where('center_id', $centerId))
            ->with(['user', 'guardian'])->findOrFail($id);

        $phone       = $student->guardian->phone ?? $student->user->phone ?? '';
        $studentName = $student->user->name ?? '';
        $balance     = $this->getBalance($student->id);

        $url = "https://wa.me/{$this->formatPhone($phone)}?text=" .
            urlencode("مرحباً، طالبك {$studentName} لديه رصيد مستحق: {$balance}. يرجى التفضل بالتسديد");

        return response()->json(['success' => true, 'whatsapp_url' => $url]);
    }

    public function printCard($id)
    {
        $centerId = $this->resolveCenterId(request());
        $student  = Student::whereHas('user', fn($q) => $q->where('center_id', $centerId))
            ->with(['user', 'guardian'])->findOrFail($id);

        $pdf      = Pdf::loadView('pdf.student-card', compact('student'));
        $filename = 'بطاقة_الطالب_' . ($student->user->name ?? '') . '.pdf';
        return $pdf->download($filename);
    }

    public function getJitsiRoom($id)
    {
        $centerId = $this->resolveCenterId(request());
        $student  = Student::whereHas('user', fn($q) => $q->where('center_id', $centerId))
            ->findOrFail($id);

        $booking = CircleStudentBooking::where('user_id', $student->user_id)
            ->with(['planCircleSchedule:id,jitsi_room_name,start_time,end_time'])
            ->latest()->first();

        if (!$booking?->planCircleSchedule?->jitsi_room_name) {
            return response()->json(['success' => false, 'message' => 'لا توجد غرفة Jitsi لهذا الطالب'], 404);
        }

        $roomName = $booking->planCircleSchedule->jitsi_room_name;

        return response()->json([
            'success'    => true,
            'room_name'  => $roomName,
            'jitsi_url'  => "https://meet.jit.si/{$roomName}",
            'start_time' => $booking->planCircleSchedule->start_time,
            'end_time'   => $booking->planCircleSchedule->end_time,
        ]);
    }

    // ── Private Helpers ──────────────────────────────────────────────────

    private function getStudentAttendanceStats($userId): array
    {
        $total    = StudentAttendance::where('user_id', $userId)->count();
        $present  = StudentAttendance::where('user_id', $userId)->where('status', 'حاضر')->count();
        $absent   = StudentAttendance::where('user_id', $userId)->where('status', 'غائب')->count();
        $avgRating = StudentAttendance::where('user_id', $userId)->where('rating', '>', 0)->avg('rating');

        return [
            'total'       => $total,
            'present'     => $present,
            'absent'      => $absent,
            'rate'        => $total > 0 ? round(($present / $total) * 100, 1) : 0,
            'avg_rating'  => round($avgRating ?? 0, 1),
        ];
    }

    private function getStudentAchievements($userId): array
    {
        $totalPoints = StudentAchievement::where('user_id', $userId)
            ->where('points_action', 'added')->sum('points');
        $deducted = StudentAchievement::where('user_id', $userId)
            ->where('points_action', 'deducted')->sum('points');
        $latest = StudentAchievement::where('user_id', $userId)
            ->latest()->take(5)->get(['points', 'points_action', 'reason', 'achievement_type', 'created_at']);

        return [
            'total_points'    => $totalPoints - $deducted,
            'added_points'    => $totalPoints,
            'deducted_points' => $deducted,
            'history'         => $latest,
        ];
    }

    private function getBalance($studentId): string { return '0 ر.س'; }

    private function getAttendanceRate($studentId, $centerId): string
    {
        $total   = StudentAttendance::whereHas('studentPlanDetail.circleStudentBooking', fn($q) => $q->where('user_id', $studentId))->count();
        $present = StudentAttendance::whereHas('studentPlanDetail.circleStudentBooking', fn($q) => $q->where('user_id', $studentId))->where('status', 'حاضر')->count();
        return $total > 0 ? round(($present / $total) * 100) . '%' : '0%';
    }

    private function formatPhone($phone): string { return preg_replace('/[^0-9]/', '', $phone); }

    private function getStats($centerId): array
    {
        $total = Student::whereHas('user', fn($q) => $q->where('center_id', $centerId))->count();
        return [
            'totalStudents'   => $total,
            'activeStudents'  => $total,
            'pendingStudents' => 0,
            'totalBalance'    => 0,
            'paymentRate'     => $total ? 95 : 0,
        ];
    }

    private function calculateAge($birthDate): int { return now()->diffInYears($birthDate); }
}