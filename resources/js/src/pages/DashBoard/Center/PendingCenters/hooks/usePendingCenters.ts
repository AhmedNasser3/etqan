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
    email: string;
    phone?: string;
    logo?: string | null;
    is_active: boolean;
    center_url: string;
    notes?: string;
}

interface PendingCenter {
    id: number;
    user_id: number;
    name: string;
    email: string;
    phone?: string;
    status: string;
    created_at: string;
    center?: Center;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
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
 * ✅ Hook لجلب جميع المجمعات المعلقة
 */
export function usePendingCenters() {
    const [centers, setCenters] = useState<PendingCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCenters = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiCall("/pending");
            setCenters(response.data || []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "خطأ في جلب البيانات",
            );
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
        refetch,
        isSuccess: centers.length >= 0,
    };
}

/**
 * ✅ Hook لجلب مجمع معين
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
            setCenter(response.data || null);
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

    return { center, loading, error, refetch: fetchCenter };
}

/**
 * ✅ Hook لقبول المجمع (تفعيل)
 */
export function useConfirmCenter() {
    const [loading, setLoading] = useState(false);

    const confirmCenter = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const response = await apiCall(`/pending/${id}/confirm`, {
                method: "POST",
            });
            return response;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        confirmCenter,
        loading,
    };
}

/**
 * ✅ Hook لرفض المجمع (تعطيل)
 */
export function useRejectCenter() {
    const [loading, setLoading] = useState(false);

    const rejectCenter = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const response = await apiCall(`/pending/${id}/reject`, {
                method: "POST",
            });
            return response;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        rejectCenter,
        loading,
    };
}

/**
 * ✅ Hook لحذف المجمع نهائياً
 */
export function useDeleteCenter() {
    const [loading, setLoading] = useState(false);

    const deleteCenter = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const response = await apiCall(`/pending/${id}`, {
                method: "DELETE",
            });
            return response;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        deleteCenter,
        loading,
    };
}
