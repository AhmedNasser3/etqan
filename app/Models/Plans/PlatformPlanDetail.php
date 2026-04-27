<?php

namespace App\Models\Plans;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlatformPlanDetail extends Model
{
    protected $fillable = [
        'platform_plan_id',
        'day_number',
        'new_memorization',
        'review_memorization',
        'verse_from',
        'verse_to',
        'notes',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(PlatformPlan::class, 'platform_plan_id');
    }
}
