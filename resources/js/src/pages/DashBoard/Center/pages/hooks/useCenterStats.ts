import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface CenterStats {
    students: number;
    episodes: number;
    progress: number;
    loading: boolean;
    error: string | null;
}

export const useCenterStats = () => {
    const { centerSlug } = useParams();
    const [stats, setStats] = useState<CenterStats>({
        students: 0,
        episodes: 0,
        progress: 0,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const slug = centerSlug;

        if (!slug) {
            setStats({
                students: 12345,
                episodes: 567,
                progress: 92,
                loading: false,
                error: null,
            });
            return;
        }

        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/featured?slug=${slug}`, {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("فشل في جلب إحصائيات المجمع");
                }

                const data = await response.json();
                setStats({
                    students: data.stats.students || 0,
                    episodes: data.stats.episodes || 0,
                    progress: data.stats.progress || 0,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                console.error("Stats fetch error:", error);
                setStats({
                    students: 12345,
                    episodes: 567,
                    progress: 92,
                    loading: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "خطأ غير متوقع",
                });
            }
        };

        fetchStats();
    }, [centerSlug]);

    return stats;
};
