// StudentAchievementsManagement.tsx
import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { FiEdit3, FiTrash2, FiPlus } from "react-icons/fi";
import {
    useStudentAchievements,
    AchievementType,
} from "./hooks/useStudentAchievements";
import CreateAchievementModal from "./models/CreateAchievementModal";
import UpdateAchievementModal from "./models/UpdateAchievementModal";

const StudentAchievementsManagement: React.FC = () => {
    const {
        achievements = [],
        loading,
        pagination,
        currentPage,
        searchAchievements,
        goToPage,
        refetch,
        deleteAchievement,
    } = useStudentAchievements();

    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAchievementId, setSelectedAchievementId] = useState<
        number | null
    >(null);

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            searchAchievements(value);
        },
        [searchAchievements],
    );

    const handleEdit = useCallback((achievement: AchievementType) => {
        setSelectedAchievementId(achievement.id);
        setShowUpdateModal(true);
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا الإنجاز؟")) return;

        const success = await deleteAchievement(id);
        if (success) {
            refetch();
        }
    };

    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedAchievementId(null);
    }, []);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleAddNew = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || 0,
            positivePoints: achievements.filter((a) => a.points > 0).length,
            negativePoints: achievements.filter((a) => a.points < 0).length,
            topStudents: achievements.filter((a) => a.total_points >= 100)
                .length,
            currentPage,
            totalPages: pagination?.last_page || 1,
        }),
        [
            pagination?.total,
            achievements.length,
            currentPage,
            pagination?.last_page,
        ],
    );

    const getPointsStatus = useCallback((points: number) => {
        if (points > 0) return "إضافة";
        if (points < 0) return "خصم";
        return "محايد";
    }, []);

    const getStatusColor = useCallback((points: number) => {
        if (points > 0) return "bg-green-100 text-green-800";
        if (points < 0) return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-800";
    }, []);

    const renderAchievementBadges = useCallback(
        (achievements: Record<string, any>) => {
            return Object.entries(achievements).map(([key, value]) => (
                <span
                    key={key}
                    className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded mr-1"
                >
                    {key}: {String(value)}
                </span>
            ));
        },
        [],
    );

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < (pagination?.last_page || 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">جاري تحميل الإنجازات...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {showUpdateModal && selectedAchievementId && (
                <UpdateAchievementModal
                    achievementId={selectedAchievementId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={() => {
                        toast.success("تم تحديث الإنجاز بنجاح! ✨");
                        refetch();
                        handleCloseUpdateModal();
                    }}
                />
            )}

            {showCreateModal && (
                <CreateAchievementModal
                    onClose={handleCloseCreateModal}
                    onSuccess={() => {
                        toast.success("تم إضافة الإنجاز بنجاح! 🎉");
                        refetch();
                        handleCloseCreateModal();
                    }}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/* Stats Cards */}
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon purpleColor">
                            <i>
                                <RiRobot2Fill />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي الإنجازات</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>نقاط إيجابية</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.positivePoints}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GrStatusCritical />
                            </i>
                        </div>
                        <div>
                            <h3>نقاط سالبة</h3>
                            <p className="text-2xl font-bold text-red-600">
                                {stats.negativePoints}
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
                            <h3>طلاب مميزون</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.topStudents}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Header & Search */}
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            إنجازات طلاب مجمعك
                        </div>
                        <div className="plan__current">
                            <h2>جدول الإنجازات</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالطالب أو السبب..."
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
                                    <FiPlus size={20} className="inline mr-2" />
                                    إنجاز جديد
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
                                <th>الطالب</th>
                                <th>النقاط</th>
                                <th>النوع</th>
                                <th>إجمالي النقاط</th>
                                <th>الإنجازات</th>
                                <th>السبب</th>
                                <th>التاريخ</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {achievements.length === 0 && !loading ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        لا يوجد إنجازات حالياً
                                    </td>
                                </tr>
                            ) : (
                                achievements.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="plan__row active"
                                    >
                                        <td>
                                            <div className="font-medium">
                                                {item.user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {item.user.email}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(item.points)}`}
                                            >
                                                {item.points} (
                                                {getPointsStatus(item.points)})
                                            </span>
                                        </td>
                                        <td>
                                            {item.achievement_type || "عام"}
                                        </td>
                                        <td className="font-bold text-lg">
                                            {item.total_points}
                                            {item.total_points >= 100 && " ⭐"}
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {renderAchievementBadges(
                                                    item.achievements,
                                                )}
                                            </div>
                                        </td>
                                        <td
                                            className="max-w-xs truncate"
                                            title={item.reason}
                                        >
                                            {item.reason}
                                        </td>
                                        <td>{item.created_at_formatted}</td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                    disabled={loading}
                                                    title="تعديل الإنجاز"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    disabled={loading}
                                                    title="حذف الإنجاز"
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
                                عرض {achievements.length} من {pagination.total}{" "}
                                إنجاز • الصفحة <strong>{currentPage}</strong> من{" "}
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
            </div>
        </>
    );
};

export default StudentAchievementsManagement;
