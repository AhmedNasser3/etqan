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
    repeat_type?: "daily" | "specific_days";
    repeat_days?: string[];
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

    const getCSRFHeaders = useCallback((): Record<string, string> => {
        const token =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";
        setDebugInfo((prev: any) => ({ ...prev, csrfToken: token }));
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": token,
        };
    }, []);

    const fetchPlans = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const headers = getCSRFHeaders();
            const response = await fetch("/api/v1/student/plans", {
                method: "GET",
                credentials: "include",
                headers,
            });

            const responseText = await response.text();
            let data: any;
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error("Invalid JSON response");
            }

            setDebugInfo((prev: any) => ({ ...prev, rawResponse: data }));

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            const typedPlanData: PlanItem[] = Array.isArray(data.data)
                ? data.data.map((item: any) => ({
                      ...item,
                      repeat_type: item.repeat_type ?? "daily",
                      repeat_days: Array.isArray(item.repeat_days)
                          ? item.repeat_days
                          : ["يومياً"],
                  }))
                : [];

            setPlanData(typedPlanData);
            setStats(data.stats || null);
            setDebugInfo((prev: any) => ({
                ...prev,
                rawResponse: data,
                userId: data.user_id || data.user?.id,
            }));
        } catch (error: any) {
            console.error("💥 Fetch Error:", error);
            setPlanData([]);
            setStats(null);
            setDebugInfo((prev: any) => ({ ...prev, error: error.message }));
        } finally {
            setLoading(false);
        }
    }, [getCSRFHeaders]);

    // ✅ 30 يوم فات → 30 يوم قدام
    useEffect(() => {
        const today = new Date();
        const pastDate = new Date(today);
        const futDate = new Date(today);
        pastDate.setDate(today.getDate() - 30);
        futDate.setDate(today.getDate() + 30);
        setDateFrom(pastDate.toISOString().split("T")[0]);
        setDateTo(futDate.toISOString().split("T")[0]);
    }, []);

    useEffect(() => {
        fetchPlans();
    }, []);

    const setDateFromCallback = useCallback(
        (date: string) => setDateFrom(date),
        [],
    );
    const setDateToCallback = useCallback(
        (date: string) => setDateTo(date),
        [],
    );

    return {
        planData,
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
