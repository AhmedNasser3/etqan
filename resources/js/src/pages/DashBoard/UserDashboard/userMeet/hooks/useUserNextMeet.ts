// hooks/useUserNextMeet.ts
import { useState, useEffect, useCallback } from "react";

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
    circle_name?: string;
    is_available: boolean;
}

export const useUserNextMeet = () => {
    const [meetData, setMeetData] = useState<UserMeetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🔍 DEBUG 1: CSRF Headers
    const getCSRFHeaders = useCallback(() => {
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        const token = tokenElement?.getAttribute("content") || "";

        console.log("🔍 [DEBUG 1] CSRF Token Element:", !!tokenElement);
        console.log(
            "🔍 [DEBUG 1] CSRF Token Value:",
            token ? `${token.substring(0, 20)}...` : "EMPTY",
        );

        const headers = {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": token,
            "Content-Type": "application/json",
        };

        console.log("🔍 [DEBUG 1] Final Headers:", headers);
        return headers;
    }, []);

    // 🔍 DEBUG 2: CSRF Refresh
    const refreshCSRFToken = useCallback(async () => {
        console.log("🔄 [DEBUG 2] Starting CSRF refresh...");

        try {
            const response = await fetch("/sanctum/csrf-cookie", {
                method: "GET",
                credentials: "include",
            });

            console.log("🔄 [DEBUG 2] CSRF Response status:", response.status);
            console.log("🔄 [DEBUG 2] CSRF Response headers:", [
                ...response.headers.keys(),
            ]);

            if (response.ok) {
                console.log("✅ [DEBUG 2] CSRF token refreshed successfully");
            } else {
                console.warn(
                    "⚠️ [DEBUG 2] CSRF refresh failed but continuing...",
                );
            }
        } catch (err) {
            console.error("❌ [DEBUG 2] CSRF refresh error:", err);
        }
    }, []);

    // 🔥 DEBUG 3: Main Fetch مع كل التفاصيل
    const fetchUserNextMeet = useCallback(async () => {
        console.log("🚀 [DEBUG 3] === FETCH START ===");

        try {
            setLoading(true);
            setError(null);
            console.log("🔍 [DEBUG 3.1] Loading: true, Error: cleared");

            // Step 1: Refresh CSRF
            console.log("🔍 [DEBUG 3.2] Step 1: Refreshing CSRF...");
            await refreshCSRFToken();
            await new Promise((resolve) => setTimeout(resolve, 200)); // Wait for cookie
            console.log("✅ [DEBUG 3.2] Step 1: CSRF refresh complete");

            // Step 2: Prepare request
            console.log("🔍 [DEBUG 3.3] Step 2: Getting headers...");
            const headers = getCSRFHeaders();
            console.log("✅ [DEBUG 3.3] Step 2: Headers ready");

            // Step 3: Full URL log
            const fullUrl = new URL(
                "/api/v1/user/next-meet",
                window.location.origin,
            ).href;
            console.log("🔍 [DEBUG 3.4] Step 3: Full URL:", fullUrl);

            // Step 4: Send request
            console.log("🔍 [DEBUG 3.5] Step 4: Sending fetch...");
            const response = await fetch("/api/v1/user/next-meet", {
                method: "GET",
                credentials: "include",
                headers: headers,
            });

            // Step 5: Response analysis
            console.log("🔍 [DEBUG 3.6] Step 5: Response received:");
            console.log("   Status:", response.status);
            console.log("   StatusText:", response.statusText);
            console.log("   OK:", response.ok);

            const contentType = response.headers.get("content-type");
            console.log("   Content-Type:", contentType);
            console.log("   All headers:", [...response.headers.entries()]);

            // Step 6: Check content type
            if (!contentType?.includes("application/json")) {
                const textResponse = await response.text();
                console.error(
                    "❌ [DEBUG 3.7] HTML Response (Not JSON):",
                    textResponse.substring(0, 500) + "...",
                );
                throw new Error(
                    "السيرفر أرجع HTML بدلاً من JSON - تحقق من الـ Route",
                );
            }

            console.log("✅ [DEBUG 3.7] Step 6: JSON content confirmed");

            // Step 7: Check HTTP status
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ [DEBUG 3.8] HTTP Error Details:", {
                    status: response.status,
                    statusText: response.statusText,
                    responseText: errorText.substring(0, 300),
                });
                throw new Error(
                    `HTTP ${response.status}: ${errorText.substring(0, 100)}`,
                );
            }

            console.log("✅ [DEBUG 3.8] Step 7: HTTP 200 OK");

            // Step 8: Parse JSON
            const data = await response.json();
            console.log("✅ [DEBUG 3.9] Step 8: JSON parsed:", {
                success: data.success,
                has_next_meet: !!data.next_meet,
                message: data.message,
                debug_user_id: data.debug?.user_id,
            });

            // Step 9: Process data
            if (data.success && data.next_meet) {
                console.log("🎉 [DEBUG 3.10] Step 9: Meet found!", {
                    id: data.next_meet.id,
                    teacher: data.next_meet.teacher_name,
                    room: data.next_meet.jitsi_room_name,
                });
                setMeetData(data.next_meet);
            } else {
                console.log(
                    "ℹ️ [DEBUG 3.10] Step 9: No meet data:",
                    data.message,
                );
                setMeetData(null);
            }

            console.log("🚀 [DEBUG 3] === FETCH SUCCESS ===");
        } catch (err: any) {
            console.error("💥 [DEBUG 3] === FETCH ERROR ===", {
                message: err.message,
                stack: err.stack,
                name: err.name,
            });
            setError(err.message || "خطأ غير معروف");
            setMeetData(null);
        } finally {
            setLoading(false);
            console.log("🔍 [DEBUG 3] Loading set to false");
        }
    }, [getCSRFHeaders, refreshCSRFToken]);

    // 🔥 DEBUG 4: Initial load
    useEffect(() => {
        console.log("🔥 [DEBUG 4] Component mounted - Starting first fetch");
        refreshCSRFToken().then(() => {
            console.log("🔥 [DEBUG 4] CSRF ready - Calling fetchUserNextMeet");
            fetchUserNextMeet();
        });
    }, []);

    // 🔥 DEBUG 5: Auto refresh every minute
    useEffect(() => {
        console.log("🔥 [DEBUG 5] Setting up 1-minute interval");
        const interval = setInterval(() => {
            console.log("🔥 [DEBUG 5] Interval tick - Refetching...");
            fetchUserNextMeet();
        }, 60000);
        return () => {
            console.log("🔥 [DEBUG 5] Clearing interval");
            clearInterval(interval);
        };
    }, [fetchUserNextMeet]);

    // 🔥 DEBUG 6: State watcher
    useEffect(() => {
        console.log("🔍 [DEBUG 6] State changed:", {
            loading,
            hasError: !!error,
            hasData: !!meetData,
            dataId: meetData?.id,
        });
    }, [loading, error, meetData]);

    return {
        meetData,
        loading,
        error,
        refetch: fetchUserNextMeet,
    };
};
