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
    // ── helper: يجيب center_id من auth أو من الـ portal header ──────────────
    private function resolveCenterId(Request $request): ?int
    {
        if (Auth::check() && Auth::user()->center_id) {
            return (int) Auth::user()->center_id;
        }

        $id = $request->header('X-Center-Id') ?? $request->query('center_id');
        return ($id && is_numeric($id)) ? (int) $id : null;
    }

public function index(Request $request): JsonResponse
{
    $centerId = $this->resolveCenterId($request);

    if (!$centerId) {
        return response()->json([
            'data' => [], 'current_page' => 1,
            'last_page' => 1, 'per_page' => 15, 'total' => 0,
        ], 403);
    }

    $query = Circle::with(['center', 'mosque', 'teacher.user'])
        ->where('center_id', $centerId);

    // ── لو portal: فلتر بالمسجد المحدد بس ───────────────────────────────
    $mosqueId = $request->header('X-Mosque-Id') ?? $request->query('mosque_id');
    if ($mosqueId && is_numeric($mosqueId)) {
        $query->where('mosque_id', (int) $mosqueId);
    }

    if ($request->filled('search')) {
        $query->where(function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->search . '%')
              ->orWhereHas('mosque', fn($q) => $q->where('name', 'like', '%' . $request->search . '%'))
              ->orWhereHas('teacher.user', fn($q) => $q->where('name', 'like', '%' . $request->search . '%'));
        });
    }

    return response()->json($query->paginate(15));
}
    public function show(Circle $circle): JsonResponse
    {
        $centerId = $this->resolveCenterId(request());

        if (!$centerId || $circle->center_id != $centerId) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        return response()->json($circle->load(['center', 'mosque', 'teacher.user']));
    }

    public function store(Request $request): JsonResponse
    {
        $centerId = $this->resolveCenterId($request);
        if (!$centerId) {
            return response()->json(['message' => 'غير مصرح'], 401);
        }

        $request->validate([
            'name'       => 'required|string|max:255',
            'teacher_id' => 'nullable|exists:teachers,id',
            'mosque_id'  => 'nullable|exists:mosques,id',
        ]);

        $circle = Circle::create([
            'name'       => $request->name,
            'center_id'  => $centerId,
            'teacher_id' => $request->teacher_id,
            'mosque_id'  => $request->mosque_id,
        ]);

        Log::info('✅ Circle created: ' . $circle->id);

        return response()->json([
            'message' => 'تم إنشاء الحلقة بنجاح',
            'data'    => $circle->load(['center', 'mosque', 'teacher.user']),
        ], 201);
    }

    public function update(Request $request, Circle $circle): JsonResponse
    {
        $centerId = $this->resolveCenterId($request);

        if (!$centerId || $circle->center_id != $centerId) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $request->validate([
            'name'       => 'sometimes|required|string|max:255',
            'teacher_id' => 'nullable|exists:teachers,id',
            'mosque_id'  => 'nullable|exists:mosques,id',
        ]);

        $circle->update($request->only(['name', 'teacher_id', 'mosque_id']));

        Log::info('✅ Circle updated: ' . $circle->id);

        return response()->json([
            'message' => 'تم تعديل الحلقة بنجاح',
            'data'    => $circle->fresh()->load(['center', 'mosque', 'teacher.user']),
        ]);
    }

    public function destroy(Circle $circle): JsonResponse
    {
        $centerId = $this->resolveCenterId(request());

        if (!$centerId || $circle->center_id != $centerId) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        Log::info('🗑️ Circle deleted: ' . $circle->id);
        $circle->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف الحلقة بنجاح']);
    }

    public function importRow(Request $request): JsonResponse
    {
        $centerId = $this->resolveCenterId($request);
        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $circleName  = trim($request->input('name', ''));
        $mosqueName  = trim($request->input('mosque_name', ''));
        $teacherName = trim($request->input('teacher_name', ''));

        if (empty($circleName)) {
            return response()->json(['success' => false, 'message' => 'اسم الحلقة مطلوب'], 422);
        }

        $mosque = null;
        if ($mosqueName) {
            $mosque = Mosque::where('center_id', $centerId)
                ->where('name', 'like', "%{$mosqueName}%")
                ->first();
            if (!$mosque) {
                return response()->json([
                    'success' => false,
                    'message' => "لم يُعثر على المسجد: {$mosqueName}",
                ], 422);
            }
        }

        $teacher = null;
        if ($teacherName) {
            $teacher = Teacher::whereHas('user', fn($q) => $q
                ->where('center_id', $centerId)
                ->where('name', 'like', "%{$teacherName}%")
            )->first();
            if (!$teacher) {
                return response()->json([
                    'success' => false,
                    'message' => "لم يُعثر على المعلم: {$teacherName}",
                ], 422);
            }
        }

        try {
            $circle = Circle::create([
                'name'       => $circleName,
                'center_id'  => $centerId,
                'mosque_id'  => $mosque?->id,
                'teacher_id' => $teacher?->id,
            ]);

            Log::info('📥 Circle imported: ' . $circle->id);

            return response()->json([
                'success' => true,
                'message' => 'تم إضافة الحلقة',
                'data'    => $circle,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function getCenters(Request $request): JsonResponse
    {
        $centerId = $this->resolveCenterId($request);

        if ($centerId) {
            $center = Center::select('id', 'name')->find($centerId);
            return response()->json(['data' => $center ? collect([$center]) : collect([])]);
        }

        return response()->json(['data' => Center::select('id', 'name')->get()]);
    }

    public function getCenterMosques(Center $center): JsonResponse
    {
        $centerId = $this->resolveCenterId(request());

        if ($centerId && $center->id != $centerId) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        return response()->json([
            'data' => Mosque::where('center_id', $center->id)->select('id', 'name')->get(),
        ]);
    }

    public function getCenterTeachers(Center $center): JsonResponse
    {
        $centerId = $this->resolveCenterId(request());

        if ($centerId && $center->id != $centerId) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $teachers = Teacher::whereHas('user', fn($q) => $q->where('center_id', $center->id))
            ->with('user:id,name,center_id')
            ->select('id', 'user_id')
            ->get()
            ->map(fn($t) => [
                'id'   => $t->id,
                'name' => $t->user?->name ?? 'غير محدد',
            ]);

        Log::info('👨‍🏫 Teachers for center ' . $center->id . ': ' . $teachers->count());

        return response()->json(['data' => $teachers]);
    }public function getMosques(Request $request)
{
    $centerId = Auth::user()?->center_id;

    if (!$centerId) {
        return response()->json([
            'success' => false,
            'message' => 'لا يوجد مركز مرتبط بالمستخدم'
        ], 400);
    }

    $mosques = Mosque::where('center_id', $centerId)
        ->select('id', 'name', 'supervisor_id')
        ->orderBy('name')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $mosques
    ]);
}

}
