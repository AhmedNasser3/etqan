<?php
// database/migrations/2026_02_09_013000_create_attendance_days_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('attendance_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('circle_id')->constrained('circles')->onDelete('cascade'); // الحلقة
            $table->date('date'); // التاريخ

            // الحالة: present=حاضر, absent=غائب, late=متأخر
            $table->enum('status', ['present', 'absent', 'late'])->default('present');

            // التأخير بالدقائق (NULL لو مفيش تأخير)
            $table->unsignedTinyInteger('delay_minutes')->nullable();

            // ملاحظات التأخير أو الغياب
            $table->text('notes')->nullable();

            $table->timestamps();

            // Unique constraint: معلم + حلقة + تاريخ = سجل واحد
            $table->unique(['teacher_id', 'circle_id', 'date']);

            // Indexes للبحث السريع
            $table->index(['teacher_id', 'date']);
            $table->index(['circle_id', 'date']);
            $table->index(['teacher_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('attendance_days');
    }
};
