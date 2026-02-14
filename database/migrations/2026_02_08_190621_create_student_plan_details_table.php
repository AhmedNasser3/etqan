<?php
// database/migrations/2026_02_08_210000_create_student_plan_details_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_plan_details', function (Blueprint $table) {
            $table->id();

            // ✅ الربط بالحجز والطالب
            $table->foreignId('circle_student_booking_id')->constrained()->onDelete('cascade');

            // ✅ الخطة والمعلم والحلقة
            $table->foreignId('plan_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('circle_id')->constrained()->onDelete('cascade');

            // ✅ جدول الحصة للوقت
            $table->foreignId('plan_circle_schedule_id')->constrained('plan_circle_schedules')->onDelete('cascade');

            // ✅ خانة الوقت
            $table->time('session_time')->nullable();

            // ✅ رقم اليوم (بدل التاريخ)
            $table->unsignedInteger('day_number')->default(0);

            // ✅ الحفظ والمراجعة
            $table->string('new_memorization')->nullable();
            $table->string('review_memorization')->nullable();

            // ✅ الحالات الثلاثة بس
            $table->enum('status', ['مكتمل', 'قيد الانتظار', 'إعادة'])->default('قيد الانتظار');

            $table->timestamps();

            // ✅ Unique constraint - حجز + يوم = سجل واحد
            $table->unique(['circle_student_booking_id', 'day_number'], 'booking_day_unique');

            // ✅ Indexes محسنة
            $table->index(['plan_circle_schedule_id']);
            $table->index(['plan_id', 'circle_id'], 'plan_circle_idx');
            $table->index(['teacher_id', 'day_number'], 'teacher_day_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_plan_details');
    }
};
