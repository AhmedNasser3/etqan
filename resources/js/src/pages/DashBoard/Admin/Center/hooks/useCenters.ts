import { useCallback, useEffect, useState } from "react";

export interface Center {
    id: number;
    circleName: string;
    managerEmail: string;
    managerPhone: string;
    domain: string;
    circleLink: string;
    logo: string | null;
    is_active: boolean;
    created_at: string;
    manager_name?: string;
}

type RawCenter = {
    id?: number;
    name?: string;
    circleName?: string;
    subdomain?: string;
    domain?: string;
    email?: string;
    managerEmail?: string;
    phone?: string;
    managerPhone?: string;
    logo?: string | null;
    is_active?: boolean | number;
    created_at?: string;
    manager_name?: string;
    circleLink?: string;
};

const normalizeActiveFlag = (
    value: boolean | number | string | undefined,
    fallback = false,
): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["1", "true", "active", "enabled"].includes(normalized)) {
            return true;
        }
        if (["0", "false", "inactive", "disabled"].includes(normalized)) {
            return false;
        }
    }
    return fallback;
};

const ensureCsrfCookie = async () => {
    if (!document.cookie.includes("XSRF-TOKEN=")) {
        await fetch("/sanctum/csrf-cookie", {
            credentials: "include",
            headers: { Accept: "application/json" },
        });
    }
};

const getCsrfToken = (): string => {
    const cookies = document.cookie.split(";");
    const csrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("XSRF-TOKEN="),
    );

    return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
};

const apiFetch = async (url: string, options: RequestInit = {}) => {
    await ensureCsrfCookie();

    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-XSRF-TOKEN": getCsrfToken(),
            ...(options.headers ?? {}),
        },
    });

    const responseText = await response.text();

    if (!response.ok) {
        throw new Error(
            `HTTP ${response.status}: ${responseText.substring(0, 160)}`,
        );
    }

    try {
        return JSON.parse(responseText);
    } catch {
        throw new Error("Invalid JSON response");
    }
};

const normalizeCenter = (center: RawCenter, fallbackActive = false): Center => {
    const domain = center.domain || center.subdomain || "";

    return {
        id: Number(center.id ?? 0),
        circleName: center.circleName || center.name || "غير محدد",
        managerEmail: center.managerEmail || center.email || "غير محدد",
        managerPhone: center.managerPhone || center.phone || "غير محدد",
        domain,
        circleLink:
            center.circleLink ||
            (domain ? `/${domain}/center-dashboard` : "/center-dashboard"),
        logo: center.logo || null,
        is_active: normalizeActiveFlag(center.is_active, fallbackActive),
        created_at: center.created_at || "",
        manager_name: center.manager_name || "",
    };
};

const extractCentersPayload = (result: any): RawCenter[] => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.centers)) return result.centers;
    if (Array.isArray(result?.data?.data)) return result.data.data;
    if (Array.isArray(result?.payload)) return result.payload;
    return [];
};

export const useCenters = () => {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCenters = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const endpoints = ["/api/v1/centers/all", "/admin/centers"];
            let normalizedCenters: Center[] = [];
            let lastError: unknown = null;

            for (const endpoint of endpoints) {
                try {
                    const result = await apiFetch(endpoint);
                    const rawCenters = extractCentersPayload(result);
                    const fallbackActive = endpoint === "/admin/centers";

                    if (rawCenters.length > 0) {
                        normalizedCenters = rawCenters.map((center) =>
                            normalizeCenter(center, fallbackActive),
                        );
                        break;
                    }

                    if (result?.success === true && rawCenters.length === 0) {
                        normalizedCenters = [];
                        break;
                    }
                } catch (endpointError) {
                    lastError = endpointError;
                }
            }

            if (!normalizedCenters.length && lastError) {
                throw lastError;
            }

            setCenters(normalizedCenters);
        } catch (err: any) {
            console.error("Failed to fetch centers:", err);
            setError(err?.message || "حدث خطأ في جلب المجمعات");
            setCenters([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCenters();
    }, [fetchCenters]);

    const refetch = useCallback(() => {
        fetchCenters();
    }, [fetchCenters]);

    const stats = {
        total: centers.length,
        active: centers.filter((center) => center.is_active).length,
        inactive: centers.filter((center) => !center.is_active).length,
        withManager: centers.filter(
            (center) => center.manager_name || center.managerEmail,
        ).length,
    };

    return {
        centers,
        loading,
        error,
        refetch,
        stats,
        getCsrfToken,
        apiFetch,
    };
};
