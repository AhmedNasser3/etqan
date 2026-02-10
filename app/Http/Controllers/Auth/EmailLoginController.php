<?php

namespace App\Http\Controllers\Auth;

use App\Models\Auth\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class EmailLoginController extends Controller
{
    /**
     * إرسال OTP للبريد الإلكتروني
     */
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بريد إلكتروني غير صالح',
            ], 422);
        }

        $email = strtolower(trim($request->email)); // توحيد شكل الإيميل

        // ✅ بحث عن المستخدم أولاً
        $user = User::where('email', $email)->first();
        $status = $user?->status ?? 'none'; // none يعني م_Handle برقم الـ user

        if ($user && $user->status !== 'active') {
            return response()->json([
                'success' => false,
                'reason' => 'pending', // استخدمه في الواجهة
                'message' => 'الحساب لم يتم قبوله بعد، انتظر التفعيل من الإدارة',
            ], 403);
        }

        // ✅ توليد OTP
        $otp = rand(1000, 9999);

        // ✅ حفظ في الـ Cache
        Cache::put("otp_{$email}", $otp, now()->addMinutes(10));
        Cache::put("email_session_{$otp}", $email, now()->addMinutes(10));

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال رمز التحقق بنجاح',
            'otp' => $otp,
            'email' => $email,
            'expires_in' => 10 * 60,               // ثواني
            'status' => $status === 'none' ? 'new' : $status,
        ]);
    }

    /**
     * التحقق من OTP وتسجيل الدخول
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'otp' => 'required|digits:4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق غير صحيح',
            ], 422);
        }

        $otp = $request->otp;
        $email = Cache::get("email_session_{$otp}");

        // ✅ تحقق من وجود الـ email في الـ Redis/session
        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية',
            ], 422);
        }

        // ✅ تحقق من صحة OTP
        $cachedOtp = Cache::get("otp_{$email}");

        if ($otp != $cachedOtp) {
            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق غير صحيح',
            ], 422);
        }

        // ✅ تنظيف الـ Cache بعد الاستخدام
        Cache::forget("otp_{$email}");
        Cache::forget("email_session_{$otp}");

        // ✅ البحث عن المستخدم أو إنشاؤه
        $user = User::where('email', $email)->first();

        if (!$user) {
            // ✅ إنشاء Guest/Input User بهوية مؤقتة
            $user = User::create([
                'name'          => 'مستخدم ضيف',
                'email'         => $email,
                'password'      => bcrypt(Str::random(12)),
                'status'        => 'active',
                'role'          => 'user',
                'created_from'  => 'otp_email'
            ]);
        } elseif ($user->status !== 'active') {
            // ✅ لو غير مُوقّح مسبقًا
            return response()->json([
                'success' => false,
                'reason' => 'pending',
                'message' => 'الحساب لم يتم قبوله بعد، انتظر التفعيل من الإدارة',
            ], 403);
        }

        // ✅ تسجيل الدخول
        Auth::login($user, true); // remember me

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