<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // المعلم
            $table->unsignedInteger('schedule_id');
            $table->string('circle_name')->nullable();
            $table->dateTime('joined_at');
            $table->dateTime('left_at')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->date('session_date');
            $table->timestamps();

            $table->index(['user_id', 'schedule_id']);
            $table->index('session_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_logs');
    }
};