<?php

namespace App\Models\Students;

use App\Models\Auth\User;
use App\Models\Plans\PlanCircleSchedule;
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

        // ✅ Auto-set default status to 'غائب' on create
        static::creating(function ($attendance) {
            if (is_null($attendance->status)) {
                $attendance->status = 'غائب';
            }
        });
    }

    /**
     * ✅ Relationships
     */

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(PlanCircleSchedule::class, 'plan_circle_schedule_id');
    }

    public function planDetail(): BelongsTo
    {
        return $this->belongsTo(StudentPlanDetail::class, 'student_plan_detail_id');
    }

    /**
     * ✅ Accessors & Mutators
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

    protected function isPresent(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'حاضر'
        );
    }

    /**
     * ✅ Scopes
     */

    public function scopePresent($query)
    {
        return $query->where('status', 'حاضر');
    }

    public function scopeAbsent($query)
    {
        return $query->where('status', 'غائب');
    }

    public function scopeForSchedule($query, $scheduleId)
    {
        return $query->where('plan_circle_schedule_id', $scheduleId);
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('user_id', $studentId);
    }

    public function scopeHighRated($query, $minRating = 4)
    {
        return $query->where('rating', '>=', $minRating);
    }

    /**
     * ✅ Helper Methods
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

    public function addNote($note): static
    {
        $this->update(['note' => $note]);
        return $this;
    }

    /**
     * ✅ Query Helpers
     */

    public static function createForSchedule($scheduleId, $studentId, $data = [])
    {
        return static::create(array_merge([
            'user_id' => $studentId,
            'plan_circle_schedule_id' => $scheduleId,
            'status' => 'غائب'
        ], $data));
    }

    public static function getAttendanceStats($scheduleId)
    {
        return static::where('plan_circle_schedule_id', $scheduleId)
            ->selectRaw('
                status,
                COUNT(*) as count,
                AVG(rating) as avg_rating
            ')
            ->groupBy('status');
    }

    /**
     * ✅ Status Badge Colors (for frontend)
     */

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'حاضر' => 'bg-green-100 text-green-800',
            'غائب' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    public function getStatusIconAttribute(): string
    {
        return match($this->status) {
            'حاضر' => '✅',
            'غائب' => '❌',
            default => '⭕'
        };
    }

    /**
     * ✅ Rating Stars Helper
     */

    public function getRatingStarsAttribute(): string
    {
        $stars = '';
        for ($i = 1; $i <= 5; $i++) {
            $stars .= $i <= $this->rating ? '⭐' : '☆';
        }
        return $stars;
    }

    /**
     * ✅ Formatted Date for Arabic
     */

    public function getFormattedDateAttribute(): string
    {
        return $this->created_at?->format('Y-m-d H:i');
    }
}