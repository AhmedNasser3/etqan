import { useState, useEffect } from "react";
import { usePermissions } from "./hooks/usePermissions";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { MdOutlineDomain } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaBullhorn } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";
import { FaMosque } from "react-icons/fa";

interface SubMenuItem {
    href: string;
    title: string;
}

interface MenuItem {
    key: string;
    href: string;
    icon: React.ReactNode;
    title: string;
    activePage: string;
    submenu?: SubMenuItem[];
    alwaysShow?: boolean;
}

const CenterSidebar: React.FC = () => {
    const [activePage, setActivePage] = useState("dashboard");
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
    const [activeSubPage, setActiveSubPage] = useState("");

    const { loading, hasPermission } = usePermissions();

    //  Active page logic مُصحح مع كل الـ roles الجديدة
    useEffect(() => {
        if (loading) return;

        const currentPath = window.location.pathname;

        // Mosque subpages
        if (
            currentPath.includes("students/approval") &&
            hasPermission("mosque", "/center-dashboard/students/approval")
        ) {
            setActivePage("mosque");
            setActiveSubPage("/center-dashboard/students/approval");
            setOpenMenus((prev) => ({ ...prev, mosque: true }));
        } else if (
            currentPath.includes("booking-manegment") &&
            hasPermission("mosque", "/center-dashboard/booking-manegment")
        ) {
            setActivePage("mosque");
            setActiveSubPage("/center-dashboard/booking-manegment");
            setOpenMenus((prev) => ({ ...prev, mosque: true }));
        }
        // Staff subpages
        else if (
            currentPath.includes("staff-approval") &&
            hasPermission("staff", "/center-dashboard/staff-approval")
        ) {
            setActivePage("staff");
            setActiveSubPage("/center-dashboard/staff-approval");
            setOpenMenus((prev) => ({ ...prev, staff: true }));
        } else if (
            currentPath.includes("staff-attendance") &&
            hasPermission("staff", "/center-dashboard/staff-attendance")
        ) {
            setActivePage("staff");
            setActiveSubPage("/center-dashboard/staff-attendance");
            setOpenMenus((prev) => ({ ...prev, staff: true }));
        } else if (
            currentPath.includes("user-suspend") &&
            hasPermission("staff", "/center-dashboard/user-suspend")
        ) {
            setActivePage("staff");
            setActiveSubPage("/center-dashboard/user-suspend");
            setOpenMenus((prev) => ({ ...prev, staff: true }));
        }
        // Financial subpages
        else if (
            currentPath.includes("financial-dashboard") &&
            hasPermission("financial", "/center-dashboard/financial-dashboard")
        ) {
            setActivePage("financial");
            setActiveSubPage("/center-dashboard/financial-dashboard");
            setOpenMenus((prev) => ({ ...prev, financial: true }));
        } else if (
            currentPath.includes("teaceher-salary-manegment") &&
            hasPermission(
                "financial",
                "/center-dashboard/teaceher-salary-manegment",
            )
        ) {
            setActivePage("financial");
            setActiveSubPage("/center-dashboard/teaceher-salary-manegment");
            setOpenMenus((prev) => ({ ...prev, financial: true }));
        } else if (
            currentPath.includes("custom-salary-manegment") &&
            hasPermission(
                "financial",
                "/center-dashboard/custom-salary-manegment",
            )
        ) {
            setActivePage("financial");
            setActiveSubPage("/center-dashboard/custom-salary-manegment");
            setOpenMenus((prev) => ({ ...prev, financial: true }));
        }
        // Education pages حسب الـ role
        else if (
            currentPath.includes("education-supervisor") &&
            hasPermission("education", "/center-dashboard/education-supervisor")
        ) {
            setActivePage("education");
            setActiveSubPage("/center-dashboard/education-supervisor");
        } else if (
            currentPath.includes("special-request-manegment") &&
            hasPermission(
                "education",
                "/center-dashboard/special-request-manegment",
            )
        ) {
            setActivePage("education");
            setActiveSubPage("/center-dashboard/special-request-manegment");
        } else if (
            currentPath.includes("students/approval") &&
            hasPermission("education", "/center-dashboard/students/approval")
        ) {
            setActivePage("education");
            setActiveSubPage("/center-dashboard/students/approval");
        } else if (
            currentPath.includes("plan-transfer-management") &&
            hasPermission(
                "education",
                "/center-dashboard/plan-transfer-management",
            )
        ) {
            setActivePage("education");
            setActiveSubPage("/center-dashboard/plan-transfer-management");
        }
        // Direct pages
        else if (
            currentPath.includes("achieve-manegment") &&
            hasPermission("attendance")
        ) {
            setActivePage("attendance");
            setActiveSubPage("");
        } else if (
            currentPath.includes("student-supervisor") &&
            hasPermission("reports")
        ) {
            setActivePage("reports");
            setActiveSubPage("");
        } else if (
            currentPath.includes("centers-approval") &&
            hasPermission("domain")
        ) {
            setActivePage("domain");
            setActiveSubPage("");
        } else if (
            currentPath.includes("audit-log") &&
            hasPermission("messages")
        ) {
            setActivePage("messages");
            setActiveSubPage("");
        } else {
            setActivePage("dashboard");
            setActiveSubPage("");
        }
    }, [loading, hasPermission]);

    // Toggle submenu فقط
    const toggleMenu = (menuKey: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenMenus((prev) => ({
            ...prev,
            [menuKey]: !prev[menuKey],
        }));
    };

    // Submenu link click
    const handleSubLinkClick = (href: string, parentKey: string) => {
        setActiveSubPage(href);
        setActivePage(parentKey);
        setOpenMenus((prev) => ({ ...prev, [parentKey]: true }));
    };

    //  Menu items مُقسمة حسب الصلاحيات الجديدة
    const baseMenuItems: MenuItem[] = [
        // Dashboard - دايماً موجود
        {
            key: "dashboard",
            href: "/center-dashboard",
            icon: <TbLayoutDashboardFilled />,
            title: "مجمعي",
            activePage: "dashboard",
            alwaysShow: true,
        },

        // 1. المساجد والحلقات (للمجمع وشؤون الطلاب)
        {
            key: "mosque",
            href: "#",
            icon: (
                <FaMosque
                    className={`arrow-icon ${openMenus.mosque ? "rotated" : ""}`}
                />
            ),
            title: "إدارة المساجد والحلقات",
            activePage: "mosque",
            submenu: [
                {
                    href: "/center-dashboard/mosque-manegment",
                    title: "المساجد",
                },
                {
                    href: "/center-dashboard/circle-manegment",
                    title: "إدارة الحلقات",
                },
                {
                    href: "/center-dashboard/plans-manegment",
                    title: "إدارة الخطط",
                },
                {
                    href: "/center-dashboard/plans-details-manegment",
                    title: "تفاصيل الخطط",
                },
                {
                    href: "/center-dashboard/shedule-manegment",
                    title: "مواعيد الحلقات",
                },
                {
                    href: "/center-dashboard/booking-manegment",
                    title: "طلبات الطلاب للخطط",
                },
            ],
        },

        // 2. إدارة الموظفين (للمجمع بس)
        {
            key: "staff",
            href: "#",
            icon: (
                <FaChalkboardTeacher
                    className={`arrow-icon ${openMenus.staff ? "rotated" : ""}`}
                />
            ),
            title: "إدارة الموظفين",
            activePage: "staff",
            submenu: [
                {
                    href: "/center-dashboard/teachers-management",
                    title: "إدارة معلمين",
                },
                {
                    href: "/center-dashboard/staff-approval",
                    title: "اعتماد المعلمين",
                },
                {
                    href: "/center-dashboard/staff-attendance",
                    title: "حضور الموظفين",
                },
                {
                    href: "/center-dashboard/user-suspend",
                    title: "موظفين موقوفين",
                },
            ],
        },

        // 3. الإدارة المالية (للمالي بس)
        {
            key: "financial",
            href: "#",
            icon: (
                <FaFileAlt
                    className={`arrow-icon ${openMenus.financial ? "rotated" : ""}`}
                />
            ),
            title: "الإدارة المالية",
            activePage: "financial",
            submenu: [
                {
                    href: "/center-dashboard/financial-dashboard",
                    title: "اللوحة المالية",
                },
                {
                    href: "/center-dashboard/teaceher-salary-manegment",
                    title: "قواعد الراتب",
                },
                {
                    href: "/center-dashboard/custom-salary-manegment",
                    title: "رواتب مخصصة",
                },
            ],
        },

        // 4. اعتماد المجمعات (للمجمع بس)
        {
            key: "domain",
            href: "/center-dashboard/centers-approval",
            icon: <MdOutlineDomain />,
            title: "اعتماد المجمعات",
            activePage: "domain",
        },

        // 5. إدارة التعليم (للمشرف وشؤون الطلاب)
        {
            key: "education",
            href: "#",
            icon: (
                <FaChalkboardTeacher
                    className={`arrow-icon ${openMenus.education ? "rotated" : ""}`}
                />
            ),
            title: "إدارة التعليم",
            activePage: "education",
            submenu: [
                {
                    href: "/center-dashboard/education-supervisor",
                    title: "إدارة معلمين وحلقات",
                },
                {
                    href: "/center-dashboard/special-request-manegment",
                    title: "طلبات لحلقات خاصة",
                },
                {
                    href: "/center-dashboard/students/approval",
                    title: "اعتماد الطلاب",
                },
                {
                    href: "/center-dashboard/plan-transfer-management",
                    title: "نقل الطلاب من الخطط",
                },
                {
                    href: "/center-dashboard/request-domain-manegment",
                    title: "طلب دومين خاص",
                },
            ],
        },

        // 6. إدارة التحفيزات (للتحفيزي وشؤون الطلاب والمشرف)
        {
            key: "attendance",
            href: "/center-dashboard/achieve-manegment",
            icon: <FaBullhorn />,
            title: "إدارة التحفيزات",
            activePage: "attendance",
        },

        // 7. إدارة الطلاب (للتحفيزي وشؤون الطلاب والمشرف)
        {
            key: "reports",
            href: "/center-dashboard/student-supervisor",
            icon: <FaUsers />,
            title: "إدارة الطلاب",
            activePage: "reports",
        },

        // 8. سجل الإجراءات (للمجمع بس)
        {
            key: "messages",
            href: "/center-dashboard/audit-log",
            icon: <FaHistory />,
            title: "سجل الإجراءات",
            activePage: "messages",
        },
    ];

    const menuItems: MenuItem[] = baseMenuItems.filter(
        (item) => item.alwaysShow || hasPermission(item.key),
    );

    if (loading) {
        return (
            <div className="sidebar">
                <div className="sidebar__features">
                    <div className="sidebar__inner">
                        <div className="sidebar__container">
                            <div className="sidebar__data loading">
                                <div className="sidebar__title">
                                    <div className="loading-skeleton"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sidebar">
            <div className="sidebar__features">
                <div className="sidebar__inner">
                    <div className="sidebar__container">
                        {menuItems.map((item) => (
                            <div
                                key={item.key}
                                className={`sidebar__data ${activePage === item.activePage ? "active" : ""}`}
                            >
                                <div className="sidebar__title">
                                    {item.href === "#" ? (
                                        // Submenu toggle
                                        <a
                                            href="#"
                                            className="no-link"
                                            onClick={(e) =>
                                                toggleMenu(item.key, e)
                                            }
                                        >
                                            <i>{item.icon}</i>
                                            <h2>{item.title}</h2>
                                        </a>
                                    ) : (
                                        // Main navigation
                                        <a href={item.href}>
                                            <i>{item.icon}</i>
                                            <h2>{item.title}</h2>
                                        </a>
                                    )}
                                </div>

                                {/* Submenu */}
                                {item.submenu && hasPermission(item.key) && (
                                    <ul
                                        className={`sub-menu ${openMenus[item.key as string] ? "open" : ""}`}
                                    >
                                        {item.submenu
                                            .filter((subItem) =>
                                                hasPermission(
                                                    item.key,
                                                    subItem.href,
                                                ),
                                            )
                                            .map((subItem, index) => (
                                                <li
                                                    key={index}
                                                    className={
                                                        activeSubPage ===
                                                        subItem.href
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        handleSubLinkClick(
                                                            subItem.href,
                                                            item.key,
                                                        )
                                                    }
                                                >
                                                    <a href={subItem.href}>
                                                        {subItem.title}
                                                    </a>
                                                </li>
                                            ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CenterSidebar;
