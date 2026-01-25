<?php

namespace App\Services;

use Illuminate\Http\Request;
use App\Models\Audit\AuditLog;

class AuditLogService
{
    public static function log($user, string $action, string $modelType, int $modelId, array $oldValues = null, array $newValues = null): void
    {
        AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);
    }

    public static function logUserCreate($user, $newUserId, array $userData): void
    {
        self::log($user, 'create_user', 'App\\Models\\Auth\\User', $newUserId, null, $userData);
    }

    public static function logStudentUpdate($user, $studentId, array $oldData, array $newData, string $action = 'update_student'): void
    {
        self::log($user, $action, 'App\\Models\\Tenant\\Student', $studentId, $oldData, $newData);
    }

    public static function logAttendance($user, $attendanceId, array $attendanceData): void
    {
        self::log($user, 'mark_attendance', 'App\\Models\\Tenant\\Attendance', $attendanceId, null, $attendanceData);
    }

    public static function logPointsChange($user, $studentId, int $oldPoints, int $newPoints, string $reason = null): void
    {
        self::log($user, 'update_points', 'App\\Models\\Tenant\\Student', $studentId,
            ['points' => $oldPoints],
            ['points' => $newPoints]
        );
    }
}
