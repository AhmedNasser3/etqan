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

function getPortalCenterId(): number | null {
    const id = (window as any).__PORTAL_CENTER_ID__;
    return id ? Number(id) : null;
}

function getPortalMosqueId(): number | null {
    const id = (window as any).__PORTAL_MOSQUE_ID__;
    return id ? Number(id) : null;
}

function buildHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    };
    const centerId = getPortalCenterId();
    if (centerId) headers["X-Center-Id"] = String(centerId);
    const mosqueId = getPortalMosqueId();
    if (mosqueId) headers["X-Mosque-Id"] = String(mosqueId);
    return headers;
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

    const fetchStudents = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);

                const params = new URLSearchParams({
                    search: search || "",
                    grade: filterGrade === "الكل" ? "" : filterGrade,
                    status: filterStatus === "الكل" ? "" : filterStatus,
                    page: page.toString(),
                });

                // لو portal نضيف mosque_id كـ query param كمان
                const mosqueId = getPortalMosqueId();
                if (mosqueId) params.append("mosque_id", String(mosqueId));

                const response = await fetch(
                    `/api/v1/student-affairs?${params}`,
                    {
                        credentials: "include",
                        headers: buildHeaders(),
                    },
                );

                if (response.ok) {
                    const result: ApiResponse = await response.json();
                    setStudents(result.data || []);
                    setStats(result.stats || {});
                    setPagination({
                        current_page: result.current_page || 1,
                        last_page: result.last_page || 1,
                        total: result.total || 0,
                    });
                } else {
                    toast.error(
                        `خطأ ${response.status}: فشل في تحميل بيانات الطلاب`,
                    );
                }
            } catch (error) {
                toast.error("فشل في الاتصال بالخادم");
            } finally {
                setLoading(false);
            }
        },
        [search, filterGrade, filterStatus],
    );

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const sendWhatsappReminder = async (id: number, phone: string) => {
        try {
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
            if (response.ok) {
                const data = await response.json();
                window.open(data.whatsapp_url, "_blank");
                toast.success("تم فتح واتساب");
                return true;
            } else {
                toast.error("فشل في إرسال التذكير");
            }
        } catch {
            toast.error("خطأ في الاتصال");
        }
        return false;
    };

    const printCard = (id: number) => {
        window.open(`/api/v1/student-affairs/${id}/print-card`, "_blank");
        toast.success("جاري تحميل بطاقة الطالب...");
    };

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
        refetch: () => fetchStudents(),
    };
};
