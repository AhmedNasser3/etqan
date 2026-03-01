// hooks/useMyTeachers.ts
import { useState, useEffect, useCallback } from "react";

interface TeacherRoleType {
    teacher: {
        role:
            | "teacher"
            | "supervisor"
            | "motivator"
            | "student_affairs"
            | "financial";
        notes: string | null;
    };
}

export interface MyTeacherType extends TeacherRoleType {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    status: "pending" | "active" | "inactive" | "suspended";
    created_at: string;
    updated_at: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number;
    to: number;
}

export const useMyTeachers = () => {
    const [teachers, setTeachers] = useState<MyTeacherType[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const csrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "";

    const fetchActiveTeachers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/v1/teachers/my-teachers`, {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken(),
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "فشل في جلب بيانات المعلمين");
            }

            const data = await res.json();
            setTeachers(Array.isArray(data.data) ? data.data : []);
            setTotalCount(data.pagination?.total ?? 0);
        } catch (err: any) {
            setError(err.message || "خطأ في جلب المعلمين");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPendingTeachers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/v1/teachers/my-teachers/pending`, {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken(),
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "فشل في جلب المعلمين");
            }

            const data = await res.json();
            setTeachers(Array.isArray(data.data) ? data.data : []);
            setTotalCount(data.pagination?.total ?? 0);
        } catch (err: any) {
            setError(err.message || "خطأ في جلب المعلمين");
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleTeacherStatus = useCallback(
        async (id: number) => {
            const res = await fetch(
                `/api/v1/teachers/my-teachers/${id}/toggle-status`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken(),
                    },
                },
            );

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "فشل في تغيير حالة المعلم");
            }

            await fetchActiveTeachers(); // 🔄 لتحديث الحالة
        },
        [fetchActiveTeachers],
    );

    const approveTeacher = useCallback(
        async (id: number) => {
            const res = await fetch(`/api/v1/teachers/my-teachers/${id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken(),
                },
                body: JSON.stringify({ status: "active" }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "فشل في تفعيل المعلم");
            }

            await fetchPendingTeachers();
        },
        [fetchPendingTeachers],
    );

    const rejectTeacher = useCallback(
        async (id: number) => {
            const res = await fetch(`/api/v1/teachers/my-teachers/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken(),
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "فشل في رفض المعلم");
            }

            await fetchPendingTeachers();
        },
        [fetchPendingTeachers],
    );

    return {
        teachers,
        totalCount,
        loading,
        error,
        fetchActiveTeachers,
        fetchPendingTeachers,
        toggleTeacherStatus,
        approveTeacher,
        rejectTeacher,
    };
};
