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
import SettingModel from "../models/SettingModel";
import { useAuthUser } from "../hooks/useAuthUser";

const UserNavbar: React.FC = () => {
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
                                    <a href="/user-dashboard">
                                        <li>
                                            <FaUserAlt />
                                            حسابي
                                        </li>
                                    </a>
                                    <a href="/user-dashboard/user-setting">
                                        <li>
                                            <IoSettings />
                                            إعدادات
                                        </li>
                                    </a>
                                    <a href="/user-dashboard/plans">
                                        <li>
                                            <BsTable />
                                            جدول
                                        </li>
                                    </a>
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

export default UserNavbar;
