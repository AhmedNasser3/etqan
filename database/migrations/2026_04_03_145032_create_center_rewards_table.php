<?php
// database/migrations/2026_04_03_000001_create_center_rewards_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('center_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('center_id')->constrained('centers')->onDelete('cascade');  // بدون ->index()
            $table->string('name');                    // اسم الجائزة
            $table->text('description')->nullable();   // وصف اختياري
            $table->unsignedInteger('points_cost');    // كم نقطة تكلف
            $table->boolean('is_active')->default(true); // متاحة أم لا
            $table->timestamps();
        });

        Schema::create('student_reward_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');     // بدون ->index()
            $table->foreignId('reward_id')->constrained('center_rewards')->onDelete('cascade'); // بدون ->index()
            $table->unsignedInteger('points_spent');  // النقاط المخصومة وقت الشراء
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_reward_purchases');
        Schema::dropIfExists('center_rewards');
    }
};
