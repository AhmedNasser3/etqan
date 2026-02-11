<?php

namespace App\Models\Teachers;

use App\Models\Auth\User;
use App\Models\Auth\Teacher;
use App\Models\Teachers\TeacherSalary;
use Illuminate\Database\Eloquent\Model;

class TeacherPayroll extends Model
{
    protected $table = 'teacher_payrolls';

    protected $fillable = [
        'teacher_id', 'user_id', 'salary_config_id', 'month_year',
        'base_salary', 'attendance_days', 'deductions', 'total_due',
        'status', 'period_start', 'period_end', 'paid_at', 'notes'
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'deductions' => 'decimal:2',
        'total_due' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date',
        'paid_at' => 'datetime'
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function salaryConfig()
    {
        return $this->belongsTo(TeacherSalary::class, 'salary_config_id');
    }
}