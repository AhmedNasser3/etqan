// hooks/useMosques.ts
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Mosque {
    id: number;
    name: string;
    circle: string;
    circleId: number;
    supervisor: string;
    supervisorId: number | null;
    logo: string | null;
    is_active: boolean;
    created_at: string;
}

export const useMosques = () => {
    const [mosques, setMosques] = useState<Mosque[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ CSRF Token Helper
    const getCsrfToken = (): string => {
        const cookies = document.cookie.split(";");
        const csrfCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("XSRF-TOKEN="),
        );
        return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
    };

    const fetchMosques = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("🌐 Fetching mosques...");

            // ✅ 1. CSRF Token أولاً
            if (!document.cookie.includes("XSRF-TOKEN=")) {
                console.log("🔑 Getting CSRF token...");
                const csrfResponse = await fetch("/sanctum/csrf-cookie", {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                    },
                });
                console.log("✅ CSRF Status:", csrfResponse.status);
            }

            // ✅ 2. API Request مع Headers كاملة
            const response = await fetch("/api/v1/super/mosques", {
                credentials: "include", // ✅ Cookies/Session
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": getCsrfToken(), // ✅ CSRF Token
                },
            });

            console.log("📡 Response status:", response.status);

            const responseText = await response.text();
            console.log("📄 Response preview:", responseText.substring(0, 200));

            if (!response.ok) {
                console.error("❌ Error details:", {
                    status: response.status,
                    text: responseText.substring(0, 300),
                });
                throw new Error(
                    `خطأ ${response.status}: ${response.statusText}`,
                );
            }

            // ✅ تأكد إنه JSON مش HTML
            if (
                responseText.trim().startsWith("<!DOCTYPE") ||
                responseText.trim().startsWith("<html")
            ) {
                throw new Error("Backend returned HTML instead of JSON");
            }

            const result = JSON.parse(responseText);

            if (result.success) {
                setMosques(result.data || []);
                console.log("✅ Mosques loaded:", result.data?.length || 0);
            } else {
                setError(result.message || "فشل في جلب المساجد");
                toast.error(result.message || "فشل في جلب المساجد");
            }
        } catch (err: any) {
            console.error("💥 Fetch error:", err);
            setError(err.message || "حدث خطأ في جلب المساجد");
            toast.error(err.message || "فشل في جلب المساجد");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMosques();
    }, []);

    const refetch = () => fetchMosques();

    return {
        mosques,
        loading,
        error,
        refetch,
        stats: {
            total: mosques.length,
            active: mosques.filter((m) => m.is_active).length,
        },
    };
};
