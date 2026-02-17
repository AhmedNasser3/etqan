import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { FiMessageSquare, FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useTeacherStudents } from "./hooks/useTeacherStudents";
import Profile from "../dashboard/profile";

interface Student {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    progress?: number;
    status: "active" | "paused";
}

const TeacherStudents: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // ✅ استخدام الـ Hook الجديد
    const { students, totalCount, loading, error, toggleStudentStatus } =
        useTeacherStudents();

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getProgressClass = (progress: number) => {
        if (progress >= 70) return "teacherStudent__progress-badge green";
        if (progress >= 50) return "teacherStudent__progress-badge orange";
        return "teacherStudent__progress-badge red";
    };

    const getStatusIcon = (status: Student["status"]) => {
        return status === "active" ? (
            <GrStatusGood className={`teacherStudent__status-icon ${status}`} />
        ) : (
            <GrStatusCritical
                className={`teacherStudent__status-icon ${status}`}
            />
        );
    };

    const getStatusText = (status: Student["status"]) => {
        return status === "active" ? "نشط" : "متوقف";
    };

    const getActionText = (status: Student["status"]) => {
        return status === "active" ? "وقف الطالب" : "تنشيط الطالب";
    };

    if (loading) {
        return <div className="loading">جاري التحميل...</div>;
    }

    if (error) {
        return <div className="error">خطأ: {error}</div>;
    }

    return (
        <>
            <Profile />
            <div
                className="userProfile__plan"
                style={{ paddingBottom: "24px" }}
            >
                <div className="userProfile__planTitle">
                    <h1>
                        جميع طلابك <span>{totalCount} طالب</span>
                    </h1>
                </div>

                <div className="plan__header">
                    <div className="plan__ai-suggestion">
                        <i>
                            <RiRobot2Fill />
                        </i>
                        راجع الطلاب المتوقفين قريباً
                    </div>
                    <div className="plan__current">
                        <h2>قائمة الطلاب</h2>
                        <div className="plan__filters">
                            {/* ✅ فلتر البحث */}
                            <div className="date-picker search-input">
                                <FiSearch className="search-icon" />
                                <input
                                    type="search"
                                    placeholder="البحث بالاسم..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>اسم الطالب</th>
                                {/* <th>مستوى التقدم</th> */}
                                <th>الحالة</th>
                                <th>الإجراء</th>
                                {/* <th>التواصل</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`plan__row ${item.status}`}
                                >
                                    <td className="teacherStudent__img">
                                        <div className="w-12 h-12 rounded-full overflow-hidden">
                                            <img
                                                src={item.avatar}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td>{item.name}</td>
                                    {/* <td>
                                        <span
                                            className={`teacherStudent__progress-badge ${getProgressClass(item.progress || 0)}`}
                                        >
                                            {item.progress || 0}%
                                        </span>
                                    </td> */}
                                    <td>
                                        <span>
                                            {getStatusText(item.status)}
                                        </span>
                                    </td>
                                    <td className="teacherStudent__status">
                                        <button
                                            className={`teacherStudent__status-btn ${item.status} p-2 rounded-full border-2 transition-all flex items-center justify-center w-10 h-10 mr-2`}
                                            onClick={() =>
                                                toggleStudentStatus(item.id)
                                            }
                                        >
                                            {getStatusIcon(item.status)}
                                        </button>
                                        <span>
                                            {getActionText(item.status)}
                                        </span>
                                    </td>
                                    {/* <td>
                                        <button className="teacherStudent__chat">
                                            <FiMessageSquare className="text-xl" />
                                        </button>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ✅ الإحصائيات */}
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GoGoal />
                            </i>
                        </div>
                        <div>
                            <h3>عدد الطلاب</h3>
                            <p className="text-2xl font-bold text-red-600">
                                {totalCount}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon yellowColor">
                            <i>
                                <FaStar />
                            </i>
                        </div>
                        <div>
                            <h3>متوسط التقدم</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                {students.length > 0
                                    ? Math.round(
                                          students.reduce(
                                              (acc, s) =>
                                                  acc + (s.progress || 0),
                                              0,
                                          ) / students.length,
                                      ) + "%"
                                    : "0%"}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>
                                <FiMessageSquare />
                            </i>
                        </div>
                        <div>
                            <h3>نشط حالياً</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {
                                    students.filter(
                                        (s) => s.status === "active",
                                    ).length
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* ✅ الـ Progress Bars */}
                <div
                    className="inputs__verifyOTPBirth"
                    id="userProfile__verifyOTPBirth"
                >
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>إجمالي التقدم</h1>
                        </div>
                        <p>
                            {students.length > 0
                                ? Math.round(
                                      students.reduce(
                                          (acc, s) => acc + (s.progress || 0),
                                          0,
                                      ) / students.length,
                                  ) + "%"
                                : "0%"}
                        </p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{
                                    width:
                                        students.length > 0
                                            ? `${Math.round(students.reduce((acc, s) => acc + (s.progress || 0), 0) / students.length)}%`
                                            : "0%",
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherStudents;
