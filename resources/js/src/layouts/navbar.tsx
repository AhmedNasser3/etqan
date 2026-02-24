import { FaHome } from "react-icons/fa";
import { VscListFlat } from "react-icons/vsc";
import { IoIosArrowDown } from "react-icons/io";
import { useState } from "react";
import { HiLogin } from "react-icons/hi";
import { LuUserRoundPlus } from "react-icons/lu";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsTable } from "react-icons/bs";
import { MdCallMade } from "react-icons/md";
import { FaCircleQuestion } from "react-icons/fa6";
import SettingModel from "./models/SettingModel";
import { useAuthUser } from "./hooks/useAuthUser";

const Navbar: React.FC = () => {
    const [isRotated, setIsRotated] = useState(false);
    const [dropdowns, setDropdowns] = useState<{ [key: string]: boolean }>({});
    const [showSettingModel, setShowSettingModel] = useState(false);
    const { user, loading } = useAuthUser();

    const handleOpenSettingModel = () => {
        setShowSettingModel(true);
    };

    const handleClosedSettingModel = () => {
        setShowSettingModel(false);
    };

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

    // 🔥 دالة تحديد dashboard path حسب الـ role
    const getDashboardPath = () => {
        if (!user) return "/user-dashboard";
        if (user.role_id == null) {
            return "/teacher-dashboard";
        }
        // Center Owner (role_id = 1 أو center_owner)
        if (
            user.role_id === 1 ||
            user.role === "center_owner" ||
            user.role === "admin"
        ) {
            return "/center-dashboard";
        }

        // Student/Guardian أو أي role تاني (Teacher = null)
        return "/user-dashboard";
    };

    const dashboardPath = getDashboardPath();
    const isCenterOwner = dashboardPath === "/center-dashboard";
    const isStudentOrOther = dashboardPath === "/user-dashboard"; // Teacher + Student + Guardian

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
                                <span>{user.name.charAt(0)}</span>
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
                                {user.name}
                                <ul
                                    className={`navbar__dropdown ${dropdowns.profile ? "dropped" : ""}`}
                                    id="navbar__profileDropDown"
                                >
                                    {/* 🔥 الرابط الرئيسي حسب الـ role */}
                                    <a href={dashboardPath}>
                                        <li>
                                            <FaUserAlt />
                                            {isCenterOwner ? "مجمعي" : "حسابي"}
                                        </li>
                                    </a>

                                    {/* 🔥 Center Owner options بس */}
                                    {isCenterOwner && (
                                        <>
                                            <a href="/center-dashboard/mosque-manegment">
                                                <li>
                                                    <FaUserAlt />
                                                    إدارة المساجد
                                                </li>
                                            </a>
                                            <a href="/center-dashboard/settings">
                                                <li>
                                                    <IoSettings />
                                                    إعدادات المجمع
                                                </li>
                                            </a>
                                        </>
                                    )}

                                    {/* 🔥 الجدول للطالب بس (Student) */}
                                    {isStudentOrOther &&
                                        user.role === "student" && (
                                            <a href="/user-dashboard/plans">
                                                <li>
                                                    <BsTable />
                                                    جدول
                                                </li>
                                            </a>
                                        )}

                                    {/* 🔥 تسجيل خروج ثابت للكل */}
                                    <button onClick={handleLogout}>
                                        <li>تسجيل الخروج</li>
                                    </button>
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
                    <ul>
                        <li>
                            <a
                                href="/"
                                id="navbar__active"
                                className="navbar__link"
                            >
                                <FaHome />
                                الرئيسية
                            </a>
                        </li>
                        <li>
                            <a href="#" className="navbar__link">
                                برنامج الحفظ والتلاوة
                            </a>
                        </li>
                        <li>
                            <a href="#" className="navbar__link">
                                الدورات والبرامج
                            </a>
                        </li>
                        <li>
                            <a href="#" className="navbar__link">
                                الخرائط الذهنية
                            </a>
                        </li>

                        <li className="navbar__dropdown-item">
                            <a
                                className="navbar__link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown("platform");
                                }}
                            >
                                <IoIosArrowDown
                                    className={`navbar__arrow ${dropdowns.platform ? "flipped" : ""}`}
                                />
                                عن منصة اتقان
                            </a>
                            <ul
                                className={`navbar__dropdown ${dropdowns.platform ? "dropped" : ""}`}
                            >
                                <li>
                                    <MdCallMade />
                                    تواصل معنا
                                </li>
                                <li>
                                    <FaCircleQuestion />
                                    من نحن
                                </li>
                            </ul>
                        </li>

                        <li className="navbar__dropdown-item">
                            <a
                                className="navbar__link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown("register");
                                }}
                            >
                                <IoIosArrowDown
                                    className={`navbar__arrow ${dropdowns.register ? "flipped" : ""}`}
                                />
                                التسجيل
                            </a>
                            <ul
                                className={`navbar__dropdown ${dropdowns.register ? "dropped" : ""}`}
                            >
                                {!user && (
                                    <>
                                        <a href="/register">
                                            <li>
                                                <LuUserRoundPlus />
                                                تسجيل مستخدم جديد
                                            </li>
                                        </a>
                                        <a href="/login">
                                            <li>
                                                <HiLogin />
                                                تسجيل دخول
                                            </li>
                                        </a>
                                    </>
                                )}
                            </ul>
                        </li>

                        <li>
                            <a href="#" className="navbar__link">
                                <IoIosArrowDown />
                                مقرأة التليجرام
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="navbar__user">
                    <img
                        src="https://quranlives.com/wp-content/uploads/2023/12/logonew3.png"
                        alt="لوجو"
                    />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
