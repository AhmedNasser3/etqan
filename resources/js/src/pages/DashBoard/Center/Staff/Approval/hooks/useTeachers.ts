// hooks/useTeachers.ts - مصحح مع middleware web و CSRF
import { useState, useCallback } from "react";
import axios from "axios";

// ✅ إعداد axios عشان يشتغل مع middleware web (session + CSRF)
axios.defaults.withCredentials = true; // مهم عشان الـ session cookie تتبعت
axios.defaults.withXSRFToken = true; // مهم عشان CSRF

// ✅ دالة للحصول على CSRF token قبل أي POST
const ensureCsrf = async () => {
    await axios.get("/sanctum/csrf-cookie");
};

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

interface AcceptResponse {
    success: boolean;
    message: string;
    circle_assigned: boolean;
    circle_found: boolean;
    circle_name: string;
    schedule_info: any;
    notes_parsed: boolean;
    teacher_id: number;
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

    // ✅ fetchTeachers - جلب كل المعلمين مع فلاتر
    const fetchTeachers = useCallback(
        async (customFilters: UseTeachersProps = {}, page = 1) => {
            setLoading(true);
            setError(null);
            try {
                const params: any = { page };
                const merged = { ...initialFilters, ...customFilters };

                if (merged.status) params.status = merged.status;
                if (merged.role) params.role = merged.role;
                if (merged.teacher_role)
                    params.teacher_role = merged.teacher_role;
                if (merged.search) params.search = merged.search;

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
        [initialFilters],
    );

    // ✅ fetchPendingTeachers - جلب المعلقين فقط عبر endpoint مستقل
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
            setError(
                err.response?.data?.message ||
                    "حدث خطأ في جلب المعلمين المعلقين",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ approveTeacher - CSRF أولاً ثم POST، وبعدها fetchPendingTeachers مش fetchTeachers
    const approveTeacher = useCallback(
        async (id: number, teacherName: string) => {
            await ensureCsrf();
            const response = await axios.post<AcceptResponse>(
                `/api/v1/teachers/${id}/accept`,
            );
            await fetchPendingTeachers();
            return response.data;
        },
        [fetchPendingTeachers],
    );

    // ✅ rejectTeacher - CSRF أولاً ثم POST، وبعدها fetchPendingTeachers
    const rejectTeacher = useCallback(
        async (id: number) => {
            await ensureCsrf();
            const response = await axios.post(`/api/v1/teachers/${id}/reject`);
            await fetchPendingTeachers();
            return response.data;
        },
        [fetchPendingTeachers],
    );

    const updateFilters = useCallback(
        (newFilters: Partial<UseTeachersProps>) => {
            fetchTeachers(newFilters);
        },
        [fetchTeachers],
    );

    return {
        teachers,
        loading,
        error,
        pagination,
        fetchTeachers,
        fetchPendingTeachers,
        approveTeacher,
        rejectTeacher,
        updateFilters,
        refetch: fetchPendingTeachers,
    };
};
