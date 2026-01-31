// hooks/useDomainLinks.ts
import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

interface LinkData {
    id: number;
    type: string;
    url: string;
    qrCode: string;
    status: "active" | "inactive";
    usage: string;
    created: string;
    expires: string;
}

export const useDomainLinks = () => {
    const [links, setLinks] = useState<LinkData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // جلب user info و center_id
    const fetchUserCenter = useCallback(async () => {
        try {
            const response = await fetch("/api/user", {
                credentials: "include",
            });
            const result = await response.json();

            if (result.success && result.user?.center_id) {
                return result.user.center_id;
            }
            return null;
        } catch (error) {
            console.error("Failed to fetch user:", error);
            return null;
        }
    }, []);

    // جلب روابط المجمع
    const fetchLinks = useCallback(async (centerId: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/v1/route-customizations/${centerId}`,
            );
            const result = await response.json();

            if (result.success) {
                const customPaths = result.data;
                const baseUrl = window.location.origin;

                const generatedLinks: LinkData[] = [
                    {
                        id: 1,
                        type: "تسجيل مجمع",
                        url: `${baseUrl}/${centerId}/center-register`,
                        qrCode: `qr-center-${centerId}.png`,
                        status: "active",
                        usage: "125",
                        created: new Date().toISOString().split("T")[0],
                        expires: "2027-01-10",
                    },
                    {
                        id: 2,
                        type: "تسجيل طلاب",
                        url: `${baseUrl}/${centerId}/${customPaths?.student_register_path || "register/students"}`,
                        qrCode: `qr-students-${centerId}.png`,
                        status: "active",
                        usage: "89",
                        created: new Date().toISOString().split("T")[0],
                        expires: "2027-01-10",
                    },
                    {
                        id: 3,
                        type: "تسجيل موظفين",
                        url: `${baseUrl}/${centerId}/register/staff`,
                        qrCode: `qr-staff-${centerId}.png`,
                        status: "active",
                        usage: "34",
                        created: new Date().toISOString().split("T")[0],
                        expires: "2027-01-10",
                    },
                    {
                        id: 4,
                        type: "تسجيل معلمين",
                        url: `${baseUrl}/${centerId}/${customPaths?.teacher_register_path || "teacher-register"}`,
                        qrCode: `qr-teachers-${centerId}.png`,
                        status: customPaths?.is_active ? "active" : "inactive",
                        usage: "0",
                        created: new Date().toISOString().split("T")[0],
                        expires: "2027-01-15",
                    },
                ];

                setLinks(generatedLinks);
            }
        } catch (error) {
            console.error("Failed to fetch links:", error);
            toast.error("فشل في جلب روابط التسجيل");
        } finally {
            setLoading(false);
        }
    }, []);

    // تحديث حالة رابط
    const toggleStatus = useCallback(
        async (id: number, currentStatus: "active" | "inactive") => {
            setUpdating(true);
            try {
                const link = links.find((l) => l.id === id);
                if (!link) return;

                const newStatus =
                    currentStatus === "active" ? "inactive" : "active";

                setLinks((prev) =>
                    prev.map((l) =>
                        l.id === id
                            ? {
                                  ...l,
                                  status: newStatus as "active" | "inactive",
                              }
                            : l,
                    ),
                );

                toast.success("تم تحديث حالة الرابط بنجاح!");
            } catch (error) {
                console.error("Failed to update status:", error);
                toast.error("فشل في تحديث الحالة");
            } finally {
                setUpdating(false);
            }
        },
        [links],
    );

    // نسخ الرابط
    const copyToClipboard = useCallback((url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("تم نسخ الرابط بنجاح!");
    }, []);

    // تحميل البيانات عند تحميل الكومبوننت
    useEffect(() => {
        const loadData = async () => {
            const centerId = await fetchUserCenter();
            if (centerId) {
                fetchLinks(centerId);
            } else {
                setLoading(false);
                toast.error("لا يوجد مجمع مرتبط بالمستخدم");
            }
        };
        loadData();
    }, [fetchUserCenter, fetchLinks]);

    return {
        links,
        loading,
        updating,
        toggleStatus,
        copyToClipboard,
        refetch: () =>
            fetchUserCenter().then(
                (centerId) => centerId && fetchLinks(centerId),
            ),
    };
};
