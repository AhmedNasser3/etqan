import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiClock,
    FiCalendar,
    FiUsers,
    FiRefreshCw,
    FiCopy,
    FiLogIn,
    FiRepeat,
    FiAlertCircle,
    FiInbox,
} from "react-icons/fi";
import { useTeacherPlan, UpcomingSession } from "./hooks/useTeacherPlan";

/* ─────────────── Helpers ─────────────── */

/**
 * يقبل أي صيغة للوقت:
 *  "18:54:00"
 *  "18:54"
 *  "2026-05-07T18:54:00.000000Z"  ← timestamp كامل
 */
const formatTime12 = (t: string): string => {
    try {
        let hour: number;
        let minute: string;

        if (t.includes("T")) {
            // timestamp كامل — نستخرج الجزء الزمني بعد T
            const timePart = t.split("T")[1]; // "18:54:00.000000Z"
            const [h, m] = timePart.split(":");
            hour = parseInt(h, 10);
            minute = m ?? "00";
        } else {
            // وقت عادي "18:54:00" أو "18:54"
            const [h, m] = t.split(":");
            hour = parseInt(h, 10);
            minute = m ?? "00";
        }

        const period = hour >= 12 ? "مساءً" : "صباحاً";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${displayHour}:${minute} ${period}`;
    } catch {
        return t;
    }
};

const formatDate = (dateStr: string): string => {
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
    const d = new Date(dateStr);
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
};

/* ─────────────── Styles ─────────────── */
const btnStyle = (
    bg: string,
    color: string,
    border = "none",
    extra: React.CSSProperties = {},
): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 14px",
    borderRadius: 10,
    border,
    background: bg,
    color,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'Tajawal', sans-serif",
    transition: "opacity .15s",
    ...extra,
});

/* ─────────────── StatCard ─────────────── */
const StatCard = ({
    label,
    value,
    icon,
    accent,
    sub,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    accent: string;
    sub?: string;
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px 22px",
            boxShadow: "0 2px 12px #0001",
            borderTop: `4px solid ${accent}`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
        }}
    >
        <div style={{ color: accent, fontSize: 20 }}>{icon}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#1e293b" }}>
            {value}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
            {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>}
    </div>
);

/* ─────────────── Main Component ─────────────── */
const TeacherPlan: React.FC = () => {
    const navigate = useNavigate();
    const { upcomingSessions, loading, error, refetch } = useTeacherPlan();

    const todayInfo = useMemo(() => {
        const now = new Date();
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
        return {
            dayName: days[now.getDay()],
            formattedDate: `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
        };
    }, []);

    const copyRoom = (name: string | null) => {
        if (name) navigator.clipboard.writeText(name);
    };
    const joinMeeting = (id: number) => {
        navigate(`/teacher-dashboard/room?schedule=${id}`);
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div
                style={{
                    fontFamily: "'Tajawal', sans-serif",
                    direction: "rtl",
                    background: "#f8fafc",
                    minHeight: "100vh",
                    padding: 24,
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#94a3b8",
                        background: "#fff",
                        borderRadius: 16,
                    }}
                >
                    <FiRefreshCw
                        size={32}
                        style={{
                            color: "#0f6e56",
                            display: "block",
                            margin: "0 auto 12px",
                        }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                        جارٍ تحميل البيانات...
                    </div>
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <div
                style={{
                    fontFamily: "'Tajawal', sans-serif",
                    direction: "rtl",
                    background: "#f8fafc",
                    minHeight: "100vh",
                    padding: 24,
                }}
            >
                <div
                    style={{
                        background: "#fee2e2",
                        borderRadius: 16,
                        padding: 24,
                        color: "#991b1b",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <FiAlertCircle size={32} />
                    <p style={{ margin: 0, fontWeight: 700 }}>{error}</p>
                    <button
                        style={btnStyle("#dc2626", "#fff")}
                        onClick={refetch}
                    >
                        <FiRefreshCw size={13} /> إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    /* ── Stats ── */
    const totalSessions = upcomingSessions.length;
    const dailySessions = upcomingSessions.filter(
        (s) => s.repeat_type === "daily",
    ).length;
    const weeklySessions = upcomingSessions.filter(
        (s) => s.repeat_type !== "daily",
    ).length;
    const totalStudents = upcomingSessions.reduce(
        (sum, s) => sum + (s.booked_students ?? 0),
        0,
    );

    return (
        <div
            style={{
                fontFamily: "'Tajawal', sans-serif",
                direction: "rtl",
                background: "#f8fafc",
                padding: 24,
                borderRadius: "24px",
            }}
        >
            {/* ── Hero Header ── */}
            <div
                style={{
                    background: "linear-gradient(135deg, #1e293b, #0f4c35)",
                    borderRadius: 24,
                    padding: "32px 36px",
                    marginBottom: 24,
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.06,
                        backgroundImage:
                            "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                        pointerEvents: "none",
                    }}
                />
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            fontSize: 13,
                            color: "#86efac",
                            marginBottom: 4,
                        }}
                    >
                        {todayInfo.dayName} — {todayInfo.formattedDate}
                    </div>
                    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>
                        حلقاتك المتاحة
                    </h1>
                    <p
                        style={{
                            margin: "6px 0 0",
                            color: "#94a3b8",
                            fontSize: 13,
                        }}
                    >
                        عرض جميع الحلقات المجدولة · الدخول المباشر · نسخ رابط
                        الغرفة
                    </p>
                    <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                        <button
                            onClick={refetch}
                            style={btnStyle(
                                "#ffffff22",
                                "#fff",
                                "1px solid #ffffff33",
                            )}
                        >
                            <FiRefreshCw size={13} /> تحديث
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 14,
                    marginBottom: 24,
                }}
            >
                <StatCard
                    label="إجمالي الحلقات"
                    value={totalSessions}
                    icon={<FiCalendar />}
                    accent="#1e293b"
                />
                <StatCard
                    label="حلقات يومية"
                    value={dailySessions}
                    icon={<FiRepeat />}
                    accent="#0284c7"
                />
                <StatCard
                    label="حلقات أسبوعية"
                    value={weeklySessions}
                    icon={<FiClock />}
                    accent="#9333ea"
                />
                <StatCard
                    label="إجمالي الطلاب"
                    value={totalStudents}
                    icon={<FiUsers />}
                    accent="#059669"
                    sub="عبر جميع الحلقات"
                />
            </div>

            {/* ── Sessions ── */}
            {upcomingSessions.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#94a3b8",
                        background: "#fff",
                        borderRadius: 16,
                        boxShadow: "0 2px 16px #0001",
                    }}
                >
                    <FiInbox
                        size={40}
                        style={{
                            color: "#94a3b8",
                            display: "block",
                            margin: "0 auto 12px",
                        }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                        لا توجد حلقات متاحة حالياً
                    </div>
                    <div
                        style={{ fontSize: 13, marginTop: 4, marginBottom: 16 }}
                    >
                        لا يوجد جدول مجدول لك في الوقت الحالي
                    </div>
                    <button
                        style={btnStyle("#0f6e56", "#fff")}
                        onClick={refetch}
                    >
                        <FiRefreshCw size={13} /> تحديث البيانات
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "0 2px 16px #0001",
                    }}
                >
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 13,
                                fontFamily: "'Tajawal', sans-serif",
                            }}
                        >
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    {[
                                        "#",
                                        "الحلقة",
                                        "وقت الحلقة",
                                        "تاريخ البداية",
                                        "التكرار",
                                        "الطلاب",
                                        "غرفة الحلقة",
                                        "دخول",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                padding: "10px 14px",
                                                textAlign: "right",
                                                color: "#64748b",
                                                fontWeight: 700,
                                                fontSize: 12,
                                                whiteSpace: "nowrap",
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingSessions.map((session, index) => (
                                    <SessionRow
                                        key={session.id}
                                        session={session}
                                        index={index}
                                        onCopy={copyRoom}
                                        onJoin={joinMeeting}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────── Session Row ─────────────── */
interface RowProps {
    session: UpcomingSession;
    index: number;
    onCopy: (name: string | null) => void;
    onJoin: (id: number) => void;
}

const SessionRow: React.FC<RowProps> = ({ session, index, onCopy, onJoin }) => {
    const isDaily = session.repeat_type === "daily";

    const TD: React.CSSProperties = {
        padding: "12px 14px",
        borderBottom: "1px solid #f8fafc",
        verticalAlign: "middle",
    };

    return (
        <tr style={{ background: index % 2 === 0 ? "#fff" : "#fafafa" }}>
            {/* # */}
            <td style={TD}>
                <span
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "#E1F5EE",
                        color: "#085041",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                    }}
                >
                    {index + 1}
                </span>
            </td>

            {/* الحلقة */}
            <td style={TD}>
                <div
                    style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}
                >
                    {session.plan_name}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {session.circle_name}
                </div>
            </td>

            {/* وقت الحلقة */}
            <td style={TD}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FiClock
                        size={14}
                        style={{ color: "#0f6e56", flexShrink: 0 }}
                    />
                    <div>
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: "#1e293b",
                            }}
                        >
                            {formatTime12(session.start_time)}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            حتى {formatTime12(session.end_time)}
                        </div>
                    </div>
                </div>
            </td>

            {/* تاريخ البداية */}
            <td style={TD}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FiCalendar
                        size={14}
                        style={{ color: "#0f6e56", flexShrink: 0 }}
                    />
                    <div>
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: "#1e293b",
                            }}
                        >
                            {formatDate(session.schedule_date)}
                        </div>
                        {session.plan_end_date && (
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                حتى {formatDate(session.plan_end_date)}
                            </div>
                        )}
                    </div>
                </div>
            </td>

            {/* التكرار */}
            <td style={TD}>
                {isDaily ? (
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 10px",
                            borderRadius: "999px",
                            background: "#dbeafe",
                            color: "#1d4ed8",
                            fontSize: 12,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                        }}
                    >
                        <FiRepeat size={11} /> يومياً
                    </span>
                ) : (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {session.repeat_days_ar.map((day, i) => (
                            <span
                                key={i}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: "3px 8px",
                                    borderRadius: "999px",
                                    background: "#f3e8ff",
                                    color: "#7e22ce",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <FiCalendar size={10} /> {day}
                            </span>
                        ))}
                    </div>
                )}
            </td>

            {/* الطلاب */}
            <td style={TD}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FiUsers
                        size={14}
                        style={{ color: "#0f6e56", flexShrink: 0 }}
                    />
                    <div>
                        <div
                            style={{
                                fontWeight: 700,
                                color: "#0284c7",
                                fontSize: 13,
                            }}
                        >
                            {session.booked_students}
                            {session.max_students
                                ? ` / ${session.max_students}`
                                : ""}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            {session.remaining_slots > 0
                                ? `${session.remaining_slots} مقعد`
                                : "ممتلئة"}
                        </div>
                    </div>
                </div>
            </td>

            {/* غرفة الحلقة */}
            <td style={TD}>
                {session.jitsi_room_name ? (
                    <div
                        onClick={() => onCopy(session.jitsi_room_name)}
                        title="انقر لنسخ اسم الغرفة"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 10px",
                            borderRadius: 8,
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            cursor: "pointer",
                            fontSize: 12,
                            color: "#475569",
                            maxWidth: 160,
                            overflow: "hidden",
                        }}
                    >
                        <FiCopy size={11} style={{ flexShrink: 0 }} />
                        <span
                            style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {session.jitsi_room_name}
                        </span>
                    </div>
                ) : (
                    <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                        غير محدد
                    </span>
                )}
            </td>

            {/* دخول */}
            <td style={TD}>
                {session.jitsi_room_name ? (
                    <button
                        onClick={() => onJoin(session.id)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 12px",
                            borderRadius: 10,
                            border: "1px solid #bbf7d0",
                            background: "#dcfce7",
                            color: "#15803d",
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "'Tajawal', sans-serif",
                        }}
                    >
                        <FiLogIn size={12} /> دخول
                    </button>
                ) : (
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>—</span>
                )}
            </td>
        </tr>
    );
};

export default TeacherPlan;
