<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Centers\CenterController;

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