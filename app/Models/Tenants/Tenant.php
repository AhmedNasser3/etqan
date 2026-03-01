<?php
// app/Models/Tenants/Tenant.php

namespace App\Models\Tenants;

use App\Models\Auth\User;
use App\Models\Tenant\Center;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tenant extends Model
{
    use HasFactory;

    protected $table = 'tenants';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'user_id',
        'center_id',
    ];

    /**
     * Get the user that owns the tenant.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the center that owns the tenant.
     */
    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }
}