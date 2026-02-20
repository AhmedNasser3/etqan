// hooks/useTeachers.ts - مع Debug شامل لكل خطوة
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
    const [filters, setFilters] = useState(initialFilters);

    // 🆕 Debug States
    const [debugLogs, setDebugLogs] = useState<string[]>([]);
    const [lastAcceptResponse, setLastAcceptResponse] =
        useState<AcceptResponse | null>(null);
    const [acceptLoading, setAcceptLoading] = useState<number | null>(null);

    // 🆕 Debug Logger
    const addDebugLog = useCallback((message: string, data?: any) => {
        const timestamp = new Date().toLocaleTimeString("ar-EG");
        const logEntry = `${timestamp} 🔍 ${message}${data ? `: ${JSON.stringify(data, null, 2)}` : ""}`;
        console.log(logEntry);
        setDebugLogs((prev) => [logEntry, ...prev.slice(0, 49)]); // آخر 50 log
    }, []);

    const fetchTeachers = useCallback(
        async (customFilters: UseTeachersProps = {}, page = 1) => {
            addDebugLog("📥 بدء جلب المعلمين", {
                filters: customFilters,
                page,
            });
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

                addDebugLog("🌐 طلب API", { url: "/api/v1/teachers", params });

                const response = await axios.get<TeachersResponse>(
                    "/api/v1/teachers",
                    { params },
                );

                addDebugLog("✅ تم جلب المعلمين بنجاح", {
                    count: response.data.data.length,
                    total: response.data.pagination.total,
                    page: response.data.pagination.current_page,
                });

                setTeachers(response.data.data);
                setPagination(response.data.pagination);
            } catch (err: any) {
                const errorMsg =
                    err.response?.data?.message || "حدث خطأ في جلب المعلمين";
                addDebugLog("❌ خطأ في جلب المعلمين", {
                    error: err.response?.data,
                });
                setError(errorMsg);
            } finally {
                setLoading(false);
                addDebugLog("🏁 انتهى جلب المعلمين");
            }
        },
        [filters, addDebugLog],
    );

    const fetchPendingTeachers = useCallback(
        async (page = 1) => {
            addDebugLog("📥 جلب المعلمين المعلقين", { page });
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get<TeachersResponse>(
                    "/api/v1/teachers/pending",
                    { params: { page } },
                );
                addDebugLog("✅ تم جلب المعلقين", {
                    count: response.data.data.length,
                });
                setTeachers(response.data.data);
                setPagination(response.data.pagination);
            } catch (err: any) {
                addDebugLog("❌ خطأ في المعلقين", err.response?.data);
                setError(err.response?.data?.message || "حدث خطأ");
            } finally {
                setLoading(false);
            }
        },
        [addDebugLog],
    );

    // 🆕 approveTeacher مع Debug شامل
    const approveTeacher = async (id: number, teacherName: string) => {
        addDebugLog(`🚀 بدء قبول معلم`, {
            teacher_id: id,
            teacher_name: teacherName,
        });
        setAcceptLoading(id);
        setLastAcceptResponse(null);

        try {
            addDebugLog("📤 إرسال طلب القبول", {
                url: `/api/v1/teachers/${id}/accept`,
            });

            const response = await axios.post<AcceptResponse>(
                `/api/v1/teachers/${id}/accept`,
            );

            addDebugLog("✅ استجابة قبول المعلم", {
                success: response.data.success,
                circle_assigned: response.data.circle_assigned,
                circle_found: response.data.circle_found,
                circle_name: response.data.circle_name,
                notes_parsed: response.data.notes_parsed,
                schedule_info: response.data.schedule_info,
            });

            setLastAcceptResponse(response.data);

            // تحديث القائمة
            addDebugLog("🔄 إعادة تحميل البيانات");
            await fetchTeachers(filters);

            addDebugLog(`🎉 نجح قبول ${teacherName}`, response.data);
            return true;
        } catch (error: any) {
            addDebugLog("❌ فشل قبول المعلم", {
                teacher_id: id,
                error: error.response?.data || error.message,
            });
            setError(error.response?.data?.message || "فشل في قبول المعلم");
            throw error;
        } finally {
            setAcceptLoading(null);
            addDebugLog("🏁 انتهى قبول المعلم");
        }
    };

    const rejectTeacher = async (id: number) => {
        addDebugLog(`🗑️ بدء رفض معلم`, { id });
        try {
            await axios.post(`/api/v1/teachers/${id}/reject`);
            addDebugLog(`✅ تم رفض المعلم ${id}`);
            await fetchTeachers(filters);
            return true;
        } catch (error) {
            addDebugLog("❌ فشل رفض المعلم", { id, error });
            throw error;
        }
    };

    const updateFilters = (newFilters: Partial<UseTeachersProps>) => {
        addDebugLog("🔧 تحديث الفلاتر", newFilters);
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
        approveTeacher, // 🆕 مع debug كامل
        rejectTeacher,
        updateFilters,
        refetch: () => fetchTeachers(filters),

        // 🆕 Debug Info
        debugLogs,
        lastAcceptResponse,
        acceptLoading,
        clearLogs: () => setDebugLogs([]),
    };
};
