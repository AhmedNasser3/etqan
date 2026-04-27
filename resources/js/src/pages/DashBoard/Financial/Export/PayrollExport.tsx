// PayrollExport.tsx - مصحح مع نفس ديزاين StaffApproval + PlansManagement classes
import React, { useState } from "react";
import { ICO } from "../../icons";
import { useToast } from "../../../../../contexts/ToastContext";

interface EmployeeType {
    id: number;
    name: string;
    role: string;
    period: string;
    basicSalary: string;
    attendanceDays: number;
    deductions: string;
    totalDue: string;
    qrCode: string;
    status: "ready" | "generating";
    img: string;
}

const PayrollExport: React.FC = () => {
    const [employees, setEmployees] = useState<EmployeeType[]>([
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

    const { notifySuccess, notifyError } = useToast();
    const [search, setSearch] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);

    // فلترة محلية
    const filteredEmployees = employees.filter(
        (emp) =>
            emp.name.toLowerCase().includes(search.toLowerCase()) ||
            emp.role.toLowerCase().includes(search.toLowerCase()),
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

    const generatePayroll = async (id: number) => {
        setLoadingIds((prev) => new Set([...prev, id]));
        notifySuccess("جاري إنشاء مسير PDF...");

        // Simulate API call
        setTimeout(() => {
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.id === id ? { ...emp, status: "ready" } : emp,
                ),
            );
            notifySuccess("تم إنشاء مسير PDF مع QR بنجاح");
            setLoadingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }, 2000);
    };

    const bulkExportPDF = async () => {
        setBulkLoading(true);
        notifySuccess(`جاري تصدير ${selectedEmployees.length} مسير PDF...`);

        setTimeout(() => {
            setBulkLoading(false);
            notifySuccess(
                `تم تصدير ${selectedEmployees.length} مسير PDF مع QR`,
            );
        }, 3000);
    };

    const bulkExportExcel = async () => {
        setBulkLoading(true);
        notifySuccess(`جاري تصدير ${selectedEmployees.length} مسير Excel...`);

        setTimeout(() => {
            setBulkLoading(false);
            notifySuccess(`تم تصدير ${selectedEmployees.length} مسير Excel`);
        }, 2500);
    };

    const sendEmail = async (id: number) => {
        setLoadingIds((prev) => new Set([...prev, id]));
        notifySuccess("جاري إرسال البريد الإلكتروني...");

        setTimeout(() => {
            setLoadingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            notifySuccess("تم إرسال مسير الراتب إلى البريد الإلكتروني");
        }, 1500);
    };

    const getStatusColor = (
        status: EmployeeType["status"],
    ): React.CSSProperties => {
        return status === "ready"
            ? { background: "#dcfce7", color: "#166534" }
            : { background: "#dbeafe", color: "#1e40af" };
    };

    const getRoleColor = (role: string): React.CSSProperties => {
        return role === "معلم"
            ? { background: "var(--g100)", color: "var(--g700)" }
            : { background: "#fee2e2", color: "#ef4444" };
    };

    return (
        <div className="content" id="contentArea">
            <div className="widget">
                <div className="wh">
                    <div className="wh-l">
                        استخراج مسيرات الرواتب ({filteredEmployees.length} موظف)
                    </div>
                    <div
                        className="flx"
                        style={{ gap: "12px", alignItems: "center" }}
                    >
                        {selectedEmployees.length > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                    background: "#dbeafe",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={toggleSelectAll}
                                    style={{ margin: 0 }}
                                />
                                <span
                                    style={{
                                        fontWeight: 600,
                                        color: "#1e40af",
                                    }}
                                >
                                    {selectedEmployees.length} محدد
                                </span>
                                <select
                                    value=""
                                    onChange={(e) => {
                                        if (e.target.value === "pdf")
                                            bulkExportPDF();
                                        if (e.target.value === "excel")
                                            bulkExportExcel();
                                    }}
                                    className="p-1 border rounded text-xs bg-white"
                                    style={{ minWidth: "90px" }}
                                    disabled={bulkLoading}
                                >
                                    <option value="">عمل جماعي</option>
                                    <option value="pdf">تصدير PDF</option>
                                    <option value="excel">تصدير Excel</option>
                                </select>
                            </div>
                        )}
                        <input
                            className="fi"
                            style={{ margin: 0 }}
                            placeholder="البحث بالاسم أو الدور..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
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
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((item) => (
                                    <tr key={item.id}>
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
                                        <td>
                                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                                <img
                                                    src={item.img}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display =
                                                            "none";
                                                        e.currentTarget.parentElement!.innerHTML = `<span class="text-xs font-medium text-gray-700">${item.name.charAt(0)}</span>`;
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>
                                            {item.name}
                                        </td>
                                        <td>
                                            <span
                                                className="badge px-2 py-1 rounded-full text-xs font-medium"
                                                style={getRoleColor(item.role)}
                                            >
                                                {item.role}
                                            </span>
                                        </td>
                                        <td>{item.period}</td>
                                        <td className="font-bold text-xl text-green-600">
                                            ر.
                                            {parseInt(
                                                item.totalDue,
                                            ).toLocaleString()}
                                        </td>
                                        <td>
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                                                style={getStatusColor(
                                                    item.status,
                                                )}
                                            >
                                                {item.status === "ready"
                                                    ? "✅ جاهز"
                                                    : "⏳ جارٍ..."}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                    <svg
                                                        className="w-4 h-4 text-gray-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 4v1m6 11h2m-6 0h-2m2 0v2m0-6V8m0 0h2m-2 0H9"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    جاهز
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="td-actions">
                                                <button
                                                    className={`btn bxs red ${loadingIds.has(item.id) ? "loading" : ""}`}
                                                    onClick={() =>
                                                        generatePayroll(item.id)
                                                    }
                                                    disabled={
                                                        loadingIds.has(
                                                            item.id,
                                                        ) || bulkLoading
                                                    }
                                                    title="مسير PDF"
                                                >
                                                    {loadingIds.has(item.id)
                                                        ? "جاري..."
                                                        : "PDF"}
                                                </button>
                                                <button
                                                    className="btn bs bxs blue"
                                                    onClick={() =>
                                                        sendEmail(item.id)
                                                    }
                                                    disabled={
                                                        loadingIds.has(
                                                            item.id,
                                                        ) || bulkLoading
                                                    }
                                                    title="إرسال بريد"
                                                >
                                                    بريد
                                                </button>
                                                <button
                                                    className="btn bs bxs green"
                                                    title="طباعة"
                                                    disabled={bulkLoading}
                                                >
                                                    طباعة
                                                </button>
                                                <button
                                                    className="btn bs bxs gray"
                                                    title="نسخ رابط"
                                                    disabled={bulkLoading}
                                                >
                                                    نسخ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9}>
                                        <div className="empty">
                                            <p>
                                                {search
                                                    ? "لا توجد نتائج للبحث"
                                                    : "لا توجد مسيرات للتصدير"}
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

export default PayrollExport;
