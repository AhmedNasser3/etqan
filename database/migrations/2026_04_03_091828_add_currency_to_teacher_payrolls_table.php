<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teacher_payrolls', function (Blueprint $table) {
            $table->enum('currency', ['SAR', 'EGP', 'USD'])
                  ->default('SAR')
                  ->after('base_salary');

            $table->decimal('deductions', 10, 2)
                  ->default(0)
                  ->change();
        });
    }

    public function down(): void
    {
        Schema::table('teacher_payrolls', function (Blueprint $table) {
            $table->dropColumn('currency');

            $table->decimal('deductions', 10, 2)
                  ->default(200)
                  ->change();
        });
    }
};
