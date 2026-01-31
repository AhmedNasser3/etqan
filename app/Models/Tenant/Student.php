<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use App\Models\Auth\User;
use App\Models\Tenant\Center;

class Student extends Model
{
    protected $table = 'students';

    protected $fillable = [
        'center_id',
        'user_id',
        'guardian_id',
        'name',
        'phone',
        'id_number',
        'grade_level',
        'circle',
        'health_status',
        'reading_level',
        'session_time',
        'notes',
        'status'
    ];

    protected $casts = [
        'reading_level' => 'array',
        'status' => 'integer'
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

    /**
     * ✅ Scope للطلاب اللي status = 0 (pending)
     * أو اللي مش عندهم status محدد
     */
    public function scopePending($query)
    {
        return $query->where(function($q) {
            $q->where('status', 0)
              ->orWhereNull('status')
              ->orWhere('status', '0');
        });
    }

    /**
     * ✅ Scope للطلاب النشطين (status = 1)
     */
    public function scopeActive($query)
    {
        return $query->where(function($q) {
            $q->where('status', 1)
              ->orWhere('status', '1');
        });
    }

    /**
     * ✅ Scope يجيب الطلاب اللي user.status = 'pending'
     * (لو الـ status في جدول students مش موجود)
     */
    public function scopeUserPending($query)
    {
        return $query->whereHas('user', function($q) {
            $q->where('status', 'pending');
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

    /**
     * ✅ Scope يجمع كل الشروط للـ pending students
     */
    public function scopePendingComplete($query, $centerId = null)
    {
        $query->byCenter($centerId ?? 1)
              ->pending();

        // لو مفيش طلاب بالـ status، جيب اللي user.status = pending
        return $query->orWhereHas('user', function($q) use ($centerId) {
            $q->where('status', 'pending')
              ->when($centerId, function($q) use ($centerId) {
                  return $q->where('center_id', $centerId);
              });
        });
    }
}