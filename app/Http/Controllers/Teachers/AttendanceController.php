<?php

namespace App\Http\Controllers\Teachers;

use App\Http\Controllers\Controller;
use App\Models\Auth\Teacher;
use App\Models\Teachers\AttendanceDay;
use App\Models\Tenant\Center;
use App\Services\AttendanceScheduleService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{
    /**
     * ADMIN: عرض سجلات حضور جميع الموظفين
     */
   /**
 * ADMIN: عرض سجلات حضور جميع الموظفين
 */
public function staffAttendance(Request $request)
{
    if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
        $request->headers->set('X-Inertia', 'false');
        $request->server->set('HTTP_X_INERTIA', 'false');
    }

    if (!Auth::check()) {
        return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
    }

    $user       = Auth::user();
    $centerId   = $user->center_id;
    $dateFilter = $request->get('date_filter', 'today');
    $nowDate    = Carbon::now();

    try {
        $query = AttendanceDay::with(['teacher.user', 'center'])
            ->select(['id', 'teacher_id', 'center_id', 'date', 'status', 'notes', 'delay_minutes', 'created_at']);

        if ($centerId) {
            $query->where('center_id', $centerId);
        }

        switch ($dateFilter) {
            case 'today':
                $query->whereDate('date', Carbon::today());
                break;
            case 'yesterday':
                $query->whereDate('date', Carbon::yesterday());
                break;
            case 'week':
                $query->whereBetween('date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek(),
                ]);
                break;
            case 'month':
                $query->whereMonth('date', $nowDate->month)
                      ->whereYear('date', $nowDate->year);
                break;
            case 'custom':
                if ($request->filled('date_from')) {
                    $query->whereDate('date', '>=', $request->date_from);
                }
                if ($request->filled('date_to')) {
                    $query->whereDate('date', '<=', $request->date_to);
                }
                break;
            default:
                $query->whereDate('date', Carbon::today());
        }

        $attendance = $query->orderBy('date', 'desc')
                            ->orderBy('created_at', 'desc')
                            ->get();

        $stats = [
            'total'        => $attendance->count(),
            'present'      => $attendance->where('status', 'present')->count(),
            'late'         => $attendance->where('status', 'late')->count(),
            'absent'       => $attendance->where('status', 'absent')->count(),
            'monthly_rate' => $attendance->count() > 0
                ? round(($attendance->whereIn('status', ['present', 'late'])->count() / $attendance->count()) * 100, 1)
                : 0,
            'avg_delay'    => round($attendance->where('delay_minutes', '>', 0)->avg('delay_minutes') ?? 0),
        ];

        return response()->json([
            'success' => true,
            'data'    => $attendance->map(function ($item) {
                // ✅ جيب الاسم من user.first_name + user.second_name
                $teacherUser  = $item->teacher?->user;
                $teacherName  = '';

                if ($teacherUser) {
                    $teacherName = trim(
                        ($teacherUser->first_name  ?? '') . ' ' .
                        ($teacherUser->second_name ?? '')
                    );
                    // لو first_name و second_name فاضيين جرب name
                    if (!$teacherName) {
                        $teacherName = $teacherUser->name ?? '';
                    }
                }

                if (!$teacherName) {
                    $teacherName = 'غير معروف';
                }

                return [
                    'id'            => (int) $item->id,
                    'teacher_id'    => (int) $item->teacher_id,
                    'teacher_name'  => $teacherName,  // ✅
                    'role'          => $teacherUser?->role ?? 'معلم',
                    'center_name'   => optional($item->center)->name ?? '-',
                    'status'        => $item->status ?? 'absent',
                    'notes'         => $item->notes ?? '-',
                    'date'          => $item->date?->format('Y-m-d'),
                    'checkin_time'  => $item->created_at?->format('H:i'),
                    'delay_minutes' => (int) ($item->delay_minutes ?? 0),
                ];
            }),
            'stats' => $stats,
        ], 200, [], JSON_UNESCAPED_UNICODE);

    } catch (\Exception $e) {
        Log::error('❌ staffAttendance error', ['error' => $e->getMessage()]);
        return response()->json([
            'success' => false,
            'message' => 'خطأ في تحميل بيانات الحضور',
        ], 500);
    }
}

    /**
     * ADMIN: تعديل حالة حضور موظف معين
     */
    public function markStaffAttendance(Request $request, $attendanceId)
    {
        Log::info('🔥 markStaffAttendance called', [
            'attendanceId'      => $attendanceId,
            'attendanceId_type' => gettype($attendanceId),
            'user_id'           => Auth::id(),
            'request_data'      => $request->all(),
        ]);

        if (!Auth::check()) {
            Log::warning('❌ No auth user');
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $attendanceId = (int) $attendanceId;

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:present,late,absent',
            'notes'  => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            Log::error('❌ Validation failed', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $attendance = AttendanceDay::find($attendanceId);

            if (!$attendance) {
                Log::warning('❌ Attendance not found', ['id' => $attendanceId]);
                return response()->json(['success' => false, 'message' => 'سجل الحضور غير موجود'], 404);
            }

            $updateData = [
                'status' => $request->status,
                'notes'  => $request->status === 'present'
                    ? ($request->notes ?? 'حضور يدوي')
                    : ($request->notes ?? 'غياب يدوي'),
            ];

            if ($request->status === 'late') {
                $updateData['delay_minutes'] = $request->delay_minutes ?? 15;
            }

            $attendance->update($updateData);

            Log::info('✅ Staff attendance updated successfully', [
                'attendance_id' => $attendanceId,
                'new_status'    => $request->status,
                'user_id'       => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث حالة الحضور بنجاح',
                'data'    => $attendance->fresh()->load(['teacher.user', 'center']),
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('❌ Mark attendance EXCEPTION', [
                'attendance_id' => $attendanceId,
                'error'         => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => config('app.debug') ? $e->getMessage() : 'فشل في تحديث الحضور',
            ], 500);
        }
    }

    /**
     * QUICK CHECK-IN: تسجيل حضور سريع مع احتساب التأخير تلقائياً
     * POST /v1/attendance/quick-checkin
     */
    public function quickCheckin(Request $request)
    {
        Log::info('🔥 quickCheckin called', [
            'user_id'      => Auth::id(),
            'ip'           => $request->ip(),
            'request_data' => $request->all(),
        ]);

        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'غير مصرح للمستخدم'], 401);
        }

        $user    = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على بيانات المعلم - تواصل مع الإدارة',
                'debug'   => config('app.debug') ? ['user_id' => $user->id] : [],
            ], 404);
        }

        $centerId = $user->center_id;

        if (!$centerId || $centerId == 0) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم تعيين مركز لك - تواصل مع الإدارة',
                'debug'   => config('app.debug') ? ['center_id' => $centerId] : [],
            ], 400);
        }

        $today   = Carbon::today();
        $now     = Carbon::now();
        $service = app(AttendanceScheduleService::class);

        // ---- تحقق إجازة ----
        if ($service->isHoliday($centerId, $teacher->id, $today)) {
            return response()->json([
                'success'    => false,
                'message'    => 'اليوم إجازة - لا يمكن تسجيل الحضور',
                'is_holiday' => true,
            ], 400);
        }

        // ---- تحقق تكرار ----
        $existing = AttendanceDay::where('teacher_id', $teacher->id)
            ->where('center_id', $centerId)
            ->whereDate('date', $today)
            ->first();

        if ($existing) {
            return response()->json([
                'success'          => true,
                'message'          => 'تم تسجيل الحضور اليوم الساعة ' . $existing->created_at->format('H:i'),
                'data'             => [
                    'status'        => $existing->status,
                    'time'          => $existing->created_at->format('H:i'),
                    'notes'         => $existing->notes,
                    'date'          => $existing->date->format('Y-m-d'),
                    'delay_minutes' => (int) $existing->delay_minutes,
                ],
                'already_checked_in' => true,
            ], 200);
        }

        // ---- احسب الحالة من الجدول ----
        $schedule   = $service->getScheduleFor($centerId, $teacher->id);
        $statusData = ['status' => 'present', 'delay_minutes' => 0];
        $lateReason = null;

        if ($schedule) {
            $statusData = $service->calculateStatus($schedule, $now);

            if ($statusData['status'] === 'late') {
                $lateReason = $request->input('late_reason');

                if (!$lateReason) {
                    return response()->json([
                        'success'         => false,
                        'requires_reason' => true,
                        'message'         => 'أنت متأخر ' . $statusData['delay_minutes'] . ' دقيقة - يرجى إدخال سبب التأخير',
                        'delay_minutes'   => $statusData['delay_minutes'],
                        'work_start_time' => $schedule->work_start_time,
                    ], 422);
                }
            }
        }

        // ---- إنشاء السجل ----
        $notes = $statusData['status'] === 'late'
            ? "متأخر {$statusData['delay_minutes']} دقيقة - السبب: {$lateReason}"
            : "حضور سريع - {$now->format('H:i:s')}";

        try {
            $attendance = AttendanceDay::create([
                'teacher_id'    => $teacher->id,
                'center_id'     => $centerId,
                'date'          => $today->format('Y-m-d'),
                'status'        => $statusData['status'],
                'delay_minutes' => $statusData['delay_minutes'],
                'notes'         => $notes,
            ]);

            Log::info('✅ Quick checkin CREATED successfully', [
                'attendance_id' => $attendance->id,
                'teacher_id'    => $teacher->id,
                'center_id'     => $centerId,
                'status'        => $statusData['status'],
                'delay_minutes' => $statusData['delay_minutes'],
            ]);

            return response()->json([
                'success' => true,
                'message' => $statusData['status'] === 'late'
                    ? "تم التسجيل - متأخر {$statusData['delay_minutes']} دقيقة"
                    : "تم تسجيل الحضور بنجاح الساعة {$now->format('H:i')}",
                'data'    => [
                    'id'            => $attendance->id,
                    'status'        => $attendance->status,
                    'checkin_time'  => $now->format('H:i'),
                    'delay_minutes' => $attendance->delay_minutes,
                    'date'          => $today->format('Y-m-d'),
                    'notes'         => $attendance->notes,
                ],
                'teacher'   => ['id' => $teacher->id, 'name' => $teacher->name],
                'center_id' => $centerId,
            ], 201, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('❌ Quick checkin EXCEPTION', [
                'user_id'    => $user->id,
                'teacher_id' => $teacher->id,
                'center_id'  => $centerId,
                'error'      => $e->getMessage(),
                'file'       => $e->getFile(),
                'line'       => $e->getLine(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'فشل في تسجيل الحضور - جرب مرة أخرى',
                'debug'   => config('app.debug') ? ['teacher_id' => $teacher->id, 'center_id' => $centerId] : [],
            ], 500);
        }
    }

    /**
     * عرض سجلات الحضور الخاصة بالمعلم المسجل
     * GET /v1/attendance
     */
    public function index(Request $request)
    {
        $user    = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'لم يتم العثور على بيانات المعلم'], 404);
        }

        $centerId = $user->center_id;

        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'لم يتم تعيين مركز للمستخدم'], 400);
        }

        $query = AttendanceDay::with(['teacher', 'center'])
            ->where('teacher_id', $teacher->id)
            ->where('center_id', $centerId)
            ->orderBy('date', 'desc');

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        $attendances    = $query->paginate(20);
        $attendanceData = $attendances->getCollection()->map(function ($day) {
            return [
                'id'           => $day->id,
                'date'         => $day->date->format('Y-m-d'),
                'day_name'     => $day->date->format('l'),
                'teacher_id'   => $day->teacher_id,
                'center_id'    => $day->center_id,
                'center_name'  => $day->center->name ?? 'غير محدد',
                'status'       => $day->status,
                'delay_minutes'=> $day->delay_minutes,
                'notes'        => $day->notes ?? null,
                'total_status' => $this->calculateTotalStatus($day),
                'created_at'   => $day->created_at->format('Y-m-d H:i:s'),
            ];
        });

        $attendances->setCollection($attendanceData);

        $centers = Center::where('id', $centerId)->select('id', 'name')->get();

        return response()->json([
            'success' => true,
            'data'    => $attendances,
            'centers' => $centers,
            'filters' => [
                'date_from' => $request->input('date_from'),
                'date_to'   => $request->input('date_to'),
                'date'      => $request->input('date'),
            ],
            'teacher' => [
                'id'   => $teacher->id,
                'name' => $teacher->name ?? 'غير محدد',
            ],
            'meta' => [
                'total_records' => $attendances->total(),
                'per_page'      => $attendances->perPage(),
                'current_page'  => $attendances->currentPage(),
            ],
        ]);
    }

    /**
     * حساب الحالة الإجمالية بناءً على status و delay_minutes
     */
    private function calculateTotalStatus(AttendanceDay $day): string
    {
        if ($day->status === 'absent') {
            return 'absent';
        }

        if ($day->status === 'late' || ($day->status === 'present' && $day->delay_minutes > 0)) {
            return 'partial';
        }

        return 'present';
    }

    /**
     * عرض سجل حضور واحد
     * GET /v1/attendance/{attendanceDay}
     */
    public function show(AttendanceDay $attendanceDay)
    {
        $user    = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if ($attendanceDay->teacher_id !== $teacher->id || $attendanceDay->center_id !== $user->center_id) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        return response()->json([
            'success' => true,
            'data'    => $attendanceDay->load(['teacher.user', 'center']),
        ]);
    }

    /**
     * تسجيل حضور جديد للمعلم المسجل
     * POST /v1/attendance
     */
    public function store(Request $request)
    {
        $user    = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'لم يتم العثور على بيانات المعلم'], 404);
        }

        $centerId = $user->center_id;

        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'لم يتم تعيين مركز للمستخدم'], 400);
        }

        $validator = Validator::make($request->all(), [
            'status'        => 'required|in:present,late',
            'delay_minutes' => 'nullable|integer|min:1|max:120',
            'notes'         => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $todayDate = Carbon::today();

        $existing = AttendanceDay::where('teacher_id', $teacher->id)
            ->where('center_id', $centerId)
            ->whereDate('date', $todayDate)
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'تم تسجيل الحضور لهذا اليوم مسبقاً'], 409);
        }

        $attendance = AttendanceDay::create([
            'teacher_id'    => $teacher->id,
            'center_id'     => $centerId,
            'date'          => $todayDate,
            'status'        => $request->status,
            'delay_minutes' => $request->delay_minutes,
            'notes'         => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الحضور بنجاح',
            'data'    => $attendance->load(['teacher', 'center']),
        ], 201);
    }

    /**
     * تعديل سجل حضور
     * PUT /v1/attendance/{attendanceDay}
     */
    public function update(Request $request, AttendanceDay $attendanceDay)
    {
        $user    = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if ($attendanceDay->teacher_id !== $teacher->id || $attendanceDay->center_id !== $user->center_id) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status'        => 'required|in:present,late,absent',
            'delay_minutes' => 'nullable|integer|min:1|max:120',
            'notes'         => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'بيانات غير صحيحة'], 422);
        }

        $attendanceDay->update([
            'status'        => $request->status,
            'delay_minutes' => $request->delay_minutes,
            'notes'         => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث سجل الحضور بنجاح',
            'data'    => $attendanceDay->fresh()->load(['teacher', 'center']),
        ]);
    }

    /**
     * حذف سجل حضور
     * DELETE /v1/attendance/{attendanceDay}
     */
    public function destroy(AttendanceDay $attendanceDay)
    {
        $user    = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if ($attendanceDay->teacher_id !== $teacher->id || $attendanceDay->center_id !== $user->center_id) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        $attendanceDay->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف سجل الحضور بنجاح']);
    }

    /**
     * إحصائيات الحضور للمعلم
     * GET /v1/attendance/stats
     */
    public function stats(Request $request)
    {
        $user    = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'لم يتم العثور على المعلم'], 404);
        }

        $centerId = $user->center_id;

        $stats = AttendanceDay::where('teacher_id', $teacher->id)
            ->where('center_id', $centerId)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = "late"    THEN 1 ELSE 0 END) as late,
                SUM(CASE WHEN status = "absent"  THEN 1 ELSE 0 END) as absent
            ')
            ->first();

        return response()->json([
            'success' => true,
            'data'    => $stats ?: (object) ['total' => 0, 'present' => 0, 'late' => 0, 'absent' => 0],
        ]);
    }

    /**
     * تحقق من حضور اليوم
     * GET /v1/attendance/today
     */
    public function today()
    {
        Log::info('🔍 today() called', ['user_id' => Auth::id()]);

        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'غير مصرح', 'data' => []], 401);
        }

        $user    = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return response()->json([
                'success'        => true,
                'message'        => 'لا يوجد بيانات معلم',
                'data'           => [],
                'has_attendance' => false,
            ], 200);
        }

        $centerId = $user->center_id;

        if (!$centerId || $centerId == 0) {
            return response()->json([
                'success'        => true,
                'message'        => 'لم يتم تعيين مركز',
                'data'           => [],
                'has_attendance' => false,
            ], 200);
        }

        $todayDate      = Carbon::today();
        $todayAttendance = AttendanceDay::where('teacher_id', $teacher->id)
            ->where('center_id', $centerId)
            ->whereDate('date', $todayDate)
            ->with(['teacher.user', 'center'])
            ->orderBy('created_at', 'desc')
            ->get();

        $hasAttendanceToday = $todayAttendance->isNotEmpty();

        Log::info('📊 Today attendance check', [
            'teacher_id'       => $teacher->id,
            'center_id'        => $centerId,
            'today_date'       => $todayDate->format('Y-m-d'),
            'attendance_count' => $todayAttendance->count(),
            'has_attendance'   => $hasAttendanceToday,
        ]);

        return response()->json([
            'success'        => true,
            'message'        => $hasAttendanceToday ? 'تم العثور على سجلات حضور اليوم' : 'لا يوجد حضور اليوم',
            'data'           => $todayAttendance->map(function ($attendance) {
                return [
                    'id'            => (int) $attendance->id,
                    'teacher_id'    => (int) $attendance->teacher_id,
                    'teacher_name'  => $attendance->teacher?->name ?? 'غير معروف',
                    'center_name'   => $attendance->center?->name ?? '-',
                    'status'        => $attendance->status ?? 'absent',
                    'date'          => $attendance->date?->format('Y-m-d'),
                    'checkin_time'  => $attendance->created_at?->format('H:i'),
                    'delay_minutes' => (int) ($attendance->delay_minutes ?? 0),
                    'notes'         => $attendance->notes ?? '',
                ];
            }),
            'has_attendance' => $hasAttendanceToday,
            'today_date'     => $todayDate->format('Y-m-d'),
            'count'          => $todayAttendance->count(),
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }
}