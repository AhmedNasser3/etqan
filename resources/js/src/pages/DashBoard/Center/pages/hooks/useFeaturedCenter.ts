import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface CenterInfo {
    id: number;
    name: string;
    loading: boolean;
    error: string | null;
}

export const useFeaturedCenter = () => {
    const { centerSlug } = useParams();
    const [centerInfo, setCenterInfo] = useState<CenterInfo>({
        id: 0,
        name: "جاري التحميل...",
        loading: true,
        error: null,
    });

    useEffect(() => {
        const slug = centerSlug;

        // لو مفيش slug يعرض CentersPage الافتراضي
        if (!slug) {
            setCenterInfo({
                id: 0,
                name: "إتقان - منصة القرآن الكريم",
                loading: false,
                error: null,
            });
            return;
        }

        const fetchCenter = async () => {
            try {
                const response = await fetch(`/api/featured?slug=${slug}`, {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.error || "فشل في جلب بيانات المجمع",
                    );
                }

                const data = await response.json();
                setCenterInfo({
                    id: data.center.id,
                    name: data.center.name,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                console.error("Center fetch error:", error);
                setCenterInfo({
                    id: 0,
                    name: slug.charAt(0).toUpperCase() + slug.slice(1), // capitalize الـ slug
                    loading: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "خطأ غير متوقع",
                });
            }
        };

        fetchCenter();
    }, [centerSlug]);

    return centerInfo;
};
