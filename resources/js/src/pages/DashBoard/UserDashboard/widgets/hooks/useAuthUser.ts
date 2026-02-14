// hooks/useAuthUser.ts - محسّن
import { useState, useEffect, useCallback } from "react";

export const useAuthUser = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/user", {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    // ✅ Content-Type مش محتاج هنا لـ GET request
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
            setError("فشل في جلب بيانات اليوزر");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // ✅ Refresh function للـ manual refresh
    const refetch = useCallback(() => {
        fetchUser();
    }, [fetchUser]);

    // ✅ Logout function
    const logout = useCallback(async () => {
        try {
            await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
        }
    }, []);

    return {
        user,
        loading,
        error,
        refetch,
        logout,
        isAuthenticated: !!user,
    };
};
