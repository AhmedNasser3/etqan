<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Auth\Teacher;
use App\Models\Tenant\Circle;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\Teachers\AttendanceDay;

class DailyAttendance extends Command
{
    protected $signature = 'attendance:daily';
    protected $description = 'إنشاء سجلات حضور/غياب يومية أوتوماتيك للمعلمين النشطين';

    public function handle()
    {
        $today = Carbon::today();
        $createdCount = 0;
        $skippedCount = 0;

        $this->info('🚀 بدء إنشاء سجلات الحضور اليومية...');
        $this->line("📅 التاريخ: {$today->format('Y-m-d')}", 'green');

        // المعلمين النشطين
        $activeTeachers = Teacher::whereHas('user', function($q) {
            $q->where('status', 'active');
        })->get();

        $this->info("📊 عدد المعلمين النشطين: {$activeTeachers->count()}");

        if ($activeTeachers->count() === 0) {
            $this->warn('⚠️  لا يوجد معلمين نشطين');
            return 1;
        }

        foreach ($activeTeachers as $teacher) {
            $this->line("👤 جاري معالجة: {$teacher->name}", 'blue');

            // ✅ حلقات المعلم من جدول circles حيث teacher_id = المعلم
            $teacherCircles = Circle::where('teacher_id', $teacher->id)->pluck('id');

            $this->line("  📚 عدد الحلقات: {$teacherCircles->count()}", 'gray');

            foreach ($teacherCircles as $circleId) {
                // التحقق من وجود سجل اليوم
                $exists = AttendanceDay::where('teacher_id', $teacher->id)
                    ->where('circle_id', $circleId)
                    ->whereDate('date', $today)
                    ->exists();

                if (!$exists) {
                    // إنشاء سجل غياب أوتوماتيك
                    AttendanceDay::create([
                        'teacher_id' => $teacher->id,
                        'circle_id' => $circleId,
                        'date' => $today,
                        'status' => 'absent',
                        'is_auto_created' => true,
                        'auto_created_at' => now(),
                        'notes' => 'غياب أوتوماتيك',
                    ]);
                    $createdCount++;
                    $this->line("    ✅ سجل غياب جديد للحلقة #{$circleId}", 'green');
                } else {
                    $skippedCount++;
                    $this->line("    ⏭️  سجل موجود للحلقة #{$circleId}", 'yellow');
                }
            }
        }

        $this->line('');
        $this->info("📈 الإحصائيات النهائية:");
        $this->line("  ✅ تم إنشاء: {$createdCount} سجل", 'green');
        $this->line("  ⏭️  تم تجاهل: {$skippedCount} سجل", 'yellow');
        $this->line("  📅 لليوم: {$today->format('Y-m-d')}", 'cyan');

        Log::info('Daily Attendance Command', [
            'date' => $today->toDateString(),
            'created' => $createdCount,
            'skipped' => $skippedCount
        ]);

        $this->info('🎉 تم بنجاح!');
        return 0;
    }
}