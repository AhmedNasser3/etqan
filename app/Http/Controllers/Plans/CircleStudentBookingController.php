<?php
// app/Http/Controllers/Plans/CircleStudentBookingController.php
namespace App\Http\Controllers\Plans;

use Illuminate\Http\Request;
use App\Models\Plans\PlanDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Plans\CircleStudentBooking;

class CircleStudentBookingController extends Controller
{
    //  1️⃣ حجوزات الطالب الخاصة بي
    public function myBookings(Request $request)
    {
        Log::info('📋 [MY BOOKINGS] User: ' . Auth::id());

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $bookings = CircleStudentBooking::with([
                'plan:id,plan_name',
                'planDetail:id,day_number,new_memorization',
                'schedule:id,schedule_date,start_time',
                'student:id,name'
            ])
            ->where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->orderBy('booked_at', 'desc')
            ->paginate(15);

        Log::info(' [MY BOOKINGS] Found: ' . $bookings->total());
        return response()->json($bookings);
    }

    //  2️⃣ حجوزات الحلقة (للأدمن)
    public function scheduleBookings($scheduleId)
    {
        Log::info('📅 [SCHEDULE BOOKINGS] Schedule: ' . $scheduleId);

        $schedule = PlanCircleSchedule::findOrFail($scheduleId);

        // تحقق صلاحية المركز
        if ($schedule->plan->center_id !== Auth::user()->center_id) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $bookings = CircleStudentBooking::with([
                'plan:id,plan_name',
                'planDetail:id,day_number,new_memorization',
                'student:id,name'
            ])
            ->where('plan_circle_schedule_id', $scheduleId)
            ->orderBy('booked_at')
            ->get();

        Log::info(' [SCHEDULE BOOKINGS] Found: ' . $bookings->count());
        return response()->json($bookings);
    }

    //  3️⃣ حجز جديد
    public function store(Request $request)
    {
        Log::info('➕ [NEW BOOKING] Data: ', $request->all());

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'plan_details_id' => 'required|exists:plan_details,id',
            'plan_circle_schedule_id' => 'required|exists:plan_circle_schedules,id',
            'status' => 'sometimes|in:confirmed,cancelled',
        ]);

        $user = Auth::user();

        //  تحقق الخطة للمركز
        $plan = DB::table('plans')->find($validated['plan_id']);
        if ($plan->center_id !== $user->center_id) {
            return response()->json(['error' => 'الخطة غير مملوكة لمركزك'], 403);
        }

        //  تحقق الحجز مش موجود
        $exists = CircleStudentBooking::where([
            'plan_id' => $validated['plan_id'],
            'plan_details_id' => $validated['plan_details_id'],
            'user_id' => $user->id
        ])->exists();

        if ($exists) {
            return response()->json(['error' => 'لديك حجز مسبق لهذا اليوم'], 422);
        }

        DB::beginTransaction();
        try {
            $booking = CircleStudentBooking::create([
                'plan_id' => $validated['plan_id'],
                'plan_details_id' => $validated['plan_details_id'],
                'plan_circle_schedule_id' => $validated['plan_circle_schedule_id'],
                'user_id' => $user->id,
                'status' => $validated['status'] ?? 'confirmed',
                'total_days' => PlanDetail::where('plan_id', $validated['plan_id'])->count(),
            ]);

            //  زيادة عدد الحجوزات في الـ schedule
            $booking->schedule->increment('booked_students');

            $booking->load(['plan', 'planDetail', 'schedule', 'student']);

            DB::commit();
            Log::info(' [NEW BOOKING] Created: ' . $booking->id);

            return response()->json($booking, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ [NEW BOOKING] Failed: ' . $e->getMessage());
            return response()->json(['error' => 'فشل في الحجز'], 500);
        }
    }

    //  4️⃣ إلغاء حجز
    public function cancel($bookingId)
    {
        Log::info('❌ [CANCEL BOOKING] ID: ' . $bookingId);

        $booking = CircleStudentBooking::findOrFail($bookingId);

        //  تحقق إنه طالب أو أدمن المركز
        if ($booking->user_id !== Auth::id() &&
            $booking->schedule->plan->center_id !== Auth::user()->center_id) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        DB::transaction(function () use ($booking) {
            $booking->update(['status' => 'cancelled']);
            $booking->schedule->decrement('booked_students');
        });

        Log::info(' [CANCEL BOOKING] Success: ' . $bookingId);
        return response()->json(['message' => 'تم إلغاء الحجز بنجاح']);
    }

    //  5️⃣ تحديث تقدم الطالب
    public function updateProgress(Request $request, $bookingId)
    {
        $booking = CircleStudentBooking::findOrFail($bookingId);

        if ($booking->user_id !== Auth::id()) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $validated = $request->validate([
            'current_day' => 'required|integer|min:0',
            'completed_days' => 'required|integer|min:0',
            'progress_status' => 'sometimes|in:not_started,in_progress,completed',
            'started_at' => 'sometimes|date',
        ]);

        $booking->update($validated);

        if ($validated['completed_days'] === $booking->total_days) {
            $booking->update([
                'progress_status' => 'completed',
                'completed_at' => now()
            ]);
        }

        Log::info(' [PROGRESS UPDATE] Booking: ' . $bookingId);
        return response()->json($booking->fresh());
    }

    //  6️⃣ إحصائيات الحجوزات للمركز
    public function centerStats()
    {
        $centerId = Auth::user()->center_id;

        $stats = CircleStudentBooking::whereHas('plan', fn($q) =>
            $q->where('center_id', $centerId)
        )->selectRaw('
            status,
            progress_status,
            COUNT(*) as count,
            AVG(current_day) as avg_progress
        ')
        ->groupBy('status', 'progress_status')
        ->get();

        return response()->json($stats);
    }
}