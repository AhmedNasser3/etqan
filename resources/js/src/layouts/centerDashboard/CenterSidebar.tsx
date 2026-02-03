import { useState, useEffect } from "react";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaComments } from "react-icons/fa";
import { FaChartBar } from "react-icons/fa";
import { FaClock } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { GrCertificate } from "react-icons/gr";
import { IoIosArrowDown } from "react-icons/io";
import { FaUsers } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { FaDollarSign } from "react-icons/fa";
import { FaLink } from "react-icons/fa";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaBullhorn } from "react-icons/fa";
import { FaDoorOpen } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";
import { FaMosque } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { MdOutlineDomain } from "react-icons/md";

const CenterSidebar: React.FC = () => {
    const [activePage, setActivePage] = useState("dashboard");
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
    const [activeSubPage, setActiveSubPage] = useState("");

    useEffect(() => {
        const currentPath = window.location.pathname;

        if (currentPath.includes("students/approval")) {
            setActivePage("mosque");
            setActiveSubPage("/center-dashboard/students/approval");
            setOpenMenus((prev) => ({ ...prev, mosque: true }));
        } else if (currentPath.includes("staff-approval")) {
            setActivePage("staff");
            setActiveSubPage("/center-dashboard/staff-approval");
            setOpenMenus((prev) => ({ ...prev, staff: true }));
        } else if (currentPath.includes("staff-attendance")) {
            setActivePage("staff");
            setActiveSubPage("/center-dashboard/staff-attendance");
            setOpenMenus((prev) => ({ ...prev, staff: true }));
        } else if (currentPath.includes("user-suspend")) {
            setActivePage("staff");
            setActiveSubPage("/center-dashboard/user-suspend");
            setOpenMenus((prev) => ({ ...prev, staff: true }));
        } else if (
            currentPath.includes("financial-dashboard") ||
            currentPath.includes("payroll-exports") ||
            currentPath.includes("payroll-reports") ||
            currentPath.includes("payroll-settings")
        ) {
            setActivePage("financial");
            setActiveSubPage(currentPath);
            setOpenMenus((prev) => ({ ...prev, financial: true }));
        } else if (currentPath.includes("education")) {
            setActivePage("education");
            setActiveSubPage("");
        } else if (currentPath.includes("certificates")) {
            setActivePage("certificates");
            setActiveSubPage("");
        } else if (currentPath.includes("messages")) {
            setActivePage("messages");
            setActiveSubPage("");
        } else if (currentPath.includes("reports")) {
            setActivePage("reports");
            setActiveSubPage("");
        } else if (currentPath.includes("attendance")) {
            setActivePage("attendance");
            setActiveSubPage("");
        } else if (currentPath.includes("room")) {
            setActivePage("room");
            setActiveSubPage("");
        } else {
            setActivePage("dashboard");
            setActiveSubPage("");
        }
    }, []);

    const toggleMenu = (menuKey: string, e: React.MouseEvent) => {
        e.preventDefault();
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
        if (href === "#") {
            e.preventDefault();
            toggleMenu(activePageKey, e);
        } else {
            setActivePage(activePageKey);
            setActiveSubPage("");
            Object.keys(openMenus).forEach((key) => {
                if (key !== activePageKey)
                    setOpenMenus((prev) => ({ ...prev, [key]: false }));
            });
        }
    };

    const handleSubLinkClick = (href: string, parentKey: string) => {
        setActiveSubPage(href);
        setActivePage(parentKey);
        setOpenMenus((prev) => ({ ...prev, [parentKey]: true }));
    };

    const menuItems = [
        {
            key: "dashboard",
            href: "/center-dashboard",
            icon: <TbLayoutDashboardFilled />,
            title: "مجمعي",
            activePage: "dashboard",
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
                {
                    href: "/center-dashboard/payroll-exports",
                    title: "مسيرات الرواتب",
                },
                {
                    href: "/center-dashboard/payroll-reports",
                    title: "تقارير الدوام",
                },
                {
                    href: "/center-dashboard/payroll-settings",
                    title: "قواعد الراتب",
                },
            ],
        },
        {
            key: "domain",
            href: "/center-dashboard/domian-links",
            icon: <MdOutlineDomain />,
            title: "روابط مهمة",
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
            key: "room",
            href: "/center-dashboard/rooms-supervisor",
            icon: <FaDoorOpen />,
            title: "إدارة الغرف",
            activePage: "room",
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
                                {item.submenu && (
                                    <ul
                                        className={`sub-menu ${openMenus[item.key as string] ? "open" : ""}`}
                                    >
                                        {item.submenu.map((subItem, index) => (
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
