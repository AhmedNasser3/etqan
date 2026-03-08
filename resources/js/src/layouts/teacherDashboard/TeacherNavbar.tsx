import { FaHome } from "react-icons/fa";
import { VscListFlat } from "react-icons/vsc";
import { IoIosArrowDown } from "react-icons/io";
import { HiLogin } from "react-icons/hi";
import { LuUserRoundPlus } from "react-icons/lu";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsTable } from "react-icons/bs";
import { MdCallMade } from "react-icons/md";
import { FaCircleQuestion } from "react-icons/fa6";
import SettingModel from "../models/SettingModel";
import EditAccountPage from "@/src/pages/DashBoard/AccountEdit/EditAccountPage";
import { useAuthUser } from "../hooks/useAuthUser";
import { useState, useCallback } from "react";
import Logo from "../../assets/images/logo.png";
import { FaSignOutAlt } from "react-icons/fa";

const TeacherNavbar: React.FC = () => {
    const [isRotated, setIsRotated] = useState(false);
    const [dropdowns, setDropdowns] = useState<{ [key: string]: boolean }>({});
    const [showSettingModel, setShowSettingModel] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const { user, loading } = useAuthUser();

    //  تحديد اسم اللوحة والرابط حسب الـ role
    const getDashboardConfig = () => {
        if (!user?.teacher?.role)
            return { title: "لوحة التحكم", link: "/teacher-dashboard" };

        switch (user.teacher.role) {
            case "teacher":
                return { title: "لوحة المعلم", link: "/teacher-dashboard" };
            case "supervisor":
                return { title: "لوحة المشرف", link: "/supervisor-dashboard" };
            case "motivator":
                return { title: "لوحة الدافع", link: "/motivator-dashboard" };
            case "student_affairs":
                return {
                    title: "لوحة شؤون الطلاب",
                    link: "/student-affairs-dashboard",
                };
            case "financial":
                return { title: "لوحة المالية", link: "/financial-dashboard" };
            default:
                return { title: "لوحة التحكم", link: "/center-dashboard" };
        }
    };

    const dashboardConfig = getDashboardConfig();

    const handleOpenSettingModel = () => {
        setShowSettingModel(true);
    };

    const handleClosedSettingModel = () => {
        setShowSettingModel(false);
    };

    const handleSettingsSuccess = () => {
        setShowSettingsModal(false);
    };

    const toggleDropdown = (key: string) => {
        setDropdowns((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleOpenSettings = useCallback(() => {
        setShowSettingsModal(true);
    }, []);

    const handleCloseSettings = useCallback(() => {
        setShowSettingsModal(false);
    }, []);

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
                    <div className="navbar__loading">جاري التحميل...</div>
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
                    <SettingModel
                        isOpen={showSettingModel}
                        onClose={handleClosedSettingModel}
                    />
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
                                        {/*  الرابط والاسم حسب الـ role */}
                                        <a href={dashboardConfig.link}>
                                            <li>
                                                <FaUserAlt />
                                                {dashboardConfig.title}
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

                                        {/*  رابط الجدول حسب الـ role */}
                                        <a
                                            href={
                                                dashboardConfig.link + "/plans"
                                            }
                                        >
                                            <li>
                                                <BsTable />
                                                جدول الجلسات
                                            </li>
                                        </a>

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

                    <div className="navbar__user">
                        <img src={Logo} alt="لوجو" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherNavbar;
