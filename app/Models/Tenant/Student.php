<?php
// app/Models/Tenant/Student.php - المُصحح النهائي

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use App\Models\Auth\User;
use App\Models\Tenant\Center;
use Carbon\Carbon;

class Student extends Model
{
    protected $table = 'students';

    protected $fillable = [
        'center_id',
        'user_id',
        'guardian_id',
        'name',
        'phone',
        'id_number',
        'grade_level',
        'circle',
        'health_status',
        'reading_level',
        'session_time',
        'notes',
        'status'
        // ✅ مافيش balance و attendance_rate في DB
    ];

    protected $casts = [
        'reading_level' => 'array',
        'status' => 'integer'
    ];

    /**
     * ✅ Relations
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guardian()
    {
        return $this->belongsTo(User::class, 'guardian_id');
    }

    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    /**
     * ✅ Scopes آمنة
     */
    public function scopeByCenter($query, $centerId)
    {
        return $query->where('center_id', $centerId);
    }

    public function scopeByGradeLevel($query, $gradeLevel)
    {
        return $query->where('grade_level', $gradeLevel);
    }

    public function scopeByCircle($query, $circle)
    {
        return $query->where('circle', $circle);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    public function scopePending($query)
    {
        return $query->where('status', 0);
    }

    /**
     * ✅ بحث شامل آمن
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('id_number', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhereHas('user', function($q2) use ($search) {
                  $q2->where('name', 'like', "%{$search}%")
                     ->orWhere('phone', 'like', "%{$search}%");
              })
              ->orWhereHas('guardian', function($q2) use ($search) {
                  $q2->where('name', 'like', "%{$search}%");
              });
        });
    }

    /**
     * ✅ Accessors آمنة - مش بتعتمد على columns مش موجودة
     */
    public function getAgeAttribute()
    {
        return $this->user?->birth_date ?
            Carbon::parse($this->user->birth_date)->age . ' سنوات' : 'غير محدد';
    }

    public function getAttendanceRateAttribute()
    {
        return '95%'; // ثابت لحد ما نحسبها
    }

    public function getFormattedBalanceAttribute()
    {
        return 'ر.0'; // WhatsApp only
    }

    public function getDisplayStatusAttribute()
    {
        return $this->status == 1 ? 'نشط' : 'معلق';
    }

    public function getStatusColorAttribute()
    {
        return $this->status == 1 ?
            'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
    }

    public function getDisplayImageAttribute()
    {
        return $this->user->avatar ??
               $this->guardian->avatar ??
               'https://via.placeholder.com/150?text=Student';
    }

    /**
     * ✅ Scope كامل لشؤون الطلاب - يشتغل مع Controller
     */
    public function scopeStudentAffairs($query, $centerId, $filters = [])
    {
        $query->byCenter($centerId);

        // فلاتر الصف
        if (($filters['grade'] ?? null) && $filters['grade'] !== 'الكل') {
            $query->byGradeLevel($filters['grade']);
        }

        // فلاتر الحالة
        if (($filters['status'] ?? null) && $filters['status'] !== 'الكل') {
            if ($filters['status'] === 'نشط') {
                $query->active();
            } else {
                $query->pending();
            }
        }

        // بحث
        if ($filters['search'] ?? false) {
            $query->search($filters['search']);
        }

        return $query->with(['user:id,name,email,phone,birth_date,avatar', 'guardian:id,name,phone,avatar'])
                     ->orderBy('user.name', 'asc');
    }

    /**
     * ✅ إحصائيات آمنة - مش بتعتمد على balance
     */
    public static function getStats($centerId)
    {
        $total = static::byCenter($centerId)->count();
        $active = static::byCenter($centerId)->active()->count();

        return [
            'totalStudents' => $total,
            'activeStudents' => $active,
            'pendingStudents' => $total - $active,
            'totalBalance' => 0, // WhatsApp only
            'paymentRate' => $total ? round(($active / $total) * 100, 1) : 0
        ];
    }
}
