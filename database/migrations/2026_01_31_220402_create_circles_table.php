<?php
// database/migrations/2026_02_01_213300_create_circles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('circles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->foreignId('center_id')->constrained('centers')->onDelete('cascade');
            $table->foreignId('mosque_id')->nullable()->constrained('mosques')->nullOnDelete();
            $table->timestamps();

            $table->index(['center_id', 'teacher_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('circles');
    }
};