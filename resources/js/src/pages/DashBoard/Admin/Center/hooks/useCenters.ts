// hooks/useCenters.ts - مظبوطة مع Controller الجديد (centers table مباشرة)
import { useState, useEffect, useCallback } from "react";

interface Center {
    id: number;
    name: string;
    subdomain: string;
    domain: string;
    center_url: string;
    email: string;
    phone: string;
    logo: string | null;
    is_active: boolean;
    address: string;
    created_at: string;
    students_count: number;
}

export const useCenters = () => {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    //  CSRF Token Helper
    const getCsrfToken = (): string => {
        const cookies = document.cookie.split(";");
        const csrfCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("XSRF-TOKEN="),
        );
        return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
    };

    //  API Fetch Helper محسن
    const apiFetch = async (url: string, options: RequestInit = {}) => {
        //  CSRF Token أولاً
        if (!document.cookie.includes("XSRF-TOKEN=")) {
            await fetch("/sanctum/csrf-cookie", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
        }

        const response = await fetch(url, {
            ...options,
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-XSRF-TOKEN": getCsrfToken(),
                ...(options.headers as any),
            },
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${responseText.substring(0, 100)}`,
            );
        }

        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.error("JSON Parse Error:", responseText.substring(0, 200));
            throw new Error("Invalid JSON response");
        }
    };

    //  جلب كل المجامع من centers table
    const fetchCenters = useCallback(async () => {
        console.log("📥 Fetching centers from: /api/v1/super/centers/pending");
        setLoading(true);
        setError(null);

        try {
            const result = await apiFetch("/api/v1/super/centers/pending");

            console.log(" API Response:", {
                success: result.success,
                data_count: result.data?.length || 0,
                total: result.total || 0,
            });

            if (result.success) {
                setCenters(result.data || []);
                console.log(` Loaded ${result.data?.length || 0} centers`);
            } else {
                setError(result.message || "فشل في جلب المجامع");
                console.error("API Error:", result.message);
            }
        } catch (err: any) {
            console.error("❌ Fetch Error:", err);
            setError(err.message || "حدث خطأ في جلب المجامع");
        } finally {
            setLoading(false);
        }
    }, []);

    //  تحميل تلقائي عند Mount
    useEffect(() => {
        fetchCenters();
    }, [fetchCenters]);

    //  تفعيل مجمع
    const confirmCenter = useCallback(
        async (centerId: number) => {
            try {
                console.log(` Confirming center ${centerId}`);
                const result = await apiFetch(
                    `/api/v1/super/centers/pending/${centerId}/confirm`,
                    { method: "POST" },
                );

                if (result.success) {
                    console.log(" Center confirmed, refetching...");
                    await fetchCenters();
                    return {
                        success: true,
                        message: result.message || "تم التفعيل بنجاح",
                    };
                }
                return { success: false, message: result.message };
            } catch (err: any) {
                console.error("❌ Confirm error:", err);
                return { success: false, message: err.message };
            }
        },
        [fetchCenters],
    );

    //  تعطيل مجمع
    const rejectCenter = useCallback(
        async (centerId: number) => {
            try {
                console.log(`❌ Rejecting center ${centerId}`);
                const result = await apiFetch(
                    `/api/v1/super/centers/pending/${centerId}/reject`,
                    { method: "POST" },
                );

                if (result.success) {
                    console.log(" Center rejected, refetching...");
                    await fetchCenters();
                    return {
                        success: true,
                        message: result.message || "تم التعطيل بنجاح",
                    };
                }
                return { success: false, message: result.message };
            } catch (err: any) {
                console.error("❌ Reject error:", err);
                return { success: false, message: err.message };
            }
        },
        [fetchCenters],
    );

    //  حذف مجمع
    const deleteCenter = useCallback(
        async (centerId: number) => {
            try {
                console.log(`🗑️ Deleting center ${centerId}`);
                const result = await apiFetch(
                    `/api/v1/super/centers/pending/${centerId}`,
                    { method: "DELETE" },
                );

                if (result.success) {
                    console.log(" Center deleted, refetching...");
                    await fetchCenters();
                    return {
                        success: true,
                        message: result.message || "تم الحذف بنجاح",
                    };
                }
                return { success: false, message: result.message };
            } catch (err: any) {
                console.error("❌ Delete error:", err);
                return { success: false, message: err.message };
            }
        },
        [fetchCenters],
    );

    //  إعادة تحميل يدوي
    const refetch = useCallback(() => {
        console.log("🔄 Manual refetch");
        fetchCenters();
    }, [fetchCenters]);

    //  إحصائيات محسنة للمجامع
    const stats = {
        total: centers.length,
        active: centers.filter((c) => c.is_active).length,
        inactive: centers.filter((c) => !c.is_active).length,
    };

    return {
        centers,
        loading,
        error,
        refetch,
        confirmCenter,
        rejectCenter,
        deleteCenter,
        stats,
        getCsrfToken,
    };
};
