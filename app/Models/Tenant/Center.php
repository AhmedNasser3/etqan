<?php

namespace App\Models\Tenant;

use App\Models\Auth\User;
use App\Models\Audit\AuditLog;
use Illuminate\Database\Eloquent\Model;

class Center extends Model
{
    protected $table = 'centers';

    protected $fillable = ['name', 'subdomain', 'email', 'phone', 'address', 'logo', 'is_active', 'settings'];
    protected $casts = ['settings' => 'array', 'is_active' => 'boolean'];

    public function users() {
        return $this->hasMany(User::class);
    }

    public function auditLogs() {
        return $this->hasMany(AuditLog::class);
    }

    public function circles() {
        return $this->hasMany(Circle::class);
    }
}