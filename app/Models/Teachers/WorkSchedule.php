<?php
// app/Models/Teachers/WorkSchedule.php

namespace App\Models\Teachers;

use App\Models\Auth\Teacher;
use App\Models\Tenant\Center;
use Illuminate\Database\Eloquent\Model;

class WorkSchedule extends Model
{
    protected $fillable = [
        'center_id', 'teacher_id',
        'work_start_time', 'allowed_late_minutes',
        'label', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'allowed_late_minutes' => 'integer',
    ];

    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
