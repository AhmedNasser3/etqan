<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use App\Http\Controllers\Auth\EmailLoginController;
use App\Http\Controllers\Auth\TeacherRegisterController;
use App\Http\Controllers\Auth\StudentRegistrationController;
use App\Http\Controllers\Plans\PlanCircleScheduleController;

Route::middleware('web')->group(function () {
    // ✅ Auth Routes - هنا عشان الـ session تشتغل
    Route::post('/student/register', [StudentRegistrationController::class, 'register']);
    Route::post('/email/send-otp', [EmailLoginController::class, 'sendOtp']);
    Route::post('/email/verify-otp', [EmailLoginController::class, 'verifyOtp']);
    Route::post('/teacher/register', [TeacherRegisterController::class, 'register']);

    // 🔥 الـ API endpoint المحسن ✅ مع جدول المعلمين + السناتر + الرولز كامل
    Route::get('/api/user', function (Request $request) {
        if (Auth::check()) {
            $user = Auth::user();

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'center_id' => $user->center_id,

                    // ✅ جدول المعلمين - teacher status
                    'teacher' => $user->teacher ?? false,

                    // ✅ صاحب السنتر - center_owner status
                    'center_owner' => $user->center_owner ?? false,

                    // ✅ الرول الكامل مع الاسم
                    'role_id' => $user->role_id,
                    'role' => $user->role ? [
                        'id' => $user->role->id,
                        'name' => $user->role->name // student, center_owner, admin, user
                    ] : null,

                    // ✅ بيانات السنتر كاملة
                    'center' => $user->center ? [
                        'id' => $user->center->id,
                        'name' => $user->center->name,
                        'subdomain' => $user->center->subdomain,
                        'slug' => $user->center->subdomain ? Str::slug($user->center->subdomain) : null,
                    ] : null,
                ]
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

// 🔥 SPA catch-all مع التوجيه التلقائي للـ center
Route::get('/{path?}', function (Request $request) {
    // لو الـ path هو "/" وفيه user مسجل دخول وفيه center
    if ($request->path() === '/' && Auth::check()) {
        $user = Auth::user();
        if ($user->center) {
            $centerSlug = $user->center->subdomain ?? Str::slug($user->center->subdomain);
            return redirect("/{$centerSlug}", 302);
        }
    }

    // باقي الحالات عادي
    return view('app');
})->where('path', '.*');

// ✅ TEST ROUTE - ضعه في أول web middleware group
Route::middleware('web')->prefix('v1')->group(function () {
    // ✅ DEBUG ENDPOINT - اختبره الأول
    Route::get('debug-user', function () {
        $user = auth()->user();
        return response()->json([
            'user' => $user,
            'teacher_status' => $user?->teacher,
            'center_owner_status' => $user?->center_owner,
            'center_id' => $user?->center_id,
            'role' => $user?->role,
            'raw_user' => $user?->toArray(),
            'current_path' => request()->path()
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
