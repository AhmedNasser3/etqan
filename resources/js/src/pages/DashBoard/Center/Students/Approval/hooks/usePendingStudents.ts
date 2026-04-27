// hooks/usePendingStudents.ts -  مع CSRF كامل للـ routes الموجودة
import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";

const API_BASE = "/api/v1/centers";

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    center_id?: number;
    status?: string;
}

interface Student {
    id: number;
    name?: string;
    phone?: string;
    center_id?: number;
    user_id: number;
    guardian_id: number;
    id_number: string;
    grade_level: string;
    circle: string;
    status?: number;
    user: User;
    guardian: User;
    center?: { id: number; name: string };
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

//  apiCall مع CSRF للـ web middleware routes
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    //  CSRF Token من meta tag أو cookie (للـ web middleware)
    const csrfToken =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") ||
        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];

    const token = localStorage.getItem("token");
    const config: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest", //  مطلوب للـ web session
            ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }), //  CSRF Token
            ...(token && { Authorization: `Bearer ${token}` }), //  Token احتياطي
            ...options.headers,
        },
        credentials: "include", //  Session cookies للـ web auth
        ...options,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {}

        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
    }

    return response.json() as Promise<ApiResponse<any>>;
};

//  تهيئة الـ Session للـ web routes
const initializeWebSession = async () => {
    try {
        // 1. جلب CSRF Cookie (لازم للـ web middleware)
        await fetch("/sanctum/csrf-cookie", {
            credentials: "include",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        });
    } catch (error) {
        console.warn("CSRF init failed:", error);
    }
};

export function usePendingStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            //  تهيئة الـ session مرة واحدة
            await initializeWebSession();

            //  الـ endpoint بالظبط زي الـ routes: /api/v1/centers/pending-students
            //  API_BASE = "/api/v1/centers" + endpoint = "/pending-students"
            const response = await apiCall("/pending-students");

            if (response.success) {
                setStudents(response.data || []);
            } else {
                throw new Error(response.message || "خطأ في الاستجابة");
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "خطأ في جلب البيانات",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const refetch = () => fetchStudents();

    return {
        students,
        loading,
        error,
        refetch,
        isSuccess: students.length >= 0,
    };
}

export function usePendingStudent(id: number) {
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudent = useCallback(async () => {
        if (!id) {
            setStudent(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            //  /api/v1/centers/pending-students/{id}
            const response = await apiCall(`/pending-students/${id}`);
            setStudent(response.data || null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "خطأ في جلب البيانات",
            );
            setStudent(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchStudent();
    }, [fetchStudent]);

    return { student, loading, error, refetch: fetchStudent };
}

export function useConfirmStudent() {
    const [loading, setLoading] = useState(false);

    const confirmStudent = useCallback(async (id: number) => {
        setLoading(true);
        try {
            //  /api/v1/centers/pending-students/{id}/confirm
            const response = await apiCall(`/pending-students/${id}/confirm`, {
                method: "POST",
            });
            return response;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        confirmStudent,
        loading,
    };
}

export function useRejectStudent() {
    const [loading, setLoading] = useState(false);

    const rejectStudent = useCallback(async (id: number) => {
        setLoading(true);
        try {
            //  /api/v1/centers/pending-students/{id}
            const response = await apiCall(`/pending-students/${id}`, {
                method: "DELETE",
            });
            return response;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        rejectStudent,
        loading,
    };
}

export function useLinkGuardian(studentId?: number) {
    const [loading, setLoading] = useState(false);

    const linkGuardian = useCallback(
        async (guardianEmail: string) => {
            if (!studentId) {
                throw new Error("معرف الطالب مطلوب");
            }

            setLoading(true);
            try {
                //  /api/v1/centers/students/{id}/link-guardian
                const response = await apiCall(
                    `/students/${studentId}/link-guardian`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            guardian_email: guardianEmail,
                        }),
                    },
                );
                return response;
            } finally {
                setLoading(false);
            }
        },
        [studentId],
    );

    return {
        linkGuardian,
        loading,
    };
}

export function useUpdatePendingStudent() {
    return useConfirmStudent();
}

export function useDeletePendingStudent() {
    return useRejectStudent();
}
