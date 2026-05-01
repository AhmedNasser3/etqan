<?php

namespace App\Models\Auth;

use App\Models\Admin;
use App\Models\Audit\AuditLog;
use App\Models\Auth\Role;
use App\Models\Auth\Teacher;
use App\Models\Tenant\Center;
use App\Models\Tenant\Student;
use App\Models\Tenants\Tenant;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'name', 'email', 'password', 'center_id', 'tenant_id', 'role_id', 'student_id',
        'status', 'phone', 'avatar', 'birth_date', 'gender'
    ];

    protected $hidden = ['password', 'remember_token', 'otp_code'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_expires' => 'datetime',
        'locked_until' => 'datetime',
        'birth_date' => 'date'
    ];

    // =====================
    // Accessor المسؤول عن كل حاجة
    // =====================
    public function getCenterIdAttribute($value): ?int
    {
        if ($this->relationLoaded('admin')) {
            return $this->admin?->center_id ?? $value;
        }

        return Admin::where('user_id', $this->id)->value('center_id') ?? $value;
    }

    // =====================
    // العلاقات
    // =====================
    public function admin(): HasOne
    {
        return $this->hasOne(Admin::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function guardianOf()
    {
        return $this->hasMany(Student::class, 'guardian_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'user_id');
    }

    // =====================
    // Scopes
    // =====================
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByCenter($query, $centerId)
    {
        return $query->where('center_id', $centerId);
    }

    // =====================
    // Helpers
    // =====================
    public function isParentOf(Student $student)
    {
        return $this->student_id == $student->id;
    }
}
