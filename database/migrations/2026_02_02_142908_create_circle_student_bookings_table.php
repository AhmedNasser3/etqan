<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('circle_student_bookings', function (Blueprint $table) {
            $table->id();

            // ✅ استخدم unsignedBigInteger بدلاً من foreignId
            $table->unsignedBigInteger('plan_circle_schedule_id');
            $table->unsignedBigInteger('student_id');

            $table->enum('status', ['confirmed', 'cancelled'])
                  ->default('confirmed');

            $table->enum('progress_status', [
                'not_started',
                'in_progress',
                'completed'
            ])->default('not_started');

            $table->integer('current_day')->default(0);
            $table->integer('completed_days')->default(0);
            $table->integer('total_days')->default(0);

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('booked_at')->useCurrent();

            $table->timestamps();

            // ✅ أضف الـ unique أولاً
            $table->unique(['plan_circle_schedule_id', 'student_id'], 'schedule_student_unique');
            $table->index(['student_id', 'progress_status'], 'student_progress_idx');
            $table->index('current_day', 'current_day_idx');
        });

        // ✅ أضف الـ foreign keys في خطوة منفصلة
        Schema::table('circle_student_bookings', function (Blueprint $table) {
            $table->foreign('plan_circle_schedule_id')
                  ->references('id')
                  ->on('plan_circle_schedules')
                  ->onDelete('cascade');

            $table->foreign('student_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('circle_student_bookings', function (Blueprint $table) {
            $table->dropForeign(['plan_circle_schedule_id']);
            $table->dropForeign(['student_id']);
        });

        Schema::dropIfExists('circle_student_bookings');
    }
};
