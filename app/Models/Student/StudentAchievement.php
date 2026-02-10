<?php

namespace App\Models\Student;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentAchievement extends Model
{
    use HasFactory;

    protected $table = 'student_achievements';

    protected $fillable = [
        'user_id',
        'points',
        'points_action',
        'achievements',
        'reason',
        'achievement_type'
    ];

    protected $casts = [
        'achievements' => 'array',  // ✅ JSON → array تلقائي
        'points' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // ✅ Relationship مع الطالب
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ✅ Scopes
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('user_id', $studentId);
    }

    public function scopeAddedPoints($query)
    {
        return $query->where('points_action', 'added');
    }

    public function scopePositivePoints($query)
    {
        return $query->where('points', '>', 0);
    }

    // ✅ Accessors
    public function getTotalPointsAttribute()
    {
        return $this->points;
    }

    public function getAchievementsListAttribute()
    {
        return collect($this->achievements ?? [])->toArray();
    }

    // ✅ Total points للطالب
    public static function getStudentTotalPoints($userId)
    {
        return self::forStudent($userId)->sum('points');
    }
}
