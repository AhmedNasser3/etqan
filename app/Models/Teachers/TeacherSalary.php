<?php
// app/Models/Teachers/TeacherSalary.php

namespace App\Models\Teachers;

use App\Models\Auth\Teacher;
use App\Models\Tenant\Center;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherSalary extends Model
{
    use HasFactory;

    protected $table = 'teacher_salaries';

    protected $fillable = [
        'role',                     // ✅ enum جديد
        'center_id',
        'mosque_id',
        'base_salary',
        'working_days',
        'daily_rate',
        'notes',
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'center_id' => 'integer',
        'working_days' => 'integer',
    ];

    /**
     * علاقة مع المعلم (اختيارية)
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * علاقة مع المجمع
     */
    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    /**
     * حساب الراتب اليومي تلقائياً
     */
    public function getDailyRateAttribute($value): float
    {
        if ($value === null || $value == 0) {
            return $this->working_days > 0 ? $this->base_salary / $this->working_days : 0;
        }
        return (float) $value;
    }

    /**
     * Scope حسب الدور
     */
    public function scopeByRole($query, $role): static
    {
        return $query->where('role', $role);
    }

    /**
     * Scope حسب المركز
     */
    public function scopeByCenter($query, $centerId): static
    {
        return $query->where('center_id', $centerId);
    }

    /**
     * Scope حسب المسجد
     */
    public function scopeByMosque($query, $mosqueId): static
    {
        return $query->where('mosque_id', $mosqueId);
    }

    /**
     * Scope حسب الدور والمركز والمسجد
     */
    public function scopeByRoleCenterMosque($query, $role, $centerId, $mosqueId = null): static
    {
        return $query->where('role', $role)
                    ->where('center_id', $centerId)
                    ->when($mosqueId, fn($q) => $q->where('mosque_id', $mosqueId));
    }

    /**
     * Scope للمركز الحالي
     */
    public function scopeForCurrentCenter($query, $centerId): static
    {
        return $query->where('center_id', $centerId);
    }

    /**
     * جلب راتب دور معين في مركز معين
     */
    public static function getSalaryForRole($role, $centerId, $mosqueId = null)
    {
        return self::byRoleCenterMosque($role, $centerId, $mosqueId)->first();
    }
}
