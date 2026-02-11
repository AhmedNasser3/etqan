import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import CreatePlanPage from "./models/CreatePlanPage";
import UpdatePlanPage from "./models/UpdatePlanPage";
import DeleteModal from "../PlansDetails/components/DeleteModal"; // ✅ Import DeleteModal
import { usePlans } from "./hooks/usePlans";

interface PlanType {
    id: number;
    plan_name: string;
    total_months: number;
    center?: { id: number; name: string };
    center_id: number;
    details_count: number;
    current_day?: number;
    created_at: string;
}

const PlansManagement: React.FC = () => {
    const {
        plans = [],
        loading = false,
        pagination,
        currentPage,
        searchPlans,
        goToPage,
        refetch,
    } = usePlans();

    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

    // ✅ Modal Delete State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePlanId, setDeletePlanId] = useState<number | null>(null);

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            searchPlans(value);
        },
        [searchPlans],
    );

    // ✅ handleDeleteConfirm - مع Modal
    const handleDeleteConfirm = async () => {
        if (!deletePlanId) return;

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(`/api/v1/plans/${deletePlanId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            const result = await response.json();
            if (response.ok) {
                toast.success("تم حذف الخطة بنجاح ✅");
                refetch();
                setShowDeleteModal(false);
                setDeletePlanId(null);
            } else {
                toast.error(result.message || "فشل في الحذف");
            }
        } catch {
            toast.error("حدث خطأ في الحذف");
        }
    };

    const handleDelete = (id: number) => {
        setDeletePlanId(id);
        setShowDeleteModal(true);
    };

    const handleEdit = useCallback((plan: PlanType) => {
        setSelectedPlanId(plan.id);
        setShowUpdateModal(true);
    }, []);

    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedPlanId(null);
    }, []);

    const handleUpdateSuccess = useCallback(() => {
        toast.success("تم تحديث بيانات الخطة بنجاح! ✨");
        refetch();
        handleCloseUpdateModal();
    }, [refetch, handleCloseUpdateModal]);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleCreateSuccess = useCallback(() => {
        toast.success("تم إضافة الخطة بنجاح! 🎉");
        refetch();
        handleCloseCreateModal();
    }, [refetch, handleCloseCreateModal]);

    const handleAddNew = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || 0,
            active: plans.filter((p) => p.current_day && p.current_day > 0)
                .length,
            currentPage,
            totalPages: pagination?.last_page || 1,
        }),
        [pagination?.total, plans.length, currentPage, pagination?.last_page],
    );

    const getCenterName = useCallback((plan: PlanType) => {
        return plan.center?.name || `مركز #${plan.center_id}` || "غير محدد";
    }, []);

    const renderLogo = useCallback((name: string) => {
        const initials = name
            .split(" ")
            .slice(-2)
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
        return (
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white rounded-lg">
                {initials}
            </div>
        );
    }, []);

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < (pagination?.last_page || 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">جاري تحميل الخطط...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ✅ DeleteModal Component */}
            <DeleteModal
                show={showDeleteModal}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذه الخطة؟ هذا الإجراء لا يمكن التراجع عنه."
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletePlanId(null);
                }}
                onConfirm={handleDeleteConfirm}
                confirmText="حذف الخطة"
                showConfirm={true}
            />

            {showUpdateModal && selectedPlanId && (
                <UpdatePlanPage
                    planId={selectedPlanId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreatePlanPage
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon purpleColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي الخطط</h3>
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
                            <h3>نشطة حالياً</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.active}
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
                            <h3>خطط معتمدة</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.total}
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
                            <i>
                                <RiRobot2Fill />
                            </i>
                            كل خطة تحتوي على تفاصيل يومية للحفظ والمراجعة
                        </div>
                        <div className="plan__current">
                            <h2>قائمة الخطط</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالخطة أو المجمع..."
                                        value={search}
                                        onChange={handleSearch}
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    className="teacherStudent__status-btn add-btn p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium ml-3"
                                    onClick={handleAddNew}
                                    disabled={loading}
                                >
                                    <IoMdAdd
                                        size={20}
                                        className="inline mr-2"
                                    />
                                    خطة جديدة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>الشعار</th>
                                <th>اسم الخطة</th>
                                <th>المجمع</th>
                                <th>المدة</th>
                                <th>عدد الأيام</th>
                                <th>اليوم الحالي</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.length === 0 && !loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        لا يوجد خطط حالياً
                                    </td>
                                </tr>
                            ) : (
                                plans.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="plan__row active"
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                {renderLogo(item.plan_name)}
                                            </div>
                                        </td>
                                        <td>{item.plan_name}</td>
                                        <td>{getCenterName(item)}</td>
                                        <td>{item.total_months} شهر</td>
                                        <td>{item.details_count || 0}</td>
                                        <td>{item.current_day || "-"}</td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                    disabled={loading}
                                                    title="تعديل بيانات الخطة"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    disabled={loading}
                                                    title="حذف الخطة"
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
                                عرض {plans.length} من {pagination.total} خطة •
                                الصفحة <strong>{currentPage}</strong> من{" "}
                                <strong>{pagination.last_page}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={!hasPrev || loading}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                >
                                    السابق
                                </button>
                                <span className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold">
                                    {currentPage}
                                </span>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasNext || loading}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className="inputs__verifyOTPBirth"
                    style={{ width: "100%" }}
                >
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>معدل النشاط</h1>
                        </div>
                        <p>94%</p>
                        <div className="userProfile__progressBar">
                            <span style={{ width: "94%" }}></span>
                        </div>
                    </div>
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>عدد الخطط</h1>
                        </div>
                        <p>{plans.length}</p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{
                                    width: `${Math.min((plans.length / 50) * 100, 100)}%`,
                                }}
                            ></span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlansManagement;
