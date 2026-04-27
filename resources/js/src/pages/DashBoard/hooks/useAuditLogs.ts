// src/pages/Reports/AuditLogs/hooks/useAuditLogs.ts
import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

export interface AuditLog {
    id: number;
    created_at: string;
    user_id: number;
    user_name: string;
    user_email: string;
    action: string | null;
    model_type: string;
    model_id: number;
    ip_address: string | null;
    user_agent: string | null;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
}

export interface AuditLogDisplay {
    id: number;
    timestamp: string;
    userName: string;
    userRole: string;
    action: string;
    resource: string;
    details: string;
    ipAddress: string;
    status: "نجح" | "فشل" | "تحذير";
    userImg: string;
}

interface Stats {
    total: number;
    success: number;
    failed: number;
    warnings: number;
}

interface ApiResponse {
    success: boolean;
    data: {
        period: string;
        total_logs: number;
        logs: AuditLog[];
    };
}

export const useAuditLogs = () => {
    const [logs, setLogs] = useState<AuditLogDisplay[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        success: 0,
        failed: 0,
        warnings: 0,
    });
    const [period, setPeriod] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<
        "الكل" | "نجح" | "فشل" | "تحذير"
    >("الكل");
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchAuditLogs = useCallback(async (periodParam: string = "") => {
        setLoading(true);
        try {
            //  الـ endpoint الصحيح للـ web routes
            const url = `/api/v1/reports/audit-logs/${periodParam || ""}`;
            console.log("🔍 Fetching audit logs from:", url);

            const response = await fetch(url, {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Response error:", response.status, errorText);
                toast.error("حدث خطأ في جلب السجلات");
                return;
            }

            const result: ApiResponse = await response.json();
            console.log(" Audit logs loaded:", result);

            if (result.success && result.data?.logs) {
                const processedLogs: AuditLogDisplay[] = result.data.logs.map(
                    (log: AuditLog) => ({
                        id: log.id,
                        timestamp: new Date(log.created_at).toLocaleString(
                            "ar-EG",
                        ),
                        userName: log.user_name || "نظام",
                        userRole: getUserRole(log.user_id, log.user_email),
                        action: translateAction(log.action, log.model_type),
                        resource: formatResource(log.model_type, log.model_id),
                        details: formatDetails(log.old_values, log.new_values),
                        ipAddress: log.ip_address || "غير معروف",
                        status: determineStatus(log),
                        userImg: getUserAvatar(log.user_name),
                    }),
                );

                setLogs(processedLogs);

                const statsData: Stats = {
                    total: processedLogs.length,
                    success: processedLogs.filter((l) => l.status === "نجح")
                        .length,
                    failed: processedLogs.filter((l) => l.status === "فشل")
                        .length,
                    warnings: processedLogs.filter((l) => l.status === "تحذير")
                        .length,
                };

                setStats(statsData);
                setPeriod(result.data.period || periodParam);

                toast.success(`تم جلب ${processedLogs.length} سجل تدقيق`);
            } else {
                setLogs([]);
                toast.info("لا توجد سجلات تدقيق حتى الآن");
            }
        } catch (error: any) {
            console.error("❌ Error fetching audit logs:", error);
            toast.error("فشل في جلب سجلات التدقيق");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const searchLogs = useCallback((term: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            setSearchTerm(term);
        }, 500);
    }, []);

    const changePeriod = useCallback(
        (newPeriod: string) => {
            setPeriod(newPeriod);
            fetchAuditLogs(newPeriod);
        },
        [fetchAuditLogs],
    );

    const clearLogs = useCallback(async () => {
        if (
            !window.confirm(
                "هل أنت متأكد من مسح جميع سجلات التدقيق؟ هذا الإجراء لا يمكن التراجع عنه!",
            )
        )
            return;

        setLoading(true);
        try {
            const response = await fetch("/api/v1/reports/audit-logs/clear", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const result = await response.json();
                setLogs([]);
                setStats({ total: 0, success: 0, failed: 0, warnings: 0 });
                toast.success(result.message || "تم مسح جميع السجلات بنجاح!");
                fetchAuditLogs(); // Refresh
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || "فشل في مسح السجلات");
            }
        } catch (error) {
            console.error("❌ Error clearing logs:", error);
            toast.error("خطأ في مسح السجلات");
        } finally {
            setLoading(false);
        }
    }, [fetchAuditLogs]);

    const exportLogs = useCallback(async () => {
        setLoading(true);
        try {
            //  استخدم الـ web route الصحيح
            const url = `/api/v1/reports/audit-logs/export/${period || ""}`;
            console.log("🔍 Exporting from:", url);

            const response = await fetch(url, {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const result = await response.json();
                toast.success(
                    `تم تصدير ${result.total_exported || 0} سجل بنجاح!`,
                );
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || "فشل في التصدير");
            }
        } catch (error) {
            console.error("❌ Error exporting logs:", error);
            toast.error("خطأ في التصدير");
        } finally {
            setLoading(false);
        }
    }, [period]);

    const filteredLogs = useCallback((): AuditLogDisplay[] => {
        return logs.filter(
            (log) =>
                (log.userName.includes(searchTerm) ||
                    log.action.includes(searchTerm) ||
                    log.resource.includes(searchTerm) ||
                    log.details.includes(searchTerm)) &&
                (filterStatus === "الكل" || log.status === filterStatus),
        );
    }, [logs, searchTerm, filterStatus]);

    const refetch = useCallback(() => {
        fetchAuditLogs(period);
    }, [fetchAuditLogs, period]);

    // Initial load
    useEffect(() => {
        fetchAuditLogs();
    }, [fetchAuditLogs]);

    // Filter effect
    useEffect(() => {
        const filtered = filteredLogs();
        setStats({
            total: filtered.length,
            success: filtered.filter((l) => l.status === "نجح").length,
            failed: filtered.filter((l) => l.status === "فشل").length,
            warnings: filtered.filter((l) => l.status === "تحذير").length,
        });
    }, [logs, searchTerm, filterStatus, filteredLogs]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return {
        logs,
        loading,
        stats,
        period,
        searchTerm,
        filterStatus,
        setFilterStatus,
        fetchAuditLogs,
        searchLogs,
        changePeriod,
        clearLogs,
        exportLogs,
        filteredLogs: filteredLogs(),
        refetch,
    };
};

// 🔥 Helper Functions محدثة للبيانات الفعلية
const getUserRole = (userId: number, email: string): string => {
    if (userId === 0) return "نظام";
    if (!email || email === "غير معروف") return "مستخدم";
    if (email.includes("@admin")) return "مدير النظام";
    if (email.includes("@teacher")) return "معلم";
    if (email.includes("@supervisor")) return "مشرف";
    return "مستخدم";
};

const translateAction = (action: string | null, modelType: string): string => {
    if (!action) {
        // Detect action from model changes
        const typeName =
            modelType.split("\\").pop()?.replace("Model", "") || "";
        if (typeName.includes("Student")) return "إنشاء طالب";
        if (typeName.includes("User")) return "إنشاء مستخدم";
        if (typeName.includes("Mosque")) return "تعديل مسجد";
        if (typeName.includes("Center")) return "إنشاء مركز";
        return "عملية نظامية";
    }

    const translations: Record<string, string> = {
        created: "إنشاء",
        updated: "تعديل",
        deleted: "حذف",
        login: "تسجيل دخول",
        logout: "تسجيل خروج",
        create_user: "إنشاء مستخدم",
        create_student: "إنشاء طالب",
        create_center: "إنشاء مركز",
    };

    return (
        translations[action.toLowerCase() as keyof typeof translations] ||
        action ||
        "عملية"
    );
};

const formatResource = (modelType: string, modelId: number): string => {
    const modelNames: Record<string, string> = {
        "App\\Models\\Tenant\\Student": "طالب",
        "App\\Models\\Auth\\User": "مستخدم",
        "App\\Models\\Tenant\\Mosque": "مسجد",
        "App\\Models\\Tenant\\Center": "مركز",
        "App\\Models\\Teachers\\AttendanceDay": "حضور معلم",
    };

    const name =
        modelNames[modelType] ||
        modelType
            .split("\\")
            .pop()
            ?.replace("Model", "")
            ?.replace("Tenant", "")
            ?.replace("Auth", "") ||
        "عير معروف";

    return `${name} (ID: ${modelId})`;
};

const formatDetails = (oldValues: any, newValues: any): string => {
    if (!oldValues && !newValues) return "عملية ناجحة";

    const changes: string[] = [];
    const allKeys = new Set([
        ...Object.keys(oldValues || {}),
        ...Object.keys(newValues || {}),
    ]);

    allKeys.forEach((key) => {
        const oldVal = oldValues?.[key];
        const newVal = newValues?.[key];

        if (oldVal !== newVal && oldVal !== undefined && newVal !== undefined) {
            const oldDisplay = String(oldVal || "").slice(0, 20);
            const newDisplay = String(newVal || "").slice(0, 20);

            // Arabic field names
            const fieldNames: Record<string, string> = {
                name: "الاسم",
                first_name: "الاسم الأول",
                family_name: "الاسم العائلي",
                email: "البريد الإلكتروني",
                phone: "الهاتف",
                circle: "الحلقة",
                halaqa: "الحلقة",
                notes: "ملاحظات",
            };

            const fieldName = fieldNames[key] || key;
            changes.push(`${fieldName}: "${oldDisplay}" → "${newDisplay}"`);
        }
    });

    return changes.length > 0
        ? changes.slice(0, 2).join(" | ") + (changes.length > 2 ? "..." : "")
        : oldValues
          ? "حذف"
          : "إنشاء";
};

const determineStatus = (log: AuditLog): "نجح" | "فشل" | "تحذير" => {
    const action = log.action?.toLowerCase() || "";
    if (action.includes("delete") || action.includes("deleted")) return "تحذير";
    if (log.user_id === 0) return "نجح"; // System actions
    return "نجح";
};

const getUserAvatar = (name: string): string => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "نظام")}&size=40&background=4f46e5&color=fff&font-size=0.6`;
};
