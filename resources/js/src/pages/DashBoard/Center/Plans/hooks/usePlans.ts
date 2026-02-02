import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

export interface PlanType {
    id: number;
    plan_name: string;
    total_months: number;
    center: { id: number; name: string };
    center_id: number;
    details_count: number;
    current_day?: number;
    created_at: string;
    updated_at: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

export const usePlans = () => {
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // ✅ الحل النهائي - number | null (للـ browser)
    const searchTimeoutRef = useRef<number | null>(null);

    const fetchPlans = useCallback(
        async (pageNum: number = 1, search: string = "") => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: pageNum.toString(),
                });
                if (search.trim()) params.append("search", search.trim());

                const response = await fetch(
                    `/api/v1/plans?${params.toString()}`,
                    {
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    toast.error(errorData.message || "حدث خطأ");
                    return;
                }

                const data = await response.json();
                console.log("✅ Plans loaded:", data);

                setPlans(data.data || []);
                setPagination({
                    current_page: data.current_page || 1,
                    last_page: data.last_page || 1,
                    total: data.total || 0,
                    per_page: data.per_page || 15,
                    from: data.from || null,
                    to: data.to || null,
                });
            } catch (error) {
                console.error("❌ Error:", error);
                toast.error("فشل في الاتصال");
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const searchPlans = useCallback(
        (term: string) => {
            // Clear previous timeout
            if (searchTimeoutRef.current !== null) {
                window.clearTimeout(searchTimeoutRef.current);
            }

            // Set new timeout
            searchTimeoutRef.current = window.setTimeout(() => {
                setSearchTerm(term);
                setCurrentPage(1);
                fetchPlans(1, term);
            }, 500);
        },
        [fetchPlans],
    );

    const goToPage = useCallback(
        (pageNum: number) => {
            setCurrentPage(pageNum);
            fetchPlans(pageNum, searchTerm);
        },
        [fetchPlans, searchTerm],
    );

    const refetch = useCallback(() => {
        fetchPlans(currentPage, searchTerm);
    }, [fetchPlans, currentPage, searchTerm]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current !== null) {
                window.clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Initial load
    useEffect(() => {
        fetchPlans(1, "");
    }, [fetchPlans]);

    // Pagination effect
    useEffect(() => {
        fetchPlans(currentPage, searchTerm);
    }, [currentPage, searchTerm, fetchPlans]);

    return {
        plans,
        loading,
        pagination,
        currentPage,
        searchPlans,
        goToPage,
        refetch,
    };
};
