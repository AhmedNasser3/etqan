<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Tenant\Center;
use App\Models\Tenant\Student;
use App\Models\Tenants\Tenant;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StudentRegistrationController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name'             => 'required|string|min:2',
            'family_name'            => 'required|string|min:2',
            'id_number'              => 'required|string|size:10|unique:students,id_number',
            'birth_date'             => 'required|date|before:today',
            'grade_level'            => 'required|in:elementary,middle,high',
            'circle'                 => 'nullable',
            'reading_level'          => 'nullable|string',
            'session_time'           => 'nullable|in:asr,maghrib',
            'health_status'          => 'required|in:healthy,needs_attention,special_needs',
            'guardian_email'         => 'required|email',
            'guardian_country_code'  => 'required|in:966,20,971',
            'guardian_phone'         => 'required|string|min:8',
            'notes'                  => 'nullable|string',
            'gender'                 => 'required|in:male,female',
            'center_slug'            => 'nullable|string',
            'student_email'          => 'required|email',
        ]);

        DB::beginTransaction();

        try {
            $centerId = $this->resolveCenterId($request);

            if (!$centerId) {
                return response()->json([
                    'success' => false,
                    'message' => 'يجب تحديد مجمع صحيح',
                ], 422);
            }

            $guardian = $this->findOrCreateGuardian($validated, $centerId);
            $student  = $this->createStudent($validated, $guardian->id, $centerId);

            $this->handleTenant($guardian, $centerId);

            AuditLogService::logUserCreate(auth()->user(), $guardian->id, $validated);
            AuditLogService::log(auth()->user(), 'create_student', Student::class, $student->id, null, $validated);

            DB::commit();

            $centerName = Center::find($centerId)?->name ?? '';

            return response()->json([
                'success' => true,
                'message' => "تم تسجيل الطالب بنجاح في مجمع: {$centerName}",
                'data'    => [
                    'student_id'     => $student->id,
                    'guardian_id'    => $guardian->id,
                    'center_id'      => $centerId,
                    'center_name'    => $centerName,
                    'tenant_id'      => Tenant::where('user_id', $guardian->id)->where('center_id', $centerId)->first()?->id,
                    'student_email'  => $student->user->email,
                    'guardian_email' => $guardian->email,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'فشل في التسجيل: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * استيراد وتسجيل طلاب متعددين دفعة واحدة من Excel
     * POST /api/v1/auth/student/import-register
     *
     * الفرق عن register: هنا نستقبل array من الطلاب ونعالجهم row by row
     * ونرجع نتيجة تفصيلية بدل وقف عند أول خطأ
     */
    public function importRegister(Request $request)
    {
        $authUser = auth()->user();

        if (!$authUser || !$authUser->center_id) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $rows = $request->input('students');

        if (empty($rows) || !is_array($rows)) {
            return response()->json(['success' => false, 'message' => 'لا توجد بيانات طلاب'], 422);
        }

        $successCount = 0;
        $failedCount  = 0;
        $errors       = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2; // Excel row number (header is row 1)

            // تحويل كل قيمة لـ string وتنظيفها
            $row = array_map(fn($v) => trim((string) ($v ?? '')), $row);

            // Validate required fields per row
            $required = [
                'first_name'            => 'الاسم الأول',
                'family_name'           => 'اسم العائلة',
                'id_number'             => 'رقم الهوية',
                'birth_date'            => 'تاريخ الميلاد',
                'grade_level'           => 'المرحلة الدراسية',
                'gender'                => 'الجنس',
                'student_email'         => 'بريد الطالب',
                'guardian_email'        => 'بريد ولي الأمر',
                'guardian_country_code' => 'رمز دولة ولي الأمر',
                'guardian_phone'        => 'هاتف ولي الأمر',
            ];

            $hasError = false;
            foreach ($required as $field => $label) {
                if (empty($row[$field])) {
                    $errors[] = "سطر {$rowNum}: حقل \"{$label}\" مطلوب";
                    $failedCount++;
                    $hasError = true;
                    break;
                }
            }
            if ($hasError) continue;

            // تحقق من صحة grade_level و gender و guardian_country_code
            if (!in_array($row['grade_level'], ['elementary', 'middle', 'high'])) {
                $errors[] = "سطر {$rowNum}: المرحلة الدراسية يجب أن تكون elementary أو middle أو high";
                $failedCount++;
                continue;
            }
            if (!in_array($row['gender'], ['male', 'female'])) {
                $errors[] = "سطر {$rowNum}: الجنس يجب أن يكون male أو female";
                $failedCount++;
                continue;
            }
            if (!in_array($row['guardian_country_code'], ['966', '20', '971'])) {
                $errors[] = "سطر {$rowNum}: رمز الدولة يجب أن يكون 966 أو 20 أو 971";
                $failedCount++;
                continue;
            }

            // فرض health_status لو مش موجود
            if (empty($row['health_status']) || !in_array($row['health_status'], ['healthy', 'needs_attention', 'special_needs'])) {
                $row['health_status'] = 'healthy';
            }

            DB::beginTransaction();
            try {
                $centerId = $authUser->center_id;

                // تحقق من عدم تكرار id_number
                if (Student::where('id_number', $row['id_number'])->exists()) {
                    $errors[] = "سطر {$rowNum} ({$row['id_number']}): رقم الهوية مسجل مسبقاً";
                    $failedCount++;
                    DB::rollBack();
                    continue;
                }

                // تحقق من عدم تكرار student_email
                if (User::where('email', $row['student_email'])->exists()) {
                    $errors[] = "سطر {$rowNum} ({$row['id_number']}): البريد الإلكتروني للطالب مستخدم مسبقاً";
                    $failedCount++;
                    DB::rollBack();
                    continue;
                }

                $guardian = $this->findOrCreateGuardian($row, $centerId);
                $student  = $this->createStudent($row, $guardian->id, $centerId);
                $this->handleTenant($guardian, $centerId);

                AuditLogService::log($authUser, 'import_register_student', Student::class, $student->id, null, $row);

                DB::commit();
                $successCount++;
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('importRegister row error', [
                    'row'   => $rowNum,
                    'error' => $e->getMessage(),
                ]);
                $errors[]   = "سطر {$rowNum} ({$row['id_number']}): " . $e->getMessage();
                $failedCount++;
            }
        }

        return response()->json([
            'success' => $successCount > 0,
            'message' => "تم تسجيل {$successCount} طالب بنجاح" . ($failedCount > 0 ? "، فشل {$failedCount}" : ''),
            'data'    => [
                'success_count' => $successCount,
                'failed_count'  => $failedCount,
                'errors'        => $errors,
            ],
        ], $successCount > 0 ? 200 : 422);
    }

    // ─── تحديد المجمع ─────────────────────────────────────────────────────────
    public function resolveCenterId(Request $request): ?int
    {
        if (auth()->check() && auth()->user()->center_id) {
            return auth()->user()->center_id;
        }

        $slug = $request->center_slug;

        if (!$slug || in_array($slug, ['student', 'register'])) {
            $segments = $request->segments();
            $slug     = $segments[1] ?? null;
        }

        if (!$slug || in_array($slug, ['student', 'register'])) {
            return null;
        }

        $center = Center::where('subdomain', $slug)->where('is_active', true)->first();
        return $center?->id;
    }

    private function findOrCreateGuardian(array $data, int $centerId): User
    {
        $guardianPhone = $data['guardian_country_code'] . $data['guardian_phone'];

        $guardian = User::where(function ($q) use ($data, $guardianPhone) {
                $q->where('email', $data['guardian_email'])
                  ->orWhere('phone', $guardianPhone);
            })
            ->where('center_id', $centerId)
            ->first();

        if (!$guardian) {
            $role = Role::firstOrCreate(
                ['name' => 'guardian'],
                [
                    'title_ar'    => 'ولي أمر',
                    'title_en'    => 'Guardian',
                    'permissions' => json_encode(['students:read', 'students:manage']),
                ],
            );

            $guardian = User::create([
                'name'       => $data['family_name'] . ' (ولي أمر)',
                'email'      => $data['guardian_email'],
                'phone'      => $guardianPhone,
                'password'   => bcrypt('12345678'),
                'center_id'  => $centerId,
                'role_id'    => $role->id,
                'status'     => 'pending',
                'birth_date' => $data['birth_date'],
                'gender'     => $data['gender'],
            ]);
        }

        return $guardian;
    }

 private function createStudent(array $data, int $guardianId, int $centerId): Student
{
    $guardianPhone = $data['guardian_country_code'] . $data['guardian_phone'];

    $role = Role::firstOrCreate(
        ['name' => 'student'],
        [
            'title_ar'    => 'طالب',
            'title_en'    => 'Student',
            'permissions' => json_encode(['profile:read']),
        ],
    );

    $studentPhone = $guardianPhone . '_' . substr($data['id_number'], -4);
    $tenantId     = Tenant::where('center_id', $centerId)->first()?->id;

    $studentUser = User::create([
        'name'       => $data['first_name'] . ' ' . $data['family_name'],
        'email'      => $data['student_email'],
        'phone'      => $studentPhone,
        'password'   => bcrypt('12345678'),
        'circle'     => '-', // يُستخدم في User إن كان موجودًا
        'center_id'  => $centerId,
        'tenant_id'  => $tenantId,
        'role_id'    => $role->id,
        'status'     => 'pending',
        'birth_date' => $data['birth_date'],
        'gender'     => $data['gender'],
    ]);

    $student = Student::create([
        'center_id'     => $centerId,
        'user_id'       => $studentUser->id,
        'guardian_id'   => $guardianId,
        'id_number'     => $data['id_number'],
        'grade_level'   => $data['grade_level'],
        'circle'        => $data['circle'] ?? '-', // ← التعديل هنا
        'health_status' => $data['health_status'],
        'reading_level' => $data['reading_level'] ?? null,
        'session_time'  => $data['session_time'] ?? null,
        'notes'         => $data['notes'] ?? null,
    ]);

    $student->user = $studentUser;
    return $student;
}

    private function handleTenant(User $user, int $centerId): void
    {
        $exists = Tenant::where('user_id', $user->id)
                        ->where('center_id', $centerId)
                        ->exists();

        if ($exists) return;

        Tenant::create([
            'name'      => $user->name . ' - ' . (Center::find($centerId)?->name ?? ''),
            'user_id'   => $user->id,
            'center_id' => $centerId,
        ]);
    }
}