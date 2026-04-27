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
use Illuminate\Support\Facades\Auth;

class TeacherPayrollController extends Controller
{
    /**
     * 🔥 جلب center_id بأمان
     */
    private function getUserCenterId()
    {
        $user = Auth::user();
        if (!$user) {
            throw new \Exception('غير مسجل الدخول', 401);
        }

        if (!$user->center_id) {
            throw new \Exception('لا يوجد مجمع مرتبط بحسابك', 400);
        }

        return $user->center_id;
    }

    /**
     * 🔥 جلب base_salary آمن مع center_id
     */
   private function getBaseSalary($teacherId)
{
    try {
        $centerId = $this->getUserCenterId();

        // 1- الراتب المخصص أولاً
        $customSalary = DB::table('teacher_custom_salaries')
            ->where('teacher_id', $teacherId)
            ->where('is_active', 1)
            ->first();

        if ($customSalary && $customSalary->custom_base_salary > 0) {
            Log::info("🔥 Custom salary found", [
                'teacher_id'    => $teacherId,
                'custom_salary' => $customSalary->custom_base_salary,
            ]);
            return (float) $customSalary->custom_base_salary;
        }

        // 2- جيب الـ teacher بأمان ✅
        $teacher = Teacher::with('user')->find($teacherId);
        if (!$teacher) {
            Log::warning("Teacher not found", ['teacher_id' => $teacherId]);
            return 5000;
        }

        // ✅ CHECK الـ user موجود الأول
        if (!$teacher->user) {
            Log::warning("No user for teacher", ['teacher_id' => $teacherId]);
            return 5000;
        }

        // ✅ دلوقتي آمن
        if ($teacher->user->center_id != $centerId) {
            Log::warning("Teacher not in center", [
                'teacher_id' => $teacherId,
                'center_id' => $centerId
            ]);
            return 5000;
        }

        $salaryConfig = TeacherSalary::where('role', $teacher->role)
            ->where('center_id', $centerId)
            ->first();

        $baseSalary = $salaryConfig?->base_salary ?? 5000;
        Log::info("🔥 Default salary used", [
            'teacher_id' => $teacherId,
            'role'       => $teacher->role,
            'base_salary' => $baseSalary,
        ]);

        return $baseSalary;
    } catch (\Exception $e) {
        Log::error("Error in getBaseSalary", [
            'teacher_id' => $teacherId,
            'error'      => $e->getMessage()
        ]);
        return 5000;
    }
}

    /**
     * 🔥 جلب عملة المعلم (مخصصة أو من قاعدة الراتب)
     */
    private function getTeacherCurrency($teacherId): string
{
    try {
        $centerId = $this->getUserCenterId();

        $customSalary = DB::table('teacher_custom_salaries')
            ->where('teacher_id', $teacherId)
            ->where('is_active', 1)
            ->first();

        if ($customSalary && !empty($customSalary->currency)) {
            return $customSalary->currency;
        }

        $teacher = Teacher::with('user')->find($teacherId);
        if (!$teacher || !$teacher->user) {  // ✅ التحقق
            return 'SAR';
        }

        $salaryConfig = TeacherSalary::where('role', $teacher->role)
            ->where('center_id', $centerId)
            ->first();

        return $salaryConfig?->currency ?? 'SAR';
    } catch (\Exception $e) {
        return 'SAR';
    }
}

    public function index(Request $request)
    {
        try {
            $centerId = $this->getUserCenterId();
            $this->generateMonthlyPayroll();

            $query = TeacherPayroll::with(['teacher.user', 'salaryConfig'])
                ->whereHas('teacher.user', fn($q) => $q->where('center_id', $centerId))
                ->when($request->teacher_id, function ($q, $teacherId) use ($centerId) {
                    $q->where('teacher_id', $teacherId)
                      ->whereHas('teacher.user', fn($tq) => $tq->where('center_id', $centerId));
                })
                ->when($request->user_id, function ($q, $userId) use ($centerId) {
                    $q->whereHas('teacher', fn($teacherQ) => $teacherQ->where('user_id', $userId))
                      ->whereHas('teacher.user', fn($uq) => $uq->where('center_id', $centerId));
                })
                ->when($request->search, function ($query, $search) use ($centerId) {
                    $query->where(function ($q) use ($search, $centerId) {
                        $q->whereHas('teacher.user', fn($uq) => $uq->where('name', 'like', "%{$search}%")
                              ->where('center_id', $centerId));
                    })->orWhereHas('teacher', fn($q) => $q->whereAny(['name', 'role'], 'like', "%{$search}%"))
                      ->whereHas('teacher.user', fn($q) => $q->where('center_id', $centerId));
                })
                ->when($request->status, fn($q, $status) => $q->where('status', $status))
                ->orderBy('created_at', 'desc');

            $payrolls = $request->has('page') ? $query->paginate(10) : $query->get();
            $stats    = $this->calculateStats();

            return response()->json([
                'success'             => true,
                'data'                => $payrolls,
                'stats'               => $stats,
                'center_id'           => $centerId,
                'center_filter_active' => true,
            ]);
        } catch (\Exception $e) {
            Log::error("Payroll index error", ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب الجداول: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔥 STORE آمن — الخصم الافتراضي = 0
     */
    public function store(Request $request)
    {
        try {
            $centerId = $this->getUserCenterId();

            $validated = $request->validate([
                'teacher_id'      => 'required|exists:teachers,id',
                'base_salary'     => 'nullable|numeric|min:0',
                'currency'        => 'nullable|in:SAR,EGP,USD',
                'attendance_days' => 'required|integer|min:0|max:31',
                'deductions'      => 'nullable|numeric|min:0', // ✅ nullable ← 0 بالكود
                'total_due'       => 'nullable|numeric|min:0',
                'status'          => 'required|in:pending,paid',
                'month_year'      => 'required|date_format:Y-m',
            ]);

            $teacherId = $validated['teacher_id'];
            $teacher   = Teacher::select('id', 'user_id', 'role')->with('user')->findOrFail($teacherId);

            if ($teacher->user->center_id != $centerId) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مسموح بإضافة رواتب لمعلم من مركز آخر'
                ], 403);
            }

            $userId = $teacher->user_id;

            $existing = TeacherPayroll::where('teacher_id', $teacherId)
                ->where('month_year', $validated['month_year'])
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => "جدول رواتب موجود للمعلم ID: {$teacherId} - {$validated['month_year']}"
                ], 409);
            }

            $salaryConfig   = TeacherSalary::where('role', $teacher->role)->where('center_id', $centerId)->first();
            $salaryConfigId = $salaryConfig?->id ?? null;

            $autoBaseSalary = $this->getBaseSalary($teacherId);
            $baseSalary     = $validated['base_salary'] ?? $autoBaseSalary;
            $currency       = $validated['currency'] ?? $this->getTeacherCurrency($teacherId);

            // ✅ الخصم = 0 إذا لم يُرسَل صراحةً
            $deductions = $validated['deductions'] ?? 0;
            $totalDue   = $validated['total_due'] ?? ($baseSalary - $deductions);

            $payrollData = [
                'teacher_id'      => $teacherId,
                'user_id'         => $userId,
                'salary_config_id' => $salaryConfigId,
                'base_salary'     => $baseSalary,
                'currency'        => $currency,
                'attendance_days' => $validated['attendance_days'],
                'deductions'      => $deductions,
                'total_due'       => $totalDue,
                'status'          => $validated['status'],
                'month_year'      => $validated['month_year'],
                'period_start'    => Carbon::parse($validated['month_year'])->startOfMonth(),
                'period_end'      => Carbon::parse($validated['month_year'])->endOfMonth(),
            ];

            $payroll = TeacherPayroll::create($payrollData);

            return response()->json([
                'success' => true,
                'data'    => $payroll->load(['teacher.user', 'salaryConfig'])
            ], 201);
        } catch (\Exception $e) {
            Log::error("Payroll store error", ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'فشل في إضافة جدول الراتب: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $centerId = $this->getUserCenterId();

            $payroll = TeacherPayroll::whereHas('teacher.user', fn($q) => $q->where('center_id', $centerId))
                ->findOrFail($id);

            $validated = $request->validate([
                'base_salary'     => 'nullable|numeric|min:0',
                'currency'        => 'nullable|in:SAR,EGP,USD',
                'attendance_days' => 'nullable|integer|min:0|max:31',
                'deductions'      => 'nullable|numeric|min:0',
                'total_due'       => 'nullable|numeric|min:0',
                'status'          => 'nullable|in:pending,paid',
                'notes'           => 'nullable|string|max:500',
            ]);

            $payroll->update($validated);
            $payroll->load(['teacher.user', 'salaryConfig']);

            return response()->json([
                'success' => true,
                'data'    => $payroll,
                'message' => 'تم تحديث بيانات الراتب بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في التحديث: ' . $e->getMessage()
            ], 500);
        }
    }

    public function markPaid($id)
    {
        try {
            $centerId = $this->getUserCenterId();

            $payroll = TeacherPayroll::whereHas('teacher.user', fn($q) => $q->where('center_id', $centerId))
                ->findOrFail($id);

            if ($payroll->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'تم الدفع مسبقاً'
                ], 400);
            }

            $payroll->update([
                'status'  => 'paid',
                'paid_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data'    => $payroll->load(['teacher.user', 'salaryConfig']),
                'message' => 'تم تحديث الحالة إلى مدفوع'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في تحديث الحالة: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateMonthlyPayroll()
    {
        try {
            $centerId       = $this->getUserCenterId();
            $currentMonthYear = now()->format('Y-m');
            $cacheKey       = "payroll_generated_{$centerId}_{$currentMonthYear}";

            if (cache($cacheKey)) {
                return;
            }

            cache([$cacheKey => now()], 24 * 60 * 60);
        } catch (\Exception $e) {
            Log::error("Generate payroll error", ['error' => $e->getMessage()]);
        }
    }

    private function calculateStats()
    {
        try {
            $centerId = $this->getUserCenterId();

            return [
                'total_payroll'  => TeacherPayroll::whereHas('teacher.user', fn($q) => $q->where('center_id', $centerId))->sum('total_due'),
                'total_pending'  => TeacherPayroll::whereHas('teacher.user', fn($q) => $q->where('center_id', $centerId))->where('status', 'pending')->sum('total_due'),
                'total_paid'     => TeacherPayroll::whereHas('teacher.user', fn($q) => $q->where('center_id', $centerId))->where('status', 'paid')->sum('total_due'),
                'pending_count'  => TeacherPayroll::whereHas('teacher.user', fn($q) => $q->where('center_id', $centerId))->where('status', 'pending')->count(),
                'paid_count'     => TeacherPayroll::whereHas('teacher.user', fn($q) => $q->where('center_id', $centerId))->where('status', 'paid')->count(),
                'current_month'  => now()->format('Y-m'),
            ];
        } catch (\Exception $e) {
            return [];
        }
    }
}