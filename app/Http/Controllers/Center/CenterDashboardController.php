<?php

namespace App\Http\Controllers\Center;

use App\Http\Controllers\Controller;
use App\Models\Auth\Teacher;
use App\Models\Auth\User;
use App\Models\Plans\CircleStudentBooking;
use App\Models\Teachers\TeacherSalary;
use App\Models\Tenant\Booking;
use App\Models\Tenant\Circle;
use App\Models\Tenant\Mosque;
use App\Models\Tenant\Payment;
use App\Models\Tenant\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CenterDashboardController extends Controller
{
    public function resolveCenterId(Request $request): ?int
    {
        if (Auth::check() && Auth::user()->center_id) {
            return (int) Auth::user()->center_id;
        }
        $id = $request->header('X-Center-Id') ?? $request->query('center_id');
        return ($id && is_numeric($id)) ? (int) $id : null;
    }

    /**
     * GET /api/v1/center/dashboard/stats
     * إحصائيات لوحة التحكم
     */
    public function stats(Request $request)
    {
        $centerId = $this->resolveCenterId($request);
        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $user = Auth::user();

        // ── إجمالي الطلاب ────────────────────────────────────────────────
        $totalStudents = Student::whereHas('user', fn($q) =>
            $q->where('center_id', $centerId)
        )->count();

        $lastMonthStudents = Student::whereHas('user', fn($q) =>
            $q->where('center_id', $centerId)
        )->whereHas('user', fn($q) =>
            $q->where('created_at', '<', now()->subMonth())
        )->count();

        $studentsDiff = $totalStudents - $lastMonthStudents;

        // ── الحلقات النشطة ───────────────────────────────────────────────
        $activeCircles = Circle::where('center_id', $centerId)->count();

        // ── المساجد ──────────────────────────────────────────────────────
        $totalMosques = Mosque::where('center_id', $centerId)->count();

        // ── المعلمون ─────────────────────────────────────────────────────
        $totalTeachers = Teacher::whereHas('user', fn($q) =>
            $q->where('center_id', $centerId)
        )->count();

        // ── طلبات معلقة ──────────────────────────────────────────────────
        $pendingBookings = 0;
        try {
            $pendingBookings = CircleStudentBooking::where('center_id', $centerId)
                ->where('status', 'pending')
                ->count();
        } catch (\Exception $e) {
            // لو الجدول مش موجود
        }

        // ── المستحقات ────────────────────────────────────────────────────
        $totalBalance = 0;
        try {
            $totalBalance = TeacherSalary::whereHas('student.user', fn($q) =>
                $q->where('center_id', $centerId)
            )->where('status', 'pending')->sum('amount');
        } catch (\Exception $e) {
            // لو الجدول مش موجود
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'center_id'       => $centerId,
                'center_name'     => $user->center?->name ?? 'مجمعك',
                'user_name'       => $user->name,
                'user_role'       => $user->role?->title_ar ?? 'مشرف',
                'students'        => [
                    'total'   => $totalStudents,
                    'diff'    => $studentsDiff,
                    'trend'   => $studentsDiff >= 0 ? 'up' : 'down',
                ],
                'circles'         => [
                    'total'   => $activeCircles,
                    'diff'    => 0,
                    'trend'   => 'flat',
                ],
                'mosques'         => $totalMosques,
                'teachers'        => $totalTeachers,
                'pending_bookings'=> $pendingBookings,
                'total_balance'   => $totalBalance,
            ],
        ]);
    }

    /**
     * GET /api/v1/center/dashboard/recent-circles
     * آخر الحلقات
     */
    public function recentCircles(Request $request)
    {
        $centerId = $this->resolveCenterId($request);
        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $circles = Circle::with(['mosque', 'teacher.user'])
            ->where('center_id', $centerId)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($c) => [
                'id'           => $c->id,
                'name'         => $c->name,
                'mosque_name'  => $c->mosque?->name  ?? '-',
                'teacher_name' => $c->teacher?->user?->name ?? '-',
            ]);

        return response()->json(['success' => true, 'data' => $circles]);
    }
}