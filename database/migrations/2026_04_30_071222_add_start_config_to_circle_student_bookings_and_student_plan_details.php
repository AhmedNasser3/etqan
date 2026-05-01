<?php
// php artisan make:migration add_start_config_to_circle_student_bookings_and_student_plan_details

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('circle_student_bookings', function (Blueprint $table) {
            $table->enum('start_mode', ['normal', 'reverse', 'from_day', 'reverse_from_day'])
                  ->default('normal');
            $table->unsignedSmallInteger('start_day_number')
                  ->nullable()
                  ->after('start_mode');
        });

        Schema::table('student_plan_details', function (Blueprint $table) {
            $table->unsignedSmallInteger('plan_day_number')
                  ->nullable()
                  ->after('day_number')
                  ->comment('رقم اليوم الأصلي في الخطة قبل إعادة الترتيب');
        });
    }

    public function down(): void
    {
        Schema::table('circle_student_bookings', function (Blueprint $table) {
            $table->dropColumn(['start_mode', 'start_day_number']);
        });
        Schema::table('student_plan_details', function (Blueprint $table) {
            $table->dropColumn('plan_day_number');
        });
    }
};
