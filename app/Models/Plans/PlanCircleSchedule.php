<?php

namespace App\Models\Plans;

use App\Models\Auth\User;
use App\Models\Plans\Plan;
use App\Models\Tenant\Circle;
use App\Models\Plans\CircleStudentBooking;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class PlanCircleSchedule extends Model
{
    use HasFactory;

    protected $table = 'plan_circle_schedules';

    /**
     * ✅ الـ fillable محدث بالحقول الجديدة
     */
    protected $fillable = [
        'plan_id',
        'circle_id',
        'teacher_id',
        'schedule_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'day_of_week',
        'max_students',
        'booked_students',
        'is_available',
        'notes',
        'jitsi_room_name',

        // ✅ الحقول الجديدة من الـ Migration
        'repeat_type',
        'repeat_days',
        'plan_end_date',
    ];

    /**
     * ✅ الـ casts محدث للحقول الجديدة
     */
    protected $casts = [
        'schedule_date' => 'date',
        'plan_end_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_available' => 'boolean',
        'max_students' => 'integer',
        'booked_students' => 'integer',
        'duration_minutes' => 'integer',

        // ✅ الحقول الجديدة
        'repeat_type' => 'string',  // enum كـ string
        'repeat_days' => 'array',   // JSON → array تلقائياً
    ];

    protected $appends = ['jitsi_url', 'repeat_days_formatted'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($schedule) {
            if (empty($schedule->jitsi_room_name)) {
                $schedule->jitsi_room_name = static::generateUniqueJitsiRoom();
            }
        });

        static::updating(function ($schedule) {
            if (empty($schedule->jitsi_room_name)) {
                $schedule->jitsi_room_name = static::generateUniqueJitsiRoom();
            }
        });
    }

    // إنشاء Jitsi room name فريد
    public static function generateUniqueJitsiRoom(): string
    {
        do {
            $roomName = Str::random(8);
        } while (static::where('jitsi_room_name', $roomName)->exists());

        return $roomName;
    }

    // Accessor للـ Jitsi URL
    public function getJitsiUrlAttribute(): string
    {
        return $this->jitsi_room_name
            ? "https://meet.jit.si/{$this->jitsi_room_name}"
            : 'https://meet.jit.si/halaqa-teacher-default';
    }

    // ✅ Accessor جديد لعرض الأيام بشكل جميل
/**
 * ✅ Accessor آمن لعرض الأيام بشكل جميل
 */
public function getRepeatDaysFormattedAttribute(): string
{
    // 1. إذا null أو فارغ
    if (empty($this->repeat_days)) {
        return match($this->repeat_type) {
            'daily' => 'يومي',
            default => 'غير محدد'
        };
    }

    // 2. إذا مش array، اعرض رسالة خطأ
    if (!is_array($this->repeat_days)) {
        \Log::warning('repeat_days is not array', ['value' => $this->repeat_days, 'schedule_id' => $this->id]);
        return 'خطأ في البيانات';
    }

    // 3. array_map آمن
    $days_ar = [
        'sunday' => 'الأحد', 'monday' => 'الإثنين', 'tuesday' => 'الثلاثاء',
        'wednesday' => 'الأربعاء', 'thursday' => 'الخميس',
        'friday' => 'الجمعة', 'saturday' => 'السبت'
    ];

    $formatted = array_map(fn($day) => $days_ar[$day] ?? (string)$day, $this->repeat_days);
    return implode(' / ', $formatted);
}
    // الـ Relations (كما هي)
    public function plan(): BelongsTo { return $this->belongsTo(Plan::class); }
    public function circle(): BelongsTo { return $this->belongsTo(Circle::class); }
    public function teacher(): BelongsTo { return $this->belongsTo(User::class, 'teacher_id'); }
    public function bookings(): HasMany { return $this->hasMany(CircleStudentBooking::class, 'plan_circle_schedule_id'); }

    // Scopes (كما هي)
    public function hasAvailability(): bool
    {
        if (!$this->is_available) return false;
        if ($this->max_students === null) return true;
        return $this->booked_students < $this->max_students;
    }

    public function getAvailabilityPercentage(): int
    {
        if ($this->max_students === null) return 100;
        return $this->max_students > 0
            ? round((1 - ($this->booked_students / $this->max_students)) * 100)
            : 0;
    }
}