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
    // ── Helper: جلب IDs طلاب المعلم الحالي ───────────────────────────────────
    private function getTeacherStudentIds(Teacher $teacher)
    {
        return DB::table('student_plan_details as spd')
            ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
            ->where('spd.teacher_id', $teacher->id)
            ->distinct()
            ->pluck('csb.user_id');
    }

    // ── Helper: جلب المعلم الحالي ─────────────────────────────────────────────
    private function getCurrentTeacher()
    {
        $user = Auth::user();
        if (!$user) return null;
        return Teacher::where('user_id', $user->id)->first();
    }

    // ── Helper: حساب نقاط طالب ───────────────────────────────────────────────
    private function calcStudentPoints($userId): array
    {
        $added    = StudentAchievement::where('user_id', $userId)->where('points_action', 'added')->sum('points');
        $deducted = StudentAchievement::where('user_id', $userId)->where('points_action', 'deducted')->sum('points');
        return [
            'added_points'    => (int) $added,
            'deducted_points' => (int) $deducted,
            'total_points'    => (int) ($added - abs($deducted)),
        ];
    }

    /**
     * جلب طلاب المعلم مع نقاطهم — مع pagination وبحث
     */
    public function getTeacherStudents(Request $request)
    {
        try {
            $teacher = $this->getCurrentTeacher();
            if (!$teacher) return response()->json(['message' => 'لست معلم مسجل'], 404);

            $studentIds = $this->getTeacherStudentIds($teacher);

            $query = User::whereIn('id', $studentIds)
                ->select('id', 'name', 'email', 'phone', 'center_id', 'avatar', 'status')
                ->orderBy('name');

            if ($request->filled('search')) {
                $q = $request->search;
                $query->where(fn($qb) => $qb->where('name', 'like', "%$q%")->orWhere('email', 'like', "%$q%"));
            }

            $perPage  = (int) $request->get('per_page', 15);
            $paginated = $query->paginate($perPage);

            $data = $paginated->getCollection()->map(function ($student) {
                $pts = $this->calcStudentPoints($student->id);
                return array_merge($student->toArray(), $pts);
            });

            return response()->json([
                'data'         => $data,
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
                'message'      => 'طلاب المعلم محملين بنجاح',
                'teacher_id'   => $teacher->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['data' => [], 'message' => 'فشل: ' . $e->getMessage()], 500);
        }
    }

    /**
     * INDEX - سجل الإنجازات
     */
    public function index(Request $request)
    {
        $teacher = $this->getCurrentTeacher();
        if (!$teacher) return response()->json(['message' => 'لست معلم مسجل'], 404);

        $studentIds = $this->getTeacherStudentIds($teacher);

        $query = StudentAchievement::whereIn('user_id', $studentIds)
            ->with('user:id,name,email,center_id,phone')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->whereHas('user', fn($qb) => $qb->where('name', 'like', "%$q%")->orWhere('email', 'like', "%$q%"))
                  ->orWhere('reason', 'like', "%$q%");
        }

        $paginated = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $paginated->getCollection()->map(function ($a) {
                $pts = $this->calcStudentPoints($a->user_id);
                return [
                    'id'                  => $a->id,
                    'points'              => $a->points,
                    'points_action'       => $a->points_action,
                    'total_points'        => $pts['total_points'],
                    'added_points'        => $pts['added_points'],
                    'deducted_points'     => $pts['deducted_points'],
                    'achievements'        => $a->achievements_list ?? $a->achievements,
                    'reason'              => $a->reason,
                    'achievement_type'    => $a->achievement_type,
                    'created_at_formatted'=> $a->created_at->format('Y-m-d H:i'),
                    'user' => [
                        'id'        => $a->user->id,
                        'name'      => $a->user->name,
                        'email'     => $a->user->email,
                        'phone'     => $a->user->phone ?? '',
                        'center_id' => $a->user->center_id,
                    ],
                ];
            }),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'per_page'     => $paginated->perPage(),
            'total'        => $paginated->total(),
        ]);
    }

    /**
     * STORE - إضافة إنجاز
     */
    public function store(Request $request)
    {
        $teacher = $this->getCurrentTeacher();
        if (!$teacher) return response()->json(['message' => 'لست معلم مسجل'], 404);

        $request->validate([
            'user_id'          => ['required', 'exists:users,id', function ($attr, $val, $fail) use ($teacher) {
                $ok = DB::table('student_plan_details as spd')
                    ->join('circle_student_bookings as csb', 'spd.circle_student_booking_id', '=', 'csb.id')
                    ->where('spd.teacher_id', $teacher->id)->where('csb.user_id', $val)->exists();
                if (!$ok) $fail('الطالب غير تابع لك');
            }],
            'points'           => 'required|integer|min:1|max:1000',
            'points_action'    => 'required|in:added,deducted',
            'reason'           => 'required|string|max:500',
            'achievements'     => 'nullable|array',
            'achievement_type' => 'nullable|string|max:50',
        ]);

        $achievement = StudentAchievement::create([
            'user_id'          => $request->user_id,
            'points'           => $request->points,
            'points_action'    => $request->points_action,
            'reason'           => $request->reason,
            'achievements'     => $request->achievements,
            'achievement_type' => $request->achievement_type,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الإنجاز بنجاح',
            'data'    => $achievement->load('user:id,name,email,phone'),
        ], 201);
    }

    /**
     * ✅ STORE BULK - إضافة نقاط لمجموعة طلاب
     */
    public function storeBulk(Request $request)
    {
        $teacher = $this->getCurrentTeacher();
        if (!$teacher) return response()->json(['message' => 'لست معلم مسجل'], 404);

        $studentIds = $this->getTeacherStudentIds($teacher)->toArray();

        $request->validate([
            'user_ids'         => 'required|array|min:1',
            'user_ids.*'       => 'integer|exists:users,id',
            'points'           => 'required|integer|min:1|max:1000',
            'points_action'    => 'required|in:added,deducted',
            'reason'           => 'required|string|max:500',
            'achievement_type' => 'nullable|string|max:50',
        ]);

        // تأكد كل الطلاب تابعين للمعلم
        $notMine = array_diff($request->user_ids, $studentIds);
        if (!empty($notMine)) {
            return response()->json(['message' => 'بعض الطلاب غير تابعين لك'], 403);
        }

        $created = 0;
        foreach ($request->user_ids as $userId) {
            StudentAchievement::create([
                'user_id'          => $userId,
                'points'           => $request->points,
                'points_action'    => $request->points_action,
                'reason'           => $request->reason,
                'achievement_type' => $request->achievement_type,
            ]);
            $created++;
        }

        return response()->json([
            'success' => true,
            'message' => "تم إضافة النقاط لـ {$created} طالب بنجاح",
            'created' => $created,
        ]);
    }

    /**
     * SHOW
     */
    public function show($id)
    {
        $teacher = $this->getCurrentTeacher();
        if (!$teacher) return response()->json(['message' => 'لست معلم مسجل'], 404);

        $a = StudentAchievement::whereIn('user_id', $this->getTeacherStudentIds($teacher))
            ->with('user:id,name,email,phone,center_id')->findOrFail($id);

        return response()->json($a);
    }

    /**
     * UPDATE
     */
    public function update(Request $request, $id)
    {
        $teacher = $this->getCurrentTeacher();
        if (!$teacher) return response()->json(['message' => 'لست معلم مسجل'], 404);

        $a = StudentAchievement::whereIn('user_id', $this->getTeacherStudentIds($teacher))->findOrFail($id);

        $request->validate([
            'points'           => 'sometimes|integer|min:1|max:1000',
            'points_action'    => 'sometimes|in:added,deducted',
            'reason'           => 'sometimes|string|max:500',
            'achievements'     => 'nullable|array',
            'achievement_type' => 'nullable|string|max:50',
        ]);

        $a->update($request->only(['points', 'points_action', 'reason', 'achievements', 'achievement_type']));

        return response()->json(['success' => true, 'message' => 'تم التحديث بنجاح', 'data' => $a->load('user:id,name,email,phone')]);
    }

    /**
     * DESTROY
     */
    public function destroy($id)
    {
        $teacher = $this->getCurrentTeacher();
        if (!$teacher) return response()->json(['message' => 'لست معلم مسجل'], 404);

        $a = StudentAchievement::whereIn('user_id', $this->getTeacherStudentIds($teacher))->findOrFail($id);
        $a->delete();

        return response()->json(['success' => true, 'message' => 'تم الحذف بنجاح']);
    }

    /**
     * نقاط طالب واحد
     */
    public function studentTotalPoints($studentId)
    {
        $teacher = $this->getCurrentTeacher();
        if (!$teacher) return response()->json(['message' => 'لست معلم مسجل'], 404);

        $ok = $this->getTeacherStudentIds($teacher)->contains($studentId);
        if (!$ok) return response()->json(['message' => 'الطالب غير تابع لك'], 403);

        $pts    = $this->calcStudentPoints($studentId);
        $total  = $pts['total_points'];
        $status = match(true) {
            $total >= 100 => 'ممتاز',
            $total >= 50  => 'جيد',
            $total >= 0   => 'متوسط',
            default       => 'يحتاج تحسين',
        };

        return response()->json(array_merge(['student_id' => $studentId, 'status' => $status], $pts));
    }

    /**
     * getUniqueStudents — متوافق مع القديم
     */
    public function getUniqueStudents()
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'غير مسجل الدخول'], 401);

        $teacher = Teacher::where('user_id', $user->id)->first();
        if (!$teacher) return response()->json(['message' => 'لست معلم مسجل'], 404);

        $ids = $this->getTeacherStudentIds($teacher);
        $students = User::whereIn('id', $ids)->select('id', 'name', 'email', 'phone', 'avatar', 'status')->get();

        return response()->json([
            'teacher_id'            => $teacher->id,
            'teacher_user_id'       => $user->id,
            'total_unique_students' => $students->count(),
            'students'              => $students,
        ]);
    }

    /**
     * toggleStudentStatus
     */
    public function toggleStudentStatus(Request $request, $studentId)
    {
        $teacher = $this->getCurrentTeacher();
        if (!$teacher) return response()->json(['message' => 'لست معلم مسجل'], 404);

        $ok = $this->getTeacherStudentIds($teacher)->contains($studentId);
        if (!$ok) return response()->json(['message' => 'الطالب غير تابع لك'], 403);

        $student = User::findOrFail($studentId);
        $student->status = $student->status === 'active' ? 'inactive' : 'active';
        $student->save();

        return response()->json(['message' => 'تم التحديث', 'student_id' => $studentId, 'new_status' => $student->status]);
    }
}