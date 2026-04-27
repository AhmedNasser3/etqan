<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teacher_custom_salaries', function (Blueprint $table) {
            $table->enum('currency', ['SAR', 'EGP', 'USD'])
                  ->default('SAR')
                  ->after('custom_base_salary');

            // ✅ add مش change لأن العمود مش موجود أصلاً
            $table->decimal('deductions', 10, 2)
                  ->default(0)
                  ->after('currency');
        });
    }

    public function down(): void
    {
        Schema::table('teacher_custom_salaries', function (Blueprint $table) {
            $table->dropColumn('currency');
            $table->dropColumn('deductions');
        });
    }
};