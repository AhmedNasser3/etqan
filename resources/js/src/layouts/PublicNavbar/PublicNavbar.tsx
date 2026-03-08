import { VscListFlat } from "react-icons/vsc";
import { IoIosArrowDown } from "react-icons/io";
import { HiLogin } from "react-icons/hi";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsTable } from "react-icons/bs";
import { useAuthUser } from "../hooks/useAuthUser";
import { useLocation } from "react-router-dom";
import EditAccountPage from "../../pages/DashBoard/AccountEdit/EditAccountPage";
import { useState, useCallback, useEffect } from "react";
import Logo from "../../assets/images/logo.png";
import { FaSignOutAlt } from "react-icons/fa";

const PublicNavbar: React.FC = () => {
    const [isRotated, setIsRotated] = useState(false);
    const [dropdowns, setDropdowns] = useState<{ [key: string]: boolean }>({});
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const { user, loading } = useAuthUser();
    const location = useLocation();

    //  جلب الـ centerSlug من الـ URL
    const getCenterSlug = () => {
        // تحليل الـ pathname لاستخراج centerSlug
        const pathParts = location.pathname.split("/").filter(Boolean);

        // لو الـ path زي: /center-slug/register أو /center-slug
        if (pathParts.length >= 1 && pathParts[0] !== "") {
            return pathParts[0];
        }

        return null;
    };

    const centerSlug = getCenterSlug();

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

    //  بناء رابط التسجيل مع الـ centerSlug
    const getRegisterLink = () => {
        if (centerSlug) {
            return `/${centerSlug}/register`;
        }
        return "/register";
    };

    if (loading) {
        return (
            <div className="navbar">
                <div className="navbar__inner">
                    <div className="navbar__loading">
                        <div className="loading-spinner">
                            <div className="spinner-circle"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                        {user ? (
                            <div className="navbar__profileName">
                                <div className="navbar__profile">
                                    <span>{user?.name?.charAt(0) || "A"}</span>
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
                                    {user?.name || "احمد ناصر"}
                                    <ul
                                        className={`navbar__dropdown ${dropdowns.profile ? "dropped" : ""}`}
                                        id="navbar__profileDropDown"
                                    >
                                        {/*  1. معلم */}
                                        {user?.teacher && (
                                            <>
                                                <a href="/teacher-dashboard">
                                                    <li>
                                                        <FaUserAlt />
                                                        لوحة المعلم
                                                    </li>
                                                </a>
                                                <a href="/teacher-dashboard/plans">
                                                    <li>
                                                        <BsTable />
                                                        جدول
                                                    </li>
                                                </a>
                                            </>
                                        )}

                                        {/*  2. صاحب مجمع */}
                                        {(user?.center_owner === true ||
                                            user?.role?.name ===
                                                "center_owner" ||
                                            user?.role_id === 1) && (
                                            <a href="/center-dashboard">
                                                <li>
                                                    <FaUserAlt />
                                                    مجمعي
                                                </li>
                                            </a>
                                        )}

                                        {/*  3. طالب */}
                                        {user?.role?.name === "student" && (
                                            <a href="/user-dashboard">
                                                <li>
                                                    <FaUserAlt />
                                                    حسابي
                                                </li>
                                            </a>
                                        )}

                                        {/*  4. مستخدم عادي */}
                                        {user &&
                                            !user.teacher &&
                                            !user.center_owner &&
                                            !user?.role?.name && (
                                                <a href="/user-dashboard">
                                                    <li>
                                                        <FaUserAlt />
                                                        حسابي
                                                    </li>
                                                </a>
                                            )}

                                        {/*  الإعدادات */}
                                        <a href="#">
                                            <li
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenSettings();
                                                    toggleDropdown("profile");
                                                }}
                                            >
                                                <IoSettings />
                                                الإعدادات
                                            </li>
                                        </a>

                                        {/*  تسجيل الخروج */}
                                        <a href="#">
                                            <li>
                                                <IoSettings />

                                                <button onClick={handleLogout}>
                                                    تسجيل الخروج
                                                </button>
                                            </li>
                                        </a>
                                    </ul>
                                </h4>
                            </div>
                        ) : (
                            //  انشاء حساب مع الـ centerSlug
                            <a
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    borderRadius: "10px",
                                    padding: "6px",
                                }}
                                href={getRegisterLink()}
                                id="navbar__active"
                                className="navbar__link"
                            >
                                <HiLogin />
                                انشاء حساب
                                {centerSlug && (
                                    <small
                                        style={{
                                            fontSize: "0.7rem",
                                            opacity: 0.7,
                                        }}
                                    >
                                        ({centerSlug})
                                    </small>
                                )}
                            </a>
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

export default PublicNavbar;
