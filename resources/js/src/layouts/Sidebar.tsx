import { useState, useEffect } from "react";
import { FaUserAlt } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { BsTable } from "react-icons/bs";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaBarsProgress } from "react-icons/fa6";
import { BsFillMortarboardFill } from "react-icons/bs";
import { FaAssistiveListeningSystems } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa";
import { GrCertificate } from "react-icons/gr";
import SettingModel from "./models/SettingModel";
import { useAuthUser } from "./hooks/useAuthUser";
import { FaSignOutAlt } from "react-icons/fa";

const Sidebar: React.FC = () => {
    const [activePage, setActivePage] = useState("dashboard");
    const [showSettingModel, setShowSettingModel] = useState(false);
    const { user, loading } = useAuthUser();

    const handleOpenSettingModel = () => {
        setShowSettingModel(true);
    };

    const handleClosedSettingModel = () => {
        setShowSettingModel(false);
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

    const getDashboardPath = () => {
        if (!user) return "/user-dashboard";
        if (user.teacher == true) {
            return "/teacher-dashboard";
        }
        if (
            user.role_id === 1 ||
            user.role === "center_owner" ||
            user.role === "admin"
        ) {
            return "/center-dashboard";
        }
        if (user.role_id == 2 || user.role === "guardian") {
            return "/user-dashboard";
        }
        return "/user-dashboard";
    };

    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes("plans")) {
            setActivePage("plans");
        } else if (currentPath.includes("progress")) {
            setActivePage("progress");
        } else if (
            currentPath.includes("groups") ||
            currentPath.includes("complexes")
        ) {
            setActivePage("groups");
        } else if (
            currentPath.includes("listening") ||
            currentPath.includes("listesning")
        ) {
            setActivePage("listening");
        } else if (
            currentPath.includes("attendance") ||
            currentPath.includes("presence")
        ) {
            setActivePage("attendance");
        } else if (currentPath.includes("points")) {
            setActivePage("points");
        } else if (
            currentPath.includes("certificates") ||
            currentPath.includes("certificate")
        ) {
            setActivePage("certificates");
        } else if (currentPath.includes("mosque-manegment")) {
            setActivePage("mosque");
        } else if (currentPath.includes("settings")) {
            setActivePage("settings");
        } else {
            setActivePage("dashboard");
        }
    }, []);

    if (loading) {
        return (
            <div className="sidebar">
                <div className="sidebar__loading">جاري التحميل...</div>
            </div>
        );
    }

    return (
        <div className="sidebar">
            <SettingModel
                isOpen={showSettingModel}
                onClose={handleClosedSettingModel}
            />
            <div className="sidebar__features">
                <div className="sidebar__inner">
                    <div className="sidebar__container">
                        {/* 🔥 حسابي/مجمعي - خانة عادية */}
                        {user && (
                            <div
                                className={`sidebar__data ${
                                    activePage === "profile" ? "active" : ""
                                }`}
                            >
                                <div className="sidebar__title">
                                    <a href={getDashboardPath()}>
                                        <i>
                                            <FaUserAlt />
                                        </i>
                                        <h2>{user.name}</h2>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* 🔥 تسجيل خروج */}
                        {user && (
                            <div className="sidebar__data">
                                <div className="sidebar__title">
                                    <a href="">
                                        <i>
                                            <GrCertificate />
                                        </i>
                                        <button onClick={handleLogout}>
                                            <h2>تسجيل الخروج</h2>
                                        </button>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* 🔥 Center Owner options */}
                        {user && getDashboardPath() === "/center-dashboard" && (
                            <>
                                <div
                                    className={`sidebar__data ${activePage === "mosque" ? "active" : ""}`}
                                >
                                    <div className="sidebar__title">
                                        <a href="/center-dashboard/mosque-manegment">
                                            <i>
                                                <FaUserAlt />
                                            </i>
                                            <h2>إدارة المساجد</h2>
                                        </a>
                                    </div>
                                </div>
                                <div
                                    className={`sidebar__data ${activePage === "settings" ? "active" : ""}`}
                                >
                                    <div className="sidebar__title">
                                        <a href="/center-dashboard/settings">
                                            <i>
                                                <IoSettings />
                                            </i>
                                            <h2>إعدادات المجمع</h2>
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
