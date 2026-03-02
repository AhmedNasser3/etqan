// hooks/useStudentTransfers.ts
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

interface BookingType {
    id: number;
    student_name: string;
    student_phone: string;
    current_plan_name: string;
    current_plan_months: number;
    center_name: string;
    circle_name: string;
    schedule_date: string;
    time_range: string;
    current_sessions_count: number;
    status: string;
    transferred_at: string;
}

interface PaginationType {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export const useStudentTransfers = () => {
    const [transfers, setTransfers] = useState<BookingType[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationType | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    const fetchTransfers = useCallback(async (page = 1, search = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                ...(search && { search }),
            });

            const response = await fetch(
                `/api/v1/student/transfer/bookings?${params}`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            const result = await response.json();
            if (response.ok) {
                setTransfers(result.data || []);
                setPagination({
                    current_page: result.current_page,
                    last_page: result.last_page,
                    per_page: result.per_page,
                    total: result.total,
                });
                setCurrentPage(result.current_page);
            }
        } catch (error) {
            console.error("Error fetching transfers:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const searchTransfers = useCallback(
        (search: string) => {
            setSearchTerm(search);
            searchParams.set("search", search);
            searchParams.set("page", "1");
            setSearchParams(searchParams);
            fetchTransfers(1, search);
        },
        [fetchTransfers, searchParams, setSearchParams],
    );

    const goToPage = useCallback(
        (page: number) => {
            searchParams.set("page", page.toString());
            setSearchParams(searchParams);
            fetchTransfers(page, searchTerm);
        },
        [fetchTransfers, searchTerm, searchParams, setSearchParams],
    );

    useEffect(() => {
        const page = searchParams.get("page") || "1";
        const search = searchParams.get("search") || "";
        fetchTransfers(parseInt(page), search);
    }, []);

    const refetch = useCallback(() => {
        fetchTransfers(currentPage, searchTerm);
    }, [fetchTransfers, currentPage, searchTerm]);

    return {
        transfers,
        loading,
        pagination,
        currentPage,
        searchTransfers,
        goToPage,
        refetch,
    };
};
