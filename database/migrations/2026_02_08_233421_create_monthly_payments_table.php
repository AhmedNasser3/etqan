<?php
// database/migrations/2026_02_09_013100_create_monthly_payments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('monthly_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->year('payment_year');                        // 26
            $table->integer('payment_month')->unsigned();        // 2 (فبراير)
            $table->decimal('base_salary', 10, 2);               // ر.5000
            $table->integer('working_days');                     // 22/26
            $table->decimal('deductions', 10, 2)->default(0);    // ر.200 خصومات
            $table->integer('present_days');                     // أيام الحضور الفعلية
            $table->decimal('net_salary', 10, 2);                // ر.4800 المستحق
            $table->enum('status', ['pending', 'paid'])->default('pending'); // معلق/مدفوع
            $table->date('paid_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // ✅ unique لكل معلم/شهر/سنة
            $table->unique(['teacher_id', 'payment_year', 'payment_month']);
            $table->index(['teacher_id', 'status']);
            $table->index(['payment_year', 'payment_month']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('monthly_payments');
    }
};