<?php

namespace App\Models\Plans;

use App\Models\Auth\User;
use App\Models\Plans\Plan;
use App\Models\Tenant\Circle;
use Illuminate\Database\Eloquent\Model;
use App\Models\Plans\CircleStudentBooking;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PlanCircleSchedule extends Model
{
    use HasFactory;

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
    ];

    protected $casts = [
        'schedule_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_available' => 'boolean',
        'max_students' => 'integer',
    ];

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

    public function bookings(): HasMany
    {
        return $this->hasMany(CircleStudentBooking::class);
    }

    public function hasAvailability(): bool
    {
        if (!$this->is_available) {
            return false;
        }

        // ✅ لو max_students = null يعني مفتوح للكل
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
}
