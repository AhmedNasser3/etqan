// UserSidebar.tsx
import React, { useState, useEffect } from "react";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaBarsProgress } from "react-icons/fa6";
import { BsFillMortarboardFill } from "react-icons/bs";
import { FaAssistiveListeningSystems } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa";
import { GrCertificate } from "react-icons/gr";
import { ICO } from "../../pages/DashBoard/icons";

interface UserSidebarProps {
    mobileSB: boolean;
    setMobileSB: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ mobileSB, setMobileSB }) => {
    const [sidebarMini, setSidebarMini] = useState(false);
    const [page, setPage] = useState("dashboard");

    // ✅ NAV_ITEMS مع روابط صفحات المستخدم
    const NAV_ITEMS = [
        {
            sec: "الرئيسية",
            items: [
                {
                    id: "dashboard",
                    path: "/user-dashboard",
                    lbl: "داش بورد",
                    ico: "grid",
                    badge: null,
                },
            ],
        },
        {
            sec: "الخدمات",
            items: [
                {
                    id: "plans",
                    path: "/user-dashboard/plans",
                    lbl: "الخطة",
                    ico: "cal",
                    badge: null,
                },
                {
                    id: "progress",
                    path: "/user-dashboard/user-progress",
                    lbl: "مستوى التقدم",
                    ico: "progress",
                    badge: null,
                },

                {
                    id: "listening",
                    path: "/user-dashboard/user-listesning",
                    lbl: "سجل التسميع",
                    ico: "listening",
                    badge: null,
                },
                {
                    id: "attendance",
                    path: "/user-dashboard/user-presence",
                    lbl: "الحضور والغياب",
                    ico: "check",
                    badge: null,
                },
                {
                    id: "attendance",
                    path: "/user-dashboard/student-shop",
                    lbl: "المتجر",
                    ico: "check",
                    badge: null,
                },
                // {
                //     id: "certificates",
                //     path: "/user-dashboard/user-certificate",
                //     lbl: "الشهادات والملاحظات",
                //     ico: "certificate",
                //     badge: null,
                // },
            ],
        },
    ];

    const INITIAL_DATA = {
        me: {
            name: "أحمد ناصر",
            email: "ahmed@itqan.sa",
            role: "طالب",
        },
    };

    // ✅ دالة التنقل العادي (ريلود كامل)
    const nav = (path: string, id: string) => {
        window.location.href = path;
        setPage(id);
        setMobileSB(false);
    };

    // ✅ تحديث الصفحة الحالية بناءً على الـ URL
    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes("plans")) {
            setPage("plans");
        } else if (currentPath.includes("progress")) {
            setPage("progress");
        } else if (
            currentPath.includes("user-complexes") ||
            currentPath.includes("groups")
        ) {
            setPage("groups");
        } else if (
            currentPath.includes("listesning") ||
            currentPath.includes("listening")
        ) {
            setPage("listening");
        } else if (
            currentPath.includes("presence") ||
            currentPath.includes("attendance")
        ) {
            setPage("attendance");
        } else if (
            currentPath.includes("certificate") ||
            currentPath.includes("certificates")
        ) {
            setPage("certificates");
        } else {
            setPage("dashboard");
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
                                                page === item.id ? " on" : ""
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
                            <div className="sb-av">أ</div>
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

export default UserSidebar;
