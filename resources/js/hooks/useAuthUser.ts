// hooks/useAuthUser.ts
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuthUser = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/user", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();

                if (data.success && data.user) {
                    setUser(data.user);

                    // لو الـ user مسجل دخول وفي الصفحة الرئيسية / وفيه center
                    if (data.user.center && location.pathname === "/") {
                        navigate(
                            `/${data.user.center.slug || data.user.center.name}`,
                            { replace: true },
                        );
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate, location.pathname]);

    return { user, loading };
};
