// hooks/useStudentAffairsPlatform.ts - ✅ مصحح كاملاً بدون ريلود
import { useState, useEffect, useCallback, useRef } from "react";

interface Student {
    id: number;
    name: string;
    idNumber: string;
    age: string;
    grade: string;
    circle: string;
    guardianName: string;
    guardianPhone: string;
    center_name: string;
    attendanceRate: string;
    balance: string;
    status: string;
    img: string;
    guardian_phone_formatted?: string;
}

interface Stats {
    totalStudents: number;
    activeStudents: number;
    pendingStudents: number;
    totalBalance: number;
    paymentRate: number;
}

export const useStudentAffairsPlatform = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterGrade, setFilterGrade] = useState("الكل");
    const [filterStatus, setFilterStatus] = useState("الكل");
    const [stats, setStats] = useState<Stats>({
        totalStudents: 0,
        activeStudents: 0,
        pendingStudents: 0,
        totalBalance: 0,
        paymentRate: 0,
    });
    const [grades, setGrades] = useState<string[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fetchRef = useRef(0); // لمنع الـ multiple calls

    // ✅ fetchStudents - محسن بدون infinite loop
    const fetchStudents = useCallback(async () => {
        const currentFetchId = ++fetchRef.current;

        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search.trim()) params.append("search", search.trim());
            if (filterGrade !== "الكل") params.append("grade", filterGrade);
            if (filterStatus !== "الكل") params.append("status", filterStatus);

            const url = `/api/v1/student-affairs-platform?${params.toString()}`;
            const res = await fetch(url, {
                headers: {
                    Accept: "application/json",
                },
            });

            // ✅ منع الـ stale data
            if (currentFetchId !== fetchRef.current) return;

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();

            if (data.data) setStudents(data.data);
            if (data.stats) setStats(data.stats);
            if (data.grades) setGrades(data.grades);
        } catch (error) {
            console.error("❌ خطأ في جلب بيانات الطلاب:", error);
            if (currentFetchId === fetchRef.current) {
                setStudents([]);
            }
        } finally {
            if (currentFetchId === fetchRef.current) {
                setLoading(false);
            }
        }
    }, []); // ✅ empty deps - مش محتاجين الـ state هنا

    // ✅ تحديث البيانات عند تغيير الفلاتر فقط
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            fetchStudents();
        }, 500);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [search, filterGrade, filterStatus, fetchStudents]);

    // ✅ تحميل البيانات عند الـ mount
    useEffect(() => {
        fetchStudents();
    }, []); // ✅ يشتغل مرة واحدة بس

    // ✅ WhatsApp تذكير - محسن
    const sendWhatsappReminder = useCallback(async (id: number) => {
        try {
            const res = await fetch(
                `/api/v1/student-affairs-platform/${id}/whatsapp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                },
            );

            const data = await res.json();
            if (data.success && data.whatsapp_url) {
                window.open(data.whatsapp_url, "_blank", "noopener,noreferrer");
                return true;
            }
            return false;
        } catch (error) {
            console.error("❌ خطأ في إرسال واتساب:", error);
            return false;
        }
    }, []);

    // ✅ طباعة البطاقة
    const printCard = useCallback((id: number) => {
        window.open(
            `/api/v1/student-affairs-platform/${id}/print-card`,
            "_blank",
            "noopener,noreferrer",
        );
    }, []);

    // ✅ تنظيف عند unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        students,
        loading,
        search,
        setSearch,
        filterGrade,
        setFilterGrade,
        filterStatus,
        setFilterStatus,
        stats,
        grades,
        sendWhatsappReminder,
        printCard,
        refetch: fetchStudents, // ✅ للـ manual refresh
    };
};
