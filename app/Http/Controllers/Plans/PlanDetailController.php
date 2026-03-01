<?php

namespace App\Http\Controllers\Plans;

use App\Models\Plans\Plan;
use Illuminate\Http\Request;
use App\Models\Plans\PlanDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PlanDetailController extends Controller
{
    /**
     * 1- خطط المجمع الخاص بي (للـ dropdown) - ✅ محدث مع total_months
     */
    public function myCenterPlans(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || !$user->center_id) {
                Log::warning('⚠️ User not authenticated or no center_id: ' . ($user->id ?? 'guest'));
                return response()->json([
                    'data' => [],
                    'message' => 'غير مصرح أو لا يوجد مجمع',
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 50,
                    'total' => 0
                ]);
            }

            Log::info('🔍 Searching plans for user: ' . $user->id . ', center: ' . $user->center_id);

            // 🔥 الحل النهائي - إضافة total_months و details_count
            $plans = Plan::where('center_id', $user->center_id)
                ->select([
                    'plans.id',
                    'plans.plan_name',
                    'plans.center_id',
                    'plans.total_months',    // ✅ الآن مضمون!
                    'plans.created_at'
                ])
                ->addSelect(DB::raw('(SELECT COUNT(*) FROM plan_details WHERE plan_details.plan_id = plans.id) as details_count'))
                ->with(['center:id,name'])
                ->orderBy('plan_name')
                ->paginate(50);

            // 🔥 تحويل مع ضمان الحقول
            $plansData = $plans->getCollection()->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'plan_name' => $plan->plan_name,
                    'center_id' => $plan->center_id,
                    'total_months' => $plan->total_months ?? 1,  // ✅ قيمة افتراضية
                    'details_count' => $plan->details_count ?? 0,
                    'center' => $plan->center,
                    'created_at' => $plan->created_at,
                ];
            });

            $plans->setCollection($plansData);

            Log::info('✅ Found ' . $plans->total() . ' plans for center: ' . $user->center_id);
            Log::info('📊 Plans with total_months: ', $plansData->toArray());

            return response()->json($plans);

        } catch (\Exception $e) {
            Log::error('❌ myCenterPlans error: ' . $e->getMessage());
            return response()->json([
                'data' => [],
                'message' => 'خطأ في تحميل الخطط',
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 50,
                'total' => 0
            ]);
        }
    }

    /**
     * 2- كل تفاصيل خطط المجمع (بدون plan_id)
     */
    public function allMyCenterPlansDetails(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !$user->center_id) {
            Log::warning('⚠️ No user or center_id for allMyCenterPlansDetails');
            return response()->json(['data' => [], 'total' => 0], 403);
        }

        Log::info('🔍 Fetching all details for center: ' . $user->center_id);

        $details = PlanDetail::whereHas('plan', function($q) use ($user) {
                $q->where('center_id', $user->center_id);
            })
            ->with('plan:id,plan_name,total_months,center_id')  // ✅ إضافة total_months
            ->orderBy('plan_id')
            ->orderBy('day_number')
            ->paginate(50);

        Log::info(' Found ' . $details->total() . ' details for center: ' . $user->center_id);
        return response()->json($details);
    }

    /**
     * 3- تفاصيل خطة محددة
     */
    public function index(Plan $plan): JsonResponse
    {
        if ($plan->center_id !== Auth::user()->center_id) {
            Log::warning('🚫 Unauthorized access - Plan: ' . $plan->id);
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $details = $plan->details()
            ->orderBy('day_number')
            ->paginate(30);

        Log::info('📋 Plan ' . $plan->id . ' details: ' . $details->total());
        return response()->json($details);
    }

    /**
     * 🔥 4- الحذف الجماعي (BULK DELETE) - الجديد المطلوب ✅
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !$user->center_id) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:plan_details,id'
        ]);

        $ids = $request->input('ids', []);

        // التحقق من أن كل IDs تخص نفس المركز
        $details = PlanDetail::whereIn('id', $ids)
            ->with('plan')
            ->get();

        foreach ($details as $detail) {
            if ($detail->plan->center_id !== $user->center_id) {
                return response()->json(['message' => 'بعض العناصر غير مصرح لك'], 403);
            }
        }

        try {
            DB::beginTransaction();

            // حذف جماعي سريع باستخدام whereIn
            $deletedCount = PlanDetail::whereIn('id', $ids)->delete();

            DB::commit();

            Log::info("🗑️ Bulk Delete - User: {$user->id}, Deleted: {$deletedCount}, IDs: " . implode(', ', $ids));

            return response()->json([
                'success' => true,
                'message' => 'تم الحذف الجماعي بنجاح',
                'deleted' => $deletedCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("❌ Bulk Delete Error - User: {$user->id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الحذف الجماعي',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 5- إنشاء PlanDetail
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'day_number' => 'required|integer|min:1',
            'new_memorization' => 'nullable|string|max:50',
            'review_memorization' => 'nullable|string|max:50',
            'status' => 'nullable|in:pending,current,completed'
        ]);

        $user = Auth::user();
        $plan = Plan::where('id', $request->plan_id)
            ->where('center_id', $user->center_id)
            ->first();

        if (!$plan) {
            return response()->json(['message' => 'الخطة غير موجودة أو غير مصرح لك'], 404);
        }

        $exists = PlanDetail::where('plan_id', $plan->id)
            ->where('day_number', $request->day_number)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'هذا اليوم موجود بالفعل'], 422);
        }

        $detail = PlanDetail::create([
            'plan_id' => $plan->id,
            'day_number' => $request->day_number,
            'new_memorization' => $request->new_memorization,
            'review_memorization' => $request->review_memorization,
            'status' => $request->status ?? 'pending'
        ]);

        Log::info('➕ Created PlanDetail: ' . $detail->id);
        return response()->json($detail, 201);
    }

    /**
     * 6- استيراد جماعي من Excel (BULK IMPORT)
     */
    public function bulkImport(Request $request, int $planId): JsonResponse
    {
        $user = Auth::user();

        $plan = Plan::where('id', $planId)
            ->where('center_id', $user->center_id)
            ->first();

        if (!$plan) {
            return response()->json(['message' => 'الخطة غير موجودة أو غير مصرح لك'], 404);
        }

        $request->validate([
            'details' => 'required|array|min:1',
            'details.*.day_number' => 'required|integer|min:1|max:9999',
            'details.*.new_memorization' => 'nullable|string|max:50',
            'details.*.review_memorization' => 'nullable|string|max:50',
            'details.*.status' => ['nullable', Rule::in(['pending', 'current', 'completed'])]
        ]);

        $detailsData = $request->input('details', []);
        $imported = 0;
        $skipped = 0;
        $errors = [];

        DB::beginTransaction();

        try {
            foreach ($detailsData as $index => $data) {
                $dayNumber = $data['day_number'];

                $exists = PlanDetail::where('plan_id', $planId)
                    ->where('day_number', $dayNumber)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    $errors[] = "اليوم {$dayNumber} موجود بالفعل";
                    continue;
                }

                PlanDetail::create([
                    'plan_id' => $planId,
                    'day_number' => $dayNumber,
                    'new_memorization' => $data['new_memorization'] ?? null,
                    'review_memorization' => $data['review_memorization'] ?? null,
                    'status' => $data['status'] ?? 'pending'
                ]);

                $imported++;
            }

            DB::commit();

            Log::info("📊 Bulk Import - Plan: {$planId}, Imported: {$imported}, Skipped: {$skipped}");

            return response()->json([
                'message' => 'تم الاستيراد بنجاح',
                'imported' => $imported,
                'skipped' => $skipped,
                'errors' => $errors
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("❌ Bulk Import Error - Plan: {$planId}: " . $e->getMessage());

            return response()->json([
                'message' => 'فشل في الاستيراد',
                'error' => $e->getMessage(),
                'imported' => $imported,
                'skipped' => $skipped
            ], 422);
        }
    }

    /**
     * عرض PlanDetail واحد
     */
    public function show(PlanDetail $planDetail): JsonResponse
    {
        $plan = Plan::find($planDetail->plan_id);
        if (!$plan || $plan->center_id !== Auth::user()->center_id) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $planDetail->load('plan:id,plan_name,center_id,total_months');
        return response()->json($planDetail);
    }

    /**
     * تحديث حالة PlanDetail
     */
    public function updateStatus(Request $request, PlanDetail $planDetail): JsonResponse
    {
        $plan = Plan::find($planDetail->plan_id);
        if (!$plan || $plan->center_id !== Auth::user()->center_id) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $request->validate(['status' => 'required|in:pending,current,completed']);
        $planDetail->update(['status' => $request->status]);
        return response()->json($planDetail->fresh());
    }

    /**
     * تحديث PlanDetail كامل
     */
    public function update(Request $request, PlanDetail $planDetail): JsonResponse
    {
        $plan = Plan::find($planDetail->plan_id);
        if (!$plan || $plan->center_id !== Auth::user()->center_id) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $request->validate([
            'day_number' => 'sometimes|integer|min:1|unique:plan_details,day_number,' . $planDetail->id . ',id,plan_id,' . $planDetail->plan_id,
            'new_memorization' => 'sometimes|string|max:50',
            'review_memorization' => 'sometimes|string|max:50',
            'status' => 'sometimes|in:pending,current,completed'
        ]);

        $planDetail->update($request->only([
            'day_number', 'new_memorization', 'review_memorization', 'status'
        ]));

        return response()->json($planDetail->fresh());
    }

    /**
     * حذف PlanDetail
     */
    public function destroy(PlanDetail $planDetail): JsonResponse
    {
        $plan = Plan::find($planDetail->plan_id);
        if (!$plan || $plan->center_id !== Auth::user()->center_id) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $planDetail->delete();
        Log::info('🗑️ Deleted PlanDetail: ' . $planDetail->id);
        return response()->json(['message' => 'تم الحذف بنجاح']);
    }
}
