<?php
// Routes كاملة مع إصلاح Route Model Binding + Schedule Create
use App\Http\Controllers\Account\AccountController;
use App\Http\Controllers\Auth\TeacherRegisterController;
use App\Http\Controllers\Center\IdeaDomainRequestController;
use App\Http\Controllers\Centers\CenterController;
use App\Http\Controllers\Centers\MosqueController;
use App\Http\Controllers\Centers\PendingCentersController;
use App\Http\Controllers\Circles\CirclesController;
use App\Http\Controllers\Guardian\GuardianChildrenController;
use App\Http\Controllers\Meetings\TeacherStudentMeetingController;
use App\Http\Controllers\Permissions\UserPermissionsController;
use App\Http\Controllers\Plans\CircleStudentBookingController;
use App\Http\Controllers\Plans\PlanCircleScheduleController;
use App\Http\Controllers\Plans\PlanController;
use App\Http\Controllers\Plans\PlanDetailController;
use App\Http\Controllers\Plans\StudentPlanController;
use App\Http\Controllers\Reports\ReportsController;
use App\Http\Controllers\Reports\StatsController;
use App\Http\Controllers\Routes\RouteCustomizationController;
use App\Http\Controllers\Student\SpecialRequestController;
use App\Http\Controllers\Student\StudentAchievementController;
use App\Http\Controllers\Student\StudentAffairsController;
use App\Http\Controllers\Student\StudentBookingsController;
use App\Http\Controllers\Student\StudentPlansController;
use App\Http\Controllers\Students\PendingStudentController;
use App\Http\Controllers\Students\StudentUserController;
use App\Http\Controllers\Students\TeacherStudentSessionsController;
use App\Http\Controllers\Teachers\AttendanceController;
use App\Http\Controllers\Teachers\MyTeachersController;
use App\Http\Controllers\Teachers\TeacherController;
use App\Http\Controllers\Teachers\TeacherCustomSalaryController;
use App\Http\Controllers\Teachers\TeacherPayrollController;
use App\Http\Controllers\Teachers\TeacherPlanSchedulesController;
use App\Http\Controllers\Teachers\TeacherRoomController;
use App\Http\Controllers\Teachers\TeacherSalaryController;
use App\Http\Controllers\Teachers\TeacherStudentsController;
use App\Http\Controllers\User\FeaturedController;
use App\Http\Controllers\Users\UserSuspendController;
use App\Models\Auth\User;
use Illuminate\Support\Facades\Route;
// routes/api.php
Route::middleware(['web'])->prefix('v1/teachers')->group(function () {
    Route::get('my-teachers', [MyTeachersController::class, 'index']);
    Route::get('my-teachers/pending', [MyTeachersController::class, 'pending']);
    Route::put('my-teachers/{id}', [MyTeachersController::class, 'update']);
    Route::delete('my-teachers/{id}', [MyTeachersController::class, 'destroy']);

    // 🔁 Toggle: تفعيل/تعطيل معلم (Active ↔ Suspended)
    Route::post('my-teachers/{id}/toggle-status', [MyTeachersController::class, 'toggleStatus']);
});

Route::middleware(['web'])->prefix('v1/teacher')->name('teacher.')->group(function () {
    Route::apiResource('custom-salaries', TeacherCustomSalaryController::class);
    Route::patch('custom-salaries/{id}/toggle', [TeacherCustomSalaryController::class, 'toggleActive']);
    Route::get('custom-salaries/teacher/{teacherId}', [TeacherCustomSalaryController::class, 'getActiveForTeacher']);
});

// routes/api.php - الكامل مع كل الـ routes
Route::middleware(['web'])->prefix('v1/teachers')->group(function () {
    Route::get('room', [TeacherRoomController::class, 'getTeacherRoom']);
    Route::get('today-meet', [TeacherRoomController::class, 'getTodayMeet']);
    Route::get('sessions', [TeacherRoomController::class, 'getTeacherSessions']);

    //  الجديد - جلسات الطلاب
    Route::get('student-sessions', [TeacherStudentSessionsController::class, 'getTeacherStudentSessions']);
    Route::post('student-sessions/update', [TeacherStudentSessionsController::class, 'updateSessionStatus']);
    Route::get('student-sessions/attendance', [TeacherStudentSessionsController::class, 'getSessionAttendance']);
    });

    Route::middleware('web')->get('/v1/teacher-sessions', [TeacherStudentSessionsController::class, 'getTeacherStudentSessions'])
    ->name('teacher.student.sessions');

    Route::middleware(['web'])->prefix('v1/super')->group(function () {
    Route::prefix('centers')->group(function () {
    Route::get('/pending', [PendingCentersController::class, 'index']);
    Route::get('/pending/{id}', [PendingCentersController::class, 'show']);
    Route::post('/pending/{id}/confirm', [PendingCentersController::class, 'confirm']);
    Route::post('/pending/{id}/reject', [PendingCentersController::class, 'reject']);
    Route::delete('/pending/{id}', [PendingCentersController::class, 'destroy']);
    });
    });

// routes/api.php

//  1. Debug Routes (في الأول)
Route::get('/debug-students', function() {
    $user = auth()->user();
    $centerId = $user ? $user->center_id : 5;

    $count = \App\Models\Tenant\Student::where('center_id', $centerId)->count();

    return response()->json([
        'user_id' => $user?->id,
        'center_id' => $centerId,
        'students_count' => $count,
        'students' => \App\Models\Tenant\Student::where('center_id', $centerId)->limit(5)->get(['id', 'name', 'center_id'])
    ]);
});

//  2. PUBLIC API Routes (بدون web middleware)
Route::prefix('v1')->name('api.v1.')->group(function () {
    // Teacher Registration (Public)
    Route::post('centers/{center}/teacher/register', [TeacherRegisterController::class, 'register']);
});

//  Special Requests Routes - داخل web middleware
Route::middleware('web')->prefix('v1')->name('api.v1.')->group(function () {
    //  سجلات الحضور والغياب
    Route::prefix('attendance')->name('attendance.')->group(function () {
        // 🔥 Staff Admin Routes - **أول حاجة تماماً** (قبل أي Model Binding)
        Route::get('/staff-list', [AttendanceController::class, 'staffAttendance'])->name('staff.list');
        Route::put('/staff/{attendanceId}/mark', [AttendanceController::class, 'markStaffAttendance'])
             ->where('attendanceId', '[0-9]+')  //  أرقام بس
             ->name('staff.mark');

        //  الـ Routes القديمة للـ Teacher (Model Binding)
        Route::get('/', [AttendanceController::class, 'index']);
        Route::post('/', [AttendanceController::class, 'store']);
        Route::get('/{attendanceDay}', [AttendanceController::class, 'show']);
        Route::put('/{attendanceDay}', [AttendanceController::class, 'update']);
        Route::delete('/{attendanceDay}', [AttendanceController::class, 'destroy']);
        // 🆕 QUICK CHECK-IN - **زر الحضور السريع** 🔥
        Route::post('/quick-checkin', [AttendanceController::class, 'quickCheckin'])->name('quick.checkin');
        //  إحصائيات وحالة اليوم
        Route::get('/stats', [AttendanceController::class, 'stats']);
        Route::get('/today', [AttendanceController::class, 'today']);
        Route::get('/circles', [AttendanceController::class, 'availableCircles']);
    });

    //  رواتب المعلمين - زي ما هي
    Route::prefix('teacher-salaries')->name('teacher-salaries.')->group(function () {
        Route::get('/', [TeacherSalaryController::class, 'index']);
        Route::post('/', [TeacherSalaryController::class, 'store']);
        Route::get('/{teacherSalary}', [TeacherSalaryController::class, 'show']);
        Route::put('/{teacherSalary}', [TeacherSalaryController::class, 'update']);
        Route::delete('/{teacherSalary}', [TeacherSalaryController::class, 'destroy']);
    });

    // 🔥 🔥 🔥 Special Requests Routes
    Route::prefix('special-requests')->name('special-requests.')->group(function () {
        //  القائمة والإحصائيات (أولاً)
        Route::get('/', [SpecialRequestController::class, 'index'])->name('index');
        Route::get('/search', [SpecialRequestController::class, 'search'])->name('search');

        //  العمليات على عنصر واحد (Model Binding)
        Route::get('/{specialRequest}', [SpecialRequestController::class, 'show'])->name('show');
        Route::put('/{specialRequest}', [SpecialRequestController::class, 'update'])->name('update');
        Route::delete('/{specialRequest}', [SpecialRequestController::class, 'destroy'])->name('destroy');

        //  إضافة جديد (POST آخر حاجة)
        Route::post('/', [SpecialRequestController::class, 'store'])->name('store');
    });
});



//  3. TEACHER REGISTER Routes (مع web middleware)
Route::middleware('web')->prefix('v1')->name('api.v1.')->group(function () {
    // Teacher Registration Forms
    Route::post('/teacher/register', [TeacherRegisterController::class, 'register'])->name('teacher.register');
    Route::get('/teacher/register/centers/{center}/circles', [TeacherRegisterController::class, 'getCirclesByCenterSlug'])->name('teacher.circles.by-center');
    Route::get('/teacher/register/centers/{center}/circles/{circle}/schedules', [TeacherRegisterController::class, 'getCircleSchedules'])->name('teacher.schedules.by-circle');
    Route::get('/teacher/register/circles', [TeacherRegisterController::class, 'getCirclesByCenter'])->name('teacher.circles');
});

//  4. STUDENT AFFAIRS Routes
Route::middleware('web')->prefix('v1')->name('api.v1.')->group(function () {
    Route::prefix('student-affairs')->name('student-affairs.')->group(function () {
        Route::get('/', [StudentAffairsController::class, 'index'])->name('index');
        Route::get('/{id}', [StudentAffairsController::class, 'show'])->name('show');
        Route::put('/{id}', [StudentAffairsController::class, 'update'])->name('update');
        Route::post('/{id}/attendance', [StudentAffairsController::class, 'updateAttendance'])->name('attendance');
        Route::post('/{id}/pay-balance', [StudentAffairsController::class, 'payBalance'])->name('pay-balance');
        Route::post('/{id}/whatsapp', [StudentAffairsController::class, 'whatsappReminder'])->name('whatsapp');
        Route::get('/{id}/print-card', [StudentAffairsController::class, 'printCard'])->name('print-card');
    });
});

//  5. STUDENT ACHIEVEMENTS Routes
Route::middleware('web')->prefix('v1')->name('api.v1.')->group(function () {
    // Achievements
    Route::prefix('achievements')->name('achievements.')->group(function () {
        Route::get('/', [StudentAchievementController::class, 'index'])->name('index');
        Route::post('/', [StudentAchievementController::class, 'store'])->name('store');
        Route::get('/student/{student}', [StudentAchievementController::class, 'studentTotalPoints'])->name('student.total');
        Route::get('{achievement}', [StudentAchievementController::class, 'show'])->name('show');
        Route::put('{achievement}', [StudentAchievementController::class, 'update'])->name('update');
        Route::delete('{achievement}', [StudentAchievementController::class, 'destroy'])->name('destroy');
    });

    Route::get('users/students', [StudentAchievementController::class, 'getCenterStudents'])->name('users.students');
    Route::get('test-achievements', function() {
        return response()->json(['message' => 'Achievements API شغالة!']);
    });
});
//  في routes/api.php - أضف مع student-bookings
Route::middleware('web')->prefix('v1')->name('api.v1.')->group(function () {
    // 🔥 🔥 PAYROLL ROUTES
    Route::get('teacher/payrolls', [TeacherPayrollController::class, 'index'])
        ->name('teacher.payrolls.index');

    //  أضف POST للإنشاء ← هنا المشكلة!
    Route::post('teacher/payrolls', [TeacherPayrollController::class, 'store'])
        ->name('teacher.payrolls.store');

    Route::patch('teacher/payrolls/{id}/paid', [TeacherPayrollController::class, 'markPaid'])
        ->name('teacher.payrolls.paid');
});


//  6. STUDENT BOOKINGS Routes
Route::middleware('web')->prefix('v1')->name('api.v1.')->group(function () {
    //  Student Bookings Routes (الحالية)
    Route::get('plans/student-bookings', [StudentBookingsController::class, 'index'])
        ->name('plans.student-bookings.index');

    Route::post('plans/student-bookings/{booking}/confirm', [StudentBookingsController::class, 'confirm'])
        ->name('plans.student-bookings.confirm');

    //  Student Plans Routes (الجديدة)
    Route::middleware('web')->get('student/plans', [StudentPlanController::class, 'getUserPlans'])
        ->name('student.plans.index');
});

//  7. MAIN WEB ROUTES (الأساسية مع web middleware) - جميع الـ routes الرئيسية
Route::middleware('web')->prefix('v1')->name('api.v1.')->group(function () {
    Route::prefix('idea-domain-requests')->name('idea-domain-requests.')->group(function () {
        Route::get('/', [IdeaDomainRequestController::class, 'index']);
        Route::post('/', [IdeaDomainRequestController::class, 'store']);
        Route::get('/{ideaDomainRequest}', [IdeaDomainRequestController::class, 'show']);
        Route::put('/{ideaDomainRequest}', [IdeaDomainRequestController::class, 'update']);
        Route::delete('/{ideaDomainRequest}', [IdeaDomainRequestController::class, 'destroy']);
    });
});
// in api routes
// في web.php - استبدل الـ routes القديمة بهذه:
Route::middleware(['web'])->prefix('v1')->name('api.v1.')->group(function () {
    Route::prefix('centers')->name('centers.')->group(function () {
        Route::prefix('pending-students')->name('pending-students.')->group(function () {
            // ✅ GET routes
            Route::get('/', [PendingStudentController::class, 'index']);
            Route::get('/{student}', [PendingStudentController::class, 'show']);

            // ✅ POST confirm ✅
            Route::post('/{student}/confirm', [PendingStudentController::class, 'confirm']);

            // ✅ DELETE reject ✅
            Route::delete('/{student}', [PendingStudentController::class, 'reject']);

            // ✅ Debug
            Route::get('/debug', [PendingStudentController::class, 'debug']);
        });

        // ✅ Guardian routes
        Route::prefix('students')->name('students.')->group(function () {
            Route::post('/{student}/link-guardian', [PendingStudentController::class, 'linkGuardian']);
            Route::post('/{student}/create-guardian', [PendingStudentController::class, 'createGuardian']);
        });
    });
});

Route::middleware('web')->prefix('v1')->group(function () {
    //  Idea Domain Requests (في البداية كما طلبت)

    // Schedule Create (أولوية عالية)
    Route::prefix('schedule-create')->name('schedule-create.')->group(function () {
        Route::get('/plans', [PlanCircleScheduleController::class, 'getPlansForCreate']);
        Route::get('/circles', [PlanCircleScheduleController::class, 'getCirclesForCreate']);
        Route::get('/teachers', [PlanCircleScheduleController::class, 'getTeachersForCreate']);
    });

  //  Centers & Circles - الكاملة
    Route::get('/centers', [CirclesController::class, 'getCenters'])->name('centers.index');

    //  Circles CRUD - الكامل
    Route::prefix('centers')->group(function () {
        // قائمة الحلقات
        Route::get('circles', [CirclesController::class, 'index'])->name('circles.index');

        // حلقة واحدة  (ده اللي كان مش شغال)
        Route::get('circles/{circle}', [CirclesController::class, 'show'])->name('circles.show');

        // إنشاء حلقة جديدة  (كان ناقص)
        Route::post('circles', [CirclesController::class, 'store'])->name('circles.store');

        // تعديل حلقة
        Route::put('circles/{circle}', [CirclesController::class, 'update'])->name('circles.update');
        Route::patch('circles/{circle}', [CirclesController::class, 'update'])->name('circles.update'); // fallback

        // حذف حلقة
        Route::delete('circles/{circle}', [CirclesController::class, 'destroy'])->name('circles.destroy');

        //  مساجد المجمع (جديد ومطلوب)
        Route::get('{center}/mosques', [CirclesController::class, 'getCenterMosques'])->name('centers.mosques');

        //  معلمي المجمع (جديد ومطلوب)
        Route::get('{center}/teachers', [CirclesController::class, 'getCenterTeachers'])->name('centers.teachers');
    });

    //  Global lists (للـ dropdowns)
    Route::get('/mosques', [CirclesController::class, 'getMosques'])->name('mosques.index');
    Route::get('/teachers', [CirclesController::class, 'getTeachers'])->name('teachers.index');
    // Plans (الكاملة مع Schedules)
    Route::prefix('plans')->name('plans.')->group(function () {
        // Custom routes (أولوية أولى)
        Route::get('/', [PlanDetailController::class, 'myCenterPlans']);
        Route::get('my-center-plans', [PlanDetailController::class, 'myCenterPlans']);
        Route::get('my-center', [PlanDetailController::class, 'myCenterPlans']);
        Route::get('details', [PlanDetailController::class, 'allMyCenterPlansDetails']);
        Route::get('my-center-schedules', [PlanCircleScheduleController::class, 'myCenterSchedules']);

        // Plan CRUD
        Route::post('/', [PlanController::class, 'store']);
        Route::get('{plan}', [PlanController::class, 'show']);
        Route::put('{plan}', [PlanController::class, 'update']);
        Route::delete('{plan}', [PlanController::class, 'destroy']);
        Route::patch('{plan}/next-day', [PlanController::class, 'nextDay']);
        Route::get('{plan}/details', [PlanDetailController::class, 'index']);

        // Plan Details Create
        Route::post('/details', [PlanDetailController::class, 'store']);

    //  BULK IMPORT - الجديد للـ Excel
        Route::delete('/plan-details/bulk-delete', [PlanDetailController::class, 'bulkDelete'])
        ->name('plans.plan-details.bulk-delete');
    Route::post('{plan}/bulk-import', [PlanDetailController::class, 'bulkImport']);
        // Plan Details CRUD
        Route::prefix('plan-details')->name('plan-details.')->group(function () {
            Route::post('/', [PlanDetailController::class, 'store']);
            Route::get('{planDetail}', [PlanDetailController::class, 'show']);
            Route::put('{planDetail}', [PlanDetailController::class, 'update']);
            Route::patch('{planDetail}/status', [PlanDetailController::class, 'updateStatus']);
            Route::delete('{planDetail}', [PlanDetailController::class, 'destroy']);
        });

    // 🔥 7️⃣ Jitsi Regenerate - **الناقص الأساسي** 🔥
    Route::patch('schedules/{schedule}/jitsi-regenerate', [PlanCircleScheduleController::class, 'regenerateJitsiRoom'])
        ->where('schedule', '[0-9]+')
        ->name('schedules.jitsi-regenerate');
        // Schedules Routes (كاملة)
        Route::prefix('schedules')->name('schedules.')->group(function () {
            Route::get('/', [PlanCircleScheduleController::class, 'myCenterSchedules']);
            Route::get('{plan_id}', [PlanCircleScheduleController::class, 'index']);
            Route::post('/', [PlanCircleScheduleController::class, 'store']);
            Route::get('{planCircleSchedule}', [PlanCircleScheduleController::class, 'show']);
            Route::put('{planCircleSchedule}', [PlanCircleScheduleController::class, 'update']);
            Route::delete('{planCircleSchedule}', [PlanCircleScheduleController::class, 'destroy']);
            Route::post('{scheduleId}/book', [PlanCircleScheduleController::class, 'bookSlot']);
        });
    });

    // Student Bookings
    Route::prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', [CircleStudentBookingController::class, 'myBookings']);
        Route::get('/{scheduleId}', [CircleStudentBookingController::class, 'scheduleBookings']);
        Route::post('/', [CircleStudentBookingController::class, 'store']);
        Route::delete('/{bookingId}', [CircleStudentBookingController::class, 'cancel']);
        Route::patch('/{bookingId}/progress', [CircleStudentBookingController::class, 'updateProgress']);
        Route::get('/stats', [CircleStudentBookingController::class, 'centerStats']);
    });

    // Student Routes
    Route::prefix('student')->name('student.')->group(function () {
        Route::prefix('plans')->name('plans.')->group(function () {
            Route::get('/available', [StudentPlansController::class, 'availablePlans'])->name('available');
            Route::get('/my-plans', [StudentPlansController::class, 'myPlans'])->name('my-plans');
            Route::get('/{plan}', [StudentPlansController::class, 'planDetails'])->name('details');
            Route::post('/schedules/{schedule}/book', [StudentPlansController::class, 'bookSchedule'])->name('book-schedule');
            Route::delete('/bookings/{booking}', [StudentPlansController::class, 'cancelBooking'])->name('cancel-booking');
            Route::get('/bookings', [StudentPlansController::class, 'myBookings'])->name('my-bookings');
        });

        Route::get('/centers', [StudentPlansController::class, 'availableCenters'])->name('centers');
        Route::get('/stats', [StudentPlansController::class, 'studentStats'])->name('stats');
    });

    // Backup routes
    Route::prefix('plan-details')->name('backup.plan-details.')->group(function () {
        Route::get('{planDetail}', [PlanDetailController::class, 'show']);
        Route::put('{planDetail}', [PlanDetailController::class, 'update']);
        Route::patch('{planDetail}/status', [PlanDetailController::class, 'updateStatus']);
        Route::delete('{planDetail}', [PlanDetailController::class, 'destroy']);
    });
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


        });

//  مجموعة routes للمجمعات المعلقة


//  8. SUPER ADMIN & OTHER API Routes (بدون web middleware - بدون تكرار)
Route::prefix('v1')->name('api.v1.')->group(function () {
    // Super Admin Routes
    Route::prefix('super')->name('super.')->group(function () {


        Route::prefix('mosques')->name('mosques.')->group(function () {
            Route::get('/', [MosqueController::class, 'index']);
            Route::post('/', [MosqueController::class, 'store']);
            Route::get('/{mosque}', [MosqueController::class, 'show']);
            Route::put('/{mosque}', [MosqueController::class, 'update']);
            Route::delete('/{mosque}', [MosqueController::class, 'destroy']);
        });
    });

    // Teachers Management
    Route::prefix('teachers')->name('teachers.')->group(function () {
        Route::get('/', [TeacherController::class, 'index']);
        Route::get('/pending', [TeacherController::class, 'pending']);
        Route::get('/{teacher}', [TeacherController::class, 'show']);
        Route::post('/{teacher}/accept', [TeacherController::class, 'accept']);
        Route::post('/{teacher}/reject', [TeacherController::class, 'reject']);
        Route::put('/{teacher}', [TeacherController::class, 'update']);
        Route::delete('/{teacher}', [TeacherController::class, 'destroy']);
    });



    // User Suspensions
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('suspended-teachers', [UserSuspendController::class, 'suspendedTeachers'])->name('suspended-teachers');
        Route::get('suspended-students', [UserSuspendController::class, 'suspendedStudents'])->name('suspended-students');
        Route::post('{user:teacher}/toggle-teacher-suspend', [UserSuspendController::class, 'toggleTeacherSuspend'])->name('toggle-teacher-suspend');
        Route::post('{user:student}/toggle-student-suspend', [UserSuspendController::class, 'toggleStudentSuspend'])->name('toggle-student-suspend');
        Route::delete('teachers/{teacher}', [UserSuspendController::class, 'deleteTeacher'])->name('delete-teacher');
        Route::delete('students/{student}', [UserSuspendController::class, 'deleteStudent'])->name('delete-student');
    });

    // Route Customizations
    Route::prefix('route-customizations')->name('route-customizations.')->group(function () {
        Route::get('/', [RouteCustomizationController::class, 'index']);
        Route::post('/', [RouteCustomizationController::class, 'store']);
        Route::get('/{id}', [RouteCustomizationController::class, 'show']);
        Route::put('/{id}', [RouteCustomizationController::class, 'update']);
        Route::delete('/{id}', [RouteCustomizationController::class, 'destroy']);
    });
});
Route::middleware(['web'])->group(function () {
    Route::get('/user/permissions', [UserPermissionsController::class, 'getPermissions'])
         ->name('user.permissions');
});
Route::get('/featured', [FeaturedController::class, 'show']);
Route::prefix('v1')->name('api.v1.')->middleware('web')->group(function () {
    // Account Management (Authenticated)
    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/edit', [AccountController::class, 'edit']);
        Route::post('/update', [AccountController::class, 'update']);
        Route::delete('/delete', [AccountController::class, 'destroy']);
    });
});
Route::prefix('v1')->name('api.v1.')->middleware('web')->group(function () {
    // Account Management (Authenticated)
    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/edit', [AccountController::class, 'edit']);
        Route::post('/update', [AccountController::class, 'update']);
        Route::delete('/delete', [AccountController::class, 'destroy']);
    });

    //  Teacher-Student Meetings Routes
    Route::prefix('meetings')->name('meetings.')->group(function () {
        Route::get('/', [TeacherStudentMeetingController::class, 'index']);
        Route::post('/', [TeacherStudentMeetingController::class, 'store']);
        Route::get('/student/{studentId}', [TeacherStudentMeetingController::class, 'getStudentMeetings']);
        Route::get('/teacher/{teacherId}', [TeacherStudentMeetingController::class, 'getTeacherMeetings']);

        Route::get('{id}', [TeacherStudentMeetingController::class, 'show']);
        Route::patch('{id}/join', [TeacherStudentMeetingController::class, 'updateJoinStatus']);
        Route::delete('{id}', [TeacherStudentMeetingController::class, 'destroy']);
    });
});
// routes/api.php
Route::middleware('web')->group(function () {
    Route::get('/v1/teacher-plan-schedules', [TeacherPlanSchedulesController::class, 'getTeacherPlanSchedules']); //  الجديد
    });
Route::middleware('web')->group(function () {
    Route::get('/v1/user/next-meet', [StudentUserController::class, 'getNextMeet']);
    Route::get('/v1/user/progress', [StudentUserController::class, 'getStudentProgress']);
    Route::get('/v1/user/presence', [StudentUserController::class, 'getStudentPresence']);
    Route::get('/v1/user/complex', [StudentUserController::class, 'getUserComplex']);

    //  روت الطلاب الفريدين للمعلم
    Route::get('/v1/teacher/unique-students', [TeacherStudentsController::class, 'getUniqueStudents']);

    //  روت تغيير حالة الطالب
    Route::post('/v1/teacher/students/{studentId}/toggle-status', [TeacherStudentsController::class, 'toggleStudentStatus']);

    //  ============ إنجازات طلاب المعلم ============

    // جلب طلاب المعلم للإنجازات
    Route::get('/v1/teacher/students', [TeacherStudentsController::class, 'getTeacherStudents']);

    // عرض جميع إنجازات طلاب المعلم
    Route::get('/v1/teacher/achievements', [TeacherStudentsController::class, 'index']);

    // إضافة إنجاز جديد لطالب
    Route::post('/v1/teacher/achievements', [TeacherStudentsController::class, 'store']);

    // حساب النقاط الصافية للطالب
    Route::get('/v1/teacher/students/{studentId}/points', [TeacherStudentsController::class, 'studentTotalPoints']);
});

// في routes/web.php أو routes/api.php
Route::middleware('web')->prefix('v1/reports')->name('reports.')->group(function () {
    //  جلب كل التقارير
    Route::get('/', [ReportsController::class, 'index'])->name('index');

    //  تقارير الحضور
    Route::get('/attendance/{period}', [ReportsController::class, 'attendance'])->name('attendance');
    Route::get('/attendance', [ReportsController::class, 'attendance'])->name('attendance.list');

    //  تقارير الرواتب
    Route::get('/payroll/{period}', [ReportsController::class, 'payroll'])->name('payroll');
    Route::get('/payroll', [ReportsController::class, 'payroll'])->name('payroll.list');

    //  تقارير الإنجازات
    Route::get('/achievements/{period}', [ReportsController::class, 'achievements'])->name('achievements');
    Route::get('/achievements', [ReportsController::class, 'achievements'])->name('achievements.list');

    // 🔥  تقارير السجلات الإدارية - **المحدثة**
    Route::get('/audit-logs/{period?}', [ReportsController::class, 'auditLogReport'])->name('audit-logs');
    Route::get('/audit-logs', [ReportsController::class, 'auditLogReport'])->name('audit-logs.list');

    // 🔥  **الجديد** - كل السجلات بدون فلترة
    Route::get('/audit-logs/all', [ReportsController::class, 'allAuditLogs'])->name('audit-logs.all');

    // 🔥  **الجديد** - مسح السجلات
    Route::delete('/audit-logs/clear', [ReportsController::class, 'clearAuditLogs'])->name('audit-logs.clear');

    // 🔥  **الجديد** - تصدير السجلات
    Route::get('/audit-logs/export/{period?}', [ReportsController::class, 'exportAuditLogs'])->name('audit-logs.export');

    //  تقرير شامل (كل حاجة)
    Route::get('/dashboard', [ReportsController::class, 'dashboard'])->name('dashboard');

    //  تصدير PDF/Excel للتقارير العامة
    Route::get('/export/{type}/{period}', [ReportsController::class, 'export'])->name('export');
});
// في نفس ملف الـ routes السابق (web.php)
Route::middleware('web')->prefix('v1/reports')->name('reports.')->group(function () {
    Route::get('/stats', [StatsController::class, 'index'])->name('stats');

});

Route::middleware('web')->prefix('v1/guardian')->name('guardian.')->group(function () {
    Route::get('/children', [GuardianChildrenController::class, 'index'])->name('children');
});
                Route::get('/v1/super/all-centers', [CenterController::class, 'allCenters']);