<?php

namespace App\Http\Controllers\Students;

use App\Models\Auth\User;
use App\Models\Tenant\Student;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class PendingStudentController extends Controller
{
    public function index(Request $request)
    {
        //  التحقق من وجود المستخدم و center_id قبل أي شيء
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل دخول'
            ], 401);
        }

        if (!$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 403);
        }

        $query = Student::with([
                'user:id,name,email,phone,avatar,birth_date,center_id,status',
                'guardian:id,name,email,phone',
                'center:id,name,subdomain'
            ])
            ->whereHas('user', function($q) {
                $q->where('status', 'pending');
            })
            ->where('center_id', $user->center_id); //  مجمع المستخدم الحالي

        $students = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $students,
            'center_id' => $user->center_id,
            'center_name' => optional($user->center)->name ?? 'غير محدد',
            'total_pending' => $students->count()
        ]);
    }

    public function confirm($id)
    {
        $user = Auth::user();

        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل دخول أو لا يوجد مجمع'
            ], 403);
        }

        $student = Student::with(['user', 'guardian'])
                         ->where('center_id', $user->center_id)
                         ->findOrFail($id);

        if ($student->user) {
            $student->user->update(['status' => 'active']);
        }

        if ($student->guardian) {
            $student->guardian->update(['status' => 'active']);
        }

        $student->load([
            'user:id,name,email,phone,avatar,birth_date,status',
            'guardian:id,name,email,phone,avatar,status',
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
        $user = Auth::user();

        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل دخول أو لا يوجد مجمع'
            ], 403);
        }

        $student = Student::where('center_id', $user->center_id)
                         ->findOrFail($id);

        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم رفض طلب الطالب وحذف بياناته بنجاح'
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();

        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل دخول أو لا يوجد مجمع'
            ], 403);
        }

        $student = Student::with([
                'user:id,name,email,phone,avatar,birth_date,center_id,status',
                'guardian:id,name,email,phone',
                'center:id,name,subdomain'
            ])
            ->where('center_id', $user->center_id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    }

    public function linkGuardian($id, Request $request)
    {
        $user = Auth::user();

        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل دخول أو لا يوجد مجمع'
            ], 403);
        }

        $guardianEmail = $request->input('guardian_email');

        if (!$guardianEmail || !filter_var($guardianEmail, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'guardian_email' => ['البريد الإلكتروني مطلوب ويجب أن يكون صحيح']
            ]);
        }

        $student = Student::with('user')
                         ->where('center_id', $user->center_id)
                         ->findOrFail($id);

        $guardian = User::where('email', $guardianEmail)
                       ->where('center_id', $user->center_id)
                       ->first();

        if (!$guardian) {
            return response()->json([
                'success' => false,
                'message' => 'ولي الأمر غير مسجل في مجمعك'
            ], 404);
        }

        $student->update(['guardian_id' => $guardian->id]);

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
        $user = Auth::user();

        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل دخول أو لا يوجد مجمع'
            ], 403);
        }

        $guardianEmail = $request->input('guardian_email');

        if (!$guardianEmail || !filter_var($guardianEmail, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'guardian_email' => ['البريد الإلكتروني مطلوب ويجب أن يكون صحيح']
            ]);
        }

        if (User::where('email', $guardianEmail)
                ->where('center_id', $user->center_id)
                ->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'البريد الإلكتروني مسجل مسبقاً في مجمعك'
            ], 422);
        }

        $student = Student::with('user')
                         ->where('center_id', $user->center_id)
                         ->findOrFail($id);

        $guardian = User::create([
            'name' => 'ولي أمر ' . ($student->user->name ?? 'الطالب'),
            'email' => $guardianEmail,
            'password' => Hash::make('12345678'),
            'status' => 'active',
            'phone' => null,
            'center_id' => $user->center_id,
        ]);

        $student->update(['guardian_id' => $guardian->id]);

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
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل دخول'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'debug' => [
                'auth_user' => $user,
                'user_center_id' => $user->center_id,
                'has_center' => !empty($user->center_id),
                'students_table_columns' => Schema::getColumnListing('students'),
                'users_table_columns' => Schema::getColumnListing('users'),
                'total_students_in_center' => $user->center_id ? Student::where('center_id', $user->center_id)->count() : 0,
                'pending_students_count' => $user->center_id ? Student::where('center_id', $user->center_id)
                                                            ->whereHas('user', fn($q) => $q->where('status', 'pending'))
                                                            ->count() : 0,
            ]
        ]);
    }

    public function stats()
    {
        $user = Auth::user();

        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل دخول أو لا يوجد مجمع'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'stats' => [
                'center_id' => $user->center_id,
                'center_name' => optional($user->center)->name ?? 'غير محدد',
                'total_students' => Student::where('center_id', $user->center_id)->count(),
                'pending_students' => Student::where('center_id', $user->center_id)
                                            ->whereHas('user', fn($q) => $q->where('status', 'pending'))
                                            ->count(),
                'approved_students' => Student::where('center_id', $user->center_id)
                                             ->whereHas('user', fn($q) => $q->where('status', 'active'))
                                             ->count(),
                'pending_users' => User::where('center_id', $user->center_id)->where('status', 'pending')->count(),
                'active_users' => User::where('center_id', $user->center_id)->where('status', 'active')->count()
            ]
        ]);
    }
}