import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useReportsApi } from "./hooks/useReportsApi";
import { RiRobot2Fill, RiFileChartLine, RiBarChartFill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical, GrDocumentText } from "react-icons/gr";
import { PiStudent, PiBookOpen, PiUsers } from "react-icons/pi";
import { FiDownload, FiPrinter } from "react-icons/fi";

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
    const { reports: allReports, loading, fetchReports } = useReportsApi();
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("الكل");
    const [filterStatus, setFilterStatus] = useState("الكل");

    // تحميل التقارير
    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // فلترة التقارير
    useEffect(() => {
        const result = allReports.filter(
            (report) =>
                (report.title.includes(search) ||
                    report.period.includes(search) ||
                    report.previewData.includes(search)) &&
                (filterType === "الكل" || report.type === filterType) &&
                (filterStatus === "الكل" || report.status === filterStatus),
        );
        setFilteredReports(result);
    }, [allReports, search, filterType, filterStatus]);

    // إحصائيات
    const totalReports = allReports.length;
    const readyReports = filteredReports.filter(
        (r) => r.status === "جاهز",
    ).length;
    const totalSize = allReports.reduce((sum, r) => {
        if (
            r.status === "جاهز" &&
            r.fileSize !== "—" &&
            !isNaN(parseFloat(r.fileSize))
        ) {
            return sum + parseFloat(r.fileSize);
        }
        return sum;
    }, 0);

    const downloadReport = (id: number) => {
        toast.success("تم تحميل التقرير PDF بنجاح!");
    };

    const printReport = (id: number) => {
        toast.success("تم إرسال التقرير للطابعة!");
        window.print();
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
            case "رواتب":
                return <RiFileChartLine />;
            case "أداء":
                return <GrStatusCritical />;
            default:
                return <GrDocumentText />;
        }
    };

    if (loading) {
        return (
            <div
                className="teacherMotivate"
                style={{
                    padding: "0 15%",
                    minHeight: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>جاري تحميل التقارير...</p>
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
                                    <option>رواتب</option>
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
                                {totalReports > 0
                                    ? Math.round(
                                          (readyReports / totalReports) * 100,
                                      )
                                    : 0}
                                %
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width:
                                            totalReports > 0
                                                ? `${Math.round((readyReports / totalReports) * 100)}%`
                                                : "0%",
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
