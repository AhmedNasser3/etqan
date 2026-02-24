// hooks/useQuickCheckin.ts - DEBUG MODE كامل
import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";

interface CheckinStatus {
    isTodayChecked: boolean;
    isLoading: boolean;
    isDisabled: boolean;
    todayStatus?: string;
    message: string;
    checkinTime?: string;
    error?: string;
}

const apiClient = axios.create({
    withCredentials: true,
    baseURL: "/api",
});

export const useQuickCheckin = () => {
    const [status, setStatus] = useState<CheckinStatus>({
        isTodayChecked: false,
        isLoading: false,
        isDisabled: false,
        message: "🔍 جاري التحقق...",
        error: "",
    });

    // 🔍 DEBUG 1: CSRF Token Setup
    useEffect(() => {
        console.log("🚀 [DEBUG 1] Starting CSRF setup...");
        const setupCSRF = async () => {
            try {
                const csrfResponse = await apiClient.get(
                    "/sanctum/csrf-cookie",
                );
                console.log(
                    "✅ [DEBUG 1] CSRF Response:",
                    csrfResponse.status,
                    csrfResponse.data,
                );
            } catch (error: any) {
                console.error(
                    "❌ [DEBUG 1] CSRF Error:",
                    error.response?.status,
                    error.response?.data,
                );
            }
        };
        setupCSRF();
    }, []);

    // 🔍 DEBUG 2: Check Today Status
    const checkTodayStatus = useCallback(async () => {
        console.log("🔍 [DEBUG 2] checkTodayStatus called");
        try {
            console.log("📡 [DEBUG 2.1] GET /v1/attendance/today...");
            const response = await apiClient.get("/v1/attendance/today");
            console.log("📡 [DEBUG 2.2] Response:", {
                success: response.data?.success,
                dataLength: response.data?.data?.length,
                data: response.data?.data,
                fullResponse: response.data,
            });

            if (response.data?.success && Array.isArray(response.data.data)) {
                const todayAttendance = response.data.data;
                console.log(
                    "📋 [DEBUG 2.3] Today attendance count:",
                    todayAttendance.length,
                );

                if (todayAttendance.length > 0) {
                    const attendance = todayAttendance[0];
                    console.log("📋 [DEBUG 2.4] First record:", {
                        id: attendance.id,
                        date: attendance.date,
                        status: attendance.status,
                        created_at: attendance.created_at,
                    });

                    const todayDate = new Date().toISOString().split("T")[0];
                    console.log(
                        "📅 [DEBUG 2.5] Today date:",
                        todayDate,
                        "Record date:",
                        attendance.date,
                    );

                    if (attendance.date === todayDate) {
                        const timeString =
                            attendance.created_at?.split(" ")[1]?.slice(0, 5) ||
                            "--:--";
                        console.log(
                            "✅ [DEBUG 2.6] Attendance found! Status:",
                            attendance.status,
                            "Time:",
                            timeString,
                        );

                        setStatus((prev) => ({
                            ...prev,
                            isTodayChecked: true,
                            isDisabled: true,
                            todayStatus: attendance.status || "",
                            checkinTime: timeString,
                            message: "✅ تم الحضور اليوم",
                            error: "",
                        }));
                        return;
                    } else {
                        console.log(
                            "ℹ️ [DEBUG 2.7] Old date - ready for checkin",
                        );
                    }
                } else {
                    console.log(
                        "ℹ️ [DEBUG 2.8] No attendance today - button ready",
                    );
                }
            }

            setStatus((prev) => ({
                ...prev,
                isTodayChecked: false,
                isDisabled: false,
                message: "اضغط لتسجيل الحضور اليوم 📍",
                error: "",
            }));
        } catch (error: any) {
            console.error("❌ [DEBUG 2.9] checkTodayStatus ERROR:", {
                status: error.response?.status,
                message: error.response?.data?.message,
                url: error.config?.url,
            });

            setStatus((prev) => ({
                ...prev,
                isTodayChecked: false,
                isDisabled: false,
                message: "اضغط لتسجيل الحضور اليوم 📍",
                error: "",
            }));
        }
    }, []);

    // 🔍 DEBUG 3: Quick Checkin - كل خطوة
    const quickCheckin = useCallback(async () => {
        console.log("🚀 [DEBUG 3] quickCheckin START - Status:", status);

        if (status.isLoading || status.isDisabled) {
            console.log("⏹️ [DEBUG 3.1] Blocked - loading/disabled");
            return;
        }

        setStatus((prev) => ({
            ...prev,
            isLoading: true,
            error: "",
            message: "⏳ جاري التسجيل...",
        }));

        try {
            console.log("📤 [DEBUG 3.2] POST /v1/attendance/quick-checkin...");
            console.log("🔐 [DEBUG 3.3] Request headers:", {
                withCredentials: true,
                cookies: document.cookie,
            });

            const response = await apiClient.post(
                "/v1/attendance/quick-checkin",
            );

            console.log("📥 [DEBUG 3.4] Response FULL:", response);
            console.log("📥 [DEBUG 3.5] Response data:", {
                success: response.data.success,
                message: response.data.message,
                status: response.data.status,
                data: response.data.data,
            });

            if (response.data.success) {
                console.log(
                    "🎉 [DEBUG 3.6] SUCCESS! New status:",
                    response.data.status,
                );
                setStatus({
                    isTodayChecked: true,
                    isLoading: false,
                    isDisabled: true,
                    todayStatus: response.data.status || "",
                    checkinTime: response.data.checkin_time || "",
                    message: response.data.message || "✅ تم الحضور",
                    error: "",
                });
            } else {
                console.log(
                    "⚠️ [DEBUG 3.7] API success=false:",
                    response.data.message,
                );
                setStatus((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: `⚠️ ${response.data.message || "فشل غير معروف"}`,
                }));
            }
        } catch (error: any) {
            console.error("💥 [DEBUG 3.8] CATCH ERROR:", error);
            const axiosError = error as AxiosError;
            const errorResponse = axiosError.response?.data;

            console.error("💥 [DEBUG 3.9] Error details:", {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                message: errorResponse?.message,
                fullData: errorResponse,
                url: axiosError.config?.url,
                method: axiosError.config?.method,
            });

            if (axiosError.response?.status === 409) {
                console.log("✅ [DEBUG 3.10] Already checked today");
                setStatus((prev) => ({
                    ...prev,
                    isTodayChecked: true,
                    isLoading: false,
                    isDisabled: true,
                    message: "✅ تم تسجيل الحضور اليوم",
                    error: "",
                }));
            } else if (
                errorResponse?.message === "لم يتم العثور على بيانات المعلم"
            ) {
                console.log(
                    "👤 [DEBUG 3.11] Teacher not found - CHECK DATABASE",
                );
                setStatus((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: "⚠️ بيانات المعلم غير موجودة في قاعدة البيانات",
                    isDisabled: true,
                }));
            } else {
                console.log("❓ [DEBUG 3.12] Unknown error");
                setStatus((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: `⚠️ ${errorResponse?.message || "خطأ غير معروف"} (${axiosError.response?.status})`,
                }));
            }
        }
    }, []);

    // 🔍 DEBUG 4: Auto refresh
    useEffect(() => {
        console.log("🔄 [DEBUG 4] Starting auto-refresh...");
        const timer = setTimeout(() => checkTodayStatus(), 1500);
        const interval = setInterval(() => checkTodayStatus(), 30000);
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [checkTodayStatus]);

    return {
        ...status,
        quickCheckin,
        checkTodayStatus,
    };
};
