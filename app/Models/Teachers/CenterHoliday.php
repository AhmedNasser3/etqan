<?php
// app/Models/Teachers/CenterHoliday.php

namespace App\Models\Teachers;

use App\Models\Auth\Teacher;
use App\Models\Tenant\Center;
use Illuminate\Database\Eloquent\Model;

class CenterHoliday extends Model
{
    protected $fillable = [
        'center_id', 'teacher_id',
        'holiday_date', 'reason', 'type',
    ];

    protected $casts = [
        'holiday_date' => 'date',
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
