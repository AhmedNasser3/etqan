<?php
// app/Models/Tenant/Student.php -  الكامل مع كل الـ Relations المطلوبة للـ Guardian Controller

namespace App\Models\Tenant;

use App\Models\Auth\User;
use App\Models\Plans\CircleStudentBooking;
use App\Models\Student\StudentAchievement;
use App\Models\Student\StudentPlanDetail;
use App\Models\Students\StudentAttendance;
use App\Models\Tenant\Center;
use App\Models\Tenant\Plan;
use App\Models\Tenant\PlanCircleSchedule;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected $casts = [
        'reading_level' => 'array',
        'status' => 'integer'
    ];

    /**
     *  Basic Relations - العلاقات الأساسية
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function guardian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guardian_id');
    }

    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    /**
     *  GUARDIAN CONTROLLER RELATIONS - العلاقات المطلوبة للـ Guardian Controller 🔥
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(CircleStudentBooking::class, 'user_id');
    }

    public function achievements(): HasMany
    {
        return $this->hasMany(StudentAchievement::class, 'user_id');
    }

    public function attendance(): HasMany
    {
        return $this->hasMany(StudentAttendance::class, 'user_id');
    }

    /**
     *  علاقة تفاصيل خطة الطالب
     */
    public function studentPlanDetails()
    {
        return $this->hasManyThrough(
            StudentPlanDetail::class,
            CircleStudentBooking::class,
            'user_id', // Foreign key في CircleStudentBooking
            'circle_student_booking_id', // Foreign key في StudentPlanDetail
            'user_id', // Local key في Student
            'id' // Local key في CircleStudentBooking
        );
    }

    /**
     *  Scopes آمنة
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
     *  Guardian Scope - لجلب أبناء ولي الأمر فقط
     */
    public function scopeForGuardian($query, $guardianId)
    {
        return $query->where('guardian_id', $guardianId);
    }

    /**
     *  بحث شامل آمن
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
     *  Accessors مفيدة للـ Guardian Dashboard
     */
    public function getAgeAttribute()
    {
        return $this->user?->birth_date ?
            Carbon::parse($this->user->birth_date)->age . ' سنوات' : 'غير محدد';
    }

    public function getAttendanceRateAttribute()
    {
        $total = $this->attendance()->count();
        $present = $this->attendance()->where('status', 'حاضر')->count();
        return $total ? round(($present / $total) * 100, 1) . '%' : '0%';
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
     *  Attendance Summary للـ Guardian
     */
    public function getAttendanceSummaryAttribute()
    {
        $attendance = $this->attendance()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return [
            'present' => $attendance['حاضر'] ?? 0,
            'absent' => $attendance['غائب'] ?? 0,
            'total' => $this->attendance()->count(),
            'rate' => $this->attendanceRate
        ];
    }

    /**
     *  Recent Attendance لآخر 7 أيام
     */
    public function getRecentAttendanceAttribute()
    {
        return $this->attendance()
            ->where('created_at', '>=', now()->subDays(7))
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($record) => [
                'date' => $record->created_at->format('Y-m-d H:i'),
                'status' => $record->status,
                'note' => $record->note,
                'rating' => $record->rating
            ]);
    }

    /**
     *  Scope كامل لشؤون الطلاب
     */
    public function scopeStudentAffairs($query, $centerId, $filters = [])
    {
        $query->byCenter($centerId);

        if (($filters['grade'] ?? null) && $filters['grade'] !== 'الكل') {
            $query->byGradeLevel($filters['grade']);
        }

        if (($filters['status'] ?? null) && $filters['status'] !== 'الكل') {
            if ($filters['status'] === 'نشط') {
                $query->active();
            } else {
                $query->pending();
            }
        }

        if ($filters['search'] ?? false) {
            $query->search($filters['search']);
        }

        return $query->with([
                'user:id,name,email,phone,birth_date,avatar',
                'guardian:id,name,phone,avatar',
                'attendance' => fn($q) => $q->latest()->limit(5)
            ])
            ->orderBy('user.name', 'asc');
    }

    /**
     *  إحصائيات آمنة للـ Center
     */
    public static function getStats($centerId)
    {
        $total = static::byCenter($centerId)->count();
        $active = static::byCenter($centerId)->active()->count();

        return [
            'totalStudents' => $total,
            'activeStudents' => $active,
            'pendingStudents' => $total - $active,
            'totalBalance' => 0,
            'paymentRate' => $total ? round(($active / $total) * 100, 1) : 0
        ];
    }
}
