<?php
// database/migrations/2026_04_01_000001_create_work_schedules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // جدول مواعيد العمل الافتراضية للمجمع أو لفرد معين
        Schema::create('work_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('center_id')->constrained('circles')->onDelete('cascade');

            // NULL = ينطبق على الكل، رقم = ينطبق على معلم بعينه
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('cascade');

            // وقت بدء العمل المتوقع
            $table->time('work_start_time')->default('08:00:00');

            // الدقائق المسموح بها كتأخير قبل احتساب late
            $table->unsignedSmallInteger('allowed_late_minutes')->default(15);

            // ملاحظات أو اسم الجدول
            $table->string('label')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // مجمع + معلم = جدول واحد فعّال
            $table->unique(['center_id', 'teacher_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('work_schedules');
    }
};
