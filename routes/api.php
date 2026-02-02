<?php
// Routes كاملة مع إضافة circles
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Plans\PlanController;
use App\Http\Controllers\Centers\CenterController;
use App\Http\Controllers\Centers\MosqueController;
use App\Http\Controllers\Circles\CirclesController;
use App\Http\Controllers\Plans\PlanDetailController;
use App\Http\Controllers\Teachers\TeacherController;
use App\Http\Controllers\Users\UserSuspendController;
use App\Http\Controllers\Auth\TeacherRegisterController;
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

    // إضافة Circles Routes داخل centers
    Route::prefix('centers')->name('centers.')->group(function () {
        // Circles Routes الجديدة
        // Route::prefix('circles')->name('circles.')->group(function () {
        //     Route::get('/', [CirclesController::class, 'index']);
        //     Route::post('/', [CirclesController::class, 'store']);
        //     Route::get('/{circle}', [CirclesController::class, 'show']);
        //     Route::put('/{circle}', [CirclesController::class, 'update']);
        //     Route::delete('/{circle}', [CirclesController::class, 'destroy']);
        // });

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
Route::middleware('web')->prefix('v1')->group(function () {
    Route::prefix('centers')->group(function () {
        // ✅ Index, Show, Update, Destroy → web middleware (للـ Auth)
        Route::get('circles', [CirclesController::class, 'index']);
        Route::get('circles/{circle}', [CirclesController::class, 'show']);
        Route::put('circles/{circle}', [CirclesController::class, 'update']);
        Route::delete('circles/{circle}', [CirclesController::class, 'destroy']);

        // ✅ Store بس → api middleware (بدون CSRF)
        Route::post('circles', [CirclesController::class, 'store'])->middleware('api');
    });

    // ✅ الـ endpoints الجديدة → web middleware (للـ Auth)
    Route::get('/centers', [CirclesController::class, 'getCenters'])->name('centers.index');
    Route::get('/mosques', [CirclesController::class, 'getMosques'])->name('mosques.index');
    Route::get('/teachers', [CirclesController::class, 'getTeachers'])->name('teachers.index');
});
// في routes/api.php
Route::prefix('v1')->name('api.v1.')->group(function () {
    // ✅ Plans Routes - هنا بس!
    Route::prefix('plans')->name('plans.')->group(function () {
        Route::get('/', [PlanController::class, 'index']);
        Route::post('/', [PlanController::class, 'store']);        // ← POST /api/v1/plans
        Route::get('/{plan}', [PlanController::class, 'show']);
        Route::put('/{plan}', [PlanController::class, 'update']);
        Route::delete('/{plan}', [PlanController::class, 'destroy']);
        Route::patch('/{plan}/next-day', [PlanController::class, 'nextDay']);
    });

    // ✅ Plan Details Routes
    Route::prefix('plans')->name('plan-details.')->group(function () {
        Route::get('/{plan}/details', [PlanDetailController::class, 'index']);
        Route::post('/{plan}/details', [PlanDetailController::class, 'store']);
    });

    // باقي الـ routes اللي شغالة...
});
