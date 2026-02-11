<?php
// app/Models/Plans/CircleStudentBooking.php
namespace App\Models\Plans;

use App\Models\Auth\User;
use App\Models\Plans\Plan;
use App\Models\Tenant\Student;
use App\Models\Plans\PlanDetail;
use Illuminate\Database\Eloquent\Model;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Student\StudentPlanDetail;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;  // ✅ أضف HasMany

class CircleStudentBooking extends Model
{
    use HasFactory;

    protected $table = 'circle_student_bookings';

    protected $fillable = [
        'plan_id',
        'plan_details_id',
        'plan_circle_schedule_id',
        'user_id',
        'status',
        'progress_status',
        'current_day',
        'completed_days',
        'total_days',
        'started_at',
        'completed_at',
        'booked_at',
        'center_id'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'booked_at' => 'datetime',
    ];

    // ✅ الـ RELATIONSHIPS الموجودة
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function planDetail(): BelongsTo
    {
        return $this->belongsTo(PlanDetail::class, 'plan_details_id');
    }

    public function planCircleSchedule(): BelongsTo
    {
        return $this->belongsTo(PlanCircleSchedule::class, 'plan_circle_schedule_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // 🔥 الـ RELATIONSHIP الجديدة المهمة 👇
    public function studentPlanDetails(): HasMany
    {
        return $this->hasMany(StudentPlanDetail::class, 'circle_student_booking_id');
    }

    // ✅ Scopes
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('progress_status', 'in_progress');
    }

    public function scopeMyCenter($query)
    {
        return $query->whereHas('plan', fn($q) =>
            $q->where('center_id', auth()->user()->center_id)
        );
    }
}
