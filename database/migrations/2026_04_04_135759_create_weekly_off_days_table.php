<?php
// database/migrations/2026_04_01_000003_create_weekly_off_days_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // أيام الراحة الأسبوعية (مثلاً الجمعة والسبت = إجازة)
        Schema::create('weekly_off_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('center_id')->constrained('centers')->onDelete('cascade');

            // NULL = للكل، رقم = لمعلم معين
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('cascade');

            // 0=الأحد, 1=الاثنين, ..., 5=الجمعة, 6=السبت
            $table->unsignedTinyInteger('day_of_week');

            $table->timestamps();

            $table->unique(['center_id', 'teacher_id', 'day_of_week']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('weekly_off_days');
    }
};