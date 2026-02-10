// hooks/useStudentAffairs.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface Student {
    id: number;
    name: string;
    idNumber: string;
    age: string;
    grade: string;
    circle: string;
    guardianName: string;
    guardianPhone: string;
    attendanceRate: string;
    balance: string;
    status: string;
    img: string;
}

interface ApiResponse {
    data: Student[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    stats: {
        totalStudents: number;
        activeStudents: number;
        pendingStudents: number;
        totalBalance: number;
        paymentRate: number;
    };
}

export const useStudentAffairs = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearchState] = useState("");
    const [filterGrade, setFilterGrade] = useState("الكل");
    const [filterStatus, setFilterStatus] = useState("الكل");
    const [stats, setStats] = useState<any>({});
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    // ✅ خطوة 1: جلب البيانات مع Debug
    const fetchStudents = useCallback(
        async (page = 1) => {
            console.log("🔍 [Frontend] بدء جلب الطلاب - الصفحة:", page);
            console.log("🔍 [Frontend] الفلاتر الحالية:", {
                search,
                filterGrade,
                filterStatus,
            });

            try {
                setLoading(true);

                // ✅ خطوة 2: بناء URL مع الفلاتر
                const params = new URLSearchParams({
                    search: search || "",
                    grade: filterGrade === "الكل" ? "" : filterGrade,
                    status: filterStatus === "الكل" ? "" : filterStatus,
                    page: page.toString(),
                });

                const apiUrl = `/api/v1/student-affairs?${params}`;
                console.log("📡 [Frontend] طلب API:", apiUrl);

                // ✅ خطوة 3: إرسال الطلب
                const response = await fetch(apiUrl, {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                });

                console.log(
                    "📊 [Frontend] استجابة الخادم - Status:",
                    response.status,
                );

                if (response.ok) {
                    // ✅ خطوة 4: معالجة البيانات
                    const result: ApiResponse = await response.json();
                    console.log("✅ [Frontend] تم جلب البيانات:", {
                        total: result.total,
                        studentsCount: result.data.length,
                        stats: result.stats,
                    });

                    // ✅ خطوة 5: تحديث الحالة
                    setStudents(result.data || []);
                    setStats(result.stats || {});
                    setPagination({
                        current_page: result.current_page || 1,
                        last_page: result.last_page || 1,
                        total: result.total || 0,
                    });

                    console.log(
                        "📝 [Frontend] تم تحديث الحالة - طلاب:",
                        result.data.length,
                    );
                } else {
                    // ✅ خطوة 6: معالجة الأخطاء
                    const errorText = await response.text();
                    console.error(
                        "❌ [Frontend] خطأ في الاستجابة:",
                        response.status,
                        errorText,
                    );
                    toast.error(
                        `خطأ ${response.status}: فشل في تحميل بيانات الطلاب`,
                    );
                }
            } catch (error) {
                console.error("💥 [Frontend] خطأ في الشبكة:", error);
                toast.error("فشل في الاتصال بالخادم");
            } finally {
                // ✅ خطوة 7: إنهاء التحميل
                setLoading(false);
                console.log("🏁 [Frontend] انتهى جلب الطلاب");
            }
        },
        [search, filterGrade, filterStatus],
    );

    // ✅ خطوة 8: تحميل البيانات عند بدء المكون
    useEffect(() => {
        console.log("🚀 [Frontend] تحميل أولي للطلاب");
        fetchStudents();
    }, [fetchStudents]);

    // ✅ خطوة 9: واتساب تذكير
    const sendWhatsappReminder = async (id: number, phone: string) => {
        console.log(
            "📱 [Frontend] بدء تذكير واتساب - طالب:",
            id,
            "هاتف:",
            phone,
        );

        try {
            const cleanPhone = phone.replace(/[^0-9]/g, "");
            const response = await fetch(
                `/api/v1/student-affairs/${id}/whatsapp`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                },
            );

            console.log("📱 [Frontend] استجابة واتساب:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log(
                    "✅ [Frontend] رابط واتساب جاهز:",
                    data.whatsapp_url,
                );
                window.open(data.whatsapp_url, "_blank");
                toast.success("تم فتح واتساب لتذكير ولي الأمر");
                return true;
            } else {
                console.error("❌ [Frontend] فشل واتساب:", response.status);
                toast.error("فشل في إرسال التذكير");
            }
        } catch (error) {
            console.error("💥 [Frontend] خطأ واتساب:", error);
            toast.error("خطأ في الاتصال بواتساب");
        }
        return false;
    };

    // ✅ خطوة 10: طباعة بطاقة
    const printCard = (id: number) => {
        console.log("🖨️ [Frontend] طباعة بطاقة الطالب:", id);
        window.open(`/api/v1/student-affairs/${id}/print-card`, "_blank");
        toast.success("جاري تحميل بطاقة الطالب...");
    };

    // ✅ خطوة 11: إعادة التحميل
    const refetch = () => {
        console.log("🔄 [Frontend] إعادة تحميل الطلاب");
        fetchStudents();
    };

    // ✅ العودة النهائية
    console.log("📋 [Frontend] حالة نهائية:", {
        students: students.length,
        loading,
        search,
        filterGrade,
        filterStatus,
        total: pagination.total,
    });

    return {
        students,
        loading,
        search,
        setSearch: setSearchState,
        filterGrade,
        setFilterGrade,
        filterStatus,
        setFilterStatus,
        stats,
        pagination,
        sendWhatsappReminder,
        printCard,
        refetch,
    };
};
