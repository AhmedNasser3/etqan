// hooks/useSpecialRequests.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export interface SpecialRequestType {
    id: number;
    whatsapp_number: string;
    name: string;
    age?: number | null;
    available_schedule?: Record<string, any> | string | null; // ✅ مرن أكتر
    memorized_parts?: (string | null)[] | string | null;
    parts_to_memorize?: (string | null)[] | string | null;
    daily_memorization: "وجه" | "وجهين" | "أكثر";
    created_at?: string;
    updated_at?: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Stats {
    total: number;
    avgAge: number;
    memorizationTypes: Record<string, number>;
}

export const useSpecialRequests = () => {
    const [requests, setRequests] = useState<SpecialRequestType[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(
        async (pageNum: number = 1, searchParams: Record<string, any> = {}) => {
            setLoading(true);
            setRequests([]);
            setError(null);

            try {
                const url = new URLSearchParams({ page: pageNum.toString() });

                // ✅ إصلاح البحث - مش JSON.parse
                Object.entries(searchParams).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== "") {
                        url.append(key, value.toString());
                    }
                });

                const response = await fetch(
                    `/api/v1/special-requests?${url}`,
                    {
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`,
                    );
                }

                const data = await response.json();
                let requestData: any[] = [];

                // ✅ معالجة البيانات بأمان
                if (Array.isArray(data)) {
                    requestData = data;
                } else if (data?.data && Array.isArray(data.data)) {
                    requestData = data.data;
                } else {
                    requestData = [];
                }

                // ✅ فلترة آمنة
                const safeRequests = requestData
                    .filter(
                        (request): request is SpecialRequestType =>
                            request &&
                            typeof request === "object" &&
                            typeof request.id === "number" &&
                            request.id > 0,
                    )
                    .map((request) => ({
                        ...request,
                        // ✅ تحويل JSON strings لـ arrays لو كانت strings
                        memorized_parts:
                            typeof request.memorized_parts === "string"
                                ? JSON.parse(request.memorized_parts || "[]")
                                : request.memorized_parts || [],
                        parts_to_memorize:
                            typeof request.parts_to_memorize === "string"
                                ? JSON.parse(request.parts_to_memorize || "[]")
                                : request.parts_to_memorize || [],
                        available_schedule:
                            typeof request.available_schedule === "string"
                                ? JSON.parse(request.available_schedule || "{}")
                                : request.available_schedule || {},
                    }));

                // ✅ استخراج Pagination بأمان
                const safePagination: Pagination = {
                    current_page:
                        data.pagination?.current_page || data.current_page || 1,
                    last_page:
                        data.pagination?.last_page || data.last_page || 1,
                    total:
                        data.pagination?.total ||
                        data.total ||
                        safeRequests.length,
                    per_page: data.pagination?.per_page || data.per_page || 15,
                };

                setRequests(safeRequests);
                setPagination(safePagination);
                setCurrentPage(safePagination.current_page);
            } catch (error: any) {
                console.error("fetchRequests ERROR:", error);
                const errorMessage =
                    error.message || "فشل في تحميل الطلبات الخاصة";
                setError(errorMessage);
                toast.error(errorMessage);

                setRequests([]);
                setPagination({
                    current_page: 1,
                    last_page: 1,
                    total: 0,
                    per_page: 15,
                });
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchRequests(1);
    }, [fetchRequests]);

    const isEmpty = useMemo(() => {
        return requests.length === 0 && !loading && !error;
    }, [requests.length, loading, error]);

    const stats = useMemo((): Stats => {
        const total = requests.length;
        const validAges = requests
            .map((r) => r.age)
            .filter((age): age is number => typeof age === "number" && age > 0);

        const avgAge =
            validAges.length > 0
                ? Math.round(
                      validAges.reduce((a, b) => a + b, 0) / validAges.length,
                  )
                : 0;

        const memorizationTypes: Record<string, number> = {};
        requests.forEach((r) => {
            const type = r.daily_memorization || "غير محدد";
            memorizationTypes[type] = (memorizationTypes[type] || 0) + 1;
        });

        return {
            total,
            avgAge,
            memorizationTypes,
        };
    }, [requests]);

    return {
        requests,
        loading,
        pagination,
        currentPage,
        error,
        goToPage: fetchRequests,
        refetch: () => fetchRequests(currentPage),
        search: (query: string) =>
            fetchRequests(1, { name: query, whatsapp_number: query }),
        isEmpty,
        stats,
    };
};
