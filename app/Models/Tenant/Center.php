<?php

namespace App\Models\Tenant;

use App\Models\Auth\User;
use App\Models\Plans\Plan;
use App\Models\Audit\AuditLog;
use Illuminate\Database\Eloquent\Model;

class Center extends Model
{
    protected $table = 'centers';

    protected $fillable = [
        'name',
        'subdomain',
        'email',
        'phone',
        'address',
        'logo',
        'is_active',
        'settings'
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean'
    ];

    /**
     * علاقات المستخدمين
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * سجلات التدقيق
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * الدوائر
     */
    public function circles()
    {
        return $this->hasMany(Circle::class);
    }

    /**
     * خطط الحفظ الخاصة بالمجمع ← الإضافة الجديدة
     */
    public function plans()
    {
        return $this->hasMany(Plan::class, 'center_id');
    }

    /**
     * خطط الحفظ النشطة فقط
     */
    public function activePlans()
    {
        return $this->plans()->whereHas('details', function($query) {
            return $query->where('status', 'current');
        });
    }

    /**
     * إجمالي عدد الأيام المكتملة في كل الخطط
     */
    public function totalCompletedDays()
    {
        return $this->plans()
            ->withCount(['details as completed_days' => function($q) {
                $q->where('status', 'completed');
            }])
            ->get()
            ->sum('completed_days');
    }
}