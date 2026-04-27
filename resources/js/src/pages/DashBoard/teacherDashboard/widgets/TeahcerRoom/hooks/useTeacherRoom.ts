// hooks/useTeacherRoom.ts - Hook لتحميل رابط Jitsi تلقائياً
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface JitsiRoomData {
    jitsi_room_name: string;
    jitsi_url?: string;
    schedule_id?: number;
}

export const useTeacherRoom = (scheduleId?: number) => {
    const [roomUrl, setRoomUrl] = useState<string>("");
    const [loadingRoom, setLoadingRoom] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRoomUrl = useCallback(async (id: number) => {
        if (!id) return;

        console.log("🔍 [TEACHER ROOM] Fetching Jitsi room for schedule:", id);

        try {
            setLoadingRoom(true);
            setError(null);

            const response = await fetch(`/api/v1/plans/schedules/${id}`, {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("📋 [TEACHER ROOM] Schedule data:", data);

                // استخراج room name من البيانات
                const roomName =
                    data.jitsi_room_name ||
                    data.room_name ||
                    `halaqa-teacher-${id}`;

                // بناء الـ URL الكامل
                const fullUrl =
                    data.jitsi_url || `https://meet.jit.si/${roomName}`;

                console.log(" [TEACHER ROOM] Room URL ready:", fullUrl);
                setRoomUrl(fullUrl);
                return fullUrl;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "فشل في تحميل الرابط";
            console.error("❌ [TEACHER ROOM ERROR]:", err);
            setError(errorMsg);
            toast.error(`فشل في تحميل غرفة الحصة: ${errorMsg}`);
        } finally {
            setLoadingRoom(false);
        }
    }, []);

    // تحميل تلقائي عند تغيير scheduleId
    useEffect(() => {
        if (scheduleId) {
            fetchRoomUrl(scheduleId);
        }
    }, [scheduleId, fetchRoomUrl]);

    return {
        roomUrl,
        loadingRoom,
        error,
        refetch: fetchRoomUrl,
        isReady: !!roomUrl && !loadingRoom && !error,
    };
};
