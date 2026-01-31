<?php

namespace App\Models\Auth;

use App\Models\Auth\Role;
use App\Models\Auth\Teacher;
use App\Models\Tenant\Center;
use App\Models\Audit\AuditLog;
use App\Models\Tenant\Student;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'name', 'email', 'password', 'center_id', 'role_id', 'student_id',
        'status', 'phone', 'avatar', 'birth_date', 'gender'
    ];

    protected $hidden = ['password', 'remember_token', 'otp_code'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_expires' => 'datetime',
        'locked_until' => 'datetime',
        'birth_date' => 'date'
    ];

    // ✅ باقي العلاقات
    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // ✅ علاقة جديدة مع Teacher (One-to-One)
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

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByCenter($query, $centerId)
    {
        return $query->where('center_id', $centerId);
    }

    public function isParentOf(Student $student)
    {
        return $this->student_id == $student->id;
    }

    public function guardianOf()
    {
        return $this->hasMany(Student::class, 'guardian_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'user_id');
    }
}