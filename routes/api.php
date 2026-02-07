<?php
// Routes كاملة مع إصلاح Route Model Binding + Schedule Create
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Plans\PlanController;
use App\Http\Controllers\Centers\CenterController;
use App\Http\Controllers\Centers\MosqueController;
use App\Http\Controllers\Circles\CirclesController;
use App\Http\Controllers\Plans\PlanDetailController;
use App\Http\Controllers\Teachers\TeacherController;
use App\Http\Controllers\Users\UserSuspendController;
use App\Http\Controllers\Auth\TeacherRegisterController;
use App\Http\Controllers\Student\StudentPlansController;
use App\Http\Controllers\Student\StudentBookingsController;
use App\Http\Controllers\Students\PendingStudentController;
use App\Http\Controllers\Plans\PlanCircleScheduleController;
use App\Http\Controllers\Routes\RouteCustomizationController;
use App\Http\Controllers\Plans\CircleStudentBookingController;




Route::middleware('web')->prefix('v1')->name('api.v1.')->group(function () {
    // ... باقي الـ routes ...

    // ✅ Student Bookings Routes - بدون nested prefix
    Route::get('plans/student-bookings', [StudentBookingsController::class, 'index'])->name('plans.student-bookings.index');
    Route::post('plans/student-bookings/{booking}/confirm', [StudentBookingsController::class, 'confirm'])->name('plans.student-bookings.confirm');

    // ... باقي الـ routes ...
});
// ✅ 1. API Routes (بدون web middleware)
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

// ✅ 2. Web Middleware Routes (للـ Forms + Schedules + CSRF)
Route::middleware('web')->prefix('v1')->group(function () {
    // ✅ NEW: Schedule Create Endpoints (الأهم - في البداية عشان أولوية)
    Route::prefix('schedule-create')->name('schedule-create.')->group(function () {
        Route::get('/plans', [PlanCircleScheduleController::class, 'getPlansForCreate']);
        Route::get('/circles', [PlanCircleScheduleController::class, 'getCirclesForCreate']);
        Route::get('/teachers', [PlanCircleScheduleController::class, 'getTeachersForCreate']);
    });

    // ✅ PLAN DETAILS CREATE - أضف ده 👇
    Route::prefix('plans')->name('plans.')->group(function () {
        Route::post('/details', [PlanDetailController::class, 'store']);
    });

    // ✅ Centers & Circles
    Route::prefix('centers')->group(function () {
        Route::get('circles', [CirclesController::class, 'index']);
        Route::get('circles/{circle}', [CirclesController::class, 'show']);
        Route::put('circles/{circle}', [CirclesController::class, 'update']);
        Route::delete('circles/{circle}', [CirclesController::class, 'destroy']);
        Route::post('circles', [CirclesController::class, 'store'])->middleware('api');
    });

    Route::get('/centers', [CirclesController::class, 'getCenters'])->name('centers.index');
    Route::get('/mosques', [CirclesController::class, 'getMosques'])->name('mosques.index');
    Route::get('/teachers', [CirclesController::class, 'getTeachers'])->name('teachers.index');

    // ✅ PLANS كاملة مع SCHEDULES
    Route::prefix('plans')->name('plans.')->group(function () {
        // 1️⃣ Custom routes (أولوية أولى)
        Route::get('/', [PlanDetailController::class, 'myCenterPlans']);
        Route::get('my-center-plans', [PlanDetailController::class, 'myCenterPlans']);
        Route::get('my-center', [PlanDetailController::class, 'myCenterPlans']);
        Route::get('details', [PlanDetailController::class, 'allMyCenterPlansDetails']);
        Route::get('my-center-schedules', [PlanCircleScheduleController::class, 'myCenterSchedules']);

        // 2️⃣ Plan CRUD
        Route::post('/', [PlanController::class, 'store']);
        Route::get('{plan}', [PlanController::class, 'show']);
        Route::put('{plan}', [PlanController::class, 'update']);
        Route::delete('{plan}', [PlanController::class, 'destroy']);
        Route::patch('{plan}/next-day', [PlanController::class, 'nextDay']);
        Route::get('{plan}/details', [PlanDetailController::class, 'index']);

        // 3️⃣ Plan Details CRUD
        Route::prefix('plan-details')->name('plan-details.')->group(function () {
            Route::post('/', [PlanDetailController::class, 'store']);
            Route::get('{planDetail}', [PlanDetailController::class, 'show']);
            Route::put('{planDetail}', [PlanDetailController::class, 'update']);
            Route::patch('{planDetail}/status', [PlanDetailController::class, 'updateStatus']);
            Route::delete('{planDetail}', [PlanDetailController::class, 'destroy']);
        });

        // 4️⃣ Schedules Routes ✅ (كاملة ومظبوطة)
        Route::prefix('schedules')->name('schedules.')->group(function () {
            Route::get('/', [PlanCircleScheduleController::class, 'myCenterSchedules']);  // كل مواعيدي
            Route::get('{plan_id}', [PlanCircleScheduleController::class, 'index']);      // مواعيد خطة
            Route::post('/', [PlanCircleScheduleController::class, 'store']);            // إنشاء

            Route::get('{planCircleSchedule}', [PlanCircleScheduleController::class, 'show']);
            Route::put('{planCircleSchedule}', [PlanCircleScheduleController::class, 'update']);
            Route::delete('{planCircleSchedule}', [PlanCircleScheduleController::class, 'destroy']);
            Route::post('{scheduleId}/book', [PlanCircleScheduleController::class, 'bookSlot']);
        });
    });

    // ✅ Backup routes (اختياري)
    Route::prefix('plan-details')->name('backup.plan-details.')->group(function () {
        Route::get('{planDetail}', [PlanDetailController::class, 'show']);
        Route::put('{planDetail}', [PlanDetailController::class, 'update']);
        Route::patch('{planDetail}/status', [PlanDetailController::class, 'updateStatus']);
        Route::delete('{planDetail}', [PlanDetailController::class, 'destroy']);
    });
});

Route::middleware('web')->prefix('v1')->group(function () {
    // ... باقي الـ routes

    // ✅ حجوزات الطلاب - ضعها هنا 👇
    Route::prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', [CircleStudentBookingController::class, 'myBookings']);
        Route::get('/{scheduleId}', [CircleStudentBookingController::class, 'scheduleBookings']);
        Route::post('/', [CircleStudentBookingController::class, 'store']);
        Route::delete('/{bookingId}', [CircleStudentBookingController::class, 'cancel']);
        Route::patch('/{bookingId}/progress', [CircleStudentBookingController::class, 'updateProgress']);
        Route::get('/stats', [CircleStudentBookingController::class, 'centerStats']);
    });

    // ... باقي الـ routes
});

Route::middleware('web')->prefix('v1')->group(function () {
    Route::prefix('student')->name('student.')->group(function () {
        Route::prefix('plans')->name('plans.')->group(function () {
            // ✅ الـ Routes القديمة
            Route::get('/available', [StudentPlansController::class, 'availablePlans'])->name('available');
            Route::get('/my-plans', [StudentPlansController::class, 'myPlans'])->name('my-plans');
            Route::get('/{plan}', [StudentPlansController::class, 'planDetails'])->name('details');

            // ✅ الـ Routes الجديدة للحجوزات
            Route::post('/schedules/{scheduleId}/book', [StudentPlansController::class, 'bookSchedule'])->name('book-schedule');
            Route::delete('/bookings/{bookingId}', [StudentPlansController::class, 'cancelBooking'])->name('cancel-booking');
            Route::get('/bookings', [StudentPlansController::class, 'myBookings'])->name('my-bookings');
        });

        // ✅ باقي الـ Routes خارج plans
        Route::get('/centers', [StudentPlansController::class, 'availableCenters'])->name('centers');
        Route::get('/stats', [StudentPlansController::class, 'studentStats'])->name('stats');
    });
});
