import { useState } from "react";
import toast from "react-hot-toast";
import {
    RiRobot2Fill,
    RiTimeLine,
    RiUserLine,
    RiLockFill,
} from "react-icons/ri";
import { GrStatusGood, GrStatusCritical, GrDocumentText } from "react-icons/gr";
import { PiStudent, PiEye, PiDownload } from "react-icons/pi";
import { FiFilter, FiSearch, FiCopy, FiTrash2 } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

interface AuditLog {
    id: number;
    timestamp: string;
    userName: string;
    userRole: string;
    action: string;
    resource: string;
    details: string;
    ipAddress: string;
    status: "نجح" | "فشل" | "تحذير";
    userImg: string;
}

const AuditLogPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([
        {
            id: 1,
            timestamp: "2026-01-23 21:05:12",
            userName: "أحمد محمد العتيبي",
            userRole: "مشرف تعليمي",
            action: "تعديل بيانات طالب",
            resource: "محمد أحمد (ID: 123)",
            details: "تغيير الحلقة من الجزء 30 إلى الجزء 15",
            ipAddress: "197.45.23.89",
            status: "نجح",
            userImg:
                "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            timestamp: "2026-01-23 21:03:45",
            userName: "فاطمة الزهراني",
            userRole: "مشرفة تحفيز",
            action: "إضافة نقاط تحفيز",
            resource: "فاطمة السيد (ID: 456)",
            details: "+50 نقطة للحفظ المتميز",
            ipAddress: "41.32.67.123",
            status: "نجح",
            userImg:
                "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 3,
            timestamp: "2026-01-23 20:58:22",
            userName: "عبدالرحمن القحطاني",
            userRole: "مشرف مالي",
            action: "محاولة تسجيل دخول",
            resource: "لوحة التحكم",
            details: "فشل في كلمة المرور (3 محاولات)",
            ipAddress: "105.78.34.56",
            status: "فشل",
            userImg:
                "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 4,
            timestamp: "2026-01-23 20:55:10",
            userName: "نورة أحمد",
            userRole: "مدير النظام",
            action: "تصدير تقرير",
            resource: "تقرير الحضور الشهري",
            details: "تصدير PDF (2.4 MB)",
            ipAddress: "192.168.1.105",
            status: "نجح",
            userImg:
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        },
    ]);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("الكل");
    const [filterUser, setFilterUser] = useState("الكل");
    const [dateRange, setDateRange] = useState("اليوم");

    const filteredLogs = logs.filter(
        (log) =>
            (log.userName.includes(search) ||
                log.action.includes(search) ||
                log.resource.includes(search)) &&
            (filterStatus === "الكل" || log.status === filterStatus) &&
            (filterUser === "الكل" ||
                log.userName === filterUser ||
                log.userRole === filterUser),
    );

    const stats = {
        total: logs.length,
        success: logs.filter((l) => l.status === "نجح").length,
        failed: logs.filter((l) => l.status === "فشل").length,
        warnings: logs.filter((l) => l.status === "تحذير").length,
    };

    const clearLogs = () => {
        if (window.confirm("هل أنت متأكد من مسح جميع السجلات؟")) {
            setLogs([]);
            toast.success("تم مسح جميع سجلات التدقيق!");
        }
    };

    const exportLogs = () => {
        toast.success("تم تصدير السجلات إلى Excel!");
    };

    const copyLog = (log: AuditLog) => {
        navigator.clipboard.writeText(JSON.stringify(log, null, 2));
        toast.success("تم نسخ السجل!");
    };

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

    return (
        <div className="teacherMotivate" style={{ padding: "0 15%" }}>
            <div className="teacherMotivate__inner">
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            سجل التدقيق (Audit Log){" "}
                            <span>{filteredLogs.length} حدث</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            تتبع كامل لجميع العمليات مع IP + تفاصيل + تصدير
                            Excel
                        </div>
                        <div className="plan__current">
                            <h2>سجل الأنشطة والعمليات</h2>
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
                                        setDateRange(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>اليوم</option>
                                    <option>الأسبوع</option>
                                    <option>الشهر</option>
                                    <option>السنة</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>الكل</option>
                                    <option>نجح</option>
                                    <option>فشل</option>
                                    <option>تحذير</option>
                                </select>
                                <select
                                    value={filterUser}
                                    onChange={(e) =>
                                        setFilterUser(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>الكل</option>
                                    <option>أحمد محمد العتيبي</option>
                                    <option>فاطمة الزهراني</option>
                                    <option>عبدالرحمن القحطاني</option>
                                </select>
                                <input
                                    type="search"
                                    placeholder="البحث بالمستخدم أو العملية أو المورد..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="p-2 border rounded flex-1 min-w-[250px]"
                                />
                                <button
                                    onClick={exportLogs}
                                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <PiDownload /> تصدير
                                </button>
                                <button
                                    onClick={clearLogs}
                                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
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
                                {filteredLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <img
                                                    src={log.userImg}
                                                    alt={log.userName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td className="font-mono text-sm">
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
                                        <td className="font-medium">
                                            {log.resource}
                                        </td>
                                        <td
                                            className="text-sm max-w-md truncate"
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
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="p-1 text-xs border rounded-full hover:bg-gray-100"
                                                    onClick={() => copyLog(log)}
                                                    title="نسخ السجل"
                                                >
                                                    <FiCopy />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-12 text-gray-500"
                                        >
                                            لا توجد سجلات تدقيق لهذا الفلتر
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Stats Cards */}
                    <div className="plan__stats" style={{ marginTop: "30px" }}>
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
                                {Math.round(
                                    (stats.success / stats.total) * 100,
                                ) || 0}
                                %
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${Math.round((stats.success / stats.total) * 100) || 0}%`,
                                    }}
                                ></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>الأحداث في الساعة</h1>
                            </div>
                            <p>
                                {
                                    logs.filter(
                                        (l) =>
                                            new Date(l.timestamp).getHours() ===
                                            21,
                                    ).length
                                }
                            </p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "78%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogPage;
