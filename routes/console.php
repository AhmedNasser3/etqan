<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// كل يوم الساعة 1 صباحاً يعمل الغياب التلقائي لليوم اللي فات
Schedule::command('attendance:mark-absent')
    ->dailyAt('01:00')
    ->withoutOverlapping()
    ->runInBackground();
