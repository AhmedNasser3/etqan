<?php
// database/migrations/2026_03_01_000000_create_teacher_custom_salaries_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('teacher_custom_salaries', function (Blueprint $table) {
            $table->id();

            //  ربط بالـ Teacher
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');

            //  ربط بالـ User (للرقم الاضافي المميز)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            //  بيانات المرتب المخصص
            $table->decimal('custom_base_salary', 10, 2)->default(0);
            $table->integer('working_days')->default(26);
            $table->decimal('daily_rate', 10, 2)->nullable();
            $table->text('notes')->nullable();

            //  تفعيل/تعطيل المرتب المخصص
            $table->boolean('is_active')->default(true);

            //  فترة الصلاحية
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();

            $table->timestamps();

            //  Unique constraint لمنع التكرار
            $table->unique(['teacher_id', 'is_active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('teacher_custom_salaries');
    }
};
