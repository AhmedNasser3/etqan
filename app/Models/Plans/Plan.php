<?php

namespace App\Models\Plans;

use App\Models\Tenant\Center;
use App\Models\Plans\PlanDetail;
use Illuminate\Database\Eloquent\Model;
use App\Models\Plans\PlanCircleSchedule;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Plans\CircleStudentBooking; // ✅ اختياري

class Plan extends Model
{
    use HasFactory;

    protected $table = 'plans';
    protected $fillable = [
        'center_id',
        'plan_name',
        'total_months'
    ];

    protected $casts = [
        'total_months' => 'integer'
    ];

    // ✅ العلاقات الموجودة
    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public function details()
    {
        return $this->hasMany(PlanDetail::class);
    }

    // ✅ العلاقة الجديدة المطلوبة 👈
    public function circleSchedules()
    {
        return $this->hasMany(PlanCircleSchedule::class);
    }

    // ✅ علاقة إضافية (اختيارية - مفيدة جداً)
    public function bookings()
    {
        return $this->hasManyThrough(
            CircleStudentBooking::class,
            PlanCircleSchedule::class
        );
    }

    // ✅ Methods الموجودة
    public function currentDay()
    {
        return $this->details()->where('status', 'current')->first();
    }

    public function completionPercentage()
    {
        $total = $this->details()->count();
        $completed = $this->details()->where('status', 'completed')->count();
        return $total > 0 ? round(($completed / $total) * 100, 2) : 0;
    }
}