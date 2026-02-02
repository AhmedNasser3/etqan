<?php

namespace App\Models\Tenant;

use App\Models\Auth\User;
use App\Models\Auth\Teacher;
use App\Models\Tenant\Center;
use App\Models\Tenant\Mosque;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Circle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'teacher_id',
        'center_id',
        'mosque_id'
    ];

    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public function mosque()
    {
        return $this->belongsTo(Mosque::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'circle_students', 'circle_id', 'student_id');
    }

    // ✅ Scope مبسّط - كل الحلقات للاختبار
    public function scopeForCurrentUser($query)
    {
        return $query; // شيلنا كل الشروط المُعقّدة
    }
}