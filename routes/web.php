<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\EmailLoginController;
use App\Http\Controllers\Teachers\AttendanceController;
use App\Http\Controllers\Auth\TeacherRegisterController;
use App\Http\Controllers\Auth\StudentRegistrationController;
use App\Http\Controllers\Plans\PlanCircleScheduleController;
use App\Http\Controllers\Permissions\UserPermissionsController;

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

// ✅ TEST ROUTE - ضعه في أول web middleware group
Route::middleware('web')->prefix('v1')->group(function () {
    // ✅ DEBUG ENDPOINT - اختبره الأول
    Route::get('debug-user', function () {
        $user = auth()->user();
        return response()->json([
            'user' => $user,
            'center_id' => $user?->center_id,
            'raw_user' => $user->toArray()
        ]);
    });

    // ✅ Schedule Create (الأساسي)
    Route::prefix('schedule-create')->name('schedule-create.')->group(function () {
        Route::get('plans', [PlanCircleScheduleController::class, 'getPlansForCreate']);
        Route::get('circles', [PlanCircleScheduleController::class, 'getCirclesForCreate']);
        Route::get('teachers', [PlanCircleScheduleController::class, 'getTeachersForCreate']);
    });
});

// في نهاية routes/web.php
Route::get('/run-scheduler', function () {
    \Artisan::call('schedule:run');
    return '✅ Scheduler ran at ' . now();
});