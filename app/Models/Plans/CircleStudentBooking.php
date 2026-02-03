<?php

namespace App\Models\Plans;


use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Model;
use App\Models\Plans\PlanCircleSchedule;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class CircleStudentBooking extends Model
{
    protected $fillable = [
        'plan_circle_schedule_id',
        'student_id',
        'status',
        'progress_status',
        'current_day',
        'completed_days',
        'total_days',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'booked_at' => 'datetime',
    ];

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(PlanCircleSchedule::class, 'plan_circle_schedule_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}