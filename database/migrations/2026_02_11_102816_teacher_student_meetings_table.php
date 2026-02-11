<?php
// database/migrations/2026_02_11_130000_create_teacher_student_meetings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('teacher_student_meetings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('plan_circle_schedule_id')->constrained('plan_circle_schedules')->onDelete('cascade');
            $table->foreignId('center_id')->constrained('centers')->onDelete('cascade');
            $table->foreignId('student_plan_detail_id')->constrained('student_plan_details')->onDelete('cascade');

            $table->string('jitsi_meeting_url')->unique();
            $table->string('meeting_code')->unique();

            $table->date('meeting_date');
            $table->time('meeting_start_time');
            $table->time('meeting_end_time')->nullable();

            $table->text('notes')->nullable();
            $table->boolean('teacher_joined')->default(false);
            $table->boolean('student_joined')->default(false);

            $table->timestamps();

            $table->unique([
                'teacher_id', 'student_id', 'plan_circle_schedule_id'
            ], 'unique_teacher_student_schedule');

            $table->index(['center_id'], 'idx_center');
            $table->index(['teacher_id'], 'idx_teacher');
            $table->index(['student_id'], 'idx_student');
            $table->index(['meeting_date', 'meeting_start_time'], 'idx_meeting_time');
            $table->index('meeting_code');
        });
    }

    public function down()
    {
        Schema::dropIfExists('teacher_student_meetings');
    }
};
