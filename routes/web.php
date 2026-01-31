<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Auth\EmailLoginController;
use App\Http\Controllers\Auth\StudentRegistrationController;
use App\Http\Controllers\Auth\TeacherRegisterController;

Route::middleware('web')->group(function () {
    // ✅ Auth Routes - هنا عشان الـ session تشتغل
    Route::post('/student/register', [StudentRegistrationController::class, 'register']);
    Route::post('/email/send-otp', [EmailLoginController::class, 'sendOtp']);
    Route::post('/email/verify-otp', [EmailLoginController::class, 'verifyOtp']);
    Route::post('/teacher/register', [TeacherRegisterController::class, 'register']);

    // ✅ User info
    Route::get('/api/user', function () {
        if (Auth::check()) {
            return response()->json([
                'success' => true,
                'user' => Auth::user()
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'غير مسجل دخول'
        ]);
    });

    // ✅ Logout
    Route::post('/logout', function () {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return response()->json(['success' => true]);
    });
});

// SPA catch-all
Route::get('/{path?}', function () {
    return view('app');
})->where('path', '.*');
