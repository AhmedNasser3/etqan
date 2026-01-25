import { useState } from "react";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiDownload, FiFileText, FiFilter } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const PayrollReports: React.FC = () => {
    const [reports, setReports] = useState([
        {
            id: 1,
            employee: "أحمد محمد صالح",
            role: "معلم",
            period: "يناير 2026",
            basicSalary: "5000",
            attendanceDays: 22,
            deductions: "200",
            totalDue: "4800",
            status: "calculated",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            employee: "فاطمة أحمد علي",
            role: "مشرفة مالية",
            period: "يناير 2026",
            basicSalary: "6500",
            attendanceDays: 20,
            deductions: "500",
            totalDue: "6000",
            status: "pending",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 3,
            employee: "عبدالله صالح",
            role: "معلم",
            period: "يناير 2026",
            basicSalary: "5000",
            attendanceDays: 18,
            deductions: "800",
            totalDue: "4200",
            status: "calculated",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);

    const [search, setSearch] = useState("");
    const [periodFilter, setPeriodFilter] = useState("يناير 2026");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(false);

    const filteredReports = reports.filter(
        (report) =>
            (report.employee.includes(search) ||
                report.role.includes(search)) &&
            (periodFilter === "all" || report.period === periodFilter) &&
            (statusFilter === "all" || report.status === statusFilter),
    );

    const totalDueAmount = filteredReports.reduce(
        (sum, report) => sum + parseInt(report.totalDue),
        0,
    );
    const totalDeductions = filteredReports.reduce(
        (sum, report) => sum + parseInt(report.deductions),
        0,
    );

    const handleCalculate = (id: number) => {
        setLoading(true);
        setTimeout(() => {
            setReports((prev) =>
                prev.map((report) =>
                    report.id === id
                        ? { ...report, status: "calculated" }
                        : report,
                ),
            );
            setLoading(false);
        }, 1500);
    };

    const handleExportExcel = () => {
        setLoading(true);
        setTimeout(() => {
            alert("تم تصدير التقرير بصيغة Excel");
            setLoading(false);
        }, 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "calculated":
                return "text-green-600 bg-green-100";
            case "pending":
                return "text-yellow-600 bg-yellow-100";
            default:
                return "text-gray-600 bg-gray-100";
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
                            تقارير الدوام{" "}
                            <span>{filteredReports.length} تقرير</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            يمكنك حساب المستحقات تلقائياً بناءً على سجل الحضور
                            الشهري
                        </div>
                        <div className="plan__current">
                            <h2>حساب المستحقات والتصدير</h2>
                            <div className="plan__date-range">
                                <div
                                    className="date-picker to"
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "center",
                                    }}
                                >
                                    <select
                                        value={periodFilter}
                                        onChange={(e) =>
                                            setPeriodFilter(e.target.value)
                                        }
                                        className="p-2 border rounded"
                                    >
                                        <option value="all">
                                            جميع الفترات
                                        </option>
                                        <option value="يناير 2026">
                                            يناير 2026
                                        </option>
                                        <option value="ديسمبر 2025">
                                            ديسمبر 2025
                                        </option>
                                    </select>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                        className="p-2 border rounded"
                                    >
                                        <option value="all">الكل</option>
                                        <option value="calculated">
                                            محسوبة
                                        </option>
                                        <option value="pending">معلقة</option>
                                    </select>
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو الدور..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="p-2 border rounded"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="plan__daily-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>الصورة</th>
                                    <th>الموظف</th>
                                    <th>الدور</th>
                                    <th>الفترة</th>
                                    <th>الراتب الأساسي</th>
                                    <th>أيام الدوام</th>
                                    <th>الخصومات</th>
                                    <th>المستحق</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`plan__row ${item.status}`}
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                                <img
                                                    src={item.img}
                                                    alt={item.employee}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td>{item.employee}</td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.role === "معلم"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {item.role}
                                            </span>
                                        </td>
                                        <td>{item.period}</td>
                                        <td className="font-bold">
                                            ر.{item.basicSalary}
                                        </td>
                                        <td className="font-medium">
                                            {item.attendanceDays}/26
                                        </td>
                                        <td className="text-red-600 font-medium">
                                            -ر.{item.deductions}
                                        </td>
                                        <td className="font-bold text-xl text-green-600">
                                            ر.{item.totalDue}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}
                                            >
                                                {item.status === "calculated"
                                                    ? "✅ محسوب"
                                                    : "⏳ معلق"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn calculate-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1"
                                                    style={{
                                                        borderColor:
                                                            item.status ===
                                                            "calculated"
                                                                ? "#10b981"
                                                                : "#059669",
                                                        color: "#059669",
                                                    }}
                                                    onClick={() =>
                                                        handleCalculate(item.id)
                                                    }
                                                    disabled={
                                                        loading ||
                                                        item.status ===
                                                            "calculated"
                                                    }
                                                >
                                                    {loading ? (
                                                        "..."
                                                    ) : (
                                                        <IoCheckmarkCircleOutline />
                                                    )}
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn excel-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-green-50 border-green-300 text-green-600 hover:bg-green-100"
                                                    onClick={handleExportExcel}
                                                    title="تصدير Excel"
                                                >
                                                    <FiDownload />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn pdf-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    title="مسير PDF"
                                                >
                                                    <FiFileText />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredReports.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد تقارير دوام لهذا الفلتر
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="plan__stats">
                        <div className="stat-card">
                            <div className="stat-icon redColor">
                                <i>
                                    <GrStatusCritical />
                                </i>
                            </div>
                            <div>
                                <h3>إجمالي المستحقات</h3>
                                <p className="text-2xl font-bold text-red-600">
                                    ر.{totalDueAmount.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon yellowColor">
                                <i>
                                    <GrStatusCritical />
                                </i>
                            </div>
                            <div>
                                <h3>إجمالي الخصومات</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    ر.{totalDeductions.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon greenColor">
                                <i>
                                    <PiWhatsappLogoDuotone />
                                </i>
                            </div>
                            <div>
                                <h3>عدد الأيام المدفوعة</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {filteredReports.reduce(
                                        (sum, r) => sum + r.attendanceDays,
                                        0,
                                    )}{" "}
                                    يوم
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        {" "}
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>نسبة الحضور</h1>
                            </div>
                            <p>85%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "85%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>تقارير محسوبة</h1>
                            </div>
                            <p>
                                {
                                    filteredReports.filter(
                                        (r) => r.status === "calculated",
                                    ).length
                                }
                                /{filteredReports.length}
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: filteredReports.length
                                            ? (filteredReports.filter(
                                                  (r) =>
                                                      r.status === "calculated",
                                              ).length /
                                                  filteredReports.length) *
                                              100
                                            : 0 + "%",
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

export default PayrollReports;
