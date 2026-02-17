// ✅ الكود الكامل مع الإحصائيات المطلوبة بكلاسس مميزة
import { RiRobot2Fill } from "react-icons/ri";
import { useState, useEffect } from "react";
import { useStudentPresence } from "./hooks/useStudentPresence";

const getDateOnly = (dateTimeString: string): string => {
    if (!dateTimeString) return "";
    return dateTimeString.split(" ")[0];
};

const UserPresence: React.FC = () => {
    const { data, loading, error } = useStudentPresence();
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [filteredRecords, setFilteredRecords] = useState<any[]>([]);

    useEffect(() => {
        if (!data?.presence_records) return;

        let filtered = data.presence_records;

        if (dateFrom) {
            filtered = filtered.filter(
                (record) => record.attendance_date >= dateFrom,
            );
        }

        if (dateTo) {
            filtered = filtered.filter(
                (record) => record.attendance_date <= dateTo,
            );
        }

        setFilteredRecords(filtered);
    }, [data?.presence_records, dateFrom, dateTo]);

    if (loading) {
        return (
            <div className="text-center py-8 text-gray-500">
                جاري تحميل بيانات الحضور...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center py-8 p-4 bg-red-50 rounded-lg">
                {error}
            </div>
        );
    }

    const presenceRecords =
        filteredRecords.length > 0
            ? filteredRecords
            : data?.presence_records || [];
    const stats = data?.stats || {
        total: 0,
        present: 0,
        absent: 0,
        attendance_rate: 0,
    };

    return (
        <div className="userProfile__plan" style={{ marginBottom: "24px" }}>
            <div className="userPresence__features">
                {/* ✅ العنوان */}
                <div className="testimonials__mainTitle">
                    <h1>حضور وغياب الطالب</h1>
                </div>

                {/* ✅ فلتر التواريخ + AI Suggestion */}
                <div className="userProfile__plan" id="userProfile__plan">
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            نسبة حضورك <strong>{stats.attendance_rate}%</strong>
                        </div>
                        <div className="plan__current">
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <label>إلى</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) =>
                                            setDateTo(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="date-picker from">
                                    <label>من</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) =>
                                            setDateFrom(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ إحصائيات الحضور - التصميم الجديد مع كلاسس مميزة */}
                <div className="presence-stats-container">
                    <div className="stats-grid">
                        {/* 1. إجمالي الحصص */}
                        <div className="stat-card total-sessions">
                            <div className="stat-icon total-icon">
                                <span className="icon-circle"></span>
                            </div>
                            <div className="stat-number">{stats.total}</div>
                            <div className="stat-label">إجمالي الحصص</div>
                        </div>

                        {/* 2. حاضر */}
                        <div className="stat-card present-sessions">
                            <div className="stat-icon present-icon">
                                <span className="icon-circle"></span>
                            </div>
                            <div className="stat-number">{stats.present}</div>
                            <div className="stat-label">حاضر</div>
                        </div>

                        {/* 3. غائب */}
                        <div className="stat-card absent-sessions">
                            <div className="stat-icon absent-icon">
                                <span className="icon-circle"></span>
                            </div>
                            <div className="stat-number">{stats.absent}</div>
                            <div className="stat-label">غائب</div>
                        </div>
                    </div>

                    {/* ✅ سجلات مُعروضة: 2 */}
                    <div className="records-display">
                        <span className="records-badge">سجلات مُعروضة:</span>
                        <span className="records-count">
                            {presenceRecords.length}
                        </span>
                    </div>
                </div>

                {/* ✅ سجل الحضور */}
                <div className="userProgress__content">
                    {presenceRecords.map((record: any) => (
                        <div key={record.id} className="userProgress__comments">
                            <div className="userProgress__title">
                                <h1>
                                    الحصة بتاريخ:{" "}
                                    <span>{record.attendance_date}</span>
                                </h1>
                            </div>
                            <div className="userProgress__data">
                                <h4>{record.surah_name}</h4>
                                {record.new_memorization && (
                                    <h2>
                                        محتوي الحصة:{" "}
                                        <span>{record.new_memorization}</span>
                                    </h2>
                                )}
                                {record.review_memorization && (
                                    <h2>مراجعة {record.review_memorization}</h2>
                                )}
                            </div>
                            <div className="userProgress__comment">
                                <h1>الحالة:-</h1>
                                {record.status === "غائب" ? (
                                    <h2 id="userProfile__commentBad">غياب</h2>
                                ) : (
                                    <h2
                                        className={`font-bold text-xl ${
                                            record.status === "حاضر"
                                                ? "text-green-500"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {record.status}
                                    </h2>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {presenceRecords.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        لا توجد بيانات حضور وغياب في هذه الفترة
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPresence;
