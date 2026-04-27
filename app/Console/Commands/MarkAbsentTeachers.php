<?php
// app/Console/Commands/MarkAbsentTeachers.php

namespace App\Console\Commands;

use App\Models\Tenant\Center;
use App\Services\AttendanceScheduleService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MarkAbsentTeachers extends Command
{
    protected $signature   = 'attendance:mark-absent {--date= : تاريخ محدد Y-m-d}';
    protected $description = 'يعمل غياب تلقائي لكل من لم يسجل حضور أمس';

    public function handle(AttendanceScheduleService $service): int
    {
        $dateStr = $this->option('date');
        $date    = $dateStr ? Carbon::parse($dateStr) : Carbon::yesterday();

        $this->info("📅 معالجة تاريخ: {$date->format('Y-m-d')}");

        $centers = Center::all();
        $total   = 0;

        foreach ($centers as $center) {
            $count = $service->autoMarkAbsent($center->id, $date);
            $this->line("  ✔ {$center->name}: {$count} غياب");
            $total += $count;
        }

        $this->info("✅ الإجمالي: {$total} سجل غياب");
        Log::info("attendance:mark-absent finished", ['total' => $total, 'date' => $date->format('Y-m-d')]);

        return Command::SUCCESS;
    }
}
