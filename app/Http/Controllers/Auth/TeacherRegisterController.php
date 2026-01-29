<?php
// app/Http/Controllers/Auth/TeacherRegisterController.php
namespace App\Http\Controllers\Auth;

use App\Models\Auth\User;
use Illuminate\Support\Str;
use App\Models\Auth\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;

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
            'gender' => 'required|in:male,female'
        ], [
            'full_name.required' => 'الاسم الرباعي مطلوب',
            'full_name.min' => 'الاسم يجب أن يكون 3 أحرف على الأقل',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'هذا البريد مسجل مسبقاً',
            'role.required' => 'يجب اختيار الدور',
            'gender.required' => 'يجب اختيار الجنس'
        ]);

        try {
            DB::beginTransaction();

            // كلمة مرور عشوائية آمنة
            $randomPassword = Str::random(12);

            // إنشاء المستخدم في جدول users
            $user = User::create([
                'name' => $request->full_name,
                'email' => $request->email,
                'password' => Hash::make($randomPassword),
                'status' => 'pending',
                'gender' => $request->gender,
                'email_verified_at' => null,
                'center_id' => null, // سيتم تعيينه لاحقاً من الإدارة
            ]);

            // إنشاء بيانات المعلم في جدول teachers
            Teacher::create([
                'user_id' => $user->id,
                'role' => $request->role,
                'session_time' => $request->session_time,
                'notes' => $request->notes,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال طلب التسجيل بنجاح! سيتم مراجعته من الإدارة قريباً',
                'user_id' => $user->id,
                'temp_password' => $randomPassword // للإدارة فقط
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
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