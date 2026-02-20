<?php

namespace App\Http\Controllers\Teachers;

use App\Http\Controllers\Controller;
use App\Models\Auth\Teacher;
use App\Models\Teachers\AttendanceDay;
use App\Models\Tenant\Center;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{
    /**
     * ✅ ADMIN: عرض سجلات حضور جميع الموظفين (محدث لـ center_id)
     */
    public function staffAttendance(Request $request)
    {
        if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
            $request->headers->set('X-Inertia', 'false');
            $request->server->set('HTTP_X_INERTIA', 'false');
        }

        Log::info('🔥 staffAttendance API called', [
            'user_id' => Auth::id(),
            'date_filter' => $request->get('date_filter'),
        ]);

        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح'
            ], 401);
        }

        $dateFilter = $request->get('date_filter', 'today');
        $nowDate = Carbon::now();

        try {
            $query = AttendanceDay::with(['teacher.user', 'center'])
                ->select([
                    'id', 'teacher_id', 'center_id', 'date', 'status',
                    'notes', 'delay_minutes'
                ]);

            switch ($dateFilter) {
                case 'today':
                    $query->whereDate('date', $nowDate->today());
                    break;
                case 'yesterday':
                    $query->whereDate('date', $nowDate->yesterday());
                    break;
                case 'week':
                    $query->where('date', '>=', $nowDate->copy()->startOfWeek());
                    break;
                case 'month':
                    $query->whereMonth('date', $nowDate->month)
                          ->whereYear('date', $nowDate->year);
                    break;
                default:
                    $query->whereDate('date', $nowDate->today());
            }

            $attendance = $query->get();

            $stats = [
                'total' => $attendance->count(),
                'present' => $attendance->where('status', 'present')->count(),
                'late' => $attendance->where('status', 'late')->count(),
                'absent' => $attendance->where('status', 'absent')->count(),
                'monthly_rate' => $attendance->count() > 0
                    ? round(($attendance->where('status', 'present')->count() / $attendance->count()) * 100, 1)
                    : 0,
                'avg_delay' => round($attendance->avg('delay_minutes') ?? 0),
            ];

            return response()->json([
                'success' => true,
                'data' => $attendance->map(function ($item) {
                    return [
                        'id' => (int) $item->id,
                        'teacher_id' => (int) $item->teacher_id,
                        'teacher_name' => $item->teacher?->name ?? 'غير معروف',
                        'role' => optional($item->teacher?->user)->role ?? 'معلم',
                        'center_name' => optional($item->center)->name ?? '-', // ✅ circle_name → center_name
                        'status' => $item->status ?? 'absent',
                        'notes' => $item->notes ?? 'غياب أوتوماتيك',
                        'date' => $item->date?->format('Y-m-d'),
                        'delay_minutes' => (int) ($item->delay_minutes ?? 0),
                    ];
                }),
                'stats' => $stats
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('❌ staffAttendance error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحميل بيانات الحضور'
            ], 500);
        }
    }

    /**
     * 🔥 MARK STAFF ATTENDANCE - محدث لـ center_id
     */
    public function markStaffAttendance(Request $request, $attendanceId)
    {
        Log::info('🔥 markStaffAttendance called', [
            'attendanceId' => $attendanceId,
            'attendanceId_type' => gettype($attendanceId),
            'user_id' => Auth::id(),
            'request_data' => $request->all(),
        ]);

        if (!Auth::check()) {
            Log::warning('❌ No auth user');
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $attendanceId = (int) $attendanceId;
        Log::info('🔄 Parsed attendanceId', ['id' => $attendanceId]);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:present,late,absent',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            Log::error('❌ Validation failed', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $attendance = AttendanceDay::find($attendanceId);

            if (!$attendance) {
                Log::warning('❌ Attendance not found', ['id' => $attendanceId]);
                return response()->json([
                    'success' => false,
                    'message' => 'سجل الحضور غير موجود'
                ], 404);
            }

            Log::info('✅ Attendance found', [
                'id' => $attendance->id,
                'teacher_id' => $attendance->teacher_id,
                'center_id' => $attendance->center_id, // ✅ center_id
                'current_status' => $attendance->status
            ]);

            $updateData = [
                'status' => $request->status,
                'notes' => $request->status === 'present'
                    ? ($request->notes ?? 'حضور يدوي')
                    : ($request->notes ?? 'غياب يدوي'),
            ];

            if ($request->status === 'late') {
                $updateData['delay_minutes'] = $request->delay_minutes ?? 15;
            }

            $attendance->update($updateData);

            Log::info('✅ Staff attendance updated successfully', [
                'attendance_id' => $attendanceId,
                'new_status' => $request->status,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث حالة الحضور بنجاح',
                'data' => $attendance->fresh()->load(['teacher.user', 'center']) // ✅ circle → center
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('❌ Mark attendance EXCEPTION', [
                'attendance_id' => $attendanceId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => config('app.debug') ? $e->getMessage() : 'فشل في تحديث الحضور'
            ], 500);
        }
    }

    /**
     * ✅ عرض سجلات الحضور الخاصة بالمعلم المسجل (محدث لـ center_id)
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // ✅ جيب teacher_id من جدول teachers بناءً على user_id
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على بيانات المعلم'
            ], 404);
        }

        $centerId = $user->center_id; // ✅ من user.center_id

        if (!$centerId) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم تعيين مركز للمستخدم'
            ], 400);
        }

        $query = AttendanceDay::with(['teacher', 'center']) // ✅ circle → center
            ->where('teacher_id', $teacher->id)
            ->where('center_id', $centerId) // ✅ center_id filter
            ->orderBy('date', 'desc');

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        $attendances = $query->paginate(20);

        // ✅ جيب المركز الخاص باليوزر
        $centers = Center::where('id', $centerId)->select('id', 'name')->get();

        return response()->json([
            'success' => true,
            'data' => $attendances,
            'centers' => $centers, // ✅ بدل circles
            'filters' => $request->only(['date'])
        ]);
    }

    public function show(AttendanceDay $attendanceDay)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        // ✅ تحقق من teacher_id + center_id
        if ($attendanceDay->teacher_id !== $teacher->id || $attendanceDay->center_id !== $user->center_id) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $attendanceDay->load(['teacher.user', 'center']) // ✅ circle → center
        ]);
    }

    /**
     * ✅ تسجيل حضور جديد للمعلم المسجل (محدث لـ center_id)
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // ✅ جيب teacher_id من جدول teachers
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على بيانات المعلم'
            ], 404);
        }

        $centerId = $user->center_id; // ✅ من user.center_id

        if (!$centerId) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم تعيين مركز للمستخدم'
            ], 400);
        }

        $todayDate = Carbon::today();

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:present,late',
            'delay_minutes' => 'nullable|integer|min:1|max:120',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        // ✅ تحقق من عدم التكرار: teacher_id + center_id + date
        $existing = AttendanceDay::where('teacher_id', $teacher->id)
            ->where('center_id', $centerId)
            ->whereDate('date', $todayDate)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'تم تسجيل الحضور لهذا اليوم مسبقاً'
            ], 409);
        }

        $attendance = AttendanceDay::create([
            'teacher_id' => $teacher->id,
            'center_id' => $centerId, // ✅ بدل circle_id
            'date' => $todayDate,
            'status' => $request->status,
            'delay_minutes' => $request->delay_minutes,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الحضور بنجاح',
            'data' => $attendance->load(['teacher', 'center']) // ✅ circle → center
        ], 201);
    }

    public function update(Request $request, AttendanceDay $attendanceDay)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        // ✅ تحقق من teacher_id + center_id
        if ($attendanceDay->teacher_id !== $teacher->id || $attendanceDay->center_id !== $user->center_id) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:present,late,absent',
            'delay_minutes' => 'nullable|integer|min:1|max:120',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة'
            ], 422);
        }

        $attendanceDay->update([
            'status' => $request->status,
            'delay_minutes' => $request->delay_minutes,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث سجل الحضور بنجاح',
            'data' => $attendanceDay->fresh()->load(['teacher', 'center']) // ✅ circle → center
        ]);
    }

    public function destroy(AttendanceDay $attendanceDay)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        // ✅ تحقق من teacher_id + center_id
        if ($attendanceDay->teacher_id !== $teacher->id || $attendanceDay->center_id !== $user->center_id) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        $attendanceDay->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف سجل الحضور بنجاح'
        ]);
    }

    public function stats(Request $request)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على المعلم'
            ], 404);
        }

        $centerId = $user->center_id; // ✅ من user.center_id

        $stats = AttendanceDay::where('teacher_id', $teacher->id)
            ->where('center_id', $centerId) // ✅ center_id filter
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late,
                SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) as absent
            ')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $stats ?: (object) [
                'total' => 0, 'present' => 0, 'late' => 0, 'absent' => 0
            ]
        ]);
    }

    public function today()
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();
        $todayDate = Carbon::today();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على المعلم'
            ], 404);
        }

        $todayAttendance = AttendanceDay::where('teacher_id', $teacher->id)
            ->where('center_id', $user->center_id) // ✅ center_id filter
            ->whereDate('date', $todayDate)
            ->with('center') // ✅ circle → center
            ->get();

        return response()->json([
            'success' => true,
            'data' => $todayAttendance
        ]);
    }
}
