<?php

namespace App\Models\Plans;
use App\Models\Tenant\Center;
use App\Models\Plans\PlanDetail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Plan extends Model
{
    use HasFactory;

    protected $table = 'plans';  // تأكد من الجدول

    protected $fillable = [
        'center_id',
        'plan_name',
        'total_months'
    ];

    protected $casts = [
        'total_months' => 'integer'
    ];

    /**
     * علاقة المجمع
     */
    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    /**
     * تفاصيل الخطة
     */
    public function details()
    {
        return $this->hasMany(PlanDetail::class);
    }

    /**
     * اليوم الحالي
     */
    public function currentDay()
    {
        return $this->details()->where('status', 'current')->first();
    }

    /**
     * نسبة الإنجاز
     */
    public function completionPercentage()
    {
        $total = $this->details()->count();
        $completed = $this->details()->where('status', 'completed')->count();

        return $total > 0 ? round(($completed / $total) * 100, 2) : 0;
    }
}