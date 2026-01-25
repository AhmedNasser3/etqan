import { useState } from "react";
import toast from "react-hot-toast";
import {
    RiRobot2Fill,
    RiFileChartLine,
    RiBarChartFill,
    RiPieChartFill,
} from "react-icons/ri";
import { GrStatusGood, GrStatusCritical, GrDocumentText } from "react-icons/gr";
import { PiStudent, PiBookOpen, PiUsers } from "react-icons/pi";
import { FiDownload, FiFilter, FiCalendar, FiPrinter } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

interface Report {
    id: number;
    title: string;
    type: string;
    date: string;
    period: string;
    status: string;
    fileSize: string;
    previewData: string;
    img: string;
}

const ReportsDashboard: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([
        {
            id: 1,
            title: "تقرير الحضور الشهري",
            type: "حضور",
            date: "2026-01-23",
            period: "يناير 2026",
            status: "جاهز",
            fileSize: "2.4 MB",
            previewData: "95% حضور عام",
            img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 2,
            title: "تقرير الإنجازات السنوية",
            type: "إنجازات",
            date: "2026-01-20",
            period: "2025 كامل",
            status: "جاهز",
            fileSize: "5.8 MB",
            previewData: "285 ختم قرآن",
            img: "https://images.unsplash.com/photo-1516589178581-6cd7838b8f13?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 3,
            title: "تقرير الأداء التعليمي",
            type: "أداء",
            date: "2026-01-22",
            period: "الشهر الحالي",
            status: "قيد الإعداد",
            fileSize: "—",
            previewData: "88% متوسط أداء",
            img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
    ]);

    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("الكل");
    const [filterStatus, setFilterStatus] = useState("الكل");

    const filteredReports = reports.filter(
        (report) =>
            (report.title.includes(search) || report.period.includes(search)) &&
            (filterType === "الكل" || report.type === filterType) &&
            (filterStatus === "الكل" || report.status === filterStatus),
    );

    // إحصائيات عامة
    const totalReports = reports.length;
    const readyReports = reports.filter((r) => r.status === "جاهز").length;
    const totalSize = reports.reduce((sum, r) => {
        if (r.status === "جاهز" && r.fileSize !== "—") {
            return sum + parseFloat(r.fileSize);
        }
        return sum;
    }, 0);

    const downloadReport = (id: number) => {
        toast.success("تم تحميل التقرير PDF بنجاح!");
    };

    const printReport = (id: number) => {
        toast.success("تم إرسال التقرير للطابعة!");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "جاهز":
                return "text-emerald-600 bg-emerald-100";
            case "قيد الإعداد":
                return "text-yellow-600 bg-yellow-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "حضور":
                return <PiUsers />;
            case "إنجازات":
                return <PiBookOpen />;
            case "أداء":
                return <GrStatusCritical />;
            default:
                return <GrDocumentText />;
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
                            التقارير العامة{" "}
                            <span>{filteredReports.length} تقرير</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            تقارير شاملة للحضور + الإنجازات + الأداء + إحصائيات
                            تفاعلية
                        </div>
                        <div className="plan__current">
                            <h2>مكتبة التقارير والإحصائيات</h2>
                            <div
                                className="plan__date-range"
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                }}
                            >
                                <select
                                    value={filterType}
                                    onChange={(e) =>
                                        setFilterType(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>الكل</option>
                                    <option>حضور</option>
                                    <option>إنجازات</option>
                                    <option>أداء</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>الكل</option>
                                    <option>جاهز</option>
                                    <option>قيد الإعداد</option>
                                </select>
                                <input
                                    type="search"
                                    placeholder="البحث بالعنوان أو الفترة..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="p-2 border rounded flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* التقارير الرئيسية */}
                    <div className="plan__daily-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>الصورة</th>
                                    <th>عنوان التقرير</th>
                                    <th>النوع</th>
                                    <th>الفترة</th>
                                    <th>تاريخ الإصدار</th>
                                    <th>الحالة</th>
                                    <th>الحجم</th>
                                    <th>معاينة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr
                                        key={report.id}
                                        className={`plan__row ${report.status}`}
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                                <img
                                                    src={report.img}
                                                    alt={report.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td className="font-bold">
                                            {report.title}
                                        </td>
                                        <td>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                                                {getTypeIcon(report.type)}
                                                {report.type}
                                            </span>
                                        </td>
                                        <td>{report.period}</td>
                                        <td>{report.date}</td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(report.status)}`}
                                            >
                                                {report.status}
                                            </span>
                                        </td>
                                        <td>{report.fileSize}</td>
                                        <td className="text-sm font-medium text-gray-700 max-w-xs">
                                            {report.previewData}
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn download-btn p-2 rounded-full border-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50 w-12 h-12 mr-1"
                                                    onClick={() =>
                                                        downloadReport(
                                                            report.id,
                                                        )
                                                    }
                                                    title="تحميل PDF"
                                                    disabled={
                                                        report.status !== "جاهز"
                                                    }
                                                >
                                                    <FiDownload />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn print-btn p-2 rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 w-12 h-12 mr-1"
                                                    onClick={() =>
                                                        printReport(report.id)
                                                    }
                                                    title="طباعة"
                                                    disabled={
                                                        report.status !== "جاهز"
                                                    }
                                                >
                                                    <FiPrinter />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredReports.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد تقارير لهذا الفلتر
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* إحصائيات سريعة */}
                    <div className="plan__stats" style={{ margin: "30px 0" }}>
                        <div className="stat-card">
                            <div className="stat-icon greenColor">
                                <i>
                                    <RiFileChartLine />
                                </i>
                            </div>
                            <div>
                                <h3>إجمالي التقارير</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {totalReports}
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
                                <h3>جاهزة للتحميل</h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {readyReports}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon purpleColor">
                                <i>
                                    <RiBarChartFill />
                                </i>
                            </div>
                            <div>
                                <h3>الحجم الإجمالي</h3>
                                <p className="text-2xl font-bold text-purple-600">
                                    {totalSize.toFixed(1)} MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* لوحة الإحصائيات التفاعلية */}
                    <div
                        className="inputs__verifyOTPBirth"
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(300px, 1fr)",
                            gap: "20px",
                        }}
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>نسبة التقارير الجاهزة</h1>
                            </div>
                            <p>
                                {Math.round(
                                    (readyReports / totalReports) * 100,
                                )}
                                %
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${Math.round((readyReports / totalReports) * 100)}%`,
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

export default ReportsDashboard;
