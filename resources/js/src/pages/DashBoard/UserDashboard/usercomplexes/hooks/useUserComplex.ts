// hooks/useUserComplex.ts
import { useState, useEffect } from "react";

interface ComplexStat {
    label: string;
    value: string;
    icon: string;
}

interface ComplexData {
    title: string;
    description: string;
    img: string;
    stats: ComplexStat[];
}

interface ComplexResponse {
    success: boolean;
    complex: ComplexData;
}

export const useUserComplex = () => {
    const [data, setData] = useState<ComplexResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchComplex = async () => {
            try {
                setLoading(true);
                setError(null);

                // ✅ CSRF Cookie
                await fetch("/sanctum/csrf-cookie", {
                    method: "GET",
                    credentials: "include",
                });

                // ✅ CSRF Token
                const metaToken = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content");
                const getCookie = (name: string): string | null => {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2)
                        return parts.pop()?.split(";").shift() || null;
                    return null;
                };
                const csrfToken =
                    metaToken ||
                    getCookie("XSRF-TOKEN") ||
                    getCookie("csrf-token");

                // ✅ جلب بيانات المجمع
                const response = await fetch("/api/v1/user/complex", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const result = await response.json();
                if (result.success) {
                    setData(result);
                } else {
                    setError(result.message || "خطأ في جلب بيانات المجمع");
                }
            } catch (err: any) {
                console.error("❌ Complex fetch error:", err);
                setError(err.message || "حدث خطأ في جلب بيانات المجمع");
            } finally {
                setLoading(false);
            }
        };

        fetchComplex();
    }, []);

    return { data, loading, error };
};
