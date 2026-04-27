import React, { useState, useEffect } from "react";
import { ICO } from "../../pages/DashBoard/icons";
import { usePermissions } from "./hooks/usePermissions";

interface CenterSidebarProps {
    mobileSB: boolean;
    setMobileSB: React.Dispatch<React.SetStateAction<boolean>>;
}

interface MeInfo {
    name: string;
    role: string;
    centerName: string;
    avatar: string;
}

// ── ترجمة المسميات الوظيفية ───────────────────────────────────────────────
function translateRole(user: any): string {
    // أولاً: لو center_owner
    const roleName = user.role?.name ?? "";
    if (roleName === "center_owner") return "مدير المجمع";

    // ثانياً: لو عنده teacher record — نترجم role الـ teacher
    const teacherRole = user.teacher?.role ?? "";
    const teacherRoleMap: Record<string, string> = {
        teacher: "معلم قرآن",
        quran_teacher: "معلم قرآن",
        supervisor: "مشرف تعليمي",
        admin: "مدير إداري",
        coordinator: "منسق",
        assistant: "مساعد معلم",
        accountant: "محاسب",
        secretary: "سكرتير",
        it: "مسؤول تقنية",
        social_worker: "أخصائي اجتماعي",
        manager: "مدير",
        vice_manager: "نائب المدير",
        staff: "موظف",
    };
    if (teacherRole && teacherRoleMap[teacherRole]) {
        return teacherRoleMap[teacherRole];
    }

    // ثالثاً: title_ar من الـ role لو موجود
    if (user.role?.title_ar) return user.role.title_ar;

    // رابعاً: fallback لبقية الـ roles
    const roleNameMap: Record<string, string> = {
        super_admin: "مدير النظام",
        mosque_admin: "مدير مسجد",
        guardian: "ولي أمر",
        student: "طالب",
        teacher: "معلم",
    };

    return roleNameMap[roleName] || roleName || "مشرف";
}

const CenterSidebar: React.FC<CenterSidebarProps> = ({
    mobileSB,
    setMobileSB,
}) => {
    const [sidebarMini, setSidebarMini] = useState(false);
    const [page, setPage] = useState("overview");
    const [me, setMe] = useState<MeInfo>({
        name: "",
        role: "",
        centerName: "",
        avatar: "",
    });

    const { loading, hasPermission } = usePermissions();

    // ── جيب بيانات الـ user الحقيقية ─────────────────────────────────────
    useEffect(() => {
        fetch("/api/user", {
            credentials: "include",
            headers: { Accept: "application/json" },
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (!data) return;
                const user = data.user || data;
                setMe({
                    name: user.name ?? "",
                    role: translateRole(user),
                    centerName: user.center?.name ?? "",
                    avatar: user.name ? user.name.charAt(0) : "م",
                });
            })
            .catch(() => {});
    }, []);

    // ── Active page detection ─────────────────────────────────────────────
    useEffect(() => {
        if (loading) return;
        const p = window.location.pathname;
        if (p.includes("students/approval"))
            setPage("circle-manegment/approval");
        else if (p.includes("booking-manegment")) setPage("booking-manegment");
        else if (p.includes("staff-approval")) setPage("staff-approval");
        else if (p.includes("staff-attendance")) setPage("staff-attendance");
        else if (p.includes("user-suspend")) setPage("educational");
        else if (p.includes("financial-dashboard")) setPage("finance");
        else if (p.includes("teaceher-salary-manegment"))
            setPage("teaceher-salary-manegment");
        else if (p.includes("custom-salary-manegment"))
            setPage("custom-salary-manegment");
        else if (p.includes("education-supervisor")) setPage("educational");
        else if (p.includes("special-request-manegment"))
            setPage("special-request-manegment");
        else if (p.includes("plan-transfer-management"))
            setPage("plan-transfer-management");
        else if (p.includes("achieve-manegment")) setPage("achieve-manegment");
        else if (p.includes("student-supervisor")) setPage("students");
        else if (p.includes("audit-log") || p.includes("audit"))
            setPage("audit");
        else if (p.includes("mosque-manegment")) setPage("mosque-manegment");
        else if (p.includes("circle-manegment")) setPage("circles");
        else if (p.includes("plans-details-manegment"))
            setPage("plans-details");
        else if (p.includes("plans-manegment")) setPage("plans");
        else if (p.includes("shedule-manegment")) setPage("schedules");
        else if (p.includes("teachers-management")) setPage("teachers");
        else setPage("overview");
    }, [loading, hasPermission]);

    const NAV_ITEMS = [
        {
            sec: "الرئيسية",
            permissionKey: null,
            items: [
                {
                    id: "overview",
                    path: "/center-dashboard",
                    lbl: "لوحة التحكم",
                    ico: "grid",
                    badge: null,
                    permissionKey: null,
                    permissionPath: null,
                },
                {
                    id: "itqan",
                    path: "/",
                    lbl: "مجمعك الرئيسي",
                    ico: "grid",
                    badge: null,
                    permissionKey: null,
                    permissionPath: null,
                },
            ],
        },
        {
            sec: "الأكاديمية",
            permissionKey: "mosque",
            items: [
                {
                    id: "mosque-manegment",
                    path: "/center-dashboard/mosque-manegment",
                    lbl: "إدارة المساجد",
                    ico: "mosque",
                    badge: null,
                    permissionKey: "mosque",
                    permissionPath: "/center-dashboard/mosque-manegment",
                },
                {
                    id: "portal/mosqou",
                    path: "/center-dashboard/portal/mosqou",
                    lbl: "إنشاء رابط مسجد",
                    ico: "mosque",
                    badge: null,
                    permissionKey: "mosque",
                    permissionPath: "/center-dashboard/mosque-manegment",
                },
                {
                    id: "circles",
                    path: "/center-dashboard/circle-manegment",
                    lbl: "إدارة الحلقات",
                    ico: "globe",
                    badge: null,
                    permissionKey: "mosque",
                    permissionPath: "/center-dashboard/circle-manegment",
                },
                {
                    id: "plans",
                    path: "/center-dashboard/plans-manegment",
                    lbl: "إدارة الخطط",
                    ico: "book",
                    badge: null,
                    permissionKey: "mosque",
                    permissionPath: "/center-dashboard/plans-manegment",
                },
                {
                    id: "plans-details",
                    path: "/center-dashboard/plans-details-manegment",
                    lbl: "إدارة تفاصيل الخطط",
                    ico: "book",
                    badge: null,
                    permissionKey: "mosque",
                    permissionPath: "/center-dashboard/plans-details-manegment",
                },
                {
                    id: "schedules",
                    path: "/center-dashboard/shedule-manegment",
                    lbl: "مواعيد الحلقات",
                    ico: "cal",
                    badge: null,
                    permissionKey: "mosque",
                    permissionPath: "/center-dashboard/shedule-manegment",
                },
            ],
        },
        {
            sec: "الموظفون",
            permissionKey: "staff",
            items: [
                {
                    id: "teachers",
                    path: "/center-dashboard/teachers-management",
                    lbl: "المعلمون والموظفون",
                    ico: "users",
                    badge: null,
                    permissionKey: "staff",
                    permissionPath: "/center-dashboard/teachers-management",
                },
                {
                    id: "staff-approval",
                    path: "/center-dashboard/staff-approval",
                    lbl: "قبول الموظفون",
                    ico: "users",
                    badge: null,
                    permissionKey: "staff",
                    permissionPath: "/center-dashboard/staff-approval",
                },
                {
                    id: "teachers-work-shedule",
                    path: "/center-dashboard/teachers-work-shedule",
                    lbl: "مواعيد عمل الموظفون",
                    ico: "users",
                    badge: null,
                    permissionKey: "staff",
                    permissionPath: "/center-dashboard/staff-attendance",
                },
                {
                    id: "staff-attendance",
                    path: "/center-dashboard/staff-attendance",
                    lbl: "حضور الموظفون",
                    ico: "users",
                    badge: null,
                    permissionKey: "staff",
                    permissionPath: "/center-dashboard/staff-attendance",
                },
                {
                    id: "educational",
                    path: "/center-dashboard/user-suspend",
                    lbl: "مستخدمين معطلين",
                    ico: "star",
                    badge: null,
                    permissionKey: "staff",
                    permissionPath: "/center-dashboard/user-suspend",
                },
                {
                    id: "finance",
                    path: "/center-dashboard/financial-dashboard",
                    lbl: "اللوحة المالية",
                    ico: "money",
                    badge: null,
                    permissionKey: "financial",
                    permissionPath: "/center-dashboard/financial-dashboard",
                },
                {
                    id: "teaceher-salary-manegment",
                    path: "/center-dashboard/teaceher-salary-manegment",
                    lbl: "قواعد الرواتب",
                    ico: "rules",
                    badge: null,
                    permissionKey: "financial",
                    permissionPath:
                        "/center-dashboard/teaceher-salary-manegment",
                },
                {
                    id: "custom-salary-manegment",
                    path: "/center-dashboard/custom-salary-manegment",
                    lbl: "الرواتب المخصصة",
                    ico: "custom",
                    badge: null,
                    permissionKey: "financial",
                    permissionPath: "/center-dashboard/custom-salary-manegment",
                },
            ],
        },
        {
            sec: "إدارة الطلاب",
            permissionKey: null,
            items: [
                {
                    id: "students",
                    path: "/center-dashboard/student-supervisor",
                    lbl: "شؤون الطلاب",
                    ico: "student",
                    badge: { n: 5, cls: "grn" },
                    permissionKey: "reports",
                    permissionPath: null,
                },
                {
                    id: "plan-transfer-management",
                    path: "/center-dashboard/plan-transfer-management",
                    lbl: "نقل الطلاب من الحلقات",
                    ico: "clipboard",
                    badge: { n: 2, cls: "red" },
                    permissionKey: "mosque",
                    permissionPath: "/center-dashboard/booking-manegment",
                },
                {
                    id: "student-rewards",
                    path: "/center-dashboard/student-rewards",
                    lbl: "ادارة الجوائز",
                    ico: "clipboard",
                    badge: { n: 2, cls: "red" },
                    permissionKey: "mosque",
                    permissionPath: "/center-dashboard/booking-manegment",
                },
                {
                    id: "booking-manegment",
                    path: "/center-dashboard/booking-manegment",
                    lbl: "طلبات الاشتراك",
                    ico: "clipboard",
                    badge: { n: 2, cls: "red" },
                    permissionKey: "mosque",
                    permissionPath: "/center-dashboard/booking-manegment",
                },
                {
                    id: "special-request-manegment",
                    path: "/center-dashboard/special-request-manegment",
                    lbl: "طلب حلقة خاصة",
                    ico: "student",
                    badge: { n: 5, cls: "grn" },
                    permissionKey: "education",
                    permissionPath:
                        "/center-dashboard/special-request-manegment",
                },
                {
                    id: "circle-manegment/approval",
                    path: "/center-dashboard/circle-manegment/approval",
                    lbl: "طلبات التسجيل",
                    ico: "star",
                    badge: null,
                    permissionKey: "education",
                    permissionPath: "/center-dashboard/students/approval",
                },
                {
                    id: "achieve-manegment",
                    path: "/center-dashboard/achieve-manegment",
                    lbl: "التحفيزات",
                    ico: "star",
                    badge: null,
                    permissionKey: "attendance",
                    permissionPath: null,
                },
            ],
        },
        {
            sec: "الحساب",
            permissionKey: null,
            items: [
                {
                    id: "account",
                    path: "/account",
                    lbl: "إعدادات الحساب",
                    ico: "person",
                    badge: null,
                    permissionKey: null,
                    permissionPath: null,
                },
            ],
        },
    ];

    const nav = (path: string, id: string) => {
        window.location.href = path;
        setPage(id);
        setMobileSB(false);
    };

    return (
        <>
            {mobileSB && (
                <div
                    className="sb-overlay on"
                    onClick={() => setMobileSB(false)}
                />
            )}
            <aside
                className={`sb${sidebarMini ? " mini" : ""}${mobileSB ? " mobile-open" : ""}`}
                id="sb"
            >
                <div
                    className="sb-brand"
                    onClick={() => setSidebarMini((p) => !p)}
                    title="طي القائمة"
                >
                    <div className="sb-logo">
                        <svg viewBox="0 0 24 24" fill="#fff">
                            <path d="M12 2a9 9 0 0 1 9 9c0 4.5-3 8.7-6.3 11.3a4.2 4.2 0 0 1-5.4 0C6 19.7 3 15.5 3 11a9 9 0 0 1 9-9z" />
                        </svg>
                    </div>
                    <span className="sb-brand-name sb-lbl">
                        إتقان<span style={{ color: "var(--g400)" }}>.</span>
                    </span>
                </div>

                {/* ── بيانات المجمع ─────────────────────────────────────── */}
                <div className="sb-academy sb-lbl">
                    <div
                        style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: "var(--g400)",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            marginBottom: 3,
                        }}
                    >
                        المجمع الحالي
                    </div>
                    <div className="sba-n">{me.centerName || "—"}</div>
                    <div className="sba-r">
                        {me.name && me.role
                            ? `${me.name} · ${me.role}`
                            : me.name || ""}
                    </div>
                </div>

                <div className="sb-scroll">
                    <nav className="sb-nav" id="sbNav">
                        {NAV_ITEMS.map((sec) => {
                            const visibleItems = sec.items.filter((item) => {
                                if (!item.permissionKey) return true;
                                return hasPermission(
                                    item.permissionKey,
                                    item.permissionPath ?? undefined,
                                );
                            });
                            if (visibleItems.length === 0) return null;
                            return (
                                <div key={sec.sec}>
                                    <div className="sb-section sb-lbl">
                                        {sec.sec}
                                    </div>
                                    <nav className="sb-nav">
                                        {visibleItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`sb-nav-item${page === item.id ? " on" : ""}`}
                                                onClick={() =>
                                                    nav(item.path, item.id)
                                                }
                                            >
                                                <span
                                                    style={{
                                                        width: 14,
                                                        height: 14,
                                                        display: "inline-flex",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {ICO[item.ico]}
                                                </span>
                                                <span className="sb-lbl">
                                                    {item.lbl}
                                                </span>
                                                {item.badge && (
                                                    <span
                                                        className={`sb-badge ${item.badge.cls}`}
                                                    >
                                                        {item.badge.n}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </nav>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* ── بيانات المستخدم ───────────────────────────────────── */}
                <div className="sb-bottom">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <div
                            className="sb-user"
                            onClick={() => {
                                window.location.href = "/account";
                                setMobileSB(false);
                            }}
                            style={{ flex: 1 }}
                        >
                            <div className="sb-av">{me.avatar || "م"}</div>
                            <div style={{ minWidth: 0 }}>
                                <div className="sb-uname sb-lbl">
                                    {me.name
                                        ? me.name
                                              .split(" ")
                                              .slice(0, 2)
                                              .join(" ")
                                        : "المستخدم"}
                                </div>
                                <div className="sb-uemail sb-lbl">
                                    {me.role || "مشرف"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default CenterSidebar;
