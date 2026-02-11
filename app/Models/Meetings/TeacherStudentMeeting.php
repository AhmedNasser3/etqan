<?php
// app/Models/Meetings/TeacherStudentMeeting.php

namespace App\Models\Meetings;

use App\Models\Auth\User;
use App\Models\Tenant\Center;
use Illuminate\Database\Eloquent\Model;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Student\StudentPlanDetail;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeacherStudentMeeting extends Model
{
    use HasFactory;

    protected $table = 'teacher_student_meetings';
    protected $fillable = [
        'teacher_id',
        'student_id',
        'plan_circle_schedule_id',
        'center_id',
        'student_plan_detail_id',
        'jitsi_meeting_url',
        'meeting_code',
        'meeting_date',
        'meeting_start_time',
        'meeting_end_time',
        'notes',
        'teacher_joined',
        'student_joined'
    ];

    protected $casts = [
        'meeting_date' => 'date',
        'meeting_start_time' => 'datetime:H:i',
        'meeting_end_time' => 'datetime:H:i',
        'teacher_joined' => 'boolean',
        'student_joined' => 'boolean'
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function planCircleSchedule()
    {
        return $this->belongsTo(PlanCircleSchedule::class);
    }

    public function studentPlanDetail()
    {
        return $this->belongsTo(StudentPlanDetail::class);
    }

    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public static function generateMeetingCode($teacherId, $studentId)
    {
        return 'halaqa-teacher-' . $teacherId . '-student-' . $studentId . '-' . \Str::random(6);
    }
}