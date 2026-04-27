// hooks/useTeacherAttendance.ts
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface AttendanceSession {
    id: number;
    time: string;
    status: "present" | "absent";
}

export interface AttendanceDay {
    id: number;
    date: string;
    dayName: string;
    teacherName: string; // ← مضاف
    teacherId: number; // ← مضاف
    sessions: AttendanceSession[];
    totalStatus: "present" | "partial" | "absent";
    centerName?: string;
    status?: "present" | "absent" | "late";
    delayMinutes?: number;
    notes?: string | null;
    checkinTime?: string; // ← مضاف
}

const getDayName = (dateString: string): string => {
    const date = new Date(dateString + "T00:00:00");
    const days = [
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
    ];
    return days[date.getDay()];
};

export const useTeacherAttendance = () => {
    const now = new Date();
    const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

    const [dateFrom, setDateFrom] = useState(firstDay);
    const [dateTo, setDateTo] = useState(lastDay);
    const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([]);
    const [filteredData, setFilteredData] = useState<AttendanceDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRealData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // ─── جيب بيانات الحضور ───────────────────────────────────
            const res = await axios.get("/api/v1/attendance", {
                params: {
                    date_from: dateFrom,
                    date_to: dateTo,
                    per_page: 100,
                },
            });

            if (!res.data.success) {
                throw new Error(res.data.message || "خطأ في الاستجابة");
            }

            // الـ teacher من الـ response مباشرة
            const teacherInfo = res.data.teacher ?? {};
            const apiData: any[] = res.data.data?.data ?? [];

            const transformed: AttendanceDay[] = apiData.map((day: any) => ({
                id: day.id,
                date: day.date,
                dayName: getDayName(day.date),
                // ✅ اسم المعلم من الـ response
                teacherName: teacherInfo.name ?? day.teacher_name ?? "غير محدد",
                teacherId: teacherInfo.id ?? day.teacher_id ?? 0,
                sessions: [],
                totalStatus: (day.total_status ?? "absent") as
                    | "present"
                    | "partial"
                    | "absent",
                centerName: day.center_name ?? "غير محدد",
                status: (day.status ?? "absent") as
                    | "present"
                    | "absent"
                    | "late",
                delayMinutes: day.delay_minutes ?? 0,
                notes: day.notes ?? null,
                checkinTime: day.created_at
                    ? new Date(day.created_at).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                      })
                    : null,
            }));

            setAttendanceData(transformed);
            setFilteredData(transformed);
        } catch (err: any) {
            console.error("❌ خطأ في جلب بيانات الحضور:", err);
            setError(
                err.response?.data?.message ??
                    err.message ??
                    "فشل في جلب البيانات",
            );
            setAttendanceData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo]);

    useEffect(() => {
        fetchRealData();
    }, [fetchRealData]);

    const toggleSessionStatus = useCallback(
        (dayId: number, _sessionId: number) => {
            const toggle = (data: AttendanceDay[]) =>
                data.map((d) =>
                    d.id === dayId
                        ? {
                              ...d,
                              totalStatus:
                                  d.totalStatus === "present"
                                      ? ("absent" as const)
                                      : ("present" as const),
                              status:
                                  d.status === "present"
                                      ? ("absent" as const)
                                      : ("present" as const),
                          }
                        : d,
                );
            setAttendanceData((prev) => toggle(prev));
            setFilteredData((prev) => toggle(prev));
        },
        [],
    );

    const presentDays = filteredData.filter(
        (d) => d.totalStatus === "present",
    ).length;
    const totalDaysCount = filteredData.length;
    const attendancePercentage =
        totalDaysCount > 0
            ? Math.round((presentDays / totalDaysCount) * 100)
            : 0;
    const lastDayToday = filteredData[filteredData.length - 1];

    return {
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        filteredData,
        attendanceData,
        attendancePercentage,
        lastDayToday,
        totalDays: totalDaysCount,
        loading,
        error,
        toggleSessionStatus,
        refetchData: fetchRealData,
        getDayName,
    };
};
