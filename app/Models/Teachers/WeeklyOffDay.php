<?php
// app/Models/Teachers/WeeklyOffDay.php

namespace App\Models\Teachers;

use App\Models\Auth\Teacher;
use App\Models\Tenant\Center;
use Illuminate\Database\Eloquent\Model;

class WeeklyOffDay extends Model
{
    protected $fillable = [
        'center_id', 'teacher_id', 'day_of_week',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
    ];

    // أسماء الأيام بالعربي
    public static array $dayNames = [
        0 => 'الأحد',
        1 => 'الاثنين',
        2 => 'الثلاثاء',
        3 => 'الأربعاء',
        4 => 'الخميس',
        5 => 'الجمعة',
        6 => 'السبت',
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
