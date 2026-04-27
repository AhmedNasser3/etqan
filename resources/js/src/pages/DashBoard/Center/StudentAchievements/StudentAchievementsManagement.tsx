// StudentAchievementsManagement.tsx
import React, { useState } from "react";
import {
    useStudentAchievements,
    StudentRow,
} from "./hooks/useStudentAchievements";
import { useToast } from "../../../../../contexts/ToastContext";
import { ICO } from "../../icons";

type PointsAction = "added" | "deducted";

interface BulkForm {
    points: number;
    points_action: PointsAction;
    reason: string;
}

interface SingleForm {
    student: StudentRow | null;
    points: number;
    points_action: PointsAction;
    reason: string;
}

const StudentAchievementsManagement: React.FC = () => {
    const {
        students,
        loading,
        pagination,
        currentPage,
        search,
        setSearch,
        goToPage,
        addPoints,
        addPointsBulk,
    } = useStudentAchievements();

    const { notifySuccess, notifyError } = useToast();

    // Checkboxes
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // مودال إضافة لطالب واحد
    const [singleModal, setSingleModal] = useState<SingleForm>({
        student: null,
        points: 10,
        points_action: "added",
        reason: "",
    });
    const [showSingle, setShowSingle] = useState(false);

    // مودال إضافة جماعية
    const [bulkForm, setBulkForm] = useState<BulkForm>({
        points: 10,
        points_action: "added",
        reason: "",
    });
    const [showBulk, setShowBulk] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // تحديد / إلغاء الكل
    const allSelected =
        students.length > 0 && selectedIds.length === students.length;

    const toggleAll = () => {
        setSelectedIds(allSelected ? [] : students.map((s) => s.id));
    };

    const toggleOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    // فتح مودال طالب واحد
    const openSingle = (student: StudentRow) => {
        setSingleModal({
            student,
            points: 10,
            points_action: "added",
            reason: "",
        });
        setShowSingle(true);
    };

    // تقديم نقاط لطالب واحد
    const submitSingle = async () => {
        if (!singleModal.student) return;
        if (!singleModal.reason.trim()) {
            notifyError("أدخل السبب");
            return;
        }
        setSubmitting(true);
        try {
            await addPoints({
                user_id: singleModal.student.id,
                points: singleModal.points,
                points_action: singleModal.points_action,
                reason: singleModal.reason,
            });
            notifySuccess("تم تحديث النقاط ✅");
            setShowSingle(false);
        } catch {
            notifyError("فشل في تحديث النقاط");
        } finally {
            setSubmitting(false);
        }
    };

    // تقديم نقاط جماعية
    const submitBulk = async () => {
        if (selectedIds.length === 0) {
            notifyError("اختر طلاباً أولاً");
            return;
        }
        if (!bulkForm.reason.trim()) {
            notifyError("أدخل السبب");
            return;
        }
        setSubmitting(true);
        try {
            const res = await addPointsBulk({
                user_ids: selectedIds,
                points: bulkForm.points,
                points_action: bulkForm.points_action,
                reason: bulkForm.reason,
            });
            notifySuccess(res.message || "تم تحديث النقاط ✅");
            setSelectedIds([]);
            setShowBulk(false);
        } catch {
            notifyError("فشل في تحديث النقاط");
        } finally {
            setSubmitting(false);
        }
    };

    const getPointsColor = (pts: number) =>
        pts > 0
            ? { color: "#166534", background: "#dcfce7" }
            : pts < 0
              ? { color: "#991b1b", background: "#fee2e2" }
              : { color: "#6b7280", background: "#f3f4f6" };

    if (loading && students.length === 0) {
        return (
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                        <p>جاري تحميل الطلاب...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ── مودال طالب واحد ── */}
            {showSingle && singleModal.student && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="conf-box" style={{ minWidth: 340 }}>
                        <div className="conf-t">
                            تعديل نقاط: {singleModal.student.name}
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "var(--n500)",
                                marginBottom: 12,
                            }}
                        >
                            النقاط الحالية:{" "}
                            <strong>{singleModal.student.total_points}</strong>
                        </div>

                        {/* نوع العملية */}
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                marginBottom: 12,
                            }}
                        >
                            {(["added", "deducted"] as PointsAction[]).map(
                                (action) => (
                                    <button
                                        key={action}
                                        className={`btn ${singleModal.points_action === action ? "bp" : "bs"}`}
                                        style={{ flex: 1 }}
                                        onClick={() =>
                                            setSingleModal((p) => ({
                                                ...p,
                                                points_action: action,
                                            }))
                                        }
                                    >
                                        {action === "added"
                                            ? "➕ إضافة"
                                            : "➖ خصم"}
                                    </button>
                                ),
                            )}
                        </div>

                        {/* عدد النقاط */}
                        <div style={{ marginBottom: 12 }}>
                            <label
                                style={{
                                    fontSize: 13,
                                    display: "block",
                                    marginBottom: 4,
                                }}
                            >
                                عدد النقاط
                            </label>
                            <input
                                className="fi"
                                type="number"
                                min={1}
                                value={singleModal.points}
                                onChange={(e) =>
                                    setSingleModal((p) => ({
                                        ...p,
                                        points: Math.max(
                                            1,
                                            Number(e.target.value),
                                        ),
                                    }))
                                }
                            />
                        </div>

                        {/* السبب */}
                        <div style={{ marginBottom: 16 }}>
                            <label
                                style={{
                                    fontSize: 13,
                                    display: "block",
                                    marginBottom: 4,
                                }}
                            >
                                السبب
                            </label>
                            <input
                                className="fi"
                                placeholder="سبب الإضافة أو الخصم..."
                                value={singleModal.reason}
                                onChange={(e) =>
                                    setSingleModal((p) => ({
                                        ...p,
                                        reason: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="conf-acts">
                            <button
                                className="btn bp"
                                onClick={submitSingle}
                                disabled={submitting}
                            >
                                {submitting ? "جاري..." : "تأكيد"}
                            </button>
                            <button
                                className="btn bs"
                                onClick={() => setShowSingle(false)}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── مودال جماعي ── */}
            {showBulk && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="conf-box" style={{ minWidth: 340 }}>
                        <div className="conf-t">
                            إضافة نقاط لـ {selectedIds.length} طالب
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                marginBottom: 12,
                            }}
                        >
                            {(["added", "deducted"] as PointsAction[]).map(
                                (action) => (
                                    <button
                                        key={action}
                                        className={`btn ${bulkForm.points_action === action ? "bp" : "bs"}`}
                                        style={{ flex: 1 }}
                                        onClick={() =>
                                            setBulkForm((p) => ({
                                                ...p,
                                                points_action: action,
                                            }))
                                        }
                                    >
                                        {action === "added"
                                            ? "➕ إضافة"
                                            : "➖ خصم"}
                                    </button>
                                ),
                            )}
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label
                                style={{
                                    fontSize: 13,
                                    display: "block",
                                    marginBottom: 4,
                                }}
                            >
                                عدد النقاط
                            </label>
                            <input
                                className="fi"
                                type="number"
                                min={1}
                                value={bulkForm.points}
                                onChange={(e) =>
                                    setBulkForm((p) => ({
                                        ...p,
                                        points: Math.max(
                                            1,
                                            Number(e.target.value),
                                        ),
                                    }))
                                }
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label
                                style={{
                                    fontSize: 13,
                                    display: "block",
                                    marginBottom: 4,
                                }}
                            >
                                السبب
                            </label>
                            <input
                                className="fi"
                                placeholder="سبب الإضافة أو الخصم..."
                                value={bulkForm.reason}
                                onChange={(e) =>
                                    setBulkForm((p) => ({
                                        ...p,
                                        reason: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="conf-acts">
                            <button
                                className="btn bp"
                                onClick={submitBulk}
                                disabled={submitting}
                            >
                                {submitting
                                    ? "جاري..."
                                    : `تأكيد (${selectedIds.length} طالب)`}
                            </button>
                            <button
                                className="btn bs"
                                onClick={() => setShowBulk(false)}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── المحتوى الرئيسي ── */}
            <div className="content" id="contentArea">
                <div className="widget">
                    {/* Header */}
                    <div className="wh">
                        <div className="wh-l">
                            نقاط الطلاب ({pagination?.total ?? students.length}{" "}
                            طالب)
                        </div>
                        <div className="flx" style={{ gap: 8 }}>
                            <input
                                className="fi"
                                style={{ margin: 0 }}
                                placeholder="بحث بالاسم أو الإيميل..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {selectedIds.length > 0 && (
                                <button
                                    className="btn bp bsm"
                                    onClick={() => setShowBulk(true)}
                                >
                                    ➕ نقاط للمحددين ({selectedIds.length})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>
                                        {/* تحديد الكل */}
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            title="تحديد الكل"
                                        />
                                    </th>
                                    <th>الطالب</th>
                                    <th>إجمالي النقاط</th>
                                    <th>مضافة</th>
                                    <th>مخصومة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr
                                            key={student.id}
                                            style={
                                                selectedIds.includes(student.id)
                                                    ? {
                                                          background:
                                                              "var(--p50, #f5f3ff)",
                                                      }
                                                    : {}
                                            }
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(
                                                        student.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleOne(student.id)
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <div
                                                    style={{ fontWeight: 700 }}
                                                >
                                                    {student.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--n500)",
                                                    }}
                                                >
                                                    {student.email}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        ...getPointsColor(
                                                            student.total_points,
                                                        ),
                                                        fontWeight: 700,
                                                        fontSize: 15,
                                                    }}
                                                >
                                                    {student.total_points}
                                                    {student.total_points >=
                                                        100 && " ⭐"}
                                                </span>
                                            </td>
                                            <td style={{ color: "#166534" }}>
                                                +{student.added_points}
                                            </td>
                                            <td style={{ color: "#991b1b" }}>
                                                -{student.deducted_points}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn bs bxs"
                                                    onClick={() =>
                                                        openSingle(student)
                                                    }
                                                >
                                                    تعديل النقاط
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : !loading ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="empty">
                                                <p>
                                                    {search
                                                        ? "لا توجد نتائج"
                                                        : "لا يوجد طلاب"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="pagination">
                            <div className="flex justify-between items-center p-4 bg-n100 rounded-lg mt-4">
                                <div
                                    className="text-sm"
                                    style={{ color: "var(--n600)" }}
                                >
                                    الصفحة <strong>{currentPage}</strong> من{" "}
                                    <strong>{pagination.last_page}</strong> •{" "}
                                    <strong>{pagination.total}</strong> طالب
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="btn bs"
                                        onClick={() =>
                                            goToPage(currentPage - 1)
                                        }
                                        disabled={currentPage <= 1 || loading}
                                    >
                                        السابق
                                    </button>
                                    <span className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold">
                                        {currentPage}
                                    </span>
                                    <button
                                        className="btn bs"
                                        onClick={() =>
                                            goToPage(currentPage + 1)
                                        }
                                        disabled={
                                            currentPage >=
                                                pagination.last_page || loading
                                        }
                                    >
                                        التالي
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentAchievementsManagement;
