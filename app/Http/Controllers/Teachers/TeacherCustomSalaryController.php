<?php

namespace App\Http\Controllers\Teachers;

use Carbon\Carbon;
use App\Models\Auth\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Teachers\TeacherCustomSalary;

class TeacherCustomSalaryController extends Controller
{
    /**
     * 🔥 عرض المرتبات المخصصة لمركزك بس
     */
    public function index(Request $request)
    {
        $userCenterId = Auth::user()->center_id;

        Log::info('🔍 Custom Salaries - Center Filter', [
            'user_id' => Auth::id(),
            'center_id' => $userCenterId
        ]);

        $query = TeacherCustomSalary::with(['teacher.user'])
            ->whereHas('teacher.user', function ($q) use ($userCenterId) {
                $q->where('center_id', $userCenterId);
            })
            ->when($request->teacher_id, fn($q, $id) => $q->where('teacher_id', $id))
            ->when($request->search, function ($q, $search) use ($userCenterId) {
                $q->whereHas('teacher.user', function ($subQ) use ($search, $userCenterId) {
                    $subQ->where('name', 'like', "%{$search}%")
                         ->where('center_id', $userCenterId);
                })->orWhereHas('teacher', fn($subQ) => $subQ->where('name', 'like', "%{$search}%"));
            })
            ->when($request->is_active, fn($q, $active) => $q->where('is_active', $active))
            ->orderBy('created_at', 'desc');

        $salaries = $request->has('page') ? $query->paginate(15) : $query->get();

        return response()->json([
            'success' => true,
            'data' => $salaries,
            'stats' => [
                'total_custom'              => $salaries->count(),
                'active_custom'             => $salaries->where('is_active', 1)->count(),
                'center_id'                 => $userCenterId,
                'your_center_teachers_count' => Teacher::whereHas('user', fn($q) => $q->where('center_id', $userCenterId))->count(),
            ]
        ]);
    }

    /**
     * 🔥 إنشاء راتب مخصص (مركزك بس) — الخصم الافتراضي = 0
     */
    public function store(Request $request)
    {
        $userCenterId = Auth::user()->center_id;

        $validated = $request->validate([
            'teacher_id'         => 'required|exists:teachers,id',
            'user_id'            => 'nullable|exists:users,id',
            'custom_base_salary' => 'required|numeric|min:1',
            'currency'           => 'nullable|in:SAR,EGP,USD',
            'notes'              => 'nullable|string|max:500',
            'is_active'          => 'boolean',
        ]);

        // 🔥 فلترة المعلم: مركزك بس
        $teacher = Teacher::where('id', $validated['teacher_id'])
            ->whereHas('user', fn($q) => $q->where('center_id', $userCenterId))
            ->first();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'هذا المعلم غير موجود في مركزك'
            ], 403);
        }

        // منع التكرار
        $existingActive = TeacherCustomSalary::where('teacher_id', $validated['teacher_id'])
            ->where('is_active', 1)
            ->first();

        if ($existingActive) {
            return response()->json([
                'success' => false,
                'message' => 'يوجد راتب مخصص نشط لهذا المعلم بالفعل'
            ], 409);
        }

        $salary = TeacherCustomSalary::create([
            'teacher_id'         => $validated['teacher_id'],
            'user_id'            => Auth::id(),
            'custom_base_salary' => $validated['custom_base_salary'],
            'currency'           => $validated['currency'] ?? 'SAR',
            'deductions'         => 0, // ✅ الخصم الافتراضي = 0 دائماً
            'notes'              => $validated['notes'] ?? null,
            'is_active'          => $validated['is_active'] ?? 1,
            'created_by'         => Auth::id(),
            'center_id'          => $userCenterId,
        ]);

        Log::info('✅ راتب مخصص جديد', [
            'salary_id'  => $salary->id,
            'teacher_id' => $validated['teacher_id'],
            'user_id'    => Auth::id(),
            'center_id'  => $userCenterId,
            'amount'     => $validated['custom_base_salary'],
            'currency'   => $validated['currency'] ?? 'SAR',
        ]);

        return response()->json([
            'success' => true,
            'data'    => $salary->load(['teacher.user']),
            'message' => 'تم إنشاء الراتب المخصص بنجاح'
        ], 201);
    }

    /**
     * 🔥 عرض راتب مخصص واحد (مركزك بس)
     */
    public function show($id)
    {
        $userCenterId = Auth::user()->center_id;

        $salary = TeacherCustomSalary::with(['teacher.user'])
            ->whereHas('teacher.user', fn($q) => $q->where('center_id', $userCenterId))
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $salary
        ]);
    }

    /**
     * 🔥 تعديل راتب مخصص (مركزك بس)
     */
    public function update(Request $request, $id)
    {
        $userCenterId = Auth::user()->center_id;

        $salary = TeacherCustomSalary::whereHas('teacher.user', fn($q) => $q->where('center_id', $userCenterId))
            ->findOrFail($id);

        $validated = $request->validate([
            'custom_base_salary' => 'sometimes|numeric|min:1',
            'currency'           => 'sometimes|in:SAR,EGP,USD',
            'deductions'         => 'sometimes|numeric|min:0', // يقدر المدير يخصم يدوياً
            'notes'              => 'nullable|string|max:500',
            'is_active'          => 'boolean',
        ]);

        if (isset($validated['is_active']) && !$validated['is_active']) {
            $latestSalary = TeacherCustomSalary::where('teacher_id', $salary->teacher_id)
                ->where('id', '!=', $id)
                ->whereHas('teacher.user', fn($q) => $q->where('center_id', $userCenterId))
                ->orderBy('created_at', 'desc')
                ->first();

            if ($latestSalary) {
                $latestSalary->update(['is_active' => 1]);
            }
        }

        $salary->update($validated);
        $salary->refresh();

        Log::info('✅ تحديث راتب مخصص', [
            'salary_id'  => $id,
            'center_id'  => $userCenterId,
            'new_amount' => $salary->custom_base_salary,
            'currency'   => $salary->currency,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $salary->load(['teacher.user']),
            'message' => 'تم تحديث الراتب المخصص بنجاح'
        ]);
    }

    /**
     * 🔥 حذف راتب مخصص (مركزك بس)
     */
    public function destroy($id)
    {
        $userCenterId = Auth::user()->center_id;

        $salary = TeacherCustomSalary::whereHas('teacher.user', fn($q) => $q->where('center_id', $userCenterId))
            ->findOrFail($id);

        $salary->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم الحذف بنجاح'
        ]);
    }

    /**
     * 🔥 تفعيل/إلغاء تفعيل (مركزك بس)
     */
    public function toggleActive($id)
    {
        $userCenterId = Auth::user()->center_id;

        $salary = TeacherCustomSalary::whereHas('teacher.user', fn($q) => $q->where('center_id', $userCenterId))
            ->findOrFail($id);

        TeacherCustomSalary::where('teacher_id', $salary->teacher_id)
            ->whereHas('teacher.user', fn($q) => $q->where('center_id', $userCenterId))
            ->where('id', '!=', $id)
            ->update(['is_active' => 0]);

        $salary->update(['is_active' => !$salary->is_active]);

        return response()->json([
            'success' => true,
            'data'    => $salary->load(['teacher.user']),
            'message' => $salary->is_active ? 'تم تفعيل الراتب المخصص' : 'تم إلغاء تفعيله'
        ]);
    }

    /**
     * 🔥 آخر راتب نشط لمعلم معين (مركزك بس)
     */
    public function getActiveForTeacher($teacherId)
    {
        $userCenterId = Auth::user()->center_id;

        $activeSalary = TeacherCustomSalary::where('teacher_id', $teacherId)
            ->whereHas('teacher.user', fn($q) => $q->where('center_id', $userCenterId))
            ->where('is_active', 1)
            ->orderBy('created_at', 'desc')
            ->first();

        return response()->json([
            'success'           => true,
            'data'              => $activeSalary,
            'has_custom_salary' => !!$activeSalary
        ]);
    }
}