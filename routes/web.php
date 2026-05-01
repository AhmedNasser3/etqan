<?php

use App\Http\Controllers\Auth\AdminRegisterController;
use App\Http\Controllers\Auth\EmailLoginController;
use App\Http\Controllers\Auth\StudentRegistrationController;
use App\Http\Controllers\Auth\TeacherRegisterController;
use App\Http\Controllers\Plans\PlanCircleScheduleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
Route::prefix('admin')->name('admin.')->group(function () {
    Route::post('/register', [AdminRegisterController::class, 'register'])->name('register');
    Route::get('/centers', [AdminRegisterController::class, 'getCenters'])->name('centers');
    Route::get('/center/{centerSlug}', [AdminRegisterController::class, 'getCenterDetails'])->name('center.details');
});
Route::post('/student/register', [StudentRegistrationController::class, 'register']);
Route::middleware('web')->group(function () {
Route::get('/portal/{token}',             function () { return view('app'); });
Route::get('/portal/dashboard/{token}',   function () { return view('app'); });
    //  Auth Routes - هنا عشان الـ session تشتغل
    Route::post('/email/send-otp', [EmailLoginController::class, 'sendOtp']);
    Route::post('/email/verify-otp', [EmailLoginController::class, 'verifyOtp']);
    Route::post('/teacher/register', [TeacherRegisterController::class, 'register']);

    // 🔥 الـ API endpoint المحسن  مع جدول المعلمين + السناتر + الرولز كامل
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

                    //  جدول المعلمين - teacher status
                    'teacher' => $user->teacher ?? false,

                    //  صاحب السنتر - center_owner status
                    'center_owner' => $user->center_owner ?? false,

                    //  الرول الكامل مع الاسم
                    'role_id' => $user->role_id,
                    'role' => $user->role ? [
                        'id' => $user->role->id,
                        'name' => $user->role->name // student, center_owner, admin, user
                    ] : null,

                    //  بيانات السنتر كاملة
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

    //  Logout
    Route::post('/logout', function () {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return response()->json(['success' => true]);
    });
});

// 🔥 SPA catch-all مع التوجيه التلقائي للـ center
// 🔥 SPA catch-all مع التوجيه التلقائي للـ center + Admin check
Route::get('/{path?}', function (Request $request) {
    // لو الـ path هو "/" وفيه user مسجل دخول
    if ($request->path() === '/' && Auth::check()) {
        $user = Auth::user();

        //  تحقق الأول من جدول admins
        $isAdmin = \App\Models\Admin::where('user_id', $user->id)->exists();

        // لو admin أو عنده center
        if ($isAdmin || $user->center) {
            // لو admin يروح للـ admin dashboard
            if ($isAdmin) {
                return redirect('/admin-dashboard', 302);
            }

            // لو عنده center يروح للـ center
            $centerSlug = $user->center->subdomain ?? Str::slug($user->center->subdomain);
            return redirect("/{$centerSlug}", 302);
        }
    }

    // باقي الحالات عادي
    return view('app');
})->where('path', '.*');


//  TEST ROUTE - ضعه في أول web middleware group
Route::middleware('web')->prefix('v1')->group(function () {
    //  DEBUG ENDPOINT - اختبره الأول
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

    //  Schedule Create (الأساسي)
    Route::prefix('schedule-create')->name('schedule-create.')->group(function () {
        Route::get('plans', [PlanCircleScheduleController::class, 'getPlansForCreate']);
        Route::get('circles', [PlanCircleScheduleController::class, 'getCirclesForCreate']);
        Route::get('teachers', [PlanCircleScheduleController::class, 'getTeachersForCreate']);
    });
});
// Routes

// في نهاية routes/web.php
Route::get('/run-scheduler', function () {
    \Artisan::call('schedule:run');
    return ' Scheduler ran at ' . now();
});