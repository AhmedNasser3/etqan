// hooks/useAdminDomainRequests.ts
import { useState, useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export interface AdminDomainRequest {
    id: number;
    center_id: number;
    center?: {
        id: number;
        name: string;
    };
    hosting_name: string;
    requested_domain: string;
    dns1: string;
    dns2: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export const useAdminDomainRequests = () => {
    const [requests, setRequests] = useState<AdminDomainRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchRef = useRef(0); // لمنع الـ multiple calls

    // ✅ fetchRequests - محسن بدون infinite loop
    const fetchRequests = useCallback(async () => {
        const currentFetchId = ++fetchRef.current;

        try {
            setLoading(true);
            setError(null);

            const url = `/api/admin/idea-domain-requests`;
            const res = await fetch(url, {
                headers: {
                    Accept: "application/json",
                },
            });

            // ✅ منع الـ stale data
            if (currentFetchId !== fetchRef.current) return;

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${res.status}`);
            }

            const data = await res.json();
            setRequests(data);
        } catch (err: any) {
            console.error("❌ خطأ في جلب طلبات الدومين:", err);
            if (currentFetchId === fetchRef.current) {
                const errorMessage = err.message || "فشل في جلب طلبات الدومين";
                setError(errorMessage);
                toast.error(errorMessage);
                setRequests([]);
            }
        } finally {
            if (currentFetchId === fetchRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // ✅ deleteRequest - محسن
    const deleteRequest = useCallback(async (id: number) => {
        try {
            const res = await fetch(`/api/center/idea-domain-requests/${id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${res.status}`);
            }

            const data = await res.json();
            toast.success(data.message || "تم الحذف بنجاح ✅");
            return data;
        } catch (err: any) {
            const errorMessage = err.message || "فشل في حذف الطلب";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // ✅ تحميل البيانات عند الـ mount
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return {
        requests,
        loading,
        error,
        refetch: fetchRequests,
        deleteRequest,
    };
};
