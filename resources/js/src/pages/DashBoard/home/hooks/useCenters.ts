// hooks/useCenters.ts - شغال 100% مع الـ allCenters الجديد 🚀
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

export interface CenterStat {
    label: string;
    value: string;
    icon: React.ReactNode;
}

export interface CenterType {
    id: number;
    circleName: string;
    managerEmail: string;
    managerPhone: string;
    circleLink: string;
    domain: string;
    logo: string;
    countryCode: string;
    is_active: boolean;
    created_at: string;
}

export interface CenterComplex {
    id: number;
    title: string;
    description: string;
    img: string;
    subdomain: string;
    circleLink: string;
    stats: CenterStat[];
}

const useCenters = () => {
    const [centers, setCenters] = useState<CenterComplex[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [useDemoData, setUseDemoData] = useState(false);
    const isInitialLoad = useRef(true);
    const hasShownDemoToast = useRef(false);
    const hasShownApiToast = useRef(false);

    // ✅ Demo Data جاهز
    const demoCenters: CenterComplex[] = [
        {
            id: 1,
            title: "مجمع القرآن الكريم بالشارقة",
            description:
                "مجمع قرآني يركز على حفظ القرآن الكريم وتدريسه للأطفال والكبار.",
            img: "https://yt3.googleusercontent.com/n6vRPQ0akipMZ1zkcCvEWUpU1reKrNfNESHncsQJsDFiIyPkQeEZuc-DXRnQ1pKIci7XFh_Oow=s900-c-k-c0x00ffffff-no-rj",
            subdomain: "sharjah-quran",
            circleLink: "http://localhost:8000/sharjah-quran",
            stats: [
                { label: "الطلاب", value: "63", icon: null },
                { label: "المعلمين", value: "4", icon: null },
                { label: "الخطط", value: "19", icon: null },
                { label: "الكتب", value: "1,200", icon: null },
            ],
        },
        {
            id: 2,
            title: "مجمع الملك فهد لطباعة المصحف",
            description:
                "أكبر مجمع لطباعة وتوزيع المصاحف الشريفة مع برامج حفظ متقدمة.",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMQpLentR96boXCSpy9Qvzf5TttQjgggkjhg&s",
            subdomain: "kingfahad",
            circleLink: "http://localhost:8000/kingfahad",
            stats: [
                { label: "الطلاب", value: "1,250", icon: null },
                { label: "المعلمين", value: "85", icon: null },
                { label: "الخطط", value: "45", icon: null },
                { label: "المصاحف", value: "50M", icon: null },
            ],
        },
        {
            id: 3,
            title: "مركز الإمام الشافعي",
            description: "مركز متخصص في القراءات العشر وتعليم التجويد.",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5l66UixhcLVRMdW9S9CriXaQlN5CAubKrF9xR3KiBaXEDP218t3fpcHFH60QNqXF3f1s&usqp=CAU",
            subdomain: "shafie-center",
            circleLink: "http://localhost:8000/shafie-center",
            stats: [
                { label: "الطلاب", value: "320", icon: null },
                { label: "المعلمين", value: "22", icon: null },
                { label: "الخطط", value: "12", icon: null },
                { label: "القراءات", value: "10", icon: null },
            ],
        },
    ];

    // ✅ جلب من API الجديد /api/v1/super/all-centers
    const fetchFromApi = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get("/api/v1/super/all-centers", {
                headers: { Accept: "application/json" },
            });

            let apiCenters: CenterType[] = [];
            if (response.data.success && Array.isArray(response.data.data)) {
                apiCenters = response.data.data;
            } else if (Array.isArray(response.data)) {
                apiCenters = response.data;
            }

            if (apiCenters.length > 0) {
                const transformedCenters: CenterComplex[] = apiCenters.map(
                    (center: any) => ({
                        id: center.id,
                        title: center.circleName || "مجمع غير محدد",
                        description: `مجمع قرآني يقدم برامج حفظ وتجويد القرآن الكريم.`,
                        img:
                            center.logo ||
                            "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=مجمع",
                        subdomain: center.domain || "demo",
                        circleLink:
                            center.circleLink ||
                            `${window.location.origin}/demo`,
                        stats: [
                            { label: "الطلاب", value: "63", icon: null },
                            { label: "المعلمين", value: "4", icon: null },
                            { label: "الخطط", value: "19", icon: null },
                            { label: "الكتب", value: "1,200", icon: null },
                        ],
                    }),
                );

                setCenters(transformedCenters);
                if (isInitialLoad.current && !hasShownApiToast.current) {
                    hasShownApiToast.current = true;
                }
            } else {
                setCenters([]);
            }
        } catch (err: any) {
            console.error("API Error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ جلب البيانات الرئيسي
    const fetchCenters = useCallback(async () => {
        if (useDemoData) {
            setCenters(demoCenters);
            if (isInitialLoad.current && !hasShownDemoToast.current) {
                toast.success("✅ بيانات تجريبية");
                hasShownDemoToast.current = true;
            }
            setLoading(false);
            return;
        }

        try {
            await fetchFromApi();
        } catch {
            // ✅ Fallback لـ Demo تلقائي
            setCenters(demoCenters);
            setUseDemoData(true);
            if (isInitialLoad.current && !hasShownDemoToast.current) {
                toast.success("✅ بيانات تجريبية (API غير متاح)");
                hasShownDemoToast.current = true;
            }
            setLoading(false);
        }
    }, [useDemoData, fetchFromApi]);

    // ✅ useEffect مرة واحدة فقط
    useEffect(() => {
        isInitialLoad.current = true;
        fetchCenters();
        return () => {
            isInitialLoad.current = false;
        };
    }, []);

    const goToCenter = useCallback((subdomain: string) => {
        const centerUrl = `${window.location.origin}/${subdomain}`;
        window.open(centerUrl, "_blank", "noopener,noreferrer");
    }, []);

    const toggleDemoMode = useCallback(() => {
        setUseDemoData((prev) => {
            hasShownDemoToast.current = false;
            hasShownApiToast.current = false;
            return !prev;
        });
        // ✅ Refetch بعد التبديل
        setTimeout(() => fetchCenters(), 100);
    }, [fetchCenters]);

    return {
        centers,
        loading,
        error,
        refetch: fetchCenters,
        goToCenter,
        totalCenters: centers.length,
        useDemoData,
        toggleDemoMode,
    };
};

export default useCenters;
