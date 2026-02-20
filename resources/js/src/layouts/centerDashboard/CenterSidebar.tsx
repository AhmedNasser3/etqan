import { useState, useEffect } from "react";
import { usePermissions } from "./hooks/usePermissions";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineDomain } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaBullhorn } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";
import { FaMosque } from "react-icons/fa";

// ✅ Types للـ menu items
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

    // ✅ Permissions
    const { loading, hasPermission } = usePermissions();

    // ✅ Active page logic مع permissions
    useEffect(() => {
        if (loading) return;

        const currentPath = window.location.pathname;

        if (
            currentPath.includes("students/approval") &&
            hasPermission("mosque", "/center-dashboard/students/approval")
        ) {
            setActivePage("mosque");
            setActiveSubPage("/center-dashboard/students/approval");
            setOpenMenus((prev) => ({ ...prev, mosque: true }));
        } else if (
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
        } else if (
            currentPath.includes("financial-dashboard") ||
            currentPath.includes("payroll-exports") ||
            currentPath.includes("payroll-reports") ||
            currentPath.includes("payroll-settings")
        ) {
            if (hasPermission("financial")) {
                setActivePage("financial");
                setActiveSubPage(currentPath);
                setOpenMenus((prev) => ({ ...prev, financial: true }));
            }
        } else if (
            currentPath.includes("education") &&
            hasPermission("education")
        ) {
            setActivePage("education");
            setActiveSubPage("");
        } else if (
            currentPath.includes("certificates") &&
            hasPermission("certificates")
        ) {
            setActivePage("certificates");
            setActiveSubPage("");
        } else if (
            currentPath.includes("messages") &&
            hasPermission("messages")
        ) {
            setActivePage("messages");
            setActiveSubPage("");
        } else if (
            currentPath.includes("reports") &&
            hasPermission("reports")
        ) {
            setActivePage("reports");
            setActiveSubPage("");
        } else if (
            currentPath.includes("attendance") &&
            hasPermission("attendance")
        ) {
            setActivePage("attendance");
            setActiveSubPage("");
        } else {
            setActivePage("dashboard");
            setActiveSubPage("");
        }
    }, [loading]);

    const toggleMenu = (menuKey: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenMenus((prev) => ({
            ...prev,
            [menuKey]: !prev[menuKey],
        }));
    };

    const handleMainLinkClick = (
        href: string,
        activePageKey: string,
        e: React.MouseEvent,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        if (href === "#") {
            toggleMenu(activePageKey, e);
        } else {
            setActivePage(activePageKey);
            setActiveSubPage("");
            // إغلاق كل الـ menus عدا الـ active
            Object.keys(openMenus).forEach((key) => {
                if (key !== activePageKey) {
                    setOpenMenus((prev) => ({ ...prev, [key]: false }));
                }
            });
        }
    };

    const handleSubLinkClick = (href: string, parentKey: string) => {
        setActiveSubPage(href);
        setActivePage(parentKey);
        setOpenMenus((prev) => ({ ...prev, [parentKey]: true }));
    };

    // ✅ Menu items مع permissions
    const baseMenuItems: MenuItem[] = [
        {
            key: "dashboard",
            href: "/center-dashboard",
            icon: <TbLayoutDashboardFilled />,
            title: "مجمعي",
            activePage: "dashboard",
            alwaysShow: true,
        },
        {
            key: "mosque",
            href: "#",
            icon: (
                <IoIosArrowDown
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
                    href: "/center-dashboard/students/approval",
                    title: "اعتماد الطلاب",
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
        {
            key: "staff",
            href: "#",
            icon: (
                <IoIosArrowDown
                    className={`arrow-icon ${openMenus.staff ? "rotated" : ""}`}
                />
            ),
            title: "إدارة الموظفين",
            activePage: "staff",
            submenu: [
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
        {
            key: "financial",
            href: "#",
            icon: (
                <IoIosArrowDown
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
                // {
                //     href: "/center-dashboard/payroll-exports",
                //     title: "مسيرات الرواتب",
                // },
                // {
                //     href: "/center-dashboard/payroll-reports",
                //     title: "تقارير الدوام",
                // },
                {
                    href: "/center-dashboard/teaceher-salary-manegment",
                    title: "قواعد الراتب",
                },
            ],
        },
        {
            key: "domain",
            href: "/center-dashboard/centers-approval",
            icon: <MdOutlineDomain />,
            title: "اعتماد المجمعات",
            activePage: "domain",
        },
        {
            key: "education",
            href: "/center-dashboard/education-supervisor",
            icon: <FaChalkboardTeacher />,
            title: "إدارة معلمين وحلقات",
            activePage: "education",
        },
        {
            key: "attendance",
            href: "/center-dashboard/motivation-supervisor",
            icon: <FaBullhorn />,
            title: "إدارة التحفيزات",
            activePage: "attendance",
        },
        {
            key: "reports",
            href: "/center-dashboard/student-supervisor",
            icon: <FaUsers />,
            title: "إدارة الطلاب",
            activePage: "reports",
        },
        {
            key: "certificates",
            href: "/center-dashboard/report-dashboard",
            icon: <FaFileAlt />,
            title: "مكتبة التقارير",
            activePage: "certificates",
        },
        {
            key: "messages",
            href: "/center-dashboard/audit-log",
            icon: <FaHistory />,
            title: "سجل الإجراءات",
            activePage: "messages",
        },
    ];

    // ✅ Filter حسب الصلاحيات
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
                                <div
                                    className="sidebar__title"
                                    onClick={(e) =>
                                        handleMainLinkClick(
                                            item.href,
                                            item.key,
                                            e,
                                        )
                                    }
                                >
                                    <a
                                        href={item.href}
                                        className={
                                            item.href === "#" ? "no-link" : ""
                                        }
                                    >
                                        <i>{item.icon}</i>
                                        <h2>{item.title}</h2>
                                    </a>
                                </div>
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
