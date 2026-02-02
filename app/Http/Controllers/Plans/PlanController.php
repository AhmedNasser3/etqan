<?php

namespace App\Http\Controllers\Plans;


use App\Models\Auth\User;
use App\Models\Plans\Plan;
use Illuminate\Http\Request;
use App\Models\Tenant\Center;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class PlanController extends Controller
{
    /**
     * عرض خطط المجمعات
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        Log::info('👤 User ID: ' . ($user?->id ?? 'GUEST'));

        $query = Plan::with(['center:id,name', 'details' => function($q) {
            $q->select('id', 'plan_id', 'day_number', 'status')
              ->latest('day_number');
        }])->withCount('details');

        // صاحب المجمع يشوف خططه بس
        if ($user && $user->role && $user->role->id == 1) {
            Log::info('🏢 Center Owner - center_id: ' . $user->center_id);
            $query->where('center_id', $user->center_id);
        }

        $plans = $query->paginate(15);
        Log::info('📊 Total plans: ' . $plans->total());

        return response()->json($plans);
    }

    /**
     * عرض خطط مجمع معيّن
     */
    public function indexByCenter($centerId, Request $request): JsonResponse
    {
        $user = Auth::user();

        // تحقق من صلاحية المجمع
        if ($user && $user->role && $user->role->id == 1 && $user->center_id != $centerId) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $query = Plan::withCount('details')->where('center_id', $centerId);
        $plans = $query->paginate(15);

        Log::info('📊 Center ' . $centerId . ' plans: ' . $plans->total());
        return response()->json($plans);
    }

    /**
     * إنشاء خطة جديدة
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        $request->validate([
            'center_id' => 'required|exists:centers,id',
            'plan_name' => 'required|string|max:255',
            'total_months' => 'required|integer|min:1|max:36'
        ]);

        // صاحب المجمع ينشئ لمجمعة بس
        if ($user && $user->role && $user->role->id == 1 && $user->center_id != $request->center_id) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $plan = Plan::create($request->only(['center_id', 'plan_name', 'total_months']));

        Log::info('➕ New plan created: ' . $plan->id . ' for center: ' . $request->center_id);
        return response()->json($plan->load('center'), 201);
    }

    /**
     * عرض خطة واحدة
     */
    public function show(Plan $plan): JsonResponse
    {
        $plan->load(['center:id,name', 'details' => function($q) {
            return $q->orderBy('day_number');
        }]);

        Log::info('👁️ Plan viewed: ' . $plan->id);
        return response()->json($plan);
    }

    /**
     * تحديث خطة
     */
    public function update(Request $request, Plan $plan): JsonResponse
    {
        $user = Auth::user();

        // تحقق الصلاحية
        if ($user && $user->role && $user->role->id == 1 && $user->center_id != $plan->center_id) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $request->validate([
            'plan_name' => 'sometimes|string|max:255',
            'total_months' => 'sometimes|integer|min:1|max:36'
        ]);

        $plan->update($request->only(['plan_name', 'total_months']));

        Log::info('✏️ Plan updated: ' . $plan->id);
        return response()->json($plan->fresh());
    }

    /**
     * حذف خطة
     */
    public function destroy(Plan $plan): JsonResponse
    {
        $user = Auth::user();

        if ($user && $user->role && $user->role->id == 1 && $user->center_id != $plan->center_id) {
            return response()->json(['error' => 'غير مصرح'], 403);
        }

        $plan->delete();
        Log::info('🗑️ Plan deleted: ' . $plan->id);

        return response()->json(['message' => 'تم الحذف بنجاح']);
    }

    /**
     * الانتقال لليوم التالي
     */
    public function nextDay(Plan $plan): JsonResponse
    {
        $current = $plan->details()->where('status', 'current')->first();
        $next = $plan->details()->where('status', 'pending')->orderBy('day_number')->first();

        if ($current) {
            $current->update(['status' => 'completed']);
        }

        if ($next) {
            $next->update(['status' => 'current']);
        }

        Log::info('⏭️ Plan ' . $plan->id . ' moved to next day');
        return response()->json(['message' => 'تم تحديث اليوم الحالي']);
    }
}