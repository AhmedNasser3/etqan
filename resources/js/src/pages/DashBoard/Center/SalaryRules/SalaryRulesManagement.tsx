import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiEdit3, FiTrash2, FiPlus } from "react-icons/fi";
import { useSalaryRules, SalaryRuleType } from "./hooks/useSalaryRules";
import CreateSalaryRuleModal from "./models/CreateSalaryRuleModal";
import UpdateSalaryRuleModal from "./models/UpdateSalaryRuleModal";

const SalaryRulesManagement: React.FC = () => {
    const {
        salaries,
        loading,
        pagination,
        currentPage,
        goToPage,
        refetch,
        isEmpty,
        stats,
    } = useSalaryRules();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedSalaryId, setSelectedSalaryId] = useState<number | null>(
        null,
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ar-EG", {
            style: "currency",
            currency: "SAR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف قاعدة هذا الراتب؟")) return;

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(`/api/v1/teacher-salaries/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            console.log("🗑️ DELETE Response:", {
                status: response.status,
                ok: response.ok,
            });

            if (response.ok) {
                toast.success("تم حذف قاعدة الراتب بنجاح ✅");
                refetch();
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("❌ DELETE Error:", response.status, errorData);
                toast.error(errorData.message || "حدث خطأ في الحذف");
            }
        } catch (error) {
            console.error("💥 DELETE Network Error:", error);
            toast.error("حدث خطأ في الاتصال");
        }
    };

    const handleEdit = (salaryId: number) => {
        setSelectedSalaryId(salaryId);
        setShowUpdateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        refetch();
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedSalaryId(null);
        refetch();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">
                        <div className="navbar">
                            <div className="navbar__inner">
                                <div className="navbar__loading">
                                    <div className="loading-spinner">
                                        <div className="spinner-circle"></div>
                                    </div>
                                </div>
                            </div>
                        </div>{" "}
                    </p>
                </div>
            </div>
        );
    }

    const hasPrev = currentPage > 1;
    const hasNext = pagination && currentPage < pagination.last_page;

    return (
        <>
            {showCreateModal && (
                <CreateSalaryRuleModal
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCloseCreateModal}
                />
            )}

            {showUpdateModal && selectedSalaryId && (
                <UpdateSalaryRuleModal
                    salaryRuleId={selectedSalaryId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleCloseUpdateModal}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon purpleColor">
                            <i>📊</i>
                        </div>
                        <div>
                            <h3>إجمالي الأدوار</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>💰</i>
                        </div>
                        <div>
                            <h3>إجمالي الرواتب</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(stats.totalSalary)}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blueColor">
                            <i>📈</i>
                        </div>
                        <div>
                            <h3>متوسط الراتب</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(stats.avgSalary)}
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>⚖️</i>قوانين الرواتب لجميع الأدوار في مجمعك
                        </div>
                        <div className="plan__current">
                            <h2>قوانين الرواتب</h2>
                            <div className="plan__date-range">
                                <button
                                    className="teacherStudent__status-btn add-btn p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <FiPlus size={20} className="inline mr-2" />
                                    قاعدة راتب جديدة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>الدور</th>
                                <th>الراتب الأساسي</th>
                                <th>أيام العمل</th>
                                <th>اليومي</th>
                                <th>المسجد</th>
                                <th>الملاحظات</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isEmpty ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                                💰
                                            </div>
                                            <div>
                                                <p className="text-xl font-semibold mb-2">
                                                    لا توجد قوانين رواتب
                                                </p>
                                                <p className="text-gray-400">
                                                    ابدأ بإضافة قاعدة راتب لأول
                                                    دور
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                salaries.map((salary) => (
                                    <tr
                                        key={salary.id}
                                        className="plan__row active"
                                    >
                                        <td className="font-bold text-xl">
                                            {salary.role_ar ||
                                                salary.role ||
                                                "غير محدد"}
                                        </td>
                                        <td className="font-semibold text-green-600">
                                            {formatCurrency(
                                                salary.base_salary || 0,
                                            )}
                                        </td>
                                        <td>{salary.working_days || 0}</td>
                                        <td>
                                            {formatCurrency(
                                                salary.daily_rate || 0,
                                            )}
                                        </td>
                                        <td>
                                            {salary.mosque_id || "جميع المساجد"}
                                        </td>
                                        <td
                                            className="max-w-xs truncate"
                                            title={salary.notes || ""}
                                        >
                                            {salary.notes || "-"}
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleEdit(salary.id)
                                                    }
                                                    title="تعديل قاعدة الراتب"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(salary.id)
                                                    }
                                                    title="حذف قاعدة الراتب"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.last_page > 1 && (
                    <div
                        className="inputs__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        <div className="flex justify-between items-center p-4">
                            <div className="text-sm text-gray-600">
                                عرض {salaries.length} من {pagination.total}{" "}
                                قاعدة • الصفحة <strong>{currentPage}</strong> من{" "}
                                <strong>{pagination.last_page}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={!hasPrev}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                >
                                    السابق
                                </button>
                                <span className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold">
                                    {currentPage}
                                </span>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasNext}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SalaryRulesManagement;
