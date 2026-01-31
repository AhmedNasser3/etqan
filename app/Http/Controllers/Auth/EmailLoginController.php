<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Auth\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class EmailLoginController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $otp = rand(1000, 9999);

        // ✅ تخزين OTP في الـ Cache مع تحسين الأمان
        Cache::put("otp_{$request->email}", $otp, now()->addMinutes(10));
        Cache::put("email_session_{$otp}", $request->email, now()->addMinutes(10));

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال رمز التحقق بنجاح',
            'otp' => $otp,                    // ✅ للـ Development فقط
            'email' => $request->email,
            'expires_in' => 10 * 60           // ثواني
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|digits:4'
        ]);

        $otp = $request->otp;
        $email = Cache::get("email_session_{$otp}");

        // ✅ تحقق من وجود الـ email
        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية'
            ], 422);
        }

        $cachedOtp = Cache::get("otp_{$email}");

        // ✅ تحقق من صحة الـ OTP
        if ($otp != $cachedOtp) {
            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق غير صحيح'
            ], 422);
        }

        // ✅ مسح الـ Cache بعد الاستخدام
        Cache::forget("otp_{$email}");
        Cache::forget("email_session_{$otp}");

        // ✅ البحث عن المستخدم أو إنشاؤه
        $user = User::where('email', $email)->first();
        if (!$user) {
            $user = User::create([
                'name' => 'مستخدم جديد',
                'email' => $email,
                'password' => bcrypt(Str::random(12)),  // ✅ كلمة مرور آمنة
                'status' => 'active',
                'role' => 'user',                      // ✅ Role افتراضي
            ]);
        }

        // ✅ تسجيل الدخول مع الـ Session
        Auth::login($user, true);  // true = remember me
        Session::put('email_login', $email);
        Session::put('login_method', 'otp');

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'user',
                'status' => $user->status,
            ]
        ]);
    }
}