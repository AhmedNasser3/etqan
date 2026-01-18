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

const CenterSidebar: React.FC = () => {
    const [activePage, setActivePage] = useState("dashboard");
    const [isStudentsOpen, setIsStudentsOpen] = useState(false);

    useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes("students")) {
            setActivePage("students");
            setIsStudentsOpen(true);
        } else if (currentPath.includes("plans")) {
            setActivePage("plans");
        } else if (currentPath.includes("motivation")) {
            setActivePage("motivation");
        } else if (currentPath.includes("certificates")) {
            setActivePage("certificates");
        } else if (currentPath.includes("messages")) {
            setActivePage("messages");
        } else if (currentPath.includes("reports")) {
            setActivePage("reports");
        } else if (currentPath.includes("attendance")) {
            setActivePage("attendance");
        } else if (currentPath.includes("room")) {
            setActivePage("room");
        } else {
            setActivePage("dashboard");
        }
    }, []);

    const toggleStudents = () => {
        setIsStudentsOpen(!isStudentsOpen);
    };

    return (
        <div className="sidebar">
            <div className="sidebar__features">
                <div className="sidebar__inner">
                    <div className="sidebar__container">
                        <div
                            className={`sidebar__data ${activePage === "dashboard" ? "active" : ""}`}
                        >
                            <div className="sidebar__title">
                                <a href="/teacher-dashboard">
                                    <i>
                                        <TbLayoutDashboardFilled />
                                    </i>
                                    <h2>حلقتي اليوم</h2>
                                </a>
                            </div>
                        </div>

                        <div
                            className={`sidebar__data ${activePage === "students" ? "active" : ""}`}
                        >
                            <div
                                className="sidebar__title"
                                onClick={toggleStudents}
                            >
                                <a href="#">
                                    <i>
                                        <IoIosArrowDown
                                            className={`arrow-icon ${isStudentsOpen ? "rotated" : ""}`}
                                        />
                                    </i>
                                    <h2>الطلاب</h2>
                                </a>
                            </div>
                            <ul
                                className={`sub-menu ${isStudentsOpen ? "open" : ""}`}
                            >
                                <li>
                                    <a href="/center-dashboard/students/all">
                                        جميع الطلاب
                                    </a>
                                </li>
                                <li>
                                    <a href="/center-dashboard/students/approval">
                                        اعتماد الطلاب
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div
                            className={`sidebar__data ${activePage === "students" ? "active" : ""}`}
                        >
                            <div
                                className="sidebar__title"
                                onClick={toggleStudents}
                            >
                                <a href="#">
                                    <i>
                                        <IoIosArrowDown
                                            className={`arrow-icon ${isStudentsOpen ? "rotated" : ""}`}
                                        />
                                    </i>
                                    <h2>موظفين</h2>
                                </a>
                            </div>
                            <ul
                                className={`sub-menu ${isStudentsOpen ? "open" : ""}`}
                            >
                                <li>
                                    <a href="/center-dashboard/students/all">
                                        اعتماد المعلمين
                                    </a>
                                </li>
                                <li>
                                    <a href="/center-dashboard/students/approval">
                                        اعتماد المشرفين
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div
                            className={`sidebar__data ${activePage === "plans" ? "active" : ""}`}
                        >
                            <div className="sidebar__title">
                                <a href="/teacher-dashboard/plan">
                                    <i>
                                        <FaRegCalendarAlt />
                                    </i>
                                    <h2>الخطط</h2>
                                </a>
                            </div>
                        </div>

                        <div
                            className={`sidebar__data ${activePage === "motivation" ? "active" : ""}`}
                        >
                            <div className="sidebar__title">
                                <a href="/teacher-dashboard/motivation">
                                    <i>
                                        <FaStar />
                                    </i>
                                    <h2>التحفيز</h2>
                                </a>
                            </div>
                        </div>

                        <div
                            className={`sidebar__data ${activePage === "attendance" ? "active" : ""}`}
                        >
                            <div className="sidebar__title">
                                <a href="/teacher-dashboard/attendance">
                                    <i>
                                        <FaClock />
                                    </i>
                                    <h2>تحضيري</h2>
                                </a>
                            </div>
                        </div>

                        <div
                            className={`sidebar__data ${activePage === "room" ? "active" : ""}`}
                        >
                            <div className="sidebar__title">
                                <a href="/teacher-dashboard/room">
                                    <i>
                                        <FaVideo />
                                    </i>
                                    <h2>غرفة التسميع</h2>
                                </a>
                            </div>
                        </div>

                        <div
                            className={`sidebar__data ${activePage === "reports" ? "active" : ""}`}
                        >
                            <div className="sidebar__title">
                                <a href="/teacher-dashboard/reports">
                                    <i>
                                        <FaChartBar />
                                    </i>
                                    <h2>التقارير</h2>
                                </a>
                            </div>
                        </div>

                        <div
                            className={`sidebar__data ${activePage === "certificates" ? "active" : ""}`}
                        >
                            <div className="sidebar__title">
                                <a href="/teacher-dashboard/certificates">
                                    <i>
                                        <GrCertificate />
                                    </i>
                                    <h2>الشهادات</h2>
                                </a>
                            </div>
                        </div>

                        <div
                            className={`sidebar__data ${activePage === "messages" ? "active" : ""}`}
                        >
                            <div className="sidebar__title">
                                <a href="/teacher-dashboard/messages">
                                    <i>
                                        <FaComments />
                                    </i>
                                    <h2>الرسائل</h2>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CenterSidebar;
