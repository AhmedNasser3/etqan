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
     * عرض خطط المجمعات  محدث بنفس شروط Circles
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !$user->center_id) {
            return response()->json([
                'message' => 'غير مصرح لك بالوصول لهذه البيانات',
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 15,
                'total' => 0
            ], 403);
        }

        Log::info('👤 User ID: ' . $user->id . ' - Center ID: ' . $user->center_id);

        // ✅ الحل النهائي - select صريح + withCount بس
        $plans = Plan::select([
                'id',
                'plan_name',
                'center_id',
                'total_months',    // 🔥 ده اللي كان ناقص!
                'created_at'
            ])
            ->withCount('details as details_count')
            ->with('center:id,name')
            ->where('center_id', $user->center_id)
            ->paginate(15);

        Log::info('📊 Plans FULL data: ', $plans->items());

        return response()->json($plans);
    }

    /**
     * جلب مجمعات المستخدم  نفس طريقة Circles تماماً
     */
    public function getCenters(Request $request): JsonResponse
    {
        $user = Auth::user();
        Log::info('👤 Fetching centers for user: ' . ($user?->id ?? 'guest'));

        if ($user && $user->role && $user->role->id == 1 && $user->center_id) {
            $center = Center::select('id', 'name')->find($user->center_id);
            $centers = $center ? collect([$center]) : collect([]);
            Log::info('🏢 Center owner - single center: ' . $centers->count());
            return response()->json(['data' => $centers]);
        }

        $centers = Center::select('id', 'name')->get();
        Log::info('👑 Admin - all centers: ' . $centers->count());
        return response()->json(['data' => $centers]);
    }

    /**
     * عرض خطط مجمع معيّن  محدث
     */
    public function indexByCenter($centerId, Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user && $user->role && $user->role->id == 1 && $user->center_id != $centerId) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        // ✅ نفس التعديل هنا
        $plans = Plan::select([
                'id',
                'plan_name',
                'center_id',
                'total_months',
                'created_at'
            ])
            ->withCount('details as details_count')
            ->with('center:id,name')
            ->where('center_id', $centerId)
            ->paginate(15);

        Log::info('📊 Center ' . $centerId . ' plans: ' . $plans->total());
        return response()->json($plans);
    }

    /**
     * إنشاء خطة جديدة  محدث
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        $rules = [
            'plan_name' => 'required|string|max:255',
            'total_months' => 'required|integer|min:1|max:36'
        ];

        if ($isCenterOwner) {
            $rules['center_id'] = 'required|in:' . $user->center_id;
        } else {
            $rules['center_id'] = 'required|exists:centers,id';
        }

        $request->validate($rules);

        $plan = Plan::create($request->all());
        Log::info('✅ Plan created: ' . $plan->id . ' by user: ' . $user->id);

        return response()->json([
            'message' => 'تم إنشاء الخطة بنجاح',
            'data' => $plan->load(['center:id,name'])
        ], 201);
    }

    /**
     * عرض خطة واحدة  محدث
     */
    public function show(Plan $plan): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        if ($isCenterOwner && $plan->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        if (!$isCenterOwner && $plan->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $plan->load(['center:id,name', 'details' => function($q) {
            return $q->orderBy('day_number');
        }]);

        Log::info('👁️ Plan viewed: ' . $plan->id . ' by user: ' . $user->id);
        return response()->json($plan);
    }

    /**
     * تحديث خطة  محدث
     */
    public function update(Request $request, Plan $plan): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        if ($isCenterOwner && $plan->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        if (!$isCenterOwner && $plan->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $rules = [
            'plan_name' => 'sometimes|required|string|max:255',
            'total_months' => 'sometimes|required|integer|min:1|max:36'
        ];

        if ($isCenterOwner) {
            $rules['center_id'] = ['sometimes', 'required', 'in:' . $user->center_id];
        } else {
            $rules['center_id'] = 'sometimes|required|exists:centers,id';
        }

        $request->validate($rules);

        $plan->update($request->except(['_method', '_token']));
        Log::info('✅ Plan updated: ' . $plan->id . ' by user: ' . $user->id);

        return response()->json([
            'message' => 'تم تعديل الخطة بنجاح',
            'data' => $plan->fresh()->load(['center:id,name'])
        ]);
    }

    /**
     * حذف خطة  محدث
     */
    public function destroy(Plan $plan): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        if (($isCenterOwner || !$user->center_id) && $plan->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        Log::info('🗑️ Deleting Plan: ' . $plan->id . ' by user: ' . $user->id);
        $plan->delete();

        return response()->json(['message' => 'تم حذف الخطة بنجاح']);
    }

    /**
     * الانتقال لليوم التالي  محدث
     */
    public function nextDay(Plan $plan): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        if ($isCenterOwner && $plan->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $current = $plan->details()->where('status', 'current')->first();
        $next = $plan->details()->where('status', 'pending')->orderBy('day_number')->first();

        if ($current) {
            $current->update(['status' => 'completed']);
        }

        if ($next) {
            $next->update(['status' => 'current']);
        }

        Log::info('⏭️ Plan ' . $plan->id . ' moved to next day by user: ' . $user->id);
        return response()->json(['message' => 'تم تحديث اليوم الحالي']);
    }
}