// hooks/useTeacherTodayMeet.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface TeacherMeetData {
    id: number;
    student_name: string;
    student_image?: string;
    schedule_date: string;
    start_time: string;
    notes: string;
    jitsi_room_name: string;
    jitsi_url: string;
    time_remaining: string;
    plan_name?: string;
    circle_name?: string;
}

export const useTeacherTodayMeet = () => {
    const [meetData, setMeetData] = useState<TeacherMeetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTeacherTodayMeet = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/v1/teachers/today-meet", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.today_meet) {
                    setMeetData(data.today_meet);
                } else {
                    setMeetData(null);
                }
            }
        } catch (err) {
            setError("فشل في تحميل حصة اليوم");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeacherTodayMeet();
        const interval = setInterval(fetchTeacherTodayMeet, 60000);
        return () => clearInterval(interval);
    }, [fetchTeacherTodayMeet]);

    return { meetData, loading, error, refetch: fetchTeacherTodayMeet };
};
