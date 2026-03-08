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
    const { centerSlug } = useParams<{ centerSlug?: string }>();
    const [centerData, setCenterData] = useState<CenterData>({
        center: { id: 0, name: "إتقان - منصة القرآن الكريم" },
        stats: { students: 12345, episodes: 567, progress: 92 },
        testimonials: [], // فارغ في البداية
        loading: true,
        error: null,
    });

    useEffect(() => {
        console.log("🔍 CenterSlug:", centerSlug); // للتشخيص

        // دايماً نزود بيانات تجريبية أولاً
        setCenterData((prev) => ({
            ...prev,
            testimonials: [
                {
                    id: 1,
                    img: "https://via.placeholder.com/100",
                    name: "محمد أحمد",
                    title: "طالب حفظ قرآن",
                },
                {
                    id: 2,
                    img: "https://via.placeholder.com/100",
                    name: "فاطمة محمد",
                    title: "حافظة قرآن كريم",
                },
                {
                    id: 3,
                    img: "https://via.placeholder.com/100",
                    name: "عبدالله علي",
                    title: "طالب تفسير",
                },
                {
                    id: 4,
                    img: "https://via.placeholder.com/100",
                    name: "نور السيد",
                    title: "طالبة تجويد",
                },
                {
                    id: 5,
                    img: "https://via.placeholder.com/100",
                    name: "أحمد خالد",
                    title: "حافظ قرآن",
                },
            ],
            loading: false, // ❌ هنا السر!
            error: null,
        }));

        // لو عايز API، استخدم هذا (اختياري)
        if (centerSlug) {
            const fetchCenterData = async () => {
                try {
                    console.log(
                        "📡 Fetching from:",
                        `/api/featured?slug=${centerSlug}`,
                    );

                    const response = await fetch(
                        `/api/featured?slug=${centerSlug}`,
                        {
                            credentials: "include",
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                            },
                        },
                    );

                    console.log("📡 Response status:", response.status);

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    const data = await response.json();
                    console.log("📡 API Data:", data);

                    setCenterData({
                        center: data.center || { id: 0, name: centerSlug },
                        stats: data.stats || {
                            students: 0,
                            episodes: 0,
                            progress: 0,
                        },
                        testimonials: data.testimonials || [
                            // fallback data
                            {
                                id: 1,
                                img: "",
                                name: "محمد أحمد",
                                title: "طالب",
                            },
                        ],
                        loading: false,
                        error: null,
                    });
                } catch (error) {
                    console.error("❌ API Error:", error);
                    // مش هنعطل التحميل بسبب API
                    setCenterData((prev) => ({
                        ...prev,
                        error: "فشل في جلب البيانات من الخادم",
                        loading: false,
                    }));
                }
            };

            // تأخير بسيط للتجربة
            const timer = setTimeout(fetchCenterData, 500);
            return () => clearTimeout(timer);
        }
    }, [centerSlug]);

    console.log("🎯 Final CenterData:", centerData);
    return centerData;
};
