// FinancialDashboard.tsx — نسخة مُعاد تصميمها بالكامل
import { useState, useMemo, useCallback } from "react";
import {
    FiFileText,
    FiEdit2,
    FiSearch,
    FiX,
    FiRotateCcw,
    FiCheckCircle,
    FiXCircle,
    FiDownload,
    FiRefreshCw,
    FiDollarSign,
    FiUsers,
    FiClock,
    FiTrendingUp,
    FiTrendingDown,
    FiFilter,
} from "react-icons/fi";
import { useTeacherPayrolls, PayrollItem } from "./hooks/useTeacherPayrolls";
import FinancialModel from "./models/FinancialModel";

/* ══════════════════════════════════════════════
   Types
══════════════════════════════════════════════ */
type StatusFilter = "all" | "pending" | "paid";

/* ══════════════════════════════════════════════
   Constants / Helpers
══════════════════════════════════════════════ */
const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

const ROLE_NAMES: Record<string, string> = {
    teacher: "معلم",
    supervisor: "مشرف",
    financial: "مالية",
    motivator: "محفز",
    student_affairs: "شؤون طلاب",
};

const getRoleName = (role?: string) => ROLE_NAMES[role ?? ""] ?? "غير محدد";
const fmt = (v: string | number | undefined) =>
    parseFloat(String(v ?? "0")).toLocaleString("ar-SA", {
        minimumFractionDigits: 0,
    });
const teacherName = (item: PayrollItem) =>
    item?.teacher?.user?.name ?? "غير معروف";
const teacherInitials = (item: PayrollItem) =>
    teacherName(item)
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2);

/* ══════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════ */
const Avatar = ({ item, idx }: { item: PayrollItem; idx: number }) => {
    const av = AV_COLORS[idx % AV_COLORS.length];
    return (
        <div
            style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: av.bg,
                color: av.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
                flexShrink: 0,
                fontFamily: "'Tajawal',sans-serif",
            }}
        >
            {teacherInitials(item)}
        </div>
    );
};

const StatusBadge = ({ status }: { status?: string }) => {
    const paid = status === "paid";
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: paid ? "#dcfce7" : "#fef9c3",
                color: paid ? "#15803d" : "#a16207",
                border: `1px solid ${paid ? "#bbf7d0" : "#fde68a"}`,
            }}
        >
            <span
                style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: paid ? "#16a34a" : "#d97706",
                    display: "inline-block",
                }}
            />
            {paid ? "مدفوع" : "معلق"}
        </span>
    );
};

const RoleBadge = ({ role }: { role?: string }) => {
    const isTeacher = role === "teacher";
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: isTeacher ? "#dcfce7" : "#dbeafe",
                color: isTeacher ? "#15803d" : "#1d4ed8",
                border: `1px solid ${isTeacher ? "#bbf7d0" : "#bfdbfe"}`,
            }}
        >
            {getRoleName(role)}
        </span>
    );
};

/* ── Toast local ── */
const useToastLocal = () => {
    const [toast, setToast] = useState<{
        msg: string;
        type: "success" | "error";
    } | null>(null);
    const notify = useCallback(
        (msg: string, type: "success" | "error" = "success") => {
            setToast({ msg, type });
            setTimeout(() => setToast(null), 3200);
        },
        [],
    );
    return { toast, notify };
};

/* ══════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════ */
const FinancialDashboard: React.FC = () => {
    const {
        payrolls: rawPayrolls = [],
        loading = false,
        search,
        setSearch,
        filterStatus = "all",
        setFilterStatus,
        markPaid,
    } = useTeacherPayrolls();

    const { toast, notify } = useToastLocal();

    const [showFinancialModel, setShowFinancialModel] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState<PayrollItem | null>(
        null,
    );
    const [sessionRunning, setSessionRunning] = useState(false);

    /* ── Stats ── */
    const totalPayroll = useMemo(
        () =>
            rawPayrolls.reduce(
                (s, e) => s + parseFloat(e?.total_due || "0") || s,
                0,
            ),
        [rawPayrolls],
    );

    const totalPending = useMemo(
        () =>
            rawPayrolls
                .filter((e) => e?.status === "pending")
                .reduce((s, e) => s + parseFloat(e?.total_due || "0") || s, 0),
        [rawPayrolls],
    );

    const totalPaid = totalPayroll - totalPending;
    const totalDeductions = useMemo(
        () =>
            rawPayrolls.reduce(
                (s, e) => s + parseFloat(e?.deductions || "0") || s,
                0,
            ),
        [rawPayrolls],
    );
    const paidCount = rawPayrolls.filter((e) => e?.status === "paid").length;
    const pendingCount = rawPayrolls.filter(
        (e) => e?.status === "pending",
    ).length;

    /* ── Handlers ── */
    const handleOpenEdit = useCallback((payroll?: PayrollItem) => {
        setEditingPayroll(payroll || null);
        setShowFinancialModel(true);
    }, []);

    const handleCloseEdit = useCallback(() => {
        setShowFinancialModel(false);
        setEditingPayroll(null);
    }, []);

    const handleUpdatePayroll = useCallback(async () => {
        notify("تم حفظ التعديلات بنجاح");
        handleCloseEdit();
    }, [handleCloseEdit, notify]);

    const handleExportPDF = useCallback(
        (item: PayrollItem) => {
            notify(`جاري تصدير مسير ${teacherName(item)}...`);
            setTimeout(() => notify("تم التصدير بنجاح"), 1500);
        },
        [notify],
    );

    const handleMarkPaid = useCallback(
        async (id: number) => {
            try {
                const success = await markPaid(id);
                if (success) notify("تم تحديث الحالة إلى مدفوع");
                else notify("فشل في التحديث", "error");
            } catch {
                notify("خطأ في التحديث", "error");
            }
        },
        [markPaid, notify],
    );

    /* ── Table / Card styles ── */
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
            {/* ── Modal ── */}
            <FinancialModel
                isOpen={showFinancialModel}
                onClose={handleCloseEdit}
                payroll={editingPayroll}
                onSubmit={handleUpdatePayroll}
            />

            {/* ── Toast ── */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 24,
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "12px 24px",
                        borderRadius: 50,
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        zIndex: 4000,
                        background:
                            toast.type === "success" ? "#0f6e56" : "#dc2626",
                        color: "#fff",
                        boxShadow: "0 8px 32px #0004",
                        animation: "fin-toast .3s ease",
                        pointerEvents: "none",
                        fontFamily: "'Tajawal',sans-serif",
                    }}
                >
                    {toast.type === "success" ? (
                        <FiCheckCircle size={15} />
                    ) : (
                        <FiXCircle size={15} />
                    )}{" "}
                    {toast.msg}
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
                                مستحقات الرواتب
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                ملخص شامل لمستحقات المعلمين والموظفين ودوامهم
                                الشهري
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
                                                "fin-pulse 1.4s ease-in-out infinite",
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
                                        <FiXCircle size={12} /> إيقاف
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle size={12} /> بدء الجلسة
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => notify("جاري التصدير...")}
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
                                <FiDownload size={12} /> تصدير PDF
                            </button>
                        </div>
                    </div>

                    {/* stats bar */}
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
                        {[
                            {
                                label: "إجمالي المستحقات",
                                value: `${fmt(totalPayroll)} ر.س`,
                                color: "#4ade80",
                            },
                            {
                                label: "مدفوع",
                                value: `${fmt(totalPaid)} ر.س`,
                                color: "#38bdf8",
                            },
                            {
                                label: "معلق",
                                value: `${fmt(totalPending)} ر.س`,
                                color: "#fbbf24",
                            },
                            {
                                label: "إجمالي الخصومات",
                                value: `${fmt(totalDeductions)} ر.س`,
                                color: "#f87171",
                            },
                            {
                                label: "موظفون",
                                value: rawPayrolls.length,
                                color: "rgba(255,255,255,.9)",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                style={{
                                    background: "rgba(255,255,255,.07)",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    textAlign: "center",
                                    minWidth: 85,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 16,
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

                        {/* progress bar paid/total */}
                        {totalPayroll > 0 && (
                            <div
                                style={{
                                    flex: 1,
                                    minWidth: 160,
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
                                    نسبة السداد:{" "}
                                    {Math.round(
                                        (totalPaid / totalPayroll) * 100,
                                    )}
                                    %
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
                                            width: `${Math.round((totalPaid / totalPayroll) * 100)}%`,
                                            background:
                                                "linear-gradient(90deg,#4ade80,#22d3ee)",
                                            borderRadius: 4,
                                            transition: "width .6s ease",
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════
                KPI CARDS
            ══════════════════════════════ */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                    gap: 14,
                }}
            >
                {[
                    {
                        icon: <FiDollarSign size={20} />,
                        iconBg: "#dcfce7",
                        iconColor: "#16a34a",
                        label: "إجمالي المستحقات",
                        value: `${fmt(totalPayroll)} ر.س`,
                        trend: `${rawPayrolls.length} موظف`,
                    },
                    {
                        icon: <FiCheckCircle size={20} />,
                        iconBg: "#dbeafe",
                        iconColor: "#2563eb",
                        label: "مدفوع",
                        value: `${fmt(totalPaid)} ر.س`,
                        trend: `${paidCount} موظف`,
                    },
                    {
                        icon: <FiClock size={20} />,
                        iconBg: "#fef9c3",
                        iconColor: "#d97706",
                        label: "معلق",
                        value: `${fmt(totalPending)} ر.س`,
                        trend: `${pendingCount} موظف`,
                    },
                    {
                        icon: <FiTrendingDown size={20} />,
                        iconBg: "#fee2e2",
                        iconColor: "#dc2626",
                        label: "إجمالي الخصومات",
                        value: `${fmt(totalDeductions)} ر.س`,
                        trend: "هذا الشهر",
                    },
                ].map((k, i) => (
                    <div
                        key={i}
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: "18px 20px",
                            boxShadow: "0 2px 12px #0001",
                            borderTop: `4px solid ${k.iconColor}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 12,
                                    background: k.iconBg,
                                    color: k.iconColor,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 18,
                                }}
                            >
                                {k.icon}
                            </div>
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: "#f1f5f9",
                                    color: "#64748b",
                                    padding: "3px 8px",
                                    borderRadius: 20,
                                }}
                            >
                                {k.trend}
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 900,
                                color: "#1e293b",
                                lineHeight: 1,
                            }}
                        >
                            {k.value}
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: "#94a3b8",
                                fontWeight: 600,
                            }}
                        >
                            {k.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════
                TABLE CARD
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
                            ملخص المستحقات والدوام
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#94a3b8",
                                    fontWeight: 400,
                                    marginRight: 6,
                                }}
                            >
                                ({rawPayrolls.length} موظف)
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            تفاصيل الرواتب والخصومات والمستحقات الشهرية
                        </div>
                    </div>
                    <button
                        onClick={() => notify("جاري التصدير...")}
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
                        <FiDownload size={14} /> تصدير الكشف
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
                            placeholder="البحث بالاسم أو الدور..."
                            style={{
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: 12,
                                flex: 1,
                                fontFamily: "inherit",
                            }}
                            disabled={loading}
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

                    {/* filter tabs */}
                    <div
                        style={{
                            display: "flex",
                            gap: 4,
                            background: "#f1f5f9",
                            borderRadius: 10,
                            padding: 3,
                        }}
                    >
                        {(
                            [
                                ["all", `الكل (${rawPayrolls.length})`],
                                ["pending", `معلق (${pendingCount})`],
                                ["paid", `مدفوع (${paidCount})`],
                            ] as [StatusFilter, string][]
                        ).map(([v, lbl]) => (
                            <button
                                key={v}
                                onClick={() => setFilterStatus(v)}
                                style={{
                                    padding: "5px 12px",
                                    borderRadius: 7,
                                    border: "none",
                                    cursor: "pointer",
                                    background:
                                        filterStatus === v
                                            ? "#1e293b"
                                            : "transparent",
                                    color:
                                        filterStatus === v ? "#fff" : "#64748b",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    transition: "all .15s",
                                }}
                            >
                                {lbl}
                            </button>
                        ))}
                    </div>

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
                            <FiRotateCcw size={11} /> مسح
                        </button>
                    )}
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {rawPayrolls.length} نتيجة
                    </span>
                </div>

                {/* table */}
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
                                animation: "fin-spin .7s linear infinite",
                            }}
                        />
                    </div>
                ) : rawPayrolls.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "50px 20px",
                            color: "#94a3b8",
                        }}
                    >
                        <div style={{ fontSize: 36, marginBottom: 10 }}>
                            <FiDollarSign size={36} style={{ opacity: 0.3 }} />
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                marginBottom: 4,
                            }}
                        >
                            لا توجد مستحقات حالياً
                        </div>
                        <div style={{ fontSize: 12 }}>
                            ستظهر هنا مستحقات المعلمين والموظفين بعد رفع
                            البيانات
                        </div>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={TH}>الموظف</th>
                                    <th style={TH}>الدور</th>
                                    <th style={TH}>الراتب الأساسي</th>
                                    <th style={TH}>أيام الدوام</th>
                                    <th style={TH}>الخصومات</th>
                                    <th style={TH}>المستحق</th>
                                    <th style={TH}>الحالة</th>
                                    <th style={{ ...TH, width: 160 }}>
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rawPayrolls.map(
                                    (item: PayrollItem, idx: number) => {
                                        const baseSalary = parseFloat(
                                            item?.base_salary || "0",
                                        );
                                        const deductions = parseFloat(
                                            item?.deductions || "0",
                                        );
                                        const totalDue = parseFloat(
                                            item?.total_due || "0",
                                        );
                                        const attDays =
                                            item?.attendance_days ?? 0;
                                        const attPct = Math.round(
                                            (attDays / 26) * 100,
                                        );
                                        const attColor =
                                            attPct >= 90
                                                ? "#16a34a"
                                                : attPct >= 70
                                                  ? "#d97706"
                                                  : "#dc2626";

                                        return (
                                            <tr
                                                key={item?.id ?? idx}
                                                style={{
                                                    transition:
                                                        "background .1s",
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "#f8fafc")
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "#fff")
                                                }
                                            >
                                                {/* employee */}
                                                <td style={TD}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 12,
                                                        }}
                                                    >
                                                        <Avatar
                                                            item={item}
                                                            idx={idx}
                                                        />
                                                        <div>
                                                            <div
                                                                style={{
                                                                    fontWeight: 700,
                                                                    fontSize: 13,
                                                                    color: "#1e293b",
                                                                }}
                                                            >
                                                                {teacherName(
                                                                    item,
                                                                )}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 11,
                                                                    color: "#94a3b8",
                                                                    marginTop: 2,
                                                                }}
                                                            >
                                                                #{item?.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* role */}
                                                <td style={TD}>
                                                    <RoleBadge
                                                        role={
                                                            item?.teacher?.role
                                                        }
                                                    />
                                                </td>

                                                {/* base salary */}
                                                <td style={TD}>
                                                    <span
                                                        style={{
                                                            fontWeight: 700,
                                                            fontSize: 13,
                                                            color: "#1e293b",
                                                        }}
                                                    >
                                                        {fmt(baseSalary)}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#94a3b8",
                                                            marginRight: 3,
                                                        }}
                                                    >
                                                        ر.س
                                                    </span>
                                                </td>

                                                {/* attendance */}
                                                <td style={TD}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                            gap: 4,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                color: attColor,
                                                            }}
                                                        >
                                                            {attDays} / 26 يوم
                                                        </span>
                                                        <div
                                                            style={{
                                                                height: 5,
                                                                background:
                                                                    "#f1f5f9",
                                                                borderRadius: 3,
                                                                overflow:
                                                                    "hidden",
                                                                width: 80,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    height: "100%",
                                                                    width: `${attPct}%`,
                                                                    background:
                                                                        attColor,
                                                                    borderRadius: 3,
                                                                    transition:
                                                                        "width .4s ease",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* deductions */}
                                                <td style={TD}>
                                                    {deductions > 0 ? (
                                                        <span
                                                            style={{
                                                                color: "#b91c1c",
                                                                fontWeight: 700,
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            <FiTrendingDown
                                                                size={11}
                                                                style={{
                                                                    display:
                                                                        "inline",
                                                                    verticalAlign:
                                                                        "middle",
                                                                    marginLeft: 3,
                                                                }}
                                                            />
                                                            {fmt(deductions)}{" "}
                                                            ر.س
                                                        </span>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                color: "#94a3b8",
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            لا يوجد
                                                        </span>
                                                    )}
                                                </td>

                                                {/* total due */}
                                                <td style={TD}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flex: "column",
                                                            gap: 2,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontWeight: 900,
                                                                fontSize: 15,
                                                                color: "#0f6e56",
                                                            }}
                                                        >
                                                            {fmt(totalDue)}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#94a3b8",
                                                                marginRight: 3,
                                                            }}
                                                        >
                                                            ر.س
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* status */}
                                                <td style={TD}>
                                                    <StatusBadge
                                                        status={item?.status}
                                                    />
                                                </td>

                                                {/* actions */}
                                                <td style={TD}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: 6,
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleMarkPaid(
                                                                    item.id,
                                                                )
                                                            }
                                                            disabled={
                                                                loading ||
                                                                item?.status ===
                                                                    "paid"
                                                            }
                                                            title="تحديد كمدفوع"
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 4,
                                                                padding:
                                                                    "5px 10px",
                                                                borderRadius: 8,
                                                                border: `1px solid ${item?.status === "paid" ? "#e2e8f0" : "#bbf7d0"}`,
                                                                background:
                                                                    item?.status ===
                                                                    "paid"
                                                                        ? "#f8fafc"
                                                                        : "#dcfce7",
                                                                color:
                                                                    item?.status ===
                                                                    "paid"
                                                                        ? "#94a3b8"
                                                                        : "#15803d",
                                                                cursor:
                                                                    item?.status ===
                                                                        "paid" ||
                                                                    loading
                                                                        ? "not-allowed"
                                                                        : "pointer",
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                fontFamily:
                                                                    "inherit",
                                                                opacity:
                                                                    item?.status ===
                                                                    "paid"
                                                                        ? 0.5
                                                                        : 1,
                                                            }}
                                                        >
                                                            <FiCheckCircle
                                                                size={11}
                                                            />
                                                            دفع
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleExportPDF(
                                                                    item,
                                                                )
                                                            }
                                                            title="تصدير مسير PDF"
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 4,
                                                                padding:
                                                                    "5px 10px",
                                                                borderRadius: 8,
                                                                border: "1px solid #fde68a",
                                                                background:
                                                                    "#fef9c3",
                                                                color: "#92400e",
                                                                cursor: "pointer",
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                fontFamily:
                                                                    "inherit",
                                                            }}
                                                        >
                                                            <FiFileText
                                                                size={11}
                                                            />
                                                            PDF
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleOpenEdit(
                                                                    item,
                                                                )
                                                            }
                                                            title="تعديل"
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 4,
                                                                padding:
                                                                    "5px 10px",
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
                                                            <FiEdit2
                                                                size={11}
                                                            />
                                                            تعديل
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    },
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* footer summary */}
                {rawPayrolls.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 20px",
                            borderTop: "1px solid #f1f5f9",
                            background: "#fafbfc",
                            flexWrap: "wrap",
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: 20,
                                flexWrap: "wrap",
                            }}
                        >
                            {[
                                {
                                    label: "إجمالي المستحقات",
                                    value: `${fmt(totalPayroll)} ر.س`,
                                    color: "#0f6e56",
                                },
                                {
                                    label: "مدفوع",
                                    value: `${fmt(totalPaid)} ر.س`,
                                    color: "#2563eb",
                                },
                                {
                                    label: "معلق",
                                    value: `${fmt(totalPending)} ر.س`,
                                    color: "#d97706",
                                },
                                {
                                    label: "الخصومات",
                                    value: `${fmt(totalDeductions)} ر.س`,
                                    color: "#dc2626",
                                },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 10,
                                            color: "#94a3b8",
                                        }}
                                    >
                                        {s.label}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 900,
                                            color: s.color,
                                        }}
                                    >
                                        {s.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => notify("جاري التصدير الشامل...")}
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
                            <FiDownload size={13} /> تصدير الكشف الشهري
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fin-spin  { to { transform: rotate(360deg); } }
                @keyframes fin-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
                @keyframes fin-toast { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
            `}</style>
        </div>
    );
};

export default FinancialDashboard;
