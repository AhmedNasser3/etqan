<?php
// database/migrations/2026_02_07_061200_create_student_achievements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_achievements', function (Blueprint $table) {
            $table->id();

            // ✅ Foreign key للطالب بس
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->index();

            // ✅ النقاط (يمكن + أو -)
            $table->integer('points')->default(0)->comment('نقاط إيجابية أو سالبة');
            $table->string('points_action')->default('added')->comment('added, deducted');

            // ✅ JSON للإنجازات
            $table->json('achievements')->nullable()->comment('{"طالب_الشهر": "يناير 2026", "حضور_ممتاز": 95, "أعلى_درجة": true}');

            // ✅ تفاصيل النقاط
            $table->text('reason')->nullable()->comment('سبب إضافة/خصم النقاط');
            $table->string('achievement_type')->nullable()->comment('monthly_student, perfect_attendance, top_score');

            $table->timestamps();

            // ✅ Indexes مُحدّثة
            $table->index('user_id');
            $table->index('points');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_achievements');
    }
};