<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Centers\CenterController;
use App\Http\Controllers\Centers\MosqueController;
use App\Http\Controllers\Auth\EmailLoginController;
use App\Http\Controllers\Auth\TeacherRegisterController;
use App\Http\Controllers\Auth\StudentRegistrationController;

// routes/api.php - أضف middleware للـ super routes
Route::prefix('super')->group(function () {
    Route::prefix('centers')->group(function () {
        Route::get('/', [CenterController::class, 'index']);
        Route::post('/register', [CenterController::class, 'register']);
        Route::get('/{id}', [CenterController::class, 'show']);
        Route::put('/{id}', [CenterController::class, 'update']);
        Route::delete('/{id}', [CenterController::class, 'destroy']);
        Route::patch('/{id}/activate', [CenterController::class, 'activate']);
        Route::patch('/{id}/deactivate', [CenterController::class, 'deactivate']);
    });
});

// Public routes زي ما هي
Route::post('/student/register', [StudentRegistrationController::class, 'register']);
Route::post('/email/send-otp', [EmailLoginController::class, 'sendOtp']);
Route::post('/email/verify-otp', [EmailLoginController::class, 'verifyOtp']);
Route::post('/teacher/register', [TeacherRegisterController::class, 'register']);
// routes/api.php - نفس الكود السابق
Route::prefix('super/mosques')->name('super.mosques.')->group(function () {
    Route::get('/', [MosqueController::class, 'index']);
    Route::post('/', [MosqueController::class, 'store']);
    Route::get('/{id}', [MosqueController::class, 'show']);
    Route::put('/{id}', [MosqueController::class, 'update']);
    Route::delete('/{id}', [MosqueController::class, 'destroy']);
});
