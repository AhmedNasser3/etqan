import { FaHome } from "react-icons/fa";
import { VscListFlat } from "react-icons/vsc";
import { IoIosArrowDown } from "react-icons/io";
import { useState, useCallback } from "react";
import { HiLogin } from "react-icons/hi";
import { LuUserRoundPlus } from "react-icons/lu";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsTable } from "react-icons/bs";
import { MdCallMade } from "react-icons/md";
import { FaCircleQuestion } from "react-icons/fa6";
import { useAuthUser } from "../hooks/useAuthUser";
import EditAccountPage from "@/src/pages/DashBoard/AccountEdit/EditAccountPage";
import Logo from "../../assets/images/logo.png";
import { FaSignOutAlt } from "react-icons/fa";

const CenterNavbar: React.FC = () => {
    const [isRotated, setIsRotated] = useState(false);
    const [dropdowns, setDropdowns] = useState<{ [key: string]: boolean }>({});

    //  نفس نظام Navbar - حالات الـ Modal
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const { user, loading } = useAuthUser();

    //  handleOpenSettings - فتح الإعدادات (نفس النظام)
    const handleOpenSettings = useCallback(() => {
        setShowSettingsModal(true);
    }, []);

    //  handleCloseSettings - إغلاق الإعدادات (نفس النظام)
    const handleCloseSettings = useCallback(() => {
        setShowSettingsModal(false);
    }, []);

    //  handleSettingsSuccess - نجاح التعديل (نفس النظام)
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
                    <div className="navbar__loading">جاري التحميل...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/*  نفس نظام Navbar - Modal خارجي */}
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
                                        <>
                                            <a href="/center-dashboard">
                                                <li>
                                                    <FaUserAlt /> مجمعي
                                                </li>
                                            </a>
                                        </>

                                        {/*  الإعدادات داخل الـ dropdown - نفس Navbar الأول */}
                                        <a href="#">
                                            <li>
                                                <IoSettings />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenSettings();
                                                    }}
                                                    title="إعدادات الحساب"
                                                    aria-label="إعدادات الحساب"
                                                >
                                                    الإعدادات
                                                </button>
                                            </li>
                                        </a>
                                        <a href="#">
                                            <li onClick={handleLogout}>
                                                <FaSignOutAlt />
                                                تسجيل الخروج
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

                    {/*  قسم الروابط المعلق (كما هو) */}
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

export default CenterNavbar;
