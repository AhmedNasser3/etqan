<?php
// database/migrations/2026_02_10_create_teacher_payrolls_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('teacher_payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('salary_config_id')->constrained('teacher_salaries')->onDelete('cascade');
            $table->string('month_year', 7);
            $table->decimal('base_salary', 10, 2);
            $table->integer('attendance_days');
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('total_due', 10, 2);
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->date('period_start');
            $table->date('period_end');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['teacher_id', 'month_year']);
            $table->index(['status', 'month_year']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('teacher_payrolls');
    }
};
