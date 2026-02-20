<?php

namespace App\Models\Teachers;

use App\Models\Auth\User;
use App\Models\Auth\Teacher;
use App\Models\Teachers\TeacherSalary;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class TeacherPayroll extends Model
{
    use HasFactory;

    protected $table = 'teacher_payrolls';

    protected $fillable = [
        'teacher_id',
        'user_id',
        'salary_config_id',
        'month_year',
        'base_salary',
        'attendance_days',
        'deductions',
        'total_due',
        'status',
        'period_start',
        'period_end',
        'paid_at',
        'notes',
        'center_id' // ✅ مضاف للتوافق مع Reports
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'deductions' => 'decimal:2',
        'total_due' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date',
        'paid_at' => 'datetime',
        'center_id' => 'integer'
    ];

    /**
     * ✅ العلاقات مع Type Hinting
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function salaryConfig(): BelongsTo
    {
        return $this->belongsTo(TeacherSalary::class, 'salary_config_id');
    }

    /**
     * ✅ Scope للـ ReportsController - مصحح ومحسن للأداء
     */
    public function scopeForCenter(Builder $query, $centerId): Builder
    {
        // ✅ الأولوية: center_id مباشرة (لو موجود)
        $query->where('center_id', $centerId);

        // ✅ fallback: عبر teacher.user.center_id
        return $query->orWhereHas('teacher.user', function($q) use ($centerId) {
            $q->where('center_id', $centerId);
        });
    }

    /**
     * ✅ Scope مباشر للأداء العالي (للـ Reports)
     */
    public function scopeByCenterId(Builder $query, $centerId): Builder
    {
        return $query->where('center_id', $centerId);
    }

    /**
     * ✅ Scopes للحالة
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', 'paid');
    }

    public function scopeForMonth(Builder $query, $monthYear): Builder
    {
        return $query->where('month_year', $monthYear);
    }

    /**
     * ✅ Accessors مفيدة
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'paid' => 'مدفوع',
            'pending' => 'معلق',
            default => 'غير محدد'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'paid' => 'success',
            'pending' => 'warning',
            default => 'secondary'
        };
    }

    public function getNetSalaryAttribute(): string
    {
        return number_format($this->total_due ?? 0, 2) . ' جنيه';
    }

    /**
     * ✅ Preview للـ Reports Dashboard
     */
    public function getReportPreviewAttribute(): string
    {
        return $this->attendance_days . ' يوم × ' .
               number_format($this->total_due ?? 0, 0) . ' جنيه';
    }

    /**
     * ✅ Helper Methods
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * ✅ API Resource transformation (محسن للـ Reports)
     */
    public function toApiArray(): array
    {
        return [
            'id' => (int) $this->id,
            'teacher_id' => (int) $this->teacher_id,
            'teacher_name' => $this->teacher?->user?->name ?? 'غير معروف',
            'month_year' => $this->month_year,
            'center_id' => (int) ($this->center_id ?? $this->teacher?->user?->center_id),
            'base_salary' => (float) ($this->base_salary ?? 0),
            'attendance_days' => (int) ($this->attendance_days ?? 0),
            'deductions' => (float) ($this->deductions ?? 0),
            'total_due' => (float) ($this->total_due ?? 0),
            'net_salary' => $this->net_salary,
            'status' => $this->status ?? 'pending',
            'status_label' => $this->status_label,
            'status_color' => $this->status_color,
            'report_preview' => $this->report_preview,
            'period_start' => $this->period_start?->format('Y-m-d'),
            'period_end' => $this->period_end?->format('Y-m-d'),
            'paid_at' => $this->paid_at?->format('Y-m-d H:i'),
        ];
    }
}