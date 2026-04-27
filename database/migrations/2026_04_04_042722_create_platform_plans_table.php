// database/migrations/xxxx_create_platform_plans_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // جدول خطط المنصة
        Schema::create('platform_plans', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_days')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedBigInteger('used_count')->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
        });

        // جدول تفاصيل خطط المنصة
        Schema::create('platform_plan_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('platform_plan_id')
                  ->constrained('platform_plans')
                  ->cascadeOnDelete();
            $table->unsignedSmallInteger('day_number');
            $table->string('new_memorization', 500)->nullable();
            $table->string('review_memorization', 500)->nullable();
            $table->unsignedSmallInteger('verse_from')->nullable();
            $table->unsignedSmallInteger('verse_to')->nullable();
            $table->string('notes', 500)->nullable();
            $table->timestamps();

            $table->unique(['platform_plan_id', 'day_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_plan_details');
        Schema::dropIfExists('platform_plans');
    }
};
