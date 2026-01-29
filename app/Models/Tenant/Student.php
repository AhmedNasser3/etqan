<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use App\Models\Auth\User;
use App\Models\Tenant\Center;

class Student extends Model
{
    protected $fillable = [
        'center_id',
        'user_id',
        'guardian_id',
        'id_number',
        'grade_level',
        'circle',
        'health_status',
        'reading_level',
        'session_time',
        'notes'
    ];

    protected $casts = [
        'reading_level' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guardian()
    {
        return $this->belongsTo(User::class, 'guardian_id');
    }

    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public function scopeByCenter($query, $centerId)
    {
        return $query->where('center_id', $centerId);
    }

    public function scopeActive($query)
    {
        return $query->whereHas('user', function ($q) {
            $q->where('status', 'active');
        });
    }

    public function scopeByCircle($query, $circle)
    {
        return $query->where('circle', $circle);
    }

    public function scopeByGradeLevel($query, $gradeLevel)
    {
        return $query->where('grade_level', $gradeLevel);
    }
}