// hooks/useSalaryRules.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export interface SalaryRuleType {
    id: number;
    role:
        | "teacher"
        | "supervisor"
        | "motivator"
        | "student_affairs"
        | "financial";
    role_ar?: string;
    center_id?: number | null;
    mosque_id?: string | null;
    base_salary: number;
    working_days: number;
    daily_rate: number;
    total_salary?: number;
    notes?: string | null;
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
    totalSalary: number;
    avgSalary: number;
}

export const useSalaryRules = () => {
    const [salaries, setSalaries] = useState<SalaryRuleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchSalaries = useCallback(async (pageNum: number = 1) => {
        setLoading(true);
        setSalaries([]);

        try {
            const response = await fetch(
                `/api/v1/teacher-salaries?page=${pageNum}`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            let salaryData: SalaryRuleType[] = [];

            if (Array.isArray(data)) {
                salaryData = data;
            } else if (data && Array.isArray(data.data)) {
                salaryData = data.data;
            }

            const safeSalaries = salaryData.filter(
                (salary) => salary && salary.id,
            );

            const safePagination: Pagination = {
                current_page: (data as any).current_page || 1,
                last_page: (data as any).last_page || 1,
                total: (data as any).total || safeSalaries.length,
                per_page: (data as any).per_page || 30,
            };

            setSalaries(safeSalaries);
            setPagination(safePagination);
            setCurrentPage(safePagination.current_page || 1);
        } catch (error: any) {
            console.error("fetchSalaries ERROR:", error);
            toast.error(error.message || "فشل في تحميل قوانين الرواتب");
            setSalaries([]);
            setPagination({
                current_page: 1,
                last_page: 1,
                total: 0,
                per_page: 30,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSalaries(1);
    }, [fetchSalaries]);

    const isEmpty = useMemo(() => {
        return salaries.length === 0 && !loading;
    }, [salaries.length, loading]);

    const stats = useMemo((): Stats => {
        const total = salaries.length;
        const totalSalary = salaries.reduce(
            (sum, s) => sum + Number(s.base_salary || 0),
            0,
        );
        const avgSalary = total > 0 ? totalSalary / total : 0;

        return {
            total,
            totalSalary,
            avgSalary,
        };
    }, [salaries]);

    return {
        salaries,
        loading,
        pagination,
        currentPage,
        goToPage: fetchSalaries,
        refetch: () => fetchSalaries(currentPage),
        isEmpty,
        stats,
    };
};
