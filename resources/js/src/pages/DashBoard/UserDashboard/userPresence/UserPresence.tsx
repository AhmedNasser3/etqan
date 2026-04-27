// UserPresence.tsx - مع نفس الديزاين من CirclesManagement + إحصائيات مميزة
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
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">جاري التحميل...</div>
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
                        <div className="wh-l">خطأ في تحميل البيانات</div>
                    </div>
                </div>
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

    function BadgeStatus({ s }: { s: string }) {
        const map: Record<string, React.CSSProperties> = {
            "bg-g": { background: "var(--g100)", color: "var(--g700)" },
            "bg-r": { background: "#fee2e2", color: "#ef4444" },
            "bg-a": { background: "#fef3c7", color: "#92400e" },
            "bg-n": { background: "var(--n100)", color: "var(--n500)" },
        };
        return (
            <span
                className="badge px-2 py-1 rounded-full text-xs font-medium"
                style={
                    map[
                        s === "حاضر" ? "bg-g" : s === "غائب" ? "bg-r" : "bg-a"
                    ] || map["bg-n"]
                }
            >
                {s}
            </span>
        );
    }

    return (
        <div className="content" id="contentArea">
            <div className="widget">
                {/* Header مع البحث بالتواريخ */}
                <div className="wh">
                    <div className="wh-l">حضور وغياب الطالب</div>
                    <div className="flx">
                        {/* فلتر التواريخ */}
                        <div
                            className="flx"
                            style={{
                                gap: "8px",
                                alignItems: "center",
                                display: "flex",
                            }}
                        >
                            <div
                                className="date-picker from"
                                style={{ margin: 0 }}
                            >
                                <label
                                    style={{
                                        fontSize: "12px",
                                        color: "var(--n500)",
                                    }}
                                >
                                    من
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="fi"
                                    style={{
                                        padding: "8px 12px",
                                        border: "1px solid var(--n200)",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                    }}
                                />
                            </div>
                            <div
                                className="date-picker to"
                                style={{ margin: 0 }}
                            >
                                <label
                                    style={{
                                        fontSize: "12px",
                                        color: "var(--n500)",
                                    }}
                                >
                                    إلى
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="fi"
                                    style={{
                                        padding: "8px 12px",
                                        border: "1px solid var(--n200)",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* جدول السجلات */}
                <div style={{ overflowX: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>السورة</th>
                                <th>الحفظ الجديد</th>
                                <th>المراجعة</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {presenceRecords.length > 0 ? (
                                presenceRecords.map((record: any) => (
                                    <tr key={record.id}>
                                        <td style={{ fontWeight: 700 }}>
                                            {record.attendance_date}
                                        </td>
                                        <td>{record.surah_name}</td>
                                        <td>
                                            {record.new_memorization || "-"}
                                        </td>
                                        <td>
                                            {record.review_memorization || "-"}
                                        </td>
                                        <td>
                                            <BadgeStatus s={record.status} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5}>
                                        <div
                                            className="empty"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px 20px",
                                                color: "var(--n500)",
                                            }}
                                        >
                                            <p>
                                                {dateFrom || dateTo
                                                    ? "لا توجد بيانات حضور وغياب في هذه الفترة"
                                                    : "لا توجد بيانات حضور وغياب"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserPresence;
