// hooks/useDomainRequests.ts - الكامل مصحح 100%
import { useState, useEffect, useCallback } from "react";

export interface DomainRequest {
    id: number;
    center_id: number;
    hosting_name: string;
    requested_domain: string;
    dns1: string;
    dns2: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export const useDomainRequests = () => {
    const [requests, setRequests] = useState<DomainRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("🌐 Fetching from: /api/v1/idea-domain-requests"); // ✅ /api/

            const response = await fetch("/api/v1/idea-domain-requests", {
                // ✅ /api/
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "include",
            });

            console.log("📊 Response status:", response.status);

            // ✅ Check Content-Type قبل JSON.parse
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const htmlText = await response.text();
                console.error("❌ HTML Response:", htmlText.substring(0, 500));
                throw new Error(
                    "الخادم رجع HTML بدلاً من JSON - تحقق من الـ authentication أو الـ routes",
                );
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Error Response:", errorText);
                throw new Error(
                    `خطأ ${response.status}: ${errorText || response.statusText}`,
                );
            }

            const result = await response.json();
            console.log("✅ JSON Data:", result);

            setRequests(Array.isArray(result) ? result : result.data || []);
        } catch (err: any) {
            console.error("❌ Fetch error:", err);
            setError(err.message || "حدث خطأ في جلب طلبات الدومين");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const deleteRequest = useCallback(async (requestId: number) => {
        try {
            setLoading(true);

            // ✅ CSRF Token للـ DELETE requests
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            console.log(
                "🗑️ Deleting request:",
                `/api/v1/idea-domain-requests/${requestId}`,
            );

            const response = await fetch(
                `/api/v1/idea-domain-requests/${requestId}`,
                {
                    // ✅ /api/
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken, // ✅ CSRF Token
                    },
                },
            );

            // ✅ Content-Type Check للـ DELETE
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Delete Error:", errorText);
                throw new Error(`خطأ ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log("✅ Delete Success:", result);
            return { success: true, data: result };
        } catch (err: any) {
            console.error("❌ Delete error:", err);
            throw new Error(err.message || "فشل في حذف الطلب");
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(() => fetchRequests(), [fetchRequests]);

    return {
        requests,
        loading,
        error,
        refetch,
        deleteRequest,
        stats: {
            total: requests.length,
            pending: requests.filter(
                (r) =>
                    new Date(r.updated_at) >
                    new Date(Date.now() - 24 * 60 * 60 * 1000),
            ).length,
        },
    };
};
