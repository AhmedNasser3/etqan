<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Plans\CircleStudentBooking;
use App\Models\Plans\PlanCircleSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
                'planCircleSchedule.teacher:id,name'
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
            ->with(['planCircleSchedule'])
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
                $booking->update([
                    'status' => 'confirmed',
                    'started_at' => now(),
                ]);

                $schedule->increment('booked_students');
            });

            return response()->json([
                'success' => true,
                'message' => 'تم قبول الطالب في الخطة بنجاح! 🎉'
            ]);
        } catch (\Exception $e) {
            Log::error('Booking confirm error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء قبول الطالب'
            ], 500);
        }
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
