<?php
namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Teachers\AttendanceDay;
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
                    'audit_log_reports' => $this->getAuditLogReports($centerId),
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
     * تقارير الحضور
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

            return $reports->map(function($report) use ($centerId) {
                $rate = $report->total_days > 0 ? round(($report->present_days / $report->total_days) * 100, 1) : 0;
                return [
                    'title' => 'تقرير الحضور - ' . $report->period,
                    'type' => 'حضور',
                    'period' => $report->period,
                    'issue_date' => Carbon::parse($report->period . '-01')->format('Y-m-d'),
                    'status' => 'جاهز',
                    'size' => number_format($report->total_days * 20) . ' KB',
                    'preview' => $rate . '% حضور (' . $report->present_days . '/' . $report->total_days . ')',
                    'center_id' => $centerId,
                ];
            });
        } catch (\Exception $e) {
            return collect();
        }
    }

    /**
     * تقارير الرواتب
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

            return $payrolls->map(function($payroll) use ($centerId) {
                return [
                    'title' => 'تقرير الرواتب - ' . $payroll->month_year,
                    'type' => 'رواتب',
                    'period' => $payroll->month_year,
                    'issue_date' => Carbon::parse($payroll->month_year . '-01')->format('Y-m-d'),
                    'status' => 'جاهز',
                    'size' => number_format($payroll->teachers_count * 45) . ' KB',
                    'preview' => $payroll->teachers_count . ' معلم - ' . number_format($payroll->total_payout) . ' جنيه',
                    'center_id' => $centerId,
                ];
            });
        } catch (\Exception $e) {
            return collect();
        }
    }

    /**
     * تقارير الإنجازات
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

            return $achievements->map(function($achievement) use ($centerId) {
                return [
                    'title' => 'تقرير الإنجازات - ' . $achievement->period,
                    'type' => 'إنجازات',
                    'period' => $achievement->period,
                    'issue_date' => Carbon::parse($achievement->period . '-15')->format('Y-m-d'),
                    'status' => 'جاهز',
                    'size' => number_format($achievement->total_achievements * 30) . ' KB',
                    'preview' => number_format($achievement->total_achievements) . ' إنجاز - ' . number_format($achievement->total_points) . ' نقطة',
                    'center_id' => $centerId,
                ];
            });
        } catch (\Exception $e) {
            return collect();
        }
    }

    /**
     * تقارير السجلات الإدارية  محدث مع أسماء المستخدمين
     */
    private function getAuditLogReports($centerId): Collection
    {
        try {
            $logs = DB::table('audit_logs as al')
                ->leftJoin('users as u', 'al.user_id', '=', 'u.id')
                ->where('u.center_id', $centerId)
                ->selectRaw('
                    DATE_FORMAT(al.created_at, "%Y-%m") as period,
                    COUNT(*) as total_logs,
                    al.action,
                    al.model_type,
                    COALESCE(u.name, "غير معروف") as user_name,
                    COALESCE(u.email, "غير معروف") as user_email,
                    COUNT(DISTINCT al.user_id) as unique_users
                ')
                ->groupByRaw('DATE_FORMAT(al.created_at, "%Y-%m"), al.action, al.model_type, u.name, u.email')
                ->havingRaw('total_logs > 0')
                ->orderBy('period', 'desc')
                ->orderBy('total_logs', 'desc')
                ->limit(24)
                ->get();

            return $logs->map(function($log) use ($centerId) {
                return [
                    'title' => 'سجل ' . $log->action . ' - ' . $log->period . ' (' . $log->user_name . ')',
                    'type' => 'سجلات_إدارية',
                    'period' => $log->period,
                    'issue_date' => Carbon::parse($log->period . '-01')->format('Y-m-d'),
                    'status' => $logs->count() > 0 ? 'جاهز' : 'لا توجد بيانات',
                    'size' => number_format($log->total_logs * 15) . ' KB',
                    'preview' => $log->total_logs . ' عملية من ' . $log->user_name . ' على ' . $log->model_type,
                    'center_id' => $centerId,
                    'action' => $log->action,
                    'model_type' => $log->model_type,
                    'unique_users' => $log->unique_users,
                    'user_name' => $log->user_name,
                    'user_email' => $log->user_email,
                ];
            });
        } catch (\Exception $e) {
            return collect();
        }
    }

    /**
     * جلب سجلات التدقيق  محدث مع أسماء المستخدمين
     */
    public function auditLogReport(Request $request, $period = null)
    {
        try {
            $period = $period ?? now()->format('Y-m');

            $logs = DB::table('audit_logs as al')
                ->leftJoin('users as u', 'al.user_id', '=', 'u.id')
                ->selectRaw('
                    al.*,
                    COALESCE(u.name, "غير معروف") as user_name,
                    COALESCE(u.email, "غير معروف") as user_email
                ')
                ->whereRaw('DATE_FORMAT(al.created_at, "%Y-%m") = ?', [$period])
                ->orderBy('al.created_at', 'desc')
                ->limit(1000)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $period,
                    'total_logs' => $logs->count(),
                    'logs' => $logs->map(function($log) {
                        return [
                            'id' => (int) $log->id,
                            'created_at' => $log->created_at,
                            'user_id' => (int) $log->user_id,
                            'user_name' => $log->user_name,
                            'user_email' => $log->user_email,
                            'action' => $log->action,
                            'model_type' => $log->model_type,
                            'model_id' => (int) $log->model_id,
                            'ip_address' => $log->ip_address,
                            'user_agent' => substr($log->user_agent ?? '', 0, 100),
                            'old_values' => json_decode($log->old_values, true) ?? null,
                            'new_values' => json_decode($log->new_values, true) ?? null,
                        ];
                    })
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحميل السجلات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب كل السجلات  محدث مع أسماء المستخدمين
     */
    public function allAuditLogs(Request $request)
    {
        try {
            $logs = DB::table('audit_logs as al')
                ->leftJoin('users as u', 'al.user_id', '=', 'u.id')
                ->selectRaw('
                    al.*,
                    COALESCE(u.name, "غير معروف") as user_name,
                    COALESCE(u.email, "غير معروف") as user_email
                ')
                ->orderBy('al.created_at', 'desc')
                ->limit(2000)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => 'الكل',
                    'total_logs' => $logs->count(),
                    'logs' => $logs->map(function($log) {
                        return [
                            'id' => (int) $log->id,
                            'created_at' => $log->created_at,
                            'user_id' => (int) $log->user_id,
                            'user_name' => $log->user_name,
                            'user_email' => $log->user_email,
                            'action' => $log->action,
                            'model_type' => $log->model_type,
                            'model_id' => (int) $log->model_id,
                            'ip_address' => $log->ip_address,
                            'user_agent' => substr($log->user_agent ?? '', 0, 100),
                            'old_values' => json_decode($log->old_values, true) ?? null,
                            'new_values' => json_decode($log->new_values, true) ?? null,
                        ];
                    })
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في تحميل السجلات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * مسح جميع السجلات
     */
    public function clearAuditLogs(Request $request)
    {
        try {
            $deleted = DB::table('audit_logs')->delete();

            return response()->json([
                'success' => true,
                'message' => "تم مسح {$deleted} سجل بنجاح"
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في مسح السجلات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تصدير السجلات
     */
    public function exportAuditLogs(Request $request, $period = null)
    {
        try {
            $period = $period ?? now()->format('Y-m');

            $logs = DB::table('audit_logs as al')
                ->leftJoin('users as u', 'al.user_id', '=', 'u.id')
                ->whereRaw('DATE_FORMAT(al.created_at, "%Y-%m") = ?', [$period])
                ->selectRaw('
                    al.created_at,
                    COALESCE(u.name, "غير معروف") as user_name,
                    al.action,
                    al.model_type,
                    al.model_id,
                    al.ip_address,
                    al.old_values,
                    al.new_values
                ')
                ->orderBy('al.created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'total_exported' => $logs->count(),
                'period' => $period
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في التصدير: ' . $e->getMessage()
            ], 500);
        }
    }

    public function attendance(Request $request, $period)
    {
        try {
            $centerId = Auth::user()?->center_id;

            if (!$centerId) {
                return response()->json(['success' => false, 'message' => 'لا يمكن الوصول للحلقة'], 403);
            }

            $data = AttendanceDay::where('center_id', $centerId)
                ->whereRaw('DATE_FORMAT(date, "%Y-%m") = ?', [$period])
                ->orderBy('date')
                ->get();

            return response()->json([
                'success' => true,
                'period' => $period,
                'total_records' => $data->count(),
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function payroll(Request $request, $period)
    {
        try {
            $centerId = Auth::user()?->center_id;

            if (!$centerId) {
                return response()->json(['success' => false, 'message' => 'لا يمكن الوصول للحلقة'], 403);
            }

            $data = DB::table('teacher_payrolls')
                ->join('teachers', 'teacher_payrolls.teacher_id', '=', 'teachers.id')
                ->leftJoin('users', 'teachers.user_id', '=', 'users.id')
                ->where('users.center_id', $centerId)
                ->where('teacher_payrolls.month_year', $period)
                ->select('teacher_payrolls.*', 'teachers.name as teacher_name', 'users.name as user_name')
                ->orderBy('teacher_payrolls.total_due', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'period' => $period,
                'total_records' => $data->count(),
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function achievements(Request $request, $period)
    {
        try {
            $centerId = Auth::user()?->center_id;

            if (!$centerId) {
                return response()->json(['success' => false, 'message' => 'لا يمكن الوصول للحلقة'], 403);
            }

            $data = DB::table('student_achievements')
                ->leftJoin('users', 'student_achievements.user_id', '=', 'users.id')
                ->where('users.center_id', $centerId)
                ->whereRaw('DATE_FORMAT(student_achievements.created_at, "%Y-%m") = ?', [$period])
                ->select('student_achievements.*', 'users.name as student_name')
                ->orderBy('student_achievements.points', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'period' => $period,
                'total_records' => $data->count(),
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
