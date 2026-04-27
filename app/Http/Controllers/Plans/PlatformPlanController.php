<?php

namespace App\Http\Controllers\Plans;

use App\Http\Controllers\Controller;
use App\Models\Plans\Plan;
use App\Models\Plans\PlanDetail;
use App\Models\Plans\PlatformPlan;
use App\Models\Plans\PlatformPlanDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlatformPlanController extends Controller
{
    // ============================================================
    //  خطط المنصة — قراءة (للكل)
    // ============================================================

    /** GET /api/v1/platform-plans */
    public function index(Request $request): JsonResponse
    {
        $query = PlatformPlan::active()
            ->withCount('details')
            ->orderByDesc('is_featured')
            ->orderBy('title');

        $plans = $query->paginate(20);
        return response()->json($plans);
    }

    /** GET /api/v1/platform-plans/{plan} */
    public function show(PlatformPlan $plan): JsonResponse
    {
        $plan->load('creator:id,name');
        $plan->loadCount('details');
        return response()->json($plan);
    }

    /** GET /api/v1/platform-plans/{plan}/details */
    public function details(PlatformPlan $plan): JsonResponse
    {
        $details = $plan->details()->paginate(50);
        return response()->json($details);
    }

    // ============================================================
    //  نسخ خطة المنصة إلى مجمع
    // ============================================================

    /** POST /api/v1/platform-plans/{plan}/use */
    public function usePlan(Request $request, PlatformPlan $plan): JsonResponse
    {
        $user = Auth::user();

        if (!$user->center_id) {
            return response()->json(['message' => 'لا يوجد مجمع مرتبط بحسابك'], 403);
        }

        if ($plan->details()->count() === 0) {
            return response()->json(['message' => 'هذه الخطة لا تحتوي على تفاصيل بعد'], 422);
        }

        DB::beginTransaction();
        try {
            $newPlan = Plan::create([
                'plan_name'    => $plan->title,
                'center_id'    => $user->center_id,
                'total_months' => max(1, (int) ceil($plan->duration_days / 30)),
            ]);

            $insertData = $plan->details->map(fn($d) => [
                'plan_id'             => $newPlan->id,
                'day_number'          => $d->day_number,
                'new_memorization'    => $d->new_memorization,
                'review_memorization' => $d->review_memorization,
                'status'              => 'pending',
                'created_at'          => now(),
                'updated_at'          => now(),
            ])->toArray();

            PlanDetail::insert($insertData);
            $plan->increment('used_count');

            DB::commit();

            return response()->json([
                'message'    => 'تم نسخ الخطة إلى مجمعك بنجاح!',
                'plan_id'    => $newPlan->id,
                'plan_name'  => $newPlan->plan_name,
                'days_count' => count($insertData),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("usePlan error: " . $e->getMessage());
            return response()->json(['message' => 'حدث خطأ أثناء نسخ الخطة'], 500);
        }
    }

    // ============================================================
    //  إدارة خطط المنصة — للأدمن فقط
    // ============================================================

    /** POST /api/v1/admin/platform-plans */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'is_active'   => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $plan = PlatformPlan::create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);

        return response()->json($plan, 201);
    }

    /** PUT /api/v1/admin/platform-plans/{plan} */
    public function update(Request $request, PlatformPlan $plan): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|string|max:200',
            'description' => 'nullable|string|max:1000',
            'is_active'   => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $plan->update($validated);
        return response()->json($plan);
    }

    /** DELETE /api/v1/admin/platform-plans/{plan} */
    public function destroy(PlatformPlan $plan): JsonResponse
    {
        $plan->delete();
        return response()->json(['message' => 'تم الحذف بنجاح']);
    }

    // ============================================================
    //  تفاصيل الأيام — للأدمن
    // ============================================================

    /** POST /api/v1/admin/platform-plans/{plan}/details */
    public function addDetail(Request $request, PlatformPlan $plan): JsonResponse
    {
        $validated = $request->validate([
            'day_number'          => 'required|integer|min:1|max:9999',
            'new_memorization'    => 'nullable|string|max:500',
            'review_memorization' => 'nullable|string|max:500',
            'verse_from'          => 'nullable|integer|min:1',
            'verse_to'            => 'nullable|integer|min:1',
            'notes'               => 'nullable|string|max:500',
        ]);

        $exists = $plan->details()
            ->where('day_number', $validated['day_number'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => "اليوم {$validated['day_number']} موجود بالفعل في هذه الخطة",
            ], 422);
        }

        $detail = $plan->details()->create($validated);

        $plan->update([
            'duration_days' => $plan->details()->max('day_number'),
        ]);

        return response()->json($detail, 201);
    }

    /** PUT /api/v1/admin/platform-plans/details/{detail} */
    public function updateDetail(Request $request, PlatformPlanDetail $detail): JsonResponse
    {
        $validated = $request->validate([
            'new_memorization'    => 'nullable|string|max:500',
            'review_memorization' => 'nullable|string|max:500',
            'verse_from'          => 'nullable|integer|min:1',
            'verse_to'            => 'nullable|integer|min:1',
            'notes'               => 'nullable|string|max:500',
        ]);

        $detail->update($validated);
        return response()->json($detail);
    }

    /** DELETE /api/v1/admin/platform-plans/details/{detail} */
    public function deleteDetail(PlatformPlanDetail $detail): JsonResponse
    {
        $planId = $detail->platform_plan_id;
        $detail->delete();

        $maxDay = PlatformPlanDetail::where('platform_plan_id', $planId)->max('day_number');
        PlatformPlan::where('id', $planId)->update(['duration_days' => $maxDay ?? 0]);

        return response()->json(['message' => 'تم الحذف بنجاح']);
    }

    /** DELETE /api/v1/admin/platform-plans/details/bulk-delete */
    public function bulkDeleteDetails(Request $request): JsonResponse
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:platform_plan_details,id',
        ]);

        $deleted = PlatformPlanDetail::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => "تم حذف {$deleted} يوم بنجاح",
            'deleted' => $deleted,
        ]);
    }

    /** POST /api/v1/admin/platform-plans/{plan}/bulk-import */
    public function bulkImport(Request $request, PlatformPlan $plan): JsonResponse
    {
        $request->validate([
            'details'                       => 'required|array|min:1',
            'details.*.day_number'          => 'required|integer|min:1',
            'details.*.new_memorization'    => 'nullable|string|max:500',
            'details.*.review_memorization' => 'nullable|string|max:500',
            'details.*.notes'               => 'nullable|string|max:500',
            'details.*.verse_from'          => 'nullable|integer|min:1',
            'details.*.verse_to'            => 'nullable|integer|min:1',
        ]);

        $imported = 0;
        $skipped  = 0;

        DB::beginTransaction();
        try {
            foreach ($request->details as $row) {
                $exists = $plan->details()
                    ->where('day_number', $row['day_number'])
                    ->exists();

                if ($exists) { $skipped++; continue; }

                $plan->details()->create([
                    'day_number'          => $row['day_number'],
                    'new_memorization'    => $row['new_memorization']    ?? null,
                    'review_memorization' => $row['review_memorization'] ?? null,
                    'notes'               => $row['notes']               ?? null,
                    'verse_from'          => $row['verse_from']          ?? null,
                    'verse_to'            => $row['verse_to']            ?? null,
                ]);
                $imported++;
            }

            $plan->update([
                'duration_days' => $plan->details()->max('day_number') ?? 0,
            ]);

            DB::commit();

            $msg = "تم استيراد {$imported} يوم بنجاح";
            if ($skipped) $msg .= " (تم تخطي {$skipped} مكرر)";

            return response()->json([
                'message'  => $msg,
                'imported' => $imported,
                'skipped'  => $skipped,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("bulkImport error: " . $e->getMessage());
            return response()->json(['message' => 'حدث خطأ أثناء الاستيراد'], 500);
        }
    }
}