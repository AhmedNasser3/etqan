<?php
// app/Http/Controllers/Teachers/TeacherSalaryController.php

namespace App\Http\Controllers\Teachers;

use App\Http\Controllers\Controller;
use App\Models\Teachers\TeacherSalary;
use Illuminate\Http\Request;

class TeacherSalaryController extends Controller
{
    /**
     * عرض رواتب الأدوار الخاصة بمركز اليوزر فقط
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $salaries = TeacherSalary::query()
            ->where('center_id', $user->center_id)  // ✅ مركز اليوزر إجباري
            ->when($user->mosque_id, fn($q) => $q->where('mosque_id', $user->mosque_id))  // مسجد اختياري
            ->orderBy('role')
            ->get()
            ->map(function ($salary) {
                return [
                    'id' => $salary->id,
                    'role' => $salary->role,
                    'role_ar' => $this->getRoleArabic($salary->role),
                    'center_id' => $salary->center_id,
                    'mosque_id' => $salary->mosque_id ?? 'جميع المساجد',
                    'base_salary' => $salary->base_salary,
                    'working_days' => $salary->working_days,
                    'daily_rate' => $salary->daily_rate,
                    'total_salary' => $salary->base_salary,
                    'notes' => $salary->notes,
                ];
            });

        return response()->json($salaries);
    }

    /**
     * إنشاء قاعدة راتب جديدة لدور معين
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $request->validate([
            'role' => 'required|in:teacher,supervisor,motivator,student_affairs,financial',
            'base_salary' => 'required|numeric|min:0',
            'working_days' => 'required|integer|min:1|max:31',
            'daily_rate' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        // ✅ التأكد من عدم وجود قاعدة مسبقة لنفس الدور في نفس المركز (مسجد اختياري)
        $exists = TeacherSalary::where('role', $request->role)
            ->where('center_id', $user->center_id)
            ->when($user->mosque_id, fn($q) => $q->where('mosque_id', $user->mosque_id))
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'يوجد قاعدة راتب مسجلة لهذا الدور في مركزك بالفعل'], 422);
        }

        $salary = TeacherSalary::create([
            'role' => $request->role,
            'center_id' => $user->center_id,                    // ✅ إجباري
            'mosque_id' => $user->mosque_id ?? null,            // ✅ اختياري
            'base_salary' => $request->base_salary,
            'working_days' => $request->working_days,
            'daily_rate' => $request->daily_rate ?? ($request->base_salary / $request->working_days),
            'notes' => $request->notes,
        ]);

        return response()->json($salary, 201);
    }

    /**
     * عرض قاعدة راتب دور معين
     */
    public function show(TeacherSalary $teacherSalary, Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        // ✅ center_id إجباري يساوي center_id اليوزر
        if ($teacherSalary->center_id !== $user->center_id) {
            return response()->json(['message' => 'غير مصرح لرؤية هذا الراتب'], 403);
        }
        // مسجد اختياري - مش شرط يتطابق

        return response()->json([
            'id' => $teacherSalary->id,
            'role' => $teacherSalary->role,
            'role_ar' => $this->getRoleArabic($teacherSalary->role),
            'center_id' => $teacherSalary->center_id,
            'mosque_id' => $teacherSalary->mosque_id ?? 'جميع المساجد',
            'base_salary' => $teacherSalary->base_salary,
            'working_days' => $teacherSalary->working_days,
            'daily_rate' => $teacherSalary->daily_rate,
            'total_salary' => $teacherSalary->base_salary,
            'notes' => $teacherSalary->notes,
        ]);
    }

    /**
     * تعديل قاعدة راتب دور
     */
    public function update(Request $request, TeacherSalary $teacherSalary)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        // ✅ center_id إجباري يساوي center_id اليوزر
        if ($teacherSalary->center_id !== $user->center_id) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $request->validate([
            'base_salary' => 'sometimes|required|numeric|min:0',
            'working_days' => 'sometimes|required|integer|min:1|max:31',
            'daily_rate' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $updateData = $request->only(['base_salary', 'working_days', 'daily_rate', 'notes']);

        if (isset($updateData['base_salary']) && isset($updateData['working_days'])) {
            $updateData['daily_rate'] = $updateData['daily_rate'] ??
                ($updateData['base_salary'] / $updateData['working_days']);
        }

        $teacherSalary->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث قاعدة الراتب بنجاح',
            'data' => $teacherSalary->fresh()
        ]);
    }

    /**
     * حذف قاعدة راتب دور
     */
    public function destroy(TeacherSalary $teacherSalary, Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        // ✅ center_id إجباري يساوي center_id اليوزر
        if ($teacherSalary->center_id !== $user->center_id) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $teacherSalary->delete();
        return response()->json(['message' => 'تم حذف قاعدة الراتب بنجاح']);
    }

    /**
     * ترجمة الـ roles للعربي
     */
    private function getRoleArabic($role): string
    {
        return match($role) {
            'teacher' => 'مدرس',
            'supervisor' => 'مشرف',
            'motivator' => 'محفز',
            'student_affairs' => 'شؤون الطلاب',
            'financial' => 'مالي',
            default => $role
        };
    }
}
