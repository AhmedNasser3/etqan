import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiDownload, FiCopy, FiPrinter, FiMail } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoQrCodeOutline } from "react-icons/io5";

const PayrollExport: React.FC = () => {
    const [employees, setEmployees] = useState([
        {
            id: 1,
            name: "أحمد محمد صالح",
            role: "معلم",
            period: "يناير 2026",
            basicSalary: "5000",
            attendanceDays: 22,
            deductions: "200",
            totalDue: "4800",
            qrCode: "qr-ahmed-2026.png",
            status: "ready",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            name: "فاطمة أحمد علي",
            role: "مشرفة مالية",
            period: "يناير 2026",
            basicSalary: "6500",
            attendanceDays: 20,
            deductions: "500",
            totalDue: "6000",
            qrCode: "qr-fatima-2026.png",
            status: "ready",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 3,
            name: "عبدالله صالح محمد",
            role: "معلم",
            period: "يناير 2026",
            basicSalary: "5000",
            attendanceDays: 18,
            deductions: "800",
            totalDue: "4200",
            qrCode: "qr-abdullah-2026.png",
            status: "generating",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);

    const [search, setSearch] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [bulkAction, setBulkAction] = useState("");

    const filteredEmployees = employees.filter(
        (emp) => emp.name.includes(search) || emp.role.includes(search),
    );

    const toggleSelect = (id: number) => {
        setSelectedEmployees((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        if (selectedEmployees.length === filteredEmployees.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
        }
    };

    const generatePayroll = (id: number) => {
        const loadingToast = toast.loading("جاري إنشاء مسير PDF...");
        setLoading(true);
        setTimeout(() => {
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === id ? { ...emp, status: "ready" } : emp,
                ),
            );
            setLoading(false);
            toast.success("تم إنشاء مسير PDF مع QR بنجاح");
        }, 2000);
    };

    const bulkExportPDF = () => {
        const loadingToast = toast.loading(
            `جاري تصدير ${selectedEmployees.length} مسير PDF...`,
        );
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success(
                `تم تصدير ${selectedEmployees.length} مسير PDF مع QR`,
            );
        }, 3000);
    };

    const bulkExportExcel = () => {
        const loadingToast = toast.loading(
            `جاري تصدير ${selectedEmployees.length} مسير Excel...`,
        );
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success(`تم تصدير ${selectedEmployees.length} مسير Excel`);
        }, 2500);
    };

    const sendEmail = (id: number) => {
        const loadingToast = toast.loading("جاري إرسال البريد الإلكتروني...");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("تم إرسال مسير الراتب إلى البريد الإلكتروني");
        }, 1500);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ready":
                return "text-green-600 bg-green-100";
            case "generating":
                return "text-blue-600 bg-blue-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <>
            <Toaster position="top-right" rtl={true} />
            <div className="teacherMotivate" style={{ padding: "0 15%" }}>
                <div className="teacherMotivate__inner">
                    <div
                        className="userProfile__plan"
                        style={{ paddingBottom: "24px", padding: "0" }}
                    >
                        <div className="userProfile__planTitle">
                            <h1>
                                استخراج مسير{" "}
                                <span>{filteredEmployees.length} موظف</span>
                            </h1>
                        </div>

                        <div className="plan__header">
                            <div className="plan__ai-suggestion">
                                <i>
                                    <RiRobot2Fill />
                                </i>
                                يمكنك تصدير مسيرات PDF فردية أو جماعية مع رمز QR
                                للتحقق من الصحة
                            </div>
                            <div className="plan__current">
                                <h2>مسيرات الرواتب الشهرية</h2>
                                <div className="plan__date-range">
                                    <div
                                        className="date-picker to"
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            alignItems: "center",
                                        }}
                                    >
                                        {selectedEmployees.length > 0 && (
                                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    checked={true}
                                                    onChange={toggleSelectAll}
                                                />
                                                <span className="font-medium text-blue-800">
                                                    {selectedEmployees.length}{" "}
                                                    محدد
                                                </span>
                                                <select
                                                    value={bulkAction}
                                                    onChange={(e) =>
                                                        setBulkAction(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="p-1 border rounded text-sm"
                                                >
                                                    <option value="">
                                                        عمل جماعي
                                                    </option>
                                                    <option value="pdf">
                                                        تصدير PDF
                                                    </option>
                                                    <option value="excel">
                                                        تصدير Excel
                                                    </option>
                                                </select>
                                                <button
                                                    onClick={
                                                        bulkAction === "pdf"
                                                            ? bulkExportPDF
                                                            : bulkAction ===
                                                                "excel"
                                                              ? bulkExportExcel
                                                              : undefined
                                                    }
                                                    disabled={
                                                        loading || !bulkAction
                                                    }
                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    تنفيذ
                                                </button>
                                            </div>
                                        )}
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
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedEmployees.length ===
                                                        filteredEmployees.length &&
                                                    filteredEmployees.length > 0
                                                }
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th>الصورة</th>
                                        <th>الاسم</th>
                                        <th>الدور</th>
                                        <th>الشهر</th>
                                        <th>المستحق</th>
                                        <th>الحالة</th>
                                        <th>رمز QR</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`plan__row ${item.status}`}
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmployees.includes(
                                                        item.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelect(item.id)
                                                    }
                                                />
                                            </td>
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
                                            <td>{item.period}</td>
                                            <td className="font-bold text-xl text-green-600">
                                                ر.{item.totalDue}
                                            </td>
                                            <td>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}
                                                >
                                                    {item.status === "ready"
                                                        ? "✅ جاهز"
                                                        : item.status ===
                                                            "generating"
                                                          ? "⏳ جارٍ..."
                                                          : "⚠️ خطأ"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                        <IoQrCodeOutline className="text-gray-500 text-sm" />
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        جاهز
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="teacherStudent__btns">
                                                    <button
                                                        className="teacherStudent__status-btn pdf-single p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                        onClick={() =>
                                                            generatePayroll(
                                                                item.id,
                                                            )
                                                        }
                                                        disabled={
                                                            item.status ===
                                                            "generating"
                                                        }
                                                        title="مسير PDF"
                                                    >
                                                        <FiDownload />
                                                    </button>
                                                    <button
                                                        className="teacherStudent__status-btn email-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                        onClick={() =>
                                                            sendEmail(item.id)
                                                        }
                                                        title="إرسال بريد إلكتروني"
                                                    >
                                                        <FiMail />
                                                    </button>
                                                    <button
                                                        className="teacherStudent__status-btn print-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-green-50 border-green-300 text-green-600 hover:bg-green-100"
                                                        title="طباعة"
                                                    >
                                                        <FiPrinter />
                                                    </button>
                                                    <button
                                                        className="teacherStudent__status-btn copy-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                                                        title="نسخ رابط"
                                                    >
                                                        <FiCopy />
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
                                                لا توجد مسيرات للتصدير
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
                                        ر.
                                        {filteredEmployees
                                            .reduce(
                                                (sum, e) =>
                                                    sum + parseInt(e.totalDue),
                                                0,
                                            )
                                            .toLocaleString()}
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
                                    <h3>جاهزة للتصدير</h3>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {
                                            filteredEmployees.filter(
                                                (e) => e.status === "ready",
                                            ).length
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon greenColor">
                                    <i>
                                        <IoQrCodeOutline />
                                    </i>
                                </div>
                                <div>
                                    <h3>أكواد QR جاهزة</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {filteredEmployees.length}
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
                                    <h1>نسبة الاستعداد</h1>
                                </div>
                                <p>
                                    {filteredEmployees.length
                                        ? Math.round(
                                              (filteredEmployees.filter(
                                                  (e) => e.status === "ready",
                                              ).length /
                                                  filteredEmployees.length) *
                                                  100,
                                          )
                                        : 0}
                                    %
                                </p>
                                <div className="userProfile__progressBar">
                                    <span
                                        style={{
                                            width: filteredEmployees.length
                                                ? Math.round(
                                                      (filteredEmployees.filter(
                                                          (e) =>
                                                              e.status ===
                                                              "ready",
                                                      ).length /
                                                          filteredEmployees.length) *
                                                          100,
                                                  ) + "%"
                                                : "0%",
                                        }}
                                    ></span>
                                </div>
                            </div>
                            <div className="userProfile__progressContent">
                                <div className="userProfile__progressTitle">
                                    <h1>عدد المسيرات المحددة</h1>
                                </div>
                                <p>{selectedEmployees.length}</p>
                                <div className="userProfile__progressBar">
                                    <span
                                        style={{
                                            width: filteredEmployees.length
                                                ? (selectedEmployees.length /
                                                      filteredEmployees.length) *
                                                      100 +
                                                  "%"
                                                : "0%",
                                        }}
                                    ></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PayrollExport;
