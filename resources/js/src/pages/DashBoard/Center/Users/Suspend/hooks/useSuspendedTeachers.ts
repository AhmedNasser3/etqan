import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

export interface SuspendedTeacher {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: "active" | "inactive";
    teacher: {
        id: number;
        role:
            | "teacher"
            | "supervisor"
            | "motivator"
            | "student_affairs"
            | "financial";
        session_time?: "asr" | "maghrib";
        notes?: string;
        created_at: string;
        updated_at: string;
    };
    created_at: string;
    updated_at: string;
    last_login?: string;
}

export interface Pagination {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from?: number;
    to?: number;
}

interface ApiResponse {
    success: boolean;
    data: SuspendedTeacher[];
    pagination: Pagination;
}

interface UseSuspendedTeachersProps {
    search?: string;
    page?: number;
}

export const useSuspendedTeachers = (
    initialFilters: UseSuspendedTeachersProps = {},
) => {
    const [teachers, setTeachers] = useState<SuspendedTeacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<Record<number, boolean>>(
        {},
    );
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [filters, setFilters] = useState({
        search: initialFilters.search || "",
        page: initialFilters.page || 1,
    });

    const fetchSuspendedTeachers = useCallback(
        async (page = 1, search = "") => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    page,
                    ...(search && { search }),
                };

                const response = await axios.get<ApiResponse>(
                    "/api/v1/users/suspended-teachers",
                    {
                        params,
                    },
                );

                setTeachers(response.data.data);
                setPagination(response.data.pagination);
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message ||
                    "حدث خطأ في جلب الموظفين المعلقين";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const toggleSuspend = async (teacherId: number): Promise<boolean> => {
        setActionLoading((prev) => ({ ...prev, [teacherId]: true }));
        try {
            await axios.post(
                `/api/v1/users/${teacherId}/toggle-teacher-suspend`,
            );
            await fetchSuspendedTeachers(filters.page, filters.search);
            toast.success("تم تحديث حالة الموظف بنجاح");
            return true;
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "فشل في تحديث الحالة";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setActionLoading((prev) => ({ ...prev, [teacherId]: false }));
        }
    };

    const deleteTeacher = async (teacherId: number): Promise<boolean> => {
        setActionLoading((prev) => ({ ...prev, [teacherId]: true }));
        try {
            await axios.delete(`/api/v1/users/${teacherId}`);
            await fetchSuspendedTeachers(filters.page, filters.search);
            toast.success("تم حذف الموظف بنجاح");
            return true;
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "فشل في الحذف";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setActionLoading((prev) => ({ ...prev, [teacherId]: false }));
        }
    };

    const updateFilters = (newFilters: Partial<UseSuspendedTeachersProps>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    // ✅ تحميل البيانات عند الـ mount
    useEffect(() => {
        fetchSuspendedTeachers(filters.page, filters.search);
    }, []);

    // ✅ إعادة تحميل عند تغيير search
    useEffect(() => {
        fetchSuspendedTeachers(1, filters.search);
    }, [filters.search, fetchSuspendedTeachers]);

    return {
        teachers,
        loading,
        actionLoading, // ✅ Loading لكل action منفصل
        error,
        pagination,
        filters,
        fetchSuspendedTeachers,
        toggleSuspend,
        deleteTeacher,
        updateFilters,
        setSearch: (search: string) => updateFilters({ search }),
        refetch: () => fetchSuspendedTeachers(filters.page, filters.search),
    };
};
