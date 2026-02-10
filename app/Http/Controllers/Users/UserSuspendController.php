<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use App\Models\Auth\Teacher;
use App\Models\Tenant\Student;
use Illuminate\Http\Request;

class UserSuspendController extends Controller
{
    /**
     * ✅ الموظفين المعلقين فقط (من جدول teachers حسب role)
     */
    public function suspendedTeachers()
    {
        $suspendedTeachers = User::whereHas('teacher', function ($query) {
                $query->whereIn('role', ['teacher', 'supervisor', 'motivator', 'student_affairs', 'financial']);
            })
            ->where('status', 'inactive')
            ->with(['teacher'])
            ->select('id', 'name', 'email', 'phone', 'status', 'created_at', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $suspendedTeachers->items(),
            'pagination' => [
                'current_page' => $suspendedTeachers->currentPage(),
                'total' => $suspendedTeachers->total(),
                'per_page' => $suspendedTeachers->perPage(),
                'last_page' => $suspendedTeachers->lastPage(),
                'from' => $suspendedTeachers->firstItem(),
                'to' => $suspendedTeachers->lastItem(),
            ]
        ]);
    }

    /**
     * ✅ الطلاب المعلقين فقط
     */
    public function suspendedStudents()
    {
        $suspendedStudents = User::whereHas('student')
            ->where('status', 'inactive')
            ->with(['student'])
            ->select('id', 'name', 'email', 'phone', 'status', 'created_at', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $suspendedStudents->items(),
            'pagination' => [
                'current_page' => $suspendedStudents->currentPage(),
                'total' => $suspendedStudents->total(),
                'per_page' => $suspendedStudents->perPage(),
                'last_page' => $suspendedStudents->lastPage(),
                'from' => $suspendedStudents->firstItem(),
                'to' => $suspendedStudents->lastItem(),
            ]
        ]);
    }

    /**
     * ✅ Toggle suspend للموظفين
     */
    public function toggleTeacherSuspend($teacherId)
    {
        $user = User::whereHas('teacher', function ($query) {
                $query->whereIn('role', ['teacher', 'supervisor', 'motivator', 'student_affairs', 'financial']);
            })
            ->findOrFail($teacherId);

        $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        // ✅ تحديث معلومات الدور العربي من teacher role
        $teacherRole = $user->teacher->role;
        $roleTitle = $this->getTeacherRoleTitle($teacherRole);

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'active'
                ? "تم تفعيل حساب {$roleTitle}"
                : "تم إيقاف حساب {$roleTitle}"
        ]);
    }

    /**
     * ✅ Delete موظف
     */
    public function deleteTeacher($teacherId)
    {
        $user = User::whereHas('teacher', function ($query) {
                $query->whereIn('role', ['teacher', 'supervisor', 'motivator', 'student_affairs', 'financial']);
            })
            ->findOrFail($teacherId);

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف حساب الموظف نهائياً'
        ]);
    }

    /**
     * ✅ تحويل role إلى عنوان عربي
     */
    private function getTeacherRoleTitle($role): string
    {
        return match($role) {
            'teacher' => 'المعلم',
            'supervisor' => 'المشرف التعليمي',
            'motivator' => 'المحفز',
            'student_affairs' => 'شؤون الطلاب',
            'financial' => 'المشرف المالي',
            default => 'الموظف'
        };
    }
}