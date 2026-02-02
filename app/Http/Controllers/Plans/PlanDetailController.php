<?php

namespace App\Http\Controllers\Plans;

use App\Models\Plans\Plan;
use Illuminate\Http\Request;
use App\Models\Plans\PlanDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class PlanDetailController extends Controller
{
    /**
     * عرض تفاصيل خطة
     */
    public function index(Plan $plan): JsonResponse
    {
        $details = $plan->details()
            ->orderBy('day_number')
            ->paginate(30);

        Log::info('📋 Plan ' . $plan->id . ' details viewed: ' . $details->total());
        return response()->json($details);
    }

    /**
     * إنشاء تفاصيل جديدة للخطة
     */
    public function store(Request $request, Plan $plan): JsonResponse
    {
        $request->validate([
            'day_number' => 'required|integer|min:1|unique:plan_details,day_number,NULL,id,plan_id,' . $plan->id,
            'new_memorization' => 'nullable|string|max:50',
            'review_memorization' => 'nullable|string|max:50',
            'status' => 'nullable|in:pending,current,completed'
        ]);

        $detail = $plan->details()->create($request->only([
            'day_number',
            'new_memorization',
            'review_memorization',
            'status'
        ]));

        Log::info('➕ PlanDetail created: ' . $detail->id . ' for plan: ' . $plan->id);
        return response()->json($detail, 201);
    }

    /**
     * عرض تفصيل واحد
     */
    public function show(PlanDetail $planDetail): JsonResponse
    {
        $planDetail->load('plan.center:id,name');
        Log::info('👁️ PlanDetail viewed: ' . $planDetail->id);
        return response()->json($planDetail);
    }

    /**
     * تحديث حالة التفصيل
     */
    public function updateStatus(Request $request, PlanDetail $planDetail): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,current,completed'
        ]);

        $planDetail->update(['status' => $request->status]);

        Log::info('✏️ PlanDetail status updated: ' . $planDetail->id . ' → ' . $request->status);
        return response()->json($planDetail->fresh());
    }

    /**
     * تحديث تفاصيل كاملة
     */
    public function update(Request $request, PlanDetail $planDetail): JsonResponse
    {
        $request->validate([
            'day_number' => 'sometimes|integer|min:1',
            'new_memorization' => 'sometimes|string|max:50',
            'review_memorization' => 'sometimes|string|max:50',
            'status' => 'sometimes|in:pending,current,completed'
        ]);

        $planDetail->update($request->only([
            'day_number',
            'new_memorization',
            'review_memorization',
            'status'
        ]));

        Log::info('✏️ PlanDetail updated: ' . $planDetail->id);
        return response()->json($planDetail->fresh());
    }

    /**
     * حذف تفصيل
     */
    public function destroy(PlanDetail $planDetail): JsonResponse
    {
        $planDetail->delete();
        Log::info('🗑️ PlanDetail deleted: ' . $planDetail->id);

        return response()->json(['message' => 'تم الحذف بنجاح']);
    }
}
