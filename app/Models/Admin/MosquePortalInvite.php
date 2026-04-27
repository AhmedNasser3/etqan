<?php

namespace App\Models\Admin;

use App\Models\Auth\User;
use App\Models\Tenant\Center;
use App\Models\Tenant\Mosque;
use Illuminate\Database\Eloquent\Model;

class MosquePortalInvite extends Model
{
    protected $fillable = [
        'token',
        'mosque_id',
        'center_id',
        'created_by',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at'    => 'datetime',
    ];

    public function mosque()
    {
        return $this->belongsTo(Mosque::class);
    }

    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
