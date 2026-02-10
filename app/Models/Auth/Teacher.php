<?php

namespace App\Models\Auth;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Model;
use App\Models\Plans\PlanCircleSchedule;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'session_time',
        'notes'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function schedule()
{
    return $this->belongsTo(PlanCircleSchedule::class, 'schedule_id');
}
}
