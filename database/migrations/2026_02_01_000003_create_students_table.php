<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('guardian_id');
            $table->string('id_number')->unique();
            $table->string('grade_level');
            $table->string('circle');
            $table->enum('health_status', ['healthy', 'needs_attention', 'special_needs']);
            $table->text('reading_level')->nullable();
            $table->enum('session_time', ['asr', 'maghrib'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('guardian_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['guardian_id', 'grade_level']);
            $table->index('circle');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
