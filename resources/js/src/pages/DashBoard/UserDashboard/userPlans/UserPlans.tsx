import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood } from "react-icons/gr";
import { PiTimerDuotone } from "react-icons/pi";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
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

    // 🔥 Filter داخل الـ Component
    const filteredData = planData.filter(
        (item) => item.date >= dateFrom && item.date <= dateTo,
    );

    // 🔥 Format الوقت
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
            <div className="loading flex items-center justify-center py-12">
                جاري تحميل خطتك...
            </div>
        );
    }

    return (
        <div className="userProfile__plan">
            <div className="userProfile__planTitle">
                <h1>
                    خطتك الدراسية <span>{stats?.total_days || 0} يوم</span>
                </h1>
            </div>

            <div className="plan__header">
                <div className="plan__ai-suggestion">
                    <i>
                        <RiRobot2Fill />
                    </i>
                    راجع {stats?.today_goal?.hifz || "الدرس اليومي"}
                </div>
                <div className="plan__current">
                    <h2>خطتك اليومية</h2>
                    <div className="plan__date-range">
                        <div className="date-picker to">
                            <label>إلى</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        <div className="date-picker from">
                            <label>من</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔥 Empty State */}
            {filteredData.length === 0 ? (
                <div className="empty-state text-center py-16">
                    <SiBookstack className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        لا توجد خطط دراسية
                    </h3>
                    <p className="text-gray-500 mb-8">
                        قم بالحجز في حلقة لتبدأ خطتك الدراسية
                    </p>
                </div>
            ) : (
                <div className="plan__daily-table">
                    <div className="table-header flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            {filteredData.length} يوم في النطاق المحدد
                        </h3>
                    </div>
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
                                <tr
                                    key={item.id}
                                    className={`plan__row ${item.status}`}
                                >
                                    <td>{formatDate(item.date)}</td>
                                    <td>{item.day}</td>
                                    <td>{item.hifz}</td>
                                    <td>{item.review}</td>
                                    <td>
                                        {formatSessionTime(item.session_time)}
                                    </td>
                                    <td>
                                        <span className="status-badge">
                                            <i>
                                                {item.status === "completed" ? (
                                                    <GrStatusGood />
                                                ) : (
                                                    <PiTimerDuotone />
                                                )}
                                            </i>
                                            {item.status === "completed"
                                                ? "مكتمل"
                                                : item.status === "retry"
                                                  ? "إعادة"
                                                  : "قيد الانتظار"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                        <h3>هدف اليوم</h3>
                        <p>{stats?.today_goal?.hifz || "لا يوجد"}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon yellowColor">
                        <i>
                            <FaStar />
                        </i>
                    </div>
                    <div>
                        <h3>نقاطك</h3>
                        <p>{stats?.points || "0/0"}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon greenColor">
                        <i>
                            <PiWhatsappLogoDuotone />
                        </i>
                    </div>
                    <div>
                        <h3>التقدم</h3>
                        <p>{stats?.progress_percentage || 0}%</p>
                    </div>
                </div>
            </div>

            <div className="inputs__verifyOTPBirth">
                <div className="userProfile__progressContent">
                    <div className="userProfile__progressTitle">
                        <h1>القرآن كامل</h1>
                    </div>
                    <p>{stats?.progress_percentage || 0}%</p>
                    <div className="userProfile__progressBar">
                        <span
                            style={{
                                width: `${stats?.progress_percentage || 0}%`,
                            }}
                        ></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPlans;
