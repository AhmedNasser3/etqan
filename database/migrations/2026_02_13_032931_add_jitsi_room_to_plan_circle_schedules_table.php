<?php
// database/migrations/2026_02_13_XXXXXX_add_jitsi_room_to_plan_circle_schedules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('plan_circle_schedules', function (Blueprint $table) {
            $table->string('jitsi_room_name')->nullable()->after('teacher_id');
            $table->index('jitsi_room_name');
        });
    }

    public function down()
    {
        Schema::table('plan_circle_schedules', function (Blueprint $table) {
            $table->dropIndex(['jitsi_room_name']);
            $table->dropColumn('jitsi_room_name');
        });
    }
};