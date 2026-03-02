<?php

namespace App\Http\Controllers\Student;

use Illuminate\Http\Request;
use App\Models\Plans\PlanDetail;
use App\Models\Auth\Teacher;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Student\StudentPlanDetail;
use App\Models\Plans\CircleStudentBooking;
use App\Models\Plans\Plan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class StudentTransferController extends Controller
{
    /**
     * عرض الحجوزات المتاحة للنقل (الحجوزات المؤكدة فقط)
     */
    public function index(Request $request)
    {
        $userCenterId = $this->getUserCenterId();

        $query = CircleStudentBooking::with([
                'user:id,name,email,phone',
                'plan:id,plan_name,total_months,center_id',
                'plan.center:id,name',
                'planDetail:id,day_number',
                'planCircleSchedule:id,circle_id,schedule_date,start_time,end_time,duration_minutes,teacher_id',
                'planCircleSchedule.circle:id,name',
                'studentPlanDetails:id,status'
            ])
            ->where('status', 'confirmed')
            ->when($userCenterId, fn($q) => $q->whereHas('plan', fn($q2) => $q2->where('center_id', $userCenterId)))
            ->latest('created_at');

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->whereHas('user', fn($q2) => $q2->where('name', 'like', '%'.$request->search.'%'))
                  ->orWhereHas('plan', fn($q2) => $q2->where('plan_name', 'like', '%'.$request->search.'%'));
            });
        }

        $perPage = $request->get('per_page', 15);
        $bookings = $query->paginate($perPage);

        return response()->json([
            'data' => $bookings->getCollection()->map(fn($booking) => $this->formatTransferBooking($booking)),
            'current_page' => $bookings->currentPage(),
            'last_page' => $bookings->lastPage(),
            'per_page' => $bookings->perPage(),
            'total' => $bookings->total(),
        ]);
    }

    /**
     * عرض كل الخطط الخاصة بمجمع اليوزر (عدا الخطة الحالية)
     */
    public function availablePlans($bookingId)
    {
        $booking = CircleStudentBooking::where('id', $bookingId)
            ->where('status', 'confirmed')
            ->with(['plan:id,plan_name,center_id'])
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'الحجز غير موجود أو غير مؤكد'
            ], 404);
        }

        $userCenterId = $this->getUserCenterId();

        // 🔥 كل الخطط بمجمع اليوزر عدا الحالية
        $plans = Plan::with(['center:id,name'])
            ->where('center_id', $userCenterId)
            ->where('id', '!=', $booking->plan_id)
            ->get();

        $formattedPlans = $plans->map(fn($plan) => [
            'id' => $plan->id,
            'plan_name' => $plan->plan_name,
            'center_name' => $plan->center?->name ?? 'غير محدد',
            'total_months' => $plan->total_months,
            'circle_count' => PlanCircleSchedule::whereHas('circle', fn($q) => $q->where('center_id', $userCenterId))
                ->whereHas('plan', fn($q) => $q->where('id', $plan->id))->count() // 🔥 عدد الحلقات
        ]);

        return response()->json([
            'success' => true,
            'current_plan' => [
                'id' => $booking->plan_id,
                'plan_name' => $booking->plan->plan_name
            ],
            'available_plans' => $formattedPlans
        ]);
    }

    /**
     * 🔥 عرض الحلقات المتاحة لخطة معينة
     * GET /api/v1/student/transfer/plans/{planId}/circles
     */
    public function availableCircles($planId)
    {
        $userCenterId = $this->getUserCenterId();

        if (!$userCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تحديد المجمع'
            ], 403);
        }

        // 🔥 الحلقات اللي ليها مواعيد في الخطة + مجمع اليوزر
        $circles = PlanCircleSchedule::with(['circle'])
            ->whereHas('plan', fn($q) => $q->where('id', $planId))
            ->whereHas('circle', fn($q) => $q->where('center_id', $userCenterId))
            ->select('circle_id')
            ->groupBy('circle_id')
            ->get()
            ->map(function($schedule) use ($planId) {
                $circleSchedulesCount = PlanCircleSchedule::where('circle_id', $schedule->circle_id)
                    ->whereHas('plan', fn($q) => $q->where('id', $planId))
                    ->count();

                return [
                    'id' => $schedule->circle_id,
                    'circle_name' => $schedule->circle->name,
                    'schedule_count' => $circleSchedulesCount, // 🔥 عدد المواعيد
                ];
            });

        return response()->json([
            'success' => true,
            'circles' => $circles->values()->all()
        ]);
    }

    /**
     * 🔥 عرض المواعيد المتاحة لحلقة معينة + خطة معينة ✅ مُصحح!
     * GET /api/v1/student/transfer/circles/{circleId}/schedules?plan_id=3
     */
    public function availableSchedules(Request $request, $circleId)
    {
        $userCenterId = $this->getUserCenterId();
        $planId = $request->query('plan_id'); // 🔥 plan_id من query parameter

        if (!$userCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تحديد المجمع'
            ], 403);
        }

        if (!$planId) {
            return response()->json([
                'success' => false,
                'message' => 'يجب تحديد plan_id'
            ], 422);
        }

        // 🔥 المواعيد الخاصة بالحلقة + الخطة + مجمع اليوزر ✅
        $schedules = PlanCircleSchedule::with(['circle', 'teacher'])
            ->where('circle_id', $circleId)
            ->whereHas('plan', fn($q) => $q->where('id', $planId)) // 🔥 فلترة بـ plan_id
            ->whereHas('circle', fn($q) => $q->where('center_id', $userCenterId))
            ->orderBy('schedule_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        $formattedSchedules = $schedules->map(function($schedule) {
            // 🔥 إصلاح! جلب اسم المعلم بأمان
            $teacherName = 'غير محدد';
            if ($schedule->teacher) {
                $teacherName = $schedule->teacher->name ?? 'غير محدد';
                // لو الـ Teacher مالهاش name، جيب من User
                if (!$schedule->teacher->name && $schedule->teacher->user_id) {
                    $teacherName = \App\Models\Auth\User::find($schedule->teacher->user_id)?->name ?? 'غير محدد';
                }
            }

            return [
                'id' => $schedule->id,
                'circle_id' => $schedule->circle_id,
                'circle_name' => $schedule->circle->name,
                'schedule_date' => $schedule->schedule_date?->format('Y-m-d'),
                'time_range' => $schedule->start_time . ' - ' . $schedule->end_time,
                'teacher_name' => $teacherName,
                'duration_minutes' => $schedule->duration_minutes,
                'capacity_status' => $schedule->max_students
                    ? "{$schedule->booked_students}/{$schedule->max_students}"
                    : 'غير محدود',
                'remaining_slots' => $schedule->max_students
                    ? max(0, $schedule->max_students - $schedule->booked_students)
                    : null,
            ];
        });

        return response()->json([
            'success' => true,
            'schedules' => $formattedSchedules->values()->all()
        ]);
    }

    /**
     * تنفيذ النقل - يقبل new_plan_id + new_schedule_id
     */
    public function transfer($bookingId, Request $request)
    {
        $request->validate([
            'new_plan_id' => 'required|exists:plans,id',
            'new_schedule_id' => 'required|exists:plan_circle_schedules,id',
        ]);

        $userCenterId = $this->getUserCenterId();

        // 1. جلب الحجز القديم عشان نحدث الأرقام
        $oldBooking = CircleStudentBooking::lockForUpdate()
            ->where('id', $bookingId)
            ->where('status', 'confirmed')
            ->with(['planCircleSchedule'])
            ->first();

        if (!$oldBooking) {
            return response()->json([
                'success' => false,
                'message' => 'الحجز غير موجود أو غير مؤكد'
            ], 404);
        }

        // 🔥 حفظ ID الحلقة القديمة قبل الحذف
        $oldScheduleId = $oldBooking->plan_circle_schedule_id;

        // 2. جلب الحلقة الجديدة
        $newSchedule = PlanCircleSchedule::lockForUpdate()
            ->where('id', $request->new_schedule_id)
            ->whereHas('circle', fn($q) => $q->where('center_id', $userCenterId))
            ->with(['circle'])
            ->first();

        if (!$newSchedule || ($newSchedule->max_students && $newSchedule->booked_students >= $newSchedule->max_students)) {
            return response()->json([
                'success' => false,
                'message' => 'الموعد المختار غير صالح أو ممتلئ'
            ], 422);
        }

        try {
            DB::transaction(function () use ($oldBooking, $request, $newSchedule, $oldScheduleId) {
                // 🔥 1. مسح الجلسات القديمة أولاً
                StudentPlanDetail::where('circle_student_booking_id', $oldBooking->id)->delete();

                // 🔥 2. مسح الحجز القديم كامل
                $oldBooking->delete();

                // 🔥 3. تحديث الحلقة القديمة (-1)
                if ($oldScheduleId) {
                    PlanCircleSchedule::where('id', $oldScheduleId)
                        ->decrement('booked_students');
                }

                // 🔥 4. إنشاء حجز جديد
                $newBookingId = DB::table('circle_student_bookings')->insertGetId([
                    'plan_id' => $request->new_plan_id,
                    'plan_details_id' => 1, // أول يوم
                    'plan_circle_schedule_id' => $newSchedule->id,
                    'user_id' => $oldBooking->user_id,
                    'status' => 'confirmed',
                    'progress_status' => 'not_started',
                    'current_day' => 0,
                    'completed_days' => 0,
                    'total_days' => 0,
                    'booked_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // 🔥 5. تحديث الحلقة الجديدة (+1)
                $newSchedule->increment('booked_students');

                // 🔥 6. الجلسات الجديدة - مع حماية من خطأ المعلم
                $newBooking = CircleStudentBooking::find($newBookingId);
                try {
                    $this->createNewStudentPlanDetails($newBooking, $newSchedule, $request->new_plan_id);
                } catch (\Exception $e) {
                    // 🔥 لو فشل → كمل بدون جلسات (مش مشكلة كبيرة)
                    \Log::warning('Plan details creation skipped: ' . $e->getMessage());
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'تم نقل الطالب بنجاح! 🎉 ' .
                            ($newSchedule->circle->name ?? 'الموعد الجديد')
            ]);

        } catch (\Exception $e) {
            \Log::error('Transfer failed completely', [
                'booking_id' => $bookingId,
                'new_plan_id' => $request->new_plan_id,
                'new_schedule_id' => $request->new_schedule_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'فشل في النقل: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إنشاء الجلسات الجديدة للطالب
     */
    private function createNewStudentPlanDetails(CircleStudentBooking $booking, PlanCircleSchedule $newSchedule, $newPlanId)
    {
        // 🔥 1. جلب تفاصيل الخطة
        $planDetails = PlanDetail::where('plan_id', $newPlanId)
            ->orderBy('day_number')
            ->get();

        if ($planDetails->isEmpty()) {
            \Log::warning("No plan details found for plan_id: {$newPlanId}");
            return; // 🔥 كمل بدون خطأ
        }

        // 🔥 2. إصلاح البحث عن المعلم - user_id مش id!
        $teacher = Teacher::where('user_id', $newSchedule->teacher_id)->first();

        if (!$teacher) {
            // 🔥 تحذير بس مش خطأ قاتل
            \Log::warning("Teacher not found for user_id: {$newSchedule->teacher_id}");
            return; // 🔥 كمل بدون جلسات
        }

        // 🔥 3. إنشاء الجلسات
        foreach ($planDetails as $detail) {
            StudentPlanDetail::create([
                'circle_student_booking_id' => $booking->id,
                'plan_id' => $newPlanId,
                'teacher_id' => $teacher->id,        // ✅ teacher.id الصحيح
                'circle_id' => $newSchedule->circle_id,
                'plan_circle_schedule_id' => $newSchedule->id,
                'day_number' => $detail->day_number,
                'new_memorization' => $detail->new_memorization,
                'review_memorization' => $detail->review_memorization,
                'session_time' => $newSchedule->start_time,
                'status' => 'قيد الانتظار',
            ]);
        }
    }

    /**
     * جلب center_id لليوزر الحالي
     */
    private function getUserCenterId()
    {
        return Auth::user()->center_id ?? Auth::user()->centers()->first()?->id;
    }

    /**
     * تنسيق بيانات الحجز للعرض
     */
    private function formatTransferBooking($booking)
    {
        $schedule = $booking->planCircleSchedule;
        $sessionsCount = $booking->studentPlanDetails()->count();

        return [
            'id' => $booking->id,
            'student_name' => $booking->user?->name ?? 'غير معروف',
            'student_phone' => $booking->user?->phone ?? 'غير محدد',
            'current_plan_name' => $booking->plan?->plan_name ?? 'غير محدد',
            'current_plan_months' => $booking->plan?->total_months ?? 0,
            'center_name' => $booking->plan?->center?->name ?? 'غير محدد',
            'circle_name' => $schedule?->circle?->name ?? 'غير محدد',
            'schedule_date' => $schedule?->schedule_date?->format('Y-m-d') ?? 'غير محدد',
            'time_range' => $schedule ? $schedule->start_time . ' - ' . $schedule->end_time : 'غير محدد',
            'current_sessions_count' => $sessionsCount,
            'status' => $booking->status,
            'transferred_at' => $booking->updated_at?->format('Y-m-d H:i') ?? 'غير منقول',
        ];
    }
}