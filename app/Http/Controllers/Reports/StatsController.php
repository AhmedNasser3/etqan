<?php
// app/Http/Controllers/Reports/StatsController.php
namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /**
     * 🔥 إحصائيات الموظفين، الطلاب، والخطط للمركز
     */
    public function index(Request $request)
    {
        try {
            $centerId = Auth::user()?->center_id;

            if (!$centerId) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن الوصول للمركز'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    // 🔥 إحصائيات المعلمين حسب الـ role
                    'teachers_stats' => $this->getTeachersStats($centerId),
                    // 🔥 إحصائيات الطلاب
                    'students_stats' => $this->getStudentsStats($centerId),
                    // 🔥 إحصائيات الخطط
                    'plans_stats' => $this->getPlansStats($centerId),
                    // 🔥 ملخص عام
                    'summary' => $this->getSummaryStats($centerId),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحميل الإحصائيات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔥 إحصائيات المعلمين حسب الـ role
     */
    private function getTeachersStats($centerId): array
    {
        $rolesStats = DB::table('teachers as t')
            ->join('users as u', 't.user_id', '=', 'u.id')
            ->where('u.center_id', $centerId)
            ->selectRaw('
                t.role,
                COUNT(*) as count,
                GROUP_CONCAT(DISTINCT u.name) as names
            ')
            ->groupBy('t.role')
            ->pluck('count', 'role')
            ->toArray();

        //  تأكد من وجود كل الـ roles حتى لو صفر
        $allRoles = ['teacher', 'supervisor', 'motivator', 'student_affairs', 'financial'];
        $stats = [];

        foreach ($allRoles as $role) {
            $stats[$role] = [
                'count' => $rolesStats[$role] ?? 0,
                'name' => $this->getRoleName($role),
                'names' => $rolesStats[$role . '_names'] ?? null
            ];
        }

        return $stats;
    }

    /**
     * 🔥 إحصائيات الطلاب
     */
    private function getStudentsStats($centerId): array
    {
        $students = DB::table('students as s')
            ->join('users as u', 's.user_id', '=', 'u.id')
            ->where('u.center_id', $centerId)
            ->selectRaw('
                s.grade_level,
                s.circle,
                s.session_time,
                COUNT(*) as count
            ')
            ->groupBy('s.grade_level', 's.circle', 's.session_time')
            ->get();

        $totalStudents = DB::table('students as s')
            ->join('users as u', 's.user_id', '=', 'u.id')
            ->where('u.center_id', $centerId)
            ->count();

        return [
            'total' => $totalStudents,
            'by_grade' => $students->pluck('count', 'grade_level')->toArray(),
            'by_circle' => $students->groupBy('circle')->map->sum('count')->toArray(),
            'by_session' => $students->groupBy('session_time')->map->sum('count')->toArray(),
            'details' => $students->toArray()
        ];
    }

    /**
     * 🔥 إحصائيات الخطط
     */
    private function getPlansStats($centerId): array
    {
        $plans = DB::table('plans')
            ->where('center_id', $centerId)
            ->selectRaw('
                plan_name,
                total_months,
                COUNT(*) as count
            ')
            ->groupBy('plan_name', 'total_months')
            ->get();

        $totalPlans = DB::table('plans')->where('center_id', $centerId)->count();

        return [
            'total' => $totalPlans,
            'by_plan' => $plans->pluck('count', 'plan_name')->toArray(),
            'details' => $plans->toArray()
        ];
    }

    /**
     * 🔥 ملخص عام
     */
    private function getSummaryStats($centerId): array
    {
        $totalTeachers = DB::table('teachers as t')
            ->join('users as u', 't.user_id', '=', 'u.id')
            ->where('u.center_id', $centerId)
            ->count();

        $totalStudents = DB::table('students as s')
            ->join('users as u', 's.user_id', '=', 'u.id')
            ->where('u.center_id', $centerId)
            ->count();

        $totalPlans = DB::table('plans')->where('center_id', $centerId)->count();

        return [
            'total_teachers' => $totalTeachers,
            'total_students' => $totalStudents,
            'total_plans' => $totalPlans,
            'teacher_student_ratio' => $totalStudents > 0 ? round($totalStudents / max(1, $totalTeachers), 1) : 0
        ];
    }

    /**
     * ترجمة أسماء الـ roles
     */
    private function getRoleName($role): string
    {
        $names = [
            'teacher' => 'معلم',
            'supervisor' => 'مشرف',
            'motivator' => 'محفز',
            'student_affairs' => 'شؤون الطلاب',
            'financial' => 'مالي'
        ];

        return $names[$role] ?? $role;
    }
}
