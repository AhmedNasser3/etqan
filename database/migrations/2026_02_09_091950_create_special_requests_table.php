<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('special_requests', function (Blueprint $table) {
            $table->id();
            $table->string('whatsapp_number')->unique(); // رقم الواتس اب
            $table->string('name'); // الاسم
            $table->integer('age')->nullable(); // العمر
            $table->json('available_schedule')->nullable(); // المواعيد المتاحة JSON
            $table->json('memorized_parts')->nullable(); // الأجزاء المحفوظة JSON
            $table->json('parts_to_memorize')->nullable(); // المراد حفظه JSON
            $table->enum('daily_memorization', ['وجه', 'وجهين', 'أكثر'])->default('وجه'); // إمكانية الحفظ يومياً
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('special_requests');
    }
};
