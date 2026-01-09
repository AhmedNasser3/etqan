import { useState, useEffect } from "react";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaBarsProgress } from "react-icons/fa6";
import { BsFillMortarboardFill } from "react-icons/bs";
import { FaAssistiveListeningSystems } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa";
import { PiMedalFill } from "react-icons/pi";
import { GrCertificate } from "react-icons/gr";

const UserSidebar: React.FC = () => {
    const [activePage, setActivePage] = useState("dashboard");

    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes("plans")) {
            setActivePage("plans");
        } else if (currentPath.includes("progress")) {
            setActivePage("progress");
        } else if (currentPath.includes("groups")) {
            setActivePage("groups");
        } else if (currentPath.includes("listening")) {
            setActivePage("listening");
        } else if (currentPath.includes("attendance")) {
            setActivePage("attendance");
        } else if (currentPath.includes("points")) {
            setActivePage("points");
        } else if (currentPath.includes("certificates")) {
            setActivePage("certificates");
        } else {
            setActivePage("dashboard");
        }
    }, []);

    return (
        <div className="sidebar">
            <div className="sidebar__features">
                <div className="sidebar__inner">
                    <div className="sidebar__container">
                        <div
                            className={`sidebar__data ${
                                activePage === "dashboard" ? "active" : ""
                            }`}
                        >
                            <div className="sidebar__title">
                                <a href="/user-dashboard">
                                    <i>
                                        <TbLayoutDashboardFilled />
                                    </i>
                                    <h2>داش بورد</h2>
                                </a>
                            </div>
                        </div>
                        <div
                            className={`sidebar__data ${
                                activePage === "plans" ? "active" : ""
                            }`}
                        >
                            <div className="sidebar__title">
                                <a href="/user-dashboard/plans">
                                    <i>
                                        <FaRegCalendarAlt />
                                    </i>
                                    <h2>الخطة</h2>
                                </a>
                            </div>
                        </div>
                        <div
                            className={`sidebar__data ${
                                activePage === "progress" ? "active" : ""
                            }`}
                        >
                            <div className="sidebar__title">
                                <a href="/user-dashboard/user-progress">
                                    <i>
                                        <FaBarsProgress />
                                    </i>
                                    <h2>مستوي التقدم</h2>
                                </a>
                            </div>
                        </div>
                        <div
                            className={`sidebar__data ${
                                activePage === "groups" ? "active" : ""
                            }`}
                        >
                            <div className="sidebar__title">
                                <a href="/user-dashboard/user-complexes">
                                    <i>
                                        <BsFillMortarboardFill />
                                    </i>
                                    <h2>المجمعات</h2>
                                </a>
                            </div>
                        </div>
                        <div
                            className={`sidebar__data ${
                                activePage === "listening" ? "active" : ""
                            }`}
                        >
                            <div className="sidebar__title">
                                <a href="/user-dashboard/user-listesning">
                                    <i>
                                        <FaAssistiveListeningSystems />
                                    </i>
                                    <h2>سجل التسميع</h2>
                                </a>
                            </div>
                        </div>
                        <div
                            className={`sidebar__data ${
                                activePage === "attendance" ? "active" : ""
                            }`}
                        >
                            <div className="sidebar__title">
                                <a href="#">
                                    <i>
                                        <FaUserCheck />
                                    </i>
                                    <h2>الحضور والغياب</h2>
                                </a>
                            </div>
                        </div>

                        <div
                            className={`sidebar__data ${
                                activePage === "certificates" ? "active" : ""
                            }`}
                        >
                            <div className="sidebar__title">
                                <a href="#">
                                    <i>
                                        <GrCertificate />
                                    </i>
                                    <h2>الشهادات والملاحظات</h2>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSidebar;
