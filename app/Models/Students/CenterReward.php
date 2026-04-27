<?php
// app/Models/Student/CenterReward.php

namespace App\Models\Students;

use App\Models\Auth\User;
use App\Models\Students\StudentRewardPurchase;
use Illuminate\Database\Eloquent\Model;

class CenterReward extends Model
{
    protected $fillable = [
        'center_id', 'name', 'description', 'points_cost', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function purchases()
    {
        return $this->hasMany(StudentRewardPurchase::class, 'reward_id');
    }
}