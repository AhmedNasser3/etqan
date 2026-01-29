<?php
namespace App\Models\Tenant;

use App\Models\Auth\User;
use App\Models\Tenant\Center;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mosque extends Model
{
    protected $fillable = [
        'name',
        'center_id',
        'supervisor_id',
        'supervisor',
        'circles_count',
        'logo',
        'is_active',
        'notes'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'circles_count' => 'integer',
    ];

    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    public function supervisorUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}