<?php
// app/Models/Students/StudentAttendance.php -  مُصحح كامل

namespace App\Models\Students;

use App\Models\Auth\User;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Student\StudentPlanDetail;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAttendance extends Model
{
    use HasFactory;

    protected $table = 'student_attendance';

    protected $fillable = [
        'user_id',
        'plan_circle_schedule_id',
        'student_plan_detail_id',
        'status',
        'note',
        'rating'
    ];

    protected $casts = [
        'rating' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        //  Auto-set default status to 'غائب'
        static::creating(function ($attendance) {
            if (is_null($attendance->status)) {
                $attendance->status = 'غائب';
            }
        });
    }

    /**
     *  العلاقات - مُصححة للـ Guardian Controller 🔥
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function planCircleSchedule(): BelongsTo
    {
        return $this->belongsTo(PlanCircleSchedule::class, 'plan_circle_schedule_id');
    }

    public function studentPlanDetail(): BelongsTo
    {
        return $this->belongsTo(StudentPlanDetail::class, 'student_plan_detail_id');
    }

    /**
     *  Accessors و Mutators - مُحسّنة للـ Guardian
     */
    protected function status(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => in_array($value, ['حاضر', 'غائب']) ? $value : 'غائب'
        );
    }

    protected function rating(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => (int) $value,
            set: fn ($value) => max(0, min(5, (int) $value))
        );
    }

    /**
     *  Accessors للـ Guardian Dashboard
     */
    protected function isPresent(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'حاضر'
        );
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'حاضر' => 'bg-green-100 text-green-800 border-l-4 border-green-500',
            'غائب' => 'bg-red-100 text-red-800 border-l-4 border-red-500',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    public function getStatusIconAttribute(): string
    {
        return match($this->status) {
            'حاضر' => '',
            'غائب' => '❌',
            default => '⭕'
        };
    }

    public function getRatingStarsAttribute(): string
    {
        $stars = '';
        for ($i = 1; $i <= 5; $i++) {
            $stars .= $i <= $this->rating ? '⭐' : '☆';
        }
        return $stars;
    }

    public function getFormattedDateAttribute(): string
    {
        return $this->created_at?->format('Y-m-d H:i');
    }

    public function getArabicDateAttribute(): string
    {
        return $this->created_at?->locale('ar')->isoFormat('dddd، D MMMM YYYY، h:mm A');
    }

    /**
     *  Scopes مُحسّنة للـ Guardian
     */
    public function scopePresent($query)
    {
        return $query->where('status', 'حاضر');
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', 'غائب');
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('user_id', $studentId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days))
                     ->latest();
    }

    public function scopeHighRated($query, $minRating = 4)
    {
        return $query->where('rating', '>=', $minRating);
    }

    /**
     *  Helper Methods للـ Guardian
     */
    public function markPresent(): static
    {
        $this->update([
            'status' => 'حاضر',
            'updated_at' => now()
        ]);
        return $this;
    }

    public function markAbsent($note = null): static
    {
        $this->update([
            'status' => 'غائب',
            'note' => $note,
            'updated_at' => now()
        ]);
        return $this;
    }

    public function setRating($rating): static
    {
        $this->update(['rating' => $rating]);
        return $this;
    }

    /**
     *  إحصائيات سريعة
     */
    public static function getAttendanceStats($userId, $days = 30)
    {
        return static::forStudent($userId)
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('status, COUNT(*) as count, AVG(rating) as avg_rating')
            ->groupBy('status')
            ->get();
    }
}
