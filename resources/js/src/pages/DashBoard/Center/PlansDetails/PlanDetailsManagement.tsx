// PlanDetailsManagement.tsx - محدث مع DeleteModal الجديد
import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2, FiPlus } from "react-icons/fi";
import { usePlanDetails } from "./hooks/usePlanDetails";
import CreatePlanDetailPage from "./models/CreatePlanDetailPage";
import UpdatePlanDetailPage from "./models/UpdatePlanDetailPage";
import DeleteModal from "./components/DeleteModal"; // ✅ المسار الصحيح
import "../../.../../../../assets/scss/main.scss";

interface PlanDetailType {
    id: number;
    day_number: number;
    new_memorization: string | null;
    review_memorization: string | null;
    status: "pending" | "current" | "completed";
}

const PlanDetailsManagement: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const planIdNum = planId ? parseInt(planId!) : 0;
    const [planName, setPlanName] = useState(`خطة ${planIdNum}`);

    const {
        details,
        loading,
        pagination,
        currentPage,
        goToPage,
        refetch,
        isEmpty,
        stats,
    } = usePlanDetails(planIdNum);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState<number | null>(
        null,
    );

    // ✅ Modal Delete State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteDetailId, setDeleteDetailId] = useState<number | null>(null);

    // جلب اسم الخطة
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">جاري تحميل تفاصيل الخطة...</p>
                </div>
            </div>
        );
    }

    // ✅ handleDeleteConfirm
    const handleDeleteConfirm = async () => {
        if (!deleteDetailId) return;

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(
                `/api/v1/plans/plan-details/${deleteDetailId}`,
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

            console.log("🗑️ DELETE Response:", {
                status: response.status,
                ok: response.ok,
            });

            if (response.ok) {
                toast.success("تم حذف اليوم بنجاح!");
                refetch();
                setShowDeleteModal(false);
                setDeleteDetailId(null);
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

    const handleDelete = (id: number) => {
        setDeleteDetailId(id);
        setShowDeleteModal(true);
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

    return (
        <>
            {/* ✅ DeleteModal Component - باستخدام الـ props الجديدة */}
            <DeleteModal
                show={showDeleteModal}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا اليوم؟"
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteDetailId(null);
                }}
                onConfirm={handleDeleteConfirm}
                confirmText="حذف اليوم"
                showConfirm={true}
            />

            {/* Create Modal */}
            {showCreateModal && (
                <CreatePlanDetailPage
                    planId={planIdNum}
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCloseCreateModal}
                />
            )}

            {/* Update Modal */}
            {showUpdateModal && selectedDetailId && (
                <UpdatePlanDetailPage
                    detailId={selectedDetailId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleCloseUpdateModal}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/* Stats Cards */}
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon purpleColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي الأيام</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blueColor">
                            <i>
                                <GrStatusCritical />
                            </i>
                        </div>
                        <div>
                            <h3>مكتملة</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.completed}
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
                            <h3>حالي</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.current}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            تفاصيل يومية للحفظ والمراجعة - خطة "{planName}"
                        </div>
                        <div className="plan__current">
                            <h2>تفاصيل الخطة</h2>
                            <div className="plan__date-range">
                                <button
                                    className="teacherStudent__status-btn add-btn p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <FiPlus size={20} className="inline mr-2" />
                                    تفاصيل خطة جديدة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم اليوم</th>
                                <th>الحفظ الجديد</th>
                                <th>المراجعة</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isEmpty ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center py-8 text-gray-500"
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
                                        className="plan__row active"
                                    >
                                        <td className="font-bold text-xl">
                                            {item.day_number}
                                        </td>
                                        <td>{item.new_memorization || "-"}</td>
                                        <td>
                                            {item.review_memorization || "-"}
                                        </td>
                                        <td>
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
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleEdit(item.id)
                                                    }
                                                    title="تعديل اليوم"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    title="حذف اليوم"
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

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div
                        className="inputs__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        <div className="flex justify-between items-center p-4">
                            <div className="text-sm text-gray-600">
                                عرض {details.length} من {pagination.total} يوم •
                                الصفحة <strong>{currentPage}</strong> من{" "}
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

                {/* Progress Bars */}
                <div
                    className="inputs__verifyOTPBirth"
                    style={{ width: "100%" }}
                >
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>تقدم الخطة</h1>
                        </div>
                        <p>{stats.progress}%</p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{ width: `${stats.progress}%` }}
                            ></span>
                        </div>
                    </div>
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>عدد الأيام</h1>
                        </div>
                        <p>{details.length}</p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{
                                    width: `${Math.min((details.length / 50) * 100, 100)}%`,
                                }}
                            ></span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlanDetailsManagement;
