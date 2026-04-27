// TeacherSidebar.tsx
import React, { useState, useEffect } from "react";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaBarsProgress } from "react-icons/fa6";
import { BsFillPeopleFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import { FaComments } from "react-icons/fa";
import { FaChartBar } from "react-icons/fa";
import { FaClock } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { GrCertificate } from "react-icons/gr";
import { ICO } from "../../pages/DashBoard/icons";

interface TeacherSidebarProps {
    mobileSB: boolean;
    setMobileSB: React.Dispatch<React.SetStateAction<boolean>>;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
    mobileSB,
    setMobileSB,
}) => {
    const [sidebarMini, setSidebarMini] = useState(false);
    const [activePage, setActivePage] = useState("dashboard");

    const INITIAL_DATA = {
        me: {
            name: "اسم المعلم",
            email: "teacher@itqan.sa",
            role: "معلم",
        },
    };

    // ✅ NAV_ITEMS مع روابط صفحات المعلم
    const NAV_ITEMS = [
        {
            sec: "الرئيسية",
            items: [
                {
                    id: "dashboard",
                    path: "/teacher-dashboard",
                    lbl: "حلقتي اليوم",
                    ico: "grid",
                    badge: null,
                },
            ],
        },
        {
            sec: "الخدمات",
            items: [
                {
                    id: "students",
                    path: "/teacher-dashboard/students",
                    lbl: "الطلاب",
                    ico: "people",
                    badge: null,
                },
                {
                    id: "plans",
                    path: "/teacher-dashboard/plan",
                    lbl: "الخطط",
                    ico: "cal",
                    badge: null,
                },
                {
                    id: "motivation",
                    path: "/teacher-dashboard/motivation",
                    lbl: "التحفيز",
                    ico: "star",
                    badge: null,
                },
                {
                    id: "attendance",
                    path: "/teacher-dashboard/attendance",
                    lbl: "تحضيري",
                    ico: "clock",
                    badge: null,
                },
                // {
                //     id: "reports",
                //     path: "/teacher-dashboard/reports",
                //     lbl: "التقارير",
                //     ico: "chart",
                //     badge: null,
                // },
            ],
        },
    ];

    // ✅ دالة التنقل العادي (ريلود كامل)
    const nav = (path: string, id: string) => {
        window.location.href = path;
        setActivePage(id);
        setMobileSB(false);
    };

    // ✅ تحديث الصفحة الحالية بناءً على الـ URL
    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes("students")) {
            setActivePage("students");
        } else if (
            currentPath.includes("plans") ||
            currentPath.includes("plan")
        ) {
            setActivePage("plans");
        } else if (currentPath.includes("motivation")) {
            setActivePage("motivation");
        } else if (currentPath.includes("certificates")) {
            setActivePage("certificates");
        } else if (currentPath.includes("messages")) {
            setActivePage("messages");
        } else if (currentPath.includes("reports")) {
            setActivePage("reports");
        } else if (currentPath.includes("attendance")) {
            setActivePage("attendance");
        } else if (currentPath.includes("room")) {
            setActivePage("room");
        } else {
            setActivePage("dashboard");
        }
    }, []);

    return (
        <>
            {/* ✅ Overlay باستخدام الـ props */}
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
                        إتقان
                        <span style={{ color: "var(--g400)" }}>.</span>
                    </span>
                </div>

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
                        حسابي
                    </div>
                    <div className="sba-n">{INITIAL_DATA.me.name}</div>
                    <div className="sba-r">{INITIAL_DATA.me.role}</div>
                </div>

                <div className="sb-scroll">
                    <nav className="sb-nav" id="sbNav">
                        {NAV_ITEMS.map((sec) => (
                            <div key={sec.sec}>
                                <div className="sb-section sb-lbl">
                                    {sec.sec}
                                </div>
                                <nav className="sb-nav">
                                    {sec.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`sb-nav-item${
                                                activePage === item.id
                                                    ? " on"
                                                    : ""
                                            }`}
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
                                                {ICO[item.ico] || (
                                                    <TbLayoutDashboardFilled
                                                        size={14}
                                                    />
                                                )}
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
                        ))}
                    </nav>
                </div>

                <div className="sb-bottom">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <div className="sb-user" style={{ flex: 1 }}>
                            <div className="sb-av">م</div>
                            <div style={{ minWidth: 0 }}>
                                <div className="sb-uname sb-lbl">
                                    {INITIAL_DATA.me.name
                                        .split(" ")
                                        .slice(0, 2)
                                        .join(" ")}
                                </div>
                                <div className="sb-uemail sb-lbl">
                                    {INITIAL_DATA.me.role}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default TeacherSidebar;
