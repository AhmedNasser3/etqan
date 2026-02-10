<?php

namespace App\Http\Controllers\Teachers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Tenant\Circle;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Teachers\AttendanceDay;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{
    /**
     * ✅ ADMIN: عرض سجلات حضور جميع الموظفين (شغال 100%)
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
            $query = AttendanceDay::with(['teacher.user', 'circle'])
                ->select([
                    'id', 'teacher_id', 'circle_id', 'date', 'status',
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
                        'circle_name' => optional($item->circle)->name ?? '-',
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
     * 🔥 MARK STAFF ATTENDANCE - مصحح 100%
     */
    public function markStaffAttendance(Request $request, $attendanceId)
    {
        // 🔥 Debug كامل
        Log::info('🔥 markStaffAttendance called', [
            'attendanceId' => $attendanceId,
            'attendanceId_type' => gettype($attendanceId),
            'user_id' => Auth::id(),
            'request_data' => $request->all(),
            'request_headers' => $request->headers->all()
        ]);

        // ✅ Auth check
        if (!Auth::check()) {
            Log::warning('❌ No auth user');
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        // ✅ Parse attendanceId لـ integer
        $attendanceId = (int) $attendanceId;
        Log::info('🔄 Parsed attendanceId', ['id' => $attendanceId]);

        // ✅ Validation
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
            // ✅ استخدم find() مش findOrFail()
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
                'current_status' => $attendance->status
            ]);

            // ✅ Update data - شيلنا is_auto_created
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
                'data' => $attendance->fresh()
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('❌ Mark attendance EXCEPTION', [
                'attendance_id' => $attendanceId,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => config('app.debug') ? $e->getMessage() : 'فشل في تحديث الحضور',
                'debug' => config('app.debug') ? [
                    'line' => $e->getLine(),
                    'file' => $e->getFile()
                ] : null
            ], 500);
        }
    }

    // باقي الـ methods زي ما هي بدون تغيير...
    public function index(Request $request)
    {
        $teacherId = Auth::id();

        $query = AttendanceDay::with(['teacher', 'circle'])
            ->where('teacher_id', $teacherId)
            ->orderBy('date', 'desc');

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('circle_id')) {
            $query->where('circle_id', $request->circle_id);
        }

        $attendances = $query->paginate(20);

        $circles = Circle::whereIn('id', function($q) use ($teacherId) {
            $q->select('circle_id')
              ->from('attendance_days')
              ->where('teacher_id', $teacherId);
        })->get();

        if ($circles->isEmpty()) {
            $circles = Circle::select('id', 'name')->limit(10)->get();
        }

        return response()->json([
            'success' => true,
            'data' => $attendances,
            'circles' => $circles,
            'filters' => $request->only(['date', 'circle_id'])
        ]);
    }

    public function show(AttendanceDay $attendanceDay)
    {
        if ($attendanceDay->teacher_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $attendanceDay->load(['teacher.user', 'circle'])
        ]);
    }

    public function store(Request $request)
    {
        $teacherId = Auth::id();
        $todayDate = Carbon::today();

        $validator = Validator::make($request->all(), [
            'circle_id' => 'required|exists:circles,id',
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

        $existing = AttendanceDay::where('teacher_id', $teacherId)
            ->where('circle_id', $request->circle_id)
            ->whereDate('date', $todayDate)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'تم تسجيل الحضور لهذا اليوم مسبقاً'
            ], 409);
        }

        $attendance = AttendanceDay::create([
            'teacher_id' => $teacherId,
            'circle_id' => $request->circle_id,
            'date' => $todayDate,
            'status' => $request->status,
            'delay_minutes' => $request->delay_minutes,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الحضور بنجاح',
            'data' => $attendance->load(['teacher', 'circle'])
        ], 201);
    }

    public function update(Request $request, AttendanceDay $attendanceDay)
    {
        if ($attendanceDay->teacher_id !== Auth::id()) {
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
            'data' => $attendanceDay->fresh()->load(['teacher', 'circle'])
        ]);
    }

    public function destroy(AttendanceDay $attendanceDay)
    {
        if ($attendanceDay->teacher_id !== Auth::id()) {
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
        $teacherId = Auth::id();

        $stats = AttendanceDay::where('teacher_id', $teacherId)
            ->when($request->filled('circle_id'), function($q) use ($request) {
                $q->where('circle_id', $request->circle_id);
            })
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
        $teacherId = Auth::id();
        $todayDate = Carbon::today();

        $todayAttendance = AttendanceDay::where('teacher_id', $teacherId)
            ->whereDate('date', $todayDate)
            ->with('circle')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $todayAttendance
        ]);
    }
}
