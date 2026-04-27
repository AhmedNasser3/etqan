<?php

namespace App\Http\Controllers\Certificate;

use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use App\Models\Certificate\Certificate;
use App\Models\Tenant\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        //  نفس الكود اللي اشتغل معاك
        $user = auth()->user();

        // جلب من الـ session (حل الـ login_web key)
        if (!$user) {
            $userId = Session::get('login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d');
            $user = $userId ? User::find($userId) : null;
        }

        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل الدخول أو لا يوجد مجمع'
            ], 401);
        }

        $centerId = $user->center_id;

        $students = Student::whereHas('user', function($q) use ($centerId) {
            $q->where('center_id', $centerId);
        })->with('user:id,name')->get();

        $certificates = Certificate::whereHas('user', function($q) use ($centerId) {
            $q->where('center_id', $centerId);
        })->with(['user:id,name', 'student:id_number,grade_level,circle,user_id'])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'certificates' => $certificates,
            'students' => $students->map(function($student) {
                return [
                    'id' => $student->id,
                    'user_id' => $student->user_id,
                    'id_number' => $student->id_number,
                    'grade_level' => $student->grade_level,
                    'circle' => $student->circle,
                    'user_name' => $student->user->name ?? 'غير معروف'
                ];
            })
        ]);
    }

    public function store(Request $request)
    {
        //  نفس منطق الـ index للـ user
        $user = Auth::user();

        // جلب من الـ session
        if (!$user) {
            $userId = Session::get('login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d');
            $user = $userId ? User::find($userId) : null;
        }

        //  فحص الـ user قبل أي حاجة
        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل الدخول أو لا يوجد مجمع'
            ], 401);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'certificate_image' => 'required|image|mimes:jpeg,png,pdf|max:2048',
        ]);

        // التأكد أن الطالب تابع لنفس المجمع
        $targetUser = User::findOrFail($request->user_id);
        if ($targetUser->center_id !== $user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسموح بإضافة شهادات لطلاب مجمع آخر'
            ], 403);
        }

        $imagePath = $request->file('certificate_image')->store('certificates', 'public');

        $certificate = Certificate::create([
            'center_id' => $user->center_id,
            'user_id' => $request->user_id,
            'certificate_image' => $imagePath
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الشهادة بنجاح',
            'certificate' => $certificate->load('user:id,name')
        ], 201);
    }

    public function show(Certificate $certificate)
    {
        //  نفس منطق الـ user
        $user = Auth::user();
        if (!$user) {
            $userId = Session::get('login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d');
            $user = $userId ? User::find($userId) : null;
        }

        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل الدخول'
            ], 401);
        }

        if ($certificate->center_id !== $user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسموح بالوصول لهذه الشهادة'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'certificate' => $certificate->load(['user:id,name', 'student:id_number,grade_level'])
        ]);
    }

    public function update(Request $request, Certificate $certificate)
    {
        //  نفس منطق الـ user
        $user = Auth::user();
        if (!$user) {
            $userId = Session::get('login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d');
            $user = $userId ? User::find($userId) : null;
        }

        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل الدخول'
            ], 401);
        }

        if ($certificate->center_id !== $user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسموح بتعديل شهادات مجمع آخر'
            ], 403);
        }

        $request->validate([
            'certificate_image' => 'nullable|image|mimes:jpeg,png,pdf|max:2048'
        ]);

        // حذف الصورة القديمة لو فيه صورة جديدة
        if ($request->hasFile('certificate_image')) {
            if ($certificate->certificate_image) {
                Storage::disk('public')->delete($certificate->certificate_image);
            }
            $imagePath = $request->file('certificate_image')->store('certificates', 'public');
            $certificate->update(['certificate_image' => $imagePath]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تعديل الشهادة بنجاح',
            'certificate' => $certificate->fresh()->load('user:id,name')
        ]);
    }

    public function destroy(Certificate $certificate)
    {
        //  نفس منطق الـ user
        $user = Auth::user();
        if (!$user) {
            $userId = Session::get('login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d');
            $user = $userId ? User::find($userId) : null;
        }

        if (!$user || !$user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل الدخول'
            ], 401);
        }

        if ($certificate->center_id !== $user->center_id) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسموح بحذف شهادات مجمع آخر'
            ], 403);
        }

        if ($certificate->certificate_image) {
            Storage::disk('public')->delete($certificate->certificate_image);
        }

        $certificate->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الشهادة بنجاح'
        ]);
    }
}
