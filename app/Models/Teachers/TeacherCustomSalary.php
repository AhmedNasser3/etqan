<?php
// app/Models/Teachers/TeacherCustomSalary.php

namespace App\Models\Teachers;

use App\Models\Auth\Teacher;
use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherCustomSalary extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'user_id',
        'custom_base_salary',
        'working_days',
        'daily_daily_rate',
        'notes',
        'is_active',
        'valid_from',
        'valid_until',
    ];

    protected $casts = [
        'custom_base_salary' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'is_active' => 'boolean',
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];

    //  العلاقات
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    //  Scope للـ active salaries
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    //  الراتب الحالي (valid الآن)
    public function scopeCurrent($query)
    {
        return $query->where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('valid_until')
                          ->orWhere('valid_until', '>=', now());
                    });
    }
}