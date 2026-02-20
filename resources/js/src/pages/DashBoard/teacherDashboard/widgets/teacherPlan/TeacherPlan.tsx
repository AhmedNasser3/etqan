// TeacherPlan.tsx - الكامل مع التاريخ واليوم الحالي من React ✅
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiTimerDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { useState, useMemo } from "react";
import Profile from "../dashboard/profile.js";
import { useTeacherPlan, UpcomingSession } from "./hooks/useTeacherPlan";

const TeacherPlan: React.FC = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [quickRecitationModal, setQuickRecitationModal] = useState(false);
    const [aiReport, setAiReport] = useState("");

    const { upcomingSessions, loading, error, refetch } = useTeacherPlan();

    // ✅ التاريخ واليوم الحالي من React (ديناميكي)
    const todayInfo = useMemo(() => {
        const today = new Date();
        const egyptTime = new Date(today.getTime() + 2 * 60 * 60 * 1000); // EET +2

        const days = [
            "الأحد",
            "الإثنين",
            "الثلاثاء",
            "الأربعاء",
            "الخميس",
            "الجمعة",
            "السبت",
        ];
        const months = [
            "يناير",
            "فبراير",
            "مارس",
            "أبريل",
            "مايو",
            "يونيو",
            "يوليو",
            "أغسطس",
            "سبتمبر",
            "أكتوبر",
            "نوفمبر",
            "ديسمبر",
        ];

        const dayName = days[egyptTime.getDay()];
        const day = egyptTime.getDate();
        const month = months[egyptTime.getMonth()];
        const year = egyptTime.getFullYear();

        return {
            dayName,
            formattedDate: `${day} ${month} ${year}`,
            fullDate: `${dayName} ${day} ${month} ${year}`,
        };
    }, []);

    // ✅ تنسيق الوقت 10:15:00 → 10:15 ص
    const formatTime = (timeString: string): string => {
        try {
            const [hourStr, minuteStr] = timeString.split(":");
            const hour = parseInt(hourStr);
            const period = hour >= 12 ? "م" : "ص";
            const displayHour = hour > 12 ? hour - 12 : hour || 12;
            return `${displayHour}:${minuteStr} ${period}`;
        } catch {
            return timeString;
        }
    };

    // Loading State
    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "2rem",
                    fontSize: "18px",
                    color: "#666",
                    minHeight: "400px",
                }}
            >
                ⏳ جاري تحميل خطتك اليومية...
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "2rem",
                    background: "#f8d7da",
                    borderRadius: "8px",
                    color: "#721c24",
                    margin: "1rem",
                }}
            >
                ❌ خطأ في تحميل الحلقات: {error}
                <div style={{ marginTop: "1rem" }}>
                    <button
                        onClick={refetch}
                        style={{
                            padding: "10px 20px",
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            marginRight: "10px",
                        }}
                    >
                        🔄 إعادة المحاولة
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: "10px 20px",
                            background: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                        }}
                    >
                        🔄 إعادة تحميل الصفحة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Profile />
            <div
                className="userProfile__plan"
                style={{ paddingBottom: "24px" }}
            >
                {/* Stats Cards */}
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>الحصص المكتملة</h3>
                            <p className="teacherPlan__stat-number">3/3</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon yellowColor">
                            <i>
                                <PiTimerDuotone />
                            </i>
                        </div>
                        <div>
                            <h3>الحصص المتاحة</h3>
                            <p className="teacherPlan__stat-number">
                                {upcomingSessions.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="testimonials__mainTitle">
                    <h1>حلقاتك المتاحة</h1>
                </div>

                {/* حالة عدم وجود حلقات */}
                {upcomingSessions.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "4rem 2rem",
                            background: "#f8f9fa",
                            borderRadius: "12px",
                            border: "2px dashed #dee2e6",
                            margin: "2rem 0",
                        }}
                    >
                        <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
                            📭 لا توجد حلقات متاحة حالياً
                        </div>
                        <div style={{ color: "#6c757d", marginBottom: "2rem" }}>
                            تأكد من وجود حلقات بـ{" "}
                            <strong>is_available = true</strong>
                            <br />
                            <small>اليوم: {todayInfo.fullDate}</small>
                        </div>
                        <button
                            onClick={refetch}
                            style={{
                                padding: "12px 24px",
                                background: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                cursor: "pointer",
                            }}
                        >
                            🔄 تحديث البيانات
                        </button>
                    </div>
                ) : (
                    /* ✅ جدول مُحدث - التاريخ واليوم الحالي فقط */
                    <div className="plan__daily-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>وقت الحصة</th>
                                    <th>عدد الطلاب</th>
                                    <th>التاريخ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingSessions.map(
                                    (
                                        session: UpcomingSession,
                                        index: number,
                                    ) => (
                                        <tr
                                            key={session.id}
                                            className="plan__row pending"
                                        >
                                            <td>{index + 1}</td>
                                            <td className="teacherPlan__session-time">
                                                <span>من</span>
                                                {formatTime(session.start_time)}
                                                <br />
                                                <span>الي</span>
                                                {formatTime(session.end_time)}
                                            </td>
                                            <td className="teacherPlan__students-count">
                                                {session.booked_students}/
                                                {session.max_students || "∞"}
                                            </td>
                                            <td
                                                colSpan={2}
                                                style={{
                                                    textAlign: "center",
                                                    padding: "12px 0",
                                                }}
                                            >
                                                {/* ✅ البيانات من Backend بس الوقت */}
                                                <div
                                                    colSpan={2}
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {/* ✅ التاريخ واليوم الحالي ديناميكي */}
                                                    <div
                                                        style={{
                                                            fontWeight: "600",
                                                            color: "#495057",
                                                            marginBottom: "5px",
                                                        }}
                                                    >
                                                        {todayInfo.dayName}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "14px",
                                                            color: "#6c757d",
                                                        }}
                                                    >
                                                        {
                                                            todayInfo.formattedDate
                                                        }
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* AI Report */}
                {aiReport && (
                    <div className="plan__ai-suggestion teacherPlan__ai-report">
                        <i>
                            <RiRobot2Fill />
                        </i>
                        <strong>تقرير AI:</strong> {aiReport}
                    </div>
                )}
            </div>
        </>
    );
};

export default TeacherPlan;
