<?php

namespace App\Models\Plans;


use App\Models\Plans\Plan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanDetail extends Model
{
    use HasFactory;

    protected $table = 'plan_details';

    protected $fillable = [
        'plan_id',
        'day_number',
        'new_memorization',
        'review_memorization',
        'status'
    ];

    protected $casts = [
        'day_number' => 'integer'
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    // Scope لليوم الحالي
    public function scopeCurrent($query)
    {
        return $query->where('status', 'current');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}