// UserPlans.tsx - ديزاين معتدل يشبه CirclesManagement
import React from "react";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood } from "react-icons/gr";
import { PiTimerDuotone } from "react-icons/pi";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { useStudentPlans } from "./hooks/useStudentPlans";
import { SiBookstack } from "react-icons/si";

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

    const filteredData = planData.filter(
        (item) => item.date >= dateFrom && item.date <= dateTo,
    );

    const formatSessionTime = (time: string | undefined): string => {
        if (!time) return "غير محدد";
        try {
            const [hours, minutes] = time.split(":");
            const hour = parseInt(hours);
            const period = hour >= 12 ? "م" : "ص";
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${period}`;
        } catch {
            return time;
        }
    };

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

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-g";
            case "retry":
                return "bg-a";
            default:
                return "bg-r";
        }
    };

    function BadgeStatus({ status }: { status: string }) {
        const map: Record<string, React.CSSProperties> = {
            "bg-g": { background: "var(--g100)", color: "var(--g700)" },
            "bg-r": { background: "#fee2e2", color: "#ef4444" },
            "bg-a": { background: "#fef3c7", color: "#92400e" },
            "bg-n": { background: "var(--n100)", color: "var(--n500)" },
        };
        const value = map[getStatusBadgeClass(status)] || map["bg-n"];
        const text =
            status === "completed"
                ? "مكتمل"
                : status === "retry"
                  ? "إعادة"
                  : "قيد الانتظار";
        return (
            <span
                className="badge px-2 py-1 rounded-full text-xs font-medium"
                style={value}
            >
                {text}
            </span>
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
