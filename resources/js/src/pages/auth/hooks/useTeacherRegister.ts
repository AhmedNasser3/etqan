// hooks/useTeacherRegister.ts
import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

interface Circle {
    id: number;
    name: string;
    teacher_id?: number;
}

interface Schedule {
    id: number;
    date: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    duration: string;
    seats_available: number;
    is_full: boolean;
    booked_students: number;
    max_students: number;
}

interface TeacherRegisterData {
    full_name: string;
    role: string;
    email: string;
    notes: string;
    gender: string;
    circle_id?: number;
    schedule_id?: number;
}

export const useTeacherRegister = () => {
    const { centerSlug } = useParams<{ centerSlug: string }>();

    const [data, setData] = useState<TeacherRegisterData>({
        full_name: "",
        role: "",
        email: "",
        notes: "",
        gender: "male",
        circle_id: undefined,
        schedule_id: undefined,
    });

    const [loading, setLoading] = useState(false);
    const [circles, setCircles] = useState<Circle[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [circlesLoading, setCirclesLoading] = useState(false);
    const [schedulesLoading, setSchedulesLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [selectedCircleId, setSelectedCircleId] = useState<number | null>(
        null,
    );

    const formatTimeToArabic = (timeString: string): string => {
        if (!timeString || timeString === "NULL") return "غير محدد";

        let time = timeString.trim();
        const timeMatch = time.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);

        if (!timeMatch) {
            return timeString;
        }

        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);

        const period = hours >= 12 ? "م" : "ص";
        let displayHours = hours % 12;
        if (displayHours === 0) displayHours = 12;

        return `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
    };

    const formatCircleWithTime = (circle: Circle): string => {
        if (schedules.length === 0 || !data.schedule_id) {
            return circle.name;
        }

        const selectedSchedule = schedules.find(
            (s) => s.id === data.schedule_id,
        );
        if (!selectedSchedule) return circle.name;

        const startTime = formatTimeToArabic(selectedSchedule.start_time);
        const endTime = formatTimeToArabic(selectedSchedule.end_time);
        const timeText = `من ${startTime} إلى ${endTime}`;
        return `${circle.name} | ${timeText}`;
    };

    const fetchCircles = useCallback(async () => {
        if (!centerSlug) return;

        setCirclesLoading(true);
        try {
            const response = await fetch(
                `/api/v1/teacher/register/centers/${centerSlug}/circles`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            if (result.success && Array.isArray(result.circles)) {
                setCircles(result.circles);
            }
        } catch (err) {
            console.error("Circles Error:", err);
            setCircles([]);
        } finally {
            setCirclesLoading(false);
        }
    }, [centerSlug]);

    const fetchSchedules = useCallback(
        async (circleId: number) => {
            if (!centerSlug || !circleId) {
                setSchedules([]);
                return;
            }

            setSchedulesLoading(true);
            setSchedules([]);

            try {
                const response = await fetch(
                    `/api/v1/teacher/register/centers/${centerSlug}/circles/${circleId}/schedules`,
                    {
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    },
                );

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const result = await response.json();

                if (
                    result.success &&
                    Array.isArray(result.available_schedules)
                ) {
                    const formattedSchedules = result.available_schedules.map(
                        (schedule: any) => ({
                            ...schedule,
                            start_time_ar: formatTimeToArabic(
                                schedule.start_time,
                            ),
                            end_time_ar: formatTimeToArabic(schedule.end_time),
                        }),
                    );
                    setSchedules(formattedSchedules as Schedule[]);
                } else {
                    setSchedules([]);
                }
            } catch (err: any) {
                console.error("fetchSchedules ERROR:", err);
                setSchedules([]);
            } finally {
                setSchedulesLoading(false);
            }
        },
        [centerSlug],
    );

    const handleCircleChange = useCallback(
        (circleId: number | undefined) => {
            setSelectedCircleId(circleId ? Number(circleId) : null);
            setData((prev) => ({
                ...prev,
                circle_id: circleId ? Number(circleId) : undefined,
                schedule_id: undefined,
            }));
            setSchedules([]);

            if (circleId && centerSlug) {
                fetchSchedules(Number(circleId));
            }
        },
        [fetchSchedules, centerSlug],
    );

    const handleScheduleChange = useCallback(
        (scheduleId: number | undefined) => {
            setData((prev) => ({
                ...prev,
                schedule_id: scheduleId ? Number(scheduleId) : undefined,
            }));
        },
        [],
    );

    const handleInputChange = useCallback(
        (
            field: keyof TeacherRegisterData,
            value: string | number | undefined,
        ) => {
            setData((prev) => ({ ...prev, [field]: value }));
            if (error) setError("");
        },
        [error],
    );

    const setGender = useCallback((gender: string) => {
        setData((prev) => ({ ...prev, gender }));
    }, []);

    const submitRegister = useCallback(async () => {
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const requestData = { ...data, center_slug: centerSlug || null };
            const response = await fetch("/api/v1/teacher/register", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSuccess(true);
                toast.success(
                    `تم التسجيل بنجاح في ${centerSlug || "النظام العام"}!`,
                );
                setData({
                    full_name: "",
                    role: "",
                    email: "",
                    notes: "",
                    gender: "male",
                    circle_id: undefined,
                    schedule_id: undefined,
                });
                setCircles([]);
                setSchedules([]);
                setSelectedCircleId(null);
            } else {
                const errorMsg = Array.isArray(result.message)
                    ? Object.values(result.message)[0]?.[0]
                    : result.message;
                setError(errorMsg as string);
            }
        } catch (err: any) {
            setError("فشل في الاتصال");
        } finally {
            setLoading(false);
        }
    }, [data, centerSlug, error]);

    useEffect(() => {
        if (centerSlug) fetchCircles();
    }, [centerSlug, fetchCircles]);

    return {
        data,
        circles,
        schedules,
        selectedCircleId,
        centerSlug,
        loading,
        circlesLoading,
        schedulesLoading,
        success,
        error,
        handleInputChange,
        setGender,
        handleCircleChange,
        handleScheduleChange,
        submitRegister,
        formatTimeToArabic,
        formatCircleWithTime,
    };
};
