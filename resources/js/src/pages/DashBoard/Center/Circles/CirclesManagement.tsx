import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import CreateCirclePage from "./models/CreateCirclePage";
import UpdateCirclePage from "./models/UpdateCirclePage";
import ModalNotification from "./components/ModalNotification";
import { useCircles } from "./hooks/useCircles";

interface CircleType {
    id: number;
    name: string;
    center: { id: number; name: string };
    center_id: number;
    mosque?: { id: number; name: string } | null;
    mosque_id?: number | null;
    teacher?: { id: number; name: string } | null;
    teacher_id?: number | null;
    created_at: string;
    updated_at: string;
}

const CirclesManagement: React.FC = () => {
    const {
        circles,
        loading,
        pagination,
        currentPage,
        searchCircles,
        goToPage,
        refetch,
    } = useCircles();

    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const [selectedCircleId, setSelectedCircleId] = useState<number | null>(
        null,
    );

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            searchCircles(value);
        },
        [searchCircles],
    );

    const handleEdit = useCallback((circle: CircleType) => {
        setSelectedCircleId(circle.id);
        setShowUpdateModal(true);
    }, []);

    const handleDelete = async (id: number) => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(`/api/v1/centers/circles/${id}`, {
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
                toast.success("تم حذف الحلقة بنجاح ✅");
                refetch();
            } else {
                toast.error(result.message || "فشل في الحذف");
            }
        } catch {
            toast.error("حدث خطأ في الحذف");
        }
    };

    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedCircleId(null);
    }, []);

    const handleUpdateSuccess = useCallback(() => {
        toast.success("تم تحديث بيانات الحلقة بنجاح! ✨");
        refetch();
        handleCloseUpdateModal();
    }, [refetch, handleCloseUpdateModal]);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleCreateSuccess = useCallback(() => {
        refetch();
        handleCloseCreateModal();
    }, [refetch, handleCloseCreateModal]);

    const handleAddNew = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleDeleteClick = useCallback((id: number) => {
        setSelectedCircleId(id);
        setIsDeleteConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (selectedCircleId) {
            handleDelete(selectedCircleId);
            setIsDeleteConfirm(false);
            setSelectedCircleId(null);
        }
    }, [selectedCircleId, handleDelete]);

    const stats = {
        total: pagination?.total || 0,
        active: circles.filter((c) => c.mosque_id !== null).length,
        currentPage,
        totalPages: pagination?.last_page || 1,
    };

    const renderLogo = (name: string) => {
        const initials = name
            .split(" ")
            .slice(-2)
            .map((n) => n[0])
            .join("")
            .slice(0, 2);
        return (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white rounded-lg">
                {initials}
            </div>
        );
    };

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < (pagination?.last_page || 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">جاري تحميل الحلقات...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {showUpdateModal && selectedCircleId && (
                <UpdateCirclePage
                    circleId={selectedCircleId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreateCirclePage
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
                />
            )}

            <ModalNotification
                show={isDeleteConfirm}
                title="هل أنت متأكد؟"
                message="هل أنت متأكد من حذف هذه الحلقة؟ هذا الإجراء لا يمكن التراجع عنه."
                onClose={() => setIsDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                confirmText="نعم، احذفها"
                showConfirm={true}
            />

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي الحلقات</h3>
                            <p className="text-2xl font-bold text-red-600">
                                {stats.total}
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
                            <h3>نشطة</h3>
                            <p className="text-2xl font-bold text-yellow-600">
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
                            <h3>حلقات معتمدة</h3>
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
                            الحلقات الجديدة تخضع لمراجعة المشرف قبل الاعتماد
                            الرسمي
                        </div>
                        <div className="plan__current">
                            <h2>قائمة الحلقات</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالحلقة أو المجمع أو المسجد أو المعلم..."
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
                                    حلقة جديدة
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
                                <th>اسم الحلقة</th>
                                <th>المجمع</th>
                                <th>المسجد</th>
                                <th>المعلم</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {circles.map((item) => (
                                <tr key={item.id} className="plan__row active">
                                    <td className="teacherStudent__img">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                                            {renderLogo(item.name)}
                                        </div>
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.center.name}</td>
                                    <td>{item.mosque?.name || "-"}</td>
                                    <td>{item.teacher?.name || "-"}</td>
                                    <td>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            نشطة
                                        </span>
                                    </td>
                                    <td>
                                        <div className="teacherStudent__btns">
                                            <button
                                                className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                onClick={() => handleEdit(item)}
                                                disabled={loading}
                                                title="تعديل بيانات الحلقة"
                                            >
                                                <FiEdit3 />
                                            </button>
                                            <button
                                                className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                onClick={() =>
                                                    handleDeleteClick(item.id)
                                                }
                                                disabled={loading}
                                                title="حذف الحلقة"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {circles.length === 0 && !loading && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        لا يوجد حلقات حالياً
                                    </td>
                                </tr>
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
                                عرض {circles.length} من {pagination.total} حلقة
                                • الصفحة <strong>{currentPage}</strong> من{" "}
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
                                <span className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold">
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
                            <h1>عدد الحلقات</h1>
                        </div>
                        <p>{circles.length}</p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{
                                    width: `${Math.min((circles.length / 50) * 100, 100)}%`,
                                }}
                            ></span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CirclesManagement;
