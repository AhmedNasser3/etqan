<?php

namespace App\Services;

use Illuminate\Http\Request;
use App\Models\Audit\AuditLog;

class AuditLogService
{
    /**
     * General logging for any model/table
     */
    public static function log(
        $user,
        string $action,
        string $modelType,
        int $modelId,
        array $oldValues = null,
        array $newValues = null
    ): void {
        AuditLog::create([
            'user_id' => $user?->id,
            'action_ar' => $action,           // العملية بالعربي
            'model_type' => $modelType,
            'model_id' => $modelId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);
    }

    /**
     * Create new record (any table)
     */
    public static function logCreate($user, $newId, string $modelType, array $data): void
    {
        self::log($user, 'إنشاء', $modelType, $newId, null, $data);
    }

    /**
     * Update record (any table)
     */
    public static function logUpdate($user, $id, array $oldData, array $newData, string $action = 'تعديل'): void
    {
        self::log($user, $action, '', $id, $oldData, $newData);
    }

    /**
     * Delete record (any table)
     */
    public static function logDelete($user, $id, array $dataBeforeDelete): void
    {
        self::log($user, 'حذف', '', $id, $dataBeforeDelete, null);
    }

    /**
     * Specific methods (keep English names, Arabic actions)
     */
    public static function logUserCreate($user, $newUserId, array $userData): void
    {
        self::log($user, 'إنشاء_مستخدم', 'App\\Models\\Auth\\User', $newUserId, null, $userData);
    }

    public static function logStudentUpdate($user, $studentId, array $oldData, array $newData, string $action = 'تعديل_طالب'): void
    {
        self::log($user, $action, 'App\\Models\\Tenant\\Student', $studentId, $oldData, $newData);
    }

    public static function logAttendance($user, $attendanceId, array $attendanceData): void
    {
        self::log($user, 'تسجيل_حضور', 'App\\Models\\Tenant\\Attendance', $attendanceId, null, $attendanceData);
    }

    public static function logPointsChange($user, $studentId, int $oldPoints, int $newPoints, string $reason = null): void
    {
        self::log($user, 'تغيير_نقاط', 'App\\Models\\Tenant\\Student', $studentId,
            ['points' => $oldPoints],
            ['points' => $newPoints, 'سبب' => $reason]
        );
    }
}