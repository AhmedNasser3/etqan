<?php
namespace App\Http\Controllers\Auth;

use App\Models\Auth\User;
use App\Models\Auth\Teacher;
use App\Models\Tenant\Center;
use App\Models\Tenant\Circle;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\Plans\PlanCircleSchedule;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class TeacherRegisterController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255|min:3',
            'role' => 'required|in:teacher,supervisor,motivator,student_affairs,financial',
            'session_time' => 'nullable|in:asr,maghrib',
            'email' => 'required|email:rfc,dns|max:255|unique:users,email',
            'notes' => 'nullable|string|max:1000',
            'gender' => 'required|in:male,female',
            'center_slug' => 'nullable|string|exists:centers,subdomain',
            'circle_id' => 'nullable|exists:circles,id',
            'schedule_id' => 'nullable|exists:plan_circle_schedules,id',
        ], [
            'full_name.required' => 'الاسم الرباعي مطلوب',
            'email.unique' => 'هذا البريد مسجل مسبقاً',
            'center_slug.exists' => 'مجمع غير موجود',
            'circle_id.exists' => 'الحلقة غير موجودة',
            'schedule_id.exists' => 'الموعد غير موجود',
        ]);

        try {
            DB::beginTransaction();

            $center = $request->filled('center_slug')
                ? Center::where('subdomain', $request->center_slug)->firstOrFail()
                : null;

            $circle = $request->filled('circle_id')
                ? Circle::where('id', $request->circle_id)
                         ->when($center, fn($q) => $q->where('center_id', $center->id))
                         ->first()
                : null;

            $scheduleInfo = null;
            if ($request->filled('schedule_id')) {
                $schedule = PlanCircleSchedule::where('id', $request->schedule_id)
                    ->where('circle_id', $request->circle_id)
                    ->where('is_available', 1)
                    ->first();

                if ($schedule) {
                    $startTime = trim($schedule->start_time);
                    $endTime = trim($schedule->end_time);

                    preg_match('/(\d{2}):(\d{2})/', $startTime, $startMatch);
                    preg_match('/(\d{2}):(\d{2})/', $endTime, $endMatch);

                    $startHour24 = isset($startMatch[1]) ? (int)$startMatch[1] : 0;
                    $startMin = isset($startMatch[2]) ? $startMatch[2] : '00';
                    $endHour24 = isset($endMatch[1]) ? (int)$endMatch[1] : 0;
                    $endMin = isset($endMatch[2]) ? $endMatch[2] : '00';

                    $startHour12 = ($startHour24 % 12) ?: 12;
                    $endHour12 = ($endHour24 % 12) ?: 12;

                    $startPeriod = $startHour24 >= 12 ? 'م' : 'ص';
                    $endPeriod = $endHour24 >= 12 ? 'م' : 'ص';

                    $scheduleInfo = "من {$startHour12}:{$startMin} {$startPeriod} إلى {$endHour12}:{$endMin} {$endPeriod}";
                }
            }

            $randomPassword = Str::random(12);

            $user = User::create([
                'name' => $request->full_name,
                'email' => $request->email,
                'password' => Hash::make($randomPassword),
                'status' => 'pending',
                'gender' => $request->gender,
                'center_id' => $center?->id,
            ]);

            $circleInfo = $circle ? "حلقة: {$circle->name} (ID: {$circle->id})" : null;
            $notes = $request->notes;

            $fullInfo = [];
            if ($circleInfo) $fullInfo[] = $circleInfo;
            if ($scheduleInfo) $fullInfo[] = $scheduleInfo;

            $combinedInfo = implode(' | ', $fullInfo);
            $finalNotes = $notes ? "$notes | $combinedInfo" : $combinedInfo;

            Teacher::create([
                'user_id' => $user->id,
                'role' => $request->role,
                'session_time' => $request->session_time,
                'notes' => $finalNotes,
                'circle_id' => $request->circle_id,
                'schedule_id' => $request->schedule_id,
                'center_id' => $center?->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال طلب التسجيل بنجاح! سيتم مراجعته من الإدارة',
                'user_id' => $user->id,
                'temp_password' => $randomPassword,
                'center_name' => $center?->name ?? 'النظام العام',
                'circle_name' => $circle?->name ?? 'غير محدد',
                'schedule_info' => $scheduleInfo ?? 'غير محدد',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Teacher Registration Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء معالجة الطلب'
            ], 500);
        }
    }

    public function getCirclesByCenterSlug(Request $request, $centerSlug)
    {
        $center = Center::where('subdomain', $centerSlug)->firstOrFail();

        $circles = Circle::where('center_id', $center->id)
            ->with('teacher.user:name,email')
            ->select('id', 'name', 'teacher_id', 'center_id')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'center' => $center->only('id', 'name', 'subdomain'),
            'circles' => $circles
        ]);
    }

    public function getCircleSchedules(Request $request, $centerSlug, $circleId)
    {
        $center = Center::where('subdomain', $centerSlug)->firstOrFail();

        $circle = Circle::where('id', $circleId)
            ->where('center_id', $center->id)
            ->with('teacher.user:name')
            ->firstOrFail();

        $allSchedules = PlanCircleSchedule::where('circle_id', $circleId)->get();

        $schedules = PlanCircleSchedule::where('circle_id', $circleId)
            ->where('is_available', 1)
            ->select([
                'id', 'plan_id', 'circle_id', 'teacher_id',
                'schedule_date', 'start_time', 'end_time',
                'duration_minutes', 'max_students', 'booked_students',
                'day_of_week'
            ])
            ->orderBy('schedule_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'debug_info' => [
                'circle_id' => $circleId,
                'all_schedules_count' => $allSchedules->count(),
                'filtered_count' => $schedules->count(),
            ],
            'center' => $center->only('id', 'name', 'subdomain'),
            'circle' => $circle->only('id', 'name', 'teacher_id'),
            'teacher_name' => $circle->teacher?->user?->name ?? 'غير محدد',
            'available_schedules' => $schedules->map(function($schedule) {
                $availableSeats = $schedule->max_students ?
                    ($schedule->max_students - ($schedule->booked_students ?? 0)) : 50;

                return [
                    'id' => $schedule->id,
                    'date' => $schedule->schedule_date->format('Y-m-d'),
                    'day_of_week' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'duration' => $schedule->duration_minutes . ' دقيقة',
                    'seats_available' => $availableSeats,
                    'is_full' => $availableSeats <= 0,
                    'booked_students' => $schedule->booked_students ?? 0,
                    'max_students' => $schedule->max_students ?? 'غير محدد'
                ];
            })
        ]);
    }

    public function getCirclesByCenter(Request $request)
    {
        $centerId = $request->query('center_id');

        $circles = Circle::when($centerId, function($q) use ($centerId) {
                return $q->where('center_id', $centerId);
            })
            ->select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $circles
        ]);
    }
}
