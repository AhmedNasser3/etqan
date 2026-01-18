import { useState } from "react";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiDownload, FiEdit2, FiFileText } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const FinancialDashboard: React.FC = () => {
    const [employees, setEmployees] = useState([
        {
            id: 1,
            name: "أحمد محمد صالح",
            role: "معلم",
            basicSalary: "5000",
            attendanceDays: 22,
            deductions: "200",
            totalDue: "4800",
            status: "paid",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            name: "فاطمة أحمد علي",
            role: "مشرفة مالية",
            basicSalary: "6500",
            attendanceDays: 20,
            deductions: "500",
            totalDue: "6000",
            status: "pending",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 3,
            name: "عبدالله صالح",
            role: "معلم",
            basicSalary: "5000",
            attendanceDays: 18,
            deductions: "800",
            totalDue: "4200",
            status: "pending",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(false);

    const filteredEmployees = employees.filter(
        (emp) =>
            (emp.name.includes(search) || emp.role.includes(search)) &&
            (filterStatus === "all" || emp.status === filterStatus),
    );

    const totalPayroll = employees.reduce(
        (sum, emp) => sum + parseInt(emp.totalDue),
        0,
    );
    const totalPending = employees
        .filter((emp) => emp.status === "pending")
        .reduce((sum, emp) => sum + parseInt(emp.totalDue), 0);

    const handleExportPDF = () => {
        setLoading(true);
        setTimeout(() => {
            alert("تم تصدير المسير الشهري PDF");
            setLoading(false);
        }, 1500);
    };

    const handleMarkPaid = (id: number) => {
        setLoading(true);
        setTimeout(() => {
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === id ? { ...emp, status: "paid" } : emp,
                ),
            );
            setLoading(false);
        }, 1000);
    };

    const getStatusColor = (status: string) => {
        return status === "paid"
            ? "text-green-600 bg-green-100"
            : "text-yellow-600 bg-yellow-100";
    };

    return (
        <div className="teacherMotivate">
            <div className="teacherMotivate__inner">
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            لوحة المالية <span>شهر يناير 2026</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            المستحقات الشهرية: 15,000 ريال - متأخرات: 10,200
                            ريال
                        </div>
                        <div className="plan__current">
                            <h2>ملخص المستحقات والدوام</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) =>
                                            setFilterStatus(e.target.value)
                                        }
                                        className="mr-2 p-2 border rounded"
                                    >
                                        <option value="all">الكل</option>
                                        <option value="pending">معلقة</option>
                                        <option value="paid">مدفوعة</option>
                                    </select>
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو الدور..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
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
                                    <th>الاسم</th>
                                    <th>الدور</th>
                                    <th>الراتب الأساسي</th>
                                    <th>أيام الدوام</th>
                                    <th>الخصومات</th>
                                    <th>المستحق</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`plan__row ${item.status}`}
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                                <img
                                                    src={item.img}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td>{item.name}</td>
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
                                        <td className="font-bold text-lg">
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
                                                {item.status === "paid"
                                                    ? "✅ مدفوع"
                                                    : "⏳ معلق"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn paid-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1"
                                                    style={{
                                                        borderColor:
                                                            item.status ===
                                                            "paid"
                                                                ? "#10b981"
                                                                : "#059669",
                                                        color: "#059669",
                                                        backgroundColor:
                                                            item.status ===
                                                            "paid"
                                                                ? "#dcfce7"
                                                                : "#ecfdf5",
                                                    }}
                                                    onClick={() =>
                                                        handleMarkPaid(item.id)
                                                    }
                                                    disabled={
                                                        loading ||
                                                        item.status === "paid"
                                                    }
                                                >
                                                    {loading ? (
                                                        "..."
                                                    ) : (
                                                        <IoCheckmarkCircleOutline />
                                                    )}
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn pdf-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={handleExportPDF}
                                                    title="مسير PDF"
                                                >
                                                    <FiFileText />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100"
                                                    title="تعديل"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد مستحقات لهذا الفلتر
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
                                    ر.15,000
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
                                <h3>معلقة للدفع</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    ر.{totalPending.toLocaleString()}
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
                                <h3>مدفوعة</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    ر.4,800
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
                                <h1>نسبة الدفع</h1>
                            </div>
                            <p>32%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "32%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>متوسط الراتب</h1>
                            </div>
                            <p>ر.5,167</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "68%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialDashboard;
