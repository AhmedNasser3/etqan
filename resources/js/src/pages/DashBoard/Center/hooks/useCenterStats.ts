import { useState, useEffect } from "react";

interface DashboardStats {
    center_id: number;
    center_name: string;
    user_name: string;
    user_role: string;
    students: { total: number; diff: number; trend: "up" | "down" | "flat" };
    circles: { total: number; diff: number; trend: "up" | "down" | "flat" };
    mosques: number;
    teachers: number;
    pending_bookings: number;
    total_balance: number;
}

interface RecentCircle {
    id: number;
    name: string;
    mosque_name: string;
    teacher_name: string;
}

export const useCenterDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentCircles, setRecentCircles] = useState<RecentCircle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/v1/center/dashboard/stats", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            const json = await res.json();
            if (json.success) setStats(json.data);
            else setError(json.message);
        } catch {
            setError("فشل في جلب الإحصائيات");
        }
    };

    const fetchRecentCircles = async () => {
        try {
            const res = await fetch("/api/v1/center/dashboard/recent-circles", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            const json = await res.json();
            if (json.success) setRecentCircles(json.data);
        } catch {
            // silent
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchStats(), fetchRecentCircles()]).finally(() =>
            setLoading(false),
        );
    }, []);

    return { stats, recentCircles, loading, error, refetch: fetchStats };
};
