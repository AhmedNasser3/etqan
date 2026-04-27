import { RiRobot2Fill } from "react-icons/ri";
import { IoCopy } from "react-icons/io5";
import { useState, useMemo } from "react";
import { useTeacherPlan, UpcomingSession } from "./hooks/useTeacherPlan";
import { useNavigate } from "react-router-dom";

const TeacherPlan: React.FC = () => {
    const navigate = useNavigate();
    const { upcomingSessions, loading, error, refetch } = useTeacherPlan();

    const todayInfo = useMemo(() => {
        const today = new Date();
        const egyptTime = new Date(today.getTime() + 2 * 60 * 60 * 1000);
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

    const copyRoomLink = (roomName: string | null) => {
        if (roomName) navigator.clipboard.writeText(roomName);
    };

    const joinMeeting = (scheduleId: number) => {
        navigate(`/teacher-dashboard/room?schedule=${scheduleId}`);
    };

    if (loading) {
        return (
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">حلقاتك المتاحة</div>
                    </div>
                    <div style={{ padding: "60px 0", textAlign: "center" }}>
                        <div className="navbar__loading">
                            <div className="loading-spinner">
                                <div className="spinner-circle"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">حلقاتك المتاحة</div>
                    </div>
                    <div style={{ padding: "24px 18px" }}>
                        <div
                            style={{
                                background: "#fee2e2",
                                borderRadius: "var(--border-radius-md)",
                                padding: "16px 18px",
                                color: "#991b1b",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "12px",
                            }}
                        >
                            <span>❌ خطأ في تحميل الحلقات: {error}</span>
                            <div className="flx">
                                <button
                                    className="btn bp bsm"
                                    onClick={refetch}
                                >
                                    🔄 إعادة المحاولة
                                </button>
                                <button
                                    className="btn bs bsm"
                                    style={{ margin: "0 6px" }}
                                    onClick={() => window.location.reload()}
                                >
                                    🔄 إعادة تحميل الصفحة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content" id="contentArea" style={{ padding: "12px 0" }}>
            <div className="widget">
                {/* Header */}
                <div className="wh">
                    <div className="wh-l">حلقاتك المتاحة</div>
                    <div className="flx">
                        <button className="btn bp bsm" onClick={refetch}>
                            تحديث
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>وقت الحلقة</th>
                                <th>التاريخ</th>
                                <th>الغرفة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingSessions.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="empty">
                                            <p>📭 لا توجد حلقات متاحة حالياً</p>
                                            <p
                                                style={{
                                                    fontSize: 12,
                                                    color: "var(--color-text-secondary)",
                                                    margin: "6px 0 12px",
                                                }}
                                            >
                                                اليوم: {todayInfo.fullDate}
                                            </p>
                                            <button
                                                className="btn bp bsm"
                                                onClick={refetch}
                                            >
                                                🔄 تحديث البيانات
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                upcomingSessions.map(
                                    (
                                        session: UpcomingSession,
                                        index: number,
                                    ) => (
                                        <tr key={session.id}>
                                            {/* الرقم */}
                                            <td
                                                style={{
                                                    fontWeight: 700,
                                                    width: 50,
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {index + 1}
                                            </td>

                                            {/* وقت الحلقة */}
                                            <td>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 16,
                                                        alignItems:
                                                            "flex-start",
                                                    }}
                                                >
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "var(--color-text-secondary)",
                                                                marginBottom: 2,
                                                            }}
                                                        >
                                                            من
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontWeight: 500,
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            {formatTime(
                                                                session.start_time,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "var(--color-text-secondary)",
                                                                marginBottom: 2,
                                                            }}
                                                        >
                                                            إلى
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontWeight: 500,
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            {formatTime(
                                                                session.end_time,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* التاريخ */}
                                            <td>
                                                <div
                                                    style={{
                                                        fontWeight: 500,
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {todayInfo.dayName}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--color-text-secondary)",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {todayInfo.formattedDate}
                                                </div>
                                            </td>

                                            {/* الغرفة */}
                                            <td>
                                                {session.jitsi_room_name ? (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                            gap: 8,
                                                            alignItems:
                                                                "flex-start",
                                                        }}
                                                    >
                                                        <div
                                                            onClick={() =>
                                                                copyRoomLink(
                                                                    session.jitsi_room_name,
                                                                )
                                                            }
                                                            style={{
                                                                cursor: "pointer",
                                                                padding:
                                                                    "5px 10px",
                                                                borderRadius:
                                                                    "var(--border-radius-md)",
                                                                background:
                                                                    "var(--color-background-secondary)",
                                                                border: "0.5px solid var(--color-border-tertiary)",
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 6,
                                                                fontSize: 12,
                                                                color: "var(--color-text-secondary)",
                                                                maxWidth: 200,
                                                                overflow:
                                                                    "hidden",
                                                            }}
                                                        >
                                                            <IoCopy
                                                                style={{
                                                                    flexShrink: 0,
                                                                    width: 13,
                                                                    height: 13,
                                                                }}
                                                            />
                                                            <span
                                                                style={{
                                                                    overflow:
                                                                        "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {
                                                                    session.jitsi_room_name
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="td-actions">
                                                            <button
                                                                className="btn bp bxs"
                                                                onClick={() =>
                                                                    joinMeeting(
                                                                        session.id,
                                                                    )
                                                                }
                                                            >
                                                                دخول الحلقة
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        غير محدد
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherPlan;
