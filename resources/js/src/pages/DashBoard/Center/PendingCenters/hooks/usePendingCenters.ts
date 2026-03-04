// hooks/usePendingCenters.ts
import { useState, useEffect, useCallback } from "react";

const API_BASE = "/api/super/centers";

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status?: string;
}

interface Center {
    id: number;
    name: string;
    subdomain: string;
    domain: string;
    email: string;
    phone?: string;
    logo?: string | null;
    is_active: boolean;
    address?: string;
    center_url: string;
    created_at?: string;
    students_count?: number;
    user_name?: string;
    user_email?: string;
}

interface PendingCenter {
    id: number;
    name: string;
    subdomain: string;
    domain: string;
    email: string;
    phone?: string;
    logo?: string | null;
    is_active: boolean;
    address?: string;
    center_url: string;
    created_at?: string;
    students_count?: number;
    user_name?: string;
    user_email?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T[] | T | null;
    message?: string;
    total?: number;
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

/**
 * Hook لجلب جميع المجمعات المعلقة (غير المتفعلة)
 */
export function usePendingCenters() {
    const [centers, setCenters] = useState<PendingCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const fetchCenters = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiCall("/pending");
            if (response.success && response.data) {
                setCenters(Array.isArray(response.data) ? response.data : []);
                setTotal(response.total || 0);
            } else {
                setCenters([]);
                setTotal(0);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "خطأ في جلب البيانات",
            );
            setCenters([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCenters();
    }, [fetchCenters]);

    const refetch = () => fetchCenters();

    return {
        centers,
        loading,
        error,
        total,
        refetch,
        isSuccess: centers.length >= 0,
    };
}

/**
 * Hook لجلب مجمع معين
 */
export function usePendingCenter(id: number) {
    const [center, setCenter] = useState<PendingCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCenter = useCallback(async () => {
        if (!id) {
            setCenter(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await apiCall(`/pending/${id}`);
            setCenter(response.success && response.data ? response.data : null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "خطأ في جلب البيانات",
            );
            setCenter(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCenter();
    }, [fetchCenter]);

    return {
        center,
        loading,
        error,
        refetch: fetchCenter,
    };
}

/**
 * Hook لقبول المجمع (تفعيل المجمع + اليوزر)
 */
export function useConfirmCenter() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const confirmCenter = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall(`/pending/${id}/confirm`, {
                method: "POST",
            });
            return response;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "خطأ في تفعيل المجمع",
            );
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        confirmCenter,
        loading,
        error,
    };
}

/**
 * Hook لرفض المجمع (تعطيل المجمع + اليوزر)
 */
export function useRejectCenter() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const rejectCenter = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall(`/pending/${id}/reject`, {
                method: "POST",
            });
            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : "خطأ في رفض المجمع");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        rejectCenter,
        loading,
        error,
    };
}

/**
 * Hook لحذف المجمع نهائياً
 */
export function useDeleteCenter() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteCenter = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall(`/pending/${id}`, {
                method: "DELETE",
            });
            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : "خطأ في حذف المجمع");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        deleteCenter,
        loading,
        error,
    };
}
