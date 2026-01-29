<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\AuditLogService;
use App\Models\Auth\User;
use App\Models\Auth\Role;
use App\Models\Tenant\Center;
use App\Models\Tenant\Student;

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
            'circle' => 'required|in:circle-1,circle-2,circle-3',
            'reading_level' => 'nullable|string',
            'session_time' => 'nullable|in:asr,maghrib',
            'health_status' => 'required|in:healthy,needs_attention,special_needs',
            'guardian_email' => 'required|email',
            'guardian_country_code' => 'required|in:966,20,971',
            'guardian_phone' => 'required|string|min:8',
            'notes' => 'nullable|string',
            'gender' => 'required|in:male,female',
            'center_slug' => 'nullable|string',
            'student_email' => 'nullable|email',
        ]);

        DB::beginTransaction();

        try {
            $centerId = null;

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

            $guardian = $this->findOrCreateGuardian($validated, $centerId);
            $student = $this->createStudent($validated, $guardian->id, $centerId);

            AuditLogService::logUserCreate(auth()->user(), $guardian->id, $validated);
            AuditLogService::log(auth()->user(), 'create_student', Student::class, $student->id, null, $validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الطالب بنجاح' . ($centerId ? ' في مجمع: ' . Center::find($centerId)->name : ''),
                'data' => [
                    'student_id' => $student->id,
                    'guardian_id' => $guardian->id,
                    'center_id' => $centerId,
                    'center_name' => $centerId ? Center::find($centerId)->name : 'الرئيسي',
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

    private function findOrCreateGuardian(array $data, ?int $centerId): User
    {
        $guardianPhone = $data['guardian_country_code'] . $data['guardian_phone'];

        $guardian = User::where(function($query) use ($data, $guardianPhone, $centerId) {
                $query->where('email', $data['guardian_email'])
                      ->orWhere('phone', $guardianPhone);
            })
            ->when($centerId, function($q) use ($centerId) {
                $q->where('center_id', $centerId);
            })
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
                'role_id' => $guardianRole->id,
                'status' => 'pending',
                'birth_date' => $data['birth_date'],
                'gender' => $data['gender']
            ]);
        }

        return $guardian;
    }

    private function createStudent(array $data, int $guardianId, ?int $centerId): Student
    {
        $guardianPhone = $data['guardian_country_code'] . $data['guardian_phone'];
        $domain = explode('@', $data['guardian_email'])[1];
        $studentEmail = $data['student_email'] ?? 'student_' . $data['id_number'] . '@' . $domain;

        if (User::where('email', $studentEmail)->whereNull('center_id')->orWhereNotNull('center_id')->exists()) {
            $studentEmail = 'student_' . $data['id_number'] . '_' . time() . '@' . $domain;
        }

        $studentRole = Role::firstOrCreate(
            ['name' => 'student'],
            [
                'title_ar' => 'طالب',
                'title_en' => 'Student',
                'permissions' => json_encode(['profile:read'])
            ]
        );

        $studentPhone = $guardianPhone . '_' . substr($data['id_number'], -4);

        $studentUser = User::create([
            'name' => $data['first_name'] . ' ' . $data['family_name'],
            'email' => $studentEmail,
            'phone' => $studentPhone,
            'password' => bcrypt('12345678'),
            'center_id' => $centerId,
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
            'circle' => $data['circle'],
            'health_status' => $data['health_status'],
            'reading_level' => $data['reading_level'],
            'session_time' => $data['session_time'],
            'notes' => $data['notes']
        ]);

        $student->user = $studentUser;
        return $student;
    }
}