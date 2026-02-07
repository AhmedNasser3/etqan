<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('center_id')->nullable()->constrained('centers')->onDelete('cascade')->after('id');
            $table->index(['center_id', 'grade_level']);
            $table->index(['center_id', 'circle']);
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
            $table->dropIndex(['center_id', 'grade_level']);
            $table->dropIndex(['center_id', 'circle']);
            $table->dropColumn('center_id');
        });
    }
};