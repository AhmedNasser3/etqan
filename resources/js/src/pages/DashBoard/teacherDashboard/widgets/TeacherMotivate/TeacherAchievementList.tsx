import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import {
    useTeacherAchievements,
    AchievementType,
} from "./hooks/useTeacherAchievements";
import TeacherCreateAchievementModal from "./models/TeacherCreateAchievementModal";
import TeacherUpdateAchievementModal from "./models/TeacherUpdateAchievementModal";

const TeacherAchievementsManagement: React.FC = () => {
    const {
        achievements = [],
        loading,
        pagination,
        currentPage,
        searchAchievements,
        goToPage,
        refetch,
        deleteAchievement,
    } = useTeacherAchievements();

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

    const handleDelete = useCallback(
        async (id: number) => {
            const success = await deleteAchievement(id);
            if (success) {
                refetch();
            }
        },
        [deleteAchievement, refetch],
    );

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

    const getPointsStatus = useCallback((points: number) => {
        if (points > 0) return "إضافة";
        if (points < 0) return "خصم";
        return "محايد";
    }, []);

    const getPointsStyle = useCallback(
        (points: number): React.CSSProperties => {
            if (points > 0) return { background: "#dcfce7", color: "#15803d" };
            if (points < 0) return { background: "#fee2e2", color: "#ef4444" };
            return {
                background: "var(--color-background-secondary)",
                color: "var(--color-text-secondary)",
            };
        },
        [],
    );

    const renderAchievementBadges = useCallback(
        (achievements: Record<string, any>) => {
            return Object.entries(achievements).map(([key, value]) => (
                <span
                    key={key}
                    style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        background: "#ede9fe",
                        color: "#6d28d9",
                        fontSize: 11,
                        borderRadius: 999,
                        marginLeft: 4,
                        marginBottom: 2,
                        fontWeight: 500,
                    }}
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
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">إدارة الإنجازات</div>
                    </div>
                    <div style={{ padding: "60px 0", textAlign: "center" }}>
                        <div className="navbar__loading">
                            <div className="loading-spinner">
                                <div className="spinner-circle"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Update Modal */}
            {showUpdateModal && selectedAchievementId && (
                <TeacherUpdateAchievementModal
                    achievementId={selectedAchievementId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={() => {
                        refetch();
                        handleCloseUpdateModal();
                    }}
                />
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <TeacherCreateAchievementModal
                    onClose={handleCloseCreateModal}
                    onSuccess={() => {
                        refetch();
                        handleCloseCreateModal();
                    }}
                />
            )}

            <div className="content" id="contentArea">
                <div className="widget">
                    {/* Header */}
                    <div className="wh">
                        <div className="wh-l">إدارة الإنجازات</div>
                        <div className="flx">
                            <input
                                className="fi"
                                style={{ margin: "0 6px" }}
                                placeholder="البحث بالطالب أو السبب..."
                                value={search}
                                onChange={handleSearch}
                                disabled={loading}
                            />
                            <button
                                className="btn bp bsm"
                                onClick={handleAddNew}
                                disabled={loading}
                            >
                                + إنجاز جديد
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: "auto" }}>
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
                                        <td colSpan={8}>
                                            <div className="empty">
                                                <p>لا يوجد إنجازات حالياً</p>
                                                <button
                                                    className="btn bp bsm"
                                                    onClick={handleAddNew}
                                                >
                                                    إضافة إنجاز
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    achievements.map((item) => (
                                        <tr key={item.id}>
                                            {/* الطالب */}
                                            <td>
                                                <div
                                                    style={{
                                                        fontWeight: 500,
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {item.user.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--color-text-secondary)",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {item.user.email}
                                                </div>
                                            </td>

                                            {/* النقاط */}
                                            <td>
                                                <span
                                                    style={{
                                                        ...getPointsStyle(
                                                            item.points,
                                                        ),
                                                        fontSize: 12,
                                                        padding: "3px 10px",
                                                        borderRadius: 999,
                                                        display: "inline-block",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {item.points} (
                                                    {getPointsStatus(
                                                        item.points,
                                                    )}
                                                    )
                                                </span>
                                            </td>

                                            {/* النوع */}
                                            <td
                                                style={{
                                                    fontSize: 13,
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {item.achievement_type || "عام"}
                                            </td>

                                            {/* إجمالي النقاط */}
                                            <td
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {item.total_points}
                                                {item.total_points >= 100 &&
                                                    " ⭐"}
                                            </td>

                                            {/* الإنجازات */}
                                            <td>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: 2,
                                                    }}
                                                >
                                                    {renderAchievementBadges(
                                                        item.achievements,
                                                    )}
                                                </div>
                                            </td>

                                            {/* السبب */}
                                            <td
                                                style={{
                                                    maxWidth: 160,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    fontSize: 13,
                                                    color: "var(--color-text-secondary)",
                                                }}
                                                title={item.reason}
                                            >
                                                {item.reason}
                                            </td>

                                            {/* التاريخ */}
                                            <td
                                                style={{
                                                    fontSize: 13,
                                                    color: "var(--color-text-secondary)",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {item.created_at_formatted}
                                            </td>

                                            {/* الإجراءات */}
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id,
                                                            )
                                                        }
                                                        disabled={loading}
                                                        title="حذف"
                                                    >
                                                        <FiTrash2
                                                            style={{
                                                                width: 13,
                                                                height: 13,
                                                            }}
                                                        />
                                                    </button>
                                                    <button
                                                        className="btn bs bxs"
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                        disabled={loading}
                                                        title="تعديل"
                                                    >
                                                        <FiEdit3
                                                            style={{
                                                                width: 13,
                                                                height: 13,
                                                            }}
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
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "14px 18px",
                                borderTop:
                                    "0.5px solid var(--color-border-tertiary)",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 13,
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                عرض {achievements.length} من {pagination.total}{" "}
                                إنجاز • الصفحة <strong>{currentPage}</strong> من{" "}
                                <strong>{pagination.last_page}</strong>
                            </span>
                            <div className="flx" style={{ gap: 6 }}>
                                <button
                                    className="btn bs bsm"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={!hasPrev || loading}
                                >
                                    السابق
                                </button>
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: 30,
                                        padding: "0 12px",
                                        background: "#7c3aed",
                                        color: "#fff",
                                        borderRadius: "var(--border-radius-md)",
                                        fontSize: 13,
                                        fontWeight: 500,
                                    }}
                                >
                                    {currentPage}
                                </span>
                                <button
                                    className="btn bs bsm"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasNext || loading}
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TeacherAchievementsManagement;
