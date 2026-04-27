import { useState, useCallback, useEffect } from "react";

interface PlanItem {
    id: number;
    date: string;
    day: string;
    hifz: string;
    review: string;
    status: "completed" | "pending" | "retry" | "active";
    session_time?: string;
    day_number: number;
    booking_id: number;
}

interface PlanStats {
    total_days: number;
    completed_days: number;
    progress_percentage: number;
    today_goal: {
        hifz: string;
        review: string;
    } | null;
    points: string;
}

interface UseStudentPlansReturn {
    planData: PlanItem[];
    stats: PlanStats | null;
    loading: boolean;
    dateFrom: string;
    dateTo: string;
    setDateFrom: (date: string) => void;
    setDateTo: (date: string) => void;
    refetch: () => void;
    debugInfo: {
        rawResponse: any;
        csrfToken: string;
        apiUrl: string;
        userId?: number;
    };
}

export const useStudentPlans = (): UseStudentPlansReturn => {
    const [planData, setPlanData] = useState<PlanItem[]>([]);
    const [stats, setStats] = useState<PlanStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [debugInfo, setDebugInfo] = useState<any>({
        rawResponse: null,
        csrfToken: "",
        apiUrl: "/api/v1/student/plans",
        userId: undefined,
    });

    // 🔥 DEBUG 1: CSRF Headers مع Log
    const getCSRFHeaders = useCallback((): Record<string, string> => {
        const token =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": token,
        };

        console.log("🔍 [DEBUG] CSRF Headers:", {
            token: token ? " Found" : "❌ Missing",
            headers,
        });
        setDebugInfo((prev) => ({ ...prev, csrfToken: token }));

        return headers;
    }, []);

    // 🔥 DEBUG 2: Fetch Plans مع Logs كاملة
    const fetchPlans = useCallback(async (): Promise<void> => {
        console.log("🚀 [DEBUG] Starting fetchPlans()");
        setLoading(true);

        try {
            const headers = getCSRFHeaders();
            const apiUrl = "/api/v1/student/plans";

            console.log("🌐 [DEBUG] Fetching URL:", apiUrl);
            console.log("📋 [DEBUG] Headers prepared:", headers);

            const response = await fetch(apiUrl, {
                method: "GET",
                credentials: "include",
                headers,
            });

            console.log("📡 [DEBUG] Response status:", response.status);
            console.log("📡 [DEBUG] Response ok:", response.ok);

            const responseText = await response.text();
            console.log("📄 [DEBUG] Raw response text:", responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error("❌ [DEBUG] JSON Parse Error:", parseError);
                throw new Error("Invalid JSON response");
            }

            console.log(" [DEBUG] Parsed data:", data);
            setDebugInfo((prev) => ({ ...prev, rawResponse: data }));

            if (!response.ok) {
                console.error(
                    "❌ [DEBUG] HTTP Error:",
                    data.message || `HTTP ${response.status}`,
                );
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            // 🔥 DEBUG 3: Response Structure
            console.log("📊 [DEBUG] Response structure:", {
                hasSuccess: !!data.success,
                dataLength: data.data?.length || 0,
                stats: data.stats,
                userId: data.user_id,
            });

            // 🔥 Type assertion + Fallback
            const typedPlanData: PlanItem[] = Array.isArray(data.data)
                ? data.data
                : [];
            console.log("📈 [DEBUG] Processed planData:", typedPlanData);

            setPlanData(typedPlanData);
            setStats(data.stats || null);

            setDebugInfo((prev) => ({
                ...prev,
                rawResponse: data,
                userId: data.user_id || data.user?.id,
            }));
        } catch (error: any) {
            console.error("💥 [DEBUG] Fetch Error:", error);
            console.error("💥 [DEBUG] Error stack:", error.stack);

            setPlanData([]);
            setStats(null);
            setDebugInfo((prev) => ({
                ...prev,
                error: error.message,
            }));
        } finally {
            setLoading(false);
            console.log("🏁 [DEBUG] fetchPlans() finished, loading:", false);
        }
    }, [getCSRFHeaders]);

    // 🔥 DEBUG 4: Filter مع Logs
    const filterPlansByDate = useCallback(() => {
        console.log("🔄 [DEBUG] Filtering plans:", {
            planDataLength: planData.length,
            dateFrom,
            dateTo,
        });

        if (planData.length === 0) {
            console.log("⏭️ [DEBUG] Skipping filter - no data");
            return;
        }

        const filtered = planData.filter(
            (item) => item.date >= dateFrom && item.date <= dateTo,
        );

        console.log("🔍 [DEBUG] Filter result:", filtered.length, "items");
        // Note: removed filteredData state - return filtered directly
    }, [planData, dateFrom, dateTo]);

    // 🔥 DEBUG 5: Initial dates setup
    useEffect(() => {
        console.log("📅 [DEBUG] Setting up initial dates");
        const today = new Date();
        const sevenDaysAgo = new Date(
            today.getTime() - 7 * 24 * 60 * 60 * 1000,
        );

        const fromDate = sevenDaysAgo.toISOString().split("T")[0];
        const toDate = today.toISOString().split("T")[0];

        console.log("📅 [DEBUG] Dates calculated:", { fromDate, toDate });

        setDateFrom(fromDate);
        setDateTo(toDate);
    }, []);

    // 🔥 DEBUG 6: Fetch on mount
    useEffect(() => {
        console.log("⚡ [DEBUG] Component mounted - starting fetch");
        fetchPlans();
    }, []);

    // 🔥 DEBUG 7: Filter on date change
    useEffect(() => {
        if (dateFrom && dateTo) {
            console.log("📊 [DEBUG] Dates changed - filtering:", {
                dateFrom,
                dateTo,
            });
            filterPlansByDate();
        }
    }, [dateFrom, dateTo, filterPlansByDate]);

    const setDateFromCallback = useCallback((date: string) => {
        console.log("📅 [DEBUG] setDateFrom called:", date);
        setDateFrom(date);
    }, []);

    const setDateToCallback = useCallback((date: string) => {
        console.log("📅 [DEBUG] setDateTo called:", date);
        setDateTo(date);
    }, []);

    // 🔥 DEBUG 8: Final return values
    console.log("📋 [DEBUG] Hook return values:", {
        planDataLength: planData.length,
        stats,
        loading,
        dateFrom,
        dateTo,
    });

    return {
        planData, //  return raw planData (filtered in component if needed)
        stats,
        loading,
        dateFrom,
        dateTo,
        setDateFrom: setDateFromCallback,
        setDateTo: setDateToCallback,
        refetch: fetchPlans,
        debugInfo,
    };
};
