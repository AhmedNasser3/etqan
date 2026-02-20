<?php
namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Student\StudentAchievement;
use App\Models\Teachers\AttendanceDay;
use App\Models\Teachers\TeacherPayroll;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $centerId = Auth::user()?->center_id;

            if (!$centerId) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن الوصول للحلقة'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'attendance_reports' => $this->getAttendanceReports($centerId),
                    'payroll_reports' => $this->getPayrollReports($centerId),
                    'achievement_reports' => $this->getAchievementReports($centerId),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحميل التقارير: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ تقارير الحضور - البسيط والآمن
     */
    private function getAttendanceReports($centerId): Collection
    {
        try {
            $reports = AttendanceDay::where('center_id', $centerId)
                ->selectRaw('
                    DATE_FORMAT(date, "%Y-%m") as period,
                    COUNT(*) as total_days,
                    SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present_days
                ')
                ->groupByRaw('DATE_FORMAT(date, "%Y-%m")')
                ->orderBy('period', 'desc')
                ->limit(12)
                ->get();

            return $reports->map(function($report) {
                $rate = $report->total_days > 0 ? round(($report->present_days / $report->total_days) * 100, 1) : 0;
                return [
                    'title' => 'تقرير الحضور - ' . $report->period,
                    'type' => 'حضور',
                    'period' => $report->period,
                    'issue_date' => Carbon::parse($report->period . '-01')->format('Y-m-d'),
                    'status' => 'جاهز',
                    'size' => '2.4 MB',
                    'preview' => $rate . '% حضور',
                    'center_id' => $centerId,
                ];
            });
        } catch (\Exception $e) {
            return collect(); // فارغ لو مفيش بيانات
        }
    }

    /**
     * ✅ تقارير الرواتب - Query بسيط جداً
     */
    private function getPayrollReports($centerId): Collection
    {
        try {
            $payrolls = DB::table('teacher_payrolls')
                ->join('teachers', 'teacher_payrolls.teacher_id', '=', 'teachers.id')
                ->join('users', 'teachers.user_id', '=', 'users.id')
                ->where('users.center_id', $centerId)
                ->selectRaw('
                    teacher_payrolls.month_year,
                    COUNT(*) as teachers_count,
                    ROUND(AVG(teacher_payrolls.total_due), 0) as avg_salary,
                    SUM(teacher_payrolls.total_due) as total_payout
                ')
                ->groupBy('teacher_payrolls.month_year')
                ->orderBy('teacher_payrolls.month_year', 'desc')
                ->limit(12)
                ->get();

            return $payrolls->map(function($payroll) {
                return [
                    'title' => 'تقرير الرواتب - ' . $payroll->month_year,
                    'type' => 'رواتب',
                    'period' => $payroll->month_year,
                    'issue_date' => Carbon::parse($payroll->month_year . '-01')->format('Y-m-d'),
                    'status' => 'جاهز',
                    'size' => '5.8 MB',
                    'preview' => $payroll->teachers_count . ' معلم - ' . number_format($payroll->total_payout) . ' جنيه',
                    'center_id' => $centerId,
                ];
            });
        } catch (\Exception $e) {
            return collect(); // فارغ لو مفيش بيانات
        }
    }

    /**
     * ✅ تقارير الإنجازات - Query بسيط جداً
     */
    private function getAchievementReports($centerId): Collection
    {
        try {
            $achievements = DB::table('student_achievements')
                ->join('users', 'student_achievements.user_id', '=', 'users.id')
                ->where('users.center_id', $centerId)
                ->selectRaw('
                    DATE_FORMAT(student_achievements.created_at, "%Y-%m") as period,
                    COUNT(*) as total_achievements,
                    COALESCE(SUM(student_achievements.points), 0) as total_points
                ')
                ->groupByRaw('DATE_FORMAT(student_achievements.created_at, "%Y-%m")')
                ->orderBy('period', 'desc')
                ->limit(12)
                ->get();

            return $achievements->map(function($achievement) {
                return [
                    'title' => 'تقرير الإنجازات - ' . $achievement->period,
                    'type' => 'إنجازات',
                    'period' => $achievement->period,
                    'issue_date' => Carbon::parse($achievement->period . '-15')->format('Y-m-d'),
                    'status' => 'جاهز',
                    'size' => '3.2 MB',
                    'preview' => number_format($achievement->total_points) . ' نقطة',
                    'center_id' => $centerId,
                ];
            });
        } catch (\Exception $e) {
            return collect(); // فارغ لو مفيش بيانات
        }
    }
}