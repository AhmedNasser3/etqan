<?php
// database/migrations/2026_02_02_create_plan_details_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('plan_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained()->onDelete('cascade');
            $table->integer('day_number');
            $table->string('new_memorization')->nullable();
            $table->string('review_memorization')->nullable();
            $table->enum('status', ['pending', 'current', 'completed'])->default('pending');
            $table->timestamps();

            $table->unique(['plan_id', 'day_number']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('plan_details');
    }
};