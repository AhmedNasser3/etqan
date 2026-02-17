// hooks/useTeacherSchedules.ts
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export interface PlanSchedule {
    id: number;
    plan_name: string;
    circle_name: string;
    schedule_date: string;
    start_time: string;
    end_time: string;
    day_of_week: string;
    max_students: number;
    booked_students: number;
    remaining_slots: number;
    is_available: boolean;
    notes?: string;
}

export interface TeacherStats {
    total_schedules: number;
    available_schedules: number;
    future_schedules: number;
    full_schedules: number;
    availability_rate: number;
}

export const useTeacherSchedules = () => {
    const [schedules, setSchedules] = useState<PlanSchedule[]>([]);
    const [stats, setStats] = useState<TeacherStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSchedules = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/v1/teacher/plan-schedules");
            setSchedules(response.data.data || []);
        } catch (error: any) {
            toast.error(
                "فشل في تحميل الخطط: " +
                    (error.response?.data?.message || error.message),
            );
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get(
                "/api/v1/teacher/plan-schedules/stats",
            );
            setStats(response.data);
        } catch (error) {
            console.error("Stats error:", error);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
        fetchStats();
    }, [fetchSchedules, fetchStats]);

    return {
        schedules,
        stats,
        loading,
        refetch: fetchSchedules,
    };
};
