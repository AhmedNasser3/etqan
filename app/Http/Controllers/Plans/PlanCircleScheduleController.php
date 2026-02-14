<?php
namespace App\Http\Controllers\Plans;

use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Plans\CircleStudentBooking;

class PlanCircleScheduleController extends Controller
{
    // ✅ 1️⃣ جلب خطط المركز للإنشاء - Debug كامل
    public function getPlansForCreate(Request $request)
    {
        Log::info('🚀 [STEP 1] getPlansForCreate - User loaded', ['user_id' => Auth::id()]);

        $user = Auth::user();
        Log::info('🚀 [STEP 2] User data', ['center_id' => $user?->center_id, 'role' => $user?->role]);

        if (!$user || !$user->center_id) {
            Log::error('❌ [STEP 2 FAILED] No center_id found');
            return response()->json(['error' => 'لا يوجد مركز مرتبط'], 403);
        }

        Log::info('🚀 [STEP 3] Querying plans table', ['center_id' => $user->center_id]);

        $plans = DB::table('plans')
            ->where('center_id', $user->center_id)
            ->select('id', 'plan_name as name', 'center_id')
            ->orderBy('plan_name')
            ->get();

        Log::info('✅ [STEP 4 SUCCESS] Plans loaded', [
            'count' => $plans->count(),
            'center_id' => $user->center_id,
            'plans' => $plans->pluck('name')->toArray()
        ]);

        return response()->json($plans);
    }

    // ✅ 2️⃣ جلب حلقات المركز - Debug كامل
    public function getCirclesForCreate(Request $request)
    {
        Log::info('🎯 [STEP 1] getCirclesForCreate - User check');

        $user = Auth::user();
        if (!$user || !$user->center_id) {
            Log::error('❌ [STEP 2 FAILED] No center_id');
            return response()->json(['error' => 'لا يوجد مركز'], 403);
        }

        Log::info('🎯 [STEP 3] Querying circles', ['center_id' => $user->center_id]);

        $circles = DB::table('circles')
            ->where('center_id', $user->center_id)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        Log::info('✅ [STEP 4 SUCCESS] Circles loaded', [
            'count' => $circles->count(),
            'center_id' => $user->center_id
        ]);

        return response()->json($circles);
    }

    public function getTeachersForCreate(Request $request)
    {
        Log::info('👨‍🏫 [STEP 1] getTeachersForCreate START', ['user_id' => Auth::id()]);

        try {
            $user = Auth::user();
            Log::info('👤 [STEP 2] User check', [
                'user_id' => $user?->id,
                'center_id' => $user?->center_id,
            ]);

            if (!$user || !$user->center_id) {
                Log::error('❌ [STEP 3] No user/center_id');
                return response()->json(['error' => 'لا يوجد مركز'], 403);
            }

            Log::info('🔍 [STEP 4] Querying TEACHERS table', ['center_id' => $user->center_id]);

            $teachers = DB::table('teachers as t')
                ->join('users as u', 't.user_id', '=', 'u.id')
                ->where('u.center_id', $user->center_id)
                ->where('t.role', 'teacher')
                ->where('u.status', 'active')
                ->select('u.id', 'u.name')
                ->orderBy('u.name')
                ->limit(50)
                ->get();

            Log::info('✅ [STEP 5 SUCCESS] Teachers loaded', [
                'count' => $teachers->count(),
                'center_id' => $user->center_id,
                'sample' => $teachers->take(2)->toArray()
            ]);

            return response()->json($teachers);

        } catch (\Exception $e) {
            Log::error('💥 [STEP 6 ERROR] Teachers EXCEPTION', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json(['error' => 'خطأ في جلب المدرسين'], 500);
        }
    }

    // ✅ 4️⃣ إنشاء موعد - مُصحح مع Jitsi room تلقائي + validation مرن + Debug
    public function store(Request $request)
    {
        Log::info('➕ [STEP 1] store() - Raw request data', $request->all());

        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'circle_id' => 'required|exists:circles,id',
            'teacher_id' => 'nullable|exists:users,id',
            'schedule_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:15|max:300',
            'max_students' => 'nullable|integer|min:1|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        Log::info('✅ [STEP 2] Validation PASSED', $validated);

        $plan = DB::table('plans')->find($validated['plan_id']);
        if ($plan->center_id !== Auth::user()->center_id) {
            Log::error('❌ [STEP 3 FAILED] Plan not owned by center');
            return response()->json(['error' => 'الخطة غير مملوكة لمركزك'], 403);
        }

        Log::info('✅ [STEP 4] Plan ownership verified', ['plan_id' => $validated['plan_id']]);

        DB::beginTransaction();
        try {
            $duration = $validated['duration_minutes'] ?? $this->calculateDuration(
                $validated['start_time'],
                $validated['end_time']
            );

            $schedule = PlanCircleSchedule::create([
                'plan_id' => $validated['plan_id'],
                'circle_id' => $validated['circle_id'],
                'teacher_id' => $validated['teacher_id'] ?? null,
                'schedule_date' => $validated['schedule_date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'duration_minutes' => $duration,
                'day_of_week' => strtolower(now()->parse($validated['schedule_date'])->dayOfWeek),
                'max_students' => $validated['max_students'] ?? null,
                'is_available' => true,
                'notes' => $validated['notes'] ?? null,
                'booked_students' => 0,
            ]);

            Log::info('✅ [STEP 5] Schedule record created مع Jitsi room', [
                'id' => $schedule->id,
                'jitsi_room_name' => $schedule->jitsi_room_name,
                'jitsi_url' => $schedule->jitsi_url
            ]);

            $schedule->load(['plan:id,plan_name', 'circle:id,name', 'teacher:id,name']);

            DB::commit();
            Log::info('🎉 [STEP 6 SUCCESS] Schedule fully created + Jitsi room', [
                'id' => $schedule->id,
                'jitsi_room_name' => $schedule->jitsi_room_name
            ]);

            return response()->json($schedule, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ [STEP 5 FAILED] Database error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'data' => $validated
            ]);
            return response()->json(['error' => 'فشل في الإنشاء: ' . $e->getMessage()], 500);
        }
    }

    private function calculateDuration($start, $end)
    {
        $start = DateTime::createFromFormat('H:i', $start);
        $end = DateTime::createFromFormat('H:i', $end);
        return $start->diff($end)->i;
    }

    // ✅ باقي الـ methods محدثة ✅ $appends في Model مش محتاج append
    public function myCenterSchedules(Request $request)
    {
        Log::info('🔍 myCenterSchedules - START', ['user_id' => Auth::id()]);

        $centerId = auth()->user()->center_id;
        Log::info('📍 Center ID found', ['center_id' => $centerId]);

        $schedules = PlanCircleSchedule::with([
                'plan:id,plan_name,center_id',
                'circle:id,name',
                'teacher:id,name',
            ])
            ->whereHas('plan', fn($q) => $q->where('center_id', $centerId))
            ->where('is_available', true)
            ->orderBy('schedule_date')
            ->orderBy('start_time')
            ->paginate(15);

        Log::info('✅ myCenterSchedules - SUCCESS مع Jitsi', [
            'count' => $schedules->count(),
            'center_id' => $centerId
        ]);

        return response()->json($schedules);
    }

    public function index(Request $request, $planId)
    {
        Log::info('🔍 PlanCircleSchedule index', ['plan_id' => $planId]);

        $query = PlanCircleSchedule::with([
                'plan:id,plan_name,center_id',
                'circle:id,name',
                'teacher:id,name',
            ])
            ->where('plan_id', $planId)
            ->where('is_available', true);

        if ($request->filled('circle_id')) {
            $query->where('circle_id', $request->circle_id);
            Log::info('🔍 Filtered by circle', ['circle_id' => $request->circle_id]);
        }

        $schedules = $query->orderBy('schedule_date')
            ->orderBy('start_time')
            ->paginate(15);

        Log::info('✅ Schedules loaded مع Jitsi', [
            'count' => $schedules->count(),
            'plan_id' => $planId
        ]);

        return response()->json($schedules);
    }

    // ✅ إصلاح show() - Single object مش pagination
    public function show(PlanCircleSchedule $planCircleSchedule)
    {
        Log::info('👁️ Viewing schedule', ['id' => $planCircleSchedule->id]);

        // ✅ تأكد من وجود الـ schedule
        if (!$planCircleSchedule) {
            Log::error('❌ Schedule not found', ['id' => $planCircleSchedule->id]);
            return response()->json(['error' => 'الموعد غير موجود'], 404);
        }

        $schedule = $planCircleSchedule
            ->loadCount('bookings')
            ->load(['plan:id,plan_name', 'circle:id,name', 'teacher:id,name']);

        Log::info('✅ [SHOW] Single schedule مع Jitsi', [
            'id' => $schedule->id,
            'jitsi_room_name' => $schedule->jitsi_room_name ?? 'غير موجود',
            'jitsi_url' => $schedule->jitsi_url ?? 'غير موجود'
        ]);

        return response()->json($schedule); // ✅ Single object مش pagination
    }

    public function update(Request $request, PlanCircleSchedule $planCircleSchedule)
    {
        Log::info('✏️ Updating schedule', [
            'id' => $planCircleSchedule->id,
            'data' => $request->all()
        ]);

        $validated = $request->validate([
            'circle_id' => 'sometimes|exists:circles,id',
            'teacher_id' => 'nullable|sometimes|exists:users,id',
            'schedule_date' => 'sometimes|date|after_or_equal:today',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'duration_minutes' => 'sometimes|integer|min:15|max:300',
            'max_students' => 'nullable|sometimes|integer|min:1|max:100',
            'is_available' => 'sometimes|boolean',
            'notes' => 'nullable|sometimes|string|max:1000',
            'jitsi_room_name' => 'nullable|sometimes|string|max:50|unique:plan_circle_schedules,jitsi_room_name,' . $planCircleSchedule->id,
        ]);

        // ✅ تحديث duration تلقائياً لو اتغيرت الأوقات
        if (isset($validated['start_time']) && isset($validated['end_time'])) {
            $validated['duration_minutes'] = $this->calculateDuration($validated['start_time'], $validated['end_time']);
        }

        $planCircleSchedule->update($validated);

        $planCircleSchedule->refresh();
        $planCircleSchedule->load(['plan:id,plan_name', 'circle:id,name', 'teacher:id,name']);

        Log::info('✅ Schedule updated مع Jitsi check', [
            'id' => $planCircleSchedule->id,
            'jitsi_room_name' => $planCircleSchedule->jitsi_room_name
        ]);

        return response()->json($planCircleSchedule);
    }

    // ✅ 🔥 إضافة regenerateJitsiRoom method
    public function regenerateJitsiRoom(PlanCircleSchedule $planCircleSchedule)
    {
        Log::info('🔄 Regenerating Jitsi room', ['schedule_id' => $planCircleSchedule->id]);

        // ✅ إعادة توليد Jitsi room name جديد وفريد
        $planCircleSchedule->generateUniqueJitsiRoom();
        $planCircleSchedule->save();

        Log::info('✅ Jitsi room regenerated successfully', [
            'id' => $planCircleSchedule->id,
            'old_room' => request()->old_jitsi_room ?? 'N/A',
            'new_room' => $planCircleSchedule->jitsi_room_name,
            'jitsi_url' => $planCircleSchedule->jitsi_url
        ]);

        return response()->json([
            'message' => 'تم إنشاء غرفة Jitsi جديدة بنجاح',
            'jitsi_room_name' => $planCircleSchedule->jitsi_room_name,
            'jitsi_url' => $planCircleSchedule->jitsi_url
        ]);
    }

    public function destroy(PlanCircleSchedule $planCircleSchedule)
    {
        Log::info('🗑️ Deleting schedule', ['id' => $planCircleSchedule->id]);

        DB::transaction(function () use ($planCircleSchedule) {
            $planCircleSchedule->bookings()->delete();
            $planCircleSchedule->delete();
        });

        Log::info('✅ Schedule deleted', ['id' => $planCircleSchedule->id]);

        return response()->json(['message' => 'تم الحذف بنجاح']);
    }

    public function bookSlot(Request $request, $scheduleId)
    {
        Log::info('📅 Booking slot', ['schedule_id' => $scheduleId, 'student_id' => Auth::id()]);

        $schedule = PlanCircleSchedule::findOrFail($scheduleId);

        if (!$schedule->hasAvailability()) {
            Log::warning('⚠️ Slot not available', [
                'schedule_id' => $scheduleId,
                'booked_students' => $schedule->booked_students,
                'max_students' => $schedule->max_students
            ]);
            return response()->json(['message' => 'الوقت غير متاح'], 400);
        }

        DB::transaction(function () use ($schedule) {
            CircleStudentBooking::create([
                'plan_circle_schedule_id' => $schedule->id,
                'student_id' => Auth::id(),
                'status' => 'confirmed',
                'total_days' => $schedule->plan->details_count ?? 30,
            ]);

            $schedule->increment('booked_students');
        });

        Log::info('✅ Slot booked successfully', ['schedule_id' => $scheduleId]);

        return response()->json(['message' => 'تم الحجز بنجاح!']);
    }
}

