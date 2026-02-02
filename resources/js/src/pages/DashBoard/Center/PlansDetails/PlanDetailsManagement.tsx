import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEdit3, FiTrash2, FiPlus } from "react-icons/fi";
import { usePlanDetails } from "./hooks/usePlanDetails";
import CreatePlanDetailPage from "./models/CreatePlanDetailPage";
import UpdatePlanDetailPage from "./models/UpdatePlanDetailPage";

interface PlanDetailType {
    id: number;
    day_number: number;
    new_memorization: string | null;
    review_memorization: string | null;
    status: "pending" | "current" | "completed";
}

// ✅ Plan data داخلياً - مش محتاج props
interface PlanType {
    id: number;
    plan_name: string;
}

const PlanDetailsManagement: React.FC = () => {
    // ✅ بدون props خالص!
    const { planId } = useParams<{ planId: string }>();

    // ✅ Plan data من الـ URL param
    const planIdNum = planId ? parseInt(planId) : 0;
    const [planName, setPlanName] = useState(`خطة ${planIdNum}`);

    // ✅ يجيب تفاصيل الخطة + اسمها
    const {
        details,
        loading,
        error,
        pagination,
        currentPage,
        goToPage,
        refetch,
        isEmpty,
    } = usePlanDetails(planIdNum);

    // ✅ جيب اسم الخطة من API
    useEffect(() => {
        if (planIdNum > 0) {
            fetch(`/api/v1/plans/${planIdNum}`)
                .then((res) => res.json())
                .then((data) => {
                    setPlanName(
                        data.plan_name || data.name || `خطة ${planIdNum}`,
                    );
                })
                .catch(() => {
                    setPlanName(`خطة ${planIdNum}`);
                });
        }
    }, [planIdNum]);

    // Modals State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState<number | null>(
        null,
    );

    // ✅ ERROR STATE
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="text-2xl font-bold text-red-600 mb-4">
                    ❌ خطأ في التحميل
                </div>
                <p className="text-gray-600 mb-8 max-w-md">{error}</p>
                <button
                    onClick={refetch}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold flex items-center gap-2 mx-auto"
                >
                    🔄 إعادة المحاولة
                </button>
            </div>
        );
    }

    // ✅ LOADING STATE
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg">
                        جاري تحميل تفاصيل الخطة...
                    </p>
                </div>
            </div>
        );
    }

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا اليوم؟")) return;

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(`/api/v1/plan-details/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            if (response.ok) {
                toast.success("تم حذف اليوم بنجاح ✅");
                refetch();
            } else {
                toast.error("حدث خطأ في الحذف");
            }
        } catch {
            toast.error("حدث خطأ في الحذف");
        }
    };

    const handleNextDay = async () => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(
                `/api/v1/plans/${planIdNum}/next-day`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                },
            );

            if (response.ok) {
                toast.success("تم الانتقال لليوم التالي ✅");
                refetch();
            } else {
                toast.error("حدث خطأ");
            }
        } catch {
            toast.error("حدث خطأ");
        }
    };

    const handleEdit = (detailId: number) => {
        setSelectedDetailId(detailId);
        setShowUpdateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        refetch();
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedDetailId(null);
        refetch();
    };

    const getStatusColor = (status: PlanDetailType["status"]) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-200";
            case "current":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "pending":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const hasPrev = currentPage > 1;
    const hasNext = pagination && currentPage < pagination.last_page;

    // ✅ Plan object للـ modals
    const currentPlan: PlanType = { id: planIdNum, plan_name: planName };

    return (
        <>
            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg">
                    <h2 className="text-3xl font-bold text-gray-800">
                        📋 تفاصيل خطة:{" "}
                        <span className="text-blue-600">"{planName}"</span>
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold flex items-center gap-2 shadow-md transition-all"
                        >
                            <FiPlus size={20} />
                            يوم جديد
                        </button>
                        <button
                            onClick={handleNextDay}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-md transition-all"
                        >
                            ▶️ اليوم التالي
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="plan__daily-table bg-white rounded-2xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <tr>
                                <th className="p-4 text-left font-semibold">
                                    رقم اليوم
                                </th>
                                <th className="p-4 text-left font-semibold">
                                    الحفظ الجديد
                                </th>
                                <th className="p-4 text-left font-semibold">
                                    المراجعة
                                </th>
                                <th className="p-4 text-left font-semibold">
                                    الحالة
                                </th>
                                <th className="p-4 text-left font-semibold">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isEmpty ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center py-12 text-gray-500"
                                    >
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                                📭
                                            </div>
                                            <div>
                                                <p className="text-xl font-semibold mb-2">
                                                    لا توجد أيام لهذه الخطة
                                                </p>
                                                <p className="text-gray-400">
                                                    ابدأ بإضافة أول يوم لحلقة
                                                    حفظك
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                details.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="p-4 font-bold text-xl text-gray-900">
                                            يوم {item.day_number}
                                        </td>
                                        <td className="p-4 font-semibold text-green-600">
                                            {item.new_memorization || (
                                                <span className="text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 font-semibold text-blue-600">
                                            {item.review_memorization || (
                                                <span className="text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(item.status)}`}
                                            >
                                                {item.status === "completed"
                                                    ? "✅ مكتمل"
                                                    : item.status === "current"
                                                      ? "🔥 حالي"
                                                      : "⏳ معلق"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    className="p-3 rounded-xl border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center"
                                                    onClick={() =>
                                                        handleEdit(item.id)
                                                    }
                                                    title="تعديل اليوم"
                                                >
                                                    <FiEdit3
                                                        size={18}
                                                        className="text-blue-600"
                                                    />
                                                </button>
                                                <button
                                                    className="p-3 rounded-xl border-2 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all flex items-center justify-center"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    title="حذف اليوم"
                                                >
                                                    <FiTrash2
                                                        size={18}
                                                        className="text-red-600"
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex justify-between items-center p-6 mt-8 bg-gray-50 rounded-2xl">
                        <div className="text-sm text-gray-600 font-medium">
                            عرض {details.length} من{" "}
                            <span className="font-bold text-blue-600">
                                {pagination.total}
                            </span>{" "}
                            يوم
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={!hasPrev}
                                className="px-6 py-2 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all font-medium"
                            >
                                السابق
                            </button>
                            <span className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold min-w-[50px] text-center">
                                {currentPage}
                            </span>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={!hasNext}
                                className="px-6 py-2 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all font-medium"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreatePlanDetailPage
                    planId={planIdNum}
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCloseCreateModal}
                />
            )}

            {showUpdateModal && selectedDetailId && (
                <UpdatePlanDetailPage
                    detailId={selectedDetailId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleCloseUpdateModal}
                />
            )}
        </>
    );
};

export default PlanDetailsManagement;
