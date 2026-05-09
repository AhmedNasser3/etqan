<?php

namespace App\Services;

use App\Models\Teachers\WorkSchedule;
use App\Models\Teachers\CenterHoliday;
use App\Models\Teachers\WeeklyOffDay;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class AttendanceScheduleService
{
    /**
     * جلب جدول العمل المناسب للمعلم (الخاص أو العام للمجمع)
     * الأولوية: جدول المعلم → جدول المجمع → null
     */
    public function getScheduleFor(int $centerId, int $teacherId): ?WorkSchedule
    {
        $cacheKey = "schedule:{$centerId}:{$teacherId}";

        return Cache::remember($cacheKey, 300, function () use ($centerId, $teacherId) {
            // جدول خاص بالمعلم
            $personal = WorkSchedule::where('center_id', $centerId)
                ->where('teacher_id', $teacherId)
                ->where('is_active', true)
                ->first();

            if ($personal) return $personal;

            // جدول عام للمجمع (teacher_id = NULL)
            return WorkSchedule::where('center_id', $centerId)
                ->whereNull('teacher_id')
                ->where('is_active', true)
                ->first();
        });
    }

    /**
     * هل اليوم إجازة؟ (تحقق: إجازة أسبوعية → إجازة رسمية للمجمع → إجازة خاصة بالمعلم)
     */
    public function isHoliday(int $centerId, int $teacherId, Carbon $date): bool
    {
        $cacheKey = "holiday:{$centerId}:{$teacherId}:{$date->format('Y-m-d')}";

        return Cache::remember($cacheKey, 600, function () use ($centerId, $teacherId, $date) {
            $dayOfWeek = (int) $date->dayOfWeek; // 0=Sun…6=Sat

            // 1. إجازة أسبوعية — للمجمع أو للمعلم
            $isWeeklyOff = WeeklyOffDay::where('center_id', $centerId)
                ->where('day_of_week', $dayOfWeek)
                ->where(function ($q) use ($teacherId) {
                    $q->whereNull('teacher_id')
                      ->orWhere('teacher_id', $teacherId);
                })
                ->exists();

            if ($isWeeklyOff) return true;

            // 2. إجازة رسمية/خاصة — للمجمع أو للمعلم
            return CenterHoliday::where('center_id', $centerId)
                ->whereDate('holiday_date', $date)
                ->where(function ($q) use ($teacherId) {
                    $q->whereNull('teacher_id')
                      ->orWhere('teacher_id', $teacherId);
                })
                ->exists();
        });
    }

    /**
     * احسب حالة الحضور بناءً على وقت تسجيل الدخول الفعلي
     *
     * @param  WorkSchedule  $schedule
     * @param  Carbon        $checkinTime  وقت التسجيل الفعلي
     * @return array{status: string, delay_minutes: int}
     */
    public function calculateStatus(WorkSchedule $schedule, Carbon $checkinTime): array
    {
        // بناء وقت بدء العمل في نفس اليوم
        [$startH, $startM] = explode(':', $schedule->work_start_time);
        $workStart = $checkinTime->copy()->setTime((int)$startH, (int)$startM, 0);

        $diffMinutes = (int) round($checkinTime->diffInMinutes($workStart, false) * -1);
        // diffInMinutes(false) → سالب إذا checkinTime > workStart

        if ($diffMinutes <= 0) {
            // حضر قبل أو في الوقت
            return ['status' => 'present', 'delay_minutes' => 0];
        }

        $allowed = (int) $schedule->allowed_late_minutes;

        if ($diffMinutes <= $allowed) {
            // ضمن هامش السماح → حضور عادي
            return ['status' => 'present', 'delay_minutes' => 0];
        }

        // تأخير فعلي
        return ['status' => 'late', 'delay_minutes' => $diffMinutes];
    }

    /**
     * تنسيق وقت من DB إلى 12h عربي (مساءً / صباحاً)
     * مثال: "13:30:00" → "1:30 مساءً"
     */
    public static function format12h(string $time24): string
    {
        if (!$time24) return '';

        [$h, $m] = explode(':', $time24);
        $h = (int) $h;
        $suffix = $h >= 12 ? 'مساءً' : 'صباحاً';
        $h12 = $h % 12 === 0 ? 12 : $h % 12;
        return "{$h12}:" . str_pad($m, 2, '0', STR_PAD_LEFT) . " {$suffix}";
    }

    /**
     * مسح cache الجدول لمعلم معين (استخدم بعد أي تعديل)
     */
    public function clearScheduleCache(int $centerId, int $teacherId): void
    {
        Cache::forget("schedule:{$centerId}:{$teacherId}");
    }

    /**
     * مسح cache الإجازات ليوم معين
     */
    public function clearHolidayCache(int $centerId, int $teacherId, Carbon $date): void
    {
        Cache::forget("holiday:{$centerId}:{$teacherId}:{$date->format('Y-m-d')}");
    }
}