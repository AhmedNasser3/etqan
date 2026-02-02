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
}

interface Pagination {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export const usePlanDetails = (planId: number) => {
    const [details, setDetails] = useState<PlanDetailType[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // ✅ Safe fetch function مع error handling كامل
    const fetchDetails = useCallback(
        async (pageNum: number = 1) => {
            // ✅ Valid planId check
            if (!planId || planId <= 0) {
                setError("معرف الخطة غير صحيح");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    page: pageNum.toString(),
                });

                console.log(
                    `🔄 Fetching plan ${planId} details - page ${pageNum}`,
                );

                const response = await fetch(
                    `/api/v1/plans/${planId}/details?${params.toString()}`,
                    {
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    },
                );

                // ✅ Check response before parsing JSON
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("❌ API Error:", response.status, errorText);

                    let errorMessage = "حدث خطأ في الخادم";
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage =
                            errorData.message ||
                            errorData.error ||
                            errorMessage;
                    } catch {
                        // Keep generic message if JSON parsing fails
                    }

                    setError(errorMessage);
                    toast.error(errorMessage);
                    return;
                }

                const contentType = response.headers.get("content-type");
                if (!contentType?.includes("application/json")) {
                    throw new Error("الاستجابة ليست بتنسيق JSON");
                }

                const data = await response.json();
                console.log("✅ Plan details loaded:", data);

                // ✅ Safe data structure handling
                const safeData = data.data || data || [];
                const safePagination = {
                    current_page:
                        data.current_page || data.meta?.current_page || 1,
                    last_page: data.last_page || data.meta?.last_page || 1,
                    total: data.total || data.meta?.total || 0,
                    per_page: data.per_page || data.meta?.per_page || 15,
                };

                setDetails(Array.isArray(safeData) ? safeData : []);
                setPagination(safePagination);
                setCurrentPage(safePagination.current_page);
            } catch (error: any) {
                console.error("❌ Fetch error:", error);
                const errorMessage = error.message || "فشل في الاتصال بالخادم";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [planId],
    );

    const goToPage = useCallback(
        (pageNum: number) => {
            if (pageNum < 1) return;
            setCurrentPage(pageNum);
            fetchDetails(pageNum);
        },
        [fetchDetails],
    );

    const refetch = useCallback(() => {
        fetchDetails(currentPage);
    }, [fetchDetails, currentPage]);

    // ✅ Initial load - مرة واحدة بس
    useEffect(() => {
        if (planId) {
            fetchDetails(1);
        }
    }, [planId, fetchDetails]);

    // ✅ Clean up effect
    useEffect(() => {
        return () => {
            setError(null);
        };
    }, []);

    // ✅ Memoized values لمنع re-renders غير ضرورية
    const isEmpty = useMemo(
        () => details.length === 0 && !loading,
        [details.length, loading],
    );
    const hasPagination = useMemo(
        () => !!pagination && pagination.last_page > 1,
        [pagination],
    );

    return {
        details,
        loading,
        error, // ✅ Error state جديد
        pagination,
        currentPage,
        goToPage,
        refetch,
        isEmpty, // ✅ للـ empty state
        hasPagination, // ✅ للـ pagination
    };
};
