import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill, RiTimeLine, RiLockFill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiDownload } from "react-icons/pi";
import { FiCopy, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { useAuditLogs, AuditLogDisplay } from "./hooks/useAuditLogs";

const AuditLogPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<
        "الكل" | "نجح" | "فشل" | "تحذير"
    >("الكل");
    const [dateRange, setDateRange] = useState("الشهر");

    const {
        logs,
        loading,
        stats,
        period,
        searchTerm,
        setFilterStatus: setHookFilterStatus,
        changePeriod,
        clearLogs,
        exportLogs,
        filteredLogs,
        refetch,
    } = useAuditLogs();

    // استخدام filteredLogs من الـ hook مباشرة مع البحث المحلي
    const displayedLogs = filteredLogs.filter(
        (log) =>
            log.userName.includes(search) ||
            log.action.includes(search) ||
            log.resource.includes(search) ||
            log.details.includes(search),
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "نجح":
                return "text-emerald-600 bg-emerald-50 border-emerald-200";
            case "فشل":
                return "text-red-600 bg-red-50 border-red-200";
            case "تحذير":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const copyLog = useCallback((log: AuditLogDisplay) => {
        navigator.clipboard.writeText(JSON.stringify(log, null, 2));
        toast.success("تم نسخ السجل!");
    }, []);

    const handleDateRangeChange = useCallback(
        (range: string) => {
            setDateRange(range);
            // يمكنك هنا تحويل dateRange لـ period format
            const now = new Date();
            let newPeriod = "";

            switch (range) {
                case "اليوم":
                    newPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                    break;
                case "الأسبوع":
                    newPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                    break;
                case "الشهر":
                    newPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                    break;
                case "السنة":
                    newPeriod = `${now.getFullYear()}-01`;
                    break;
                default:
                    newPeriod = period;
            }
            changePeriod(newPeriod);
        },
        [changePeriod, period],
    );

    if (loading && displayedLogs.length === 0) {
        return (
            <div className="teacherMotivate" style={{ padding: "0 15%" }}>
                <div className="teacherMotivate__inner">
                    <div style={{ padding: "50px", textAlign: "center" }}>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>جاري تحميل سجلات التدقيق...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="teacherMotivate" style={{ padding: "0 15%" }}>
            <div className="teacherMotivate__inner">
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            سجل التدقيق (Audit Log)
                            <span>
                                {displayedLogs.length} حدث من {stats.total}
                            </span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            تتبع كامل لجميع العمليات مع IP + تفاصيل التغييرات +
                            تصدير Excel
                        </div>
                        <div className="plan__current">
                            <h2>سجل الأنشطة والعمليات - {period}</h2>
                            <div
                                className="plan__date-range"
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                }}
                            >
                                <select
                                    value={dateRange}
                                    onChange={(e) =>
                                        handleDateRangeChange(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                    disabled={loading}
                                >
                                    <option>اليوم</option>
                                    <option>الأسبوع</option>
                                    <option>الشهر</option>
                                    <option>السنة</option>
                                </select>

                                <input
                                    type="month"
                                    value={period}
                                    onChange={(e) =>
                                        changePeriod(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                    disabled={loading}
                                />

                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value as any)
                                    }
                                    className="p-2 border rounded"
                                    disabled={loading}
                                >
                                    <option>الكل</option>
                                    <option>نجح</option>
                                    <option>فشل</option>
                                    <option>تحذير</option>
                                </select>

                                <input
                                    type="search"
                                    placeholder="البحث بالمستخدم أو العملية أو المورد..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="p-2 border rounded flex-1 min-w-[250px]"
                                    disabled={loading}
                                />

                                <button
                                    onClick={exportLogs}
                                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={
                                        loading || displayedLogs.length === 0
                                    }
                                >
                                    <PiDownload /> تصدير
                                </button>

                                <button
                                    onClick={refetch}
                                    className="p-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    <FiRefreshCw
                                        className={
                                            loading ? "animate-spin" : ""
                                        }
                                    />{" "}
                                    تحديث
                                </button>

                                <button
                                    onClick={clearLogs}
                                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || logs.length === 0}
                                >
                                    <FiTrash2 /> مسح الكل
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className="plan__daily-table"
                        style={{ overflowX: "auto" }}
                    >
                        <table>
                            <thead>
                                <tr>
                                    <th>الصورة</th>
                                    <th>الوقت</th>
                                    <th>المستخدم</th>
                                    <th>الدور</th>
                                    <th>العملية</th>
                                    <th>المورد</th>
                                    <th>التفاصيل</th>
                                    <th>IP</th>
                                    <th>الحالة</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-gray-50 border-b"
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <img
                                                    src={log.userImg}
                                                    alt={log.userName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "https://ui-avatars.com/api/?name=User&size=40&background=ddd&color=666";
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="font-mono text-sm text-gray-700">
                                            {log.timestamp}
                                        </td>
                                        <td className="font-medium">
                                            {log.userName}
                                        </td>
                                        <td>
                                            <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                                                {log.userRole}
                                            </span>
                                        </td>
                                        <td className="font-semibold text-blue-600">
                                            {log.action}
                                        </td>
                                        <td className="font-medium text-gray-800">
                                            {log.resource}
                                        </td>
                                        <td
                                            className="text-sm max-w-md truncate cursor-help"
                                            title={log.details}
                                        >
                                            {log.details}
                                        </td>
                                        <td className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                            {log.ipAddress}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(log.status)}`}
                                            >
                                                {log.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns flex gap-1">
                                                <button
                                                    className="p-1 text-xs border rounded-full hover:bg-gray-100 transition-colors"
                                                    onClick={() => copyLog(log)}
                                                    title="نسخ السجل"
                                                    disabled={loading}
                                                >
                                                    <FiCopy />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {displayedLogs.length === 0 && !loading && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-12 text-gray-500"
                                        >
                                            لا توجد سجلات تدقيق لهذا الفلتر
                                        </td>
                                    </tr>
                                )}
                                {loading && displayedLogs.length > 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-4"
                                        >
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 inline-block"></div>
                                            جاري التحديث...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Stats Cards */}
                    <div
                        className="plan__stats"
                        style={{
                            marginTop: "30px",
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(200px, 1fr)",
                            gap: "20px",
                        }}
                    >
                        <div className="stat-card">
                            <div className="stat-icon greenColor">
                                <i>
                                    <RiTimeLine />
                                </i>
                            </div>
                            <div>
                                <h3>إجمالي الأحداث</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.total}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blueColor">
                                <i>
                                    <GrStatusGood />
                                </i>
                            </div>
                            <div>
                                <h3>نجحت</h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.success}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon redColor">
                                <i>
                                    <GrStatusCritical />
                                </i>
                            </div>
                            <div>
                                <h3>فشلت</h3>
                                <p className="text-2xl font-bold text-red-600">
                                    {stats.failed}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon yellowColor">
                                <i>
                                    <RiLockFill />
                                </i>
                            </div>
                            <div>
                                <h3>تحذيرات</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {stats.warnings}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bars */}
                    <div
                        className="inputs__verifyOTPBirth"
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(250px, 1fr)",
                            gap: "20px",
                            marginTop: "20px",
                        }}
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>نسبة النجاح</h1>
                            </div>
                            <p>
                                {stats.total > 0
                                    ? Math.round(
                                          (stats.success / stats.total) * 100,
                                      )
                                    : 0}
                                %
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}%`,
                                    }}
                                ></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogPage;
