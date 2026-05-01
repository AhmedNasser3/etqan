// StaffAttendance.tsx — نسخة مكتملة بتصميم جديد كامل
import { useState } from "react";
import toast from "react-hot-toast";
import { FiFileText, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import {
    BsPersonCheck,
    BsPersonX,
    BsPersonExclamation,
    BsBarChart,
    BsClock,
    BsClipboardData,
    BsBuilding,
} from "react-icons/bs";
import {
    useStaffAttendance,
    StaffAttendance as StaffAttendanceType,
} from "./hooks/useStaffAttendance";

/* ═══════════════════════════════════════════════════════════
   Constants
═══════════════════════════════════════════════════════════ */
const STATUS_CFG = {
    present: {
        label: "حاضر",
        bg: "#dcfce7",
        color: "#15803d",
        border: "#bbf7d0",
        dot: "#16a34a",
    },
    late: {
        label: "متأخر",
        bg: "#fef9c3",
        color: "#a16207",
        border: "#fde68a",
        dot: "#d97706",
    },
    absent: {
        label: "غائب",
        bg: "#fee2e2",
        color: "#b91c1c",
        border: "#fecaca",
        dot: "#dc2626",
    },
} as const;

const ROLE_CFG: Record<string, { bg: string; color: string }> = {
    معلم: { bg: "#dcfce7", color: "#15803d" },
    "مشرف تعليمي": { bg: "#dbeafe", color: "#1d4ed8" },
    مدير: { bg: "#ede9fe", color: "#7c3aed" },
};
const roleStyle = (r: string) =>
    ROLE_CFG[r] ?? { bg: "#f1f5f9", color: "#475569" };

const DATE_LABELS = {
    today: "اليومي",
    yesterday: "الأمس",
    week: "الأسبوعي",
    month: "الشهري",
} as const;

const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

/* ═══════════════════════════════════════════════════════════
   Tiny helpers
═══════════════════════════════════════════════════════════ */
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

const StatusBadge = ({ status }: { status: keyof typeof STATUS_CFG }) => {
    const s = STATUS_CFG[status] ?? STATUS_CFG.absent;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap",
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: s.dot,
                    display: "inline-block",
                }}
            />
            {s.label}
        </span>
    );
};

const RolePill = ({ role }: { role: string }) => {
    const rs = roleStyle(role);
    return (
        <span
            style={{
                background: rs.bg,
                color: rs.color,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap",
                display: "inline-block",
            }}
        >
            {role}
        </span>
    );
};

const Spinner = () => (
    <div
        style={{
            width: 14,
            height: 14,
            border: "2px solid rgba(255,255,255,0.35)",
            borderTop: "2px solid #fff",
            borderRadius: "50%",
            animation: "ta-spin 0.7s linear infinite",
            display: "inline-block",
        }}
    />
);

const SkeletonRow = () => (
    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
        {[44, 160, 90, 110, 80, 70, 130, 110].map((w, j) => (
            <td key={j} style={{ padding: "14px 14px" }}>
                <div
                    style={{
                        height: 12,
                        width: w,
                        borderRadius: 6,
                        background:
                            "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                        backgroundSize: "200% 100%",
                        animation: "ta-shimmer 1.4s infinite",
                    }}
                />
            </td>
        ))}
    </tr>
);

/* ═══════════════════════════════════════════════════════════
   Stat Card
═══════════════════════════════════════════════════════════ */
const StatCard = ({
    label,
    value,
    icon: Icon,
    accent,
    bg,
}: {
    label: string;
    value: string | number;
    icon: any;
    accent: string;
    bg: string;
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: 16,
            padding: "18px 20px",
            boxShadow: "0 2px 12px #0001",
            borderTop: `4px solid ${accent}`,
            display: "flex",
            alignItems: "center",
            gap: 14,
        }}
    >
        <div
            style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: bg,
                color: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 20,
            }}
        >
            <Icon size={20} />
        </div>
        <div>
            <div
                style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: accent,
                    lineHeight: 1,
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 4,
                    fontWeight: 600,
                }}
            >
                {label}
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════
   Button helper
═══════════════════════════════════════════════════════════ */
const Btn = ({
    bg,
    color,
    border = "none",
    disabled = false,
    onClick,
    children,
    title,
    style: extra = {},
}: {
    bg: string;
    color: string;
    border?: string;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    title?: string;
    style?: React.CSSProperties;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 10,
            border,
            background: bg,
            color,
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Tajawal',sans-serif",
            opacity: disabled ? 0.6 : 1,
            transition: "opacity .15s",
            whiteSpace: "nowrap",
            ...extra,
        }}
    >
        {children}
    </button>
);

/* ═══════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════ */
const StaffAttendance: React.FC = () => {
    const {
        staff,
        stats,
        loading,
        search,
        dateFilter,
        error,
        isEmpty,
        setSearch,
        setDateFilter,
        fetchAttendance,
        markAttendance,
    } = useStaffAttendance();

    const [markingId, setMarkingId] = useState<number | null>(null);
    const [lateModal, setLateModal] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [lateReason, setLateReason] = useState("");
    const [lateMinutes, setLateMinutes] = useState(15);

    /* ── handlers ── */
    const handleMark = async (
        id: number,
        status: "present" | "late" | "absent",
        reason?: string,
        minutes?: number,
    ) => {
        setMarkingId(id);
        const ok = await markAttendance(id, status, reason, minutes);
        if (ok) {
            toast.success(
                status === "present"
                    ? "تم تسجيل الحضور ✓"
                    : status === "late"
                      ? "تم تسجيل التأخير ⚠"
                      : "تم تسجيل الغياب",
                { duration: 3000, position: "top-right" },
            );
            setTimeout(fetchAttendance, 800);
        } else {
            toast.error("فشل في التحديث — حاول مرة أخرى", {
                duration: 4000,
                position: "top-right",
            });
        }
        setMarkingId(null);
    };

    const handleLateSubmit = async () => {
        if (!lateModal) return;
        setLateModal(null);
        await handleMark(lateModal.id, "late", lateReason, lateMinutes);
        setLateReason("");
        setLateMinutes(15);
    };

    const handleExportPDF = () => {
        toast.loading("جاري إعداد ملف PDF...", { id: "pdf" });
        window.open(
            `/api/v1/attendance/export-pdf?date_filter=${dateFilter}`,
            "_blank",
        );
        setTimeout(() => toast.success("تم فتح الملف!", { id: "pdf" }), 1000);
    };

    /* ── error state ── */
    if (error)
        return (
            <div
                style={{
                    fontFamily: "'Tajawal',sans-serif",
                    direction: "rtl",
                    padding: 24,
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: "48px 24px",
                        color: "#b91c1c",
                        background: "#fee2e2",
                        borderRadius: 16,
                        margin: "24px auto",
                        maxWidth: 400,
                    }}
                >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⛔</div>
                    <div
                        style={{
                            fontWeight: 700,
                            marginBottom: 16,
                            fontSize: 15,
                        }}
                    >
                        خطأ في تحميل البيانات: {error}
                    </div>
                    <Btn bg="#dc2626" color="#fff" onClick={fetchAttendance}>
                        <FiRefreshCw size={14} /> إعادة المحاولة
                    </Btn>
                </div>
            </div>
        );

    /* ── TH / TD styles ── */
    const TH: React.CSSProperties = {
        padding: "11px 14px",
        textAlign: "right",
        color: "#64748b",
        fontWeight: 700,
        fontSize: 11,
        whiteSpace: "nowrap",
        borderBottom: "1px solid #f1f5f9",
        background: "#f8fafc",
    };
    const TD: React.CSSProperties = {
        padding: "12px 14px",
        borderBottom: "1px solid #f8fafc",
        verticalAlign: "middle",
    };

    /* ══════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════ */
    return (
        <div
            style={{
                fontFamily: "'Tajawal',sans-serif",
                direction: "rtl",
                background: "#f8fafc",
                minHeight: "100vh",
                padding: 24,
            }}
        >
            {/* ── Hero Header ── */}
            <div
                style={{
                    background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                    borderRadius: 24,
                    padding: "30px 36px",
                    marginBottom: 24,
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.06,
                        backgroundImage:
                            "radial-gradient(circle at 20% 50%,#fff 1px,transparent 1px)",
                        backgroundSize: "24px 24px",
                        pointerEvents: "none",
                    }}
                />
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            fontSize: 13,
                            color: "#86efac",
                            marginBottom: 4,
                        }}
                    >
                        ﷽ — منصة إتقان
                    </div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>
                        سجل الحضور {DATE_LABELS[dateFilter]}
                    </h1>
                    <p
                        style={{
                            margin: "6px 0 0",
                            color: "#94a3b8",
                            fontSize: 13,
                        }}
                    >
                        متابعة حضور وغياب وتأخير الكوادر التعليمية بشكل يومي
                        وأسبوعي وشهري
                    </p>
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginTop: 18,
                            flexWrap: "wrap",
                        }}
                    >
                        <Btn
                            bg="#ffffff22"
                            color="#fff"
                            border="1px solid #ffffff33"
                            onClick={fetchAttendance}
                            disabled={loading}
                        >
                            <FiRefreshCw
                                size={13}
                                style={{
                                    animation: loading
                                        ? "ta-spin 1s linear infinite"
                                        : "none",
                                }}
                            />{" "}
                            تحديث
                        </Btn>
                        <Btn
                            bg="#ffffff22"
                            color="#fff"
                            border="1px solid #ffffff33"
                            onClick={handleExportPDF}
                            disabled={loading || staff.length === 0}
                        >
                            <FiFileText size={13} /> تصدير PDF
                        </Btn>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
                    gap: 14,
                    marginBottom: 24,
                }}
            >
                <StatCard
                    label="الإجمالي"
                    value={stats.total}
                    icon={BsClipboardData}
                    accent="#6366f1"
                    bg="#eef2ff"
                />
                <StatCard
                    label="حاضر"
                    value={stats.present}
                    icon={BsPersonCheck}
                    accent="#16a34a"
                    bg="#dcfce7"
                />
                <StatCard
                    label="متأخر"
                    value={stats.late}
                    icon={BsPersonExclamation}
                    accent="#d97706"
                    bg="#fef9c3"
                />
                <StatCard
                    label="غائب"
                    value={stats.absent}
                    icon={BsPersonX}
                    accent="#dc2626"
                    bg="#fee2e2"
                />
                <StatCard
                    label="نسبة الحضور"
                    value={`${stats.monthlyAttendanceRate}%`}
                    icon={BsBarChart}
                    accent="#0891b2"
                    bg="#e0f2fe"
                />
                <StatCard
                    label="متوسط التأخير"
                    value={`${stats.avgDelay} د`}
                    icon={BsClock}
                    accent="#7c3aed"
                    bg="#ede9fe"
                />
            </div>

            {/* ── Filter Bar ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                    boxShadow: "0 2px 10px #0001",
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                {/* Search */}
                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#f8fafc",
                        borderRadius: 10,
                        padding: "8px 14px",
                        flex: 1,
                        minWidth: 200,
                        border: "1px solid #e2e8f0",
                    }}
                >
                    <FiSearch size={14} color="#94a3b8" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="بحث بالاسم أو الدور أو المركز..."
                        style={{
                            border: "none",
                            background: "transparent",
                            outline: "none",
                            fontSize: 13,
                            flex: 1,
                            fontFamily: "inherit",
                            color: "#1e293b",
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
                            <FiX size={12} />
                        </button>
                    )}
                </label>

                {/* Date filter pills */}
                <div
                    style={{
                        display: "flex",
                        gap: 6,
                        background: "#f8fafc",
                        borderRadius: 12,
                        padding: 4,
                    }}
                >
                    {(["today", "yesterday", "week", "month"] as const).map(
                        (d) => (
                            <button
                                key={d}
                                onClick={() => setDateFilter(d)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: 12,
                                    fontFamily: "inherit",
                                    background:
                                        dateFilter === d
                                            ? "#1e293b"
                                            : "transparent",
                                    color:
                                        dateFilter === d ? "#fff" : "#64748b",
                                    transition: "all .15s",
                                }}
                            >
                                {DATE_LABELS[d]}
                            </button>
                        ),
                    )}
                </div>
            </div>

            {/* ── Results count ── */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    fontSize: 13,
                    color: "#64748b",
                }}
            >
                <span>
                    عرض <b style={{ color: "#1e293b" }}>{staff.length}</b> موظف
                </span>
                {loading && (
                    <span
                        style={{
                            color: "#0284c7",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <FiRefreshCw
                            size={12}
                            style={{ animation: "ta-spin 1s linear infinite" }}
                        />{" "}
                        جاري التحديث...
                    </span>
                )}
            </div>

            {/* ── Table Shell ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 2px 16px #0001",
                }}
            >
                <div style={{ overflowX: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 13,
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={TH}></th>
                                <th style={TH}>الموظف</th>
                                <th style={TH}>الدور</th>
                                <th style={TH}>المركز</th>
                                <th style={TH}>الحالة</th>
                                <th style={TH}>التأخير</th>
                                <th style={TH}>الملاحظات</th>
                                <th style={{ ...TH, textAlign: "center" }}>
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Skeleton */}
                            {loading &&
                                [1, 2, 3, 4, 5].map((i) => (
                                    <SkeletonRow key={i} />
                                ))}

                            {/* Empty */}
                            {!loading && staff.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        style={{
                                            textAlign: "center",
                                            padding: "64px 20px",
                                            color: "#94a3b8",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 40,
                                                marginBottom: 12,
                                            }}
                                        >
                                            📋
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                color: "#64748b",
                                                marginBottom: 6,
                                            }}
                                        >
                                            {isEmpty
                                                ? "لا توجد سجلات حضور لهذه الفترة"
                                                : "لا توجد نتائج للبحث"}
                                        </div>
                                        <div style={{ fontSize: 12 }}>
                                            جرب تغيير الفترة الزمنية أو كلمة
                                            البحث
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Rows */}
                            {!loading &&
                                staff.map((item, idx) => {
                                    const isMarking = markingId === item.id;
                                    return (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid #f8fafc",
                                                transition: "background .12s",
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
                                            {/* Avatar */}
                                            <td style={{ ...TD, width: 52 }}>
                                                <Avatar
                                                    name={item.teacher_name}
                                                    idx={idx}
                                                />
                                            </td>

                                            {/* Name */}
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        color: "#1e293b",
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {item.teacher_name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#94a3b8",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {item.date}
                                                    {item.checkin_time
                                                        ? ` · ${item.checkin_time}`
                                                        : ""}
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td style={TD}>
                                                <RolePill role={item.role} />
                                            </td>

                                            {/* Center */}
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 5,
                                                        background: "#f1f5f9",
                                                        color: "#475569",
                                                        padding: "3px 10px",
                                                        borderRadius: 8,
                                                        fontSize: 11,
                                                        border: "1px solid #e2e8f0",
                                                    }}
                                                >
                                                    <BsBuilding size={11} />
                                                    {item.center_name}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td style={TD}>
                                                <StatusBadge
                                                    status={item.status as any}
                                                />
                                            </td>

                                            {/* Delay */}
                                            <td style={TD}>
                                                {item.delay_minutes > 0 ? (
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            background:
                                                                "#fef9c3",
                                                            color: "#a16207",
                                                            border: "1px solid #fde68a",
                                                            padding: "3px 10px",
                                                            borderRadius: 20,
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        <BsClock size={10} />
                                                        {item.delay_minutes} د
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: "#cbd5e1",
                                                        }}
                                                    >
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            {/* Notes */}
                                            <td
                                                style={{ ...TD, maxWidth: 170 }}
                                            >
                                                <span
                                                    title={item.notes}
                                                    style={{
                                                        display: "block",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        color: "#64748b",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    {item.notes || "—"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td
                                                style={{
                                                    ...TD,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 6,
                                                        justifyContent:
                                                            "center",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    {/* حاضر */}
                                                    <Btn
                                                        bg="#dcfce7"
                                                        color="#15803d"
                                                        border="1px solid #bbf7d0"
                                                        disabled={
                                                            isMarking || loading
                                                        }
                                                        onClick={() =>
                                                            handleMark(
                                                                item.id,
                                                                "present",
                                                            )
                                                        }
                                                        title="تسجيل حاضر"
                                                        style={{
                                                            padding: "5px 10px",
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        {isMarking ? (
                                                            <Spinner />
                                                        ) : (
                                                            "✓ حاضر"
                                                        )}
                                                    </Btn>
                                                    {/* متأخر */}
                                                    <Btn
                                                        bg="#fef9c3"
                                                        color="#a16207"
                                                        border="1px solid #fde68a"
                                                        disabled={
                                                            isMarking || loading
                                                        }
                                                        onClick={() => {
                                                            setLateModal({
                                                                id: item.id,
                                                                name: item.teacher_name,
                                                            });
                                                            setLateReason("");
                                                            setLateMinutes(15);
                                                        }}
                                                        title="تسجيل متأخر"
                                                        style={{
                                                            padding: "5px 10px",
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        ⚠ متأخر
                                                    </Btn>
                                                    {/* غائب */}
                                                    <Btn
                                                        bg="#fee2e2"
                                                        color="#dc2626"
                                                        border="1px solid #fecaca"
                                                        disabled={
                                                            isMarking || loading
                                                        }
                                                        onClick={() =>
                                                            handleMark(
                                                                item.id,
                                                                "absent",
                                                            )
                                                        }
                                                        title="تسجيل غائب"
                                                        style={{
                                                            padding: "5px 10px",
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        ✕ غائب
                                                    </Btn>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Late Reason Modal ── */}
            {lateModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.45)",
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
                            padding: 28,
                            width: "100%",
                            maxWidth: 440,
                            fontFamily: "'Tajawal',sans-serif",
                            direction: "rtl",
                        }}
                    >
                        {/* Modal header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 20,
                            }}
                        >
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    background: "#fef9c3",
                                    color: "#a16207",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 22,
                                }}
                            >
                                ⚠
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontWeight: 900,
                                        fontSize: 16,
                                        color: "#1e293b",
                                    }}
                                >
                                    تسجيل تأخير
                                </div>
                                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                                    {lateModal.name}
                                </div>
                            </div>
                            <button
                                onClick={() => setLateModal(null)}
                                style={{
                                    marginRight: "auto",
                                    border: "none",
                                    background: "#f8fafc",
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    cursor: "pointer",
                                    color: "#64748b",
                                }}
                            >
                                <FiX size={14} />
                            </button>
                        </div>

                        {/* Minutes */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={modalLabel}>
                                مدة التأخير (بالدقائق)
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                    marginBottom: 8,
                                }}
                            >
                                {[5, 10, 15, 20, 30, 45, 60].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setLateMinutes(m)}
                                        style={{
                                            padding: "6px 14px",
                                            borderRadius: 10,
                                            border: `1px solid ${lateMinutes === m ? "#a16207" : "#e2e8f0"}`,
                                            background:
                                                lateMinutes === m
                                                    ? "#fef9c3"
                                                    : "#f8fafc",
                                            color:
                                                lateMinutes === m
                                                    ? "#a16207"
                                                    : "#64748b",
                                            cursor: "pointer",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {m} د
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number"
                                min={1}
                                max={180}
                                value={lateMinutes}
                                onChange={(e) =>
                                    setLateMinutes(Number(e.target.value))
                                }
                                style={modalInput}
                                placeholder="أو اكتب عدد الدقائق"
                            />
                        </div>

                        {/* Reason */}
                        <div style={{ marginBottom: 22 }}>
                            <label style={modalLabel}>
                                سبب التأخير{" "}
                                <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                    marginBottom: 8,
                                }}
                            >
                                {[
                                    "ازدحام مروري",
                                    "ظرف طارئ",
                                    "أسباب صحية",
                                    "مشكلة في المواصلات",
                                    "أخرى",
                                ].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setLateReason(r)}
                                        style={{
                                            padding: "5px 12px",
                                            borderRadius: 10,
                                            border: `1px solid ${lateReason === r ? "#0f6e56" : "#e2e8f0"}`,
                                            background:
                                                lateReason === r
                                                    ? "#dcfce7"
                                                    : "#f8fafc",
                                            color:
                                                lateReason === r
                                                    ? "#15803d"
                                                    : "#64748b",
                                            cursor: "pointer",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={lateReason}
                                onChange={(e) => setLateReason(e.target.value)}
                                placeholder="أو اكتب السبب يدوياً..."
                                rows={2}
                                style={{
                                    ...modalInput,
                                    resize: "vertical",
                                    lineHeight: 1.6,
                                }}
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: 10 }}>
                            <Btn
                                bg="#0f6e56"
                                color="#fff"
                                onClick={handleLateSubmit}
                                disabled={!lateReason.trim()}
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    height: 42,
                                    fontSize: 14,
                                }}
                            >
                                ⚠ تسجيل التأخير
                            </Btn>
                            <Btn
                                bg="#f8fafc"
                                color="#475569"
                                border="1px solid #e2e8f0"
                                onClick={() => setLateModal(null)}
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    height: 42,
                                    fontSize: 14,
                                }}
                            >
                                إلغاء
                            </Btn>
                        </div>
                    </div>
                </div>
            )}

            {/* Global keyframes */}
            <style>{`
                @keyframes ta-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                @keyframes ta-spin    { to{transform:rotate(360deg)} }
            `}</style>
        </div>
    );
};

/* ── Modal style tokens ── */
const modalLabel: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    color: "#475569",
    fontWeight: 700,
    marginBottom: 8,
};
const modalInput: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 13,
    outline: "none",
    direction: "rtl",
    background: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box",
    fontFamily: "'Tajawal',sans-serif",
};

export default StaffAttendance;
