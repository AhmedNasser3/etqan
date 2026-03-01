<?php

namespace App\Http\Controllers\Student;

use Illuminate\Http\Request;
use App\Models\Plans\PlanDetail;
use App\Models\Auth\Teacher;
use App\Models\Tenant\Circle;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Student\StudentPlanDetail;
use App\Models\Plans\CircleStudentBooking;

class StudentBookingsController extends Controller
{
    public function index(Request $request)
    {
        $query = CircleStudentBooking::with([
                'user:id,name,email,phone',
                'plan:id,plan_name,total_months,center_id',
                'plan.center:id,name',
                'planDetail:id,day_number',
                'planCircleSchedule:id,circle_id,schedule_date,start_time,end_time,duration_minutes,booked_students,max_students,is_available',
                'planCircleSchedule.circle:id,name',
            ])
            ->where('status', 'pending')
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
            'data' => $bookings->getCollection()->map(fn($booking) => $this->formatBooking($booking)),
            'current_page' => $bookings->currentPage(),
            'last_page' => $bookings->lastPage(),
            'per_page' => $bookings->perPage(),
            'total' => $bookings->total(),
        ]);
    }

    public function confirm($bookingId)
    {
        $booking = CircleStudentBooking::where('id', $bookingId)
            ->where('status', 'pending')
            ->with([
                'plan:id',
                'planDetail:id,plan_id,day_number',
                'planCircleSchedule:id,circle_id,schedule_date,start_time,end_time,teacher_id'
            ])
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'الحجز غير موجود أو تمت الموافقة عليه مسبقاً'
            ], 404);
        }

        $schedule = $booking->planCircleSchedule;

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات الحلقة غير موجودة'
            ], 404);
        }

        if ($schedule->max_students && $schedule->booked_students >= $schedule->max_students) {
            return response()->json([
                'success' => false,
                'message' => 'عدد الطلاب مكتمل في هذه الحلقة'
            ], 400);
        }

        try {
            DB::transaction(function () use ($booking, $schedule) {
                //  1. تحديث حالة الحجز
                $booking->update([
                    'status' => 'confirmed',
                    'started_at' => now(),
                ]);

                //  2. زيادة عدد الطلاب
                $schedule->increment('booked_students');

                //  3. إنشاء student_plan_details مع الـ teacher_id الصحيح
                $this->createStudentPlanDetails($booking, $schedule);
            });

            return response()->json([
                'success' => true,
                'message' => 'تم قبول الطالب في الخطة بنجاح! 🎉 تم إنشاء جميع جلسات الخطة'
            ]);
        } catch (\Exception $e) {
            Log::error('Booking confirm error: ' . $e->getMessage(), [
                'booking_id' => $bookingId,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء قبول الطالب: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     *  إنشاء سجلات student_plan_details مع الـ teacher_id الحقيقي من جدول teachers
     */
    private function createStudentPlanDetails(CircleStudentBooking $booking, PlanCircleSchedule $schedule)
    {
        //  جلب plan_details للخطة
        $planDetails = PlanDetail::where('plan_id', $booking->plan_id)
            ->orderBy('day_number')
            ->get();

        // 🔥 جلب الـ teacher الحقيقي من جدول teachers حسب user_id
        $realTeacher = Teacher::where('user_id', $schedule->teacher_id)->first();

        if (!$realTeacher) {
            Log::error('Real teacher not found for user_id', [
                'user_id' => $schedule->teacher_id,
                'schedule_id' => $schedule->id
            ]);
            throw new \Exception("المعلم غير موجود في جدول teachers لـ user_id: {$schedule->teacher_id}");
        }

        Log::info('Creating student plan details', [
            'booking_id' => $booking->id,
            'plan_id' => $booking->plan_id,
            'user_id_from_schedule' => $schedule->teacher_id,  // 11
            'real_teacher_id' => $realTeacher->id,            // الـ ID الحقيقي من teachers
            'circle_id' => $schedule->circle_id,
            'total_days' => $planDetails->count()
        ]);

        //  إنشاء سجل لكل يوم مع الـ teacher_id الصحيح
        foreach ($planDetails as $detail) {
            StudentPlanDetail::create([
                //  الـ 5 حقول أساسية
                'circle_student_booking_id' => $booking->id,
                'plan_id' => $booking->plan_id,
                'teacher_id' => $realTeacher->id,        // 🔥 الـ ID الحقيقي من جدول teachers
                'circle_id' => $schedule->circle_id,
                'plan_circle_schedule_id' => $schedule->id,

                //  من plan_details
                'day_number' => $detail->day_number,
                'new_memorization' => $detail->new_memorization,
                'review_memorization' => $detail->review_memorization,

                //  الوقت من الحلقة
                'session_time' => $schedule->start_time,

                //  الحالة الافتراضية
                'status' => 'قيد الانتظار',
            ]);
        }

        Log::info('Student plan details created successfully', [
            'booking_id' => $booking->id,
            'real_teacher_id_used' => $realTeacher->id,
            'created_count' => $planDetails->count()
        ]);
    }

    private function formatBooking($booking)
    {
        $schedule = $booking->planCircleSchedule;
        $capacityStatus = $schedule && $schedule->max_students
            ? "{$schedule->booked_students}/{$schedule->max_students}"
            : 'غير محدود';

        return [
            'id' => $booking->id,
            'student_name' => $booking->user?->name ?? 'غير معروف',
            'student_phone' => $booking->user?->phone ?? 'غير محدد',
            'student_email' => $booking->user?->email ?? 'غير محدد',
            'plan_name' => $booking->plan?->plan_name ?? 'غير محدد',
            'plan_months' => $booking->plan?->total_months ?? 0,
            'center_name' => $booking->plan?->center?->name ?? 'غير محدد',
            'day_number' => $booking->planDetail?->day_number ?? 'غير محدد',
            'circle_name' => $schedule?->circle?->name ?? 'غير محدد',
            'teacher_name' => $schedule?->teacher?->name ?? 'غير محدد',
            'schedule_date' => $schedule?->schedule_date?->format('Y-m-d') ?? 'غير محدد',
            'time_range' => $schedule ? ($schedule->start_time . ' - ' . $schedule->end_time) : 'غير محدد',
            'duration_minutes' => $schedule?->duration_minutes ?? 60,
            'booked_at' => $booking->created_at?->format('Y-m-d H:i') ?? 'الآن',
            'capacity_status' => $capacityStatus,
            'can_confirm' => !$schedule || !$schedule->max_students || $schedule->booked_students < $schedule->max_students,
            'remaining_slots' => $schedule && $schedule->max_students ? ($schedule->max_students - $schedule->booked_students) : null,
        ];
    }
}