<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teacher_salaries', function (Blueprint $table) {
            $table->enum('currency', ['SAR', 'EGP', 'USD'])
                  ->default('SAR')
                  ->after('daily_rate');
        });
    }

    public function down(): void
    {
        Schema::table('teacher_salaries', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
    }
};
