// StudentAchievementsManagement.tsx — نسخة مُعاد تصميمها
import React, { useState, useMemo } from "react";
import {
    useStudentAchievements,
    StudentRow,
} from "./hooks/useStudentAchievements";
import { useToast } from "../../../../../contexts/ToastContext";
import {
    FiSearch,
    FiX,
    FiGrid,
    FiList,
    FiRotateCcw,
    FiTrash2,
    FiPlus,
    FiMinus,
} from "react-icons/fi";

type PointsAction = "added" | "deducted";
type ViewMode = "table" | "cards";

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

const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

const Avatar = ({ name, idx }: { name: string; idx: number }) => {
    const av = AV_COLORS[idx % AV_COLORS.length];
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
    return (
        <div
            style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: av.bg,
                color: av.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
                fontFamily: "'Tajawal',sans-serif",
            }}
        >
            {initials}
        </div>
    );
};

const PointsBadge = ({ points }: { points: number }) => {
    const positive = points > 0;
    const zero = points === 0;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: zero ? "#f1f5f9" : positive ? "#dcfce7" : "#fee2e2",
                color: zero ? "#64748b" : positive ? "#15803d" : "#b91c1c",
                border: `1px solid ${zero ? "#e2e8f0" : positive ? "#bbf7d0" : "#fecaca"}`,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
            }}
        >
            {positive ? "+" : ""}
            {points}
            {points >= 100 && " ⭐"}
        </span>
    );
};

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

    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    /* Single modal */
    const [singleModal, setSingleModal] = useState<SingleForm>({
        student: null,
        points: 10,
        points_action: "added",
        reason: "",
    });
    const [showSingle, setShowSingle] = useState(false);
    const [submittingSingle, setSubmittingSingle] = useState(false);

    /* Bulk modal */
    const [bulkForm, setBulkForm] = useState<BulkForm>({
        points: 10,
        points_action: "added",
        reason: "",
    });
    const [showBulk, setShowBulk] = useState(false);
    const [submittingBulk, setSubmittingBulk] = useState(false);

    /* Stats */
    const totalPoints = students.reduce((a, s) => a + s.total_points, 0);
    const topStudent = students.reduce(
        (top, s) => (!top || s.total_points > top.total_points ? s : top),
        null as StudentRow | null,
    );
    const avgPoints = students.length
        ? Math.round(totalPoints / students.length)
        : 0;

    /* Bulk select */
    const allSelected =
        students.length > 0 && selectedIds.length === students.length;
    const toggleAll = () =>
        setSelectedIds(allSelected ? [] : students.map((s) => s.id));
    const toggleOne = (id: number) =>
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );

    const openSingle = (student: StudentRow) => {
        setSingleModal({
            student,
            points: 10,
            points_action: "added",
            reason: "",
        });
        setShowSingle(true);
    };

    const submitSingle = async () => {
        if (!singleModal.student) return;
        if (!singleModal.reason.trim()) {
            notifyError("أدخل السبب");
            return;
        }
        setSubmittingSingle(true);
        try {
            await addPoints({
                user_id: singleModal.student.id,
                points: singleModal.points,
                points_action: singleModal.points_action,
                reason: singleModal.reason,
            });
            notifySuccess("تم تحديث النقاط");
            setShowSingle(false);
        } catch {
            notifyError("فشل في تحديث النقاط");
        } finally {
            setSubmittingSingle(false);
        }
    };

    const submitBulk = async () => {
        if (selectedIds.length === 0) {
            notifyError("اختر طلاباً أولاً");
            return;
        }
        if (!bulkForm.reason.trim()) {
            notifyError("أدخل السبب");
            return;
        }
        setSubmittingBulk(true);
        try {
            const res = await addPointsBulk({
                user_ids: selectedIds,
                ...bulkForm,
            });
            notifySuccess(res.message || "تم تحديث النقاط");
            setSelectedIds([]);
            setShowBulk(false);
        } catch {
            notifyError("فشل في تحديث النقاط");
        } finally {
            setSubmittingBulk(false);
        }
    };

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < (pagination?.last_page || 1);

    const TH: React.CSSProperties = {
        padding: "10px 16px",
        textAlign: "right",
        color: "#64748b",
        fontWeight: 700,
        fontSize: 11,
        whiteSpace: "nowrap",
        borderBottom: "1px solid #f1f5f9",
        background: "#f8fafc",
    };
    const TD: React.CSSProperties = {
        padding: "13px 16px",
        borderBottom: "1px solid #f8fafc",
        verticalAlign: "middle",
        fontSize: 13,
        color: "#1e293b",
    };

    /* ── Points Modal shared UI ── */
    const PointsModalBody = ({
        title,
        currentPts,
        form,
        setForm,
        onSubmit,
        onClose,
        submitting,
    }: {
        title: string;
        currentPts?: number;
        form: { points: number; points_action: PointsAction; reason: string };
        setForm: (fn: (p: any) => any) => void;
        onSubmit: () => void;
        onClose: () => void;
        submitting: boolean;
    }) => (
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
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: "32px 28px",
                    maxWidth: 440,
                    width: "90%",
                    boxShadow: "0 20px 60px #0003",
                }}
            >
                <div
                    style={{
                        fontSize: 17,
                        fontWeight: 900,
                        color: "#1e293b",
                        marginBottom: currentPts !== undefined ? 4 : 20,
                    }}
                >
                    {title}
                </div>
                {currentPts !== undefined && (
                    <div
                        style={{
                            fontSize: 13,
                            color: "#64748b",
                            marginBottom: 16,
                        }}
                    >
                        النقاط الحالية: <PointsBadge points={currentPts} />
                    </div>
                )}

                {/* action toggle */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {(["added", "deducted"] as PointsAction[]).map((action) => (
                        <button
                            key={action}
                            onClick={() =>
                                setForm((p: any) => ({
                                    ...p,
                                    points_action: action,
                                }))
                            }
                            style={{
                                flex: 1,
                                padding: "9px 0",
                                borderRadius: 10,
                                border: `2px solid ${form.points_action === action ? (action === "added" ? "#0f6e56" : "#dc2626") : "#e2e8f0"}`,
                                background:
                                    form.points_action === action
                                        ? action === "added"
                                            ? "#f0fdf4"
                                            : "#fef2f2"
                                        : "#f8fafc",
                                color:
                                    form.points_action === action
                                        ? action === "added"
                                            ? "#0f6e56"
                                            : "#dc2626"
                                        : "#64748b",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 700,
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                            }}
                        >
                            {action === "added" ? (
                                <>
                                    <FiPlus size={13} /> إضافة نقاط
                                </>
                            ) : (
                                <>
                                    <FiMinus size={13} /> خصم نقاط
                                </>
                            )}
                        </button>
                    ))}
                </div>

                {/* points input */}
                <div style={{ marginBottom: 14 }}>
                    <label
                        style={{
                            fontSize: 12,
                            color: "#64748b",
                            display: "block",
                            marginBottom: 5,
                            fontWeight: 700,
                        }}
                    >
                        عدد النقاط
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={form.points}
                        onChange={(e) =>
                            setForm((p: any) => ({
                                ...p,
                                points: Math.max(1, Number(e.target.value)),
                            }))
                        }
                        style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            fontSize: 13,
                            fontFamily: "inherit",
                            outline: "none",
                            boxSizing: "border-box" as const,
                        }}
                    />
                </div>

                {/* reason */}
                <div style={{ marginBottom: 20 }}>
                    <label
                        style={{
                            fontSize: 12,
                            color: "#64748b",
                            display: "block",
                            marginBottom: 5,
                            fontWeight: 700,
                        }}
                    >
                        السبب *
                    </label>
                    <input
                        placeholder="سبب الإضافة أو الخصم..."
                        value={form.reason}
                        onChange={(e) =>
                            setForm((p: any) => ({
                                ...p,
                                reason: e.target.value,
                            }))
                        }
                        style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            fontSize: 13,
                            fontFamily: "inherit",
                            outline: "none",
                            boxSizing: "border-box" as const,
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={onSubmit}
                        disabled={submitting}
                        style={{
                            flex: 1,
                            padding: "9px 0",
                            borderRadius: 10,
                            border: "none",
                            background:
                                form.points_action === "added"
                                    ? "#0f6e56"
                                    : "#dc2626",
                            color: "#fff",
                            cursor: submitting ? "not-allowed" : "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "inherit",
                            opacity: submitting ? 0.7 : 1,
                        }}
                    >
                        {submitting ? "جاري..." : "تأكيد"}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "9px 20px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            color: "#64748b",
                            cursor: "pointer",
                            fontSize: 13,
                            fontFamily: "inherit",
                        }}
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading && students.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 400,
                    gap: 14,
                    fontFamily: "'Tajawal',sans-serif",
                }}
            >
                <div
                    style={{
                        width: 44,
                        height: 44,
                        border: "4px solid #dbeafe",
                        borderTopColor: "#2563eb",
                        borderRadius: "50%",
                        animation: "sam-spin 0.8s linear infinite",
                    }}
                />
                <span style={{ color: "#64748b", fontSize: 14 }}>
                    جاري تحميل الطلاب...
                </span>
                <style>{`@keyframes sam-spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <div
            style={{
                fontFamily: "'Tajawal',sans-serif",
                direction: "rtl",
                background: "#f8fafc",
                minHeight: "100vh",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            {/* Single Modal */}
            {showSingle && singleModal.student && (
                <PointsModalBody
                    title={`تعديل نقاط: ${singleModal.student.name}`}
                    currentPts={singleModal.student.total_points}
                    form={singleModal}
                    setForm={setSingleModal as any}
                    onSubmit={submitSingle}
                    onClose={() => setShowSingle(false)}
                    submitting={submittingSingle}
                />
            )}

            {/* Bulk Modal */}
            {showBulk && (
                <PointsModalBody
                    title={`إضافة نقاط لـ ${selectedIds.length} طالب`}
                    form={bulkForm}
                    setForm={setBulkForm as any}
                    onSubmit={submitBulk}
                    onClose={() => setShowBulk(false)}
                    submitting={submittingBulk}
                />
            )}

            {/* ══════════════════════════════
                HERO HEADER
            ══════════════════════════════ */}
            <div
                style={{
                    background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                    borderRadius: 24,
                    padding: "28px 32px",
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.05,
                        backgroundImage:
                            "radial-gradient(circle at 20% 50%,#fff 1px,transparent 1px)",
                        backgroundSize: "24px 24px",
                        pointerEvents: "none",
                    }}
                />
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 16,
                            marginBottom: 22,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#86efac",
                                    marginBottom: 4,
                                    letterSpacing: ".5px",
                                }}
                            >
                                ﷽ — منصة إتقان
                            </div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: 22,
                                    fontWeight: 900,
                                }}
                            >
                                نقاط الطلاب
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                إدارة نقاط الطلاب وإضافتها أو خصمها بشكل فردي أو
                                جماعي
                            </p>
                        </div>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => setShowBulk(true)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "7px 14px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,.2)",
                                    background: "rgba(255,255,255,.12)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                <FiPlus size={12} /> نقاط للمحددين (
                                {selectedIds.length})
                            </button>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            {
                                label: "إجمالي الطلاب",
                                value: pagination?.total ?? students.length,
                                color: "#4ade80",
                            },
                            {
                                label: "مجموع النقاط",
                                value: totalPoints,
                                color: "#fbbf24",
                            },
                            {
                                label: "متوسط النقاط",
                                value: avgPoints,
                                color: "#38bdf8",
                            },
                            {
                                label: "الأعلى نقاطاً",
                                value: topStudent ? topStudent.total_points : 0,
                                color: "#f472b6",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                style={{
                                    background: "rgba(255,255,255,.07)",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    textAlign: "center",
                                    minWidth: 88,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 900,
                                        color: s.color,
                                        lineHeight: 1,
                                    }}
                                >
                                    {s.value}
                                </div>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "rgba(255,255,255,.45)",
                                        marginTop: 3,
                                    }}
                                >
                                    {s.label}
                                </div>
                            </div>
                        ))}
                        <div
                            style={{
                                flex: 1,
                                minWidth: 180,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                gap: 6,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "rgba(255,255,255,.5)",
                                }}
                            >
                                {topStudent
                                    ? `الأعلى: ${topStudent.name}`
                                    : "لا يوجد طلاب"}
                            </div>
                            <div
                                style={{
                                    height: 8,
                                    background: "rgba(255,255,255,.1)",
                                    borderRadius: 4,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width:
                                            topStudent &&
                                            topStudent.total_points > 0
                                                ? `${Math.min(100, (avgPoints / topStudent.total_points) * 100)}%`
                                                : "0%",
                                        background:
                                            "linear-gradient(90deg,#4ade80,#22d3ee)",
                                        borderRadius: 4,
                                        transition: "width .6s ease",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════
                TABLE / CARDS
            ══════════════════════════════ */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    boxShadow: "0 2px 14px #0001",
                    overflow: "hidden",
                }}
            >
                {/* header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        flexWrap: "wrap",
                        gap: 10,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontWeight: 900,
                                fontSize: 15,
                                color: "#1e293b",
                            }}
                        >
                            نقاط الطلاب
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#94a3b8",
                                    fontWeight: 400,
                                    marginRight: 6,
                                }}
                            >
                                ({pagination?.total ?? students.length} طالب)
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            عرض {students.length} طالب في الصفحة الحالية
                        </div>
                    </div>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => setShowBulk(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 16px",
                                borderRadius: 10,
                                border: "none",
                                background: "#0f6e56",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiPlus size={14} /> نقاط للمحددين (
                            {selectedIds.length})
                        </button>
                    )}
                </div>

                {/* toolbar */}
                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        padding: "12px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        background: "#fafbfc",
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            background: "#fff",
                            borderRadius: 10,
                            padding: "7px 12px",
                            flex: 1,
                            minWidth: 200,
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <FiSearch size={13} color="#94a3b8" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث بالاسم أو الإيميل..."
                            style={{
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: 12,
                                flex: 1,
                                fontFamily: "inherit",
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    color: "#94a3b8",
                                    display: "flex",
                                    padding: 0,
                                }}
                            >
                                <FiX size={11} />
                            </button>
                        )}
                    </label>

                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 12px",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                color: "#64748b",
                                cursor: "pointer",
                                fontSize: 12,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiRotateCcw size={11} /> مسح البحث
                        </button>
                    )}

                    <span
                        style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginRight: "auto",
                        }}
                    >
                        {students.length} نتيجة
                    </span>

                    <div
                        style={{
                            display: "flex",
                            gap: 3,
                            background: "#f1f5f9",
                            borderRadius: 10,
                            padding: 3,
                        }}
                    >
                        {(
                            [
                                ["table", <FiList size={12} />, "جدول"],
                                ["cards", <FiGrid size={12} />, "بطاقات"],
                            ] as [ViewMode, React.ReactNode, string][]
                        ).map(([v, ico, lbl]) => (
                            <button
                                key={v}
                                onClick={() => setViewMode(v)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "5px 12px",
                                    borderRadius: 7,
                                    border: "none",
                                    cursor: "pointer",
                                    background:
                                        viewMode === v
                                            ? "#1e293b"
                                            : "transparent",
                                    color: viewMode === v ? "#fff" : "#64748b",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    transition: "all .15s",
                                }}
                            >
                                {ico} {lbl}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === "table" && (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={{ ...TH, width: 44 }}>
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            style={{ cursor: "pointer" }}
                                        />
                                    </th>
                                    <th style={{ ...TH, width: 60 }}>الطالب</th>
                                    <th style={TH}>الاسم</th>
                                    <th style={TH}>إجمالي النقاط</th>
                                    <th style={TH}>مضافة</th>
                                    <th style={TH}>مخصومة</th>
                                    <th style={{ ...TH, width: 140 }}>
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: "center",
                                                padding: 40,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    margin: "0 auto",
                                                    border: "3px solid #dbeafe",
                                                    borderTopColor: "#2563eb",
                                                    borderRadius: "50%",
                                                    animation:
                                                        "sam-spin 0.7s linear infinite",
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    padding: "40px 0",
                                                    color: "#94a3b8",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 30,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    🏅
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {search
                                                        ? "لا توجد نتائج مطابقة"
                                                        : "لا يوجد طلاب"}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student, idx) => (
                                        <tr
                                            key={student.id}
                                            style={{
                                                transition: "background .1s",
                                                background:
                                                    selectedIds.includes(
                                                        student.id,
                                                    )
                                                        ? "#eff6ff"
                                                        : "#fff",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (
                                                    !selectedIds.includes(
                                                        student.id,
                                                    )
                                                )
                                                    e.currentTarget.style.background =
                                                        "#f8fafc";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background =
                                                    selectedIds.includes(
                                                        student.id,
                                                    )
                                                        ? "#eff6ff"
                                                        : "#fff";
                                            }}
                                        >
                                            <td style={{ ...TD, width: 44 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(
                                                        student.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleOne(student.id)
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                />
                                            </td>
                                            <td style={TD}>
                                                <Avatar
                                                    name={student.name}
                                                    idx={idx}
                                                />
                                            </td>
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        fontWeight: 800,
                                                        fontSize: 13,
                                                        color: "#0C447C",
                                                    }}
                                                >
                                                    {student.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#94a3b8",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {student.email}
                                                </div>
                                            </td>
                                            <td style={TD}>
                                                <PointsBadge
                                                    points={
                                                        student.total_points
                                                    }
                                                />
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 13,
                                                        color: "#15803d",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    +{student.added_points}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 13,
                                                        color: "#b91c1c",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    -{student.deducted_points}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <button
                                                    onClick={() =>
                                                        openSingle(student)
                                                    }
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        padding: "5px 12px",
                                                        borderRadius: 8,
                                                        border: "1px solid #B5D4F4",
                                                        background: "#E6F1FB",
                                                        color: "#0C447C",
                                                        cursor: "pointer",
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                    }}
                                                >
                                                    تعديل النقاط
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── CARDS VIEW ── */}
                {viewMode === "cards" && (
                    <div style={{ padding: "16px 20px" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: 40 }}>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        margin: "0 auto",
                                        border: "3px solid #dbeafe",
                                        borderTopColor: "#2563eb",
                                        borderRadius: "50%",
                                        animation:
                                            "sam-spin 0.7s linear infinite",
                                    }}
                                />
                            </div>
                        ) : students.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px 0",
                                    color: "#94a3b8",
                                }}
                            >
                                <div style={{ fontSize: 30, marginBottom: 8 }}>
                                    🏅
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>
                                    {search
                                        ? "لا توجد نتائج مطابقة"
                                        : "لا يوجد طلاب"}
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fill,minmax(240px,1fr))",
                                    gap: 12,
                                }}
                            >
                                {students.map((student, idx) => {
                                    const av =
                                        AV_COLORS[idx % AV_COLORS.length];
                                    const isSelected = selectedIds.includes(
                                        student.id,
                                    );
                                    return (
                                        <div
                                            key={student.id}
                                            style={{
                                                background: isSelected
                                                    ? "#eff6ff"
                                                    : "#f8fafc",
                                                borderRadius: 14,
                                                border: `1px solid ${isSelected ? "#bfdbfe" : "#e2e8f0"}`,
                                                borderRight: `4px solid ${av.color}`,
                                                padding: "16px",
                                                transition: "all .15s",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    (
                                                        e.currentTarget as HTMLDivElement
                                                    ).style.background = "#fff";
                                                    (
                                                        e.currentTarget as HTMLDivElement
                                                    ).style.boxShadow =
                                                        "0 4px 16px #0001";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.background = isSelected
                                                    ? "#eff6ff"
                                                    : "#f8fafc";
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.boxShadow = "none";
                                            }}
                                        >
                                            {/* top row */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                    marginBottom: 12,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() =>
                                                            toggleOne(
                                                                student.id,
                                                            )
                                                        }
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                    <Avatar
                                                        name={student.name}
                                                        idx={idx}
                                                    />
                                                </div>
                                                <PointsBadge
                                                    points={
                                                        student.total_points
                                                    }
                                                />
                                            </div>

                                            {/* name */}
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 900,
                                                    color: "#0C447C",
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {student.name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#94a3b8",
                                                    marginBottom: 12,
                                                }}
                                            >
                                                {student.email}
                                            </div>

                                            {/* points breakdown */}
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "1fr 1fr",
                                                    gap: 8,
                                                    marginBottom: 14,
                                                    background: "#f1f5f9",
                                                    borderRadius: 10,
                                                    padding: "10px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 16,
                                                            fontWeight: 900,
                                                            color: "#15803d",
                                                        }}
                                                    >
                                                        +{student.added_points}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#94a3b8",
                                                        }}
                                                    >
                                                        مضافة
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 16,
                                                            fontWeight: 900,
                                                            color: "#b91c1c",
                                                        }}
                                                    >
                                                        -
                                                        {
                                                            student.deducted_points
                                                        }
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#94a3b8",
                                                        }}
                                                    >
                                                        مخصومة
                                                    </div>
                                                </div>
                                            </div>

                                            {/* action */}
                                            <button
                                                onClick={() =>
                                                    openSingle(student)
                                                }
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 6,
                                                    padding: "7px 0",
                                                    borderRadius: 9,
                                                    border: "1px solid #B5D4F4",
                                                    background: "#E6F1FB",
                                                    color: "#0C447C",
                                                    cursor: "pointer",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                تعديل النقاط
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* bulk bar */}
                {selectedIds.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 20px",
                            background: "#fef9c3",
                            borderTop: "1px solid #fde68a",
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "#d97706",
                                display: "inline-block",
                                animation:
                                    "sam-pulse 1.4s ease-in-out infinite",
                            }}
                        />
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#92400e",
                                flex: 1,
                            }}
                        >
                            {selectedIds.length} طلاب محددين
                        </span>
                        <button
                            onClick={() => setShowBulk(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 14px",
                                borderRadius: 9,
                                border: "1px solid #B5D4F4",
                                background: "#E6F1FB",
                                color: "#0C447C",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiPlus size={13} /> إضافة / خصم نقاط
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "6px 14px",
                                borderRadius: 9,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                color: "#64748b",
                                cursor: "pointer",
                                fontSize: 12,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiX size={11} /> إلغاء
                        </button>
                    </div>
                )}

                {/* pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                            padding: "12px 20px",
                            borderTop: "1px solid #f1f5f9",
                        }}
                    >
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            الصفحة <strong>{currentPage}</strong> من{" "}
                            <strong>{pagination.last_page}</strong> ·{" "}
                            <strong>{pagination.total}</strong> طالب
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={!hasPrev || loading}
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    cursor: !hasPrev
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 12,
                                    fontFamily: "inherit",
                                    opacity: !hasPrev ? 0.4 : 1,
                                }}
                            >
                                السابق
                            </button>
                            <button
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: 8,
                                    border: "none",
                                    background: "#1e293b",
                                    color: "#fff",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                {currentPage}
                            </button>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={!hasNext || loading}
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    cursor: !hasNext
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 12,
                                    fontFamily: "inherit",
                                    opacity: !hasNext ? 0.4 : 1,
                                }}
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes sam-spin  { to { transform: rotate(360deg); } }
                @keyframes sam-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
            `}</style>
        </div>
    );
};

export default StudentAchievementsManagement;
