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

class CirclesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        Log::info('👤 User ID: ' . ($user?->id ?? 'GUEST'));

        $query = Circle::with(['center', 'mosque', 'teacher']);

        if ($user && $user->role && $user->role->id == 1) {
            Log::info('🏢 Center Owner - center_id: ' . $user->center_id);
            $query->where('center_id', $user->center_id);
        }

        $circles = $query->paginate(15);
        Log::info('📊 Total circles: ' . $circles->total());

        return response()->json($circles);
    }

    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        if ($isCenterOwner) {
            $request->validate([
                'name' => 'required|string|max:255',
                'center_id' => 'required|in:' . $user->center_id,
                'teacher_id' => 'nullable|exists:teachers,id',
                'mosque_id' => 'nullable|exists:mosques,id'
            ]);
        } else {
            $request->validate([
                'name' => 'required|string|max:255',
                'center_id' => 'required|exists:centers,id',
                'teacher_id' => 'nullable|exists:teachers,id',
                'mosque_id' => 'nullable|exists:mosques,id'
            ]);
        }

        $circle = Circle::create($request->all());
        Log::info('✅ Circle created: ' . $circle->id . ' by user: ' . $user->id);

        return response()->json([
            'message' => 'تم إنشاء الحلقة بنجاح',
            'data' => $circle->load(['center', 'mosque', 'teacher'])
        ], 201);
    }

    public function show(Circle $circle): JsonResponse
    {
        $user = Auth::user();

        if ($user && $user->role && $user->role->id == 1 && $circle->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $circle->load(['center', 'mosque', 'teacher', 'students']);
        return response()->json($circle);
    }

    public function update(Request $request, Circle $circle): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $isCenterOwner = $user->role && $user->role->id == 1;

        if ($isCenterOwner) {
            if ($circle->center_id != $user->center_id) {
                return response()->json(['message' => 'غير مصرح'], 403);
            }

            $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'center_id' => 'in:' . $user->center_id,
                'teacher_id' => 'nullable|exists:teachers,id',
                'mosque_id' => 'nullable|exists:mosques,id'
            ]);
        } else {
            $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'center_id' => 'sometimes|required|exists:centers,id',
                'teacher_id' => 'nullable|exists:teachers,id',
                'mosque_id' => 'nullable|exists:mosques,id'
            ]);
        }

        $circle->update($request->except('_method'));
        Log::info('✅ Circle updated: ' . $circle->id . ' by user: ' . $user->id);

        return response()->json([
            'message' => 'تم تعديل الحلقة بنجاح',
            'data' => $circle->fresh()->load(['center', 'mosque', 'teacher'])
        ]);
    }

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

    public function getMosques(Request $request): JsonResponse
    {
        $mosques = Mosque::select('id', 'name', 'center_id')->get();
        Log::info('🕌 Total mosques: ' . $mosques->count());
        return response()->json(['data' => $mosques]);
    }

    public function getTeachers(Request $request): JsonResponse
    {
        $teachers = Teacher::select('id', 'name', 'role', 'center_id')->with('user')->get();
        Log::info('👨‍🏫 Total teachers: ' . $teachers->count());
        return response()->json(['data' => $teachers]);
    }

    public function destroy(Circle $circle): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        if ($user->role && $user->role->id == 1 && $circle->center_id != $user->center_id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        Log::info('🗑️ Deleting Circle: ' . $circle->id . ' by user: ' . $user->id);
        $circle->delete();

        return response()->json(['message' => 'تم حذف الحلقة بنجاح']);
    }
}