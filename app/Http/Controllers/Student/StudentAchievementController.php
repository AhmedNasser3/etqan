<?php
// app/Http/Controllers/Student/StudentAchievementController.php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use App\Models\Student\StudentAchievement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StudentAchievementController extends Controller
{
    /**
     * جلب طلاب المركز الحالي فقط (الطلاب المسجلين في جدول students)
     */
    public function getCenterStudents(Request $request)
    {
        try {
            $user = Auth::user();

            $students = User::select('users.id', 'users.name', 'users.email', 'users.phone', 'users.center_id')
                ->join('students', 'users.id', '=', 'students.user_id') // ✅ JOIN مع جدول students
                ->where('users.center_id', $user->center_id)
                ->where('users.role_id', 3) // ✅ افتراض role_id = 3 للطلاب
                ->orderBy('users.name', 'asc')
                ->get();

            return response()->json([
                'data' => $students,
                'message' => 'طلاب المركز محملين بنجاح',
                'center_id' => $user->center_id,
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
     * INDEX - حساب النقاط الصافية (إضافة - خصم)
     */
    public function index(Request $request)
    {
        $myCenterId = Auth::user()->center_id;

        $achievements = StudentAchievement::whereHas('user', function($q) use ($myCenterId) {
                $q->where('center_id', $myCenterId)
                  ->whereExists(function($subQuery) {
                      $subQuery->select(DB::raw(1))
                               ->from('students')
                               ->whereColumn('students.user_id', 'users.id');
                  }); // ✅ الطلاب فقط
            })
            ->with('user:id,name,email,center_id,phone')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $achievements->getCollection()->map(function($achievement) use ($myCenterId) {
                $userId = $achievement->user_id;

                // حساب النقاط الصافية: الإضافات - الخصومات (للطلاب فقط)
                $addedPoints = StudentAchievement::whereHas('user', function($q) use ($myCenterId, $userId) {
                        $q->where('center_id', $myCenterId)
                          ->where('id', $userId)
                          ->whereExists(function($subQuery) use ($userId) {
                              $subQuery->select(DB::raw(1))
                                       ->from('students')
                                       ->whereColumn('students.user_id', 'users.id');
                          });
                    })
                    ->where('points_action', 'added')
                    ->sum('points');

                $deductedPoints = StudentAchievement::whereHas('user', function($q) use ($myCenterId, $userId) {
                        $q->where('center_id', $myCenterId)
                          ->where('id', $userId)
                          ->whereExists(function($subQuery) use ($userId) {
                              $subQuery->select(DB::raw(1))
                                       ->from('students')
                                       ->whereColumn('students.user_id', 'users.id');
                          });
                    })
                    ->where('points_action', 'deducted')
                    ->sum('points');

                $totalPoints = $addedPoints - $deductedPoints;

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
                        'phone' => $achievement->user->phone,
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
     * STORE - يحفظ points_action صحيح (طلاب فقط)
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => [
                'required',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    // ✅ التحقق من أن الـ user طالب فعلي
                    $targetUser = User::select('center_id')
                        ->join('students', 'users.id', '=', 'students.user_id')
                        ->where('users.id', $value)
                        ->where('users.center_id', Auth::user()->center_id)
                        ->first();

                    if (!$targetUser) {
                        $fail('الطالب غير موجود في مجمعك أو غير مسجل كطالب');
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

    public function show($id)
    {
        $achievement = StudentAchievement::whereHas('user', function($q) {
                $q->where('center_id', Auth::user()->center_id)
                  ->whereExists(function($subQuery) {
                      $subQuery->select(DB::raw(1))
                               ->from('students')
                               ->whereColumn('students.user_id', 'users.id');
                  });
            })
            ->with('user:id,name,email,phone')
            ->findOrFail($id);

        return response()->json($achievement);
    }

    public function update(Request $request, $id)
    {
        $achievement = StudentAchievement::whereHas('user', function($q) {
                $q->where('center_id', Auth::user()->center_id)
                  ->whereExists(function($subQuery) {
                      $subQuery->select(DB::raw(1))
                               ->from('students')
                               ->whereColumn('students.user_id', 'users.id');
                  });
            })
            ->findOrFail($id);

        $request->validate([
            'points' => 'sometimes|integer|min:-1000|max:1000',
            'points_action' => 'sometimes|in:added,deducted',
            'reason' => 'sometimes|string|max:500',
            'achievements' => 'nullable|array',
            'achievement_type' => 'nullable|string|max:50'
        ]);

        $achievement->update($request->only([
            'points', 'points_action', 'reason',
            'achievements', 'achievement_type'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الإنجاز بنجاح',
            'data' => $achievement->load('user:id,name,email,phone')
        ]);
    }

    public function destroy($id)
    {
        $achievement = StudentAchievement::whereHas('user', function($q) {
                $q->where('center_id', Auth::user()->center_id)
                  ->whereExists(function($subQuery) {
                      $subQuery->select(DB::raw(1))
                               ->from('students')
                               ->whereColumn('students.user_id', 'users.id');
                  });
            })
            ->findOrFail($id);

        $achievement->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الإنجاز بنجاح'
        ]);
    }

    /**
     * حساب النقاط الصافية للطالب (طلاب فقط)
     */
    public function studentTotalPoints($studentId)
    {
        $myCenterId = Auth::user()->center_id;

        // ✅ التحقق من أن الطالب مسجل في جدول students
        $isValidStudent = User::join('students', 'users.id', '=', 'students.user_id')
            ->where('users.id', $studentId)
            ->where('users.center_id', $myCenterId)
            ->exists();

        if (!$isValidStudent) {
            return response()->json(['message' => 'الطالب غير موجود أو غير مصرح'], 403);
        }

        $added = StudentAchievement::whereHas('user', function($q) use ($myCenterId, $studentId) {
                $q->where('center_id', $myCenterId)
                  ->where('id', $studentId)
                  ->whereExists(function($subQuery) use ($studentId) {
                      $subQuery->select(DB::raw(1))
                               ->from('students')
                               ->whereColumn('students.user_id', 'users.id');
                  });
            })
            ->where('points_action', 'added')
            ->sum('points');

        $deducted = StudentAchievement::whereHas('user', function($q) use ($myCenterId, $studentId) {
                $q->where('center_id', $myCenterId)
                  ->where('id', $studentId)
                  ->whereExists(function($subQuery) use ($studentId) {
                      $subQuery->select(DB::raw(1))
                               ->from('students')
                               ->whereColumn('students.user_id', 'users.id');
                  });
            })
            ->where('points_action', 'deducted')
            ->sum('points');

        $total = $added - $deducted;

        $status = match(true) {
            $total >= 100 => 'ممتاز ⭐',
            $total >= 50 => 'جيد 👍',
            $total >= 0 => 'متوسط ',
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
}
