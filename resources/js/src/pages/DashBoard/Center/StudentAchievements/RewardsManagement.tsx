// RewardsManagement.tsx — نسخة مُعاد تصميمها بنفس ديزاين PlanDetailsManagement
import React, { useState, useMemo } from "react";
import { useRewards, Reward } from "./hooks/useRewards";
import { useToast } from "../../../../../contexts/ToastContext";
import {
    FiPlus,
    FiTrash2,
    FiSearch,
    FiX,
    FiGrid,
    FiList,
    FiRotateCcw,
} from "react-icons/fi";

/* ══════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════ */
interface RewardForm {
    name: string;
    description: string;
    points_cost: number;
    is_active: boolean;
}

const defaultForm: RewardForm = {
    name: "",
    description: "",
    points_cost: 50,
    is_active: true,
};

type ViewMode = "table" | "cards";

/* ══════════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════════ */
const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

/* ── Sub-components ── */
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

const ActiveBadge = ({ active }: { active: boolean }) => (
    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: active ? "#dcfce7" : "#fee2e2",
            color: active ? "#15803d" : "#b91c1c",
            border: `1px solid ${active ? "#bbf7d0" : "#fecaca"}`,
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap" as const,
        }}
    >
        <span
            style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: active ? "#16a34a" : "#ef4444",
                display: "inline-block",
            }}
        />
        {active ? "متاحة" : "مخفية"}
    </span>
);

/* ══════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════ */
const RewardsManagement: React.FC = () => {
    const { rewards, loading, createReward, updateReward, deleteReward } =
        useRewards();
    const { notifySuccess, notifyError } = useToast();

    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "" | "active" | "inactive"
    >("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<RewardForm>(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    /* ── Filtering ── */
    const filteredRewards = useMemo(
        () =>
            rewards.filter((r) => {
                const q = search.trim().toLowerCase();
                const matchSearch =
                    !q ||
                    r.name.toLowerCase().includes(q) ||
                    (r.description ?? "").toLowerCase().includes(q);
                const matchStatus =
                    statusFilter === "" ||
                    (statusFilter === "active" && r.is_active) ||
                    (statusFilter === "inactive" && !r.is_active);
                return matchSearch && matchStatus;
            }),
        [rewards, search, statusFilter],
    );

    /* ── Stats ── */
    const totalActive = rewards.filter((r) => r.is_active).length;
    const totalInactive = rewards.filter((r) => !r.is_active).length;
    const avgCost = rewards.length
        ? Math.round(
              rewards.reduce((a, r) => a + r.points_cost, 0) / rewards.length,
          )
        : 0;

    /* ── Bulk select ── */
    const allSelected =
        filteredRewards.length > 0 &&
        selectedItems.size === filteredRewards.length;
    const toggleSelectAll = () => {
        if (allSelected) setSelectedItems(new Set());
        else setSelectedItems(new Set(filteredRewards.map((r) => r.id)));
    };
    const toggleSelectItem = (id: number) => {
        const s = new Set(selectedItems);
        s.has(id) ? s.delete(id) : s.add(id);
        setSelectedItems(s);
    };

    /* ── Handlers ── */
    const openCreate = () => {
        setForm(defaultForm);
        setEditingId(null);
        setShowModal(true);
    };

    const openEdit = (reward: Reward) => {
        setForm({
            name: reward.name,
            description: reward.description ?? "",
            points_cost: reward.points_cost,
            is_active: reward.is_active,
        });
        setEditingId(reward.id);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            notifyError("أدخل اسم الجائزة");
            return;
        }
        if (form.points_cost < 1) {
            notifyError("السعر يجب أن يكون أكبر من صفر");
            return;
        }
        setSubmitting(true);
        try {
            if (editingId) {
                await updateReward(editingId, form);
                notifySuccess("تم تحديث الجائزة");
            } else {
                await createReward(form);
                notifySuccess("تمت إضافة الجائزة");
            }
            setShowModal(false);
        } catch {
            notifyError("فشل في حفظ الجائزة");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await deleteReward(deleteId);
            notifySuccess("تم حذف الجائزة");
            setShowDeleteModal(false);
            setDeleteId(null);
        } catch {
            notifyError("فشل في الحذف");
        } finally {
            setDeleting(false);
        }
    };

    const handleBulkDeleteConfirm = async () => {
        setBulkDeleting(true);
        try {
            for (const id of Array.from(selectedItems)) {
                await deleteReward(id);
            }
            notifySuccess(`تم حذف ${selectedItems.size} جائزة`);
            setSelectedItems(new Set());
            setShowBulkDeleteModal(false);
        } catch {
            notifyError("خطأ في الحذف الجماعي");
        } finally {
            setBulkDeleting(false);
        }
    };

    /* ── Shared styles ── */
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

    /* ══════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════ */
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
            {/* ── Create / Edit Modal ── */}
            {showModal && (
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
                                marginBottom: 20,
                            }}
                        >
                            {editingId ? "تعديل الجائزة" : "إضافة جائزة جديدة"}
                        </div>

                        {/* اسم الجائزة */}
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
                                اسم الجائزة *
                            </label>
                            <input
                                value={form.name}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="مثال: مصحف، شهادة تقدير..."
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

                        {/* الوصف */}
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
                                الوصف (اختياري)
                            </label>
                            <input
                                value={form.description}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="وصف الجائزة..."
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

                        {/* السعر */}
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
                                سعرها بالنقاط *
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={form.points_cost}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        points_cost: Math.max(
                                            1,
                                            Number(e.target.value),
                                        ),
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

                        {/* متاحة */}
                        <div
                            style={{
                                marginBottom: 20,
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        is_active: e.target.checked,
                                    }))
                                }
                                style={{
                                    width: 16,
                                    height: 16,
                                    cursor: "pointer",
                                }}
                            />
                            <label
                                htmlFor="isActive"
                                style={{
                                    fontSize: 13,
                                    color: "#475569",
                                    cursor: "pointer",
                                }}
                            >
                                متاحة للطلاب
                            </label>
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{
                                    flex: 1,
                                    padding: "9px 0",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#0f6e56",
                                    color: "#fff",
                                    cursor: submitting
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    opacity: submitting ? 0.7 : 1,
                                }}
                            >
                                {submitting
                                    ? "جاري..."
                                    : editingId
                                      ? "حفظ التعديل"
                                      : "إضافة الجائزة"}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
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
            )}

            {/* ── Delete Modal ── */}
            {showDeleteModal && (
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
                            maxWidth: 420,
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 20px 60px #0003",
                        }}
                    >
                        <div
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: "50%",
                                background: "#fee2e2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                            }}
                        >
                            <FiTrash2 size={22} color="#b91c1c" />
                        </div>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 900,
                                color: "#1e293b",
                                marginBottom: 8,
                            }}
                        >
                            تأكيد حذف الجائزة
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "#64748b",
                                marginBottom: 24,
                            }}
                        >
                            هل أنت متأكد من حذف هذه الجائزة؟ لا يمكن التراجع.
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#dc2626",
                                    color: "#fff",
                                    cursor: deleting
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    opacity: deleting ? 0.7 : 1,
                                }}
                            >
                                {deleting ? "جاري الحذف..." : "حذف الجائزة"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteId(null);
                                }}
                                style={{
                                    padding: "8px 20px",
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
            )}

            {/* ── Bulk Delete Modal ── */}
            {showBulkDeleteModal && (
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
                            maxWidth: 420,
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 20px 60px #0003",
                        }}
                    >
                        <div
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: "50%",
                                background: "#fee2e2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                            }}
                        >
                            <FiTrash2 size={22} color="#b91c1c" />
                        </div>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 900,
                                color: "#1e293b",
                                marginBottom: 8,
                            }}
                        >
                            تأكيد الحذف الجماعي
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "#64748b",
                                marginBottom: 24,
                            }}
                        >
                            {`هل أنت متأكد من حذف ${selectedItems.size} جائزة؟ لا يمكن التراجع.`}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                onClick={handleBulkDeleteConfirm}
                                disabled={bulkDeleting}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#dc2626",
                                    color: "#fff",
                                    cursor: bulkDeleting
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    opacity: bulkDeleting ? 0.7 : 1,
                                }}
                            >
                                {bulkDeleting
                                    ? "جاري الحذف..."
                                    : `حذف ${selectedItems.size} جائزة`}
                            </button>
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                style={{
                                    padding: "8px 20px",
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
                                إدارة الجوائز
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                أنشئ وأدر جوائز نقاط الطلاب في مجمعك
                            </p>
                        </div>
                        <button
                            onClick={openCreate}
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
                            <FiPlus size={12} /> جائزة جديدة
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            {
                                label: "إجمالي الجوائز",
                                value: rewards.length,
                                color: "#4ade80",
                            },
                            {
                                label: "متاحة",
                                value: totalActive,
                                color: "#fbbf24",
                            },
                            {
                                label: "مخفية",
                                value: totalInactive,
                                color: "#94a3b8",
                            },
                            {
                                label: "متوسط التكلفة",
                                value: `${avgCost} نقطة`,
                                color: "#38bdf8",
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
                                نسبة الجوائز المتاحة
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
                                        width: rewards.length
                                            ? `${(totalActive / rewards.length) * 100}%`
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
                            قائمة الجوائز
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#94a3b8",
                                    fontWeight: 400,
                                    marginRight: 6,
                                }}
                            >
                                ({rewards.length} جائزة)
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            عرض {filteredRewards.length} من {rewards.length}{" "}
                            جائزة
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
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
                        <FiPlus size={14} /> جائزة جديدة
                    </button>
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
                            placeholder="بحث باسم الجائزة أو الوصف..."
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

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value as "" | "active" | "inactive",
                            )
                        }
                        style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 10,
                            padding: "7px 12px",
                            fontSize: 12,
                            fontFamily: "inherit",
                            background: "#fff",
                            color: "#1e293b",
                            cursor: "pointer",
                            outline: "none",
                            minWidth: 130,
                        }}
                    >
                        <option value="">كل الحالات</option>
                        <option value="active">متاحة</option>
                        <option value="inactive">مخفية</option>
                    </select>

                    {(search || statusFilter) && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("");
                            }}
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
                            <FiRotateCcw size={11} /> مسح الفلاتر
                        </button>
                    )}

                    <span
                        style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginRight: "auto",
                        }}
                    >
                        {filteredRewards.length} نتيجة
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
                                            onChange={toggleSelectAll}
                                            style={{ cursor: "pointer" }}
                                        />
                                    </th>
                                    <th style={{ ...TH, width: 60 }}>الشعار</th>
                                    <th style={TH}>اسم الجائزة</th>
                                    <th style={TH}>الوصف</th>
                                    <th style={{ ...TH, width: 130 }}>
                                        السعر (نقاط)
                                    </th>
                                    <th style={{ ...TH, width: 110 }}>
                                        الحالة
                                    </th>
                                    <th style={{ ...TH, width: 150 }}>
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
                                                        "rm-spin 0.7s linear infinite",
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ) : filteredRewards.length === 0 ? (
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
                                                    🔍
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {search || statusFilter
                                                        ? "لا توجد نتائج مطابقة"
                                                        : "لا توجد جوائز بعد"}
                                                </div>
                                                {!search && !statusFilter && (
                                                    <button
                                                        onClick={openCreate}
                                                        style={{
                                                            marginTop: 12,
                                                            padding: "7px 16px",
                                                            borderRadius: 10,
                                                            border: "none",
                                                            background:
                                                                "#0f6e56",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        إضافة جائزة جديدة
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRewards.map((r, idx) => (
                                        <tr
                                            key={r.id}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#f8fafc")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#fff")
                                            }
                                            style={{
                                                transition: "background .1s",
                                            }}
                                        >
                                            <td style={{ ...TD, width: 44 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(
                                                        r.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelectItem(r.id)
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                />
                                            </td>
                                            <td style={TD}>
                                                <Avatar
                                                    name={r.name}
                                                    idx={idx}
                                                />
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontWeight: 800,
                                                        fontSize: 14,
                                                        color: "#0C447C",
                                                    }}
                                                >
                                                    {r.name}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                        maxWidth: 200,
                                                        display: "block",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {r.description || "—"}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        background: "#EEEDFE",
                                                        color: "#3C3489",
                                                        border: "1px solid #CECBF6",
                                                        padding: "3px 10px",
                                                        borderRadius: 20,
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {r.points_cost} نقطة
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <ActiveBadge
                                                    active={r.is_active}
                                                />
                                            </td>
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            openEdit(r)
                                                        }
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            padding: "5px 12px",
                                                            borderRadius: 8,
                                                            border: "1px solid #B5D4F4",
                                                            background:
                                                                "#E6F1FB",
                                                            color: "#0C447C",
                                                            cursor: "pointer",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteId(r.id);
                                                            setShowDeleteModal(
                                                                true,
                                                            );
                                                        }}
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            padding: "5px 12px",
                                                            borderRadius: 8,
                                                            border: "1px solid #fecaca",
                                                            background:
                                                                "#fee2e2",
                                                            color: "#b91c1c",
                                                            cursor: "pointer",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        حذف
                                                    </button>
                                                </div>
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
                                            "rm-spin 0.7s linear infinite",
                                    }}
                                />
                            </div>
                        ) : filteredRewards.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px 0",
                                    color: "#94a3b8",
                                }}
                            >
                                <div style={{ fontSize: 30, marginBottom: 8 }}>
                                    🎁
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>
                                    {search || statusFilter
                                        ? "لا توجد نتائج مطابقة"
                                        : "لا توجد جوائز"}
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
                                {filteredRewards.map((r, idx) => {
                                    const av =
                                        AV_COLORS[idx % AV_COLORS.length];
                                    return (
                                        <div
                                            key={r.id}
                                            style={{
                                                background: "#f8fafc",
                                                borderRadius: 14,
                                                border: "1px solid #e2e8f0",
                                                borderRight: `4px solid ${av.color}`,
                                                padding: "16px",
                                                transition: "all .15s",
                                            }}
                                            onMouseEnter={(e) => {
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.background = "#fff";
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.boxShadow =
                                                    "0 4px 16px #0001";
                                            }}
                                            onMouseLeave={(e) => {
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.background = "#f8fafc";
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
                                                        checked={selectedItems.has(
                                                            r.id,
                                                        )}
                                                        onChange={() =>
                                                            toggleSelectItem(
                                                                r.id,
                                                            )
                                                        }
                                                        style={{
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                    <Avatar
                                                        name={r.name}
                                                        idx={idx}
                                                    />
                                                </div>
                                                <ActiveBadge
                                                    active={r.is_active}
                                                />
                                            </div>

                                            {/* name */}
                                            <div
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: 900,
                                                    color: "#0C447C",
                                                    marginBottom: 6,
                                                }}
                                            >
                                                {r.name}
                                            </div>

                                            {/* body */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 6,
                                                    marginBottom: 14,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        alignItems:
                                                            "flex-start",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#94a3b8",
                                                            width: 52,
                                                            flexShrink: 0,
                                                            marginTop: 1,
                                                        }}
                                                    >
                                                        📝 الوصف
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#475569",
                                                            flex: 1,
                                                        }}
                                                    >
                                                        {r.description || "—"}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#94a3b8",
                                                            width: 52,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        💎 السعر
                                                    </span>
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            background:
                                                                "#EEEDFE",
                                                            color: "#3C3489",
                                                            border: "1px solid #CECBF6",
                                                            padding: "2px 10px",
                                                            borderRadius: 20,
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {r.points_cost} نقطة
                                                    </span>
                                                </div>
                                            </div>

                                            {/* actions */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                    paddingTop: 12,
                                                    borderTop:
                                                        "1px solid #f1f5f9",
                                                }}
                                            >
                                                <button
                                                    onClick={() => openEdit(r)}
                                                    style={{
                                                        flex: 1,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        gap: 4,
                                                        padding: "6px 0",
                                                        borderRadius: 8,
                                                        border: "1px solid #B5D4F4",
                                                        background: "#E6F1FB",
                                                        color: "#0C447C",
                                                        cursor: "pointer",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                    }}
                                                >
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeleteId(r.id);
                                                        setShowDeleteModal(
                                                            true,
                                                        );
                                                    }}
                                                    style={{
                                                        padding: "6px 14px",
                                                        borderRadius: 8,
                                                        border: "1px solid #fecaca",
                                                        background: "#fee2e2",
                                                        color: "#b91c1c",
                                                        cursor: "pointer",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                    }}
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* bulk action bar */}
                {selectedItems.size > 0 && (
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
                                animation: "rm-pulse 1.4s ease-in-out infinite",
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
                            {selectedItems.size} جوائز محددة
                        </span>
                        <button
                            onClick={() => setShowBulkDeleteModal(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 14px",
                                borderRadius: 9,
                                border: "1px solid #fecaca",
                                background: "#fee2e2",
                                color: "#b91c1c",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiTrash2 size={13} /> حذف {selectedItems.size}
                        </button>
                        <button
                            onClick={() => setSelectedItems(new Set())}
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
            </div>

            <style>{`
                @keyframes rm-spin  { to { transform: rotate(360deg); } }
                @keyframes rm-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
            `}</style>
        </div>
    );
};

export default RewardsManagement;
