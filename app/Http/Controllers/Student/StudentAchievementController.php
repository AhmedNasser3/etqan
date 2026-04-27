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
    // ──────────────────────────────────────────────────
    // مساعد: حساب النقاط الصافية لطالب
    // ──────────────────────────────────────────────────
    private function calcTotalPoints(int $userId): int
    {
        $added = StudentAchievement::where('user_id', $userId)
            ->where('points_action', 'added')
            ->sum('points');

        $deducted = StudentAchievement::where('user_id', $userId)
            ->where('points_action', 'deducted')
            ->sum('points');

        return $added - $deducted;
    }

    // ──────────────────────────────────────────────────
    // INDEX: كل طلاب المجمع + نقاطهم (حتى لو صفر)
    // ──────────────────────────────────────────────────
    public function index(Request $request)
    {
        $centerId = Auth::user()->center_id;
        $perPage  = $request->get('per_page', 20);
        $search   = $request->get('search', '');

        // جلب كل الطلاب المسجلين في المجمع
        $studentsQuery = User::select('users.id', 'users.name', 'users.email', 'users.phone')
            ->join('students', 'users.id', '=', 'students.user_id')
            ->where('users.center_id', $centerId)
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('users.name', 'like', "%{$search}%")
                       ->orWhere('users.email', 'like', "%{$search}%");
                });
            })
            ->orderBy('users.name');

        $students = $studentsQuery->paginate($perPage);

        // إضافة النقاط لكل طالب
        $data = $students->getCollection()->map(function ($student) {
            $added    = StudentAchievement::where('user_id', $student->id)
                            ->where('points_action', 'added')->sum('points');
            $deducted = StudentAchievement::where('user_id', $student->id)
                            ->where('points_action', 'deducted')->sum('points');
            $total    = $added - $deducted;

            return [
                'id'           => $student->id,
                'name'         => $student->name,
                'email'        => $student->email,
                'phone'        => $student->phone,
                'total_points' => $total,
                'added_points' => $added,
                'deducted_points' => $deducted,
            ];
        });

        return response()->json([
            'data'         => $data,
            'current_page' => $students->currentPage(),
            'last_page'    => $students->lastPage(),
            'per_page'     => $students->perPage(),
            'total'        => $students->total(),
        ]);
    }

    // ──────────────────────────────────────────────────
    // STORE: إضافة/خصم نقاط لطالب واحد
    // ──────────────────────────────────────────────────
    public function store(Request $request)
    {
        $centerId = Auth::user()->center_id;

        $request->validate([
            'user_id'       => ['required', 'integer'],
            'points'        => 'required|integer|min:1|max:10000',
            'points_action' => 'required|in:added,deducted',
            'reason'        => 'required|string|max:500',
        ]);

        // التحقق أن الطالب في نفس المجمع
        $valid = User::join('students', 'users.id', '=', 'students.user_id')
            ->where('users.id', $request->user_id)
            ->where('users.center_id', $centerId)
            ->exists();

        if (!$valid) {
            return response()->json(['message' => 'الطالب غير موجود في مجمعك'], 403);
        }

        $achievement = StudentAchievement::create([
            'user_id'       => $request->user_id,
            'points'        => abs($request->points),
            'points_action' => $request->points_action,
            'reason'        => $request->reason,
        ]);

        return response()->json([
            'success'      => true,
            'message'      => 'تم إضافة النقاط بنجاح',
            'total_points' => $this->calcTotalPoints($request->user_id),
            'data'         => $achievement,
        ], 201);
    }

    // ──────────────────────────────────────────────────
    // STORE BULK: إضافة/خصم نقاط لعدة طلاب دفعة واحدة
    // ──────────────────────────────────────────────────
    public function storeBulk(Request $request)
    {
        $centerId = Auth::user()->center_id;

        $request->validate([
            'user_ids'      => 'required|array|min:1',
            'user_ids.*'    => 'integer',
            'points'        => 'required|integer|min:1|max:10000',
            'points_action' => 'required|in:added,deducted',
            'reason'        => 'required|string|max:500',
        ]);

        // التحقق من أن كل الطلاب في نفس المجمع
        $validIds = User::join('students', 'users.id', '=', 'students.user_id')
            ->where('users.center_id', $centerId)
            ->whereIn('users.id', $request->user_ids)
            ->pluck('users.id')
            ->toArray();

        if (empty($validIds)) {
            return response()->json(['message' => 'لا يوجد طلاب صالحين'], 403);
        }

        $now  = now();
        $rows = array_map(fn($uid) => [
            'user_id'       => $uid,
            'points'        => abs($request->points),
            'points_action' => $request->points_action,
            'reason'        => $request->reason,
            'created_at'    => $now,
            'updated_at'    => $now,
        ], $validIds);

        StudentAchievement::insert($rows);

        return response()->json([
            'success'       => true,
            'message'       => 'تم تحديث النقاط لـ ' . count($validIds) . ' طالب',
            'affected_ids'  => $validIds,
        ], 201);
    }

    // ──────────────────────────────────────────────────
    // UPDATE: تعديل سجل نقاط موجود
    // ──────────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        $centerId = Auth::user()->center_id;

        $achievement = StudentAchievement::whereHas('user', function ($q) use ($centerId) {
            $q->where('center_id', $centerId)
              ->whereExists(fn($s) => $s->from('students')->whereColumn('students.user_id', 'users.id'));
        })->findOrFail($id);

        $request->validate([
            'points'        => 'sometimes|integer|min:1|max:10000',
            'points_action' => 'sometimes|in:added,deducted',
            'reason'        => 'sometimes|string|max:500',
        ]);

        $achievement->update($request->only(['points', 'points_action', 'reason']));

        return response()->json([
            'success'      => true,
            'message'      => 'تم تحديث السجل بنجاح',
            'total_points' => $this->calcTotalPoints($achievement->user_id),
            'data'         => $achievement,
        ]);
    }

    // ──────────────────────────────────────────────────
    // DESTROY: حذف سجل نقاط
    // ──────────────────────────────────────────────────
    public function destroy($id)
    {
        $centerId = Auth::user()->center_id;

        $achievement = StudentAchievement::whereHas('user', function ($q) use ($centerId) {
            $q->where('center_id', $centerId)
              ->whereExists(fn($s) => $s->from('students')->whereColumn('students.user_id', 'users.id'));
        })->findOrFail($id);

        $userId = $achievement->user_id;
        $achievement->delete();

        return response()->json([
            'success'      => true,
            'message'      => 'تم الحذف بنجاح',
            'total_points' => $this->calcTotalPoints($userId),
        ]);
    }

    // ──────────────────────────────────────────────────
    // سجل نقاط طالب معين (للعرض في لوحة الطالب)
    // ──────────────────────────────────────────────────
    public function studentHistory($studentId)
    {
        $centerId = Auth::user()->center_id;

        $valid = User::join('students', 'users.id', '=', 'students.user_id')
            ->where('users.id', $studentId)
            ->where('users.center_id', $centerId)
            ->exists();

        if (!$valid) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $records = StudentAchievement::where('user_id', $studentId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($r) => [
                'id'           => $r->id,
                'points'       => $r->points_action === 'added' ? $r->points : -$r->points,
                'points_action'=> $r->points_action,
                'reason'       => $r->reason,
                'created_at'   => $r->created_at->format('Y-m-d H:i'),
            ]);

        return response()->json([
            'total_points' => $this->calcTotalPoints($studentId),
            'history'      => $records,
        ]);
    }
}
