// hooks/useCenters.ts - كامل ومحدث مع الـ Controller الجديد
import { useState, useEffect, useCallback } from "react";

interface Center {
    id: number;
    name: string;
    subdomain: string;
    email: string;
    phone: string;
    address: string | null;
    manager_name: string; //  اسم الـ center_owner (role_id = 1)
}

export const useCenters = () => {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // CSRF Token Helper
    const getCsrfToken = (): string => {
        const cookies = document.cookie.split(";");
        const csrfCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("XSRF-TOKEN="),
        );
        return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
    };

    // API Fetch Helper محسن
    const apiFetch = async (url: string, options: RequestInit = {}) => {
        // CSRF Token أولاً
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

    //  جلب المجامع من /admin/centers مع الـ manager_name
    const fetchCenters = useCallback(async () => {
        console.log("📥 Fetching centers from: /admin/centers");
        setLoading(true);
        setError(null);

        try {
            const result = await apiFetch("/admin/centers");

            console.log(" API Response:", {
                success: result.success,
                centers_count: result.centers?.length || 0,
                sample_manager: result.centers?.[0]?.manager_name,
            });

            if (result.success) {
                setCenters(result.centers || []);
                console.log(
                    ` Loaded ${result.centers?.length || 0} centers مع manager_name`,
                );
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

    // تحميل تلقائي عند Mount
    useEffect(() => {
        fetchCenters();
    }, [fetchCenters]);

    // إعادة تحميل يدوي
    const refetch = useCallback(() => {
        console.log("🔄 Manual refetch");
        fetchCenters();
    }, [fetchCenters]);

    // إحصائيات محسنة للمجامع
    const stats = {
        total: centers.length,
        withManager: centers.filter((c) => c.manager_name).length,
        etqan: centers.find((c) => c.subdomain === "etqan") ? 1 : 0,
        game3: centers.find((c) => c.subdomain === "game3") ? 1 : 0,
    };

    return {
        centers,
        loading,
        error,
        refetch,
        stats,
        getCsrfToken,
    };
};
