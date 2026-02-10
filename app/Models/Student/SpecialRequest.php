<?php

namespace App\Models\Student;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpecialRequest extends Model
{
    use HasFactory;

    protected $table = 'special_requests';

    protected $fillable = [
        'whatsapp_number',
        'name',
        'age',
        'available_schedule',
        'memorized_parts',
        'parts_to_memorize',
        'daily_memorization'
    ];

    protected $casts = [
        'available_schedule' => 'array',
        'memorized_parts' => 'array',
        'parts_to_memorize' => 'array',
    ];

    protected $hidden = [
        'created_at', 'updated_at'
    ];
}