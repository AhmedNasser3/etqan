<?php
// database/migrations/2026_02_02_142907_create_plan_circle_schedules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('plan_circle_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('plans')->onDelete('cascade');
            $table->foreignId('circle_id')->constrained('circles')->onDelete('cascade');
            $table->foreignId('teacher_id')->nullable()->constrained('users')->onDelete('set null');
            $table->date('schedule_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration_minutes');
            $table->enum('day_of_week', ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);

            $table->unsignedInteger('max_students')->nullable();
            $table->integer('booked_students')->default(0);

            $table->boolean('is_available')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            // ✅ الحل: اسم قصير للـ unique constraint
            $table->unique(
                ['plan_id', 'circle_id', 'schedule_date', 'start_time'],
                'pcs_unique_schedule' // اسم قصير جداً ✅
            );

            // ✅ Indexes محسنة
            $table->index(['plan_id', 'is_available'], 'idx_plan_available');
            $table->index(['circle_id', 'is_available'], 'idx_circle_available');
            $table->index(['teacher_id', 'is_available'], 'idx_teacher_available');
            $table->index(['schedule_date', 'start_time'], 'idx_date_time');
        });
    }

    public function down()
    {
        Schema::dropIfExists('plan_circle_schedules');
    }
};