<?php
// app/Http/Controllers/Teachers/WorkScheduleController.php

namespace App\Http\Controllers\Teachers;

use App\Http\Controllers\Controller;
use App\Models\Auth\Teacher;
use App\Models\Teachers\CenterHoliday;
use App\Models\Teachers\WeeklyOffDay;
use App\Models\Teachers\WorkSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WorkScheduleController extends Controller
{
    // ---------------------------------------------------------------
    //  WORK SCHEDULES
    // ---------------------------------------------------------------

    /** GET /v1/schedules - جلب كل الجداول في المجمع */
    public function index(Request $request)
    {
$centerId = $this->centerId();
        $schedules = WorkSchedule::with('teacher')
            ->where('center_id', $centerId)
            ->get()
            ->map(fn($s) => [
                'id'                  => $s->id,
                'teacher_id'          => $s->teacher_id,
                'teacher_name'        => $s->teacher?->name ?? 'الكل (افتراضي)',
                'work_start_time'     => $s->work_start_time,
                'allowed_late_minutes'=> $s->allowed_late_minutes,
                'label'               => $s->label,
                'is_active'           => $s->is_active,
            ]);

        return response()->json(['success' => true, 'data' => $schedules]);
    }

    /** POST /v1/schedules - إنشاء جدول جديد */
    public function store(Request $request)
    {
$centerId = $this->centerId();
        $v = Validator::make($request->all(), [
            'teacher_id'           => 'nullable|integer|exists:teachers,id',
            'work_start_time'      => 'required|date_format:H:i',
            'allowed_late_minutes' => 'required|integer|min:0|max:120',
            'label'                => 'nullable|string|max:100',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'errors' => $v->errors()], 422);
        }

        // حذف القديم وإنشاء جديد (upsert)
        WorkSchedule::updateOrCreate(
            ['center_id' => $centerId, 'teacher_id' => $request->teacher_id ?? null],
            [
                'work_start_time'      => $request->work_start_time . ':00',
                'allowed_late_minutes' => $request->allowed_late_minutes,
                'label'                => $request->label,
                'is_active'            => true,
            ]
        );

        return response()->json(['success' => true, 'message' => 'تم حفظ الجدول'], 201);
    }

    /** DELETE /v1/schedules/{id} */
    public function destroy(WorkSchedule $schedule)
    {
$centerId = $this->centerId();        if ($schedule->center_id !== $centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }
        $schedule->delete();
        return response()->json(['success' => true, 'message' => 'تم الحذف']);
    }

    // ---------------------------------------------------------------
    //  WEEKLY OFF DAYS
    // ---------------------------------------------------------------

    /** GET /v1/schedules/off-days */
    public function offDays()
    {
$centerId = $this->centerId();        $days = WeeklyOffDay::with('teacher')
            ->where('center_id', $centerId)
            ->get()
            ->map(fn($d) => [
                'id'           => $d->id,
                'teacher_id'   => $d->teacher_id,
                'teacher_name' => $d->teacher?->name ?? 'الكل',
                'day_of_week'  => $d->day_of_week,
                'day_name'     => WeeklyOffDay::$dayNames[$d->day_of_week],
            ]);

        return response()->json(['success' => true, 'data' => $days]);
    }

    /** POST /v1/schedules/off-days */
    public function storeOffDay(Request $request)
    {
$centerId = $this->centerId();
        $v = Validator::make($request->all(), [
            'teacher_id'  => 'nullable|integer|exists:teachers,id',
            'day_of_week' => 'required|integer|min:0|max:6',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'errors' => $v->errors()], 422);
        }

        WeeklyOffDay::updateOrCreate(
            [
                'center_id'   => $centerId,
                'teacher_id'  => $request->teacher_id ?? null,
                'day_of_week' => $request->day_of_week,
            ]
        );

        return response()->json(['success' => true, 'message' => 'تم إضافة يوم الراحة'], 201);
    }

    /** DELETE /v1/schedules/off-days/{id} */
    public function destroyOffDay(WeeklyOffDay $offDay)
    {
$centerId = $this->centerId();        if ($offDay->center_id !== $centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }
        $offDay->delete();
        return response()->json(['success' => true, 'message' => 'تم الحذف']);
    }

    // ---------------------------------------------------------------
    //  HOLIDAYS
    // ---------------------------------------------------------------

    /** GET /v1/schedules/holidays */
    public function holidays(Request $request)
    {
$centerId = $this->centerId();
        $q = CenterHoliday::with('teacher')
            ->where('center_id', $centerId)
            ->orderBy('holiday_date', 'desc');

        if ($request->filled('teacher_id')) {
            $q->where(function ($query) use ($request) {
                $query->where('teacher_id', $request->teacher_id)
                      ->orWhereNull('teacher_id');
            });
        }

        $holidays = $q->get()->map(fn($h) => [
            'id'           => $h->id,
            'teacher_id'   => $h->teacher_id,
            'teacher_name' => $h->teacher?->name ?? 'الكل',
            'holiday_date' => $h->holiday_date->format('Y-m-d'),
            'reason'       => $h->reason,
            'type'         => $h->type,
        ]);

        return response()->json(['success' => true, 'data' => $holidays]);
    }

    /** POST /v1/schedules/holidays */
    public function storeHoliday(Request $request)
    {
$centerId = $this->centerId();
        $v = Validator::make($request->all(), [
            'teacher_id'   => 'nullable|integer|exists:teachers,id',
            'holiday_date' => 'required|date',
            'reason'       => 'nullable|string|max:200',
            'type'         => 'in:full_day,weekend,custom',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'errors' => $v->errors()], 422);
        }

        CenterHoliday::create([
            'center_id'    => $centerId,
            'teacher_id'   => $request->teacher_id ?? null,
            'holiday_date' => $request->holiday_date,
            'reason'       => $request->reason,
            'type'         => $request->type ?? 'full_day',
        ]);

        return response()->json(['success' => true, 'message' => 'تم إضافة الإجازة'], 201);
    }

    /** DELETE /v1/schedules/holidays/{id} */
    public function destroyHoliday(CenterHoliday $holiday)
    {
$centerId = $this->centerId();        if ($holiday->center_id !== $centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }
        $holiday->delete();
        return response()->json(['success' => true, 'message' => 'تم الحذف']);
    }
}