<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Auth\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class EmailLoginController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $otp = rand(1000, 9999);

        Cache::put("otp_{$request->email}", $otp, now()->addMinutes(10));
        Cache::put("email_session_{$otp}", $request->email, now()->addMinutes(10));

        return response()->json([
            'success' => true,
            'message' => 'تم ارسال رمز التحقق بنجاح',
            'otp' => $otp,
            'email' => $request->email
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|digits:4'
        ]);

        $otp = $request->otp;
        $email = Cache::get("email_session_{$otp}");

        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية'
            ], 422);
        }

        $cachedOtp = Cache::get("otp_{$email}");

        if ($otp != $cachedOtp) {
            return response()->json([
                'success' => false,
                'message' => 'رمز التحقق غير صحيح'
            ], 422);
        }

        Cache::forget("otp_{$email}");
        Cache::forget("email_session_{$otp}");

        $user = User::where('email', $email)->first();
        if (!$user) {
            $user = User::create([
                'name' => 'مستخدم جديد',
                'email' => $email,
                'password' => '',
                'status' => 'active'
            ]);
        }

        Auth::login($user);
        Session::put('email_login', $email);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'user' => $user
        ]);
    }
}
