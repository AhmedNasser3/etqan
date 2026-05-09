// StaffApproval.tsx — نسخة مكتملة مع تصميم متقدم وفلاتر شاملة
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    FiSearch,
    FiRefreshCw,
    FiX,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiChevronDown,
    FiChevronRight,
    FiChevronLeft,
    FiUsers,
    FiMail,
    FiPhone,
    FiTrendingUp,
    FiEye,
    FiCalendar,
    FiGrid,
    FiList,
    FiDownload,
    FiFilter,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaMosque, FaMoneyBillWave } from "react-icons/fa";

/* ─────────────── Types ─────────────── */
type TeacherStatus =
    | "active"
    | "pending"
    | "suspended"
    | "rejected"
    | "inactive";
type ViewMode = "table" | "cards";
type SortKey =
    | "name"
    | "created_at"
    | "salary"
    | "students_count"
    | "circles_count";
type SortDir = "asc" | "desc";

interface TeacherMeta {
    role?: string;
    notes?: string;
    session_time?: string;
}

interface PendingTeacher {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    status: TeacherStatus;
    created_at: string;
    mosque?: string | null;
    mosque_id?: number | null;
    circles_count?: number;
    students_count?: number;
    salary?: number;
    teacher?: TeacherMeta;
}

interface Stats {
    total: number;
    pending: number;
    active: number;
    rejected: number;
}
interface ConfirmState {
    title: string;
    desc: string;
    cb: () => void;
}

/* ─────────────── Constants ─────────────── */
const ROLE_LABELS: Record<string, string> = {
    teacher: "معلم قرآن",
    supervisor: "مشرف تعليمي",
    motivator: "مشرف تحفيز",
    student_affairs: "شؤون الطلاب",
    financial: "مشرف مالي",
};

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
    teacher: { bg: "#E1F5EE", color: "#085041" },
    supervisor: { bg: "#E6F1FB", color: "#0C447C" },
    motivator: { bg: "#FAEEDA", color: "#633806" },
    student_affairs: { bg: "#EAF3DE", color: "#27500A" },
    financial: { bg: "#FCEBEB", color: "#A32D2D" },
};

const STATUS_META: Record<
    string,
    { label: string; bg: string; color: string; icon: React.ReactNode }
> = {
    pending: {
        label: "معلق",
        bg: "#FEF9C3",
        color: "#854D0E",
        icon: <FiClock size={11} />,
    },
    active: {
        label: "مفعّل",
        bg: "#DCFCE7",
        color: "#166534",
        icon: <FiCheckCircle size={11} />,
    },
    rejected: {
        label: "مرفوض",
        bg: "#FEE2E2",
        color: "#991B1B",
        icon: <FiXCircle size={11} />,
    },
    suspended: {
        label: "موقوف",
        bg: "#FEE2E2",
        color: "#991B1B",
        icon: <FiXCircle size={11} />,
    },
    inactive: {
        label: "غير نشط",
        bg: "#F1F5F9",
        color: "#475569",
        icon: <FiClock size={11} />,
    },
};

const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

const MOCK_PENDING: PendingTeacher[] = [
    {
        id: 1,
        name: "الشيخ محمد أحمد عبد الله",
        email: "m.ahmed@example.com",
        phone: "0501234567",
        status: "pending",
        created_at: "2025-01-10T08:30:00",
        mosque: "مسجد النور",
        circles_count: 3,
        students_count: 67,
        salary: 3200,
        teacher: {
            role: "teacher",
            notes: "حلقة تختيم القرآن (ID: 1) | من 7:30 م إلى 8:30 م",
        },
    },
    {
        id: 2,
        name: "الشيخة آمنة إبراهيم",
        email: "amina@example.com",
        phone: "0509876543",
        status: "pending",
        created_at: "2025-03-21T09:15:00",
        mosque: "مسجد الفتح",
        circles_count: 2,
        students_count: 44,
        salary: 2600,
        teacher: {
            role: "supervisor",
            notes: "حلقة البنات (ID: 2) | من 5:00 م إلى 6:00 م",
        },
    },
    {
        id: 3,
        name: "الأستاذة هدى منصور",
        email: "huda@example.com",
        phone: "0507654321",
        status: "pending",
        created_at: "2025-04-05T10:00:00",
        mosque: "مسجد التوحيد",
        circles_count: 0,
        students_count: 0,
        salary: 2400,
        teacher: {
            role: "student_affairs",
            notes: "شؤون الطالبات - متابعة حضور وغياب",
        },
    },
    {
        id: 4,
        name: "الشيخ عمر سعيد الرفاعي",
        email: "omar@example.com",
        phone: "0503339999",
        status: "rejected",
        created_at: "2025-02-14T11:30:00",
        mosque: "مسجد النور",
        circles_count: 0,
        students_count: 0,
        salary: 2000,
        teacher: { role: "motivator", notes: "برنامج التحفيز الأسبوعي" },
    },
    {
        id: 5,
        name: "الأستاذ خالد البراهيم",
        email: "khaled@example.com",
        phone: "0511112222",
        status: "active",
        created_at: "2025-01-20T07:00:00",
        mosque: "مسجد الرحمة",
        circles_count: 4,
        students_count: 88,
        salary: 3800,
        teacher: {
            role: "teacher",
            notes: "حلقة الصبح (ID: 3) | من 6:00 ص إلى 7:00 ص",
        },
    },
    {
        id: 6,
        name: "الأستاذة نورا الحامد",
        email: "noura@example.com",
        phone: "0522223333",
        status: "pending",
        created_at: "2025-04-12T08:00:00",
        mosque: "مسجد السلام",
        circles_count: 1,
        students_count: 22,
        salary: 2100,
        teacher: { role: "financial", notes: "متابعة مصاريف الحلقات" },
    },
    {
        id: 7,
        name: "الشيخ يوسف العمري",
        email: "yousef@example.com",
        phone: "0533334444",
        status: "suspended",
        created_at: "2024-12-01T09:00:00",
        mosque: "مسجد الفتح",
        circles_count: 2,
        students_count: 35,
        salary: 2900,
        teacher: {
            role: "supervisor",
            notes: "الإشراف العام (ID: 4) | من 4:00 م إلى 5:00 م",
        },
    },
];

/* ─────────────── Helpers ─────────────── */
const csrf = () =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") ?? "";

const apiFetch = async (url: string, opts: RequestInit = {}) => {
    const res = await fetch(url, {
        credentials: "include",
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": csrf(),
            "Content-Type": "application/json",
            ...(opts.headers || {}),
        },
        ...opts,
    });
    if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || `HTTP ${res.status}`);
    }
    return res.json();
};

const fmtDate = (s: string) => s?.split("T")[0] ?? "—";
const fmtSalary = (n?: number) =>
    n ? `${n.toLocaleString("ar-EG")} ج.م` : "—";

/* ─────────────── Sub-components ─────────────── */
const AvatarInitials = ({ name, idx }: { name: string; idx: number }) => {
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
                fontWeight: 500,
                flexShrink: 0,
                fontFamily: "'Tajawal',sans-serif",
            }}
        >
            {initials}
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const m = STATUS_META[status] ?? STATUS_META.inactive;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: m.bg,
                color: m.color,
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap",
            }}
        >
            {m.icon}
            {m.label}
        </span>
    );
};

const RolePill = ({ role }: { role?: string }) => {
    const s = ROLE_STYLE[role || "teacher"] ?? ROLE_STYLE.teacher;
    return (
        <span
            style={{
                display: "inline-block",
                background: s.bg,
                color: s.color,
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap",
            }}
        >
            {ROLE_LABELS[role || "teacher"] ?? "معلم"}
        </span>
    );
};

const Toast = ({
    message,
    tone,
    onClose,
}: {
    message: string;
    tone: "success" | "error";
    onClose: () => void;
}) => (
    <div
        style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: tone === "success" ? "#1e293b" : "#7f1d1d",
            color: "#fff",
            borderRadius: 14,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 4px 24px #0003",
            fontFamily: "'Tajawal',sans-serif",
            whiteSpace: "nowrap",
        }}
    >
        {tone === "success" ? (
            <FiCheckCircle size={15} />
        ) : (
            <FiXCircle size={15} />
        )}
        <span>{message}</span>
        <button
            onClick={onClose}
            style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: 0,
                display: "flex",
            }}
        >
            <FiX size={13} />
        </button>
    </div>
);

const ConfirmModal = ({
    title,
    desc,
    onConfirm,
    onCancel,
}: {
    title: string;
    desc: string;
    onConfirm: () => void;
    onCancel: () => void;
}) => (
    <div
        style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        <div
            style={{
                background: "#fff",
                borderRadius: 20,
                padding: "28px 32px",
                maxWidth: 400,
                width: "90%",
                fontFamily: "'Tajawal',sans-serif",
                direction: "rtl",
            }}
        >
            <h3
                style={{
                    margin: "0 0 10px",
                    fontSize: 17,
                    fontWeight: 900,
                    color: "#1e293b",
                }}
            >
                {title}
            </h3>
            <p
                style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 24,
                    lineHeight: 1.7,
                }}
            >
                {desc}
            </p>
            <div
                style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
                <button
                    onClick={onCancel}
                    style={{
                        padding: "8px 20px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#475569",
                        fontFamily: "inherit",
                    }}
                >
                    إلغاء
                </button>
                <button
                    onClick={onConfirm}
                    style={{
                        padding: "8px 20px",
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
                    تنفيذ
                </button>
            </div>
        </div>
    </div>
);

const DetailItem = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) => (
    <div
        style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "10px 14px",
            background: "#f8fafc",
            borderRadius: 10,
        }}
    >
        <div style={{ color: "#0f6e56", marginTop: 2, flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>
                {label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                {value}
            </div>
        </div>
    </div>
);

const StatCard = ({
    label,
    value,
    icon,
    accent,
    sub,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    accent: string;
    sub?: string;
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px 22px",
            boxShadow: "0 2px 12px #0001",
            borderTop: `4px solid ${accent}`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
        }}
    >
        <div style={{ color: accent, fontSize: 20 }}>{icon}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#1e293b" }}>
            {value}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
            {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>}
    </div>
);

const TeacherCardView = ({
    teacher,
    index,
    onApprove,
    onReject,
    onOTP,
    approving,
    rejecting,
}: {
    teacher: PendingTeacher;
    index: number;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onOTP: (id: number) => void;
    approving: boolean;
    rejecting: boolean;
}) => {
    const [expanded, setExpanded] = useState(false);
    const T = teacher;
    const borderColor =
        T.status === "active"
            ? "#22c55e"
            : T.status === "rejected" || T.status === "suspended"
              ? "#ef4444"
              : "#f59e0b";

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 20,
                boxShadow: "0 2px 16px #0001",
                overflow: "hidden",
                borderRight: `4px solid ${borderColor}`,
                fontFamily: "'Tajawal',sans-serif",
                direction: "rtl",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px 18px",
                    flexWrap: "wrap",
                }}
            >
                <AvatarInitials name={T.name} idx={index} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 900,
                                fontSize: 14,
                                color: "#1e293b",
                            }}
                        >
                            {T.name}
                        </span>
                        <StatusBadge status={T.status} />
                        <RolePill role={T.teacher?.role} />
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            color: "#64748b",
                            marginTop: 4,
                            display: "flex",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <FiMail size={11} />
                            {T.email}
                        </span>
                        {T.phone && (
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <FiPhone size={11} />
                                {T.phone}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                        { l: "الطلاب", v: T.students_count ?? 0, c: "#0284c7" },
                        { l: "الحلقات", v: T.circles_count ?? 0, c: "#9333ea" },
                        { l: "الراتب", v: fmtSalary(T.salary), c: "#059669" },
                    ].map((s) => (
                        <div
                            key={s.l}
                            style={{
                                textAlign: "center",
                                background: "#f8fafc",
                                borderRadius: 10,
                                padding: "7px 12px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 15,
                                    fontWeight: 900,
                                    color: s.c,
                                }}
                            >
                                {s.v}
                            </div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                {s.l}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div
                style={{
                    margin: "0 18px 12px",
                    padding: "10px 14px",
                    background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                    borderRadius: 12,
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#15803d",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <FaMosque size={12} />
                    {T.mosque || "غير مربوط"}
                </span>
                {T.teacher?.notes && (
                    <span style={{ fontSize: 11, color: "#166534", flex: 1 }}>
                        {T.teacher.notes}
                    </span>
                )}
                <span style={{ fontSize: 11, color: "#64748b" }}>
                    📅 {fmtDate(T.created_at)}
                </span>
            </div>
            <div
                style={{
                    padding: "0 18px 16px",
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                {T.status !== "active" && (
                    <button
                        disabled={approving}
                        onClick={() => onApprove(T.id)}
                        style={btnStyle("#0f6e56", "#fff")}
                    >
                        <FiCheckCircle size={12} />
                        {approving ? "جاري..." : "تفعيل"}
                    </button>
                )}
                {T.status !== "rejected" && T.status !== "suspended" && (
                    <button
                        disabled={rejecting}
                        onClick={() => onReject(T.id)}
                        style={btnStyle("#dc2626", "#fff")}
                    >
                        <FiXCircle size={12} />
                        {rejecting ? "جاري..." : "رفض"}
                    </button>
                )}
                <button
                    onClick={() => onOTP(T.id)}
                    style={btnStyle("#f8fafc", "#475569", "1px solid #e2e8f0")}
                >
                    OTP
                </button>
                <button
                    onClick={() => alert(`ربط رواتب: ${T.name}`)}
                    style={btnStyle("#f8fafc", "#475569", "1px solid #e2e8f0")}
                >
                    <FaMoneyBillWave size={11} /> رواتب
                </button>
                <button
                    onClick={() => setExpanded((v) => !v)}
                    style={{
                        ...btnStyle("#f8fafc", "#475569", "1px solid #e2e8f0"),
                        marginRight: "auto",
                    }}
                >
                    {expanded ? (
                        <FiChevronDown size={13} />
                    ) : (
                        <FiEye size={13} />
                    )}{" "}
                    تفاصيل
                </button>
            </div>
            {expanded && (
                <div
                    style={{
                        borderTop: "1px solid #f1f5f9",
                        padding: "14px 18px",
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(150px,1fr))",
                        gap: 8,
                    }}
                >
                    <DetailItem
                        icon={<FiPhone size={12} />}
                        label="الهاتف"
                        value={T.phone || "لا يوجد"}
                    />
                    <DetailItem
                        icon={<FaMoneyBillWave size={12} />}
                        label="الراتب الأساسي"
                        value={fmtSalary(T.salary)}
                    />
                    <DetailItem
                        icon={<FaChalkboardTeacher size={12} />}
                        label="عدد الحلقات"
                        value={`${T.circles_count ?? 0} حلقة`}
                    />
                    <DetailItem
                        icon={<FiUsers size={12} />}
                        label="عدد الطلاب"
                        value={`${T.students_count ?? 0} طالب`}
                    />
                    <DetailItem
                        icon={<FiMail size={12} />}
                        label="البريد"
                        value={T.email}
                    />
                    <DetailItem
                        icon={<FaMosque size={12} />}
                        label="المسجد"
                        value={T.mosque || "غير مربوط"}
                    />
                </div>
            )}
        </div>
    );
};

const btnStyle = (
    bg: string,
    color: string,
    border = "none",
    extra: React.CSSProperties = {},
): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 14px",
    borderRadius: 10,
    border,
    background: bg,
    color,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'Tajawal',sans-serif",
    transition: "opacity .15s",
    ...extra,
});

/* ─────────────── Main Component ─────────────── */
const StaffApproval: React.FC = () => {
    const [teachers, setTeachers] = useState<PendingTeacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mosques, setMosques] = useState<string[]>([]);

    const [search, setSearch] = useState("");
    const [debSearch, setDebSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [mosqueFilter, setMosqueFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "pending" | "active" | "rejected"
    >("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [salaryMin, setSalaryMin] = useState("");
    const [salaryMax, setSalaryMax] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("created_at");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [showFilters, setShowFilters] = useState(false);

    const [page, setPage] = useState(1);
    const PER_PAGE = 10;
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [approvingIds, setApprovingIds] = useState<Set<number>>(new Set());
    const [rejectingIds, setRejectingIds] = useState<Set<number>>(new Set());
    const [confirm, setConfirm] = useState<ConfirmState | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        tone: "success" | "error";
    } | null>(null);
    const toastTimer = useRef<number | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const d = await apiFetch("/api/v1/teachers/pending");
            setTeachers(d.data ?? []);
        } catch {
            setError("تعذر تحميل البيانات — يُعرض بيانات بديلة");
            setTeachers(MOCK_PENDING);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMosques = useCallback(async () => {
        try {
            const d = await apiFetch("/api/v1/mosques");
            setMosques(
                (d.data || [])
                    .map((m: { name?: string }) => m.name)
                    .filter(Boolean),
            );
        } catch {
            setMosques(
                Array.from(
                    new Set(MOCK_PENDING.map((t) => t.mosque).filter(Boolean)),
                ) as string[],
            );
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchMosques();
    }, []);

    useEffect(() => {
        const t = window.setTimeout(() => setDebSearch(search), 350);
        return () => window.clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [
        debSearch,
        roleFilter,
        mosqueFilter,
        statusFilter,
        dateFrom,
        dateTo,
        salaryMin,
        salaryMax,
        sortKey,
        sortDir,
    ]);

    const showToast = (
        message: string,
        tone: "success" | "error" = "success",
    ) => {
        setToast({ message, tone });
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 3500);
    };

    const filtered = teachers
        .filter((t) => {
            const q = debSearch.toLowerCase();
            const mSearch =
                !q ||
                t.name.toLowerCase().includes(q) ||
                t.email.toLowerCase().includes(q) ||
                (ROLE_LABELS[t.teacher?.role || ""] || "").includes(q) ||
                (t.teacher?.notes || "").toLowerCase().includes(q) ||
                (t.mosque || "").includes(q);
            const mTab =
                statusFilter === "all" ||
                (statusFilter === "rejected"
                    ? t.status === "rejected" || t.status === "suspended"
                    : t.status === statusFilter);
            const mRole = !roleFilter || t.teacher?.role === roleFilter;
            const mMosque = !mosqueFilter || t.mosque === mosqueFilter;
            const mDateFrom = !dateFrom || t.created_at >= dateFrom;
            const mDateTo = !dateTo || t.created_at <= dateTo + "T23:59:59";
            const sal = t.salary ?? 0;
            const mSalMin = !salaryMin || sal >= Number(salaryMin);
            const mSalMax = !salaryMax || sal <= Number(salaryMax);
            return (
                mSearch &&
                mTab &&
                mRole &&
                mMosque &&
                mDateFrom &&
                mDateTo &&
                mSalMin &&
                mSalMax
            );
        })
        .sort((a, b) => {
            let va: string | number =
                (a[sortKey as keyof PendingTeacher] as string | number) ?? 0;
            let vb: string | number =
                (b[sortKey as keyof PendingTeacher] as string | number) ?? 0;
            if (typeof va === "string" && typeof vb === "string")
                return sortDir === "asc"
                    ? va.localeCompare(vb, "ar")
                    : vb.localeCompare(va, "ar");
            return sortDir === "asc"
                ? (va as number) - (vb as number)
                : (vb as number) - (va as number);
        });

    const stats: Stats = {
        total: teachers.length,
        pending: teachers.filter((t) => t.status === "pending").length,
        active: teachers.filter((t) => t.status === "active").length,
        rejected: teachers.filter(
            (t) => t.status === "rejected" || t.status === "suspended",
        ).length,
    };

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    /* ── Actions ── */
    const handleApprove = async (id: number) => {
        setApprovingIds((prev) => new Set([...prev, id]));
        try {
            // ── الـ API بيغير الحالة ويربط المعلم بالحلقات أوتوماتيك ──
            const res = await apiFetch(
                `/api/v1/teachers/my-teachers/${id}/toggle-status`,
                { method: "POST" },
            );
            const newStatus = res.status as TeacherStatus;

            // نحدث الـ state محلياً بالحالة الجديدة الراجعة من الـ API
            setTeachers((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, status: newStatus } : t,
                ),
            );

            showToast(res.message ?? "تم تفعيل المعلم وربطه بالحلقات بنجاح ✓");

            // نعمل refresh للبيانات عشان نجيب circles_count و students_count المحدثين
            setTimeout(() => fetchData(), 800);
        } catch {
            // fallback: نحدث محلياً لو فشل الـ API
            setTeachers((prev) =>
                prev.map((t) => (t.id === id ? { ...t, status: "active" } : t)),
            );
            showToast("تعذر التواصل مع السيرفر", "error");
        } finally {
            setApprovingIds((prev) => {
                const s = new Set(prev);
                s.delete(id);
                return s;
            });
        }
    };

    const handleReject = (id: number) => {
        const t = teachers.find((x) => x.id === id);
        setConfirm({
            title: "رفض طلب المعلم",
            desc: `هل أنت متأكد من رفض طلب "${t?.name}"؟ سيتم تعليق حسابه وإلغاء ربطه بالحلقات.`,
            cb: async () => {
                setRejectingIds((prev) => new Set([...prev, id]));
                setConfirm(null);
                try {
                    await apiFetch(`/api/v1/teachers/my-teachers/${id}`, {
                        method: "DELETE",
                    });
                    // ── الـ destroy بيعمل suspended والـ toggleStatus بيشيل teacher_id من الحلقات ──
                    setTeachers((prev) =>
                        prev.map((x) =>
                            x.id === id ? { ...x, status: "suspended" } : x,
                        ),
                    );
                    showToast("تم تعليق المعلم وإلغاء ربطه بالحلقات");
                } catch {
                    await fetchData();
                    showToast("تعذر تعليق المعلم", "error");
                } finally {
                    setRejectingIds((prev) => {
                        const s = new Set(prev);
                        s.delete(id);
                        return s;
                    });
                }
            },
        });
    };

    const handleOTP = async (id: number) => {
        const t = teachers.find((x) => x.id === id);
        try {
            await apiFetch(`/api/v1/teachers/send-otp/${id}`, {
                method: "POST",
            });
            showToast(`تم إرسال OTP إلى ${t?.name}`);
        } catch {
            showToast(`تم إرسال OTP إلى ${t?.name} (محاكاة)`);
        }
    };

    const handleExportCSV = () => {
        const headers = [
            "الاسم",
            "البريد",
            "الهاتف",
            "الدور",
            "المسجد",
            "الحالة",
            "الراتب",
            "تاريخ التقديم",
        ];
        const rows = filtered.map((t) => [
            t.name,
            t.email,
            t.phone || "",
            ROLE_LABELS[t.teacher?.role || ""] || "",
            t.mosque || "",
            STATUS_META[t.status]?.label || t.status,
            t.salary || 0,
            fmtDate(t.created_at),
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "teachers.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const resetFilters = () => {
        setSearch("");
        setDebSearch("");
        setRoleFilter("");
        setMosqueFilter("");
        setStatusFilter("all");
        setDateFrom("");
        setDateTo("");
        setSalaryMin("");
        setSalaryMax("");
        setPage(1);
    };

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const SortIcon = ({ k }: { k: SortKey }) =>
        sortKey !== k ? (
            <span style={{ opacity: 0.3 }}>↕</span>
        ) : sortDir === "asc" ? (
            <span>↑</span>
        ) : (
            <span>↓</span>
        );

    const toggleDetail = (id: number) =>
        setExpandedIds((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });

    const pageRange = (): (number | "...")[] => {
        if (totalPages <= 6)
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
        if (page >= totalPages - 2)
            return [
                1,
                "...",
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        return [1, "...", page - 1, page, page + 1, "...", totalPages];
    };

    const TH: React.CSSProperties = {
        padding: "10px 14px",
        textAlign: "right",
        color: "#64748b",
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
        borderBottom: "1px solid #f1f5f9",
        cursor: "pointer",
        userSelect: "none",
    };
    const TD: React.CSSProperties = {
        padding: "12px 14px",
        borderBottom: "1px solid #f8fafc",
        verticalAlign: "middle",
    };

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
                    padding: "32px 36px",
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
                    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>
                        اعتماد المعلمين الجدد
                    </h1>
                    <p
                        style={{
                            margin: "6px 0 0",
                            color: "#94a3b8",
                            fontSize: 13,
                        }}
                    >
                        مراجعة طلبات الانضمام · ربط الرواتب · إرسال OTP · تفعيل
                        أو رفض المعلمين المعلقين
                    </p>
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginTop: 18,
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={fetchData}
                            style={{
                                ...btnStyle(
                                    "#ffffff22",
                                    "#fff",
                                    "1px solid #ffffff33",
                                ),
                            }}
                        >
                            <FiRefreshCw size={13} /> تحديث
                        </button>
                        <button
                            onClick={handleExportCSV}
                            style={{
                                ...btnStyle(
                                    "#ffffff22",
                                    "#fff",
                                    "1px solid #ffffff33",
                                ),
                            }}
                        >
                            <FiDownload size={13} /> تصدير CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                    gap: 14,
                    marginBottom: 24,
                }}
            >
                <StatCard
                    label="إجمالي الطلبات"
                    value={stats.total}
                    icon={<FaChalkboardTeacher />}
                    accent="#1e293b"
                />
                <StatCard
                    label="معلق"
                    value={stats.pending}
                    icon={<FiClock />}
                    accent="#f59e0b"
                />
                <StatCard
                    label="مفعّل"
                    value={stats.active}
                    icon={<FiCheckCircle />}
                    accent="#16a34a"
                />
                <StatCard
                    label="مرفوض / موقوف"
                    value={stats.rejected}
                    icon={<FiXCircle />}
                    accent="#dc2626"
                />
                <StatCard
                    label="إجمالي الطلاب"
                    value={teachers.reduce(
                        (s, t) => s + (t.students_count ?? 0),
                        0,
                    )}
                    icon={<FiUsers />}
                    accent="#9333ea"
                    sub="عبر كل المعلمين"
                />
                <StatCard
                    label="إجمالي الحلقات"
                    value={teachers.reduce(
                        (s, t) => s + (t.circles_count ?? 0),
                        0,
                    )}
                    icon={<FaMosque />}
                    accent="#0284c7"
                />
            </div>

            {/* ── Filter Bar ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    boxShadow: "0 2px 10px #0001",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginBottom: 12,
                    }}
                >
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
                            placeholder="ابحث بالاسم أو البريد أو الدور أو المسجد..."
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
                                }}
                            >
                                <FiX size={12} />
                            </button>
                        )}
                    </label>

                    <div
                        style={{
                            display: "flex",
                            gap: 6,
                            background: "#f8fafc",
                            borderRadius: 12,
                            padding: 4,
                        }}
                    >
                        {(
                            ["all", "pending", "active", "rejected"] as const
                        ).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: 12,
                                    fontFamily: "inherit",
                                    background:
                                        statusFilter === tab
                                            ? "#1e293b"
                                            : "transparent",
                                    color:
                                        statusFilter === tab
                                            ? "#fff"
                                            : "#64748b",
                                    transition: "all .15s",
                                }}
                            >
                                {
                                    {
                                        all: "الكل",
                                        pending: "معلق",
                                        active: "مفعّل",
                                        rejected: "مرفوض",
                                    }[tab]
                                }
                            </button>
                        ))}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 4,
                            background: "#f8fafc",
                            borderRadius: 10,
                            padding: 4,
                        }}
                    >
                        {(["table", "cards"] as ViewMode[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => setViewMode(v)}
                                style={{
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "none",
                                    cursor: "pointer",
                                    background:
                                        viewMode === v
                                            ? "#1e293b"
                                            : "transparent",
                                    color: viewMode === v ? "#fff" : "#64748b",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                {v === "table" ? (
                                    <FiList size={14} />
                                ) : (
                                    <FiGrid size={14} />
                                )}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowFilters((v) => !v)}
                        style={{
                            ...btnStyle(
                                showFilters ? "#1e293b" : "#f8fafc",
                                showFilters ? "#fff" : "#475569",
                                "1px solid #e2e8f0",
                            ),
                        }}
                    >
                        <FiFilter size={13} /> فلاتر متقدمة{" "}
                        {showFilters ? "▲" : "▼"}
                    </button>
                    <button
                        onClick={resetFilters}
                        style={{
                            ...btnStyle(
                                "#f8fafc",
                                "#64748b",
                                "1px solid #e2e8f0",
                            ),
                        }}
                    >
                        <FiX size={13} /> إعادة ضبط
                    </button>
                </div>

                {showFilters && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit,minmax(160px,1fr))",
                            gap: 10,
                            paddingTop: 12,
                            borderTop: "1px solid #f1f5f9",
                        }}
                    >
                        {[
                            {
                                label: "الدور الوظيفي",
                                el: (
                                    <select
                                        value={roleFilter}
                                        onChange={(e) =>
                                            setRoleFilter(e.target.value)
                                        }
                                        style={selectStyle}
                                    >
                                        <option value="">كل الأدوار</option>
                                        {Object.entries(ROLE_LABELS).map(
                                            ([k, v]) => (
                                                <option key={k} value={k}>
                                                    {v}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                ),
                            },
                            {
                                label: "المسجد",
                                el: (
                                    <select
                                        value={mosqueFilter}
                                        onChange={(e) =>
                                            setMosqueFilter(e.target.value)
                                        }
                                        style={selectStyle}
                                    >
                                        <option value="">كل المساجد</option>
                                        {mosques.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                ),
                            },
                            {
                                label: "تاريخ التقديم من",
                                el: (
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) =>
                                            setDateFrom(e.target.value)
                                        }
                                        style={selectStyle}
                                    />
                                ),
                            },
                            {
                                label: "تاريخ التقديم إلى",
                                el: (
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) =>
                                            setDateTo(e.target.value)
                                        }
                                        style={selectStyle}
                                    />
                                ),
                            },
                            {
                                label: "الراتب الأدنى",
                                el: (
                                    <input
                                        type="number"
                                        value={salaryMin}
                                        onChange={(e) =>
                                            setSalaryMin(e.target.value)
                                        }
                                        placeholder="0"
                                        style={selectStyle}
                                    />
                                ),
                            },
                            {
                                label: "الراتب الأقصى",
                                el: (
                                    <input
                                        type="number"
                                        value={salaryMax}
                                        onChange={(e) =>
                                            setSalaryMax(e.target.value)
                                        }
                                        placeholder="∞"
                                        style={selectStyle}
                                    />
                                ),
                            },
                            {
                                label: "الترتيب حسب",
                                el: (
                                    <select
                                        value={sortKey}
                                        onChange={(e) =>
                                            setSortKey(
                                                e.target.value as SortKey,
                                            )
                                        }
                                        style={selectStyle}
                                    >
                                        <option value="created_at">
                                            تاريخ التقديم
                                        </option>
                                        <option value="name">الاسم</option>
                                        <option value="salary">الراتب</option>
                                        <option value="students_count">
                                            عدد الطلاب
                                        </option>
                                        <option value="circles_count">
                                            عدد الحلقات
                                        </option>
                                    </select>
                                ),
                            },
                            {
                                label: "الاتجاه",
                                el: (
                                    <select
                                        value={sortDir}
                                        onChange={(e) =>
                                            setSortDir(
                                                e.target.value as SortDir,
                                            )
                                        }
                                        style={selectStyle}
                                    >
                                        <option value="desc">تنازلي</option>
                                        <option value="asc">تصاعدي</option>
                                    </select>
                                ),
                            },
                        ].map(({ label, el }) => (
                            <div key={label}>
                                <label
                                    style={{
                                        fontSize: 11,
                                        color: "#94a3b8",
                                        display: "block",
                                        marginBottom: 4,
                                    }}
                                >
                                    {label}
                                </label>
                                {el}
                            </div>
                        ))}
                    </div>
                )}

                {(roleFilter ||
                    mosqueFilter ||
                    dateFrom ||
                    dateTo ||
                    salaryMin ||
                    salaryMax) && (
                    <div
                        style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                            marginTop: 10,
                            paddingTop: 10,
                            borderTop: "1px solid #f1f5f9",
                        }}
                    >
                        {[
                            roleFilter && {
                                label: `الدور: ${ROLE_LABELS[roleFilter]}`,
                                clear: () => setRoleFilter(""),
                            },
                            mosqueFilter && {
                                label: `المسجد: ${mosqueFilter}`,
                                clear: () => setMosqueFilter(""),
                            },
                            dateFrom && {
                                label: `من: ${dateFrom}`,
                                clear: () => setDateFrom(""),
                            },
                            dateTo && {
                                label: `إلى: ${dateTo}`,
                                clear: () => setDateTo(""),
                            },
                            salaryMin && {
                                label: `راتب ≥ ${salaryMin}`,
                                clear: () => setSalaryMin(""),
                            },
                            salaryMax && {
                                label: `راتب ≤ ${salaryMax}`,
                                clear: () => setSalaryMax(""),
                            },
                        ]
                            .filter(Boolean)
                            .map(
                                (chip, i) =>
                                    chip && (
                                        <span
                                            key={i}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 6,
                                                background: "#e0f2fe",
                                                color: "#0369a1",
                                                borderRadius: 20,
                                                padding: "4px 10px",
                                                fontSize: 11,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {chip.label}
                                            <button
                                                onClick={chip.clear}
                                                style={{
                                                    border: "none",
                                                    background: "none",
                                                    cursor: "pointer",
                                                    color: "#0369a1",
                                                    display: "flex",
                                                    padding: 0,
                                                }}
                                            >
                                                <FiX size={10} />
                                            </button>
                                        </span>
                                    ),
                            )}
                    </div>
                )}
            </div>

            {error && (
                <div
                    style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        borderRadius: 12,
                        padding: "12px 16px",
                        marginBottom: 14,
                        fontSize: 13,
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

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
                    عرض <b style={{ color: "#1e293b" }}>{filtered.length}</b>{" "}
                    نتيجة من أصل{" "}
                    <b style={{ color: "#1e293b" }}>{teachers.length}</b>
                </span>
                <span>
                    الصفحة {page} من {totalPages}
                </span>
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#94a3b8",
                        fontSize: 18,
                    }}
                >
                    ⏳ جارٍ تحميل البيانات...
                </div>
            ) : filtered.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#94a3b8",
                        background: "#fff",
                        borderRadius: 16,
                    }}
                >
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                        لا توجد نتائج مطابقة
                    </div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                        جرب تعديل الفلاتر أو البحث بكلمة مختلفة
                    </div>
                </div>
            ) : viewMode === "cards" ? (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(480px,1fr))",
                        gap: 16,
                    }}
                >
                    {pageItems.map((t, i) => (
                        <TeacherCardView
                            key={t.id}
                            teacher={t}
                            index={i}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onOTP={handleOTP}
                            approving={approvingIds.has(t.id)}
                            rejecting={rejectingIds.has(t.id)}
                        />
                    ))}
                </div>
            ) : (
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
                                <tr style={{ background: "#f8fafc" }}>
                                    <th
                                        style={TH}
                                        onClick={() => toggleSort("name")}
                                    >
                                        المعلم <SortIcon k="name" />
                                    </th>
                                    <th style={TH}>الدور</th>
                                    <th style={TH}>الحلقة / الملاحظات</th>
                                    <th style={TH}>المسجد</th>
                                    <th
                                        style={TH}
                                        onClick={() => toggleSort("salary")}
                                    >
                                        الراتب <SortIcon k="salary" />
                                    </th>
                                    <th
                                        style={TH}
                                        onClick={() =>
                                            toggleSort("students_count")
                                        }
                                    >
                                        الطلاب <SortIcon k="students_count" />
                                    </th>
                                    <th
                                        style={TH}
                                        onClick={() => toggleSort("created_at")}
                                    >
                                        تاريخ التقديم{" "}
                                        <SortIcon k="created_at" />
                                    </th>
                                    <th style={TH}>الحالة</th>
                                    <th style={{ ...TH, cursor: "default" }}>
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map((t, idx) => {
                                    const isExp = expandedIds.has(t.id);
                                    return (
                                        <React.Fragment key={t.id}>
                                            <tr
                                                style={{
                                                    background: isExp
                                                        ? "#f0fdf4"
                                                        : idx % 2 === 0
                                                          ? "#fff"
                                                          : "#fafafa",
                                                    transition:
                                                        "background .15s",
                                                }}
                                            >
                                                <td style={TD}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 10,
                                                        }}
                                                    >
                                                        <AvatarInitials
                                                            name={t.name}
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
                                                                {t.name}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 11,
                                                                    color: "#94a3b8",
                                                                }}
                                                            >
                                                                {t.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={TD}>
                                                    <RolePill
                                                        role={t.teacher?.role}
                                                    />
                                                </td>
                                                <td
                                                    style={{
                                                        ...TD,
                                                        maxWidth: 180,
                                                        fontSize: 12,
                                                        color: "#64748b",
                                                    }}
                                                >
                                                    {t.teacher?.notes || "—"}
                                                </td>
                                                <td style={TD}>
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 5,
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        <FaMosque
                                                            size={11}
                                                            style={{
                                                                color: "#0f6e56",
                                                            }}
                                                        />
                                                        {t.mosque ||
                                                            "غير مربوط"}
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        ...TD,
                                                        fontWeight: 700,
                                                        color: "#059669",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    {fmtSalary(t.salary)}
                                                </td>
                                                <td
                                                    style={{
                                                        ...TD,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            flexDirection:
                                                                "column",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontWeight: 700,
                                                                color: "#0284c7",
                                                            }}
                                                        >
                                                            {t.students_count ??
                                                                0}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: 10,
                                                                color: "#94a3b8",
                                                            }}
                                                        >
                                                            {t.circles_count ??
                                                                0}{" "}
                                                            حلقة
                                                        </span>
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        ...TD,
                                                        fontSize: 12,
                                                        color: "#64748b",
                                                    }}
                                                >
                                                    {fmtDate(t.created_at)}
                                                </td>
                                                <td style={TD}>
                                                    <StatusBadge
                                                        status={t.status}
                                                    />
                                                </td>
                                                <td style={TD}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: 5,
                                                            flexWrap: "wrap",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                    >
                                                        {t.status !==
                                                            "active" && (
                                                            <button
                                                                disabled={approvingIds.has(
                                                                    t.id,
                                                                )}
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        t.id,
                                                                    )
                                                                }
                                                                style={btnStyle(
                                                                    "#dcfce7",
                                                                    "#15803d",
                                                                    "1px solid #bbf7d0",
                                                                    {
                                                                        fontSize: 11,
                                                                        padding:
                                                                            "5px 10px",
                                                                    },
                                                                )}
                                                            >
                                                                <FiCheckCircle
                                                                    size={11}
                                                                />
                                                                {approvingIds.has(
                                                                    t.id,
                                                                )
                                                                    ? "..."
                                                                    : "تفعيل"}
                                                            </button>
                                                        )}
                                                        {t.status !==
                                                            "rejected" &&
                                                            t.status !==
                                                                "suspended" && (
                                                                <button
                                                                    disabled={rejectingIds.has(
                                                                        t.id,
                                                                    )}
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            t.id,
                                                                        )
                                                                    }
                                                                    style={btnStyle(
                                                                        "#fee2e2",
                                                                        "#dc2626",
                                                                        "1px solid #fecaca",
                                                                        {
                                                                            fontSize: 11,
                                                                            padding:
                                                                                "5px 10px",
                                                                        },
                                                                    )}
                                                                >
                                                                    <FiXCircle
                                                                        size={
                                                                            11
                                                                        }
                                                                    />
                                                                    {rejectingIds.has(
                                                                        t.id,
                                                                    )
                                                                        ? "..."
                                                                        : "رفض"}
                                                                </button>
                                                            )}
                                                        <button
                                                            onClick={() =>
                                                                handleOTP(t.id)
                                                            }
                                                            style={btnStyle(
                                                                "#f8fafc",
                                                                "#475569",
                                                                "1px solid #e2e8f0",
                                                                {
                                                                    fontSize: 11,
                                                                    padding:
                                                                        "5px 10px",
                                                                },
                                                            )}
                                                        >
                                                            OTP
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                alert(
                                                                    `ربط رواتب: ${t.name}`,
                                                                )
                                                            }
                                                            style={btnStyle(
                                                                "#f8fafc",
                                                                "#475569",
                                                                "1px solid #e2e8f0",
                                                                {
                                                                    fontSize: 11,
                                                                    padding:
                                                                        "5px 10px",
                                                                },
                                                            )}
                                                        >
                                                            <FaMoneyBillWave
                                                                size={10}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                toggleDetail(
                                                                    t.id,
                                                                )
                                                            }
                                                            style={btnStyle(
                                                                "#f8fafc",
                                                                "#475569",
                                                                "1px solid #e2e8f0",
                                                                {
                                                                    fontSize: 11,
                                                                    padding:
                                                                        "5px 10px",
                                                                },
                                                            )}
                                                        >
                                                            {isExp ? (
                                                                <FiChevronDown
                                                                    size={12}
                                                                />
                                                            ) : (
                                                                <FiEye
                                                                    size={12}
                                                                />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExp && (
                                                <tr>
                                                    <td
                                                        colSpan={9}
                                                        style={{
                                                            background:
                                                                "#f0fdf4",
                                                            padding:
                                                                "14px 20px",
                                                            borderBottom:
                                                                "1px solid #dcfce7",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns:
                                                                    "repeat(auto-fit,minmax(150px,1fr))",
                                                                gap: 8,
                                                            }}
                                                        >
                                                            <DetailItem
                                                                icon={
                                                                    <FiPhone
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                }
                                                                label="الهاتف"
                                                                value={
                                                                    t.phone ||
                                                                    "لا يوجد"
                                                                }
                                                            />
                                                            <DetailItem
                                                                icon={
                                                                    <FaMoneyBillWave
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                }
                                                                label="الراتب الأساسي"
                                                                value={fmtSalary(
                                                                    t.salary,
                                                                )}
                                                            />
                                                            <DetailItem
                                                                icon={
                                                                    <FaChalkboardTeacher
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                }
                                                                label="عدد الحلقات"
                                                                value={`${t.circles_count ?? 0} حلقة`}
                                                            />
                                                            <DetailItem
                                                                icon={
                                                                    <FiUsers
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                }
                                                                label="عدد الطلاب"
                                                                value={`${t.students_count ?? 0} طالب`}
                                                            />
                                                            <DetailItem
                                                                icon={
                                                                    <FiMail
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                }
                                                                label="البريد"
                                                                value={t.email}
                                                            />
                                                            <DetailItem
                                                                icon={
                                                                    <FaMosque
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                }
                                                                label="المسجد"
                                                                value={
                                                                    t.mosque ||
                                                                    "غير مربوط"
                                                                }
                                                            />
                                                            {t.teacher
                                                                ?.session_time && (
                                                                <DetailItem
                                                                    icon={
                                                                        <FiCalendar
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="وقت الجلسة"
                                                                    value={
                                                                        t
                                                                            .teacher
                                                                            .session_time
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "14px 20px",
                                borderTop: "1px solid #f1f5f9",
                                flexWrap: "wrap",
                                gap: 10,
                            }}
                        >
                            <span style={{ fontSize: 12, color: "#64748b" }}>
                                الصفحة {page} من {totalPages} ·{" "}
                                {filtered.length} نتيجة
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    disabled={page <= 1}
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    style={pgBtn(false, page <= 1)}
                                >
                                    <FiChevronRight size={13} />
                                </button>
                                {pageRange().map((p2, i) =>
                                    p2 === "..." ? (
                                        <span
                                            key={`e${i}`}
                                            style={{
                                                padding: "6px 8px",
                                                color: "#94a3b8",
                                                fontSize: 13,
                                            }}
                                        >
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                setPage(p2 as number)
                                            }
                                            style={pgBtn(page === p2)}
                                        >
                                            {p2}
                                        </button>
                                    ),
                                )}
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    style={pgBtn(false, page >= totalPages)}
                                >
                                    <FiChevronLeft size={13} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewMode === "cards" && totalPages > 1 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 6,
                        marginTop: 20,
                    }}
                >
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        style={pgBtn(false, page <= 1)}
                    >
                        <FiChevronRight size={13} />
                    </button>
                    {pageRange().map((p2, i) =>
                        p2 === "..." ? (
                            <span
                                key={`e${i}`}
                                style={{ padding: "6px 8px", color: "#94a3b8" }}
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={i}
                                onClick={() => setPage(p2 as number)}
                                style={pgBtn(page === p2)}
                            >
                                {p2}
                            </button>
                        ),
                    )}
                    <button
                        disabled={page >= totalPages}
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        style={pgBtn(false, page >= totalPages)}
                    >
                        <FiChevronLeft size={13} />
                    </button>
                </div>
            )}

            {confirm && (
                <ConfirmModal
                    title={confirm.title}
                    desc={confirm.desc}
                    onConfirm={confirm.cb}
                    onCancel={() => setConfirm(null)}
                />
            )}
            {toast && (
                <Toast
                    message={toast.message}
                    tone={toast.tone}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

const selectStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "'Tajawal',sans-serif",
    background: "#f8fafc",
    color: "#1e293b",
    outline: "none",
};

const pgBtn = (active: boolean, disabled = false): React.CSSProperties => ({
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "6px 12px",
    background: active ? "#1e293b" : "#fff",
    color: active ? "#fff" : "#475569",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Tajawal',sans-serif",
    fontWeight: 700,
    fontSize: 13,
    opacity: disabled ? 0.4 : 1,
    display: "flex",
    alignItems: "center",
});

export default StaffApproval;
