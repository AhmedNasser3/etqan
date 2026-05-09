<?php

namespace App\Http\Controllers\Teachers;

use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use App\Models\Tenant\Mosque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MyTeachersController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = Auth::user();
        $currentUserCenterId = $currentUser?->center_id;

        if (!$currentUserCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 400);
        }

        $query = User::with(['teacher'])
            ->whereHas('teacher')
            ->where('center_id', $currentUserCenterId);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('teacher_role')) {
            $query->whereHas('teacher', function ($q) use ($request) {
                $q->where('role', $request->teacher_role);
            });
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('teacher', function ($tq) use ($search) {
                        $tq->where('role', 'like', "%{$search}%")
                           ->orWhere('notes', 'like', "%{$search}%");
                    });
            });
        }

        $teachers = $query
            ->orderBy('created_at', 'desc')
            ->paginate((int) $request->get('per_page', 15));

        $plansColumns = Schema::getColumnListing('plans');

        $planTitleColumn = collect(['title', 'name', 'plan_name'])
            ->first(fn ($column) => in_array($column, $plansColumns));

        $planDescriptionColumn = collect(['description', 'notes', 'details'])
            ->first(fn ($column) => in_array($column, $plansColumns));

        $data = collect($teachers->items())->map(function ($user) use (
            $currentUserCenterId,
            $planTitleColumn,
            $planDescriptionColumn
        ) {
            $mosque = Mosque::where('center_id', $currentUserCenterId)
                ->where('supervisor_id', $user->id)
                ->select('id', 'name')
                ->first();

            $circles = DB::table('plan_circle_schedules as pcs')
                ->join('circles as c', 'c.id', '=', 'pcs.circle_id')
                ->leftJoin('circle_student_bookings as csb', function ($join) {
                    $join->on('csb.plan_circle_schedule_id', '=', 'pcs.id')
                        ->where('csb.status', '=', 'confirmed');
                })
                ->where('pcs.teacher_id', $user->id)
                ->select(
                    'c.id',
                    'c.name',
                    DB::raw('MIN(pcs.start_time) as start_time'),
                    DB::raw('MAX(pcs.end_time) as end_time'),
                    DB::raw('COUNT(DISTINCT csb.user_id) as students_count')
                )
                ->groupBy('c.id', 'c.name')
                ->orderBy('c.name')
                ->get()
                ->map(function ($circle) {
                    return [
                        'id'            => (int) $circle->id,
                        'name'          => $circle->name,
                        'studentsCount' => (int) $circle->students_count,
                        'timeRange'     => ($circle->start_time && $circle->end_time)
                            ? substr($circle->start_time, 0, 5) . ' - ' . substr($circle->end_time, 0, 5)
                            : null,
                    ];
                })
                ->values();

            $students = DB::table('plan_circle_schedules as pcs')
                ->join('circle_student_bookings as csb', function ($join) {
                    $join->on('csb.plan_circle_schedule_id', '=', 'pcs.id')
                        ->where('csb.status', '=', 'confirmed');
                })
                ->join('users as students', 'students.id', '=', 'csb.user_id')
                ->where('pcs.teacher_id', $user->id)
                ->select(
                    'students.id',
                    'students.name',
                    'students.email',
                    'students.phone',
                    'students.status'
                )
                ->distinct()
                ->orderBy('students.name')
                ->get()
                ->map(function ($student) {
                    return [
                        'id'     => (int) $student->id,
                        'name'   => $student->name,
                        'email'  => $student->email,
                        'phone'  => $student->phone,
                        'status' => $student->status,
                    ];
                })
                ->values();

            $planQuery = DB::table('plan_circle_schedules as pcs')
                ->join('plans as p', 'p.id', '=', 'pcs.plan_id')
                ->where('pcs.teacher_id', $user->id)
                ->select(
                    'p.id',
                    DB::raw('COUNT(DISTINCT pcs.id) as sessions_total'),
                    DB::raw('SUM(CASE WHEN pcs.schedule_date <= CURDATE() THEN 1 ELSE 0 END) as sessions_done'),
                    DB::raw('MIN(pcs.start_time) as start_time'),
                    DB::raw('MAX(pcs.end_time) as end_time')
                );

            if ($planTitleColumn) {
                $planQuery->addSelect(DB::raw("p.`{$planTitleColumn}` as plan_title"));
            }
            if ($planDescriptionColumn) {
                $planQuery->addSelect(DB::raw("p.`{$planDescriptionColumn}` as plan_description"));
            }

            $groupBy = ['p.id'];
            if ($planTitleColumn) $groupBy[] = "p.{$planTitleColumn}";
            if ($planDescriptionColumn) $groupBy[] = "p.{$planDescriptionColumn}";

            $planRow = $planQuery
                ->groupBy($groupBy)
                ->orderByDesc('sessions_total')
                ->first();

            $weeklyDays = DB::table('plan_circle_schedules as pcs')
                ->where('pcs.teacher_id', $user->id)
                ->whereNotNull('pcs.day_of_week')
                ->select('pcs.day_of_week')
                ->distinct()
                ->pluck('day_of_week')
                ->map(function ($day) {
                    return match ($day) {
                        'sunday'    => 'الأحد',
                        'monday'    => 'الاثنين',
                        'tuesday'   => 'الثلاثاء',
                        'wednesday' => 'الأربعاء',
                        'thursday'  => 'الخميس',
                        'friday'    => 'الجمعة',
                        'saturday'  => 'السبت',
                        default     => $day,
                    };
                })
                ->values();

            return [
                'id'         => $user->id,
                'user_id'    => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'avatar'     => $user->avatar,
                'status'     => $user->status,
                'created_at' => optional($user->created_at)->format('Y-m-d H:i:s'),

                'mosque'    => $mosque?->name,
                'mosque_id' => $mosque?->id,

                'circles_count' => $circles->count(),
                'students_count' => $students->count(),

                'circles'  => $circles,
                'students' => $students,

                'teacher' => [
                    'role'         => $user->teacher->role ?? null,
                    'notes'        => $user->teacher->notes ?? null,
                    'session_time' => $user->teacher->session_time ?? null,
                ],

                'plan' => $planRow ? [
                    'id'            => (string) $planRow->id,
                    'title'         => $planRow->plan_title ?? 'خطة تعليمية',
                    'description'   => $planRow->plan_description ?? '',
                    'studentsCount' => $students->count(),
                    'sessionsDone'  => (int) $planRow->sessions_done,
                    'sessionsTotal' => (int) $planRow->sessions_total,
                    'weeklyDays'    => $weeklyDays,
                    'timeRange'     => ($planRow->start_time && $planRow->end_time)
                        ? substr($planRow->start_time, 0, 5) . ' - ' . substr($planRow->end_time, 0, 5)
                        : null,
                ] : null,
            ];
        });

        return response()->json([
            'success'             => true,
            'data'                => $data,
            'pagination'          => [
                'current_page' => $teachers->currentPage(),
                'total'        => $teachers->total(),
                'per_page'     => $teachers->perPage(),
                'last_page'    => $teachers->lastPage(),
                'from'         => $teachers->firstItem(),
                'to'           => $teachers->lastItem(),
            ],
            'center_id'           => $currentUserCenterId,
            'center_filter_active' => true,
        ]);
    }

    public function pending(Request $request)
    {
        $request->merge(['status' => 'pending']);
        return $this->index($request);
    }

    public function students($id)
    {
        $currentUser = Auth::user();
        $currentUserCenterId = $currentUser?->center_id;

        if (!$currentUserCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 400);
        }

        $teacher = User::where('center_id', $currentUserCenterId)
            ->whereHas('teacher')
            ->findOrFail($id);

        $students = DB::table('plan_circle_schedules as pcs')
            ->join('circle_student_bookings as csb', function ($join) {
                $join->on('csb.plan_circle_schedule_id', '=', 'pcs.id')
                    ->where('csb.status', '=', 'confirmed');
            })
            ->join('users as students', 'students.id', '=', 'csb.user_id')
            ->where('pcs.teacher_id', $teacher->id)
            ->select(
                'students.id',
                'students.name',
                'students.email',
                'students.phone',
                'students.status'
            )
            ->distinct()
            ->orderBy('students.name')
            ->get();

        return response()->json([
            'success' => true,
            'teacher' => ['id' => $teacher->id, 'name' => $teacher->name],
            'count'   => $students->count(),
            'data'    => $students,
        ]);
    }

    public function update(Request $request, $id)
    {
        $currentUser = Auth::user();
        $currentUserCenterId = $currentUser?->center_id;

        if (!$currentUserCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 400);
        }

        $user = User::with('teacher')
            ->where('center_id', $currentUserCenterId)
            ->whereHas('teacher')
            ->findOrFail($id);

        $request->validate([
            'name'         => 'nullable|string|max:255|min:3',
            'email'        => 'nullable|email|max:255|unique:users,email,' . $id,
            'phone'        => 'nullable|string|max:20|unique:users,phone,' . $id,
            'status'       => 'nullable|in:pending,active,inactive,suspended',
            'notes'        => 'nullable|string|max:1000',
            'teacher_role' => 'nullable|in:teacher,supervisor,motivator,student_affairs,financial',
        ]);

        $user->update($request->only(['name', 'email', 'phone', 'status']));

        if ($user->teacher) {
            $teacherData = [];
            if ($request->filled('notes')) $teacherData['notes'] = $request->notes;
            if ($request->filled('teacher_role')) $teacherData['role'] = $request->teacher_role;
            if (!empty($teacherData)) $user->teacher->update($teacherData);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تعديل المعلم بنجاح',
            'data'    => $user->fresh(['teacher'])
        ]);
    }

    public function destroy($id)
    {
        $currentUser = Auth::user();
        $currentUserCenterId = $currentUser?->center_id;

        if (!$currentUserCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 400);
        }

        $user = User::with('teacher')
            ->where('center_id', $currentUserCenterId)
            ->whereHas('teacher')
            ->findOrFail($id);

        $user->update(['status' => 'suspended']);

        return response()->json([
            'success' => true,
            'message' => 'تم تعليق حساب المعلم بنجاح'
        ]);
    }

    /**
     * ─── toggleStatus ───
     * عند التفعيل: يغير status لـ active ويربط المعلم بالحلقات
     * عن طريق parse الـ notes واستخراج circle_id والأوقات
     */
    public function toggleStatus(Request $request, $id)
    {
        $currentUser = Auth::user();
        $currentUserCenterId = $currentUser?->center_id;

        if (!$currentUserCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 400);
        }

        $user = User::with('teacher')
            ->where('center_id', $currentUserCenterId)
            ->whereHas('teacher')
            ->findOrFail($id);

        $currentStatus = $user->status;
        $newStatus = $currentStatus === 'active' ? 'suspended' : 'active';

        $user->update(['status' => $newStatus]);

        // ── لما بيتفعل، نربطه بالحلقات من الـ notes ──
        if ($newStatus === 'active' && $user->teacher?->notes) {
            $this->assignTeacherToSchedules($user->id, $user->teacher->notes);
        }

        // ── لما بيتوقف، نشيل teacher_id من الحلقات ──
        if ($newStatus === 'suspended') {
            DB::table('plan_circle_schedules')
                ->where('teacher_id', $user->id)
                ->update(['teacher_id' => null]);
        }

        return response()->json([
            'success'        => true,
            'message'        => $newStatus === 'active'
                ? 'تم تفعيل المعلم وربطه بالحلقات بنجاح'
                : 'تم تعليق المعلم وإلغاء ربطه بالحلقات',
            'status'         => $newStatus,
            'current_status' => $currentStatus,
            'data'           => $user->fresh(['teacher']),
        ]);
    }

    /**
     * ─── Parse الـ notes واستخراج circle_id والأوقات ───
     *
     * الـ notes بالشكل:
     * حلقة المتوسط (العصر) (3) (ID: 1) | من 6:54 م إلى 7:54 م
     *
     * بنستخرج:
     * - circle_id من (ID: X)
     * - start_time و end_time من الأوقات
     */
    private function assignTeacherToSchedules(int $teacherId, string $notes): void
    {
        // استخراج circle_id
        // pattern: (ID: 1) أو (ID:1)
        if (!preg_match('/\(ID:\s*(\d+)\)/i', $notes, $idMatch)) {
            return; // مفيش ID → مش نعمل حاجة
        }
        $circleId = (int) $idMatch[1];

        // استخراج الأوقات — بيكونوا بالعربي: من 6:54 م إلى 7:54 م
        // أو بالإنجليزي: من 06:54 إلى 07:54
        $startTime = null;
        $endTime   = null;

        if (preg_match('/من\s+([\d:]+)\s*(ص|م)?\s+إلى\s+([\d:]+)\s*(ص|م)?/u', $notes, $timeMatch)) {
            $startTime = $this->convertArabicTime($timeMatch[1], $timeMatch[2] ?? '');
            $endTime   = $this->convertArabicTime($timeMatch[3], $timeMatch[4] ?? '');
        }

        // UPDATE plan_circle_schedules
        $query = DB::table('plan_circle_schedules')
            ->where('circle_id', $circleId)
            ->whereNull('teacher_id'); // بس الـ rows اللي مفهاش معلم

        if ($startTime) {
            $query->where('start_time', 'like', $startTime . '%');
        }

        if ($endTime) {
            $query->where('end_time', 'like', $endTime . '%');
        }

        $updated = $query->update(['teacher_id' => $teacherId]);

        // لو مفيش rows بالوقت، حاول بدون وقت (circle_id بس)
        if ($updated === 0) {
            DB::table('plan_circle_schedules')
                ->where('circle_id', $circleId)
                ->whereNull('teacher_id')
                ->update(['teacher_id' => $teacherId]);
        }
    }

    /**
     * تحويل وقت عربي لـ HH:MM
     * مثال: "6:54" + "م" → "18:54"
     *        "6:54" + "ص" → "06:54"
     */
    private function convertArabicTime(string $time, string $period): string
    {
        [$h, $m] = array_pad(explode(':', $time), 2, '00');
        $h = (int) $h;
        $m = (int) $m;

        if ($period === 'م' && $h < 12) {
            $h += 12;
        } elseif ($period === 'ص' && $h === 12) {
            $h = 0;
        }

        return sprintf('%02d:%02d', $h, $m);
    }
}
