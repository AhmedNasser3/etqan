<?php
// database/migrations/2026_xx_xx_add_repeat_days_to_plan_circle_schedules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plan_circle_schedules', function (Blueprint $table) {
            // نوع التكرار: daily = كل يوم، specific_days = أيام محددة
            $table->enum('repeat_type', ['daily', 'specific_days'])
                  ->default('daily')
                  ->after('day_of_week');

            // الأيام المحددة مخزنة كـ JSON مثلاً ["sunday","monday","wednesday"]
            $table->json('repeat_days')->nullable()->after('repeat_type');

            // تاريخ نهاية الخطة (يحسب آلياً بناءً على عدد أيام الخطة)
            $table->date('plan_end_date')->nullable()->after('repeat_days');
        });
    }

    public function down(): void
    {
        Schema::table('plan_circle_schedules', function (Blueprint $table) {
            $table->dropColumn(['repeat_type', 'repeat_days', 'plan_end_date']);
        });
    }
};