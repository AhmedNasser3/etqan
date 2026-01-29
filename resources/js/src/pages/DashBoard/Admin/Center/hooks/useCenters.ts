// hooks/useCenters.ts - بدون تحقق من token خالص
import { useState, useEffect } from "react";

interface Center {
    id: number;
    circleName: string;
    managerName: string;
    managerEmail: string;
    managerPhone: string;
    circleLink: string;
    domain: string;
    logo: string;
    countryCode: string;
    is_active: boolean;
    students_count: number;
    address?: string;
}

export const useCenters = () => {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCenters = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Fetching from: /api/super/centers");

            const response = await fetch("/api/super/centers", {
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
                setCenters(result.data || []);
            } else {
                setError(result.message || "فشل في جلب المجمعات");
            }
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError(err.message || "حدث خطأ في جلب المجمعات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    const refetch = () => fetchCenters();

    return {
        centers,
        loading,
        error,
        refetch,
        stats: {
            total: centers.length,
            active: centers.filter((c) => c.is_active).length,
            students: centers.reduce(
                (sum, c) => sum + (c.students_count || 0),
                0,
            ),
        },
    };
};
