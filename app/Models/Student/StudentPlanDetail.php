<?php

namespace App\Models\Student;

use App\Models\Auth\User;
use App\Models\Plans\Plan;
use App\Models\Auth\Teacher;
use App\Models\Tenant\Circle;
use Illuminate\Database\Eloquent\Model;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Plans\CircleStudentBooking;
use App\Models\Plans\PlanDetail; // ✅ إضافة PlanDetail
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

    // ✅ العلاقات الأساسية
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

    // ✅ علاقة مع PlanDetail الأصلي (للمقارنة)
    public function originalPlanDetail(): BelongsTo
    {
        return $this->belongsTo(PlanDetail::class, 'plan_id', 'plan_id')
            ->where('day_number', $this->day_number);
    }

    // ✅ Scopes محسنة
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
        return $query->where('status', 'إعادة');
    }

    public function scopeByDay($query, $dayNumber)
    {
        return $query->where('day_number', $dayNumber);
    }

    public function scopeByBooking($query, $bookingId)
    {
        return $query->where('circle_student_booking_id', $bookingId);
    }

    public function scopeByPlan($query, $planId)
    {
        return $query->where('plan_id', $planId);
    }

    // ✅ Accessors للألوان والحالة
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'مكتمل' => 'green',
            'قيد الانتظار' => 'yellow',
            'إعادة' => 'red',
            default => 'gray'
        };
    }

    public function getStatusBadgeAttribute(): string
    {
        return match($this->status) {
            'مكتمل' => 'success',
            'قيد الانتظار' => 'warning',
            'إعادة' => 'danger',
            default => 'secondary'
        };
    }

    public function getProgressPercentageAttribute(): int
    {
        $totalDays = $this->circleStudentBooking->planDetail->count() ?? 1;
        $completedDays = $this->completed()->count();
        return $totalDays > 0 ? round(($completedDays / $totalDays) * 100) : 0;
    }

    // ✅ Mutator لضمان صحة الحالة
    public function setStatusAttribute($value)
    {
        $validStatuses = ['مكتمل', 'قيد الانتظار', 'إعادة'];
        $this->attributes['status'] = in_array($value, $validStatuses) ? $value : 'قيد الانتظار';
    }

    // ✅ Helper methods للـ Frontend
    public function getFormattedSessionTimeAttribute(): string
    {
        return $this->session_time?->format('h:i A') ?? 'غير محدد';
    }

    public function getDayNameAttribute(): string
    {
        $days = [
            1 => 'الأحد', 2 => 'الإثنين', 3 => 'الثلاثاء', 4 => 'الأربعاء',
            5 => 'الخميس', 6 => 'الجمعة', 7 => 'السبت'
        ];
        return $days[$this->day_number % 7 + 1] ?? 'غير محدد';
    }

    // ✅ Check إذا كان اليوم مكتمل
    public function isCompleted(): bool
    {
        return $this->status === 'مكتمل';
    }

    // ✅ Check إذا كان اليوم قيد الانتظار
    public function isPending(): bool
    {
        return $this->status === 'قيد الانتظار';
    }

    // ✅ Check إذا كان اليوم يحتاج إعادة
    public function needsRetry(): bool
    {
        return $this->status === 'إعادة';
    }
}