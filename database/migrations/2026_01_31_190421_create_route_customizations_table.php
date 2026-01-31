<?php
// database/migrations/xxxx_xx_xx_create_route_customizations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('route_customizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('center_id')->constrained('centers')->cascadeOnDelete();
            $table->string('teacher_register_path')->default('teacher-register');
            $table->string('student_register_path')->default('student-register');
            $table->string('center_register_path')->default('center-register');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['center_id']);
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('route_customizations');
    }
};