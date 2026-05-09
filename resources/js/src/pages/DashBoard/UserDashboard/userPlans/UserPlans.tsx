import React from "react";
import { SiBookstack } from "react-icons/si";
import { useStudentPlans } from "./hooks/useStudentPlans";

const UserPlans: React.FC = () => {
    const {
        planData,
        stats,
        loading,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
    } = useStudentPlans();

    const today = new Date();

    const getArabicDayName = (date: string): string => {
        const dateObj = new Date(date);
        const days = [
            "الأحد",
            "الإثنين",
            "الثلاثاء",
            "الأربعاء",
            "الخميس",
            "الجمعة",
            "السبت",
        ];
        return days[dateObj.getDay()];
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const todayDate = new Date(today.toDateString());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        if (date.toDateString() === todayDate.toDateString()) return "اليوم";
        if (date.toDateString() === yesterday.toDateString()) return "أمس";
        return dateString.split("-").reverse().join("/");
    };

    const formatSessionTime = (time: string | undefined): string => {
        if (!time) return "غير محدد";
        try {
            const [hours, minutes] = time.split(":");
            const hour = parseInt(hours);
            const period = hour >= 12 ? "م" : "ص";
            return `${hour % 12 || 12}:${minutes} ${period}`;
        } catch {
            return time;
        }
    };

    const filteredData = planData.filter(
        (item) => item.date >= dateFrom && item.date <= dateTo,
    );

    if (loading) {
        return (
            <div className="content">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">تحميل الخطط...</div>
                    </div>
                    <div className="text-center py-12">
                        <div className="ld">جـاري التحميل...</div>
                    </div>
                </div>
            </div>
        );
    }

    function BadgeStatus({ status }: { status: string }) {
        const styles: Record<string, React.CSSProperties> = {
            completed: { background: "var(--g100)", color: "var(--g700)" },
            retry: { background: "#fef3c7", color: "#92400e" },
            pending: { background: "#fee2e2", color: "#ef4444" },
        };
        const labels: Record<string, string> = {
            completed: "مكتمل",
            retry: "إعادة",
            pending: "قيد الانتظار",
        };
        return (
            <span
                className="badge px-2 py-1 rounded-full text-xs font-medium"
                style={
                    styles[status] ?? {
                        background: "var(--n100)",
                        color: "var(--n500)",
                    }
                }
            >
                {labels[status] ?? "قيد الانتظار"}
            </span>
        );
    }

    function ScheduleTypeBadge({
        repeatType,
        repeatDays,
    }: {
        repeatType?: string;
        repeatDays?: string[];
    }) {
        const isDaily = !repeatType || repeatType === "daily";

        if (isDaily) {
            return (
                <span
                    className="badge px-2 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#dbeafe", color: "#1d4ed8" }}
                >
                    يومياً
                </span>
            );
        }

        const days = (repeatDays ?? []).filter((d) => d !== "يومياً");

        return (
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {days.map((day, i) => (
                    <span
                        key={i}
                        className="badge px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: "#f3e8ff", color: "#7e22ce" }}
                    >
                        {day}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div className="content">
            <div className="widget">
                <div className="wh">
                    <div className="wh-l">الخطط الدراسية</div>
                    <div className="flx" style={{ display: "flex" }}>
                        <div
                            className="date-picker to"
                            style={{ margin: "0 6px" }}
                        >
                            <label>إلى</label>
                            <input
                                type="date"
                                className="fi"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        <div
                            className="date-picker from"
                            style={{ margin: "0 6px" }}
                        >
                            <label>من</label>
                            <input
                                type="date"
                                className="fi"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {stats && (
                    <div
                        style={{
                            display: "flex",
                            gap: "16px",
                            padding: "12px 16px",
                            background: "var(--n50)",
                            borderRadius: "8px",
                            margin: "0 0 12px",
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            style={{ fontSize: "13px", color: "var(--n600)" }}
                        >
                            إجمالي الأيام:{" "}
                            <strong style={{ color: "var(--n800)" }}>
                                {stats.total_days}
                            </strong>
                        </span>
                        <span
                            style={{ fontSize: "13px", color: "var(--n600)" }}
                        >
                            المكتملة:{" "}
                            <strong style={{ color: "var(--g700)" }}>
                                {stats.completed_days}
                            </strong>
                        </span>
                        <span
                            style={{ fontSize: "13px", color: "var(--n600)" }}
                        >
                            التقدم:{" "}
                            <strong style={{ color: "#7e22ce" }}>
                                {stats.progress_percentage}%
                            </strong>
                        </span>
                        {stats.today_goal && (
                            <span
                                style={{
                                    fontSize: "13px",
                                    color: "var(--n600)",
                                }}
                            >
                                هدف اليوم:{" "}
                                <strong style={{ color: "var(--n800)" }}>
                                    {stats.today_goal.hifz}
                                </strong>
                            </span>
                        )}
                    </div>
                )}

                {filteredData.length === 0 ? (
                    <div className="empty text-center py-16">
                        <SiBookstack className="mx-auto text-4xl text-gray-300 mb-2" />
                        <p>لا توجد خطط دراسية في الفترة المحددة</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>اليوم</th>
                                    <th>الحفظ الجديد</th>
                                    <th>المراجعة</th>
                                    <th>الوقت</th>
                                    <th>أيام الخطة</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{formatDate(item.date)}</td>
                                        <td>{getArabicDayName(item.date)}</td>
                                        <td>{item.hifz}</td>
                                        <td>{item.review}</td>
                                        <td>
                                            {formatSessionTime(
                                                item.session_time,
                                            )}
                                        </td>
                                        <td>
                                            <ScheduleTypeBadge
                                                repeatType={item.repeat_type}
                                                repeatDays={item.repeat_days}
                                            />
                                        </td>
                                        <td>
                                            <BadgeStatus status={item.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPlans;
