import { useState, useEffect, useCallback } from "react";

export interface CustomSalaryItem {
    id: number;
    teacher_id: number;
    user_id: number;
    custom_base_salary: string;
    notes?: string | null;
    is_active: boolean;
    created_at?: string;
    teacher: {
        id: number;
        name: string;
        role: string;
    };
    user: {
        id: number;
        name: string;
        center_id: number;
    };
}

export interface CustomSalaryStats {
    total_custom: number;
    active_custom: number;
    center_id: number;
    your_center_teachers_count: number;
}

export interface UseTeacherCustomSalariesReturn {
    salaries: CustomSalaryItem[];
    stats: CustomSalaryStats;
    loading: boolean;
    pagination: any;
    currentPage: number;
    goToPage: (page: number) => void;
    refetch: () => void;
    isEmpty: boolean;
}

export const useTeacherCustomSalaries = (): UseTeacherCustomSalariesReturn => {
    const [salaries, setSalaries] = useState<CustomSalaryItem[]>([]);
    const [stats, setStats] = useState<CustomSalaryStats>({
        total_custom: 0,
        active_custom: 0,
        center_id: 0,
        your_center_teachers_count: 0,
    });
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const getHeaders = useCallback(() => {
        const token =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";
        return {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
            ...(token && { "X-CSRF-TOKEN": token }),
        } as Record<string, string>;
    }, []);

    const fetchSalaries = useCallback(
        async (
            page = 1,
            search = "",
            teacherId?: number,
            isActive?: number,
        ) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    ...(search && { search }),
                    ...(teacherId && { teacher_id: teacherId.toString() }),
                    ...(isActive !== undefined && {
                        is_active: isActive.toString(),
                    }),
                });

                const response = await fetch(
                    `/api/v1/teacher/custom-salaries?${params}`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: getHeaders(),
                    },
                );

                if (!response.ok)
                    throw new Error("فشل في جلب المرتبات المخصصة");

                const data = await response.json();
                const salaryData = Array.isArray(data.data)
                    ? data.data
                    : data.data?.data || [];
                setSalaries(salaryData as CustomSalaryItem[]);
                setStats(data.stats || stats);
                setPagination(data.data || null);
                setCurrentPage(page);
            } catch (error) {
                console.error("❌ Custom Salaries Error:", error);
                setSalaries([]);
            } finally {
                setLoading(false);
            }
        },
        [getHeaders, stats],
    );

    const refetch = useCallback(() => {
        fetchSalaries(currentPage);
    }, [fetchSalaries, currentPage]);

    const goToPage = useCallback(
        (page: number) => {
            fetchSalaries(page);
        },
        [fetchSalaries],
    );

    useEffect(() => {
        fetchSalaries(1);
    }, []);

    const isEmpty = salaries.length === 0 && !loading;

    return {
        salaries,
        stats,
        loading,
        pagination,
        currentPage,
        goToPage,
        refetch,
        isEmpty,
    };
};
