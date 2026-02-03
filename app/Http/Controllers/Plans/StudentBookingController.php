<?php

namespace App\Http\Controllers\Plans;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Plans\CircleStudentBooking;

class StudentBookingController extends Controller
{
 public function bookSchedule(Request $request, $scheduleId)
    {
        $schedule = PlanCircleSchedule::findOrFail($scheduleId);

        if (!$schedule->hasAvailability()) {
            return response()->json(['message' => 'الوقت غير متاح'], 400);
        }

        $booking = CircleStudentBooking::create([
            'plan_circle_schedule_id' => $scheduleId,
            'student_id' => auth()->id(),
            'status' => 'confirmed',
            'progress_status' => 'not_started',
            'total_days' => $schedule->plan->details_count ?? 30,
        ]);

        $schedule->increment('booked_students');

        return response()->json([
            'booking' => $booking->load('schedule.plan'),
            'message' => 'تم الحجز بنجاح! ابدأ خطتك الآن'
        ], 201);
    }

    public function myBookings()
    {
        $bookings = CircleStudentBooking::where('student_id', auth()->id())
            ->with(['schedule.plan', 'schedule.circle', 'schedule.teacher'])
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    public function updateProgress(Request $request, $bookingId)
    {
        $booking = CircleStudentBooking::where('student_id', auth()->id())
            ->where('id', $bookingId)
            ->firstOrFail();

        $booking->update([
            'current_day' => $request->current_day,
            'completed_days' => $request->completed_days,
            'progress_status' => $request->progress_status,
            'started_at' => $booking->started_at ?? now(),
        ]);

        if ($request->is_completed) {
            $booking->update([
                'progress_status' => 'completed',
                'completed_at' => now(),
                'status' => 'completed',
            ]);
        }

        return response()->json($booking->fresh()->load('schedule.plan'));
    }
}