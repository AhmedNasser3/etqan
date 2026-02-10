<?php

namespace App\Http\Controllers\Students;

use App\Models\Auth\User;
use App\Models\Tenant\Student;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PendingStudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with([
                'user:id,name,email,phone,avatar,birth_date,center_id,status',
                'guardian:id,name,email,phone',
                'center:id,name,subdomain'
            ])
            ->whereHas('user', function($q) {
                $q->where('status', 'pending');
            });

        if ($request->filled('center_slug')) {
            $center = \App\Models\Tenant\Center::where('subdomain', $request->center_slug)->first();

            if ($center) {
                $query->where('center_id', $center->id);
            } else {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Center not found'
                ]);
            }
        }

        $students = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }
public function confirm($id)
{
    $student = Student::with(['user', 'guardian.user'])->findOrFail($id);

    // تحديث status لـ user الطالب
    $student->user->update([
        'status' => 'active'
    ]);

    // تحديث status لـ user ولي الأمر إذا كان موجود
    if ($student->guardian && $student->guardian->user) {
        $student->guardian->user->update([
            'status' => 'active'
        ]);
    }

    $student->load([
        'user:id,name,email,phone,avatar,birth_date,status',
        'guardian:id,name,email,phone',
        'guardian.user:id,name,email,phone,status',
        'center:id,name,subdomain'
    ]);

    return response()->json([
        'success' => true,
        'message' => 'تم تأكيد الطالب وولي الأمر بنجاح',
        'data' => $student
    ]);
}

    public function reject($id)
    {
        $student = Student::findOrFail($id);
        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم رفض طلب الطالب وحذف بياناته بنجاح'
        ]);
    }

    public function show($id)
    {
        $student = Student::with([
                'user:id,name,email,phone,avatar,birth_date,center_id,status',
                'guardian:id,name,email,phone',
                'center:id,name,subdomain'
            ])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    }

    public function linkGuardian($id, Request $request)
    {
        $guardianEmail = $request->input('guardian_email');

        if (!$guardianEmail || !filter_var($guardianEmail, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'guardian_email' => ['البريد الإلكتروني مطلوب ويجب أن يكون صحيح']
            ]);
        }

        $student = Student::with('user')->findOrFail($id);

        if ($request->filled('center_slug')) {
            $center = \App\Models\Tenant\Center::where('subdomain', $request->center_slug)->first();
            if (!$center || $student->center_id !== $center->id) {
                return response()->json(['message' => 'Student not in this center'], 403);
            }
        }

        $guardian = User::where('email', $guardianEmail)->first();

        if (!$guardian) {
            return response()->json([
                'success' => false,
                'message' => 'ولي الأمر غير مسجل في النظام'
            ], 404);
        }

        $student->update([
            'guardian_id' => $guardian->id
        ]);

        $student->load([
            'user:id,name,email,phone,avatar,birth_date,status',
            'guardian:id,name,email,phone',
            'center:id,name,subdomain'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم ربط ولي الأمر بنجاح',
            'data' => [
                'guardian_name' => $guardian->name,
                'guardian_email' => $guardian->email,
                'student' => $student
            ]
        ]);
    }

    public function createGuardian($id, Request $request)
    {
        $guardianEmail = $request->input('guardian_email');

        if (!$guardianEmail || !filter_var($guardianEmail, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'guardian_email' => ['البريد الإلكتروني مطلوب ويجب أن يكون صحيح']
            ]);
        }

        if (User::where('email', $guardianEmail)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'البريد الإلكتروني مسجل مسبقاً'
            ], 422);
        }

        $student = Student::with('user')->findOrFail($id);

        if ($request->filled('center_slug')) {
            $center = \App\Models\Tenant\Center::where('subdomain', $request->center_slug)->first();
            if (!$center || $student->center_id !== $center->id) {
                return response()->json(['message' => 'Student not in this center'], 403);
            }
        }

        $guardian = User::create([
            'name' => 'ولي أمر ' . ($student->user->name ?? 'الطالب'),
            'email' => $guardianEmail,
            'password' => Hash::make('12345678'),
            'status' => 'active',
            'phone' => null,
            'center_id' => $student->user->center_id ?? null,
        ]);

        $student->update([
            'guardian_id' => $guardian->id
        ]);

        $student->load([
            'user:id,name,email,phone,avatar,birth_date,status',
            'guardian:id,name,email,phone',
            'center:id,name,subdomain'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء حساب ولي الأمر وربطه بالطالب بنجاح',
            'data' => [
                'guardian' => [
                    'id' => $guardian->id,
                    'name' => $guardian->name,
                    'email' => $guardian->email
                ],
                'credentials' => [
                    'email' => $guardian->email,
                    'password' => '12345678'
                ],
                'student' => $student
            ]
        ]);
    }

    public function debug()
    {
        return response()->json([
            'success' => true,
            'debug' => [
                'students_table_columns' => Schema::getColumnListing('students'),
                'users_table_columns' => Schema::getColumnListing('users'),
                'total_students' => Student::count(),
                'total_users' => User::count(),
                'users_emails_sample' => User::pluck('email')->take(5)->toArray(),
                'pending_students_count' => Student::whereHas('user', fn($q) => $q->where('status', 'pending'))->count(),
            ]
        ]);
    }

    public function stats()
    {
        return response()->json([
            'success' => true,
            'stats' => [
                'total_students' => Student::count(),
                'pending_students' => Student::whereHas('user', fn($q) => $q->where('status', 'pending'))->count(),
                'approved_students' => Student::whereHas('user', fn($q) => $q->where('status', 'active'))->count(),
                'pending_users' => User::where('status', 'pending')->count(),
                'active_users' => User::where('status', 'active')->count()
            ]
        ]);
    }
}