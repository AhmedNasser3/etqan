import { SiCircle } from "react-icons/si";
import { useEffect, useState } from "react";
import { IoCopy } from "react-icons/io5";
import StudentApproval from "./Students/Approval/StudentApproval";
import StaffApproval from "./Staff/Approval/StaffApproval";
import StaffAttendance from "./Attendance/Staff/StaffAttendance";
import DomainLinks from "./Links/DomainLinks";
import UserSuspend from "./Users/Suspend/UserSuspend";
import FinancialDashboard from "../Financial/Dashboard/FinancialDashboard";
import PayrollSettings from "../Financial/Settings/PayrollSettings";
import PayrollReports from "../Financial/Reports/PayrollReports";
import PayrollExport from "../Financial/Export/PayrollExport";

const CenterDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        circles: 60,
        students: 245,
        teachers: 12,
        attendance: 95,
    });

    return (
        <div className="CenterDashboard">
            <div className="CenterDashboard__inner">
                <div className="CenterDashboard__cards">
                    <div className="CenterDashboard__card">
                        <div className="CenterDashboard__icon  bg-light">
                            <SiCircle />
                        </div>
                        <div className="CenterDashboard__title">
                            <h3>عدد الحلقات</h3>
                        </div>
                        <div className="CenterDashboard__data">
                            <h2>{stats.circles}</h2>
                        </div>
                    </div>

                    <div className="CenterDashboard__card">
                        <div className="CenterDashboard__icon bg-blue">
                            <SiCircle />
                        </div>
                        <div className="CenterDashboard__title">
                            <h3>عدد الطلاب</h3>
                        </div>
                        <div className="CenterDashboard__data">
                            <h2>{stats.students}</h2>
                        </div>
                    </div>

                    <div className="CenterDashboard__card">
                        <div className="CenterDashboard__icon bg-orange">
                            <SiCircle />
                        </div>
                        <div className="CenterDashboard__title">
                            <h3>عدد المعلمين</h3>
                        </div>
                        <div className="CenterDashboard__data">
                            <h2>{stats.teachers}</h2>
                        </div>
                    </div>

                    <div className="CenterDashboard__card">
                        <div className="CenterDashboard__icon bg-green">
                            <SiCircle />
                        </div>
                        <div className="CenterDashboard__title">
                            <h3>معدل الحضور</h3>
                        </div>
                        <div className="CenterDashboard__data">
                            <h2>{stats.attendance}%</h2>
                        </div>
                    </div>
                </div>
                <div className="CenterDashboard__link">
                    <div className="CenterDashboard__LinkText">
                        <div className="userProfile__meetBtnUrl">
                            <i>
                                <IoCopy />
                            </i>
                            <h1>http://127.0.0.1:8000/user-dashboard</h1>
                        </div>{" "}
                    </div>
                </div>
            </div>
            <StudentApproval />
            <StaffApproval />
            <StaffAttendance />
            <DomainLinks />
            <UserSuspend />
            <FinancialDashboard />
            <PayrollSettings />
            <PayrollReports />
            <PayrollExport/>
        </div>
    );
};

export default CenterDashboard;
