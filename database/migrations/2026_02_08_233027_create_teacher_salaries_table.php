<?php
// database/migrations/2026_02_09_012900_create_teacher_salaries_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('teacher_salaries', function (Blueprint $table) {
            $table->id();
            $table->enum('role', ['teacher', 'supervisor', 'motivator', 'student_affairs', 'financial']);  // ✅ الخمس أدوار
            $table->foreignId('center_id')->nullable()->constrained('centers')->onDelete('set null');
            $table->string('mosque_id')->nullable();
            $table->decimal('base_salary', 10, 2)->default(0);
            $table->integer('working_days')->default(30);
            $table->decimal('daily_rate', 8, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['role', 'center_id', 'mosque_id']);  // unique per role + center + mosque
            $table->index(['center_id', 'mosque_id', 'role']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('teacher_salaries');
    }
};