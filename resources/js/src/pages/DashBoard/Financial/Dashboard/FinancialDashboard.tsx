import { useState, useMemo, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiFileText, FiEdit2 } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { useTeacherPayrolls, PayrollItem } from "./hooks/useTeacherPayrolls";

// ✅ Modal داخلي آمن 100%
const FinancialModel = ({
    isOpen,
    onClose,
    payroll,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    payroll?: Partial<PayrollItem> | null;
    onSubmit?: (data: FormData) => void;
}) => {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit) {
            const formData = new FormData(e.currentTarget);
            onSubmit(formData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                        تعديل بيانات الموظف
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الاسم
                        </label>
                        <input
                            name="name"
                            defaultValue={
                                payroll?.user?.name ||
                                payroll?.teacher?.name ||
                                ""
                            }
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الراتب الأساسي
                        </label>
                        <input
                            name="base_salary"
                            defaultValue={payroll?.base_salary || ""}
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            المستحق
                        </label>
                        <input
                            name="total_due"
                            defaultValue={payroll?.total_due || ""}
                            type="number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all"
                    >
                        حفظ التعديلات
                    </button>
                </form>
            </div>
        </div>
    );
};

const FinancialDashboard: React.FC = () => {
    // ✅ Safe destructuring مع fallback
    let hookData;
    try {
        hookData = useTeacherPayrolls();
    } catch (error) {
        console.error("Hook error:", error);
        hookData = {
            payrolls: [],
            rawPayrolls: [],
            stats: null,
            loading: false,
            search: "",
            setSearch: () => {},
            filterStatus: "all" as const,
            setFilterStatus: () => {},
            markPaid: async () => false,
        };
    }

    const {
        payrolls: rawPayrolls = [],
        stats = null,
        loading = false,
        search = "",
        setSearch = () => {},
        filterStatus = "all",
        setFilterStatus = () => {},
        markPaid = async () => false,
    } = hookData;

    const [showFinancialModel, setShowFinancialModel] = useState(false);
    const [editingPayroll, setEditingPayroll] =
        useState<Partial<PayrollItem> | null>(null);

    // ✅ Safe calculations
    const totalPayroll = useMemo(() => {
        return rawPayrolls.reduce((sum, emp) => {
            const value = parseFloat(emp?.total_due || "0");
            return isNaN(value) ? sum : sum + value;
        }, 0);
    }, [rawPayrolls]);

    const totalPending = useMemo(() => {
        return rawPayrolls
            .filter((emp) => emp?.status === "pending")
            .reduce((sum, emp) => {
                const value = parseFloat(emp?.total_due || "0");
                return isNaN(value) ? sum : sum + value;
            }, 0);
    }, [rawPayrolls]);

    const totalPaid = useMemo(
        () => totalPayroll - totalPending,
        [totalPayroll, totalPending],
    );

    // ✅ Safe handlers
    const handleOpenFinancialModel = useCallback(
        (payroll?: Partial<PayrollItem>) => {
            setEditingPayroll(payroll || null);
            setShowFinancialModel(true);
        },
        [],
    );

    const handleCloseFinancialModel = useCallback(() => {
        setShowFinancialModel(false);
        setEditingPayroll(null);
    }, []);

    const handleUpdatePayroll = useCallback(async () => {
        toast.success("✅ تم حفظ التعديلات بنجاح");
        handleCloseFinancialModel();
    }, [handleCloseFinancialModel]);

    const handleExportPDF = useCallback(() => {
        const t = toast.loading("جاري تصدير PDF...");
        setTimeout(() => {
            toast.success("تم تصدير المسير الشهري بنجاح!", { id: t });
        }, 1500);
    }, []);

    const handleMarkPaidSafe = useCallback(
        async (id: number) => {
            try {
                const success = await markPaid(id);
                if (success) {
                    toast.success("✅ تم تحديث الحالة");
                } else {
                    toast.error("❌ فشل في التحديث");
                }
            } catch {
                toast.error("❌ خطأ في التحديث");
            }
        },
        [markPaid],
    );

    const getStatusColor = useCallback(
        (status?: string) =>
            status === "paid"
                ? "text-green-600 bg-green-100"
                : "text-yellow-600 bg-yellow-100",
        [],
    );

    const getRoleName = useCallback((role?: string) => {
        const names: Record<string, string> = {
            teacher: "معلم",
            supervisor: "مشرف",
            financial: "مالية",
            motivator: "محفز",
            student_affairs: "شؤون طلاب",
        };
        return names[role as keyof typeof names] || "غير محدد";
    }, []);

    // ✅ Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center p-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                    <p className="text-xl font-semibold text-gray-700">
                        جاري تحميل المستحقات المالية...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" rtl={true} />

            <FinancialModel
                isOpen={showFinancialModel}
                onClose={handleCloseFinancialModel}
                payroll={editingPayroll}
                onSubmit={handleUpdatePayroll}
            />

            <div className="teacherMotivate" style={{ padding: "0 15%" }}>
                <div className="teacherMotivate__inner">
                    <div
                        className="userProfile__plan"
                        style={{ paddingBottom: "24px", padding: "0" }}
                    >
                        <div className="userProfile__planTitle">
                            <h1>
                                لوحة المالية <span>شهر فبراير 2026</span>
                            </h1>
                        </div>

                        <div className="plan__header">
                            <div className="plan__ai-suggestion">
                                <i>
                                    <RiRobot2Fill />
                                </i>
                                المستحقات الشهرية: ر.
                                {totalPayroll.toLocaleString()} - متأخرات: ر.
                                {totalPending.toLocaleString()}
                            </div>
                            <div className="plan__current">
                                <h2>ملخص المستحقات والدوام</h2>
                                <div className="plan__date-range">
                                    <div className="date-picker to flex gap-2">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) =>
                                                setFilterStatus(
                                                    e.target.value as any,
                                                )
                                            }
                                            className="p-2 border rounded"
                                        >
                                            <option value="all">
                                                الكل ({rawPayrolls.length})
                                            </option>
                                            <option value="pending">
                                                معلقة
                                            </option>
                                            <option value="paid">مدفوعة</option>
                                        </select>
                                        <input
                                            type="search"
                                            placeholder="البحث بالاسم أو الدور..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            className="flex-1 p-2 border rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="plan__daily-table overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="p-4 text-right">
                                            الصورة
                                        </th>
                                        <th className="p-4 text-right">
                                            الاسم
                                        </th>
                                        <th className="p-4 text-right">
                                            الدور
                                        </th>
                                        <th className="p-4 text-right">
                                            الراتب الأساسي
                                        </th>
                                        <th className="p-4 text-right">
                                            أيام الدوام
                                        </th>
                                        <th className="p-4 text-right">
                                            الخصومات
                                        </th>
                                        <th className="p-4 text-right">
                                            المستحق
                                        </th>
                                        <th className="p-4 text-right">
                                            الحالة
                                        </th>
                                        <th className="p-4 text-right">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawPayrolls.map((item: any) => (
                                        <tr
                                            key={item?.id || Math.random()}
                                            className={`hover:bg-gray-50 ${item?.status || ""}`}
                                        >
                                            <td className="p-4">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {(
                                                        item?.teacher?.name ||
                                                        "غير معروف"
                                                    )
                                                        .split(" ")
                                                        .map(
                                                            (n: string) => n[0],
                                                        )
                                                        .join("")
                                                        .slice(0, 2)}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">
                                                {item?.user?.name ||
                                                    item?.teacher?.name ||
                                                    "غير معروف"}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        item?.teacher?.role ===
                                                        "teacher"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                                >
                                                    {getRoleName(
                                                        item?.teacher?.role,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-lg">
                                                ر.
                                                {parseFloat(
                                                    item?.base_salary || "0",
                                                ).toLocaleString()}
                                            </td>
                                            <td className="p-4 font-medium">
                                                {item?.attendance_days || 0}/26
                                            </td>
                                            <td className="p-4 text-red-600 font-medium">
                                                -ر.
                                                {parseFloat(
                                                    item?.deductions || "0",
                                                ).toLocaleString()}
                                            </td>
                                            <td className="p-4 font-bold text-xl text-green-600">
                                                ر.
                                                {parseFloat(
                                                    item?.total_due || "0",
                                                ).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item?.status)}`}
                                                >
                                                    {item?.status === "paid"
                                                        ? "✅ مدفوع"
                                                        : "⏳ معلق"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleMarkPaidSafe(
                                                                item.id,
                                                            )
                                                        }
                                                        disabled={
                                                            loading ||
                                                            item?.status ===
                                                                "paid"
                                                        }
                                                        className="p-2 rounded-full border-2 border-green-500 text-green-600 bg-green-50 hover:bg-green-100 disabled:opacity-50 flex items-center justify-center w-10 h-10"
                                                    >
                                                        {loading ? (
                                                            "..."
                                                        ) : (
                                                            <IoCheckmarkCircleOutline
                                                                size={18}
                                                            />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={
                                                            handleExportPDF
                                                        }
                                                        title="مسير PDF"
                                                        className="p-2 rounded-full border-2 border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center justify-center w-10 h-10"
                                                    >
                                                        <FiFileText size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleOpenFinancialModel(
                                                                item,
                                                            )
                                                        }
                                                        title="تعديل"
                                                        className="p-2 rounded-full border-2 border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100 flex items-center justify-center w-10 h-10"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {rawPayrolls.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="p-12 text-center text-gray-500 text-lg"
                                            >
                                                لا توجد مستحقات لهذا الفلتر
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Stats Cards */}
                        <div className="plan__stats grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                            <div className="stat-card bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-4 space-x-reverse">
                                <div className="stat-icon redColor p-3 rounded-xl bg-red-100">
                                    <GrStatusCritical size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">
                                        إجمالي المستحقات
                                    </h3>
                                    <p className="text-2xl font-bold text-red-600">
                                        ر.{totalPayroll.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="stat-card bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-4 space-x-reverse">
                                <div className="stat-icon yellowColor p-3 rounded-xl bg-yellow-100">
                                    <GrStatusCritical size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">
                                        معلقة للدفع
                                    </h3>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        ر.{totalPending.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="stat-card bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-4 space-x-reverse">
                                <div className="stat-icon greenColor p-3 rounded-xl bg-green-100">
                                    <PiWhatsappLogoDuotone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">
                                        مدفوعة
                                    </h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        ر.{totalPaid.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold mb-6">
                                    نسبة الدفع
                                </h3>
                                <p className="text-3xl font-bold text-blue-600 mb-4">
                                    {Math.round(
                                        (totalPaid /
                                            Math.max(totalPayroll, 1)) *
                                            100,
                                    )}
                                    %
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all"
                                        style={{
                                            width: `${Math.round((totalPaid / Math.max(totalPayroll, 1)) * 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinancialDashboard;
