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
use Illuminate\Support\Facades\Log;

class WorkScheduleController extends Controller
{
    // ---------------------------------------------------------------
    //  HELPER - رد موحد مع Log
    // ---------------------------------------------------------------

    private function debugLog(string $method, string $stage, array $data = []): void
    {
        Log::channel('stderr')->debug("🔴 [WorkScheduleController][$method][$stage]", $data);
    }

    private function errorResponse(string $method, string $message, array $extra = [], int $status = 500)
    {
        $this->debugLog($method, 'ERROR', array_merge(['message' => $message], $extra));
        return response()->json([
            'success' => false,
            'message' => $message,
            'debug'   => array_merge(['method' => $method], $extra),
        ], $status)->withHeaders(['X-Debug-Error' => $message]);
    }

    // ---------------------------------------------------------------
    //  WORK SCHEDULES
    // ---------------------------------------------------------------

    /** GET /v1/schedules */
    public function index(Request $request)
    {
        $method = 'index';
        try {
            $centerId = $this->centerId();
            $this->debugLog($method, 'START', ['center_id' => $centerId]);

            $schedules = WorkSchedule::with('teacher')
                ->where('center_id', $centerId)
                ->get()
                ->map(fn($s) => [
                    'id'                   => $s->id,
                    'teacher_id'           => $s->teacher_id,
                    'teacher_name'         => $s->teacher?->name ?? 'الكل (افتراضي)',
                    'work_start_time'      => $s->work_start_time,
                    'allowed_late_minutes' => $s->allowed_late_minutes,
                    'label'                => $s->label,
                    'is_active'            => $s->is_active,
                ]);

            $this->debugLog($method, 'SUCCESS', ['count' => $schedules->count()]);
            return response()->json(['success' => true, 'data' => $schedules]);

        } catch (\Throwable $e) {
            return $this->errorResponse($method, $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => collect($e->getTrace())->take(5)->toArray(),
            ]);
        }
    }

    /** POST /v1/schedules */
    public function store(Request $request)
    {
        $method = 'store';
        try {
            $centerId = $this->centerId();
            $this->debugLog($method, 'START', [
                'center_id' => $centerId,
                'input'     => $request->all(),
            ]);

            $v = Validator::make($request->all(), [
                'teacher_id'           => 'nullable|integer|exists:teachers,id',
                'work_start_time'      => 'required|date_format:H:i',
                'allowed_late_minutes' => 'required|integer|min:0|max:120',
                'label'                => 'nullable|string|max:100',
            ]);

            if ($v->fails()) {
                $this->debugLog($method, 'VALIDATION_FAIL', ['errors' => $v->errors()->toArray()]);
                return response()->json([
                    'success' => false,
                    'errors'  => $v->errors(),
                    'debug'   => [
                        'sent_data'        => $request->all(),
                        'validation_rules' => [
                            'teacher_id'           => 'nullable|integer|exists:teachers,id',
                            'work_start_time'      => 'required|date_format:H:i  ← مثال: 08:30',
                            'allowed_late_minutes' => 'required|integer|min:0|max:120',
                            'label'                => 'nullable|string|max:100',
                        ],
                    ],
                ], 422);
            }

            $schedule = WorkSchedule::updateOrCreate(
                ['center_id' => $centerId, 'teacher_id' => $request->teacher_id ?? null],
                [
                    'work_start_time'      => $request->work_start_time . ':00',
                    'allowed_late_minutes' => $request->allowed_late_minutes,
                    'label'                => $request->label,
                    'is_active'            => true,
                ]
            );

            $this->debugLog($method, 'SUCCESS', ['schedule_id' => $schedule->id, 'wasRecentlyCreated' => $schedule->wasRecentlyCreated]);
            return response()->json(['success' => true, 'message' => 'تم حفظ الجدول'], 201);

        } catch (\Throwable $e) {
            return $this->errorResponse($method, $e->getMessage(), [
                'input' => $request->all(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'trace' => collect($e->getTrace())->take(5)->toArray(),
            ]);
        }
    }

    /** DELETE /v1/schedules/{id} */
    public function destroy(WorkSchedule $schedule)
    {
        $method = 'destroy';
        try {
            $centerId = $this->centerId();
            $this->debugLog($method, 'START', ['schedule_id' => $schedule->id, 'center_id' => $centerId]);

            if ($schedule->center_id !== $centerId) {
                return $this->errorResponse($method, 'غير مصرح', [
                    'schedule_center_id' => $schedule->center_id,
                    'your_center_id'     => $centerId,
                ], 403);
            }

            $schedule->delete();
            $this->debugLog($method, 'SUCCESS', ['deleted_id' => $schedule->id]);
            return response()->json(['success' => true, 'message' => 'تم الحذف']);

        } catch (\Throwable $e) {
            return $this->errorResponse($method, $e->getMessage(), [
                'schedule_id' => $schedule->id,
                'file'        => $e->getFile(),
                'line'        => $e->getLine(),
            ]);
        }
    }

    // ---------------------------------------------------------------
    //  WEEKLY OFF DAYS
    // ---------------------------------------------------------------

    /** GET /v1/schedules/off-days */
    public function offDays()
    {
        $method = 'offDays';
        try {
            $centerId = $this->centerId();
            $this->debugLog($method, 'START', ['center_id' => $centerId]);

            $days = WeeklyOffDay::with('teacher')
                ->where('center_id', $centerId)
                ->get()
                ->map(fn($d) => [
                    'id'           => $d->id,
                    'teacher_id'   => $d->teacher_id,
                    'teacher_name' => $d->teacher?->name ?? 'الكل',
                    'day_of_week'  => $d->day_of_week,
                    'day_name'     => WeeklyOffDay::$dayNames[$d->day_of_week],
                ]);

            $this->debugLog($method, 'SUCCESS', ['count' => $days->count()]);
            return response()->json(['success' => true, 'data' => $days]);

        } catch (\Throwable $e) {
            return $this->errorResponse($method, $e->getMessage(), [
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'trace' => collect($e->getTrace())->take(5)->toArray(),
            ]);
        }
    }

    /** POST /v1/schedules/off-days */
    public function storeOffDay(Request $request)
    {
        $method = 'storeOffDay';
        try {
            $centerId = $this->centerId();
            $this->debugLog($method, 'START', [
                'center_id' => $centerId,
                'input'     => $request->all(),
            ]);

            $v = Validator::make($request->all(), [
                'teacher_id'  => 'nullable|integer|exists:teachers,id',
                'day_of_week' => 'required|integer|min:0|max:6',
            ]);

            if ($v->fails()) {
                $this->debugLog($method, 'VALIDATION_FAIL', ['errors' => $v->errors()->toArray()]);
                return response()->json([
                    'success' => false,
                    'errors'  => $v->errors(),
                    'debug'   => [
                        'sent_data'        => $request->all(),
                        'validation_rules' => [
                            'teacher_id'  => 'nullable|integer|exists:teachers,id',
                            'day_of_week' => 'required|integer|min:0|max:6  ← 0=الأحد ... 6=السبت',
                        ],
                    ],
                ], 422);
            }

            $offDay = WeeklyOffDay::updateOrCreate([
                'center_id'   => $centerId,
                'teacher_id'  => $request->teacher_id ?? null,
                'day_of_week' => $request->day_of_week,
            ]);

            $this->debugLog($method, 'SUCCESS', ['off_day_id' => $offDay->id]);
            return response()->json(['success' => true, 'message' => 'تم إضافة يوم الراحة'], 201);

        } catch (\Throwable $e) {
            return $this->errorResponse($method, $e->getMessage(), [
                'input' => $request->all(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'trace' => collect($e->getTrace())->take(5)->toArray(),
            ]);
        }
    }

    /** DELETE /v1/schedules/off-days/{id} */
    public function destroyOffDay(WeeklyOffDay $offDay)
    {
        $method = 'destroyOffDay';
        try {
            $centerId = $this->centerId();
            $this->debugLog($method, 'START', ['off_day_id' => $offDay->id, 'center_id' => $centerId]);

            if ($offDay->center_id !== $centerId) {
                return $this->errorResponse($method, 'غير مصرح', [
                    'offDay_center_id' => $offDay->center_id,
                    'your_center_id'   => $centerId,
                ], 403);
            }

            $offDay->delete();
            $this->debugLog($method, 'SUCCESS', ['deleted_id' => $offDay->id]);
            return response()->json(['success' => true, 'message' => 'تم الحذف']);

        } catch (\Throwable $e) {
            return $this->errorResponse($method, $e->getMessage(), [
                'off_day_id' => $offDay->id,
                'file'       => $e->getFile(),
                'line'       => $e->getLine(),
            ]);
        }
    }

    // ---------------------------------------------------------------
    //  HOLIDAYS
    // ---------------------------------------------------------------

    /** GET /v1/schedules/holidays */
    public function holidays(Request $request)
    {
        $method = 'holidays';
        try {
            $centerId = $this->centerId();
            $this->debugLog($method, 'START', [
                'center_id'  => $centerId,
                'teacher_id' => $request->teacher_id,
            ]);

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

            $this->debugLog($method, 'SUCCESS', ['count' => $holidays->count()]);
            return response()->json(['success' => true, 'data' => $holidays]);

        } catch (\Throwable $e) {
            return $this->errorResponse($method, $e->getMessage(), [
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'trace' => collect($e->getTrace())->take(5)->toArray(),
            ]);
        }
    }

    /** POST /v1/schedules/holidays */
    public function storeHoliday(Request $request)
    {
        $method = 'storeHoliday';
        try {
            $centerId = $this->centerId();
            $this->debugLog($method, 'START', [
                'center_id' => $centerId,
                'input'     => $request->all(),
            ]);

            $v = Validator::make($request->all(), [
                'teacher_id'   => 'nullable|integer|exists:teachers,id',
                'holiday_date' => 'required|date',
                'reason'       => 'nullable|string|max:200',
                'type'         => 'in:full_day,weekend,custom',
            ]);

            if ($v->fails()) {
                $this->debugLog($method, 'VALIDATION_FAIL', ['errors' => $v->errors()->toArray()]);
                return response()->json([
                    'success' => false,
                    'errors'  => $v->errors(),
                    'debug'   => [
                        'sent_data'        => $request->all(),
                        'validation_rules' => [
                            'teacher_id'   => 'nullable|integer|exists:teachers,id',
                            'holiday_date' => 'required|date  ← مثال: 2025-01-15',
                            'reason'       => 'nullable|string|max:200',
                            'type'         => 'in:full_day,weekend,custom',
                        ],
                    ],
                ], 422);
            }

            $holiday = CenterHoliday::create([
                'center_id'    => $centerId,
                'teacher_id'   => $request->teacher_id ?? null,
                'holiday_date' => $request->holiday_date,
                'reason'       => $request->reason,
                'type'         => $request->type ?? 'full_day',
            ]);

            $this->debugLog($method, 'SUCCESS', ['holiday_id' => $holiday->id]);
            return response()->json(['success' => true, 'message' => 'تم إضافة الإجازة'], 201);

        } catch (\Throwable $e) {
            return $this->errorResponse($method, $e->getMessage(), [
                'input' => $request->all(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'trace' => collect($e->getTrace())->take(5)->toArray(),
            ]);
        }
    }

    /** DELETE /v1/schedules/holidays/{id} */
    public function destroyHoliday(CenterHoliday $holiday)
    {
        $method = 'destroyHoliday';
        try {
            $centerId = $this->centerId();
            $this->debugLog($method, 'START', ['holiday_id' => $holiday->id, 'center_id' => $centerId]);

            if ($holiday->center_id !== $centerId) {
                return $this->errorResponse($method, 'غير مصرح', [
                    'holiday_center_id' => $holiday->center_id,
                    'your_center_id'    => $centerId,
                ], 403);
            }

            $holiday->delete();
            $this->debugLog($method, 'SUCCESS', ['deleted_id' => $holiday->id]);
            return response()->json(['success' => true, 'message' => 'تم الحذف']);

        } catch (\Throwable $e) {
            return $this->errorResponse($method, $e->getMessage(), [
                'holiday_id' => $holiday->id,
                'file'       => $e->getFile(),
                'line'       => $e->getLine(),
            ]);
        }
    }
}
