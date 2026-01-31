// hooks/usePendingStudents.ts - محدث مع دعم كامل للـ path-based routing
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

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const config: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
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
        (error as any).response = await response.json().catch(() => ({}));
        throw error;
    }

    return response.json() as Promise<ApiResponse<any>>;
};

const getCenterSlugFromPath = (): string | null => {
    const path = window.location.pathname;
    const segments = path.split("/").filter(Boolean);

    // ✅ http://127.0.0.1:8000/gomaa/center-dashboard/students/approval
    // ✅ segments[0] = "gomaa"
    if (segments.length > 0 && segments[0] !== "center-dashboard") {
        return segments[0];
    }

    // ✅ http://127.0.0.1:8000/center-dashboard/students/approval
    // ✅ مفيش center slug، رجع كل الطلاب
    return null;
};

export function usePendingStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const centerSlug = getCenterSlugFromPath();

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const endpoint = centerSlug
                ? `/pending-students?center_slug=${centerSlug}`
                : "/pending-students";

            const response = await apiCall(endpoint);
            setStudents(response.data || []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "خطأ في جلب البيانات",
            );
        } finally {
            setLoading(false);
        }
    }, [centerSlug]);

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
        centerSlug: centerSlug || null,
    };
}

export function usePendingStudent(id: number) {
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const centerSlug = getCenterSlugFromPath();

    const fetchStudent = useCallback(async () => {
        if (!id) {
            setStudent(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const endpoint = centerSlug
                ? `/pending-students/${id}?center_slug=${centerSlug}`
                : `/pending-students/${id}`;

            const response = await apiCall(endpoint);
            setStudent(response.data || null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "خطأ في جلب البيانات",
            );
            setStudent(null);
        } finally {
            setLoading(false);
        }
    }, [id, centerSlug]);

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
    const centerSlug = getCenterSlugFromPath();

    const linkGuardian = useCallback(
        async (guardianEmail: string): Promise<any> => {
            if (!studentId) {
                const error = new Error("معرف الطالب مطلوب");
                (error as any).status = 400;
                throw error;
            }

            setLoading(true);
            try {
                const endpoint = centerSlug
                    ? `/students/${studentId}/link-guardian?center_slug=${centerSlug}`
                    : `/students/${studentId}/link-guardian`;

                const response = await apiCall(endpoint, {
                    method: "POST",
                    body: JSON.stringify({
                        guardian_email: guardianEmail,
                    }),
                });
                return response;
            } catch (error) {
                if (error instanceof Error) {
                    console.log("🔍 LinkGuardian Error Details:", {
                        message: error.message,
                        status: (error as any).status,
                        studentId,
                        guardianEmail,
                    });
                }
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [studentId, centerSlug],
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
