<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\TeacherRegisterController;
use App\Http\Controllers\Centers\CenterController;
use App\Http\Controllers\Centers\MosqueController;
use App\Http\Controllers\Teachers\TeacherController;
use App\Http\Controllers\Users\UserSuspendController;
use App\Http\Controllers\Students\PendingStudentController;
use App\Http\Controllers\Routes\RouteCustomizationController;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::post('centers/{center}/teacher/register', [TeacherRegisterController::class, 'register']);

    Route::prefix('teachers')->name('teachers.')->group(function () {
        Route::get('/', [TeacherController::class, 'index']);
        Route::get('/pending', [TeacherController::class, 'pending']);
        Route::get('/{teacher}', [TeacherController::class, 'show']);
        Route::post('/{teacher}/accept', [TeacherController::class, 'accept']);
        Route::post('/{teacher}/reject', [TeacherController::class, 'reject']);
        Route::put('/{teacher}', [TeacherController::class, 'update']);
        Route::delete('/{teacher}', [TeacherController::class, 'destroy']);
    });

    Route::prefix('super')->name('super.')->group(function () {
        Route::prefix('centers')->name('centers.')->group(function () {
            Route::get('/', [CenterController::class, 'index']);
            Route::post('/register', [CenterController::class, 'register']);
            Route::get('/{center}', [CenterController::class, 'show']);
            Route::put('/{center}', [CenterController::class, 'update']);
            Route::delete('/{center}', [CenterController::class, 'destroy']);
            Route::patch('/{center}/activate', [CenterController::class, 'activate']);
            Route::patch('/{center}/deactivate', [CenterController::class, 'deactivate']);
        });

        Route::prefix('mosques')->name('mosques.')->group(function () {
            Route::get('/', [MosqueController::class, 'index']);
            Route::post('/', [MosqueController::class, 'store']);
            Route::get('/{mosque}', [MosqueController::class, 'show']);
            Route::put('/{mosque}', [MosqueController::class, 'update']);
            Route::delete('/{mosque}', [MosqueController::class, 'destroy']);
        });
    });

    Route::prefix('centers')->name('centers.')->group(function () {
        Route::prefix('pending-students')->name('pending-students.')->group(function () {
            Route::get('/', [PendingStudentController::class, 'index']);
            Route::get('/{student}', [PendingStudentController::class, 'show']);
            Route::post('/{student}/confirm', [PendingStudentController::class, 'confirm']);
            Route::delete('/{student}', [PendingStudentController::class, 'reject']);
            Route::get('/debug', [PendingStudentController::class, 'debug']);
        });

        Route::prefix('students')->name('students.')->group(function () {
            Route::post('/{student}/link-guardian', [PendingStudentController::class, 'linkGuardian']);
            Route::post('/{student}/create-guardian', [PendingStudentController::class, 'createGuardian']);
        });
    });

    Route::prefix('users')->name('users.')->group(function () {
        Route::get('suspended-teachers', [UserSuspendController::class, 'suspendedTeachers'])->name('suspended-teachers');
        Route::get('suspended-students', [UserSuspendController::class, 'suspendedStudents'])->name('suspended-students');
        Route::post('{user:teacher}/toggle-teacher-suspend', [UserSuspendController::class, 'toggleTeacherSuspend'])->name('toggle-teacher-suspend');
        Route::post('{user:student}/toggle-student-suspend', [UserSuspendController::class, 'toggleStudentSuspend'])->name('toggle-student-suspend');
        Route::delete('teachers/{teacher}', [UserSuspendController::class, 'deleteTeacher'])->name('delete-teacher');
        Route::delete('students/{student}', [UserSuspendController::class, 'deleteStudent'])->name('delete-student');
    });

    Route::prefix('route-customizations')->name('route-customizations.')->group(function () {
        Route::get('/', [RouteCustomizationController::class, 'index']);
        Route::post('/', [RouteCustomizationController::class, 'store']);
        Route::get('/{id}', [RouteCustomizationController::class, 'show']);
        Route::put('/{id}', [RouteCustomizationController::class, 'update']);
        Route::delete('/{id}', [RouteCustomizationController::class, 'destroy']);
    });
});