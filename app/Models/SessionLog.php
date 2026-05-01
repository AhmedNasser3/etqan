<?php

namespace App\Models;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionLog extends Model
{
    protected $fillable = [
        'user_id',
        'schedule_id',
        'circle_name',
        'joined_at',
        'left_at',
        'duration_minutes',
        'session_date',
    ];

    protected $casts = [
        'joined_at'    => 'datetime',
        'left_at'      => 'datetime',
        'session_date' => 'date',
    ];

    // ── العلاقة بالمعلم ──
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
