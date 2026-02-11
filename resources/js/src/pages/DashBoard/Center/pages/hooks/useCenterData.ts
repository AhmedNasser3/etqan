// hooks/useCenterData.ts
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface Testimonial {
    id: number;
    img: string;
    name: string;
    title: string;
}

interface CenterStats {
    students: number;
    episodes: number;
    progress: number;
}

interface CenterData {
    center: {
        id: number;
        name: string;
    };
    stats: CenterStats;
    testimonials: Testimonial[];
    loading: boolean;
    error: string | null;
}

export const useCenterData = () => {
    const { centerSlug } = useParams();
    const [centerData, setCenterData] = useState<CenterData>({
        center: { id: 0, name: "" },
        stats: { students: 0, episodes: 0, progress: 0 },
        testimonials: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        const slug = centerSlug;

        if (!slug) {
            setCenterData({
                center: { id: 0, name: "إتقان - منصة القرآن الكريم" },
                stats: { students: 12345, episodes: 567, progress: 92 },
                testimonials: [
                    {
                        id: 1,
                        img: "https://via.placeholder.com/100",
                        name: "محمد أحمد",
                        title: "طالب حفظ قرآن",
                    },
                ],
                loading: false,
                error: null,
            });
            return;
        }

        const fetchCenterData = async () => {
            try {
                const response = await fetch(`/api/featured?slug=${slug}`, {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("فشل في جلب بيانات المجمع");
                }

                const data = await response.json();
                setCenterData({
                    center: data.center || { id: 0, name: slug },
                    stats: data.stats || {
                        students: 0,
                        episodes: 0,
                        progress: 0,
                    },
                    testimonials: data.testimonials || [],
                    loading: false,
                    error: null,
                });
            } catch (error) {
                console.error("Center data fetch error:", error);
                setCenterData({
                    center: { id: 0, name: slug },
                    stats: { students: 12345, episodes: 567, progress: 92 },
                    testimonials: [
                        {
                            id: 1,
                            img: "https://via.placeholder.com/100",
                            name: "محمد أحمد",
                            title: "طالب حفظ قرآن",
                        },
                    ],
                    loading: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "خطأ غير متوقع",
                });
            }
        };

        fetchCenterData();
    }, [centerSlug]);

    return centerData;
};
