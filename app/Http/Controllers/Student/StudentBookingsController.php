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
    private function getUserCenterId()
    {
        $user = Auth::user();
        if (!$user) throw new \Exception('غير مسجل الدخول', 401);
        if (!$user->center_id) throw new \Exception('لا يوجد مجمع مرتبط بحسابك', 400);
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
                ->whereHas('plan', fn($q) => $q->where('center_id', $centerId))
                ->whereHas('planCircleSchedule.circle', fn($q) => $q->where('center_id', $centerId))
                ->where('status', 'pending')
                ->latest('created_at');

            if ($request->filled('search')) {
                $query->where(function ($q) use ($request, $centerId) {
                    $q->whereHas('user', fn($q2) => $q2->where('name', 'like', '%' . $request->search . '%')
                                ->where('center_id', $centerId))
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
            ]);
        } catch (\Exception $e) {
            Log::error('Student bookings index error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'فشل في جلب الحجوزات'], 500);
        }
    }

 public function confirm($bookingId)
{
    try {
        $centerId = $this->getUserCenterId();
        $booking = CircleStudentBooking::where('id', $bookingId)
            ->where('status', 'pending')
            ->whereHas('plan', fn($q) => $q->where('center_id', $centerId))
            ->whereHas('planCircleSchedule.circle', fn($q) => $q->where('center_id', $centerId))
            ->with(['plan', 'planDetail', 'planCircleSchedule.circle'])
            ->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'الحجز غير موجود'], 404);
        }

        $schedule = $booking->planCircleSchedule;
        if (!$schedule) return response()->json(['success' => false, 'message' => 'بيانات الحلقة غير موجودة'], 404);
        if ($schedule->circle->center_id != $centerId) return response()->json(['success' => false, 'message' => 'الحلقة لا تنتمي لمجمعك'], 403);
        if ($schedule->max_students && $schedule->booked_students >= $schedule->max_students) {
            return response()->json(['success' => false, 'message' => 'عدد الطلاب مكتمل'], 400);
        }

        DB::transaction(function () use ($booking, $schedule) {
            $booking->update(['status' => 'confirmed', 'started_at' => now()]);
            $schedule->increment('booked_students');

            // ✅ جيب start_mode و start_day_number من الـ booking نفسه
            $this->createStudentPlanDetails(
                $booking,
                $schedule,
                $booking->start_mode ?? 'normal',        // ✅ اللي اختاره الطالب
                $booking->start_day_number ?? null        // ✅ اليوم اللي اختاره
            );
        });

        return response()->json(['success' => true, 'message' => 'تم قبول الطالب بنجاح! 🎉']);
    } catch (\Exception $e) {
        Log::error('Booking confirm error', ['booking_id' => $bookingId, 'error' => $e->getMessage()]);
        return response()->json(['success' => false, 'message' => 'حدث خطأ: ' . $e->getMessage()], 500);
    }
}

    public function importAssign(Request $request)
    {
        try {
            $centerId = $this->getUserCenterId();
            $idNumber     = trim($request->input('id_number', ''));
            $circleName   = trim($request->input('circle_name', ''));
            $scheduleDate = trim($request->input('schedule_date', ''));
            $planId       = $request->input('plan_id');

            if (empty($idNumber)) return response()->json(['success' => false, 'message' => 'رقم الهوية مطلوب'], 422);
            if (empty($circleName)) return response()->json(['success' => false, 'message' => 'اسم الحلقة مطلوب'], 422);

            $student = Student::where('id_number', $idNumber)->where('center_id', $centerId)->with('user')->first();
            if (!$student) return response()->json(['success' => false, 'message' => "لم يُعثر على طالب بهوية: {$idNumber}"], 422);

            $circle = Circle::where('center_id', $centerId)->where('name', 'like', "%{$circleName}%")->first();
            if (!$circle) return response()->json(['success' => false, 'message' => "لم يُعثر على حلقة: {$circleName}"], 422);

            $plan = $planId
                ? Plan::where('id', $planId)->where('center_id', $centerId)->first()
                : Plan::where('center_id', $centerId)->where('is_active', true)->first();

            if (!$plan) return response()->json(['success' => false, 'message' => 'لم يُعثر على خطة نشطة'], 422);

            $scheduleQuery = PlanCircleSchedule::where('circle_id', $circle->id)
                ->where('is_available', true)
                ->whereColumn('booked_students', '<', 'max_students');

            if ($scheduleDate) {
                $scheduleQuery->whereDate('schedule_date', $scheduleDate);
            } else {
                $scheduleQuery->whereDate('schedule_date', '>=', now()->toDateString())->orderBy('schedule_date');
            }

            $schedule = $scheduleQuery->first();
            if (!$schedule) return response()->json(['success' => false, 'message' => "لا يوجد موعد متاح في حلقة: {$circleName}"], 422);

            $existing = CircleStudentBooking::where('user_id', $student->user_id)
                ->where('plan_circle_schedule_id', $schedule->id)
                ->whereIn('status', ['pending', 'confirmed'])->first();
            if ($existing) return response()->json(['success' => false, 'message' => 'الطالب محجوز مسبقاً'], 422);

            $planDetail = PlanDetail::where('plan_id', $plan->id)->orderBy('day_number')->first();
            if (!$planDetail) return response()->json(['success' => false, 'message' => 'الخطة لا تحتوي على تفاصيل أيام'], 422);

            DB::transaction(function () use ($student, $plan, $planDetail, $schedule) {
                $booking = CircleStudentBooking::create([
                    'user_id'                 => $student->user_id,
                    'plan_id'                 => $plan->id,
                    'plan_detail_id'          => $planDetail->id,
                    'plan_circle_schedule_id' => $schedule->id,
                    'status'                  => 'confirmed',
                    'started_at'              => now(),
                    'start_mode'              => 'normal',
                    'start_day_number'        => null,
                ]);
                $schedule->increment('booked_students');
                $this->createStudentPlanDetails($booking, $schedule, 'normal', null);
            });

            return response()->json(['success' => true, 'message' => "تم تعيين الطالب في حلقة: {$circle->name} بنجاح"], 201);
        } catch (\Exception $e) {
            Log::error('importAssign error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'خطأ: ' . $e->getMessage()], 500);
        }
    }

    // ================================================================
    // ✅ book() — نقطة الحجز الرئيسية من الطالب مع start_mode
    // ================================================================
   public function book(Request $request, $scheduleId)
{
    try {
        $centerId = $this->getUserCenterId();
        $user = Auth::user();

        $request->validate([
            'plan_id'         => 'required|integer',
            'plan_details_id' => 'required|integer',
            'start_mode'      => 'nullable|in:normal,reverse,from_day,reverse_from_day',
            'start_day'       => 'nullable|integer|min:1',
        ]);

        $startMode = $request->input('start_mode', 'normal');
        $startDay  = $request->input('start_day');

        if (in_array($startMode, ['from_day', 'reverse_from_day']) && !$startDay) {
            return response()->json([
                'success' => false,
                'message' => 'يرجى تحديد رقم اليوم',
            ], 422);
        }

        $schedule = PlanCircleSchedule::where('id', $scheduleId)
            ->whereHas('circle', fn($q) => $q->where('center_id', $centerId))
            ->where('is_available', true)
            ->first();

        if (!$schedule) return response()->json(['success' => false, 'message' => 'الموعد غير متاح'], 404);
        if ($schedule->max_students && $schedule->booked_students >= $schedule->max_students) {
            return response()->json(['success' => false, 'message' => 'الحلقة ممتلئة'], 400);
        }

        $plan = Plan::where('id', $request->plan_id)
            ->where('center_id', $centerId)
            ->first();
        if (!$plan) return response()->json(['success' => false, 'message' => 'الخطة غير موجودة'], 404);

        $existing = CircleStudentBooking::where('user_id', $user->id)
            ->where('plan_circle_schedule_id', $schedule->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->first();
        if ($existing) return response()->json(['success' => false, 'message' => 'أنت محجوز مسبقاً'], 400);

        $planDetails = PlanDetail::where('plan_id', $plan->id)
            ->orderBy('day_number')
            ->get();
        if ($planDetails->isEmpty()) return response()->json(['success' => false, 'message' => 'الخطة لا تحتوي على أيام'], 422);

        $firstDetail = $this->resolveFirstDetail($planDetails, $startMode, $startDay);

        Log::info('📝 [BOOK] Creating booking', [
            'user_id'    => $user->id,
            'plan_id'    => $plan->id,
            'start_mode' => $startMode,
            'start_day'  => $startDay,
            'first_day'  => $firstDetail->day_number,
        ]);

        DB::transaction(function () use ($user, $plan, $firstDetail, $schedule, $startMode, $startDay) {
            $booking = CircleStudentBooking::create([
                'user_id'                   => $user->id,
                'plan_id'                   => $plan->id,
                'plan_details_id'           => $firstDetail->id,  // ✅ plan_details_id مش plan_detail_id
                'plan_circle_schedule_id'   => $schedule->id,
                'status'                    => 'pending',
                'start_mode'                => $startMode,         // ✅
                'start_day_number'          => $startDay,          // ✅
                'total_days'                => 0,
            ]);

            $schedule->increment('booked_students');
            $this->createStudentPlanDetails($booking, $schedule, $startMode, $startDay);
        });

        return response()->json(['success' => true, 'message' => 'تم تقديم طلب الحجز بنجاح 🎉'], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['success' => false, 'message' => implode(' | ', $e->validator->errors()->all())], 422);
    } catch (\Exception $e) {
        Log::error('book error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
        return response()->json(['success' => false, 'message' => 'خطأ: ' . $e->getMessage()], 500);
    }
}

    // ================================================================
    // ✅ تحديد أول detail بناءً على start_mode
    // ================================================================
    private function resolveFirstDetail($planDetails, string $startMode, ?int $startDay): PlanDetail
    {
        $sorted = $planDetails->sortBy('day_number')->values();

        switch ($startMode) {
            case 'reverse':
                // أول جلسة = آخر يوم في الخطة
                return $sorted->last();

            case 'from_day':
                // أول جلسة = اليوم المحدد أو أقرب يوم بعده
                $found = $sorted->firstWhere('day_number', '>=', $startDay);
                return $found ?? $sorted->first();

            case 'reverse_from_day':
                // أول جلسة = اليوم المحدد أو أقرب يوم قبله
                $found = $sorted->filter(fn($d) => $d->day_number <= $startDay)->last();
                return $found ?? $sorted->first();

            case 'normal':
            default:
                return $sorted->first();
        }
    }

    // ================================================================
    // ✅ createStudentPlanDetails مع ترتيب الأيام حسب start_mode
    // ================================================================
    private function createStudentPlanDetails(
        CircleStudentBooking $booking,
        PlanCircleSchedule $schedule,
        string $startMode = 'normal',
        ?int $startDay = null
    ): void {
        try {
            $centerId = $this->getUserCenterId();

            $planDetails = PlanDetail::where('plan_id', $booking->plan_id)
                ->orderBy('day_number')
                ->get();

            // ✅ ترتيب الأيام حسب start_mode
            $orderedDetails = $this->orderPlanDetails($planDetails, $startMode, $startDay);

            $realTeacher = Teacher::where('user_id', $schedule->teacher_id)->first();
            if (!$realTeacher) {
                throw new \Exception("المعلم غير موجود لـ user_id: {$schedule->teacher_id}");
            }

            // حذف أي تفاصيل قديمة لو موجودة (في حالة إعادة الحجز)
            StudentPlanDetail::where('circle_student_booking_id', $booking->id)->delete();

            foreach ($orderedDetails as $index => $detail) {
                StudentPlanDetail::create([
                    'circle_student_booking_id' => $booking->id,
                    'plan_id'                   => $booking->plan_id,
                    'teacher_id'                => $realTeacher->id,
                    'circle_id'                 => $schedule->circle_id,
                    'plan_circle_schedule_id'   => $schedule->id,
                    'day_number'                => $index + 1,           // ✅ دايمًا من 1 في جدول الطالب
                    'plan_day_number'           => $detail->day_number,  // ✅ اليوم الأصلي في الخطة
                    'new_memorization'          => $detail->new_memorization,
                    'review_memorization'       => $detail->review_memorization,
                    'session_time'              => $schedule->start_time,
                    'status'                    => 'قيد الانتظار',
                ]);
            }

            Log::info('Student plan details created', [
                'booking_id'   => $booking->id,
                'start_mode'   => $startMode,
                'start_day'    => $startDay,
                'days_count'   => $orderedDetails->count(),
                'center_id'    => $centerId,
            ]);
        } catch (\Exception $e) {
            Log::error('createStudentPlanDetails error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    // ================================================================
    // ✅ ترتيب أيام الخطة حسب start_mode
    // ================================================================
    private function orderPlanDetails($planDetails, string $startMode, ?int $startDay)
    {
        $sorted = $planDetails->sortBy('day_number')->values();

        switch ($startMode) {
            case 'reverse':
                return $sorted->reverse()->values();

            case 'from_day':
                $idx = $sorted->search(fn($d) => $d->day_number >= ($startDay ?? 1));
                $idx = $idx === false ? 0 : $idx;
                // من اليوم المحدد للنهاية
                return $sorted->slice($idx)->values();

            case 'reverse_from_day':
                $idx = $sorted->filter(fn($d) => $d->day_number <= ($startDay ?? $sorted->last()->day_number))->count();
                // من اليوم المحدد للأول بالمعكوس
                return $sorted->slice(0, $idx)->reverse()->values();

            case 'normal':
            default:
                return $sorted;
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
            'start_mode'       => $booking->start_mode ?? 'normal',       // ✅
            'start_day_number' => $booking->start_day_number ?? null,      // ✅
            'can_confirm'      => !$schedule || !$schedule->max_students || $schedule->booked_students < $schedule->max_students,
            'remaining_slots'  => $schedule && $schedule->max_students
                ? ($schedule->max_students - $schedule->booked_students)
                : null,
        ];
    }
}
