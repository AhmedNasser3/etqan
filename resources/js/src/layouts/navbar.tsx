import { VscListFlat } from "react-icons/vsc";
import { IoIosArrowDown } from "react-icons/io";
import { HiLogin } from "react-icons/hi";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsTable } from "react-icons/bs";
import { useLocation } from "react-router-dom";
import EditAccountPage from "../pages/DashBoard/AccountEdit/EditAccountPage";
import { useAuthUser } from "./hooks/useAuthUser";
import { useState, useCallback } from "react";
import Logo from "../assets/images/logo.png";
import { FaSignOutAlt } from "react-icons/fa";

const Navbar: React.FC = () => {
    const [isRotated, setIsRotated] = useState(false);
    const [dropdowns, setDropdowns] = useState<{ [key: string]: boolean }>({});
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const { user, loading } = useAuthUser();
    const location = useLocation();

    // جلب centerSlug من الـ URL
    const getCenterSlug = () => {
        const pathParts = location.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 1 && pathParts[0] !== "") {
            return pathParts[0];
        }
        return null;
    };

    const centerSlug = getCenterSlug();

    // تحديد الروابط حسب الـ role
    const getRoleLinks = () => {
        if (!user) return [];

        // 1. معلم (teacher)
        if (user?.teacher?.role == "teacher") {
            return [
                {
                    href: "/teacher-dashboard",
                    label: "لوحة المعلم",
                    icon: <FaUserAlt />,
                },
                {
                    href: "/teacher-dashboard/plans",
                    label: "جدول الجلسات",
                    icon: <BsTable />,
                },
            ];
        }
        if (
            user?.teacher?.role == "financial" ||
            user?.teacher?.role == "motivator" ||
            user?.teacher?.role == "supervisor" ||
            user?.teacher?.role == "student_affairs"
        ) {
            return [
                {
                    href: "/center-dashboard",
                    label: "لوحة المشرف المالي",
                    icon: <FaUserAlt />,
                },
            ];
        }

        // 2. صاحب مجمع (center_owner)
        if (
            user?.center_owner === true ||
            user?.role?.name === "center_owner" ||
            user?.role_id === 1
        ) {
            return [
                {
                    href: "/center-dashboard",
                    label: "مجمعي",
                    icon: <FaUserAlt />,
                },
            ];
        }

        // 3. طالب (student)
        if (user?.role?.name === "student") {
            return [
                {
                    href: "/user-dashboard",
                    label: "حسابي",
                    icon: <FaUserAlt />,
                },
            ];
        }

        // 4. الموظفين حسب الـ role (الـ 5 roles)
        if (user?.teacher?.role) {
            const roleConfig: {
                [key: string]: { title: string; link: string };
            } = {
                teacher: { title: "لوحة المعلم", link: "/teacher-dashboard" },
                supervisor: {
                    title: "لوحة المشرف",
                    link: "/supervisor-dashboard",
                },
                motivator: {
                    title: "لوحة الدافع",
                    link: "/motivator-dashboard",
                },
                student_affairs: {
                    title: "لوحة شؤون الطلاب",
                    link: "/student-affairs-dashboard",
                },
                financial: {
                    title: "لوحة المالية",
                    link: "/financial-dashboard",
                },
            };

            const config = roleConfig[user.teacher.role] || {
                title: "لوحة التحكم",
                link: "/center-dashboard",
            };
            return [
                { href: config.link, label: config.title, icon: <FaUserAlt /> },
                {
                    href: `${config.link}/plans`,
                    label: "جدول الجلسات",
                    icon: <BsTable />,
                },
            ];
        }

        // 5. مستخدم عادي
        return [
            { href: "/user-dashboard", label: "حسابي", icon: <FaUserAlt /> },
        ];
    };

    const roleLinks = getRoleLinks();

    const handleOpenSettings = useCallback(() => {
        setShowSettingsModal(true);
    }, []);

    const handleCloseSettings = useCallback(() => {
        setShowSettingsModal(false);
    }, []);

    const handleSettingsSuccess = useCallback(() => {
        handleCloseSettings();
    }, [handleCloseSettings]);

    const toggleDropdown = (key: string) => {
        setDropdowns((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const closeAllDropdowns = () => {
        setDropdowns({});
    };

    const handleLogout = async () => {
        try {
            await fetch("/logout", {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                    "Content-Type": "application/json",
                },
            });
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // بناء رابط تسجيل الدخول مع الـ centerSlug
    const getLoginLink = () => {
        if (centerSlug) {
            return `/${centerSlug}/login`;
        }
        return "/login";
    };

    // دايماً نعرض الـ navbar حتى لو loading، بس مع placeholder للـ user
    return (
        <>
            {showSettingsModal && user && (
                <EditAccountPage
                    onClose={handleCloseSettings}
                    onSuccess={handleSettingsSuccess}
                />
            )}

            <div
                className={`navbar ${isRotated ? "active" : ""}`}
                onClick={closeAllDropdowns}
            >
                <div className="navbar__inner">
                    <div className="navbar__container">
                        {user || loading ? (
                            <div className="navbar__profileName">
                                <div className="navbar__profile">
                                    <span>
                                        {user?.name?.charAt(0) ||
                                            (loading ? "..." : "A")}
                                    </span>
                                </div>
                                <h4
                                    className="navbar__link"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDropdown("profile");
                                    }}
                                >
                                    <i>
                                        <IoIosArrowDown
                                            className={`navbar__arrow ${dropdowns.profile ? "flipped" : ""}`}
                                        />{" "}
                                    </i>
                                    {user?.name ||
                                        (loading
                                            ? "جاري التحميل..."
                                            : "احمد ناصر")}
                                    <ul
                                        className={`navbar__dropdown ${dropdowns.profile ? "dropped" : ""}`}
                                        id="navbar__profileDropDown"
                                    >
                                        {/* عرض placeholder أثناء الـ loading */}
                                        {loading ? (
                                            <li>جاري تحميل البيانات...</li>
                                        ) : (
                                            <>
                                                {/* عرض الروابط حسب الـ role */}
                                                {roleLinks.map(
                                                    (link, index) => (
                                                        <a
                                                            key={index}
                                                            href={link.href}
                                                        >
                                                            <li>
                                                                {link.icon}
                                                                {link.label}
                                                            </li>
                                                        </a>
                                                    ),
                                                )}

                                                {/* الإعدادات */}
                                                <a href="#">
                                                    <li
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenSettings();
                                                            toggleDropdown(
                                                                "profile",
                                                            );
                                                        }}
                                                    >
                                                        <IoSettings />
                                                        الإعدادات
                                                    </li>
                                                </a>

                                                {/* تسجيل الخروج */}
                                                <a href="#">
                                                    <li onClick={handleLogout}>
                                                        <FaSignOutAlt />
                                                        تسجيل الخروج
                                                    </li>
                                                </a>
                                            </>
                                        )}
                                    </ul>
                                </h4>
                            </div>
                        ) : (
                            <div style={{ display: "flex" }}>
                                <a
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        borderRadius: "10px",
                                        padding: "6px",
                                        margin: "0 6px",
                                    }}
                                    href={getLoginLink()}
                                    id="navbar__active"
                                    className="navbar__link"
                                >
                                    <HiLogin />
                                    تسجيل الدخول
                                </a>
                                {/* 👇 إخفاء "انشيئ مجمعك الخاص" لو فيه centerSlug */}
                                {!centerSlug && (
                                    <a
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            borderRadius: "10px",
                                            padding: "6px",
                                        }}
                                        href="/center-register"
                                        id="navbar__active"
                                        className="navbar__link"
                                    >
                                        <HiLogin />
                                        انشيئ مجمعك الخاص
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="navbar__links">
                        <ul>{/* الروابط المعلقة */}</ul>
                    </div>

                    <div className="navbar__user">
                        <img src={Logo} alt="لوجو" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
