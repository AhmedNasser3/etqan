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
     *  ADMIN: عرض سجلات حضور جميع الموظفين (محدث لـ center_id)
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
                        'center_name' => optional($item->center)->name ?? '-', //  circle_name → center_name
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

            Log::info(' Attendance found', [
                'id' => $attendance->id,
                'teacher_id' => $attendance->teacher_id,
                'center_id' => $attendance->center_id, //  center_id
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

            Log::info(' Staff attendance updated successfully', [
                'attendance_id' => $attendanceId,
                'new_status' => $request->status,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث حالة الحضور بنجاح',
                'data' => $attendance->fresh()->load(['teacher.user', 'center']) //  circle → center
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
     * 🆕 QUICK CHECK-IN: تسجيل حضور سريع بزر واحد للمعلم
     * استخدمها في frontend: POST /api/teacher/attendance/quick-checkin
     */
   /**
 * 🆕 QUICK CHECK-IN: تسجيل حضور سريع بزر واحد للمعلم
 * Route: POST /api/v1/attendance/quick-checkin
 *//**
 * 🆕 QUICK CHECK-IN: تسجيل حضور سريع بدون تأخير
 * بسجّل الوقت الحالي status = present دايماً
 */
public function quickCheckin(Request $request)
{
    Log::info('🔥 quickCheckin called - معلم ضغط زر الحضور السريع', [
        'user_id' => Auth::id(),
        'ip' => $request->ip(),
        'request_data' => $request->all(),
    ]);

    //  تحقق من الصلاحيات أولاً
    if (!Auth::check()) {
        Log::warning('❌ No auth user in quickCheckin');
        return response()->json([
            'success' => false,
            'message' => 'غير مصرح للمستخدم'
        ], 401);
    }

    $user = Auth::user();
    Log::info('👤 User found', ['user_id' => $user->id, 'name' => $user->name]);

    //  1. جيب الـ Teacher record
    $teacher = Teacher::where('user_id', $user->id)->first();

    if (!$teacher) {
        Log::warning('❌ Teacher not found', ['user_id' => $user->id]);
        return response()->json([
            'success' => false,
            'message' => 'لم يتم العثور على بيانات المعلم - تواصل مع الإدارة',
            'debug' => config('app.debug') ? ['user_id' => $user->id] : []
        ], 404);
    }

    Log::info(' Teacher found', [
        'teacher_id' => $teacher->id,
        'teacher_name' => $teacher->name
    ]);

    //  2. تحقق من الـ Center
    $centerId = $user->center_id;

    if (!$centerId || $centerId == 0) {
        Log::warning('❌ No center_id', [
            'user_id' => $user->id,
            'center_id' => $centerId
        ]);
        return response()->json([
            'success' => false,
            'message' => 'لم يتم تعيين مركز لك - تواصل مع الإدارة',
            'debug' => config('app.debug') ? ['center_id' => $centerId] : []
        ], 400);
    }

    Log::info(' Center found', ['center_id' => $centerId]);

    $todayDate = Carbon::today()->format('Y-m-d');
    $currentTime = Carbon::now();
    $checkinTime = $currentTime->format('H:i:s');

    try {
        //  3. تحقق من وجود حضور اليوم
        $existingAttendance = AttendanceDay::where('teacher_id', $teacher->id)
            ->where('center_id', $centerId)
            ->whereDate('date', $todayDate)
            ->first();

        if ($existingAttendance) {
            Log::info('⚠️ Attendance already exists today', [
                'attendance_id' => $existingAttendance->id,
                'status' => $existingAttendance->status,
                'time' => $existingAttendance->created_at
            ]);

            return response()->json([
                'success' => true,
                'message' => ' تم تسجيل الحضور اليوم الساعة ' . $existingAttendance->created_at->format('H:i'),
                'data' => [
                    'status' => $existingAttendance->status,
                    'time' => $existingAttendance->created_at->format('H:i'),
                    'notes' => $existingAttendance->notes,
                    'date' => $existingAttendance->date->format('Y-m-d')
                ],
                'already_checked_in' => true
            ], 200);
        }

        //  4. إنشاء سجل حضور جديد - بدون تأخير خالص!
        $attendance = AttendanceDay::create([
            'teacher_id' => $teacher->id,
            'center_id' => $centerId,
            'date' => $todayDate,
            'status' => 'present',                    //  دايماً present
            'delay_minutes' => 0,                     //  صفر دايماً
            'notes' => "حضور سريع - {$checkinTime}",  //  وقت الحضور بس
            'created_at' => $currentTime,
            'updated_at' => $currentTime
        ]);

        Log::info(' Quick checkin CREATED successfully', [
            'attendance_id' => $attendance->id,
            'teacher_id' => $teacher->id,
            'center_id' => $centerId,
            'status' => 'present',
            'checkin_time' => $checkinTime,
            'delay_minutes' => 0
        ]);

        //  5. إرجاع الاستجابة الناجحة
        return response()->json([
            'success' => true,
            'message' => " تم تسجيل الحضور بنجاح الساعة {$checkinTime}",
            'data' => [
                'id' => $attendance->id,
                'status' => 'present',
                'checkin_time' => $checkinTime,
                'delay_minutes' => 0,
                'date' => $todayDate,
                'notes' => $attendance->notes
            ],
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name
            ],
            'center_id' => $centerId
        ], 201, [], JSON_UNESCAPED_UNICODE);

    } catch (\Exception $e) {
        Log::error('❌ Quick checkin EXCEPTION', [
            'user_id' => $user->id,
            'teacher_id' => $teacher->id ?? 'null',
            'center_id' => $centerId ?? 'null',
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'فشل في تسجيل الحضور - جرب مرة أخرى',
            'debug' => config('app.debug') ? [
                'teacher_id' => $teacher->id ?? null,
                'center_id' => $centerId ?? null
            ] : []
        ], 500);
    }
}


    /**
     *  عرض سجلات الحضور الخاصة بالمعلم المسجل (محدث لـ center_id)
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        //  جيب teacher_id من جدول teachers بناءً على user_id
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على بيانات المعلم'
            ], 404);
        }

        $centerId = $user->center_id; //  من user.center_id

        if (!$centerId) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم تعيين مركز للمستخدم'
            ], 400);
        }

        $query = AttendanceDay::with(['teacher', 'center']) //  circle → center
            ->where('teacher_id', $teacher->id)
            ->where('center_id', $centerId) //  center_id filter
            ->orderBy('date', 'desc');

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        $attendances = $query->paginate(20);

        //  جيب المركز الخاص باليوزر
        $centers = Center::where('id', $centerId)->select('id', 'name')->get();

        return response()->json([
            'success' => true,
            'data' => $attendances,
            'centers' => $centers, //  بدل circles
            'filters' => $request->only(['date'])
        ]);
    }

    public function show(AttendanceDay $attendanceDay)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        //  تحقق من teacher_id + center_id
        if ($attendanceDay->teacher_id !== $teacher->id || $attendanceDay->center_id !== $user->center_id) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $attendanceDay->load(['teacher.user', 'center']) //  circle → center
        ]);
    }

    /**
     *  تسجيل حضور جديد للمعلم المسجل (محدث لـ center_id)
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        //  جيب teacher_id من جدول teachers
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على بيانات المعلم'
            ], 404);
        }

        $centerId = $user->center_id; //  من user.center_id

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

        //  تحقق من عدم التكرار: teacher_id + center_id + date
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
            'center_id' => $centerId, //  بدل circle_id
            'date' => $todayDate,
            'status' => $request->status,
            'delay_minutes' => $request->delay_minutes,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الحضور بنجاح',
            'data' => $attendance->load(['teacher', 'center']) //  circle → center
        ], 201);
    }

    public function update(Request $request, AttendanceDay $attendanceDay)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        //  تحقق من teacher_id + center_id
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
            'data' => $attendanceDay->fresh()->load(['teacher', 'center']) //  circle → center
        ]);
    }

    public function destroy(AttendanceDay $attendanceDay)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        //  تحقق من teacher_id + center_id
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

        $centerId = $user->center_id; //  من user.center_id

        $stats = AttendanceDay::where('teacher_id', $teacher->id)
            ->where('center_id', $centerId) //  center_id filter
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

/**
 *  GET /api/v1/attendance/today - تحقق من حضور اليوم
 * Frontend يستخدمه لمعرفة لو الزر مفتوح ولا لأ
 */
public function today()
{
    Log::info('🔍 today() called - Check today attendance', [
        'user_id' => Auth::id()
    ]);

    //  تحقق من تسجيل الدخول
    if (!Auth::check()) {
        return response()->json([
            'success' => false,
            'message' => 'غير مصرح',
            'data' => []
        ], 401);
    }

    $user = Auth::user();

    //  1. جيب الـ Teacher record (مش firstOrFail!)
    $teacher = Teacher::where('user_id', $user->id)->first();

    if (!$teacher) {
        Log::info('ℹ️ No teacher record found', ['user_id' => $user->id]);
        return response()->json([
            'success' => true,  //  success = true عشان الـ Frontend يفتح الزر
            'message' => 'لا يوجد بيانات معلم',
            'data' => [],       //  array فارغ = مفيش حضور = الزر مفتوح
            'has_attendance' => false
        ], 200); //  200 مش 404
    }

    Log::info(' Teacher found', [
        'teacher_id' => $teacher->id,
        'user_id' => $user->id
    ]);

    //  2. تحقق من الـ center_id
    $centerId = $user->center_id;

    if (!$centerId || $centerId == 0) {
        Log::warning('⚠️ No center_id', ['user_id' => $user->id]);
        return response()->json([
            'success' => true,
            'message' => 'لم يتم تعيين مركز',
            'data' => [],
            'has_attendance' => false
        ], 200);
    }

    //  3. جيب حضور اليوم (get() مش firstOrFail!)
    $todayDate = Carbon::today();
    $todayAttendance = AttendanceDay::where('teacher_id', $teacher->id)
        ->where('center_id', $centerId)
        ->whereDate('date', $todayDate)
        ->with(['teacher.user', 'center'])
        ->orderBy('created_at', 'desc')
        ->get(); //  get() = array فارغ لو مفيش results

    $hasAttendanceToday = $todayAttendance->isNotEmpty();

    Log::info('📊 Today attendance check', [
        'teacher_id' => $teacher->id,
        'center_id' => $centerId,
        'today_date' => $todayDate->format('Y-m-d'),
        'attendance_count' => $todayAttendance->count(),
        'has_attendance' => $hasAttendanceToday
    ]);

    return response()->json([
        'success' => true,
        'message' => $hasAttendanceToday
            ? 'تم العثور على سجلات حضور اليوم'
            : 'لا يوجد حضور اليوم',
        'data' => $todayAttendance->map(function ($attendance) {
            return [
                'id' => (int) $attendance->id,
                'teacher_id' => (int) $attendance->teacher_id,
                'teacher_name' => $attendance->teacher?->name ?? 'غير معروف',
                'center_name' => $attendance->center?->name ?? '-',
                'status' => $attendance->status ?? 'absent',
                'date' => $attendance->date?->format('Y-m-d'),
                'checkin_time' => $attendance->created_at?->format('H:i'),
                'delay_minutes' => (int) ($attendance->delay_minutes ?? 0),
                'notes' => $attendance->notes ?? ''
            ];
        }),
        'has_attendance' => $hasAttendanceToday,
        'today_date' => $todayDate->format('Y-m-d'),
        'count' => $todayAttendance->count()
    ], 200, [], JSON_UNESCAPED_UNICODE);
}

}
