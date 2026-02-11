import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

interface Permissions {
    dashboard: boolean;
    mosque: boolean | string[];
    staff: boolean | string[];
    financial: boolean | string[];
    domain: boolean;
    education: boolean;
    attendance: boolean;
    reports: boolean | string[];
    certificates: boolean;
    messages: boolean;
}

interface UserPermissions {
    permissions: Permissions;
    role: string | null;
    loading: boolean;
    error: string | null;
    hasPermission: (menuKey: string, subPath?: string) => boolean;
    refetch: () => Promise<void>;
}

export const usePermissions = (): UserPermissions => {
    const [permissions, setPermissions] = useState<Permissions>({
        dashboard: true,
        mosque: false,
        staff: false,
        financial: false,
        domain: false,
        education: false,
        attendance: false,
        reports: false,
        certificates: false,
        messages: false,
    });
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // ✅ Helper لجلب CSRF token محسن
    const getCsrfToken = useCallback((): string => {
        const metaToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
        if (metaToken) return metaToken;

        const csrfMeta = document
            .querySelector('meta[name="csrf"]')
            ?.getAttribute("content");
        if (csrfMeta) return csrfMeta;

        const csrfCookie = document.cookie
            .split(";")
            .find((row) => row.startsWith("XSRF-TOKEN"))
            ?.split("=")[1];
        if (csrfCookie) return decodeURIComponent(csrfCookie);

        console.warn("⚠️ CSRF token not found");
        return "";
    }, []);

    // ✅ Fetch function محسن زي usePlans بالضبط
    const fetchPermissions = useCallback(async (): Promise<void> => {
        // ✅ Abort previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const csrfToken = getCsrfToken();

            console.log(
                "🔍 Fetching permissions with CSRF:",
                csrfToken ? "✅ Found" : "❌ Missing",
            );

            const response = await fetch("/api/user/permissions", {
                method: "GET",
                signal: abortControllerRef.current.signal,
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-XSRF-TOKEN": csrfToken,
                },
            });

            // ✅ تحقق من response.ok الأول
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg =
                    errorData.message ||
                    `HTTP ${response.status}: ${response.statusText}`;
                console.error("❌ API Error:", errorMsg);
                toast.error(errorMsg);
                throw new Error(errorMsg);
            }

            // ✅ تحقق من content-type
            const contentType = response.headers.get("content-type");
            if (!contentType?.includes("application/json")) {
                const textResponse = await response.text();
                console.error(
                    "❌ Server returned HTML:",
                    textResponse.substring(0, 300),
                );
                toast.error("Server returned HTML page instead of JSON");
                throw new Error("Server returned HTML page instead of JSON");
            }

            const data = await response.json();
            console.log("✅ Permissions response:", data);

            if (data.success !== false) {
                setPermissions(data.permissions || {});
                setRole(data.role || null);
                toast;
            } else {
                throw new Error(data.message || "Failed to fetch permissions");
            }
        } catch (err: any) {
            if (err.name === "AbortError") {
                console.log("✅ Request aborted");
                return;
            }

            console.error("❌ Failed to fetch permissions:", err);
            setError(err.message || "Failed to fetch permissions");
            toast.error(err.message || "فشل في جلب الصلاحيات");

            // ✅ Default fallback permissions
            setPermissions({
                dashboard: true,
                mosque: ["students/approval"],
                staff: false,
                financial: false,
                domain: false,
                education: false,
                attendance: false,
                reports: false,
                certificates: false,
                messages: false,
            });
            setRole("teacher");
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [getCsrfToken]);

    // ✅ Permission checker محسن مع path cleaning
    const hasPermission = useCallback(
        (menuKey: string, subPath?: string): boolean => {
            const perm = permissions[menuKey as keyof Permissions];

            if (typeof perm === "boolean") {
                return perm;
            }

            if (Array.isArray(perm) && subPath) {
                const cleanSubPath = subPath
                    .replace("/center-dashboard/", "")
                    .replace("/api/", "");
                return perm.some((path) => cleanSubPath.includes(path));
            }

            return Array.isArray(perm) ? !!perm.length : false;
        },
        [permissions],
    );

    // ✅ Initial fetch
    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    // ✅ Debug effect
    useEffect(() => {
        console.log("🔍 Permissions state:", {
            permissions,
            role,
            loading,
            error,
        });
    }, [permissions, role, loading, error]);

    // ✅ Cleanup
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // ✅ Refetch function
    const refetch = useCallback(async () => {
        await fetchPermissions();
    }, [fetchPermissions]);

    return {
        permissions,
        role,
        loading,
        error,
        hasPermission,
        refetch,
    };
};
