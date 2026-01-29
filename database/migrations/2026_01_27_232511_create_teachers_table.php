<?php
// database/migrations/create_teachers_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['teacher', 'supervisor', 'motivator', 'student_affairs', 'financial']);
            $table->enum('session_time', ['asr', 'maghrib'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique('user_id');
            $table->index('role');
        });
    }

    public function down()
    {
        Schema::dropIfExists('teachers');
    }
};