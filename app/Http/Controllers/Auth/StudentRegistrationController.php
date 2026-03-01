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

class StudentRegistrationController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|min:2',
            'family_name' => 'required|string|min:2',
            'id_number' => 'required|string|size:10|unique:students,id_number',
            'birth_date' => 'required|date|before:today',
            'grade_level' => 'required|in:elementary,middle,high',
            'circle' => 'nullable',
            'reading_level' => 'nullable|string',
            'session_time' => 'nullable|in:asr,maghrib',
            'health_status' => 'required|in:healthy,needs_attention,special_needs',
            'guardian_email' => 'required|email',
            'guardian_country_code' => 'required|in:966,20,971',
            'guardian_phone' => 'required|string|min:8',
            'notes' => 'nullable|string',
            'gender' => 'required|in:male,female',
            'center_slug' => 'nullable|string',
            'student_email' => 'required|email', // ✅ بدون unique دلوقتي
        ]);

        DB::beginTransaction();

        try {
            $centerId = null;

            // تحديد الـ center
            if ($request->center_slug && !in_array($request->center_slug, ['student', 'register'])) {
                $center = Center::where('subdomain', $request->center_slug)
                                ->where('is_active', true)
                                ->first();

                if (!$center) {
                    return response()->json([
                        'success' => false,
                        'message' => 'مجمع "' . $request->center_slug . '" غير موجود أو غير مفعل'
                    ], 422);
                }
                $centerId = $center->id;
            }
            else {
                $segments = request()->segments();
                $subdomain = $segments[1] ?? null;

                if ($subdomain && !in_array($subdomain, ['register', 'student'])) {
                    $center = Center::where('subdomain', $subdomain)
                                    ->where('is_active', true)
                                    ->first();

                    if (!$center) {
                        return response()->json([
                            'success' => false,
                            'message' => 'مجمع "' . $subdomain . '" غير موجود أو غير مفعل'
                        ], 422);
                    }
                    $centerId = $center->id;
                }
            }

            if (!$centerId) {
                return response()->json([
                    'success' => false,
                    'message' => 'يجب تحديد مجمع صحيح'
                ], 422);
            }

            $guardian = $this->findOrCreateGuardian($validated, $centerId);
            $student = $this->createStudent($validated, $guardian->id, $centerId);

            // ✅ إضافة Tenant جديد أو التحقق من وجوده
            $this->handleTenant($guardian, $centerId, $student);

            AuditLogService::logUserCreate(auth()->user(), $guardian->id, $validated);
            AuditLogService::log(auth()->user(), 'create_student', Student::class, $student->id, null, $validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الطالب بنجاح في مجمع: ' . Center::find($centerId)->name,
                'data' => [
                    'student_id' => $student->id,
                    'guardian_id' => $guardian->id,
                    'center_id' => $centerId,
                    'center_name' => Center::find($centerId)->name,
                    'tenant_id' => Tenant::where('user_id', $guardian->id)->where('center_id', $centerId)->first()->id ?? null,
                    'student_email' => $student->user->email,
                    'guardian_email' => $guardian->email
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'فشل في التسجيل: ' . $e->getMessage()
            ], 422);
        }
    }

    private function findOrCreateGuardian(array $data, int $centerId): User
    {
        $guardianPhone = $data['guardian_country_code'] . $data['guardian_phone'];

        $guardian = User::where(function($query) use ($data, $guardianPhone, $centerId) {
                $query->where('email', $data['guardian_email'])
                      ->orWhere('phone', $guardianPhone);
            })
            ->where('center_id', $centerId)
            ->first();

        if (!$guardian) {
            $guardianRole = Role::firstOrCreate(
                ['name' => 'guardian'],
                [
                    'title_ar' => 'ولي أمر',
                    'title_en' => 'Guardian',
                    'permissions' => json_encode(['students:read', 'students:manage'])
                ]
            );

            $guardian = User::create([
                'name' => $data['family_name'] . ' (ولي أمر)',
                'email' => $data['guardian_email'],
                'phone' => $guardianPhone,
                'password' => bcrypt('12345678'),
                'center_id' => $centerId,
                'tenant_id' => Tenant::where('center_id', $centerId)->where('user_id', null)->first()?->id, // ربط بـ tenant موجود لو فيه
                'role_id' => $guardianRole->id,
                'status' => 'pending',
                'birth_date' => $data['birth_date'],
                'gender' => $data['gender']
            ]);
        }

        return $guardian;
    }

    private function createStudent(array $data, int $guardianId, int $centerId): Student
    {
        $guardianPhone = $data['guardian_country_code'] . $data['guardian_phone'];

        $studentEmail = $data['student_email']; // الإيميل المدخل من الواجهة

        $studentRole = Role::firstOrCreate(
            ['name' => 'student'],
            [
                'title_ar' => 'طالب',
                'title_en' => 'Student',
                'permissions' => json_encode(['profile:read'])
            ]
        );

        $studentPhone = $guardianPhone . '_' . substr($data['id_number'], -4);

        $tenantId = Tenant::where('center_id', $centerId)->first()?->id;

        $studentUser = User::create([
            'name' => $data['first_name'] . ' ' . $data['family_name'],
            'email' => $studentEmail,
            'phone' => $studentPhone,
            'password' => bcrypt('12345678'),
            'center_id' => $centerId,
            'tenant_id' => $tenantId, // ربط الطالب بنفس الـ tenant
            'role_id' => $studentRole->id,
            'status' => 'pending',
            'birth_date' => $data['birth_date'],
            'gender' => $data['gender']
        ]);

        $student = Student::create([
            'center_id' => $centerId,
            'user_id' => $studentUser->id,
            'guardian_id' => $guardianId,
            'id_number' => $data['id_number'],
            'grade_level' => $data['grade_level'],
            'circle' => $data['circle'] ?? 1,
            'health_status' => $data['health_status'],
            'reading_level' => $data['reading_level'],
            'session_time' => $data['session_time'],
            'notes' => $data['notes']
        ]);

        $student->user = $studentUser;
        return $student;
    }

    /**
     * ✅ الدالة الجديدة لمعالجة Tenant
     */
    private function handleTenant(User $user, int $centerId, Student $student): void
    {
        // التحقق لو الـ user موجود بالفعل في tenant مع نفس الـ center
        $existingTenant = Tenant::where('user_id', $user->id)
                               ->where('center_id', $centerId)
                               ->first();

        if ($existingTenant) {
            return; // الحساب موجود بالفعل
        }

        // إنشاء tenant جديد
        Tenant::create([
            'name' => $user->name . ' - ' . Center::find($centerId)->name,
            'user_id' => $user->id,
            'center_id' => $centerId
        ]);
    }
}
