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

class PlanCircleSchedule extends Model
{
    use HasFactory;

    protected $table = 'plan_circle_schedules';

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
    ];

    protected $casts = [
        'schedule_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_available' => 'boolean',
        'max_students' => 'integer',
    ];

    protected $appends = ['jitsi_url'];

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

    // ✅ إنشاء Jitsi room name فريد
    public static function generateUniqueJitsiRoom(): string
    {
        do {
            $roomName = Str::random(8);
        } while (static::where('jitsi_room_name', $roomName)->exists());

        return $roomName;
    }

    // ✅ Accessor للـ Jitsi URL
    public function getJitsiUrlAttribute(): string
    {
        return $this->jitsi_room_name
            ? "https://meet.jit.si/{$this->jitsi_room_name}"
            : 'https://meet.jit.si/halaqa-teacher-default';
    }

    // ✅ العلاقات الأساسية
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function circle(): BelongsTo
    {
        return $this->belongsTo(Circle::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    // ✅ العلاقة المهمة مع الحجوزات
    public function bookings(): HasMany
    {
        return $this->hasMany(CircleStudentBooking::class, 'plan_circle_schedule_id');
    }

    // ✅ علاقة مباشرة مع أول طالب محجوز
    public function firstStudentBooking()
    {
        return $this->hasOne(CircleStudentBooking::class, 'plan_circle_schedule_id');
    }

    // ✅ جلب الطالب الأول مع معلوماته
    public function firstStudent()
    {
        return $this->hasOneThrough(
            User::class,
            CircleStudentBooking::class,
            'plan_circle_schedule_id', // FK في CircleStudentBooking
            'id',                      // PK في User
            'id',                      // PK في PlanCircleSchedule
            'user_id'                  // FK في CircleStudentBooking → User
        );
    }

    // ✅ عدد الطلاب المحجوزين
    public function getBookedStudentsCountAttribute()
    {
        return $this->bookings()->count();
    }

    public function hasAvailability(): bool
    {
        if (!$this->is_available) {
            return false;
        }

        if ($this->max_students === null) {
            return true;
        }

        return $this->booked_students < $this->max_students;
    }

    public function getAvailabilityPercentage(): int
    {
        if ($this->max_students === null) {
            return 100;
        }

        return $this->max_students > 0
            ? round((1 - ($this->booked_students / $this->max_students)) * 100)
            : 0;
    }

    // ✅ Scope للمعلم الحالي
    public function scopeForTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    // ✅ Scope للحصص المتاحة
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }
}