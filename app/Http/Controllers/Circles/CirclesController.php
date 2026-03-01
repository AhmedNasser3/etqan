<?php

namespace App\Http\Controllers\Circles;

use App\Models\Tenant\Circle;
use App\Models\Tenant\Center;
use App\Models\Tenant\Mosque;
use App\Models\Auth\Teacher;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class CirclesController extends Controller
{
    /**
     * عرض قائمة الحلقات  محدث
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

        $query = Circle::with(['center', 'mosque', 'teacher']) //  شيلنا students
            ->where('center_id', $user->center_id);

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhereHas('center', function($q) use ($request) {
                      $q->where('name', 'like', '%' . $request->search . '%');
                  })
                  ->orWhereHas('mosque', function($q) use ($request) {
                      $q->where('name', 'like', '%' . $request->search . '%');
                  })
                  ->orWhereHas('teacher', function($q) use ($request) {
                      $q->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $circles = $query->paginate(15);

        Log::info('📊 Total circles for center ' . $user->center_id . ': ' . $circles->total());

        return response()->json($circles);
    }

    /**
     * عرض حلقة واحدة محددة  مصحح - شيلنا students!
     */
    public function show(Circle $circle): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        if ($isCenterOwner && $circle->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        if (!$isCenterOwner && $circle->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        //  شيلنا students - ده اللي كان بيسبب Error 500!
        $circle->load(['center', 'mosque', 'teacher']);

        Log::info('👁️ Circle viewed: ' . $circle->id . ' by user: ' . $user->id);

        return response()->json($circle);
    }

    /**
     * إنشاء حلقة جديدة  محدث
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        $rules = [
            'name' => 'required|string|max:255',
            'teacher_id' => 'nullable|exists:teachers,id',
            'mosque_id' => 'nullable|exists:mosques,id'
        ];

        if ($isCenterOwner) {
            $rules['center_id'] = 'required|in:' . $user->center_id;
        } else {
            $rules['center_id'] = 'required|exists:centers,id';
        }

        $request->validate($rules);

        $circle = Circle::create($request->all());
        Log::info(' Circle created: ' . $circle->id . ' by user: ' . $user->id);

        return response()->json([
            'message' => 'تم إنشاء الحلقة بنجاح',
            'data' => $circle->load(['center', 'mosque', 'teacher']) //  شيلنا students
        ], 201);
    }

    /**
     * تعديل حلقة موجودة  محدث
     */
    public function update(Request $request, Circle $circle): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        if ($isCenterOwner && $circle->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        if (!$isCenterOwner && $circle->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'teacher_id' => 'nullable|exists:teachers,id',
            'mosque_id' => 'nullable|exists:mosques,id'
        ];

        if ($isCenterOwner) {
            $rules['center_id'] = ['sometimes', 'required', 'in:' . $user->center_id];
        } else {
            $rules['center_id'] = 'sometimes|required|exists:centers,id';
        }

        $request->validate($rules);

        $circle->update($request->except(['_method', '_token']));
        Log::info(' Circle updated: ' . $circle->id . ' by user: ' . $user->id);

        return response()->json([
            'message' => 'تم تعديل الحلقة بنجاح',
            'data' => $circle->fresh()->load(['center', 'mosque', 'teacher']) //  شيلنا students
        ]);
    }

    /**
     * حذف حلقة
     */
    public function destroy(Circle $circle): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        if (($isCenterOwner || !$user->center_id) && $circle->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        Log::info('🗑️ Deleting Circle: ' . $circle->id . ' by user: ' . $user->id);
        $circle->delete();

        return response()->json(['message' => 'تم حذف الحلقة بنجاح']);
    }

    /**
     * جلب مجمعات المستخدم
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
     * جلب مساجد مجمع معين
     */
    public function getCenterMosques(Center $center): JsonResponse
    {
        $user = Auth::user();

        if ($user && $user->role && $user->role->id == 1 && $center->id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $mosques = Mosque::where('center_id', $center->id)
                        ->select('id', 'name')
                        ->get();

        Log::info('🕌 Mosques for center ' . $center->id . ': ' . $mosques->count());

        return response()->json(['data' => $mosques]);
    }

    /**
     * جلب معلمي مجمع معين
     */
    public function getCenterTeachers(Center $center): JsonResponse
    {
        $user = Auth::user();

        if ($user && $user->role && $user->role->id == 1 && $center->id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $teachers = Teacher::where('center_id', $center->id)
                         ->with('user')
                         ->select('id', 'name', 'role', 'center_id')
                         ->get();

        Log::info('👨‍🏫 Teachers for center ' . $center->id . ': ' . $teachers->count());

        return response()->json(['data' => $teachers]);
    }
}
