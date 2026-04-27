<?php
// app/Services/AttendanceScheduleService.php

namespace App\Services;

use App\Models\Auth\Teacher;
use App\Models\Teachers\AttendanceDay;
use App\Models\Teachers\CenterHoliday;
use App\Models\Teachers\WeeklyOffDay;
use App\Models\Teachers\WorkSchedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AttendanceScheduleService
{
    /**
     * جيب جدول العمل المناسب للمعلم:
     * أولاً: جدول خاص بيه، وإلا: جدول المجمع العام
     */
    public function getScheduleFor(int $centerId, int $teacherId): ?WorkSchedule
    {
        // جدول خاص بالمعلم أولاً
        $personal = WorkSchedule::where('center_id', $centerId)
            ->where('teacher_id', $teacherId)
            ->where('is_active', true)
            ->first();

        if ($personal) return $personal;

        // جدول المجمع العام (teacher_id = NULL)
        return WorkSchedule::where('center_id', $centerId)
            ->whereNull('teacher_id')
            ->where('is_active', true)
            ->first();
    }

    /**
     * هل هذا اليوم إجازة للمعلم أو للمجمع كله؟
     */
    public function isHoliday(int $centerId, int $teacherId, Carbon $date): bool
    {
        $dateStr = $date->format('Y-m-d');
        $dayOfWeek = (int) $date->dayOfWeek; // 0=أحد ... 6=سبت

        // تحقق من أيام الراحة الأسبوعية (خاصة أو عامة)
        $isWeeklyOff = WeeklyOffDay::where('center_id', $centerId)
            ->where('day_of_week', $dayOfWeek)
            ->where(function ($q) use ($teacherId) {
                $q->whereNull('teacher_id')
                  ->orWhere('teacher_id', $teacherId);
            })
            ->exists();

        if ($isWeeklyOff) return true;

        // تحقق من إجازات محددة بالتاريخ
        return CenterHoliday::where('center_id', $centerId)
            ->whereDate('holiday_date', $dateStr)
            ->where(function ($q) use ($teacherId) {
                $q->whereNull('teacher_id')
                  ->orWhere('teacher_id', $teacherId);
            })
            ->exists();
    }

    /**
     * احسب حالة الحضور بناءً على وقت التسجيل والجدول
     * يُرجع: ['status' => 'present'|'late', 'delay_minutes' => int]
     */
    public function calculateStatus(
        WorkSchedule $schedule,
        Carbon $checkinTime
    ): array {
        $workStart = Carbon::createFromTimeString(
            $checkinTime->format('Y-m-d') . ' ' . $schedule->work_start_time
        );

        $diffMinutes = (int) $checkinTime->diffInMinutes($workStart, false);
        // diffInMinutes سالب = جاء بعد الموعد (متأخر)
        // diffInMinutes موجب = جاء قبل الموعد (مبكر)

        $lateMinutes = max(0, -$diffMinutes); // الفرق الزمني للتأخير

        if ($lateMinutes === 0) {
            return ['status' => 'present', 'delay_minutes' => 0];
        }

        if ($lateMinutes <= $schedule->allowed_late_minutes) {
            // داخل الوقت المسموح = حاضر بدون تأخير رسمي
            return ['status' => 'present', 'delay_minutes' => 0];
        }

        // تجاوز وقت السماح = متأخر
        return ['status' => 'late', 'delay_minutes' => $lateMinutes];
    }

    /**
     * 🔥 وظيفة الغياب التلقائي:
     * تمشي على كل المعلمين في المجمع وتعمل غياب لمن لم يسجل
     * يُستدعى من Command يومي (Scheduler)
     */
    public function autoMarkAbsent(int $centerId, Carbon $date): int
    {
        if ($date->isToday()) {
            Log::info('⛔ autoMarkAbsent: لا يُطبق على اليوم الحالي');
            return 0;
        }

        $dateStr = $date->format('Y-m-d');
        $marked = 0;

        $teachers = Teacher::where('center_id', $centerId)->get();

        foreach ($teachers as $teacher) {
            // تجاهل إذا كان اليوم إجازة
            if ($this->isHoliday($centerId, $teacher->id, $date)) {
                continue;
            }

            // تحقق من وجود سجل حضور
            $exists = AttendanceDay::where('teacher_id', $teacher->id)
                ->where('center_id', $centerId)
                ->whereDate('date', $dateStr)
                ->exists();

            if (!$exists) {
                AttendanceDay::create([
                    'teacher_id' => $teacher->id,
                    'center_id'  => $centerId,
                    'date'       => $dateStr,
                    'status'     => 'absent',
                    'delay_minutes' => 0,
                    'notes'      => 'غياب تلقائي',
                ]);
                $marked++;
            }
        }

        Log::info("✅ autoMarkAbsent: {$marked} سجل غياب تم إنشاؤه", [
            'center_id' => $centerId,
            'date'      => $dateStr,
        ]);

        return $marked;
    }
}
