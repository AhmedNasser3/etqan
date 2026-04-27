<?php
// app/Models/Student/StudentRewardPurchase.php

namespace App\Models\Students;

use Illuminate\Database\Eloquent\Model;

class StudentRewardPurchase extends Model
{
    protected $fillable = [
        'user_id', 'reward_id', 'points_spent'
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\Auth\User::class, 'user_id');
    }

    public function reward()
    {
        return $this->belongsTo(CenterReward::class, 'reward_id');
    }
}