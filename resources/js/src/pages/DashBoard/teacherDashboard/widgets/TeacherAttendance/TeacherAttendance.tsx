import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { FiMessageSquare } from "react-icons/fi";
import { useState, useEffect } from "react";
import Profile from "../dashboard/Profile";

interface AttendanceSession {
    id: number;
    time: string;
    status: "present" | "absent";
}

interface AttendanceDay {
    id: number;
    date: string;
    dayName: string;
    sessions: AttendanceSession[];
    totalStatus: "present" | "partial" | "absent";
}

const TeacherAttendance: React.FC = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [dateFrom, setDateFrom] = useState(
        sevenDaysAgo.toISOString().split("T")[0]
    );
    const [dateTo, setDateTo] = useState(today.toISOString().split("T")[0]);
    const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([
        {
            id: 1,
            date: "2026-01-06",
            dayName: "الثلاثاء",
            sessions: [
                { id: 1, time: "10:10-10:30", status: "present" },
                { id: 2, time: "12:12-12:30", status: "present" },
                { id: 3, time: "13:00-13:30", status: "absent" },
            ],
            totalStatus: "partial",
        },
        {
            id: 2,
            date: "2026-01-07",
            dayName: "الأربعاء",
            sessions: [
                { id: 4, time: "10:10-10:30", status: "present" },
                { id: 5, time: "12:12-12:30", status: "present" },
            ],
            totalStatus: "present",
        },
        {
            id: 3,
            date: "2026-01-08",
            dayName: "الخميس",
            sessions: [
                { id: 6, time: "10:10-10:30", status: "absent" },
                { id: 7, time: "12:12-12:30", status: "present" },
            ],
            totalStatus: "partial",
        },
        {
            id: 4,
            date: "2026-01-09",
            dayName: "الجمعة",
            sessions: [],
            totalStatus: "absent",
        },
        {
            id: 5,
            date: "2026-01-10",
            dayName: "السبت",
            sessions: [
                { id: 8, time: "10:10-10:30", status: "present" },
                { id: 9, time: "12:12-12:30", status: "present" },
            ],
            totalStatus: "present",
        },
        {
            id: 6,
            date: "2026-01-11",
            dayName: "الأحد",
            sessions: [
                { id: 10, time: "10:10-10:30", status: "present" },
                { id: 11, time: "12:12-12:30", status: "absent" },
            ],
            totalStatus: "partial",
        },
        {
            id: 7,
            date: "2026-01-12",
            dayName: "الإثنين",
            sessions: [
                { id: 12, time: "10:10-10:30", status: "present" },
                { id: 13, time: "12:12-12:30", status: "present" },
            ],
            totalStatus: "present",
        },
    ]);
    const [filteredData, setFilteredData] =
        useState<AttendanceDay[]>(attendanceData);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const getDayName = (dateString: string) => {
        const date = new Date(dateString);
        const days = [
            "الأحد",
            "الإثنين",
            "الثلاثاء",
            "الأربعاء",
            "الخميس",
            "الجمعة",
            "السبت",
        ];
        return days[date.getDay()];
    };

    const getTotalStatusClass = (status: AttendanceDay["totalStatus"]) => {
        if (status === "present")
            return "teacherAttendance__status-badge green";
        if (status === "partial")
            return "teacherAttendance__status-badge orange";
        return "teacherAttendance__status-badge red";
    };

    const getTotalStatusText = (status: AttendanceDay["totalStatus"]) => {
        return status === "present"
            ? "حاضر كامل"
            : status === "partial"
            ? "حاضر جزئي"
            : "غائب";
    };

    const getSessionStatusIcon = (status: AttendanceSession["status"]) => {
        return status === "present" ? (
            <GrStatusGood
                className={`teacherAttendance__session-icon ${status}`}
            />
        ) : (
            <GrStatusCritical
                className={`teacherAttendance__session-icon ${status}`}
            />
        );
    };

    const toggleSessionStatus = (dayId: number, sessionId: number) => {
        setAttendanceData((prev) =>
            prev.map((day) =>
                day.id === dayId
                    ? {
                          ...day,
                          sessions: day.sessions.map((session) =>
                              session.id === sessionId
                                  ? {
                                        ...session,
                                        status:
                                            session.status === "present"
                                                ? "absent"
                                                : "present",
                                    }
                                  : session
                          ),
                          totalStatus: calculateTotalStatus(
                              day.sessions.map((session) =>
                                  session.id === sessionId
                                      ? {
                                            ...session,
                                            status:
                                                session.status === "present"
                                                    ? "absent"
                                                    : "present",
                                        }
                                      : session
                              )
                          ),
                      }
                    : day
            )
        );
    };

    const calculateTotalStatus = (
        sessions: AttendanceSession[]
    ): AttendanceDay["totalStatus"] => {
        if (sessions.length === 0) return "absent";
        const presentCount = sessions.filter(
            (s) => s.status === "present"
        ).length;
        if (presentCount === sessions.length) return "present";
        if (presentCount > 0) return "partial";
        return "absent";
    };

    const fetchAttendanceData = () => {
        const filtered = attendanceData.filter((item) => {
            const itemDate = new Date(item.date);
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            return itemDate >= fromDate && itemDate <= toDate;
        });
        setFilteredData(filtered);
    };

    useEffect(() => {
        fetchAttendanceData();
    }, [dateFrom, dateTo, attendanceData]);

    const selectedDayData = selectedDay
        ? attendanceData.find((day) => day.id === selectedDay)
        : null;

    return (
        <>
            <Profile />
            <div
                className="userProfile__plan"
                style={{ paddingBottom: "24px" }}
            >
                <div className="userProfile__planTitle">
                    <h1>
                        سجل الحضور <span>{filteredData.length} أيام</span>
                    </h1>
                </div>

                <div className="plan__header">
                    <div className="plan__ai-suggestion">
                        <i>
                            <RiRobot2Fill />
                        </i>
                        راجع حضور يوم الأربعاء
                    </div>
                    <div className="plan__current">
                        <h2>سجل الحضور اليومي</h2>
                        <div className="plan__date-range">
                            <div className="date-picker to">
                                <input
                                    type="search"
                                    placeholder="البحث بالتاريخ..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>الحصص</th>
                                <th>الحالة الإجمالية</th>
                                <th>التفاصيل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((day) => (
                                <tr
                                    key={day.id}
                                    className={`plan__row ${day.totalStatus}`}
                                >
                                    <td>
                                        <div>
                                            <div className="font-bold">
                                                {day.date}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {day.dayName}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {day.sessions.map((session) => (
                                                <div
                                                    key={session.id}
                                                    className="attendance-session"
                                                >
                                                    <span className="text-xs">
                                                        {session.time}
                                                    </span>
                                                    <div
                                                        className={`session-status ${session.status}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSessionStatus(
                                                                day.id,
                                                                session.id
                                                            );
                                                        }}
                                                    >
                                                        {getSessionStatusIcon(
                                                            session.status
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {day.sessions.length === 0 && (
                                                <span className="text-gray-400 text-sm">
                                                    لا توجد حصص
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`teacherAttendance__status-badge ${getTotalStatusClass(
                                                day.totalStatus
                                            )}`}
                                        >
                                            {getTotalStatusText(
                                                day.totalStatus
                                            )}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="teacherAttendance__details"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDay(
                                                    selectedDay === day.id
                                                        ? null
                                                        : day.id
                                                );
                                            }}
                                        >
                                            {selectedDay === day.id
                                                ? "إخفاء"
                                                : "عرض التفاصيل"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedDayData && (
                    <div className="attendance-details-modal">
                        <div
                            className="modal-overlay"
                            onClick={() => setSelectedDay(null)}
                        />
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>
                                    تفاصيل حضور يوم {selectedDayData.dayName}
                                </h3>
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    className="close-modal"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="day-info">
                                    <strong>التاريخ:</strong>{" "}
                                    {selectedDayData.date}
                                </div>
                                <div className="sessions-list">
                                    <h4>تفاصيل الحصص:</h4>
                                    {selectedDayData.sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="session-detail"
                                        >
                                            <span className="session-time">
                                                {session.time}
                                            </span>
                                            <span
                                                className={`session-status ${session.status}`}
                                            >
                                                {session.status === "present"
                                                    ? "حاضر"
                                                    : "غائب"}
                                            </span>
                                            <div className="session-icon">
                                                {getSessionStatusIcon(
                                                    session.status
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="total-status">
                                    <strong>الحالة الإجمالية: </strong>
                                    <span
                                        className={`status-badge ${selectedDayData.totalStatus}`}
                                    >
                                        {getTotalStatusText(
                                            selectedDayData.totalStatus
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GoGoal />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي الأيام</h3>
                            <p className="text-2xl font-bold text-red-600">
                                {filteredData.length}
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
                            <h3>نسبة الحضور</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                {Math.round(
                                    (filteredData.filter(
                                        (d) => d.totalStatus === "present"
                                    ).length /
                                        Math.max(filteredData.length, 1)) *
                                        100
                                )}
                                %
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>
                                <PiWhatsappLogoDuotone />
                            </i>
                        </div>
                        <div>
                            <h3>حاضر اليوم</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {attendanceData[attendanceData.length - 1]
                                    ?.totalStatus === "present"
                                    ? "نعم"
                                    : "لا"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherAttendance;
