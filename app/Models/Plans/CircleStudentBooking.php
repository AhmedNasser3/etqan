<?php
// app/Models/Plans/CircleStudentBooking.php -  مُصحح كامل

namespace App\Models\Plans;

use App\Models\Auth\User;
use App\Models\Plans\Plan;
use App\Models\Plans\PlanDetail;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Student\StudentPlanDetail;
use App\Models\Tenant\Student;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    /**
     *  العلاقات الأساسية - مُصححة للـ Guardian Controller
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'user_id');
    }

    /**
     *  علاقات الخطة والحصص - مهمة للـ Guardian
     */
    public function planDetail(): BelongsTo
    {
        return $this->belongsTo(PlanDetail::class, 'plan_details_id');
    }

    public function planCircleSchedule(): BelongsTo
    {
        return $this->belongsTo(PlanCircleSchedule::class, 'plan_circle_schedule_id');
    }

    /**
     *  تفاصيل خطة الطالب - الأهم للـ Guardian Dashboard
     */
    public function studentPlanDetails(): HasMany
    {
        return $this->hasMany(StudentPlanDetail::class, 'circle_student_booking_id');
    }

    /**
     *  Scopes مفيدة للـ Guardian
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'confirmed')
                     ->where('progress_status', '!=', 'completed');
    }

    public function scopeForStudent($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, $limit = 5)
    {
        return $query->latest('started_at')->limit($limit);
    }

    /**
     *  Accessors للـ Guardian Dashboard
     */
    public function getProgressRateAttribute()
    {
        return $this->total_days > 0
            ? round(($this->completed_days / $this->total_days) * 100, 1)
            : 0;
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'confirmed' => 'bg-green-100 text-green-800',
            'pending' => 'bg-yellow-100 text-yellow-800',
            'cancelled' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    public function getProgressColorAttribute()
    {
        return match(true) {
            $this->progress_status === 'completed' => 'bg-green-100 text-green-800',
            $this->progress_status === 'in_progress' => 'bg-blue-100 text-blue-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }
}