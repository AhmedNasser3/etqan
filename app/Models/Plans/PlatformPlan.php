<?php

namespace App\Models\Plans;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlatformPlan extends Model
{
    protected $fillable = [
        'title',
        'description',
        'duration_days',
        'is_active',
        'is_featured',
        'used_count',
        'created_by',
    ];

    protected $casts = [
        'is_active'   => 'boolean',
        'is_featured' => 'boolean',
    ];

    // ── Relations ──────────────────────────────────────────
    public function details(): HasMany
    {
        return $this->hasMany(PlatformPlanDetail::class)
                    ->orderBy('day_number');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Scopes ─────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}