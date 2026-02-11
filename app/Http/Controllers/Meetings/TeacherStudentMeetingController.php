<?php
// app/Http/Controllers/Meetings/TeacherStudentMeetingController.php

namespace App\Http\Controllers\Meetings;

use App\Http\Controllers\Controller;
use App\Models\Meetings\TeacherStudentMeeting;
use App\Models\PlanCircleSchedule;
use App\Models\StudentPlanDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TeacherStudentMeetingController extends Controller
{
    public function index(Request $request)
    {
        $query = TeacherStudentMeeting::with([
            'teacher', 'student', 'center', 'planCircleSchedule'
        ])->select('id', 'teacher_id', 'student_id', 'meeting_code', 'jitsi_meeting_url',
                  'meeting_date', 'meeting_start_time', 'teacher_joined', 'student_joined');

        if ($request->teacher_id) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->center_id) {
            $query->where('center_id', $request->center_id);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'student_id' => 'required|exists:users,id',
            'plan_circle_schedule_id' => 'required|exists:plan_circle_schedules,id',
            'center_id' => 'required|exists:centers,id',
            'student_plan_detail_id' => 'required|exists:student_plan_details,id',
            'meeting_date' => 'required|date',
            'meeting_start_time' => 'required|date_format:H:i'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // تحقق من عدم وجود ميتينج مسبق
        $exists = TeacherStudentMeeting::where([
            'teacher_id' => $request->teacher_id,
            'student_id' => $request->student_id,
            'plan_circle_schedule_id' => $request->plan_circle_schedule_id
        ])->exists();

        if ($exists) {
            return response()->json(['message' => 'Meeting already exists'], 409);
        }

        DB::beginTransaction();
        try {
            $meetingCode = TeacherStudentMeeting::generateMeetingCode(
                $request->teacher_id,
                $request->student_id
            );

            $meeting = TeacherStudentMeeting::create([
                'teacher_id' => $request->teacher_id,
                'student_id' => $request->student_id,
                'plan_circle_schedule_id' => $request->plan_circle_schedule_id,
                'center_id' => $request->center_id,
                'student_plan_detail_id' => $request->student_plan_detail_id,
                'meeting_code' => $meetingCode,
                'jitsi_meeting_url' => "https://meet.jit.si/{$meetingCode}",
                'meeting_date' => $request->meeting_date,
                'meeting_start_time' => $request->meeting_start_time,
                'notes' => $request->notes
            ]);

            DB::commit();
            return response()->json($meeting->load(['teacher', 'student']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create meeting'], 500);
        }
    }

    public function show($id)
    {
        $meeting = TeacherStudentMeeting::with([
            'teacher', 'student', 'center', 'planCircleSchedule'
        ])->findOrFail($id);

        return response()->json($meeting);
    }

    public function updateJoinStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'teacher_joined' => 'boolean',
            'student_joined' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $meeting = TeacherStudentMeeting::findOrFail($id);
        $meeting->update($request->only(['teacher_joined', 'student_joined']));

        return response()->json($meeting->fresh());
    }

    public function destroy($id)
    {
        $meeting = TeacherStudentMeeting::findOrFail($id);
        $meeting->delete();

        return response()->json(['message' => 'Meeting deleted']);
    }

    public function getStudentMeetings($studentId)
    {
        $meetings = TeacherStudentMeeting::with(['teacher', 'center'])
            ->where('student_id', $studentId)
            ->orderBy('meeting_date')
            ->orderBy('meeting_start_time')
            ->get();

        return response()->json($meetings);
    }

    public function getTeacherMeetings($teacherId)
    {
        $meetings = TeacherStudentMeeting::with(['student', 'center'])
            ->where('teacher_id', $teacherId)
            ->orderBy('meeting_date')
            ->orderBy('meeting_start_time')
            ->get();

        return response()->json($meetings);
    }
}
