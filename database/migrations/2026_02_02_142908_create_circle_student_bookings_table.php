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

            $table->unsignedBigInteger('plan_id'); // ✅ خطة الـ 12 شهر
            $table->unsignedBigInteger('plan_details_id'); // ✅ يوم الحصة من plan_details
            $table->unsignedBigInteger('plan_circle_schedule_id');
            $table->unsignedBigInteger('user_id');

            $table->enum('status', ['pending','confirmed', 'cancelled'])->default('confirmed');
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

            // ✅ Unique constraints
            $table->unique(['plan_circle_schedule_id', 'user_id'], 'schedule_user_unique');
            $table->unique(['plan_id', 'plan_details_id', 'user_id'], 'plan_day_user_unique');

            // ✅ Indexes
            $table->index(['user_id', 'progress_status'], 'user_progress_idx');
            $table->index(['plan_id', 'plan_details_id'], 'plan_day_idx');
            $table->index('current_day', 'current_day_idx');
        });

        // ✅ Foreign Keys
        Schema::table('circle_student_bookings', function (Blueprint $table) {
            $table->foreign('plan_id')
                  ->references('id')
                  ->on('plans')
                  ->onDelete('cascade');

            $table->foreign('plan_details_id')
                  ->references('id')
                  ->on('plan_details')
                  ->onDelete('cascade');

            $table->foreign('plan_circle_schedule_id')
                  ->references('id')
                  ->on('plan_circle_schedules')
                  ->onDelete('cascade');

            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('circle_student_bookings', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropForeign(['plan_details_id']);
            $table->dropForeign(['plan_circle_schedule_id']);
            $table->dropForeign(['user_id']);
        });

        Schema::dropIfExists('circle_student_bookings');
    }
};