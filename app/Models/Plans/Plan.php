<?php

namespace App\Models\Plans;

use App\Models\Tenant\Center;
use App\Models\Tenant\Circle;
use App\Models\Plans\PlanDetail;
use Illuminate\Database\Eloquent\Model;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Plans\CircleStudentBooking;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Plan extends Model
{
    use HasFactory;

    protected $table = 'plans';
    protected $fillable = [
        'center_id',
        'plan_name',
        'total_months'
    ];

    protected $casts = [
        'total_months' => 'integer'
    ];

    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(PlanDetail::class);
    }

    public function planCircleSchedules(): HasMany
    {
        return $this->hasMany(PlanCircleSchedule::class, 'plan_id');
    }

    public function circleStudentBookings(): HasMany
    {
        return $this->hasMany(CircleStudentBooking::class, 'plan_id');
    }

    public function circles(): BelongsToMany
    {
        return $this->belongsToMany(Circle::class, 'plan_circle_schedules', 'plan_id', 'circle_id')
                    ->withPivot([
                        'schedule_date',
                        'start_time',
                        'end_time',
                        'duration_minutes',
                        'day_of_week',
                        'booked_students',
                        'max_students',
                        'is_available'
                    ])
                    ->withTimestamps();
    }

    public function bookings()
    {
        return $this->hasManyThrough(
            CircleStudentBooking::class,
            PlanCircleSchedule::class,
            'plan_id',
            'plan_circle_schedule_id',
            'id',
            'id'
        );
    }

    public function scopeWithAvailableSchedules($query, $centerId = null)
    {
        return $query->with(['planCircleSchedules' => function($q) use ($centerId) {
            $q->where('is_available', true)
              ->where('booked_students', '<', 10)
              ->when($centerId, function($q2) use ($centerId) {
                  $q2->whereHas('circle.center', function($q3) use ($centerId) {
                      $q3->where('id', $centerId);
                  });
              })
              ->with([
                  'circle:id,name,center_id,mosque_id',
                  'circle.center:id,name',
                  'circle.mosque:id,name',
                  'teacher:id,name'
              ])
              ->orderBy('schedule_date')
              ->limit(5);
        }]);
    }

    public function currentDay()
    {
        return $this->details()->where('status', 'current')->first();
    }

    public function completionPercentage()
    {
        $total = $this->details()->count();
        $completed = $this->details()->where('status', 'completed')->count();
        return $total > 0 ? round(($completed / $total) * 100, 2) : 0;
    }

    public function getDetailsCountAttribute()
    {
        return $this->details()->count();
    }

    public function getScheduleSummaryAttribute()
    {
        if (!$this->relationLoaded('planCircleSchedules')) {
            return collect();
        }

        return $this->planCircleSchedules->groupBy(function($schedule) {
            $mosqueName = $schedule->circle->mosque?->name ?? 'بدون مسجد';
            $dayName = $schedule->day_of_week;
            return "$mosqueName - $dayName";
        })->map(function($schedules, $key) {
            $firstSchedule = $schedules->first();
            return [
                'group' => $key,
                'circle_name' => $firstSchedule->circle->name,
                'mosque_name' => $firstSchedule->circle->mosque?->name ?? 'بدون مسجد',
                'teacher_name' => $firstSchedule->teacher?->name ?? 'غير محدد',
                'time_range' => $firstSchedule->start_time . ' - ' . $firstSchedule->end_time,
                'total_schedules' => $schedules->count(),
                'sample_date' => $firstSchedule->schedule_date?->format('Y-m-d') ?? 'غير محدد'
            ];
        })->values()->take(3);
    }
}
