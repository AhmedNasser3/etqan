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

function getPortalCenterId(): number | null {
    const id = (window as any).__PORTAL_CENTER_ID__;
    return id ? Number(id) : null;
}

function getPortalMosqueId(): number | null {
    const id = (window as any).__PORTAL_MOSQUE_ID__;
    return id ? Number(id) : null;
}

function buildHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    };
    const centerId = getPortalCenterId();
    if (centerId) headers["X-Center-Id"] = String(centerId);
    return headers;
}

export const useMosques = () => {
    const [mosques, setMosques] = useState<Mosque[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMosques = async () => {
        setLoading(true);
        setError(null);

        try {
            // CSRF لو مش موجود
            if (!document.cookie.includes("XSRF-TOKEN=")) {
                await fetch("/sanctum/csrf-cookie", {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });
            }

            const response = await fetch("/api/v1/super/mosques", {
                credentials: "include",
                headers: buildHeaders(),
            });

            const responseText = await response.text();

            if (!response.ok) throw new Error(`خطأ ${response.status}`);
            if (responseText.trim().startsWith("<"))
                throw new Error("Backend returned HTML");

            const result = JSON.parse(responseText);

            if (result.success) {
                let data: Mosque[] = result.data || [];

                // ── لو portal: اعرض المسجد الخاص بالرابط بس ──────────────
                const portalMosqueId = getPortalMosqueId();
                if (portalMosqueId) {
                    data = data.filter((m) => m.id === portalMosqueId);
                }

                setMosques(data);
            } else {
                setError(result.message || "فشل في جلب المساجد");
                toast.error(result.message || "فشل في جلب المساجد");
            }
        } catch (err: any) {
            setError(err.message || "حدث خطأ");
            toast.error(err.message || "فشل في جلب المساجد");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMosques();
    }, []);

    return {
        mosques,
        loading,
        error,
        refetch: fetchMosques,
        stats: {
            total: mosques.length,
            active: mosques.filter((m) => m.is_active).length,
        },
    };
};
