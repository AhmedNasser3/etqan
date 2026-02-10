<?php

namespace App\Models\Student;

use App\Models\Auth\User;
use App\Models\Plans\Plan;
use App\Models\Auth\Teacher;
use App\Models\Tenant\Circle;
use Illuminate\Database\Eloquent\Model;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Plans\CircleStudentBooking;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentPlanDetail extends Model
{
    use HasFactory;

    protected $table = 'student_plan_details';

    protected $fillable = [
        'circle_student_booking_id',
        'plan_id',
        'teacher_id',
        'circle_id',
        'plan_circle_schedule_id',
        'session_time',
        'day_number',
        'new_memorization',
        'review_memorization',
        'status',
    ];

    protected $casts = [
        'session_time' => 'datetime:H:i',
        'day_number' => 'integer',
    ];

    public function circleStudentBooking(): BelongsTo
    {
        return $this->belongsTo(CircleStudentBooking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function circle(): BelongsTo
    {
        return $this->belongsTo(Circle::class);
    }

    public function planCircleSchedule(): BelongsTo
    {
        return $this->belongsTo(PlanCircleSchedule::class, 'plan_circle_schedule_id');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'مكتمل');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'قيد الانتظار');
    }

    public function scopeRetry($query)
    {
        return $this->where('status', 'إعادة');
    }

    public function scopeByDay($query, $dayNumber)
    {
        return $query->where('day_number', $dayNumber);
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'مكتمل' => 'green',
            'قيد الانتظار' => 'yellow',
            'إعادة' => 'red',
            default => 'gray'
        };
    }

    public function setStatusAttribute($value)
    {
        $this->attributes['status'] = in_array($value, ['مكتمل', 'قيد الانتظار', 'إعادة'])
            ? $value
            : 'قيد الانتظار';
    }
}
