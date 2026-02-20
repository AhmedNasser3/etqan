<?php

namespace App\Models\Student;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class StudentAchievement extends Model
{
    use HasFactory;

    protected $table = 'student_achievements';

    protected $fillable = [
        'user_id',
        'center_id', // ✅ مضاف للتوافق مع Reports
        'points',
        'points_action',
        'achievements',
        'reason',
        'achievement_type'
    ];

    protected $casts = [
        'achievements' => 'array',
        'points' => 'integer',
        'center_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * ✅ Relationship مع الطالب
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * ✅ Scope للـ ReportsController - مصحح ومحسن للأداء
     */
    public function scopeForCenter(Builder $query, $centerId): Builder
    {
        // ✅ الأولوية: center_id مباشرة (أسرع)
        $query->where('center_id', $centerId);

        // ✅ fallback: عبر user.center_id
        return $query->orWhereHas('user', function($q) use ($centerId) {
            $q->where('center_id', $centerId);
        });
    }

    /**
     * ✅ Scope مباشر للأداء العالي
     */
    public function scopeByCenterId(Builder $query, $centerId): Builder
    {
        return $query->where('center_id', $centerId);
    }

    /**
     * ✅ Scopes محسنة
     */
    public function scopeForStudent(Builder $query, $studentId): Builder
    {
        return $query->where('user_id', $studentId);
    }

    public function scopeAddedPoints(Builder $query): Builder
    {
        return $query->where('points_action', 'added');
    }

    public function scopeDeductedPoints(Builder $query): Builder
    {
        return $query->where('points_action', 'deducted');
    }

    public function scopePositivePoints(Builder $query): Builder
    {
        return $query->where('points', '>', 0);
    }

    public function scopeNegativePoints(Builder $query): Builder
    {
        return $query->where('points', '<', 0);
    }

    /**
     * ✅ Accessors محسنة
     */
    public function getTotalPointsAttribute(): int
    {
        return $this->points ?? 0;
    }

    public function getAchievementsListAttribute(): array
    {
        return collect($this->achievements ?? [])->toArray();
    }

    public function getPointsLabelAttribute(): string
    {
        $sign = $this->points > 0 ? '+' : '';
        return $sign . $this->points . ' نقطة';
    }

    public function getPointsColorAttribute(): string
    {
        return $this->points > 0 ? 'success' : 'danger';
    }

    /**
     * ✅ Preview للـ Reports Dashboard
     */
    public function getReportPreviewAttribute(): string
    {
        return $this->total_points . ' نقطة (' .
               ($this->points > 0 ? 'إضافة' : 'خصم') . ')';
    }

    /**
     * ✅ Helper Methods
     */
    public function isPositive(): bool
    {
        return $this->points > 0;
    }

    public function isNegative(): bool
    {
        return $this->points < 0;
    }

    /**
     * ✅ Static total points للطالب
     */
    public static function getStudentTotalPoints($userId): int
    {
        return self::forStudent($userId)->sum('points');
    }

    /**
     * ✅ API Resource transformation (محسن للـ Reports)
     */
    public function toApiArray(): array
    {
        return [
            'id' => (int) $this->id,
            'user_id' => (int) $this->user_id,
            'center_id' => (int) ($this->center_id ?? $this->user?->center_id),
            'student_name' => $this->user?->name ?? 'غير معروف',
            'points' => (int) $this->points,
            'total_points' => $this->total_points,
            'points_label' => $this->points_label,
            'points_color' => $this->points_color,
            'report_preview' => $this->report_preview,
            'points_action' => $this->points_action,
            'achievements' => $this->achievements_list,
            'reason' => $this->reason,
            'achievement_type' => $this->achievement_type,
            'created_at' => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}