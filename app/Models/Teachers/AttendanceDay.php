<?php

namespace App\Models\Teachers;

use App\Models\Auth\Teacher;
use App\Models\Tenant\Circle;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class AttendanceDay extends Model
{
    use HasFactory;

    protected $table = 'attendance_days';

    /**
     * ✅ Fillable fields كاملة مع الحقول المفقودة
     */
    protected $fillable = [
        'teacher_id',
        'circle_id',
        'date',
        'status',           // present, late, absent
        'delay_minutes',
        'notes',
        'is_auto_created',  // ✅ الحقل المفقود المهم!
    ];

    /**
     * ✅ Casts محسنة مع Boolean support
     */
    protected $casts = [
        'date' => 'date:Y-m-d',
        'delay_minutes' => 'integer',
        'is_auto_created' => 'boolean',  // ✅ مهم جداً
        'status' => 'string',
    ];

    /**
     * ✅ العلاقات مع Type Hinting
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function circle(): BelongsTo
    {
        return $this->belongsTo(Circle::class);
    }

    /**
     * ✅ User relationship عبر Teacher (للـ role)
     */
    public function user(): BelongsTo
    {
        return $this->belongsToThrough(
            \App\Models\Auth\User::class,  // افتراضي
            Teacher::class
        );
    }

    /**
     * ✅ Query Scopes محسنة
     */
    public function scopePresent(Builder $query): Builder
    {
        return $query->where('status', 'present');
    }

    public function scopeLate(Builder $query): Builder
    {
        return $query->where('status', 'late');
    }

    public function scopeAbsent(Builder $query): Builder
    {
        return $query->where('status', 'absent');
    }

    public function scopeForDate(Builder $query, $date): Builder
    {
        return $query->whereDate('date', $date);
    }

    public function scopeForCircle(Builder $query, $circleId): Builder
    {
        return $query->where('circle_id', $circleId);
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('date', today());
    }

    public function scopeThisMonth(Builder $query): Builder
    {
        return $query->whereMonth('date', now()->month)
                    ->whereYear('date', now()->year);
    }

    /**
     * ✅ Status Scopes متقدمة
     */
    public function scopeByStatus(Builder $query, array $statuses): Builder
    {
        return $query->whereIn('status', $statuses);
    }

    /**
     * ✅ Accessors للـ Frontend
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'present' => 'حاضر',
            'late' => 'متأخر',
            'absent' => 'غائب',
            default => 'غير محدد'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'present' => 'success',
            'late' => 'warning',
            'absent' => 'danger',
            default => 'secondary'
        };
    }

    public function getDelayTextAttribute(): string
    {
        if (!$this->delay_minutes || $this->delay_minutes <= 0) {
            return '-';
        }

        return $this->delay_minutes . ' دقيقة';
    }

    public function getDelayClassAttribute(): string
    {
        if (!$this->delay_minutes || $this->delay_minutes <= 0) {
            return 'text-gray-500';
        }

        return $this->delay_minutes > 30 ? 'text-red-600 font-bold' : 'text-orange-600';
    }

    public function getIsAutoCreatedLabelAttribute(): string
    {
        return $this->is_auto_created ? 'أوتوماتيك' : 'يدوي';
    }

    /**
     * ✅ Helper Methods
     */
    public function isPresent(): bool
    {
        return $this->status === 'present';
    }

    public function isLate(): bool
    {
        return $this->status === 'late';
    }

    public function isAbsent(): bool
    {
        return $this->status === 'absent';
    }

    public function isAutoCreated(): bool
    {
        return $this->is_auto_created === true;
    }

    /**
     * ✅ Static Helper للتحقق من وجود سجل
     */
    public static function existsForTeacherCircleDate(int $teacherId, ?int $circleId, string $date): bool
    {
        $query = self::where('teacher_id', $teacherId)
                    ->whereDate('date', $date);

        if ($circleId) {
            $query->where('circle_id', $circleId);
        }

        return $query->exists();
    }

    /**
     * ✅ Bulk create لليوم الحالي
     */
    public static function createForToday(int $teacherId, int $circleId, array $data): self
    {
        return self::create([
            'teacher_id' => $teacherId,
            'circle_id' => $circleId,
            'date' => today(),
            'status' => $data['status'] ?? 'absent',
            'delay_minutes' => $data['delay_minutes'] ?? 0,
            'notes' => $data['notes'] ?? null,
            'is_auto_created' => true,
        ]);
    }

    /**
     * ✅ API Resource transformation
     */
    public function toApiArray(): array
    {
        return [
            'id' => (int) $this->id,
            'teacher_id' => (int) $this->teacher_id,
            'teacher_name' => $this->teacher?->name ?? 'غير معروف',
            'role' => optional($this->teacher?->user)->role ?? 'معلم',
            'circle_name' => optional($this->circle)->name ?? '-',
            'status' => $this->status ?? 'absent',
            'status_label' => $this->status_label,
            'status_color' => $this->status_color,
            'notes' => $this->notes ?? 'غياب أوتوماتيك',
            'date' => $this->date?->format('Y-m-d'),
            'is_auto_created' => (bool) $this->is_auto_created,
            'is_auto_created_label' => $this->is_auto_created_label,
            'delay_minutes' => (int) ($this->delay_minutes ?? 0),
            'delay_text' => $this->delay_text,
            'delay_class' => $this->delay_class,
        ];
    }
}