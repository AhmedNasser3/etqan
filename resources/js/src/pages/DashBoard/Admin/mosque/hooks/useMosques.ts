// hooks/useMosques.ts
import { useState, useEffect } from "react";

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

export const useMosques = () => {
    const [mosques, setMosques] = useState<Mosque[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMosques = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Fetching from: /api/super/mosques");

            const response = await fetch("/api/super/mosques", {
                headers: {
                    Accept: "application/json",
                },
            });

            const responseText = await response.text();
            console.log("Response status:", response.status);
            console.log("Response text:", responseText.substring(0, 200));

            if (!response.ok) {
                throw new Error(
                    `خطأ ${response.status}: ${response.statusText}`,
                );
            }

            const result = JSON.parse(responseText);

            if (result.success) {
                setMosques(result.data || []);
            } else {
                setError(result.message || "فشل في جلب المساجد");
            }
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError(err.message || "حدث خطأ في جلب المساجد");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMosques();
    }, []);

    const refetch = () => fetchMosques();

    return {
        mosques,
        loading,
        error,
        refetch,
        stats: {
            total: mosques.length,
            active: mosques.filter((m) => m.is_active).length,
        },
    };
};
