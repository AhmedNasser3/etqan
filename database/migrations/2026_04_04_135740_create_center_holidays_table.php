<?php
// database/migrations/2026_04_01_000002_create_center_holidays_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // أيام الإجازات - للمجمع كله أو لفرد
        Schema::create('center_holidays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('center_id')->constrained('circles')->onDelete('cascade');

            // NULL = إجازة للكل، رقم = إجازة لمعلم بعينه
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('cascade');

            $table->date('holiday_date');
            $table->string('reason')->nullable(); // سبب الإجازة
            $table->enum('type', ['full_day', 'weekend', 'custom'])->default('full_day');

            $table->timestamps();

            $table->index(['center_id', 'holiday_date']);
            $table->index(['teacher_id', 'holiday_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('center_holidays');
    }
};
