<?php

namespace App\Http\Controllers\Teachers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Auth\Teacher;
use App\Models\Teachers\TeacherSalary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\Teachers\TeacherPayroll;

class TeacherPayrollController extends Controller
{
    /**
     * 🔥 جلب base_salary (مخصص أو default)
     */
    private function getBaseSalary($teacherId)
    {
        //  1- جرب المرتب المخصص الأول
        $customSalary = DB::table('teacher_custom_salaries')
            ->where('teacher_id', $teacherId)
            ->where('is_active', 1)
            ->orderBy('created_at', 'desc')
            ->first();

        if ($customSalary && $customSalary->custom_base_salary > 0) {
            Log::info("🔥 Custom salary found", [
                'teacher_id' => $teacherId,
                'custom_salary' => $customSalary->custom_base_salary
            ]);
            return (float) $customSalary->custom_base_salary;
        }

        //  2- لو مفيش مخصص → salary_config العادي
        $teacher = Teacher::select('role')->find($teacherId);
        $salaryConfig = TeacherSalary::where('role', $teacher->role)->first();

        $baseSalary = $salaryConfig?->base_salary ?? 5000;
        Log::info("🔥 Default salary used", [
            'teacher_id' => $teacherId,
            'role' => $teacher->role,
            'base_salary' => $baseSalary
        ]);

        return $baseSalary;
    }

    public function index(Request $request)
    {
        $this->generateMonthlyPayroll();

        $query = TeacherPayroll::with(['teacher.user', 'salaryConfig'])
            ->when($request->teacher_id, function($q, $teacherId) {
                $q->where('teacher_id', $teacherId);
            })
            ->when($request->user_id, function($q, $userId) {
                $q->whereHas('teacher', fn($teacherQ) => $teacherQ->where('user_id', $userId));
            })
            ->when($request->search, function($query, $search) {
                $query->whereHas('teacher.user', fn($q) => $q->where('name', 'like', "%{$search}%"))
                      ->orWhereHas('teacher', fn($q) => $q->whereAny(['name', 'role'], 'like', "%{$search}%"));
            })
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->orderBy('created_at', 'desc');

        $payrolls = $request->has('page') ? $query->paginate(10) : $query->get();
        $stats = $this->calculateStats();

        return response()->json([
            'success' => true,
            'data' => $payrolls,
            'stats' => $stats
        ]);
    }

    /**
     * 🔥 STORE - تلقائي salary_config_id + custom salary support
     */
    public function store(Request $request)
    {
        Log::info('🔥 [Payroll Store] Request received', $request->all());

        $validated = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'base_salary' => 'nullable|numeric|min:0',
            'attendance_days' => 'required|integer|min:0|max:31',
            'deductions' => 'required|numeric|min:0',
            'total_due' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,paid',
            'month_year' => 'required|date_format:Y-m',
        ]);

        $teacherId = $validated['teacher_id'];
        $teacher = Teacher::select('id', 'user_id', 'role')->with('user')->findOrFail($teacherId);
        $userId = $teacher->user_id;

        Log::info("teacher_id {$teacherId} → user_id {$userId} → role {$teacher->role}");

        // 🔥 منع التكرار
        $existing = TeacherPayroll::where('teacher_id', $teacherId)
            ->where('month_year', $validated['month_year'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => "جدول رواتب موجود للمعلم ID: {$teacherId} - {$validated['month_year']}"
            ], 409);
        }

        // 🔥 البحث عن salary_config (للـ reference بس)
        $salaryConfig = TeacherSalary::where('role', $teacher->role)
            ->when(request()->center_id, fn($q) => $q->where('center_id', request()->center_id))
            ->when(request()->mosque_id, fn($q) => $q->where('mosque_id', request()->mosque_id))
            ->first();

        $salaryConfigId = $salaryConfig?->id ?? null;

        // 🔥 حساب الراتب مع دعم المرتب المخصص
        $autoBaseSalary = $this->getBaseSalary($teacherId);
        $baseSalary = $validated['base_salary'] ?? $autoBaseSalary;
        $totalDue = $validated['total_due'] ?? ($baseSalary - $validated['deductions']);

        $payrollData = [
            'teacher_id' => $teacherId,
            'user_id' => $userId,
            'salary_config_id' => $salaryConfigId,
            'base_salary' => $baseSalary,
            'attendance_days' => $validated['attendance_days'],
            'deductions' => $validated['deductions'],
            'total_due' => $totalDue,
            'status' => $validated['status'],
            'month_year' => $validated['month_year'],
            'period_start' => Carbon::parse($validated['month_year'])->startOfMonth(),
            'period_end' => Carbon::parse($validated['month_year'])->endOfMonth(),
        ];

        $payroll = TeacherPayroll::create($payrollData);

        Log::info(' Payroll created', [
            'teacher_id' => $teacherId,
            'user_id' => $userId,
            'salary_config_id' => $salaryConfigId,
            'role' => $teacher->role,
            'base_salary' => $baseSalary,
            'source' => $validated['base_salary'] ? 'manual' : 'auto',
            'payroll_id' => $payroll->id
        ]);

        return response()->json([
            'success' => true,
            'data' => $payroll->load(['teacher.user', 'salaryConfig'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $payroll = TeacherPayroll::findOrFail($id);

        $validated = $request->validate([
            'base_salary' => 'nullable|numeric|min:0',
            'attendance_days' => 'nullable|integer|min:0|max:31',
            'deductions' => 'nullable|numeric|min:0',
            'total_due' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:pending,paid',
            'notes' => 'nullable|string|max:500',
        ]);

        $payroll->update($validated);
        $payroll->load(['teacher.user', 'salaryConfig']);

        return response()->json([
            'success' => true,
            'data' => $payroll,
            'message' => 'تم تحديث بيانات الراتب بنجاح'
        ]);
    }

    public function markPaid($id)
    {
        $payroll = TeacherPayroll::findOrFail($id);

        if ($payroll->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'تم الدفع مسبقاً'
            ], 400);
        }

        $payroll->update([
            'status' => 'paid',
            'paid_at' => now()
        ]);

        $payroll->load(['teacher.user', 'salaryConfig']);

        return response()->json([
            'success' => true,
            'data' => $payroll,
            'message' => 'تم تحديث الحالة إلى مدفوع'
        ]);
    }

    /**
     * 🔥 توليد تلقائي مع دعم المرتب المخصص
     */
    private function generateMonthlyPayroll()
    {
        $currentMonthYear = now()->format('Y-m');
        if (cache("payroll_generated_{$currentMonthYear}")) {
            return;
        }

        $activeTeachers = Teacher::whereHas('user', fn($q) => $q->where('status', 'active'))
            ->with('user')
            ->get();

        Log::info("🔄 توليد رواتب {$currentMonthYear} لـ {$activeTeachers->count()} معلم");

        foreach ($activeTeachers as $teacher) {
            $existingPayroll = TeacherPayroll::where('teacher_id', $teacher->id)
                ->where('month_year', $currentMonthYear)
                ->first();

            if (!$existingPayroll) {
                // 🔥 البحث عن salary_config (للـ reference)
                $salaryConfig = TeacherSalary::where('role', $teacher->role)->first();
                $salaryConfigId = $salaryConfig?->id ?? null;

                //  استخدم المرتب المخصص أو الافتراضي
                $baseSalary = $this->getBaseSalary($teacher->id);

                TeacherPayroll::create([
                    'teacher_id' => $teacher->id,
                    'user_id' => $teacher->user_id,
                    'salary_config_id' => $salaryConfigId,
                    'base_salary' => $baseSalary,  //  مخصص أو default
                    'attendance_days' => 22,
                    'deductions' => 200,
                    'total_due' => $baseSalary - 200,
                    'status' => 'pending',
                    'month_year' => $currentMonthYear,
                    'period_start' => now()->startOfMonth(),
                    'period_end' => now()->endOfMonth(),
                ]);

                Log::info(" Auto payroll created", [
                    'teacher_id' => $teacher->id,
                    'role' => $teacher->role,
                    'base_salary' => $baseSalary,
                    'salary_config_id' => $salaryConfigId
                ]);
            }
        }

        cache(["payroll_generated_{$currentMonthYear}" => now()], 24 * 60 * 60);
    }

    private function calculateStats()
    {
        return [
            'total_payroll' => TeacherPayroll::sum('total_due'),
            'total_pending' => TeacherPayroll::where('status', 'pending')->sum('total_due'),
            'total_paid' => TeacherPayroll::where('status', 'paid')->sum('total_due'),
            'pending_count' => TeacherPayroll::where('status', 'pending')->count(),
            'paid_count' => TeacherPayroll::where('status', 'paid')->count(),
            'current_month' => now()->format('Y-m'),
        ];
    }
}