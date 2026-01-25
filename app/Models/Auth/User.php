<?php

namespace App\Models\Auth;

use App\Models\Tenant\Center;
use App\Models\Audit\AuditLog;
use App\Models\Tenant\Student;
use Illuminate\Database\Eloquent\Model;

class User extends Model
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

    public function center() { return $this->belongsTo(Center::class); }
    public function role() { return $this->belongsTo(Role::class); }
    public function student() { return $this->belongsTo(Student::class, 'student_id'); }
    public function auditLogs() { return $this->hasMany(AuditLog::class); }

    // Scopes
    public function scopeActive($query) { return $query->where('status', 'active'); }
    public function scopeByCenter($query, $centerId) { return $query->where('center_id', $centerId); }

    // ولي أمر للطالب
    public function isParentOf(Student $student) {
        return $this->student_id == $student->id;
    }
}