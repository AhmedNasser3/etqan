// hooks/usePlanSchedules.ts
import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

export interface ScheduleType {
    id: number;
    plan_id: number;
    plan: { id: number; plan_name: string; center_id: number };
    circle_id: number;
    circle: { id: number; name: string };
    teacher_id?: number;
    teacher?: { id: number; name: string };
    schedule_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    day_of_week: string;
    max_students?: number;
    booked_students: number;
    is_available: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
    bookings_count: number;
}

interface Pagination {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

export const usePlanSchedules = () => {
    const [schedules, setSchedules] = useState<ScheduleType[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const searchTimeoutRef = useRef<number | null>(null);

    const fetchSchedules = useCallback(
        async (pageNum: number = 1, search: string = "", planId?: number) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: pageNum.toString(),
                });
                if (search.trim()) {
                    params.append("search", search.trim());
                }

                const url = planId
                    ? `/api/v1/plans/schedules/${planId}?${params.toString()}`
                    : `/api/v1/plans/my-center-schedules?${params.toString()}`;

                const response = await fetch(url, {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    toast.error(errorData.message || "حدث خطأ");
                    setSchedules([]);
                    setPagination(null);
                    return;
                }

                const data = await response.json();
                console.log("✅ Schedules loaded:", data);

                setSchedules(Array.isArray(data.data) ? data.data : []);
                setPagination({
                    current_page: data.current_page || 1,
                    last_page: data.last_page || 1,
                    total: data.total || 0,
                    per_page: data.per_page || 15,
                    from: data.from || null,
                    to: data.to || null,
                });
                setCurrentPage(data.current_page || 1);
            } catch (error) {
                console.error("❌ Error:", error);
                toast.error("فشل في الاتصال");
                setSchedules([]);
                setPagination(null);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const searchSchedules = useCallback(
        (term: string, planId?: number) => {
            if (searchTimeoutRef.current !== null) {
                window.clearTimeout(searchTimeoutRef.current);
            }

            searchTimeoutRef.current = window.setTimeout(() => {
                setSearchTerm(term);
                setCurrentPage(1);
                fetchSchedules(1, term, planId);
            }, 500);
        },
        [fetchSchedules],
    );

    const goToPage = useCallback(
        (pageNum: number, planId?: number) => {
            setCurrentPage(pageNum);
            fetchSchedules(pageNum, searchTerm, planId);
        },
        [fetchSchedules, searchTerm],
    );

    const refetch = useCallback(
        (planId?: number) => {
            fetchSchedules(currentPage, searchTerm, planId);
        },
        [fetchSchedules, currentPage, searchTerm],
    );

    useEffect(() => {
        fetchSchedules(1, "");
    }, [fetchSchedules]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current !== null) {
                window.clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return {
        schedules,
        loading,
        pagination,
        currentPage,
        searchSchedules,
        goToPage,
        refetch,
    };
};
