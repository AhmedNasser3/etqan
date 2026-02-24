// src/hooks/useCenterStats.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface RoleStats {
    count: number;
    name: string;
}

interface TeachersStats {
    teacher: RoleStats;
    supervisor: RoleStats;
    motivator: RoleStats;
    student_affairs: RoleStats;
    financial: RoleStats;
}

interface StudentsStats {
    total: number;
    by_grade: Record<string, number>;
    by_circle: Record<string, number>;
    by_session: Record<string, number>;
}

interface PlansStats {
    total: number;
    by_plan: Record<string, number>;
}

interface SummaryStats {
    total_teachers: number;
    total_students: number;
    total_plans: number;
    teacher_student_ratio: number;
}

interface StatsResponse {
    success: boolean;
    data: {
        teachers_stats: TeachersStats;
        students_stats: StudentsStats;
        plans_stats: PlansStats;
        summary: SummaryStats;
    };
}

export const useCenterStats = () => {
    const [stats, setStats] = useState<StatsResponse["data"] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // ✅ الرابط الصحيح حسب الـ routes بتاعتك
            const response = await fetch("/api/v1/reports/stats", {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            const result: StatsResponse = await response.json();

            if (result.success && result.data) {
                setStats(result.data);
                toast.success("✅ تم تحميل الإحصائيات بنجاح");
            } else {
                throw new Error(
                    result.data?.message || "خطأ في استجابة الخادم",
                );
            }
        } catch (err: any) {
            console.error("❌ خطأ في جلب الإحصائيات:", err);
            setError(err.message || "فشل في تحميل الإحصائيات");
            toast.error("❌ فشل في تحميل الإحصائيات");
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // 🔥 Helper functions - بيانات حقيقية فقط
    const getTotalTeachers = () => stats?.summary?.total_teachers || 0;
    const getTotalStudents = () => stats?.summary?.total_students || 0;
    const getTotalPlans = () => stats?.summary?.total_plans || 0;
    const getTeacherStudentRatio = () =>
        stats?.summary?.teacher_student_ratio || 0;

    // 🔥 تفصيلة كل role في مربع منفصل
    const getTeacherCount = () => stats?.teachers_stats?.teacher?.count || 0;
    const getSupervisorCount = () =>
        stats?.teachers_stats?.supervisor?.count || 0;
    const getMotivatorCount = () =>
        stats?.teachers_stats?.motivator?.count || 0;
    const getStudentAffairsCount = () =>
        stats?.teachers_stats?.student_affairs?.count || 0;
    const getFinancialCount = () =>
        stats?.teachers_stats?.financial?.count || 0;

    // 🔥 أسماء الـ roles بالعربي
    const getRoleName = (role: keyof TeachersStats): string => {
        const names: Record<keyof TeachersStats, string> = {
            teacher: "المعلمين",
            supervisor: "المشرفين",
            motivator: "المحفزين",
            student_affairs: "شؤون الطلاب",
            financial: "الإدارة المالية",
        };
        return names[role] || role;
    };

    const getRoleCount = (role: keyof TeachersStats) => {
        return stats?.teachers_stats?.[role]?.count || 0;
    };

    // 🔥 جميع الـ roles كـ array
    const getAllRoles = () => {
        const roles: Array<{
            key: keyof TeachersStats;
            count: number;
            name: string;
        }> = [
            {
                key: "teacher",
                count: getTeacherCount(),
                name: getRoleName("teacher"),
            },
            {
                key: "supervisor",
                count: getSupervisorCount(),
                name: getRoleName("supervisor"),
            },
            {
                key: "motivator",
                count: getMotivatorCount(),
                name: getRoleName("motivator"),
            },
            {
                key: "student_affairs",
                count: getStudentAffairsCount(),
                name: getRoleName("student_affairs"),
            },
            {
                key: "financial",
                count: getFinancialCount(),
                name: getRoleName("financial"),
            },
        ];
        return roles.filter((role) => role.count > 0); // بس اللي عندهم أرقام
    };

    return {
        stats,
        loading,
        error,
        fetchStats,

        // 🔥 الإجماليات
        getTotalTeachers,
        getTotalStudents,
        getTotalPlans,
        getTeacherStudentRatio,

        // 🔥 تفصيلة كل role
        getTeacherCount,
        getSupervisorCount,
        getMotivatorCount,
        getStudentAffairsCount,
        getFinancialCount,
        getRoleName,
        getRoleCount,
        getAllRoles,
    };
};
