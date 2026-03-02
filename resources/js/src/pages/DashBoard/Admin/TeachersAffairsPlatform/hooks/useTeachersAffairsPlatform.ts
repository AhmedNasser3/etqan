// hooks/useTeachersAffairsPlatform.ts - ✅ بدون React Query
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface Teacher {
    id: number;
    name: string;
    teacherId: number;
    age: string;
    role: string;
    phone: string;
    center_name: string;
    center_id: number;
    email: string;
    attendanceRate: string;
    salaryStatus: string;
    status: string;
    img: string;
    phone_formatted: string;
}

interface Stats {
    totalTeachers: number;
    activeTeachers: number;
    pendingTeachers: number;
    totalSalary: number;
    paymentRate: number;
}

export const useTeachersAffairsPlatform = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("الكل");
    const [filterStatus, setFilterStatus] = useState("الكل");
    const [stats, setStats] = useState<Stats>({
        totalTeachers: 0,
        activeTeachers: 0,
        pendingTeachers: 0,
        totalSalary: 0,
        paymentRate: 0,
    });

    // جلب البيانات
    const fetchTeachers = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (filterRole !== "الكل") params.append("role", filterRole);
            if (filterStatus !== "الكل") params.append("status", filterStatus);

            const response = await fetch(
                `/api/v1/teachers-affairs-platform?${params}`,
            );
            if (!response.ok) throw new Error("فشل في جلب البيانات");

            const data = await response.json();
            setTeachers(data.data || []);
            setStats(data.stats || {});
        } catch (error) {
            console.error("خطأ في جلب المعلمين:", error);
            toast.error("فشل في جلب بيانات المعلمين");
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    }, [search, filterRole, filterStatus]);

    // تحديث البيانات عند تغيير الفلاتر
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchTeachers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [fetchTeachers]);

    // فلترة إضافية محلية
    const filteredTeachers = teachers.filter((teacher) => {
        const matchesRole =
            filterRole === "الكل" || teacher.role === filterRole;
        const matchesStatus =
            filterStatus === "الكل" || teacher.status === filterStatus;
        const matchesSearch =
            search === "" ||
            teacher.name.toLowerCase().includes(search.toLowerCase()) ||
            teacher.phone.includes(search);
        return matchesRole && matchesStatus && matchesSearch;
    });

    // إرسال تذكير واتساب
    const sendWhatsappReminder = useCallback(
        async (id: number, phone: string) => {
            try {
                const response = await fetch(
                    `/api/v1/teachers-affairs-platform/${id}/whatsapp`,
                    {
                        method: "POST",
                    },
                );
                const data = await response.json();
                if (data.success && data.whatsapp_url) {
                    window.open(data.whatsapp_url, "_blank");
                    toast.success("تم فتح واتساب بنجاح!");
                    return true;
                }
                return false;
            } catch (error) {
                console.error("خطأ في واتساب:", error);
                return false;
            }
        },
        [],
    );

    // طباعة البطاقة
    const printCard = useCallback(async (id: number) => {
        try {
            window.open(
                `/api/v1/teachers-affairs-platform/${id}/print-card`,
                "_blank",
            );
        } catch (error) {
            toast.error("فشل في طباعة البطاقة");
        }
    }, []);

    return {
        teachers: filteredTeachers,
        loading,
        search,
        setSearch,
        filterRole,
        setFilterRole,
        filterStatus,
        setFilterStatus,
        stats,
        sendWhatsappReminder,
        printCard,
        total: stats.totalTeachers,
        refetch: fetchTeachers,
    };
};
