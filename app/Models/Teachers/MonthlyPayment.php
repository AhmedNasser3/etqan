<?php
namespace App\Models\Teachers;

use App\Models\Auth\Teacher;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MonthlyPayment extends Model
{
    use HasFactory;

    protected $table = 'monthly_payments';
    protected $fillable = [
        'teacher_id',
        'payment_year',
        'payment_month',
        'base_salary',
        'working_days',
        'deductions',
        'present_days',
        'net_salary',
        'status',
        'paid_date',
        'notes',
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'deductions' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'payment_year' => 'integer',
        'payment_month' => 'integer',
        'paid_date' => 'date',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function salary()
    {
        return $this->belongsTo(TeacherSalary::class, 'teacher_id', 'teacher_id');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function getMonthNameAttribute()
    {
        $months = [
            1 => 'يناير', 2 => 'فبراير', 3 => 'مارس', 4 => 'أبريل',
            5 => 'مايو', 6 => 'يونيو', 7 => 'يوليو', 8 => 'أغسطس',
            9 => 'سبتمبر', 10 => 'أكتوبر', 11 => 'نوفمبر', 12 => 'ديسمبر'
        ];
        return $months[$this->payment_month] ?? '';
    }
}
