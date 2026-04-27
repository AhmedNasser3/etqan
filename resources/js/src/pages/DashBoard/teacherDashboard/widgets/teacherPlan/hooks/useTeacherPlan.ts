// hooks/useTeacherPlan.ts - النسخة النهائية مع jitsi_room_name
import { useState, useEffect, useCallback } from "react";

export interface UpcomingSession {
    id: number;
    schedule_date: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    booked_students: number;
    max_students: number | null;
    jitsi_room_name: string | null; //  رابط الميتينج
}

export const useTeacherPlan = () => {
    const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const log = (message: string, data?: any) => {
        const timestamp = new Date().toLocaleTimeString("ar-EG");
        console.group(
            `%c🧪 TeacherPlan ${timestamp}`,
            "color: #2196F3; font-weight: bold;",
        );
        console.log(message, data || "");
        console.groupEnd();
    };

    useEffect(() => {
        log("🚀 Hook تم تحميله");
        fetchTeacherSchedules();
    }, []);

    const fetchTeacherSchedules = useCallback(async () => {
        log("📡 بدء جلب المواعيد");

        try {
            setLoading(true);
            setError(null);
            setUpcomingSessions([]);

            //  جلب كل الحلقات المتاحة للمعلم مع jitsi_room_name
            log("📅 طلب مواعيد الحلقات");
            const schedulesResponse = await fetch(
                "/api/v1/teacher-plan-schedules",
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            log("📊 استجابة المواعيد:", {
                status: schedulesResponse.status,
                ok: schedulesResponse.ok,
            });

            if (!schedulesResponse.ok) {
                const errorText = await schedulesResponse.text();
                log("❌ خطأ في المواعيد:", errorText);
                throw new Error(`خطأ HTTP ${schedulesResponse.status}`);
            }

            const schedules = await schedulesResponse.json();
            log(" تم استلام المواعيد:", schedules);

            if (Array.isArray(schedules)) {
                log("💾 حفظ", schedules.length, "موعد في الـ state");
                setUpcomingSessions(schedules);
            } else {
                log("⚠️ البيانات مش array");
                setUpcomingSessions([]);
            }
        } catch (err: any) {
            log("❌ خطأ:", err.message);
            setError(err.message || "حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
            log("🏁 انتهى الجلب");
        }
    }, []);

    return {
        upcomingSessions,
        loading,
        error,
        refetch: fetchTeacherSchedules,
    };
};
