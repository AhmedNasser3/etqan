<?php

namespace App\Http\Controllers\Teachers;

use App\Http\Controllers\Controller;
use App\Models\Auth\Teacher;
use App\Models\Auth\User;
use App\Models\Student\StudentAchievement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TeacherStudentsController extends Controller
{
    /**
     * ✅ جلب طلاب المعلم الحالي فقط (نفس طريقة getUniqueStudents)
     */
    public function getTeacherStudents(Request $request)
    {
        try {
            $currentUser = Auth::user();
            if (!$currentUser) {
                return response()->json(['message' => 'غير مسجل الدخول'], 401);
            }

            $teacher = Teacher::where('user_id', $currentUser->id)->first();
            if (!$teacher) {
                return response()->json(['message' => 'لست معلم مسجل'], 404);
            }

            // ✅ نفس الـ Query اللي اشتغلت قبل كده
            $studentDetails = DB::table('student_plan_details as spd')
                ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
                ->where('spd.teacher_id', $teacher->id)
                ->select('csb.user_id as student_user_id')
                ->distinct()
                ->pluck('student_user_id')
                ->filter()
                ->values()
                ->toArray();

            $students = [];
            if (!empty($studentDetails)) {
                $students = User::whereIn('id', $studentDetails)
                    ->select('id', 'name', 'email', 'phone', 'center_id', 'avatar', 'status')
                    ->orderBy('name', 'asc')
                    ->get();
            }

            return response()->json([
                'data' => $students,
                'message' => 'طلاب المعلم محملين بنجاح',
                'teacher_id' => $teacher->id,
                'total_students' => $students->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'message' => 'فشل في تحميل الطلاب: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ INDEX - حساب النقاط الصافية لطلاب المعلم (إضافة - خصم)
     */
    public function index(Request $request)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        // ✅ جلب الطلاب الأول عشان نحسبلهم النقاط
        $teacherStudentIds = DB::table('student_plan_details as spd')
            ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
            ->where('spd.teacher_id', $teacher->id)
            ->distinct()
            ->pluck('csb.user_id');

        $achievements = StudentAchievement::whereIn('user_id', $teacherStudentIds)
            ->with('user:id,name,email,center_id,phone')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $achievements->getCollection()->map(function ($achievement) use ($teacherStudentIds) {
                $userId = $achievement->user_id;

                // ✅ حساب النقاط الصافية: الإضافات - الخصومات
                $addedPoints = StudentAchievement::whereIn('user_id', $teacherStudentIds)
                    ->where('user_id', $userId)
                    ->where('points_action', 'added')
                    ->sum('points');

                $deductedPoints = StudentAchievement::whereIn('user_id', $teacherStudentIds)
                    ->where('user_id', $userId)
                    ->where('points_action', 'deducted')
                    ->sum('points');

                $totalPoints = $addedPoints - abs($deductedPoints);

                return [
                    'id' => $achievement->id,
                    'points' => $achievement->points,
                    'points_action' => $achievement->points_action,
                    'total_points' => $totalPoints,
                    'achievements' => $achievement->achievements_list ?? $achievement->achievements,
                    'reason' => $achievement->reason,
                    'achievement_type' => $achievement->achievement_type,
                    'created_at_formatted' => $achievement->created_at->format('Y-m-d H:i'),
                    'user' => [
                        'id' => $achievement->user->id,
                        'name' => $achievement->user->name,
                        'email' => $achievement->user->email,
                        'phone' => $achievement->user->phone ?? '',
                        'center_id' => $achievement->user->center_id
                    ]
                ];
            }),
            'current_page' => $achievements->currentPage(),
            'last_page' => $achievements->lastPage(),
            'per_page' => $achievements->perPage(),
            'total' => $achievements->total(),
        ]);
    }

    /**
     * ✅ STORE - إضافة إنجاز لطالب تابع للمعلم
     */
    public function store(Request $request)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        $request->validate([
            'user_id' => [
                'required',
                'exists:users,id',
                function ($attribute, $value, $fail) use ($teacher) {
                    // ✅ التحقق أن الطالب تابع للمعلم
                    $hasStudent = DB::table('student_plan_details as spd')
                        ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
                        ->where('spd.teacher_id', $teacher->id)
                        ->where('csb.user_id', $value)
                        ->exists();

                    if (!$hasStudent) {
                        $fail('لا يمكن إضافة إنجاز لطالب غير تابع لك');
                    }
                },
            ],
            'points' => 'required|integer|min:-1000|max:1000',
            'points_action' => 'required|in:added,deducted',
            'reason' => 'required|string|max:500',
            'achievements' => 'nullable|array',
            'achievement_type' => 'nullable|string|max:50'
        ]);

        $achievement = StudentAchievement::create([
            'user_id' => $request->user_id,
            'points' => $request->points,
            'points_action' => $request->points_action,
            'reason' => $request->reason,
            'achievements' => $request->achievements,
            'achievement_type' => $request->achievement_type,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الإنجاز بنجاح',
            'data' => $achievement->load('user:id,name,email,phone')
        ], 201);
    }

    /**
     * ✅ SHOW - عرض إنجاز واحد
     */
    public function show($id)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        $teacherStudentIds = DB::table('student_plan_details as spd')
            ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
            ->where('spd.teacher_id', $teacher->id)
            ->pluck('csb.user_id');

        $achievement = StudentAchievement::whereIn('user_id', $teacherStudentIds)
            ->with('user:id,name,email,phone,center_id')
            ->findOrFail($id);

        return response()->json($achievement);
    }

    /**
     * ✅ UPDATE - تحديث إنجاز
     */
    public function update(Request $request, $id)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        $teacherStudentIds = DB::table('student_plan_details as spd')
            ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
            ->where('spd.teacher_id', $teacher->id)
            ->pluck('csb.user_id');

        $achievement = StudentAchievement::whereIn('user_id', $teacherStudentIds)
            ->findOrFail($id);

        $request->validate([
            'user_id' => [
                'sometimes',
                'required',
                'exists:users,id',
                function ($attribute, $value, $fail) use ($teacher) {
                    $hasStudent = DB::table('student_plan_details as spd')
                        ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
                        ->where('spd.teacher_id', $teacher->id)
                        ->where('csb.user_id', $value)
                        ->exists();

                    if (!$hasStudent) {
                        $fail('لا يمكن تعديل إنجاز لطالب غير تابع لك');
                    }
                },
            ],
            'points' => 'sometimes|integer|min:-1000|max:1000',
            'points_action' => 'sometimes|in:added,deducted',
            'reason' => 'sometimes|string|max:500',
            'achievements' => 'nullable|array',
            'achievement_type' => 'nullable|string|max:50'
        ]);

        $achievement->update($request->only([
            'user_id', 'points', 'points_action', 'reason',
            'achievements', 'achievement_type'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الإنجاز بنجاح',
            'data' => $achievement->load('user:id,name,email,phone')
        ]);
    }

    /**
     * ✅ DELETE - حذف إنجاز
     */
    public function destroy($id)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        $teacherStudentIds = DB::table('student_plan_details as spd')
            ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
            ->where('spd.teacher_id', $teacher->id)
            ->pluck('csb.user_id');

        $achievement = StudentAchievement::whereIn('user_id', $teacherStudentIds)
            ->findOrFail($id);

        $achievement->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الإنجاز بنجاح'
        ]);
    }

    /**
     * ✅ حساب النقاط الصافية للطالب المحدد
     */
    public function studentTotalPoints($studentId)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $teacher = Teacher::where('user_id', $currentUser->id)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        // التحقق أن الطالب تابع للمعلم
        $hasStudent = DB::table('student_plan_details as spd')
            ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
            ->where('spd.teacher_id', $teacher->id)
            ->where('csb.user_id', $studentId)
            ->exists();

        if (!$hasStudent) {
            return response()->json(['message' => 'الطالب غير تابع لهذا المعلم'], 403);
        }

        $added = StudentAchievement::where('user_id', $studentId)
            ->where('points_action', 'added')
            ->sum('points');

        $deducted = StudentAchievement::where('user_id', $studentId)
            ->where('points_action', 'deducted')
            ->sum('points');

        $total = $added - abs($deducted);

        $status = match(true) {
            $total >= 100 => 'ممتاز ⭐',
            $total >= 50 => 'جيد 👍',
            $total >= 0 => 'متوسط ✅',
            default => 'يحتاج تحسين ⚠️'
        };

        return response()->json([
            'student_id' => $studentId,
            'total_points' => $total,
            'added_points' => $added,
            'deducted_points' => $deducted,
            'status' => $status
        ]);
    }

    // ✅ الدوال القديمة تبقى زي ما هي
    public function getUniqueStudents()
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $userId = $currentUser->id;
        $teacher = Teacher::where('user_id', $userId)->first();
        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        $teacherId = $teacher->id;

        $studentDetails = DB::table('student_plan_details as spd')
            ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
            ->where('spd.teacher_id', $teacherId)
            ->select('csb.user_id as student_user_id')
            ->distinct()
            ->pluck('student_user_id')
            ->filter()
            ->values()
            ->toArray();

        $students = [];
        if (!empty($studentDetails)) {
            $students = User::whereIn('id', $studentDetails)
                ->select('id', 'name', 'email', 'phone', 'avatar', 'status')
                ->get();
        }

        return response()->json([
            'teacher_id' => $teacherId,
            'teacher_user_id' => $userId,
            'student_details_count' => count($studentDetails),
            'total_unique_students' => $students->count(),
            'students' => $students
        ]);
    }

    public function toggleStudentStatus(Request $request, $studentId)
    {
        $currentUser = Auth::user();
        if (!$currentUser) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $userId = $currentUser->id;
        $teacher = Teacher::where('user_id', $userId)->first();

        if (!$teacher) {
            return response()->json(['message' => 'لست معلم مسجل'], 404);
        }

        $hasStudent = DB::table('student_plan_details as spd')
            ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
            ->where('spd.teacher_id', $teacher->id)
            ->where('csb.user_id', $studentId)
            ->exists();

        if (!$hasStudent) {
            return response()->json(['message' => 'الطالب غير تابع لهذا المعلم'], 403);
        }

        $student = User::where('id', $studentId)->first();
        if ($student) {
            $newStatus = $student->status === 'active' ? 'inactive' : 'active';
            $student->status = $newStatus;
            $student->save();

            return response()->json([
                'message' => 'تم تحديث حالة الطالب بنجاح',
                'student_id' => $studentId,
                'new_status' => $newStatus
            ]);
        }

        return response()->json(['message' => 'الطالب غير موجود'], 404);
    }
}