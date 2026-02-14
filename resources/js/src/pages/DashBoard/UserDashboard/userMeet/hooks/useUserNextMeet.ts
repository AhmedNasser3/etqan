// hooks/useUserNextMeet.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface UserMeetData {
    id: number;
    teacher_name: string;
    teacher_image?: string;
    schedule_date: string;
    start_time: string;
    notes: string;
    jitsi_room_name: string;
    jitsi_url: string;
    time_remaining: string;
    plan_name?: string;
    circle_name?: string;
}

export const useUserNextMeet = () => {
    const [meetData, setMeetData] = useState<UserMeetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserNextMeet = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/v1/user/next-meet", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.next_meet) {
                    setMeetData(data.next_meet);
                } else {
                    setMeetData(null);
                }
            } else {
                setError("فشل في تحميل الحصة القادمة");
            }
        } catch (err) {
            setError("خطأ في الاتصال");
        } finally {
            setLoading(false);
        }
    }, []);

    // تحديث كل دقيقة
    useEffect(() => {
        fetchUserNextMeet();
        const interval = setInterval(fetchUserNextMeet, 60000);
        return () => clearInterval(interval);
    }, [fetchUserNextMeet]);

    return { meetData, loading, error, refetch: fetchUserNextMeet };
};
