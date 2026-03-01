import { VscListFlat } from "react-icons/vsc";
import { IoIosArrowDown } from "react-icons/io";
import { HiLogin } from "react-icons/hi";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsTable } from "react-icons/bs";
import { useAuthUser } from "./hooks/useAuthUser";
import EditAccountPage from "../pages/DashBoard/AccountEdit/EditAccountPage";
import { useState, useCallback } from "react";

const Navbar: React.FC = () => {
    const [isRotated, setIsRotated] = useState(false);
    const [dropdowns, setDropdowns] = useState<{ [key: string]: boolean }>({});
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const { user, loading } = useAuthUser();

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
                        <div
                            className={`navbar__toggle ${isRotated ? "rotated" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsRotated(!isRotated);
                                document
                                    .querySelector(".sidebar")
                                    ?.classList.toggle("active");
                                document
                                    .querySelector(".navbar")
                                    ?.classList.toggle("active");
                            }}
                        >
                            <i>
                                <VscListFlat />
                            </i>
                        </div>

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
                                        {/* لو معلم */}
                                        {user?.teacher && (
                                            <a href="/teacher-dashboard">
                                                <li>
                                                    <FaUserAlt />
                                                    لوحة المعلم
                                                </li>
                                            </a>
                                        )}

                                        {/* لو صاحب مجمع */}
                                        {(user?.center_owner ||
                                            user?.role_id === 1) && (
                                            <>
                                                <a href="/center-dashboard">
                                                    <li>
                                                        <FaUserAlt />
                                                        مجمعي
                                                    </li>
                                                </a>
                                            </>
                                        )}

                                        {/* لو مستخدم عادي */}

                                        <a href="/user-dashboard">
                                            <li>
                                                <FaUserAlt />
                                                حسابي
                                            </li>
                                        </a>

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

                                        {/* الجدول (للمعلمين بس) */}
                                        {user?.teacher && (
                                            <a href="/teacher-dashboard/plans">
                                                <li>
                                                    <BsTable />
                                                    جدول
                                                </li>
                                            </a>
                                        )}

                                        <li onClick={handleLogout}>
                                            تسجيل الخروج
                                        </li>
                                    </ul>
                                </h4>
                            </div>
                        ) : (
                            <a
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    borderRadius: "10px",
                                    padding: "6px",
                                }}
                                href="/login"
                                id="navbar__active"
                                className="navbar__link"
                            >
                                <HiLogin />
                                تسجيل الدخول
                            </a>
                        )}
                    </div>

                    <div className="navbar__links">
                        <ul>{/* الروابط المعلقة */}</ul>
                    </div>

                    <div className="navbar__user">
                        <img
                            src="https://quranlives.com/wp-content/uploads/2023/12/logonew3.png"
                            alt="لوجو"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
