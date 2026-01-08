import { useState } from "react";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaBarsProgress } from "react-icons/fa6";
import { BsFillMortarboardFill } from "react-icons/bs";
import { FaAssistiveListeningSystems } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa";
import { PiMedalFill } from "react-icons/pi";
import { GrCertificate } from "react-icons/gr";

const UserSidebar: React.FC = () => {
    const [isRotated, setIsRotated] = useState(false);

    return (
        <div className="sidebar">
            <div className={`sidebar__features ${isRotated ? "rotated" : ""}`}>
                <div className="sidebar__inner">
                    <div className="sidebar__container">
                        <div className="sidebar__data active">
                            <div className="sidebar__title">
                                <a href="#">
                                    <i>
                                        <TbLayoutDashboardFilled />
                                    </i>
                                    <h2>داش بورد</h2>
                                </a>
                            </div>
                        </div>
                        <div className="sidebar__data ">
                            <div className="sidebar__title">
                                <a href="#">
                                    <i>
                                        <FaRegCalendarAlt />
                                    </i>
                                    <h2>الخطة</h2>
                                </a>
                            </div>
                        </div>
                        <div className="sidebar__data ">
                            <div className="sidebar__title">
                                <a href="#">
                                    <i>
                                        <FaBarsProgress />
                                    </i>
                                    <h2>مستوي التقدم</h2>
                                </a>
                            </div>
                        </div>
                        <div className="sidebar__data ">
                            <div className="sidebar__title">
                                <a href="#">
                                    <i>
                                        <BsFillMortarboardFill />
                                    </i>
                                    <h2>المجمعات </h2>
                                </a>
                            </div>
                        </div>
                        <div className="sidebar__data ">
                            <div className="sidebar__title">
                                <a href="#">
                                    <i>
                                        <FaAssistiveListeningSystems />
                                    </i>
                                    <h2>سجل التسميع </h2>
                                </a>
                            </div>
                        </div>
                        <div className="sidebar__data ">
                            <div className="sidebar__title">
                                <a href="#">
                                    <i>
                                        <FaUserCheck />
                                    </i>
                                    <h2>الحضور والغياب </h2>
                                </a>
                            </div>
                        </div>
                        <div className="sidebar__data ">
                            <div className="sidebar__title">
                                <a href="#">
                                    <i>
                                        <PiMedalFill />
                                    </i>
                                    <h2>النقاط والأوسمة </h2>
                                </a>
                            </div>
                        </div>
                        <div className="sidebar__data ">
                            <div className="sidebar__title">
                                <a href="#">
                                    <i>
                                        <GrCertificate />
                                    </i>
                                    <h2>الشهادات والملاحظات </h2>
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
