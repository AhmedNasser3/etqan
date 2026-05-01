// PlansManagement.tsx — نسخة مُعاد تصميمها
import React, { useState, useEffect } from "react";
import UpdatePlanPage from "./models/UpdatePlanPage";
import CreatePlanPage from "./models/CreatePlanPage";
import { usePlans } from "./hooks/usePlans";
import { useToast } from "../../../../../contexts/ToastContext";
import {
    FiPlus,
    FiSearch,
    FiX,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiCalendar,
    FiBook,
    FiRotateCcw,
} from "react-icons/fi";

/* ══════════════════════════════════════════════
   Types
══════════════════════════════════════════════ */
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

interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

/* ══════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════ */
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
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: av.bg,
                color: av.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                flexShrink: 0,
                fontFamily: "'Tajawal',sans-serif",
            }}
        >
            {initials}
        </div>
    );
};

/* ══════════════════════════════════════════════
   Main
══════════════════════════════════════════════ */
const PlansManagement: React.FC = () => {
    const { plans: plansFromHook, loading, refetch } = usePlans();
    const { notifySuccess, notifyError } = useToast();

    const [search, setSearch] = useState("");
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);
    const [sessionRunning, setSessionRunning] = useState(false);

    useEffect(() => {
        setPlans(plansFromHook);
    }, [plansFromHook]);

    const filteredPlans = plans.filter(
        (p) =>
            p.plan_name.toLowerCase().includes(search.toLowerCase()) ||
            (p.center?.name || "").toLowerCase().includes(search.toLowerCase()),
    );

    /* stats */
    const totalPlans = plans.length;
    const totalMonths = plans.reduce((acc, p) => acc + p.total_months, 0);
    const totalDays = plans.reduce((acc, p) => acc + (p.details_count || 0), 0);

    const getCenterName = (p: PlanType) =>
        p.center?.name || `مركز #${p.center_id}` || "غير محدد";

    /* handlers */
    const handleEdit = (p: PlanType) => {
        setSelectedPlan(p);
        setSelectedPlanId(p.id);
        setShowUpdateModal(true);
    };

    const handleDelete = (id: number) => {
        setConfirm({
            title: "حذف الخطة",
            desc: "هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع.",
            cb: async () => {
                try {
                    const csrf = document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content");
                    if (!csrf) {
                        notifyError("فشل في جلب رمز الحماية");
                        setConfirm(null);
                        return;
                    }
                    const res = await fetch(`/api/v1/plans/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            "X-CSRF-TOKEN": csrf,
                        },
                    });
                    const result = await res.json();
                    if (res.ok && result.success) {
                        notifySuccess("تم حذف الخطة بنجاح");
                        setPlans((prev) => prev.filter((p) => p.id !== id));
                    } else {
                        notifyError(result.message || "فشل في حذف الخطة");
                    }
                } catch {
                    notifyError("حدث خطأ في الحذف");
                } finally {
                    setConfirm(null);
                }
            },
        });
    };

    /* shared button styles */
    const editBtn: React.CSSProperties = {
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
    };
    const delBtn: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 12px",
        borderRadius: 8,
        border: "1px solid #fecaca",
        background: "#fee2e2",
        color: "#b91c1c",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "inherit",
    };

    /* ════════════════════════════════════════
       RENDER
    ════════════════════════════════════════ */
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
            {/* ── Modals ── */}
            {showUpdateModal && selectedPlan && (
                <UpdatePlanPage
                    initialPlan={selectedPlan}
                    planId={selectedPlanId!}
                    onClose={() => {
                        setShowUpdateModal(false);
                        setSelectedPlan(null);
                        setSelectedPlanId(null);
                    }}
                    onSuccess={() => {
                        notifySuccess("تم تحديث بيانات الخطة بنجاح");
                        refetch();
                    }}
                />
            )}
            {showCreateModal && (
                <CreatePlanPage
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        notifySuccess("تم إضافة الخطة بنجاح");
                        refetch();
                    }}
                />
            )}

            {/* ── Confirm Modal ── */}
            {confirm && (
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
                        padding: 16,
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            padding: "28px 28px 24px",
                            maxWidth: 400,
                            width: "100%",
                            textAlign: "center",
                            boxShadow: "0 8px 40px #0002",
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
                                color: "#dc2626",
                            }}
                        >
                            <FiTrash2 size={22} />
                        </div>
                        <div
                            style={{
                                fontSize: 16,
                                fontWeight: 900,
                                color: "#1e293b",
                                marginBottom: 8,
                            }}
                        >
                            {confirm.title}
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "#64748b",
                                marginBottom: 24,
                                lineHeight: 1.6,
                            }}
                        >
                            {confirm.desc}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                onClick={confirm.cb}
                                style={{
                                    padding: "9px 24px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#dc2626",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                تأكيد الحذف
                            </button>
                            <button
                                onClick={() => setConfirm(null)}
                                style={{
                                    padding: "9px 24px",
                                    borderRadius: 10,
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    color: "#475569",
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
                                إدارة الخطط
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                إدارة خطط الحفظ والمراجعة الخاصة بمجمعك
                            </p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexWrap: "wrap",
                            }}
                        >
                            {sessionRunning && (
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        background: "rgba(255,255,255,.1)",
                                        padding: "5px 12px",
                                        borderRadius: 20,
                                        fontSize: 11,
                                        color: "rgba(255,255,255,.8)",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: "50%",
                                            background: "#4ade80",
                                            display: "inline-block",
                                            animation:
                                                "plm-pulse 1.4s ease-in-out infinite",
                                        }}
                                    />
                                    جلسة جارية
                                </span>
                            )}
                            <button
                                onClick={() => setSessionRunning((p) => !p)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "7px 14px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,.2)",
                                    background: sessionRunning
                                        ? "#dc2626"
                                        : "rgba(255,255,255,.12)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                {sessionRunning ? (
                                    <>
                                        <FiXCircle size={12} /> إيقاف الجلسة
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle size={12} /> بدء الجلسة
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
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
                                <FiPlus size={12} /> خطة جديدة
                            </button>
                        </div>
                    </div>

                    {/* stats bar */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            {
                                label: "إجمالي الخطط",
                                value: totalPlans,
                                color: "rgba(255,255,255,.9)",
                            },
                            {
                                label: "إجمالي الأشهر",
                                value: totalMonths,
                                color: "#4ade80",
                            },
                            {
                                label: "إجمالي الأيام",
                                value: totalDays,
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
                                    minWidth: 80,
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
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════
                PLANS LIST CARD
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
                            قائمة الخطط
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            {search
                                ? `${filteredPlans.length} نتيجة من ${totalPlans}`
                                : `${totalPlans} خطة`}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
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
                        <FiPlus size={14} /> خطة جديدة
                    </button>
                </div>

                {/* search toolbar */}
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
                            placeholder="بحث باسم الخطة أو المجمع..."
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
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {filteredPlans.length} نتيجة
                    </span>
                </div>

                {/* list */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                margin: "0 auto",
                                border: "3px solid #dbeafe",
                                borderTopColor: "#2563eb",
                                borderRadius: "50%",
                                animation: "plm-spin .7s linear infinite",
                            }}
                        />
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "50px 20px",
                            color: "#94a3b8",
                        }}
                    >
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                marginBottom: 4,
                            }}
                        >
                            {search
                                ? "لا توجد نتائج مطابقة"
                                : "لا توجد خطط بعد"}
                        </div>
                        <div style={{ fontSize: 12, marginBottom: 20 }}>
                            أضف أول خطة حفظ لمجمعك الآن
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "9px 20px",
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
                            <FiPlus size={14} /> إضافة خطة
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {filteredPlans.map((p, idx) => (
                            <div
                                key={p.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                    padding: "14px 20px",
                                    borderBottom: "1px solid #f8fafc",
                                    transition: "background .1s",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "#f8fafc")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "#fff")
                                }
                            >
                                {/* avatar */}
                                <Avatar name={p.plan_name} idx={idx} />

                                {/* info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            fontSize: 13,
                                            color: "#1e293b",
                                            marginBottom: 3,
                                        }}
                                    >
                                        {p.plan_name}
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 12,
                                            flexWrap: "wrap",
                                            fontSize: 11,
                                            color: "#64748b",
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 3,
                                            }}
                                        >
                                            <FiCalendar
                                                size={10}
                                                style={{ color: "#0f6e56" }}
                                            />
                                            {p.total_months} شهر
                                        </span>
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 3,
                                            }}
                                        >
                                            <FiBook
                                                size={10}
                                                style={{ color: "#2563eb" }}
                                            />
                                            {p.details_count} يوم
                                        </span>
                                        <span style={{ color: "#94a3b8" }}>
                                            {getCenterName(p)}
                                        </span>
                                    </div>
                                </div>

                                {/* progress bar */}
                                {p.details_count > 0 && (
                                    <div
                                        style={{
                                            minWidth: 100,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 4,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: "#94a3b8",
                                                textAlign: "center",
                                            }}
                                        >
                                            {p.current_day || 0} /{" "}
                                            {p.details_count} يوم
                                        </div>
                                        <div
                                            style={{
                                                height: 5,
                                                background: "#f1f5f9",
                                                borderRadius: 3,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "100%",
                                                    borderRadius: 3,
                                                    width: `${Math.min(100, Math.round(((p.current_day || 0) / p.details_count) * 100))}%`,
                                                    background:
                                                        "linear-gradient(90deg,#0f6e56,#22d3ee)",
                                                    transition:
                                                        "width .4s ease",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* months badge */}
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 5,
                                        padding: "4px 10px",
                                        borderRadius: 20,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        whiteSpace: "nowrap",
                                        background: "#E1F5EE",
                                        color: "#085041",
                                        border: "1px solid #9FE1CB",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 5,
                                            height: 5,
                                            borderRadius: "50%",
                                            background: "#0F6E56",
                                            display: "inline-block",
                                        }}
                                    />
                                    {p.total_months} شهر
                                </span>

                                {/* actions */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 6,
                                        flexShrink: 0,
                                    }}
                                >
                                    <button
                                        style={editBtn}
                                        onClick={() => handleEdit(p)}
                                    >
                                        <FiEdit2 size={11} /> تعديل
                                    </button>
                                    <button
                                        style={delBtn}
                                        onClick={() => handleDelete(p.id)}
                                    >
                                        <FiTrash2 size={11} /> حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* footer */}
                {filteredPlans.length > 0 && (
                    <div
                        style={{
                            padding: "12px 20px",
                            borderTop: "1px solid #f1f5f9",
                            background: "#fafbfc",
                        }}
                    >
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "7px 16px",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                color: "#0f6e56",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiPlus size={13} /> إضافة خطة أخرى
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes plm-spin  { to { transform: rotate(360deg); } }
                @keyframes plm-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
            `}</style>
        </div>
    );
};

export default PlansManagement;
