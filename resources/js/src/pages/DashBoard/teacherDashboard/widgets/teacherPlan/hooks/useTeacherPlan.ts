import { useState, useEffect, useCallback } from "react";

export interface UpcomingSession {
    id: number;
    plan_id: number;
    plan_name: string;
    circle_id: number;
    circle_name: string;
    schedule_date: string;
    day_of_week: string;
    day_of_week_ar: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    repeat_type: "daily" | "specific_days";
    repeat_days: string[];
    repeat_days_ar: string[];
    schedule_days_label: string;
    plan_end_date: string | null;
    max_students: number | null;
    booked_students: number;
    remaining_slots: number;
    is_available: boolean;
    jitsi_room_name: string | null;
}

export const useTeacherPlan = () => {
    const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTeacherSchedules = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/v1/teacher-plan-schedules", {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (!response.ok) {
                throw new Error(`خطأ HTTP ${response.status}`);
            }

            const data = await response.json();
            setUpcomingSessions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || "حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeacherSchedules();
    }, []);

    return { upcomingSessions, loading, error, refetch: fetchTeacherSchedules };
};
