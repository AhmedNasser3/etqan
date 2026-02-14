<?php
// database/migrations/2026_02_13_090000_create_student_attendance_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_attendance', function (Blueprint $table) {
            $table->id();

            // ✅ ربط بالطالب والحصة
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('plan_circle_schedule_id')->constrained('plan_circle_schedules')->onDelete('cascade');
            $table->foreignId('student_plan_detail_id')->nullable()->constrained('student_plan_details')->onDelete('cascade');

            // ✅ الحالة: حاضر/غائب
            $table->enum('status', ['حاضر', 'غائب'])->default('غائب');

            // ✅ الملاحظة
            $table->text('note')->nullable();

            // ✅ التقييم من 5
            $table->unsignedTinyInteger('rating')->default(0)->comment('0-5 نجوم');

            $table->timestamps();

            // ✅ إزالة الـ unique constraint المشكلة ❌
            // $table->unique(['user_id', 'plan_circle_schedule_id'], 'student_schedule_unique');

            // ✅ unique جديدة على كل جلسة لوحدها ✅
            $table->unique(['student_plan_detail_id'], 'student_plan_detail_unique');

            $table->index(['plan_circle_schedule_id', 'status'], 'schedule_status_idx');
            $table->index(['user_id', 'created_at'], 'student_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_attendance');
    }
};
