<?php

namespace App\Http\Controllers\Student;

use Illuminate\Http\Request;
use App\Models\Plans\PlanDetail;
use App\Models\Auth\Teacher;
use App\Models\Tenant\Circle;
use App\Models\Tenant\Student;
use App\Models\Auth\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\Plans\Plan;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Student\StudentPlanDetail;
use App\Models\Plans\CircleStudentBooking;
use Illuminate\Support\Facades\Auth;

class StudentBookingsController extends Controller
{
    /**
     * 🔥 الحصول على center_id بأمان
     */
    private function getUserCenterId()
    {
        $user = Auth::user();
        if (!$user) {
            throw new \Exception('غير مسجل الدخول', 401);
        }

        if (!$user->center_id) {
            throw new \Exception('لا يوجد مجمع مرتبط بحسابك', 400);
        }

        return $user->center_id;
    }

    public function index(Request $request)
    {
        try {
            $centerId = $this->getUserCenterId();

            $query = CircleStudentBooking::with([
                    'user:id,name,email,phone,center_id',
                    'plan:id,plan_name,total_months,center_id',
                    'plan.center:id,name',
                    'planDetail:id,day_number',
                    'planCircleSchedule:id,circle_id,schedule_date,start_time,end_time,duration_minutes,booked_students,max_students,is_available',
                    'planCircleSchedule.circle:id,name,center_id',
                ])
                // ✅ فلترة أساسية حسب center_id
                ->whereHas('plan', fn($q) => $q->where('center_id', $centerId))
                ->whereHas('planCircleSchedule.circle', fn($q) => $q->where('center_id', $centerId))
                ->where('status', 'pending')
                ->latest('created_at');

            if ($request->filled('search')) {
                $query->where(function ($q) use ($request, $centerId) {
                    $q->whereHas('user', fn($q2) => $q2->where('name', 'like', '%' . $request->search . '%'))
                      ->whereHas('user', fn($q2) => $q2->where('center_id', $centerId))
                      ->orWhereHas('plan', fn($q2) => $q2->where('plan_name', 'like', '%' . $request->search . '%')
                                         ->where('center_id', $centerId));
                });
            }

            $bookings = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'data'          => $bookings->getCollection()->map(fn($b) => $this->formatBooking($b)),
                'current_page'  => $bookings->currentPage(),
                'last_page'     => $bookings->lastPage(),
                'per_page'      => $bookings->perPage(),
                'total'         => $bookings->total(),
                'center_id'     => $centerId,
                'center_filter_active' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Student bookings index error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب الحجوزات: ' . $e->getMessage()
            ], 500);
        }
    }

    public function confirm($bookingId)
    {
        try {
            $centerId = $this->getUserCenterId();

            $booking = CircleStudentBooking::where('id', $bookingId)
                ->where('status', 'pending')
                // ✅ فلترة center_id
                ->whereHas('plan', fn($q) => $q->where('center_id', $centerId))
                ->whereHas('planCircleSchedule.circle', fn($q) => $q->where('center_id', $centerId))
                ->with([
                    'plan:id,center_id',
                    'planDetail:id,plan_id,day_number',
                    'planCircleSchedule:id,circle_id,schedule_date,start_time,end_time,teacher_id,booked_students,max_students',
                    'planCircleSchedule.circle:id,name,center_id'
                ])
                ->first();

            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'الحجز غير موجود أو تمت الموافقة عليه مسبقاً أو لا يخص مجمعك',
                ], 404);
            }

            $schedule = $booking->planCircleSchedule;

            if (!$schedule) {
                return response()->json(['success' => false, 'message' => 'بيانات الحلقة غير موجودة'], 404);
            }

            // ✅ التحقق من center_id للحلقة
            if ($schedule->circle->center_id != $centerId) {
                return response()->json([
                    'success' => false,
                    'message' => 'الحلقة لا تنتمي لمجمعك'
                ], 403);
            }

            if ($schedule->max_students && $schedule->booked_students >= $schedule->max_students) {
                return response()->json(['success' => false, 'message' => 'عدد الطلاب مكتمل في هذه الحلقة'], 400);
            }

            DB::transaction(function () use ($booking, $schedule) {
                $booking->update(['status' => 'confirmed', 'started_at' => now()]);
                $schedule->increment('booked_students');
                $this->createStudentPlanDetails($booking, $schedule);
            });

            return response()->json([
                'success' => true,
                'message' => 'تم قبول الطالب في الخطة بنجاح! 🎉',
            ]);
        } catch (\Exception $e) {
            Log::error('Booking confirm error', [
                'booking_id' => $bookingId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء قبول الطالب: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * تعيين طالب لحلقة من Excel - محسن مع center_id
     */
    public function importAssign(Request $request)
    {
        try {
            $centerId = $this->getUserCenterId();

            $idNumber     = trim($request->input('id_number', ''));
            $circleName   = trim($request->input('circle_name', ''));
            $scheduleDate = trim($request->input('schedule_date', ''));
            $planId       = $request->input('plan_id');

            if (empty($idNumber)) {
                return response()->json(['success' => false, 'message' => 'رقم الهوية مطلوب'], 422);
            }
            if (empty($circleName)) {
                return response()->json(['success' => false, 'message' => 'اسم الحلقة مطلوب'], 422);
            }

            $student = Student::where('id_number', $idNumber)
                ->where('center_id', $centerId) // ✅ فلترة center_id
                ->with('user:id,name,email,center_id')
                ->first();

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => "لم يُعثر على طالب بهوية: {$idNumber} في مجمعك",
                ], 422);
            }

            $circle = Circle::where('center_id', $centerId) // ✅ فلترة center_id
                ->where('name', 'like', "%{$circleName}%")
                ->first();

            if (!$circle) {
                return response()->json([
                    'success' => false,
                    'message' => "لم يُعثر على حلقة باسم: {$circleName} في مجمعك",
                ], 422);
            }

            if ($planId) {
                $plan = Plan::where('id', $planId)
                    ->where('center_id', $centerId) // ✅ فلترة center_id
                    ->first();
            } else {
                $plan = Plan::where('center_id', $centerId) // ✅ فلترة center_id
                    ->where('is_active', true)
                    ->first();
            }

            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'لم يُعثر على خطة نشطة في مجمعك، يرجى إنشاء خطة أولاً',
                ], 422);
            }

            $scheduleQuery = PlanCircleSchedule::where('circle_id', $circle->id)
                ->where('is_available', true)
                ->whereColumn('booked_students', '<', 'max_students');

            if ($scheduleDate) {
                $scheduleQuery->whereDate('schedule_date', $scheduleDate);
            } else {
                $scheduleQuery->whereDate('schedule_date', '>=', now()->toDateString())
                              ->orderBy('schedule_date');
            }

            $schedule = $scheduleQuery->first();

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => "لا يوجد موعد متاح في حلقة: {$circleName} " .
                        ($scheduleDate ? "بتاريخ: {$scheduleDate}" : "في أي موعد قادم"),
                ], 422);
            }

            $existingBooking = CircleStudentBooking::where('user_id', $student->user_id)
                ->where('plan_circle_schedule_id', $schedule->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->first();

            if ($existingBooking) {
                return response()->json([
                    'success' => false,
                    'message' => 'الطالب محجوز مسبقاً في هذه الحلقة',
                ], 422);
            }

            $planDetail = PlanDetail::where('plan_id', $plan->id)
                ->orderBy('day_number')
                ->first();

            if (!$planDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'الخطة لا تحتوي على تفاصيل أيام، يرجى إعداد الخطة أولاً',
                ], 422);
            }

            DB::transaction(function () use ($student, $plan, $planDetail, $schedule, $circle) {
                $booking = CircleStudentBooking::create([
                    'user_id'                   => $student->user_id,
                    'plan_id'                   => $plan->id,
                    'plan_detail_id'            => $planDetail->id,
                    'plan_circle_schedule_id'   => $schedule->id,
                    'status'                    => 'confirmed',
                    'started_at'                => now(),
                ]);

                $schedule->increment('booked_students');
                $this->createStudentPlanDetails($booking, $schedule);
            });

            return response()->json([
                'success' => true,
                'message' => "تم تعيين الطالب في حلقة: {$circle->name} بنجاح",
            ], 201);
        } catch (\Exception $e) {
            Log::error('importAssign error', [
                'id_number' => $request->input('id_number'),
                'circle_name' => $request->input('circle_name'),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'خطأ أثناء التعيين: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function createStudentPlanDetails(CircleStudentBooking $booking, PlanCircleSchedule $schedule): void
    {
        try {
            $centerId = $this->getUserCenterId();

            $planDetails = PlanDetail::where('plan_id', $booking->plan_id)
                ->orderBy('day_number')
                ->get();

            $realTeacher = Teacher::where('user_id', $schedule->teacher_id)->first();

            if (!$realTeacher) {
                Log::error('Real teacher not found', [
                    'user_id' => $schedule->teacher_id,
                    'schedule_id' => $schedule->id,
                    'center_id' => $centerId
                ]);
                throw new \Exception("المعلم غير موجود في جدول teachers لـ user_id: {$schedule->teacher_id}");
            }

            foreach ($planDetails as $detail) {
                StudentPlanDetail::create([
                    'circle_student_booking_id' => $booking->id,
                    'plan_id'                   => $booking->plan_id,
                    'teacher_id'                => $realTeacher->id,
                    'circle_id'                 => $schedule->circle_id,
                    'plan_circle_schedule_id'   => $schedule->id,
                    'day_number'                => $detail->day_number,
                    'new_memorization'          => $detail->new_memorization,
                    'review_memorization'       => $detail->review_memorization,
                    'session_time'              => $schedule->start_time,
                    'status'                    => 'قيد الانتظار',
                ]);
            }

            Log::info('Student plan details created', [
                'booking_id' => $booking->id,
                'teacher_id_used' => $realTeacher->id,
                'center_id' => $centerId,
                'days_count' => $planDetails->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('createStudentPlanDetails error', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function formatBooking($booking): array
    {
        $schedule = $booking->planCircleSchedule;
        $capacityStatus = $schedule && $schedule->max_students
            ? "{$schedule->booked_students}/{$schedule->max_students}"
            : 'غير محدود';

        return [
            'id'               => $booking->id,
            'student_name'     => $booking->user?->name ?? 'غير معروف',
            'student_phone'    => $booking->user?->phone ?? 'غير محدد',
            'student_email'    => $booking->user?->email ?? 'غير محدد',
            'plan_name'        => $booking->plan?->plan_name ?? 'غير محدد',
            'plan_months'      => $booking->plan?->total_months ?? 0,
            'center_name'      => $booking->plan?->center?->name ?? 'غير محدد',
            'day_number'       => $booking->planDetail?->day_number ?? 'غير محدد',
            'circle_name'      => $schedule?->circle?->name ?? 'غير محدد',
            'teacher_name'     => $schedule?->teacher?->name ?? 'غير محدد',
            'schedule_date'    => $schedule?->schedule_date?->format('Y-m-d') ?? 'غير محدد',
            'time_range'       => $schedule ? ($schedule->start_time . ' - ' . $schedule->end_time) : 'غير محدد',
            'duration_minutes' => $schedule?->duration_minutes ?? 60,
            'booked_at'        => $booking->created_at?->format('Y-m-d H:i') ?? 'الآن',
            'capacity_status'  => $capacityStatus,
            'can_confirm'      => !$schedule || !$schedule->max_students || $schedule->booked_students < $schedule->max_students,
            'remaining_slots'  => $schedule && $schedule->max_students
                ? ($schedule->max_students - $schedule->booked_students)
                : null,
        ];
    }
}
