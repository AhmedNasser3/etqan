import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export interface PlanDetailType {
    id: number;
    day_number: number;
    new_memorization: string | null;
    review_memorization: string | null;
    status: "pending" | "current" | "completed";
    created_at: string;
    updated_at: string;
    plan_id?: number; // ✅ إضافة plan_id
    plan?: { id: number; plan_name: string }; // ✅ للـ allMyCenterPlansDetails
}

interface Pagination {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

// ✅ Hook يدعم الـ 2 حالات
export const usePlanDetails = (planId?: number) => {
    const [details, setDetails] = useState<PlanDetailType[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    console.log("🔍 [usePlanDetails] Initial render - planId:", planId);

    const fetchDetails = useCallback(
        async (pageNum: number = 1) => {
            console.log(
                "🚀 [fetchDetails] START - planId:",
                planId,
                "page:",
                pageNum,
            );
            setLoading(true);
            setDetails([]);

            try {
                // ✅ دعم الـ 2 URLs
                const url = planId
                    ? `/api/v1/plans/${planId}/details?page=${pageNum}`
                    : `/api/v1/plans/details?page=${pageNum}`;

                console.log("🌐 [fetchDetails] API URL:", url);
                console.log("📤 [fetchDetails] Sending request...");

                const response = await fetch(url, {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                });

                console.log("📡 [fetchDetails] Response:", {
                    status: response.status,
                    ok: response.ok,
                });

                if (!response.ok) {
                    console.error(
                        "❌ [fetchDetails] HTTP ERROR:",
                        response.status,
                    );
                    if (response.status === 404 || response.status === 403) {
                        console.log(
                            "🔒 [fetchDetails] Auth error - empty state",
                        );
                        toast("الخطة غير متاحة لمجمعك");
                    }

                    setDetails([]);
                    setPagination({
                        current_page: 1,
                        last_page: 1,
                        total: 0,
                        per_page: 30,
                    });
                    console.log("📭 [fetchDetails] Set empty state");
                    return;
                }

                console.log("✅ [fetchDetails] Parsing JSON...");
                const data = await response.json();
                console.log("📦 [fetchDetails] Raw response:", data);

                const safeData = Array.isArray(data.data) ? data.data : [];
                console.log(
                    "📋 [fetchDetails] Safe data:",
                    safeData.length,
                    "items",
                );

                const safePagination: Pagination = {
                    current_page: data.current_page || 1,
                    last_page: data.last_page || 1,
                    total: data.total || safeData.length,
                    per_page: data.per_page || 30,
                };
                console.log("📊 [fetchDetails] Pagination:", safePagination);

                setDetails(safeData);
                setPagination(safePagination);
                setCurrentPage(safePagination.current_page || 1);
                console.log("✅ [fetchDetails] State updated!");
            } catch (error: any) {
                console.error("💥 [fetchDetails] NETWORK ERROR:", error);
                setDetails([]);
                setPagination({
                    current_page: 1,
                    last_page: 1,
                    total: 0,
                    per_page: 30,
                });
            } finally {
                console.log("🏁 [fetchDetails] END - loading=false");
                setLoading(false);
            }
        },
        [planId],
    );

    useEffect(() => {
        console.log("🔄 [useEffect] planId:", planId);
        if (planId !== undefined) {
            fetchDetails(1);
        }
    }, [planId, fetchDetails]);

    const isEmpty = useMemo(() => {
        const result = details.length === 0 && !loading;
        console.log("📊 [isEmpty]:", result);
        return result;
    }, [details.length, loading]);

    const stats = useMemo(() => {
        const total = pagination?.total || 0;
        const completed = details.filter(
            (d) => d.status === "completed",
        ).length;
        const current = details.filter((d) => d.status === "current").length;
        const pending = details.filter((d) => d.status === "pending").length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        const result = { total, completed, current, pending, progress };
        console.log("📈 [stats]:", result);
        return result;
    }, [details, pagination]);

    console.log("🔍 [Return]:", { details: details.length, loading, isEmpty });

    return {
        details,
        loading,
        pagination,
        currentPage,
        goToPage: fetchDetails,
        refetch: () => fetchDetails(currentPage),
        isEmpty,
        stats,
    };
};
