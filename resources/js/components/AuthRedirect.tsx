// components/AuthRedirect.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";

const AuthRedirect = () => {
    const { user, loading } = useAuthUser();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && user?.center) {
            // لو مسجل دخول وفيه center، اجبره يروح للـ center page
            const centerPath = `/${user.center.slug || user.center.name}`;

            // بس لو مش في الـ center page حالياً
            if (location.pathname !== centerPath && location.pathname !== "/") {
                navigate(centerPath, { replace: true });
            }
        }
        // لو مش مسجل دخول، سيبه على /
    }, [user, loading, navigate, location.pathname]);

    if (loading) {
        return <div className="loading-center">جاري التحميل...</div>;
    }

    return null; // مش هيظهر حاجة، بس هيشتغل الـ redirect
};
