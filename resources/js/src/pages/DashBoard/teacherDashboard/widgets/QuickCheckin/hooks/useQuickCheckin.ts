// hooks/useQuickCheckin.ts - محدَّث لدعم سبب التأخير

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface CheckinData {
    status: "present" | "late" | "absent";
    time?: string;
    notes?: string;
    date?: string;
    delay_minutes?: number;
}

interface UseQuickCheckinReturn {
    isTodayChecked: boolean;
    isLoading: boolean;
    isDisabled: boolean;
    message: string;
    checkinTime: string;
    todayStatus: string;
    error: string;
    requiresReason: boolean;
    delayMinutes: number;
    workStartTime: string;
    quickCheckin: (lateReason?: string) => Promise<void>;
    resetError: () => void;
}

export const useQuickCheckin = (): UseQuickCheckinReturn => {
    const [isTodayChecked, setIsTodayChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [checkinTime, setCheckinTime] = useState("");
    const [todayStatus, setTodayStatus] = useState("");
    const [error, setError] = useState("");
    const [requiresReason, setRequiresReason] = useState(false);
    const [delayMinutes, setDelayMinutes] = useState(0);
    const [workStartTime, setWorkStartTime] = useState("");

    const isDisabled = isTodayChecked || isLoading;

    const checkToday = useCallback(async () => {
        try {
            const res = await axios.get("/api/v1/attendance/today");
            if (res.data?.has_attendance) {
                setIsTodayChecked(true);
                const first = res.data.data?.[0];
                if (first) {
                    setCheckinTime(first.checkin_time ?? "");
                    setTodayStatus(
                        first.status === "late"
                            ? `متأخر ${first.delay_minutes} دقيقة`
                            : "حاضر",
                    );
                }
            }
        } catch {
            // لو فشل التحقق: الزر يبقى مفتوح
        }
    }, []);

    useEffect(() => {
        checkToday();
    }, [checkToday]);

    const quickCheckin = useCallback(async (lateReason?: string) => {
        setIsLoading(true);
        setError("");
        setRequiresReason(false);

        try {
            const payload: Record<string, string> = {};
            if (lateReason) payload.late_reason = lateReason;

            const res = await axios.post(
                "/api/v1/attendance/quick-checkin",
                payload,
            );

            if (res.data.success) {
                setIsTodayChecked(true);
                setMessage(res.data.message ?? "تم التسجيل بنجاح");
                setCheckinTime(res.data.data?.checkin_time ?? "");
                setTodayStatus(
                    res.data.data?.status === "late"
                        ? `متأخر ${res.data.data.delay_minutes} دقيقة`
                        : "حاضر",
                );
            }
        } catch (err: any) {
            const data = err?.response?.data;
            if (data?.requires_reason) {
                // محتاج سبب التأخير
                setRequiresReason(true);
                setDelayMinutes(data.delay_minutes ?? 0);
                setWorkStartTime(data.work_start_time ?? "");
                setError(data.message ?? "يرجى إدخال سبب التأخير");
            } else {
                setError(data?.message ?? "فشل في تسجيل الحضور");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const resetError = useCallback(() => {
        setError("");
        setRequiresReason(false);
    }, []);

    return {
        isTodayChecked,
        isLoading,
        isDisabled,
        message,
        checkinTime,
        todayStatus,
        error,
        requiresReason,
        delayMinutes,
        workStartTime,
        quickCheckin,
        resetError,
    };
};
