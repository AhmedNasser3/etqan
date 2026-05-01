// CenterDashboard.tsx — نسخة مكتملة بتصميم جديد + فلاتر + وضعان عرض
import { useState, useCallback, useMemo } from "react";
import { ICO } from "../icons";
import { useCenterDashboard } from "./hooks/useCenterStats";
import { useToast } from "../../../../contexts/ToastContext";
import CreateCustomSalaryModal from "./TeacherCustomSalaries/models/CreateCustomSalaryModal";
import CreateCirclePage from "./Circles/models/CreateCirclePage";
import FinancialDashboard from "../Financial/Dashboard/FinancialDashboard";
import {
    FiRefreshCw,
    FiFileText,
    FiSearch,
    FiX,
    FiGrid,
    FiList,
    FiFilter,
    FiChevronDown,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiUsers,
    FiBook,
    FiDollarSign,
    FiMapPin,
    FiDownload,
} from "react-icons/fi";
import { FaMosque, FaChalkboardTeacher } from "react-icons/fa";
import { BsPersonCheck, BsPersonX, BsPersonExclamation } from "react-icons/bs";

/* ══════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════ */
interface AttRecord {
    id: number;
    name: string;
    role: string;
    status: string;
    time: string;
    note: string;
}
type ViewMode = "table" | "cards";
type AttFilter = "all" | "حاضر" | "متأخر" | "غائب";

/* ══════════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════════ */
const ATTENDANCE_DATA: AttRecord[] = [
    {
        id: 1,
        name: "أحمد ناصر مصطفى",
        role: "معلم قرآن",
        status: "حاضر",
        time: "08:15",
        note: "",
    },
    {
        id: 2,
        name: "فاطمة عبدالله الزهراني",
        role: "مشرفة",
        status: "متأخر",
        time: "09:05",
        note: "ازدحام مروري",
    },
    {
        id: 3,
        name: "سارة محمد الغامدي",
        role: "شؤون الطلاب",
        status: "حاضر",
        time: "08:00",
        note: "",
    },
    {
        id: 4,
        name: "محمد علي الشمراني",
        role: "معلم قرآن",
        status: "غائب",
        time: "—",
        note: "إجازة مرضية",
    },
    {
        id: 5,
        name: "نورا إبراهيم العتيبي",
        role: "مشرفة تحفيز",
        status: "حاضر",
        time: "07:55",
        note: "",
    },
    {
        id: 6,
        name: "خالد سعد العنزي",
        role: "معلم قرآن",
        status: "متأخر",
        time: "09:30",
        note: "ظرف عائلي",
    },
];

const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

const STATUS_CFG: Record<
    string,
    { bg: string; color: string; border: string; dot: string }
> = {
    حاضر: {
        bg: "#dcfce7",
        color: "#15803d",
        border: "#bbf7d0",
        dot: "#16a34a",
    },
    متأخر: {
        bg: "#fef9c3",
        color: "#a16207",
        border: "#fde68a",
        dot: "#d97706",
    },
    غائب: {
        bg: "#fee2e2",
        color: "#b91c1c",
        border: "#fecaca",
        dot: "#dc2626",
    },
};

/* ══════════════════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════════════════ */
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

const StatusBadge = ({ status }: { status: string }) => {
    const s = STATUS_CFG[status] ?? STATUS_CFG["غائب"];
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
            {status}
        </span>
    );
};

const Btn = ({
    bg,
    color,
    border = "none",
    disabled = false,
    onClick,
    children,
    style: extra = {},
}: {
    bg: string;
    color: string;
    border?: string;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 10,
            border,
            background: bg,
            color,
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: 13,
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

const StatMini = ({
    label,
    value,
    color,
}: {
    label: string;
    value: string | number;
    color: string;
}) => (
    <div
        style={{
            textAlign: "center",
            background: "rgba(255,255,255,.06)",
            borderRadius: 12,
            padding: "10px 16px",
            minWidth: 70,
        }}
    >
        <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>
            {value}
        </div>
        <div
            style={{
                fontSize: 11,
                color: "rgba(255,255,255,.5)",
                marginTop: 4,
            }}
        >
            {label}
        </div>
    </div>
);

const KpiCard = ({
    icon,
    iconBg,
    iconColor,
    trend,
    trendUp,
    value,
    label,
}: {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    trend: string;
    trendUp: boolean;
    value: string;
    label: string;
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: 16,
            padding: "18px 20px",
            boxShadow: "0 2px 12px #0001",
            borderTop: `4px solid ${iconColor}`,
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
                    background: iconBg,
                    color: iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                }}
            >
                {icon}
            </div>
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: trendUp ? "#dcfce7" : "#f1f5f9",
                    color: trendUp ? "#15803d" : "#64748b",
                    padding: "3px 8px",
                    borderRadius: 20,
                }}
            >
                {trend}
            </span>
        </div>
        <div
            style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#1e293b",
                lineHeight: 1,
            }}
        >
            {value}
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
            {label}
        </div>
    </div>
);

const QuickActionCard = ({
    label,
    iconBg,
    iconColor,
    icon,
    onClick,
}: {
    label: string;
    iconBg: string;
    iconColor: string;
    icon: React.ReactNode;
    onClick: () => void;
}) => (
    <div
        onClick={onClick}
        style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "14px 10px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all .15s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
        }}
        onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = iconBg;
            (e.currentTarget as HTMLDivElement).style.borderColor =
                iconColor + "44";
        }}
        onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = "#f8fafc";
            (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
        }}
    >
        <div
            style={{
                width: 36,
                height: 36,
                background: iconBg,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: iconColor,
                fontSize: 16,
            }}
        >
            {icon}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
            {label}
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════
   Main
══════════════════════════════════════════════════════════ */
const CenterDashboard: React.FC = () => {
    const { stats, recentCircles, loading } = useCenterDashboard();
    const { notifySuccess } = useToast();

    const [attRunning, setAttRunning] = useState(false);
    const [showCreateSalary, setShowCreateSalary] = useState(false);
    const [showCreateCircle, setShowCreateCircle] = useState(false);
    const [showAttModal, setShowAttModal] = useState(false);

    /* circles view & filter */
    const [circleView, setCircleView] = useState<ViewMode>("table");
    const [circleSearch, setCircleSearch] = useState("");

    /* attendance modal filters */
    const [attSearch, setAttSearch] = useState("");
    const [attFilter, setAttFilter] = useState<AttFilter>("all");
    const [attView, setAttView] = useState<ViewMode>("table");

    const today = new Date();
    const pres = ATTENDANCE_DATA.filter((a) => a.status === "حاضر").length;
    const late = ATTENDANCE_DATA.filter((a) => a.status === "متأخر").length;
    const abs = ATTENDANCE_DATA.filter((a) => a.status === "غائب").length;
    const total = ATTENDANCE_DATA.length;
    const rate = total ? Math.round(((pres + late) / total) * 100) : 0;

    const toggleAtt = useCallback(() => setAttRunning((p) => !p), []);

    /* filtered circles */
    const filteredCircles = useMemo(
        () =>
            recentCircles.filter((c) => {
                const q = circleSearch.toLowerCase();
                return (
                    !q ||
                    c.name?.toLowerCase().includes(q) ||
                    c.mosque_name?.toLowerCase().includes(q) ||
                    c.teacher_name?.toLowerCase().includes(q)
                );
            }),
        [recentCircles, circleSearch],
    );

    /* quick actions */
    const quickActions = [
        {
            lbl: "إنشاء راتب مخصص",
            ico: <FiDollarSign size={16} />,
            bg: "#dcfce7",
            color: "#15803d",
            action: () => setShowCreateSalary(true),
        },
        {
            lbl: "حلقة جديدة",
            ico: <FiBook size={16} />,
            bg: "#dbeafe",
            color: "#2563eb",
            action: () => setShowCreateCircle(true),
        },
        {
            lbl: "تسجيل حضور",
            ico: <BsPersonCheck size={16} />,
            bg: "#dcfce7",
            color: "#059669",
            action: () => setShowAttModal(true),
        },
        {
            lbl: "مهمة جديدة",
            ico: <FiFileText size={16} />,
            bg: "#fef3c7",
            color: "#d97706",
            action: () => notifySuccess("قادمة قريباً"),
        },
        {
            lbl: "إنجاز طالب",
            ico: <FiCheckCircle size={16} />,
            bg: "#ede9fe",
            color: "#7c3aed",
            action: () => notifySuccess("قادمة قريباً"),
        },
        {
            lbl: "الطلبات المعلقة",
            ico: <FiClock size={16} />,
            bg: "#fee2e2",
            color: "#ef4444",
            action: () => {
                window.location.href = "/center-dashboard/booking-manegment";
            },
        },
    ];

    /* kpi cards */
    const kpiCards = [
        {
            icon: <FiUsers size={20} />,
            iconBg: "#dcfce7",
            iconColor: "#16a34a",
            trend: `▲ ${stats?.students.diff ?? 0}`,
            trendUp: true,
            value: loading ? "..." : String(stats?.students.total ?? 0),
            label: "إجمالي الطلاب",
        },
        {
            icon: <FiBook size={20} />,
            iconBg: "#dbeafe",
            iconColor: "#2563eb",
            trend: "● 0%",
            trendUp: false,
            value: loading ? "..." : String(stats?.circles.total ?? 0),
            label: "الحلقات النشطة",
        },
        {
            icon: <FaMosque size={20} />,
            iconBg: "#fef9c3",
            iconColor: "#d97706",
            trend: `● ${stats?.mosques ?? 0}`,
            trendUp: false,
            value: loading ? "..." : String(stats?.mosques ?? 0),
            label: "المساجد",
        },
        {
            icon: <FiDollarSign size={20} />,
            iconBg: "#ede9fe",
            iconColor: "#7c3aed",
            trend: "▲ 5%",
            trendUp: true,
            value: loading ? "..." : `${stats?.total_balance ?? 0} ر.س`,
            label: "المستحقات",
        },
    ];

    /* TH / TD */
    const TH: React.CSSProperties = {
        padding: "10px 14px",
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
        fontSize: 13,
        color: "#1e293b",
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
                padding: 20,
            }}
        >
            {/* ── Modals ── */}
            {showCreateSalary && (
                <CreateCustomSalaryModal
                    onClose={() => setShowCreateSalary(false)}
                    onSuccess={() => {
                        notifySuccess("تم إضافة الراتب المخصص بنجاح");
                        setShowCreateSalary(false);
                    }}
                />
            )}
            {showCreateCircle && (
                <CreateCirclePage
                    onClose={() => setShowCreateCircle(false)}
                    onSuccess={() => {
                        notifySuccess("تم إنشاء الحلقة بنجاح");
                        setShowCreateCircle(false);
                    }}
                />
            )}
            {showAttModal && (
                <AttendanceModal
                    data={ATTENDANCE_DATA}
                    onClose={() => setShowAttModal(false)}
                    search={attSearch}
                    setSearch={setAttSearch}
                    filter={attFilter}
                    setFilter={setAttFilter}
                    viewMode={attView}
                    setViewMode={setAttView}
                />
            )}

            {/* ── Hero Header ── */}
            <div
                style={{
                    background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                    borderRadius: 24,
                    padding: "28px 32px",
                    marginBottom: 20,
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
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 16,
                            marginBottom: 20,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: "#86efac",
                                    marginBottom: 4,
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
                                لوحة تحكم المركز
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                {today.toLocaleDateString("ar-SA", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
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
                            {attRunning && (
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
                                                "cd-pulse 1.4s ease-in-out infinite",
                                        }}
                                    />
                                    جلسة جارية
                                </span>
                            )}
                            <Btn
                                bg={
                                    attRunning
                                        ? "#dc2626"
                                        : "rgba(255,255,255,.15)"
                                }
                                color="#fff"
                                border="1px solid rgba(255,255,255,.2)"
                                onClick={toggleAtt}
                            >
                                {attRunning ? (
                                    <>
                                        <FiXCircle size={13} /> إيقاف الجلسة
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle size={13} /> بدء الجلسة
                                    </>
                                )}
                            </Btn>
                            <Btn
                                bg="rgba(255,255,255,.12)"
                                color="#fff"
                                border="1px solid rgba(255,255,255,.18)"
                                onClick={() => setShowAttModal(true)}
                            >
                                <FiUsers size={13} /> عرض الحضور
                            </Btn>
                            <Btn
                                bg="rgba(255,255,255,.12)"
                                color="#fff"
                                border="1px solid rgba(255,255,255,.18)"
                            >
                                <FiDownload size={13} /> تصدير PDF
                            </Btn>
                        </div>
                    </div>

                    {/* Attendance stats bar */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <StatMini label="حاضر" value={pres} color="#4ade80" />
                        <StatMini label="متأخر" value={late} color="#fbbf24" />
                        <StatMini label="غائب" value={abs} color="#f87171" />
                        <StatMini
                            label="نسبة الحضور"
                            value={rate + "%"}
                            color="#38bdf8"
                        />
                        <StatMini
                            label="الإجمالي"
                            value={total}
                            color="rgba(255,255,255,.7)"
                        />
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                    gap: 14,
                    marginBottom: 20,
                }}
            >
                {kpiCards.map((k, i) => (
                    <KpiCard key={i} {...k} />
                ))}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
                    gap: 16,
                    marginBottom: 16,
                }}
            >
                {/* ── Quick Actions ── */}
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 20,
                        padding: "18px 20px",
                        boxShadow: "0 2px 14px #0001",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 900,
                                fontSize: 15,
                                color: "#1e293b",
                            }}
                        >
                            إجراءات سريعة
                        </span>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3,1fr)",
                            gap: 10,
                        }}
                    >
                        {quickActions.map((q, i) => (
                            <QuickActionCard
                                key={i}
                                label={q.lbl}
                                iconBg={q.bg}
                                iconColor={q.color}
                                icon={q.ico}
                                onClick={q.action}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Circles ── */}
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 20,
                        padding: "18px 20px",
                        boxShadow: "0 2px 14px #0001",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 14,
                            flexWrap: "wrap",
                            gap: 8,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 900,
                                fontSize: 15,
                                color: "#1e293b",
                            }}
                        >
                            الحلقات النشطة
                        </span>
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                            }}
                        >
                            {/* search */}
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background: "#f8fafc",
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                <FiSearch size={12} color="#94a3b8" />
                                <input
                                    value={circleSearch}
                                    onChange={(e) =>
                                        setCircleSearch(e.target.value)
                                    }
                                    placeholder="بحث..."
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        outline: "none",
                                        fontSize: 12,
                                        width: 90,
                                        fontFamily: "inherit",
                                    }}
                                />
                                {circleSearch && (
                                    <button
                                        onClick={() => setCircleSearch("")}
                                        style={{
                                            border: "none",
                                            background: "none",
                                            cursor: "pointer",
                                            color: "#94a3b8",
                                            display: "flex",
                                            padding: 0,
                                        }}
                                    >
                                        <FiX size={10} />
                                    </button>
                                )}
                            </label>
                            {/* view toggle */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 3,
                                    background: "#f8fafc",
                                    borderRadius: 8,
                                    padding: 3,
                                }}
                            >
                                {(
                                    [
                                        ["table", "table"],
                                        ["cards", "cards"],
                                    ] as [ViewMode, string][]
                                ).map(([v]) => (
                                    <button
                                        key={v}
                                        onClick={() => setCircleView(v)}
                                        style={{
                                            padding: "4px 8px",
                                            borderRadius: 6,
                                            border: "none",
                                            cursor: "pointer",
                                            background:
                                                circleView === v
                                                    ? "#1e293b"
                                                    : "transparent",
                                            color:
                                                circleView === v
                                                    ? "#fff"
                                                    : "#64748b",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        {v === "table" ? (
                                            <FiList size={12} />
                                        ) : (
                                            <FiGrid size={12} />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <Btn
                                bg="#0f6e56"
                                color="#fff"
                                style={{ padding: "6px 12px", fontSize: 12 }}
                                onClick={() =>
                                    (window.location.href =
                                        "/center-dashboard/circle-manegment")
                                }
                            >
                                إدارة الكل
                            </Btn>
                        </div>
                    </div>

                    {loading ? (
                        <div
                            style={{
                                padding: "30px 0",
                                textAlign: "center",
                                color: "#94a3b8",
                                fontSize: 13,
                            }}
                        >
                            جاري التحميل...
                        </div>
                    ) : filteredCircles.length === 0 ? (
                        <div
                            style={{
                                padding: "30px 0",
                                textAlign: "center",
                                color: "#94a3b8",
                            }}
                        >
                            <div style={{ fontSize: 28, marginBottom: 8 }}>
                                📋
                            </div>
                            <div style={{ fontSize: 13 }}>
                                {circleSearch
                                    ? "لا توجد نتائج مطابقة"
                                    : "لا توجد حلقات بعد"}
                            </div>
                        </div>
                    ) : circleView === "table" ? (
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th style={TH}>الحلقة</th>
                                        <th style={TH}>المسجد</th>
                                        <th style={TH}>المعلم</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCircles.map((c, i) => (
                                        <tr
                                            key={c.id}
                                            style={{
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
                                            <td style={TD}>
                                                <span
                                                    style={{ fontWeight: 700 }}
                                                >
                                                    {c.name}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        fontSize: 12,
                                                        color: "#64748b",
                                                    }}
                                                >
                                                    <FaMosque
                                                        size={10}
                                                        style={{
                                                            color: "#0f6e56",
                                                        }}
                                                    />
                                                    {c.mosque_name}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        fontSize: 12,
                                                        color: "#64748b",
                                                    }}
                                                >
                                                    <FaChalkboardTeacher
                                                        size={10}
                                                        style={{
                                                            color: "#0284c7",
                                                        }}
                                                    />
                                                    {c.teacher_name}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            {filteredCircles.map((c, i) => (
                                <div
                                    key={c.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        background: "#f8fafc",
                                        borderRadius: 12,
                                        padding: "12px 14px",
                                        border: "1px solid #e2e8f0",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: "50%",
                                            background:
                                                AV_COLORS[i % AV_COLORS.length]
                                                    .bg,
                                            color: AV_COLORS[
                                                i % AV_COLORS.length
                                            ].color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {c.name?.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                fontSize: 13,
                                                color: "#1e293b",
                                            }}
                                        >
                                            {c.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "#94a3b8",
                                                display: "flex",
                                                gap: 10,
                                                marginTop: 3,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 3,
                                                }}
                                            >
                                                <FaMosque
                                                    size={9}
                                                    style={{ color: "#0f6e56" }}
                                                />
                                                {c.mosque_name}
                                            </span>
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 3,
                                                }}
                                            >
                                                <FaChalkboardTeacher
                                                    size={9}
                                                    style={{ color: "#0284c7" }}
                                                />
                                                {c.teacher_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Financial ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: "18px 20px",
                    boxShadow: "0 2px 14px #0001",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 16,
                    }}
                >
                    <span
                        style={{
                            fontWeight: 900,
                            fontSize: 15,
                            color: "#1e293b",
                        }}
                    >
                        مستحقات الرواتب
                    </span>
                    <Btn
                        bg="#0f6e56"
                        color="#fff"
                        style={{ padding: "6px 14px", fontSize: 12 }}
                        onClick={() =>
                            (window.location.href =
                                "/center-dashboard/financial-dashboard")
                        }
                    >
                        عرض الكل
                    </Btn>
                </div>
                <FinancialDashboard />
            </div>

            <style>{`
                @keyframes cd-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
            `}</style>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════
   Attendance Modal — كامل مع فلاتر + وضعان عرض
══════════════════════════════════════════════════════════ */
function AttendanceModal({
    data,
    onClose,
    search,
    setSearch,
    filter,
    setFilter,
    viewMode,
    setViewMode,
}: {
    data: AttRecord[];
    onClose: () => void;
    search: string;
    setSearch: (v: string) => void;
    filter: AttFilter;
    setFilter: (v: AttFilter) => void;
    viewMode: ViewMode;
    setViewMode: (v: ViewMode) => void;
}) {
    const filtered = useMemo(
        () =>
            data.filter((a) => {
                const q = search.toLowerCase();
                const mSearch =
                    !q ||
                    a.name.toLowerCase().includes(q) ||
                    a.role.toLowerCase().includes(q) ||
                    a.note.toLowerCase().includes(q);
                const mFilter = filter === "all" || a.status === filter;
                return mSearch && mFilter;
            }),
        [data, search, filter],
    );

    const counts = {
        all: data.length,
        حاضر: data.filter((a) => a.status === "حاضر").length,
        متأخر: data.filter((a) => a.status === "متأخر").length,
        غائب: data.filter((a) => a.status === "غائب").length,
    };

    const TH: React.CSSProperties = {
        padding: "10px 14px",
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
        fontSize: 13,
    };

    const exportCSV = () => {
        const rows = [
            ["الاسم", "الدور", "الحالة", "الوقت", "الملاحظة"],
            ...filtered.map((a) => [a.name, a.role, a.status, a.time, a.note]),
        ];
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const el = document.createElement("a");
        el.href = url;
        el.download = "attendance.csv";
        el.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 3000,
                background: "rgba(0,0,0,.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 24,
                    width: "100%",
                    maxWidth: 680,
                    maxHeight: "90vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "'Tajawal',sans-serif",
                    direction: "rtl",
                }}
            >
                {/* Modal header */}
                <div
                    style={{
                        background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                        padding: "20px 24px",
                        color: "#fff",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 14,
                        }}
                    >
                        <div>
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: 17,
                                    fontWeight: 900,
                                }}
                            >
                                سجل الحضور
                            </h3>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "rgba(255,255,255,.5)",
                                    marginTop: 2,
                                }}
                            >
                                عرض {filtered.length} من {data.length} موظف
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                            }}
                        >
                            <button
                                onClick={exportCSV}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background: "rgba(255,255,255,.12)",
                                    border: "1px solid rgba(255,255,255,.18)",
                                    borderRadius: 10,
                                    padding: "7px 14px",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                <FiDownload size={12} /> CSV
                            </button>
                            <button
                                onClick={onClose}
                                style={{
                                    background: "rgba(255,255,255,.1)",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    cursor: "pointer",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <FiX size={16} />
                            </button>
                        </div>
                    </div>
                    {/* mini stats */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[
                            { k: "all", l: "الكل", c: "rgba(255,255,255,.8)" },
                            { k: "حاضر", l: "حاضر", c: "#4ade80" },
                            { k: "متأخر", l: "متأخر", c: "#fbbf24" },
                            { k: "غائب", l: "غائب", c: "#f87171" },
                        ].map((s) => (
                            <button
                                key={s.k}
                                onClick={() => setFilter(s.k as AttFilter)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background:
                                        filter === s.k
                                            ? "rgba(255,255,255,.2)"
                                            : "rgba(255,255,255,.07)",
                                    border: `1px solid ${filter === s.k ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.1)"}`,
                                    borderRadius: 20,
                                    padding: "4px 12px",
                                    color: s.c,
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    transition: "all .15s",
                                }}
                            >
                                <span style={{ fontWeight: 900 }}>
                                    {counts[s.k as keyof typeof counts]}
                                </span>{" "}
                                {s.l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter bar */}
                <div
                    style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#f8fafc",
                            borderRadius: 10,
                            padding: "8px 12px",
                            flex: 1,
                            minWidth: 160,
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <FiSearch size={13} color="#94a3b8" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث بالاسم أو الدور..."
                            style={{
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: 13,
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
                    <div
                        style={{
                            display: "flex",
                            gap: 4,
                            background: "#f8fafc",
                            borderRadius: 10,
                            padding: 4,
                        }}
                    >
                        {(
                            [
                                ["table", "جدول"],
                                ["cards", "بطاقات"],
                            ] as [ViewMode, string][]
                        ).map(([v, l]) => (
                            <button
                                key={v}
                                onClick={() => setViewMode(v)}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: 12,
                                    fontFamily: "inherit",
                                    background:
                                        viewMode === v
                                            ? "#1e293b"
                                            : "transparent",
                                    color: viewMode === v ? "#fff" : "#64748b",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    transition: "all .15s",
                                }}
                            >
                                {v === "table" ? (
                                    <FiList size={12} />
                                ) : (
                                    <FiGrid size={12} />
                                )}
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div
                    style={{
                        overflowY: "auto",
                        flex: 1,
                        padding: viewMode === "cards" ? "16px 20px" : 0,
                    }}
                >
                    {filtered.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "50px 20px",
                                color: "#94a3b8",
                            }}
                        >
                            <div style={{ fontSize: 32, marginBottom: 8 }}>
                                🔍
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>
                                لا توجد نتائج
                            </div>
                        </div>
                    ) : viewMode === "table" ? (
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={TH}></th>
                                    <th style={TH}>الاسم</th>
                                    <th style={TH}>الدور</th>
                                    <th style={TH}>الحالة</th>
                                    <th style={TH}>الوقت</th>
                                    <th style={TH}>الملاحظة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((a, i) => (
                                    <tr
                                        key={a.id}
                                        style={{ transition: "background .1s" }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background =
                                                "#f8fafc")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background =
                                                "#fff")
                                        }
                                    >
                                        <td style={{ ...TD, width: 48 }}>
                                            <Avatar name={a.name} idx={i} />
                                        </td>
                                        <td style={TD}>
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    color: "#1e293b",
                                                }}
                                            >
                                                {a.name}
                                            </div>
                                        </td>
                                        <td style={TD}>
                                            <span
                                                style={{
                                                    background: "#f1f5f9",
                                                    color: "#475569",
                                                    padding: "3px 10px",
                                                    borderRadius: 20,
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {a.role}
                                            </span>
                                        </td>
                                        <td style={TD}>
                                            <StatusBadge status={a.status} />
                                        </td>
                                        <td
                                            style={{
                                                ...TD,
                                                fontWeight: 700,
                                                color: "#0284c7",
                                                direction: "ltr",
                                                textAlign: "left",
                                            }}
                                        >
                                            {a.time}
                                        </td>
                                        <td
                                            style={{
                                                ...TD,
                                                color: "#64748b",
                                                fontSize: 12,
                                            }}
                                        >
                                            {a.note || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fill,minmax(260px,1fr))",
                                gap: 12,
                            }}
                        >
                            {filtered.map((a, i) => (
                                <div
                                    key={a.id}
                                    style={{
                                        background: "#f8fafc",
                                        borderRadius: 14,
                                        padding: "14px 16px",
                                        border: "1px solid #e2e8f0",
                                        borderRight: `4px solid ${STATUS_CFG[a.status]?.dot || "#e2e8f0"}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Avatar name={a.name} idx={i} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: 13,
                                                    color: "#1e293b",
                                                }}
                                            >
                                                {a.name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#94a3b8",
                                                }}
                                            >
                                                {a.role}
                                            </div>
                                        </div>
                                        <StatusBadge status={a.status} />
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
                                                background: "#e0f2fe",
                                                color: "#0369a1",
                                                padding: "3px 10px",
                                                borderRadius: 20,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                direction: "ltr",
                                            }}
                                        >
                                            {a.time}
                                        </span>
                                        {a.note && (
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    color: "#64748b",
                                                    flex: 1,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {a.note}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "14px 20px",
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <Btn bg="#1e293b" color="#fff" onClick={onClose}>
                        إغلاق
                    </Btn>
                </div>
            </div>
        </div>
    );
}

export default CenterDashboard;
