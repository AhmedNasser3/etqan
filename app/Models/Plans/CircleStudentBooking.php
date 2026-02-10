<?php
// app/Models/Plans/CircleStudentBooking.php
namespace App\Models\Plans;

use App\Models\Auth\User;
use App\Models\Plans\Plan;
use App\Models\Plans\PlanDetail;
use App\Models\Tenant\Student;
use Illuminate\Database\Eloquent\Model;
use App\Models\Plans\PlanCircleSchedule;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CircleStudentBooking extends Model
{
    use HasFactory;

    protected $table = 'circle_student_bookings';  // ✅ أضف الـ table name

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
        'booked_at',  // ✅ أضف booked_at
        'center_id'   // ✅ أضف center_id
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'booked_at' => 'datetime',
    ];

    // ✅ الـ RELATIONSHIPS المُصححة 👇
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

    public function user(): BelongsTo  // ✅ أضف user() relationship المهم!
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // ✅ Scopes
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
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

    // ✅ Scope للـ pending bookings
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
