<?php

namespace App\Http\Controllers\Student;

use App\Models\Plans\Plan;
use App\Models\Tenant\Center;
use App\Models\Plans\CircleStudentBooking;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Plans\PlanDetail;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class StudentPlansController extends Controller
{
    private function getArabicDay($dayOfWeek): string
    {
        $days = [
            'monday'    => 'الإثنين',
            'tuesday'   => 'الثلاثاء',
            'wednesday' => 'الأربعاء',
            'thursday'  => 'الخميس',
            'friday'    => 'الجمعة',
            'saturday'  => 'السبت',
            'sunday'    => 'الأحد',
        ];
        return $days[$dayOfWeek] ?? $dayOfWeek;
    }

    private function formatTimeToArabic12Hour($timeString): string
    {
        $time          = strtotime($timeString);
        $formattedTime = date('g:i', $time);
        $hour          = (int) date('H', $time);
        $period        = $hour >= 12 ? 'م' : 'ص';
        return $formattedTime . ' ' . $period;
    }

    private function buildScheduleDaysLabel(PlanCircleSchedule $schedule): string
    {
        if ($schedule->repeat_type === 'specific_days') {
            $decoded = is_array($schedule->repeat_days)
                ? $schedule->repeat_days
                : json_decode($schedule->repeat_days ?? '[]', true);

            if (!empty($decoded)) {
                $labels = array_map(fn($d) => $this->getArabicDay(strtolower(trim($d))), $decoded);
                return implode('، ', $labels);
            }
        }

        return 'يومياً';
    }

    private function buildRepeatDaysArray(PlanCircleSchedule $schedule): array
    {
        if ($schedule->repeat_type === 'specific_days') {
            $decoded = is_array($schedule->repeat_days)
                ? $schedule->repeat_days
                : json_decode($schedule->repeat_days ?? '[]', true);

            if (!empty($decoded)) {
                return array_values(
                    array_map(fn($d) => $this->getArabicDay(strtolower(trim($d))), $decoded)
                );
            }
        }

        return ['يومياً'];
    }

    private function formatScheduleItem(PlanCircleSchedule $schedule, Plan $plan): array
    {
        $startTime12Hour = $this->formatTimeToArabic12Hour($schedule->start_time);
        $endTime12Hour   = $this->formatTimeToArabic12Hour($schedule->end_time);
        $startTime24Hour = date('H:i', strtotime($schedule->start_time));
        $endTime24Hour   = date('H:i', strtotime($schedule->end_time));

        return [
            'id'                  => $schedule->id,
            'date'                => $schedule->schedule_date?->format('Y-m-d'),
            'day_of_week'         => $schedule->day_of_week,
            'day_of_week_ar'      => $this->getArabicDay($schedule->day_of_week),
            'repeat_type'         => $schedule->repeat_type ?? 'daily',
            'repeat_days'         => $this->buildRepeatDaysArray($schedule),
            'schedule_days_label' => $this->buildScheduleDaysLabel($schedule),
            'plan_end_date'       => $schedule->plan_end_date,
            'start_time'          => $startTime24Hour,
            'end_time'            => $endTime24Hour,
            'start_time_12h_ar'   => $startTime12Hour,
            'end_time_12h_ar'     => $endTime12Hour,
            'time_range'          => $startTime12Hour . ' - ' . $endTime12Hour,
            'is_available'        => $schedule->is_available,
            'circle_name'         => $schedule->circle->name ?? 'غير محدد',
            'mosque_name'         => $schedule->circle->mosque->name ?? 'خاص بالمجمع',
            'teacher_name'        => $schedule->teacher?->name ?? 'معلم متاح',
            'group'               => $schedule->circle->name . ' - ' . ($schedule->circle->mosque->name ?? 'مسجد'),
            'plan_id'             => $plan->id,
            'circle_id'           => $schedule->circle_id,
            'teacher_id'          => $schedule->teacher_id,
        ];
    }

    // =========================================================
    // ✅ availablePlans - التعديل الرئيسي هنا
    // =========================================================
    public function availablePlans(Request $request)
    {
        $user = Auth::user();

        if (!$user || ($user->role && $user->role->id === 1)) {
            return response()->json([
                'data' => [], 'current_page' => 1, 'last_page' => 1, 'per_page' => 12, 'total' => 0
            ]);
        }

        if ($user->role && !in_array($user->role->id, [2, 3])) {
            return response()->json([
                'data' => [], 'current_page' => 1, 'last_page' => 1, 'per_page' => 12, 'total' => 0
            ]);
        }

        $userCenterId = $user?->center_id;

        $query = Plan::with([
                'center:id,name',
                'details:id,plan_id,day_number,status',
                'planCircleSchedules' => function ($q) use ($userCenterId) {
                    $q->where('is_available', true)
                      ->where('booked_students', '<', 20)
                      ->whereNotNull('teacher_id') // ✅ فقط الحلقات التي فيها معلم
                      ->when($userCenterId, function ($q2) use ($userCenterId) {
                          $q2->whereHas('circle', function ($q3) use ($userCenterId) {
                              $q3->where('center_id', $userCenterId);
                          });
                      })
                      ->with([
                          'circle:id,name,center_id,mosque_id',
                          'circle.center:id,name',
                          'circle.mosque:id,name,center_id',
                          'teacher:id,name',
                      ])
                      ->orderBy('schedule_date')
                      ->orderBy('start_time');
                      // ✅ حذفنا ->take(3) نهائياً
                },
            ])
            ->withCount(['details as details_count'])
            ->when($userCenterId, function ($q) use ($userCenterId) {
                $q->where('center_id', $userCenterId);
            })
            ->orderBy('created_at', 'desc');

        if ($request->filled('center_id'))  $query->where('center_id', $request->center_id);
        if ($request->filled('max_months')) $query->where('total_months', '<=', $request->max_months);
        if ($request->filled('search'))     $query->where('plan_name', 'like', '%' . $request->search . '%');

        $perPage = $request->get('per_page', 12);
        $plans   = $query->paginate($perPage);

        $plansData = $plans->getCollection()->map(function ($plan) {
            $availableSchedules = $plan->planCircleSchedules ?? collect();

            $scheduleItems = $availableSchedules->map(
                fn($schedule) => $this->formatScheduleItem($schedule, $plan)
            )->values()->toArray();

            $planData                              = $plan->toArray();
            $planData['available_schedules_count'] = count($scheduleItems);
            $planData['schedule_summary']          = [[
                'schedule_items'  => $scheduleItems,
                'total_schedules' => count($scheduleItems),
            ]];

            return $planData;
        })->toArray();

        return response()->json([
            'data'         => $plansData,
            'current_page' => $plans->currentPage(),
            'last_page'    => $plans->lastPage(),
            'per_page'     => $plans->perPage(),
            'total'        => $plans->total(),
        ]);
    }

    public function myPlans(Request $request)
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role->id ?? 0, [2, 3])) {
            return response()->json(['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0]);
        }

        $userCenterId = $user->center_id;

        $bookings = CircleStudentBooking::where('user_id', $user->id)
            ->with([
                'plan:id,plan_name,total_months,center_id',
                'plan.center:id,name',
                'plan.planCircleSchedules' => function ($q) use ($userCenterId) {
                    $q->where('is_available', true)
                      ->when($userCenterId, function ($q2) use ($userCenterId) {
                          $q2->whereHas('circle', function ($q3) use ($userCenterId) {
                              $q3->where('center_id', $userCenterId);
                          });
                      })
                      ->with([
                          'circle:id,name,center_id,mosque_id',
                          'circle.center:id,name',
                          'circle.mosque:id,name',
                          'teacher:id,name',
                      ])
                      ->take(3);
                },
            ])
            ->withCount(['sessions as attended_sessions'])
            ->latest()
            ->paginate(10);

        $plansData = $bookings->map(function ($booking) {
            $plan = $booking->plan->toArray();
            $plan['details_count'] = $booking->sessions_count ?? 0;

            if (!empty($plan['plan_circle_schedules'])) {
                $plan['next_schedules'] = array_slice($plan['plan_circle_schedules'], 0, 3);
            } else {
                $plan['next_schedules'] = [];
            }
            unset($plan['plan_circle_schedules']);

            return $plan;
        })->toArray();

        return response()->json([
            'data'         => $plansData,
            'current_page' => $bookings->currentPage(),
            'last_page'    => $bookings->lastPage(),
            'per_page'     => $bookings->perPage(),
            'total'        => $bookings->total(),
        ]);
    }

    public function planDetails($planId)
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role->id ?? 0, [2, 3])) {
            abort(403, 'غير مصرح');
        }

        $userCenterId = $user->center_id;

        $plan = Plan::with([
            'center:id,name',
            'details:id,plan_id,day_number,status',
            'planCircleSchedules' => function ($q) use ($userCenterId) {
                $q->where('is_available', true)
                  ->where('booked_students', '<', 20)
                  ->whereNotNull('teacher_id') // ✅ فقط الحلقات التي فيها معلم
                  ->when($userCenterId, function ($q2) use ($userCenterId) {
                      $q2->whereHas('circle', function ($q3) use ($userCenterId) {
                          $q3->where('center_id', $userCenterId);
                      });
                  })
                  ->with([
                      'circle:id,name,center_id,mosque_id,teacher_id',
                      'circle.center:id,name',
                      'circle.mosque:id,name,center_id',
                      'teacher:id,name',
                  ])
                  ->orderBy('schedule_date')
                  ->orderBy('start_time');
                  // ✅ حذفنا ->take(3) هنا كمان
            },
        ])
        ->withCount(['details as details_count'])
        ->findOrFail($planId);

        $planData           = $plan->toArray();
        $availableSchedules = $plan->planCircleSchedules ?? collect();

        $scheduleItems = $availableSchedules->map(function ($schedule) use ($plan) {
            $item          = $this->formatScheduleItem($schedule, $plan);
            $item['group'] = ($schedule->circle->mosque->name ?? 'بدون مسجد')
                           . ' - '
                           . ($schedule->day_of_week ?? 'غير محدد');
            return $item;
        })->values()->toArray();

        $planData['available_schedules_count'] = count($scheduleItems);
        $planData['schedule_summary']          = [[
            'schedule_items'  => $scheduleItems,
            'total_schedules' => count($scheduleItems),
        ]];

        return response()->json($planData);
    }

    public function bookSchedule(Request $request, $scheduleId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مسجل الدخول',
            ], 401);
        }

        $user = Auth::user();

        \Log::info('=== BOOK DEBUG START ===', [
            'user_id'     => $user->id,
            'request_all' => $request->all(),
            'schedule_id' => $scheduleId,
        ]);

        $request->validate([
            'plan_id'         => 'required|exists:plans,id',
            'plan_details_id' => 'required|exists:plan_details,id',
            'start_mode'      => ['nullable', Rule::in(['normal', 'reverse', 'from_day', 'reverse_from_day'])],
            'start_day'       => 'nullable|integer|min:1',
        ]);

        $schedule = PlanCircleSchedule::where('id', $scheduleId)
            ->where('is_available', true)
            ->where('booked_students', '<', 20)
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'الحصة غير متاحة للحجز',
            ], 400);
        }

        $existingBooking = CircleStudentBooking::where('plan_circle_schedule_id', $scheduleId)
            ->where('user_id', $user->id)
            ->exists();

        if ($existingBooking) {
            return response()->json([
                'success' => false,
                'message' => 'لديك حجز مسبق في هذه الحصة',
            ], 400);
        }

        DB::beginTransaction();

        try {
            $schedule->increment('booked_students');

            $startMode      = $request->input('start_mode', 'normal');
            $startDayNumber = $request->input('start_day');

            if (!in_array($startMode, ['from_day', 'reverse_from_day'])) {
                $startDayNumber = null;
            }

            $booking = CircleStudentBooking::create([
                'plan_id'                 => $request->plan_id,
                'plan_details_id'         => $request->plan_details_id,
                'plan_circle_schedule_id' => $scheduleId,
                'user_id'                 => $user->id,
                'status'                  => 'pending',
                'progress_status'         => 'not_started',
                'current_day'             => 0,
                'completed_days'          => 0,
                'total_days'              => 1,
                'booked_at'               => now(),
                'start_mode'              => $startMode,
                'start_day_number'        => $startDayNumber,
            ]);

            DB::commit();

            \Log::info('✅ BOOKING SUCCESS', [
                'booking_id'       => $booking->id,
                'start_mode'       => $booking->start_mode,
                'start_day_number' => $booking->start_day_number,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل طلب الحجز بنجاح! 🎉',
                'booking' => [
                    'id'               => $booking->id,
                    'schedule_id'      => $scheduleId,
                    'status'           => $booking->status,
                    'start_mode'       => $booking->start_mode,
                    'start_day_number' => $booking->start_day_number,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('❌ EXCEPTION:', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function cancelBooking(Request $request, $bookingId)
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role->id ?? 0, [2, 3])) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح',
            ], 403);
        }

        $booking = CircleStudentBooking::where('id', $bookingId)
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'الحجز غير موجود أو لا يمكن إلغاؤه',
            ], 404);
        }

        try {
            DB::beginTransaction();

            $schedule = $booking->planCircleSchedule;
            if ($schedule && $schedule->booked_students > 0) {
                $schedule->decrement('booked_students');
            }

            $booking->update(['status' => 'cancelled']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إلغاء الحجز بنجاح',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الإلغاء',
            ], 500);
        }
    }

    public function myBookings(Request $request)
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role->id ?? 0, [2, 3])) {
            return response()->json(['data' => []]);
        }

        $bookings = CircleStudentBooking::where('user_id', $user->id)
            ->with([
                'plan:id,plan_name,center_id',
                'plan.center:id,name',
                'planCircleSchedule:id,schedule_date,start_time,end_time,circle_id,is_available,booked_students,repeat_type,repeat_days',
                'planCircleSchedule.circle:id,name',
                'planDetail:id,day_number',
            ])
            ->orderBy('booked_at', 'desc')
            ->paginate(10);

        $bookingsData = $bookings->map(function ($booking) {
            $schedule = $booking->planCircleSchedule;

            return [
                'id'              => $booking->id,
                'status'          => $booking->status,
                'progress_status' => $booking->progress_status,
                'booked_at'       => $booking->booked_at?->format('Y-m-d H:i'),
                'plan'            => $booking->plan,
                'schedule'        => $schedule ? array_merge($schedule->toArray(), [
                    'repeat_days_ar'      => $this->buildRepeatDaysArray($schedule),
                    'schedule_days_label' => $this->buildScheduleDaysLabel($schedule),
                ]) : null,
                'day_number'      => $booking->planDetail?->day_number,
            ];
        });

        return response()->json([
            'data'         => $bookingsData,
            'current_page' => $bookings->currentPage(),
            'last_page'    => $bookings->lastPage(),
            'per_page'     => $bookings->perPage(),
            'total'        => $bookings->total(),
        ]);
    }

    public function availableCenters()
    {
        $centers = Center::whereHas('plans')
            ->withCount([
                'plans',
                'mosques'  => fn($q) => $q->where('is_active', true),
                'circles'  => fn($q) => $q->whereHas('teacher'),
            ])
            ->select('id', 'name', 'address')
            ->limit(15)
            ->get();

        return response()->json($centers);
    }

    public function studentStats()
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role->id ?? 0, [2, 3])) {
            return response()->json([
                'total_plans'      => 0,
                'total_sessions'   => 0,
                'attended_sessions' => 0,
                'total_circles'    => 0,
                'next_schedules'   => 0,
                'pending_bookings' => 0,
            ]);
        }

        $stats = CircleStudentBooking::where('user_id', $user->id)
            ->withCount(['sessions as total_sessions'])
            ->with(['plan.planCircleSchedules' => fn($q) => $q->where('is_available', true)->take(5)])
            ->get()
            ->reduce(function ($carry, $booking) {
                $carry['total_plans']++;
                $carry['total_sessions']   += $booking->total_sessions ?? 0;
                $carry['total_circles']    += $booking->plan->planCircleSchedules->count() ?? 0;
                $carry['pending_bookings'] += $booking->status === 'pending' ? 1 : 0;
                return $carry;
            }, [
                'total_plans'      => 0,
                'total_sessions'   => 0,
                'attended_sessions' => 0,
                'total_circles'    => 0,
                'next_schedules'   => 0,
                'pending_bookings' => 0,
            ]);

        return response()->json($stats);
    }
}
