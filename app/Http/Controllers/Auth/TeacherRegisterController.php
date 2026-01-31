<?php
// app/Http/Controllers/Auth/TeacherRegisterController.php
namespace App\Http\Controllers\Auth;

use App\Models\Auth\User;
use App\Models\Tenant\Center;
use Illuminate\Support\Str;
use App\Models\Auth\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TeacherRegisterController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255|min:3',
            'role' => 'required|in:teacher,supervisor,motivator,student_affairs,financial',
            'session_time' => 'nullable|in:asr,maghrib',
            'email' => 'required|email:rfc,dns|max:255|unique:users,email',
            'notes' => 'nullable|string|max:1000',
            'gender' => 'required|in:male,female',
            'center_slug' => 'nullable|string|exists:centers,subdomain', // ✅ الـ slug الجديد
        ], [
            'full_name.required' => 'الاسم الرباعي مطلوب',
            'full_name.min' => 'الاسم يجب أن يكون 3 أحرف على الأقل',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'هذا البريد مسجل مسبقاً',
            'role.required' => 'يجب اختيار الدور',
            'gender.required' => 'يجب اختيار الجنس',
            'center_slug.exists' => 'مجمع غير موجود',
        ]);

        try {
            DB::beginTransaction();

            // ✅ جلب المجمع من الـ slug
            $center = $request->filled('center_slug')
                ? Center::where('subdomain', $request->center_slug)->firstOrFail()
                : null;

            // كلمة مرور عشوائية آمنة
            $randomPassword = Str::random(12);

            // ✅ إنشاء المستخدم مع center_id
            $user = User::create([
                'name' => $request->full_name,
                'email' => $request->email,
                'password' => Hash::make($randomPassword),
                'status' => 'pending',
                'gender' => $request->gender,
                'email_verified_at' => null,
                'center_id' => $center?->id, // ✅ ربط بالمجمع تلقائياً
            ]);

            // إنشاء بيانات المعلم
            Teacher::create([
                'user_id' => $user->id,
                'role' => $request->role,
                'session_time' => $request->session_time,
                'notes' => $request->notes,
                'center_id' => $center?->id, // ✅ نفس المجمع
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال طلب التسجيل بنجاح! سيتم مراجعته من الإدارة قريباً',
                'user_id' => $user->id,
                'temp_password' => $randomPassword,
                'center_name' => $center?->name ?? 'النظام العام',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Teacher Registration Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء معالجة الطلب، حاول مرة أخرى'
            ], 500);
        }
    }
}
