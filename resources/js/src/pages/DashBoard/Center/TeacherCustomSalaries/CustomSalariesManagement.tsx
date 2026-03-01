import { useState } from "react";
import toast from "react-hot-toast";
import { FiEdit3, FiTrash2, FiPlus, FiCheckCircle } from "react-icons/fi";
import {
    useTeacherCustomSalaries,
    CustomSalaryItem,
    CustomSalaryStats,
} from "./hooks/useTeacherCustomSalaries";
import CreateCustomSalaryModal from "./models/CreateCustomSalaryModal";
import UpdateCustomSalaryModal from "./models/UpdateCustomSalaryModal";

const CustomSalariesManagement: React.FC = () => {
    const {
        salaries,
        stats,
        loading,
        pagination,
        currentPage,
        goToPage,
        refetch,
        isEmpty,
    } = useTeacherCustomSalaries();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedSalaryId, setSelectedSalaryId] = useState<number | null>(
        null,
    );

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat("ar-EG", {
            style: "currency",
            currency: "SAR",
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا الراتب المخصص؟")) return;

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(
                `/api/v1/teacher/custom-salaries/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                },
            );

            console.log("🗑️ DELETE Custom Salary Response:", {
                status: response.status,
                ok: response.ok,
            });

            if (response.ok) {
                toast.success("تم حذف الراتب المخصص بنجاح ✅");
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
                        جاري تحميل المرتبات المخصصة...
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
                <CreateCustomSalaryModal
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCloseCreateModal}
                />
            )}

            {showUpdateModal && selectedSalaryId && (
                <UpdateCustomSalaryModal
                    salaryId={selectedSalaryId}
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
                            <h3>إجمالي المرتبات المخصصة</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.total_custom || 0}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>✅</i>
                        </div>
                        <div>
                            <h3>المرتبات النشطة</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.active_custom || 0}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blueColor">
                            <i>👥</i>
                        </div>
                        <div>
                            <h3>عدد المعلمين في المركز</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.your_center_teachers_count || 0}
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
                            <i>⭐</i>المرتبات المخصصة للمعلمين في مجمعك
                        </div>
                        <div className="plan__current">
                            <h2>المرتبات المخصصة</h2>
                            <div className="plan__date-range">
                                <button
                                    className="teacherStudent__status-btn add-btn p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <FiPlus size={20} className="inline mr-2" />
                                    راتب مخصص جديد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>المعلم</th>
                                <th>الراتب المخصص</th>
                                <th>الدور</th>
                                <th>الحالة</th>
                                <th>الملاحظات</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isEmpty ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                                ⭐
                                            </div>
                                            <div>
                                                <p className="text-xl font-semibold mb-2">
                                                    لا توجد مرتبات مخصصة
                                                </p>
                                                <p className="text-gray-400">
                                                    ابدأ بإضافة راتب مخصص لأول
                                                    معلم
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                salaries.map((salary: CustomSalaryItem) => (
                                    <tr
                                        key={salary.id}
                                        className="plan__row active"
                                    >
                                        {/* ✅ إصلاح الخطأ هنا */}
                                        <td className="font-bold text-xl">
                                            {salary.teacher?.user?.name ||
                                                salary.teacher?.name ||
                                                salary.user?.name ||
                                                "غير محدد"}
                                        </td>
                                        <td className="font-semibold text-green-600">
                                            {formatCurrency(
                                                salary.custom_base_salary,
                                            )}
                                        </td>
                                        {/* ✅ Safe access */}
                                        <td>
                                            {salary.teacher?.role || "غير محدد"}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    salary.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {salary.is_active
                                                    ? "نشط"
                                                    : "غير نشط"}
                                            </span>
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
                                                    title="تعديل الراتب المخصص"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(salary.id)
                                                    }
                                                    title="حذف الراتب المخصص"
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
                                عرض {salaries.length} من {pagination.total || 0}{" "}
                                راتب مخصص • الصفحة{" "}
                                <strong>{currentPage}</strong> من{" "}
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

export default CustomSalariesManagement;
