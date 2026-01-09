import { RiRobot2Fill } from "react-icons/ri";
import { SiBookstack } from "react-icons/si";
import { GrStatusGood } from "react-icons/gr";
import { PiTimerDuotone } from "react-icons/pi";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { useState, useEffect } from "react";

const UserPlans: React.FC = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [dateFrom, setDateFrom] = useState(
        sevenDaysAgo.toISOString().split("T")[0]
    );
    const [dateTo, setDateTo] = useState(today.toISOString().split("T")[0]);
    const [planData, setPlanData] = useState([
        {
            id: 1,
            date: "2026-01-07",
            day: "الأربعاء",
            hifz: "البقرة ٤٦-٥٠",
            review: "البقرة ١-١٠",
            status: "completed",
        },
        {
            id: 2,
            date: "2026-01-08",
            day: "الخميس",
            hifz: "البقرة ٥١-٥٥",
            review: "البقرة ١١-٢٠",
            status: "completed",
        },
        {
            id: 3,
            date: "2026-01-09",
            day: "الجمعة",
            hifz: "البقرة ٥٦-٦٠",
            review: "البقرة ٢١-٣٠",
            status: "completed",
        },
        {
            id: 4,
            date: "2026-01-10",
            day: "السبت",
            hifz: "البقرة ٦١-٦٥",
            review: "البقرة ٣١-٤٠",
            status: "completed",
        },
        {
            id: 1,
            date: "2026-01-07",
            day: "الأربعاء",
            hifz: "البقرة ٤٦-٥٠",
            review: "البقرة ١-١٠",
            status: "completed",
        },
        {
            id: 2,
            date: "2026-01-08",
            day: "الخميس",
            hifz: "البقرة ٥١-٥٥",
            review: "البقرة ١١-٢٠",
            status: "active",
        },
        {
            id: 3,
            date: "2026-01-09",
            day: "الجمعة",
            hifz: "البقرة ٥٦-٦٠",
            review: "البقرة ٢١-٣٠",
            status: "pending",
        },
        {
            id: 4,
            date: "2026-01-10",
            day: "السبت",
            hifz: "البقرة ٦١-٦٥",
            review: "البقرة ٣١-٤٠",
            status: "pending",
        },
        {
            id: 2,
            date: "2026-01-08",
            day: "الخميس",
            hifz: "البقرة ٥١-٥٥",
            review: "البقرة ١١-٢٠",
            status: "active",
        },
        {
            id: 3,
            date: "2026-01-09",
            day: "الجمعة",
            hifz: "البقرة ٥٦-٦٠",
            review: "البقرة ٢١-٣٠",
            status: "pending",
        },
        {
            id: 4,
            date: "2026-01-10",
            day: "السبت",
            hifz: "البقرة ٦١-٦٥",
            review: "البقرة ٣١-٤٠",
            status: "pending",
        },
    ]);
    const [filteredData, setFilteredData] = useState(planData);

    const getArabicDayName = (date: Date) => {
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const todayDate = new Date(today.toDateString());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const dayBeforeYesterday = new Date(
            today.getTime() - 2 * 24 * 60 * 60 * 1000
        );
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const dayAfterTomorrow = new Date(
            today.getTime() + 2 * 24 * 60 * 60 * 1000
        );

        if (date.toDateString() === todayDate.toDateString()) return "اليوم";
        if (date.toDateString() === yesterday.toDateString()) return "أمس";
        if (date.toDateString() === dayBeforeYesterday.toDateString())
            return "قبل أمس";
        if (date.toDateString() === tomorrow.toDateString()) return "غداً";
        if (date.toDateString() === dayAfterTomorrow.toDateString())
            return "بعد غد";

        return dateString.split("-").reverse().join("/");
    };

    const fetchPlanData = () => {
        const filtered = planData.filter(
            (item) => item.date >= dateFrom && item.date <= dateTo
        );
        setFilteredData(filtered);
    };

    useEffect(() => {
        fetchPlanData();
    }, [dateFrom, dateTo]);

    return (
        <div className="userProfile__plan">
            <div className="userProfile__planTitle">
                <h1>
                    تختيم القرأن في <span>12 شهر</span>
                </h1>
            </div>
            <div className="plan__header">
                <div className="plan__ai-suggestion">
                    <i>
                        <RiRobot2Fill />
                    </i>
                    راجع آية ٤٨ مرة تانية
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

            <div className="plan__daily-table">
                <table>
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>اليوم</th>
                            <th>الحفظ الجديد</th>
                            <th>المراجعة</th>
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
                                    <span>
                                        <i>
                                            {item.status === "completed" ? (
                                                <GrStatusGood />
                                            ) : (
                                                <PiTimerDuotone />
                                            )}
                                        </i>
                                        {item.status === "completed"
                                            ? "مكتمل"
                                            : item.status === "active"
                                            ? "قيد التنفيذ"
                                            : "قيد الانتظار"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="plan__stats">
                <div className="stat-card">
                    <div className="stat-icon redColor">
                        <i>
                            <GoGoal />
                        </i>
                    </div>
                    <div>
                        <h3>هدف اليوم</h3>
                        <p>البقرة ٥١-٥٥</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon yellowColor">
                        <i>
                            <FaStar />
                        </i>
                    </div>
                    <div>
                        <h3>نقاط اليوم</h3>
                        <p>٢٥/٥٠</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon greenColor">
                        <i>
                            <PiWhatsappLogoDuotone />
                        </i>
                    </div>
                    <div>
                        <h3>تم إرسالها</h3>
                        <p>على الواتساب</p>
                    </div>
                </div>
            </div>
            <div
                className="inputs__verifyOTPBirth"
                id="userProfile__verifyOTPBirth"
            >
                <div
                    className="userProfile__progressContent"
                    id="userProfile__progressContent"
                >
                    <div className="userProfile__progressTitle">
                        <h1>القرأن كامل</h1>
                    </div>
                    <p>25%</p>
                    <div className="userProfile__progressBar">
                        <span></span>
                    </div>
                </div>
                <div
                    className="userProfile__progressContent"
                    id="userProfile__progressContent"
                >
                    <div className="userProfile__progressTitle">
                        <h1>الجزء الثاني</h1>
                    </div>
                    <p>98%</p>
                    <div
                        className="userProfile__progressBar"
                        id="userProfile__progressBar"
                    >
                        <span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPlans;
