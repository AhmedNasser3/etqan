// hooks/useTeachers.ts
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface Teacher {
    id: number;
    name: string;
    email: string;
    phone?: string;
    gender?: "male" | "female";
    status: "pending" | "active" | "inactive" | "suspended";
    role: {
        id: number;
        name: string;
        title_ar: string;
        title_en: string;
    } | null;
    teacher: {
        id: number;
        session_time?: "asr" | "maghrib";
        notes?: string;
        role:
            | "teacher"
            | "supervisor"
            | "motivator"
            | "student_affairs"
            | "financial";
    } | null;
    center_id?: number;
    created_at: string;
    updated_at: string;
}

interface Pagination {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from?: number;
    to?: number;
}

interface TeachersResponse {
    success: boolean;
    data: Teacher[];
    pagination: Pagination;
}

interface UseTeachersProps {
    status?: string;
    role?: string;
    teacher_role?: string;
    search?: string;
    page?: number;
}

export const useTeachers = (initialFilters: UseTeachersProps = {}) => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [filters, setFilters] = useState(initialFilters);

    const fetchTeachers = useCallback(
        async (customFilters: UseTeachersProps = {}, page = 1) => {
            setLoading(true);
            setError(null);
            try {
                const params: any = { page };

                // دمج الفلاتر
                if (filters.status || customFilters.status)
                    params.status = filters.status || customFilters.status;
                if (filters.role || customFilters.role)
                    params.role = filters.role || customFilters.role;
                if (filters.teacher_role || customFilters.teacher_role)
                    params.teacher_role =
                        filters.teacher_role || customFilters.teacher_role;
                if (filters.search || customFilters.search)
                    params.search = filters.search || customFilters.search;

                const response = await axios.get<TeachersResponse>(
                    "/api/v1/teachers",
                    { params },
                );

                setTeachers(response.data.data);
                setPagination(response.data.pagination);
            } catch (err: any) {
                setError(
                    err.response?.data?.message || "حدث خطأ في جلب المعلمين",
                );
            } finally {
                setLoading(false);
            }
        },
        [filters],
    );

    const fetchPendingTeachers = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<TeachersResponse>(
                "/api/v1/teachers/pending",
                { params: { page } },
            );
            setTeachers(response.data.data);
            setPagination(response.data.pagination);
        } catch (err: any) {
            setError(err.response?.data?.message || "حدث خطأ");
        } finally {
            setLoading(false);
        }
    }, []);

    const approveTeacher = async (id: number) => {
        try {
            await axios.post(`/api/v1/teachers/${id}/accept`);
            await fetchTeachers(filters); // إعادة تحميل البيانات
            return true;
        } catch (error) {
            throw error;
        }
    };

    const rejectTeacher = async (id: number) => {
        try {
            await axios.post(`/api/v1/teachers/${id}/reject`);
            await fetchTeachers(filters);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const updateFilters = (newFilters: Partial<UseTeachersProps>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        fetchTeachers({ ...filters, ...newFilters });
    };

    // تحميل البيانات عند تغيير الفلاتر
    useEffect(() => {
        fetchTeachers(filters);
    }, [filters, fetchTeachers]);

    return {
        teachers,
        loading,
        error,
        pagination,
        filters,
        fetchTeachers,
        fetchPendingTeachers,
        approveTeacher,
        rejectTeacher,
        updateFilters,
        refetch: () => fetchTeachers(filters),
    };
};
