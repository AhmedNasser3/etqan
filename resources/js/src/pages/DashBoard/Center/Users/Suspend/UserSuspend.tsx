import React, { useEffect, useState } from "react";
import UserSuspendModel from "./models/UserSuspendModel";
import HistoryModel from "./models/HistoryModel";
import { useToast } from "../../../../../../contexts/ToastContext";
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
    FiTrash2,
    FiAlertTriangle,
    FiActivity,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaMosque, FaMoneyBillWave } from "react-icons/fa";

/* ─── Types ─── */
type TeacherStatus =
    | "active"
    | "suspended"
    | "inactive"
    | "pending"
    | "rejected";

interface TeacherMeta {
    role?: string;
    notes?: string;
    session_time?: "asr" | "maghrib" | string;
    mosque?: string | null;
    suspension_reason?: string | null;
    circles_count?: number;
    students_count?: number;
    salary?: number | null;
}

interface TeacherType {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    status: TeacherStatus | string;
    created_at?: string;
    updated_at: string;
    last_login?: string | null;
    mosque?: string | null;
    mosque_id?: number | null;
    suspension_reason?: string | null;
    circles_count?: number;
    students_count?: number;
    salary?: number | null;
    teacher?: TeacherMeta;
}

interface Stats {
    total: number;
    active: number;
    suspended: number;
    recent: number;
}
interface ConfirmState {
    title: string;
    desc: string;
    cb: () => void;
}

/* ─── Constants ─── */
const ROLE_LABELS: Record<string, string> = {
    teacher: "معلم قرآن",
    supervisor: "مشرف تعليمي",
    motivator: "مشرف تحفيز",
    student_affairs: "شؤون الطلاب",
    financial: "مشرف مالي",
};

const SESSION_LABELS: Record<string, string> = {
    asr: "حلقة العصر",
    maghrib: "حلقة المغرب",
};

const STATUS_META: Record<
    string,
    { label: string; bg: string; color: string; icon: React.ReactNode }
> = {
    active: {
        label: "مفعّل",
        bg: "#DCFCE7",
        color: "#166534",
        icon: <FiCheckCircle size={11} />,
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
    pending: {
        label: "معلّق",
        bg: "#FEF9C3",
        color: "#854D0E",
        icon: <FiClock size={11} />,
    },
    rejected: {
        label: "مرفوض",
        bg: "#FEE2E2",
        color: "#991B1B",
        icon: <FiXCircle size={11} />,
    },
};

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
    teacher: { bg: "#E1F5EE", color: "#085041" },
    supervisor: { bg: "#E6F1FB", color: "#0C447C" },
    motivator: { bg: "#FAEEDA", color: "#633806" },
    student_affairs: { bg: "#EAF3DE", color: "#27500A" },
    financial: { bg: "#FCEBEB", color: "#A32D2D" },
};

const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

const MOCK_USERS: TeacherType[] = [
    {
        id: 1,
        name: "الشيخ محمد فهد القرني",
        email: "m.fahd@example.com",
        phone: "0501234567",
        status: "active",
        created_at: "2025-01-10T08:30:00",
        updated_at: "2026-04-23T10:15:00",
        last_login: "2026-04-25 08:12",
        mosque: "مسجد النور",
        circles_count: 3,
        students_count: 67,
        salary: 3200,
        teacher: {
            role: "teacher",
            notes: "حلقة التلاوة بعد المغرب",
            session_time: "maghrib",
        },
    },
    {
        id: 2,
        name: "الشيخة آمنة إبراهيم",
        email: "amina@example.com",
        phone: "0509876543",
        status: "suspended",
        created_at: "2025-03-21T09:15:00",
        updated_at: "2026-04-21T13:40:00",
        last_login: "2026-04-20 19:30",
        mosque: "مسجد الفتح",
        suspension_reason: "تجاوزات في الالتزام بجدول الحلقة",
        circles_count: 2,
        students_count: 44,
        salary: 2600,
        teacher: {
            role: "supervisor",
            notes: "الإشراف على تقييم الطالبات",
            session_time: "asr",
        },
    },
    {
        id: 3,
        name: "الأستاذة هدى منصور",
        email: "huda@example.com",
        phone: "0507654321",
        status: "active",
        created_at: "2025-04-05T10:00:00",
        updated_at: "2026-04-25T11:00:00",
        last_login: "2026-04-25 09:00",
        mosque: "مسجد التوحيد",
        circles_count: 1,
        students_count: 18,
        salary: 2400,
        teacher: {
            role: "student_affairs",
            notes: "متابعة حضور وغياب الطالبات",
            session_time: "asr",
        },
    },
    {
        id: 4,
        name: "الشيخ عمر سعيد الرفاعي",
        email: "omar@example.com",
        phone: "0503339999",
        status: "suspended",
        created_at: "2025-02-14T11:30:00",
        updated_at: "2026-04-18T16:10:00",
        last_login: "2026-04-14 20:20",
        mosque: "مسجد النور",
        suspension_reason: "إيقاف مؤقت لحين مراجعة الإدارة",
        circles_count: 0,
        students_count: 0,
        salary: 2000,
        teacher: {
            role: "motivator",
            notes: "برنامج التحفيز الأسبوعي",
            session_time: "maghrib",
        },
    },
];

/* ─── Helpers ─── */
const normalizeTeacher = (item: any): TeacherType => {
    const mosqueName =
        typeof item?.mosque === "string"
            ? item.mosque
            : item?.mosque?.name || item?.teacher?.mosque || null;
    const mosqueId =
        typeof item?.mosque === "object" && item?.mosque?.id
            ? item.mosque.id
            : item?.mosque_id || null;
    return {
        id: item?.id,
        name: item?.name || "بدون اسم",
        email: item?.email || "—",
        phone: item?.phone || item?.teacher?.phone || null,
        status: item?.status || "inactive",
        created_at: item?.created_at || "",
        updated_at: item?.updated_at || item?.created_at || "",
        last_login: item?.last_login || item?.teacher?.last_login || null,
        mosque: mosqueName,
        mosque_id: mosqueId,
        suspension_reason:
            item?.suspension_reason ||
            item?.teacher?.suspension_reason ||
            item?.reason ||
            null,
        circles_count: item?.circles_count ?? item?.teacher?.circles_count ?? 0,
        students_count:
            item?.students_count ?? item?.teacher?.students_count ?? 0,
        salary: item?.salary ?? item?.teacher?.salary ?? null,
        teacher: {
            role: item?.teacher?.role || item?.role || "teacher",
            notes: item?.teacher?.notes || item?.notes || "",
            session_time:
                item?.teacher?.session_time || item?.session_time || "",
            mosque: mosqueName,
            suspension_reason:
                item?.teacher?.suspension_reason ||
                item?.suspension_reason ||
                null,
            circles_count:
                item?.teacher?.circles_count ?? item?.circles_count ?? 0,
            students_count:
                item?.teacher?.students_count ?? item?.students_count ?? 0,
            salary: item?.teacher?.salary ?? item?.salary ?? null,
        },
    };
};

const formatDate = (v?: string | null) =>
    !v ? "—" : v.split("T")[0].split(" ")[0];
const dateValue = (v?: string | null) => {
    if (!v) return 0;
    const t = new Date(v.includes("T") ? v : v.replace(" ", "T")).getTime();
    return isNaN(t) ? 0 : t;
};
const isRecent = (v?: string | null) => {
    const t = dateValue(v);
    return t ? Date.now() - t <= 7 * 24 * 60 * 60 * 1000 : false;
};
const getMosqueName = (t: TeacherType) =>
    t.mosque || t.teacher?.mosque || "غير مربوط";
const getCircleInfo = (t: TeacherType) => {
    if (t.teacher?.notes) return t.teacher.notes;
    if (t.teacher?.session_time === "asr") return "حلقة العصر";
    if (t.teacher?.session_time === "maghrib") return "حلقة المغرب";
    return "غير محدد";
};
const getReason = (t: TeacherType) =>
    t.suspension_reason || t.teacher?.suspension_reason || "غير محدد";
const csrf = () =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") || "";

/* ─── Avatar Illustration ─── */
const TeacherAvatar = ({ idx, name }: { idx: number; name: string }) => {
    const av = AV_COLORS[idx % AV_COLORS.length];
    const skins = ["#F5D3A8", "#E8B97A", "#D4915A", "#C8784A"];
    const robes = [
        "#1A5C3A",
        "#C9A84C",
        "#1565C0",
        "#6D4C41",
        "#7B3F6E",
        "#2D5A8A",
    ];
    const skin = skins[idx % skins.length];
    const robe = robes[idx % robes.length];
    return (
        <div
            style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: av.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
                border: `2px solid ${av.color}22`,
            }}
        >
            <svg
                viewBox="0 0 80 80"
                width="44"
                height="44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M8 82C8 56 22 49 40 49C58 49 72 56 72 82Z"
                    fill={robe}
                />
                <path
                    d="M33 49C33 49 40 56 47 49"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    fill="none"
                />
                <rect x="35" y="42" width="10" height="9" rx="3" fill={skin} />
                <ellipse cx="40" cy="31" rx="14" ry="15" fill={skin} />
                <path
                    d="M26 27C26 18.7 32.3 12 40 12C47.7 12 54 18.7 54 27H26Z"
                    fill="#2C1810"
                    fillOpacity="0.85"
                />
                <rect
                    x="26"
                    y="25"
                    width="28"
                    height="4"
                    rx="2"
                    fill="#fff"
                    fillOpacity="0.15"
                />
                <path
                    d="M29 40Q34 50 40 51Q46 50 51 40Q48 46 40 48Q32 46 29 40Z"
                    fill="#2C1810"
                    fillOpacity="0.55"
                />
                <ellipse cx="35.5" cy="32" rx="2.2" ry="2.5" fill="#fff" />
                <ellipse cx="44.5" cy="32" rx="2.2" ry="2.5" fill="#fff" />
                <circle cx="36" cy="32.5" r="1.4" fill="#1a0f0a" />
                <circle cx="45" cy="32.5" r="1.4" fill="#1a0f0a" />
                <circle cx="36.6" cy="31.8" r="0.5" fill="#fff" />
                <circle cx="45.6" cy="31.8" r="0.5" fill="#fff" />
                <path
                    d="M33 29Q35.5 27.5 38 29"
                    stroke="#2C1810"
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M42 29Q44.5 27.5 47 29"
                    stroke="#2C1810"
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M37 38Q40 41 43 38"
                    stroke="#B87040"
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinecap="round"
                />
                <ellipse cx="26.5" cy="33" rx="2" ry="3" fill={skin} />
                <ellipse cx="53.5" cy="33" rx="2" ry="3" fill={skin} />
            </svg>
        </div>
    );
};

/* ─── Status Badge ─── */
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

/* ─── Role Pill ─── */
const RolePill = ({ role }: { role?: string }) => {
    const s = ROLE_STYLE[role || "teacher"] ?? ROLE_STYLE.teacher;
    return (
        <span
            style={{
                display: "inline-block",
                background: s.bg,
                color: s.color,
                borderRadius: 20,
                padding: "2px 10px",
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap",
            }}
        >
            {ROLE_LABELS[role || "teacher"] ?? "موظف"}
        </span>
    );
};

/* ─── Info Tile ─── */
const InfoTile = ({
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
            borderRadius: 12,
            flex: 1,
            minWidth: 130,
        }}
    >
        <div style={{ color: "#0f6e56", marginTop: 2, flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <div
                style={{
                    fontSize: 10,
                    color: "#94a3b8",
                    marginBottom: 2,
                    fontWeight: 600,
                }}
            >
                {label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                {value}
            </div>
        </div>
    </div>
);

/* ─── Confirm Modal ─── */
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
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                }}
            >
                <FiTrash2 size={16} color="#A32D2D" />
                <h3
                    style={{
                        margin: 0,
                        fontSize: 17,
                        fontWeight: 900,
                        color: "#1e293b",
                    }}
                >
                    {title}
                </h3>
            </div>
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
                    style={btnS("#f8fafc", "#475569", "1px solid #e2e8f0")}
                >
                    إلغاء
                </button>
                <button onClick={onConfirm} style={btnS("#dc2626", "#fff")}>
                    تنفيذ
                </button>
            </div>
        </div>
    </div>
);

/* ─── Style helpers ─── */
const btnS = (
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
    ...extra,
});

const TH: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "right",
    color: "#64748b",
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: "nowrap",
    borderBottom: "1px solid #f1f5f9",
};
const TD: React.CSSProperties = {
    padding: "12px 14px",
    borderBottom: "1px solid #f8fafc",
    verticalAlign: "middle",
};

/* ─── API Hook ─── */
const useUserSuspendData = () => {
    const [teachers, setTeachers] = useState<TeacherType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mosques, setMosques] = useState<string[]>([]);

    const apiFetch = async (url: string, options: RequestInit = {}) => {
        const headers: Record<string, string> = {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": csrf(),
        };
        if (!(options.body instanceof FormData))
            headers["Content-Type"] = "application/json";
        const res = await fetch(url, {
            credentials: "include",
            ...options,
            headers: {
                ...headers,
                ...((options.headers as Record<string, string> | undefined) ||
                    {}),
            },
        });
        if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            throw new Error(d.message || `HTTP ${res.status}`);
        }
        if (res.status === 204) return null;
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) return null;
        return res.json();
    };

    const fetchTeachers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch(
                "/api/v1/teachers/my-teachers?per_page=100",
            );
            const rows = Array.isArray(data?.data) ? data.data : [];
            setTeachers(rows.map(normalizeTeacher));
            return true;
        } catch {
            setError(
                "تعذر تحميل البيانات من الـ API، تم عرض بيانات بديلة مؤقتًا.",
            );
            setTeachers(MOCK_USERS);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const fetchMosques = async () => {
        try {
            const data = await apiFetch("/api/v1/mosques");
            setMosques(
                (data?.data || [])
                    .map((m: { name?: string }) => m?.name)
                    .filter(Boolean),
            );
        } catch {
            setMosques(
                Array.from(
                    new Set(MOCK_USERS.map((t) => t.mosque).filter(Boolean)),
                ) as string[],
            );
        }
    };

    const toggleTeacherStatus = async (id: number) =>
        apiFetch(`/api/v1/teachers/my-teachers/${id}/toggle-status`, {
            method: "POST",
        });
    const removeTeacher = async (id: number) =>
        apiFetch(`/api/v1/teachers/my-teachers/${id}`, { method: "DELETE" });

    useEffect(() => {
        fetchTeachers();
        fetchMosques();
    }, []);

    return {
        teachers,
        setTeachers,
        loading,
        error,
        mosques,
        fetchTeachers,
        toggleTeacherStatus,
        removeTeacher,
    };
};

/* ─── Main Component ─── */
const UserSuspend: React.FC = () => {
    const {
        teachers,
        setTeachers,
        loading,
        error,
        mosques,
        fetchTeachers,
        toggleTeacherStatus,
        removeTeacher,
    } = useUserSuspendData();
    const { notifySuccess, notifyError } = useToast();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [mosqueFilter, setMosqueFilter] = useState("");
    const [sessionFilter, setSessionFilter] = useState("");
    const [activeTab, setActiveTab] = useState<
        "all" | "active" | "suspended" | "inactive"
    >("all");
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    const [confirm, setConfirm] = useState<ConfirmState | null>(null);
    const [showUserSuspendModel, setShowUserSuspendModel] = useState(false);
    const [showHistoryModel, setShowHistoryModel] = useState(false);

    useEffect(() => {
        const t = window.setTimeout(() => setDebouncedSearch(search), 350);
        return () => window.clearTimeout(t);
    }, [search]);

    const mosqueOptions = Array.from(
        new Set(
            [...mosques, ...teachers.map((t) => getMosqueName(t))]
                .filter(Boolean)
                .filter((n) => n !== "غير مربوط"),
        ),
    ) as string[];

    const filtered = teachers
        .filter((t) => {
            const q = debouncedSearch.trim().toLowerCase();
            const matchSearch =
                !q ||
                t.name.toLowerCase().includes(q) ||
                t.email.toLowerCase().includes(q) ||
                (ROLE_LABELS[t.teacher?.role || ""] || "")
                    .toLowerCase()
                    .includes(q) ||
                (getCircleInfo(t) || "").toLowerCase().includes(q) ||
                (getMosqueName(t) || "").toLowerCase().includes(q) ||
                (getReason(t) || "").toLowerCase().includes(q);
            const matchTab = activeTab === "all" || t.status === activeTab;
            const matchRole = !roleFilter || t.teacher?.role === roleFilter;
            const matchMosque =
                !mosqueFilter || getMosqueName(t) === mosqueFilter;
            const matchSession =
                !sessionFilter || t.teacher?.session_time === sessionFilter;
            return (
                matchSearch &&
                matchTab &&
                matchRole &&
                matchMosque &&
                matchSession
            );
        })
        .sort((a, b) => dateValue(b.updated_at) - dateValue(a.updated_at));

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const stats: Stats = {
        total: teachers.length,
        active: teachers.filter((t) => t.status === "active").length,
        suspended: teachers.filter((t) => t.status === "suspended").length,
        recent: teachers.filter((t) => isRecent(t.updated_at)).length,
    };

    const handleToggleSuspend = async (teacher: TeacherType) => {
        const nextStatus = teacher.status === "active" ? "suspended" : "active";
        setTogglingIds((prev) => new Set([...prev, teacher.id]));
        setTeachers((prev) =>
            prev.map((item) =>
                item.id === teacher.id
                    ? {
                          ...item,
                          status: nextStatus,
                          updated_at: new Date().toISOString(),
                      }
                    : item,
            ),
        );
        try {
            await toggleTeacherStatus(teacher.id);
            notifySuccess(
                nextStatus === "active"
                    ? "تم تفعيل الموظف بنجاح"
                    : "تم إيقاف الموظف بنجاح",
            );
        } catch (err: any) {
            await fetchTeachers();
            notifyError(err?.message || "تعذر تحديث حالة الموظف");
        } finally {
            setTogglingIds((prev) => {
                const s = new Set(prev);
                s.delete(teacher.id);
                return s;
            });
        }
    };

    const handleDelete = (teacher: TeacherType) => {
        setConfirm({
            title: "حذف الموظف نهائيًا",
            desc: `هل أنت متأكد من حذف "${teacher.name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
            cb: async () => {
                setDeletingIds((prev) => new Set([...prev, teacher.id]));
                setConfirm(null);
                try {
                    await removeTeacher(teacher.id);
                    setTeachers((prev) =>
                        prev.filter((item) => item.id !== teacher.id),
                    );
                    notifySuccess("تم حذف الموظف بنجاح");
                } catch (err: any) {
                    notifyError(err?.message || "تعذر حذف الموظف");
                } finally {
                    setDeletingIds((prev) => {
                        const s = new Set(prev);
                        s.delete(teacher.id);
                        return s;
                    });
                }
            },
        });
    };

    const handleRefresh = async () => {
        const ok = await fetchTeachers();
        ok
            ? notifySuccess("تم تحديث البيانات")
            : notifyError("تعذر التحديث وتم عرض بيانات بديلة");
    };

    const toggleDetail = (id: number) =>
        setExpandedIds((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });

    const resetFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setRoleFilter("");
        setMosqueFilter("");
        setSessionFilter("");
        setActiveTab("all");
        setPage(1);
    };

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

    const STAT_CARDS = [
        {
            label: "إجمالي الموظفين",
            value: stats.total,
            icon: <FaChalkboardTeacher size={18} />,
            accent: "#1e293b",
        },
        {
            label: "مفعّل",
            value: stats.active,
            icon: <FiCheckCircle size={18} />,
            accent: "#16a34a",
        },
        {
            label: "موقوف",
            value: stats.suspended,
            icon: <FiXCircle size={18} />,
            accent: "#dc2626",
        },
        {
            label: "آخر 7 أيام",
            value: stats.recent,
            icon: <FiActivity size={18} />,
            accent: "#0284c7",
        },
    ];

    if (loading && !teachers.length) {
        return (
            <div className="my-teachers-page" dir="rtl">
                <div className="page-shell">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "4rem",
                            color: "#94a3b8",
                        }}
                    >
                        <FiRefreshCw
                            size={28}
                            style={{ animation: "spin 1s linear infinite" }}
                        />
                        <p style={{ marginTop: "1rem" }}>
                            جاري تحميل الموظفين...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                style={{
                    fontFamily: "'Tajawal',sans-serif",
                    direction: "rtl",
                    background: "#f8fafc",
                    minHeight: "100vh",
                    padding: 24,
                }}
            >
                {/* ── Hero ── */}
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
                                fontSize: 12,
                                color: "#86efac",
                                marginBottom: 4,
                            }}
                        >
                            ﷽ — منصة إتقان
                        </div>
                        <h1
                            style={{ margin: 0, fontSize: 26, fontWeight: 900 }}
                        >
                            إدارة إيقاف وتفعيل الموظفين
                        </h1>
                        <p
                            style={{
                                margin: "6px 0 16px",
                                color: "#94a3b8",
                                fontSize: 13,
                            }}
                        >
                            متابعة حالات المعلمين والمشرفين · مراجعة أسباب
                            الإيقاف · تفعيل أو إيقاف الحسابات
                        </p>
                        <button
                            onClick={handleRefresh}
                            style={btnS(
                                "#ffffff22",
                                "#fff",
                                "1px solid #ffffff33",
                            )}
                        >
                            <FiRefreshCw size={13} /> تحديث
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(150px,1fr))",
                        gap: 14,
                        marginBottom: 24,
                    }}
                >
                    {STAT_CARDS.map((s) => (
                        <div
                            key={s.label}
                            style={{
                                background: "#fff",
                                borderRadius: 16,
                                padding: "20px 22px",
                                boxShadow: "0 2px 12px #0001",
                                borderTop: `4px solid ${s.accent}`,
                            }}
                        >
                            <div style={{ color: s.accent, marginBottom: 6 }}>
                                {s.icon}
                            </div>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 900,
                                    color: "#1e293b",
                                }}
                            >
                                {s.value}
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#475569",
                                }}
                            >
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filter bar ── */}
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
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="ابحث بالاسم أو البريد أو الدور أو السبب..."
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

                        {/* Role */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#f8fafc",
                                borderRadius: 10,
                                padding: "0 12px",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <FaChalkboardTeacher size={13} color="#94a3b8" />
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPage(1);
                                }}
                                style={selectS}
                            >
                                <option value="">كل الأدوار</option>
                                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Mosque */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#f8fafc",
                                borderRadius: 10,
                                padding: "0 12px",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <FaMosque size={13} color="#94a3b8" />
                            <select
                                value={mosqueFilter}
                                onChange={(e) => {
                                    setMosqueFilter(e.target.value);
                                    setPage(1);
                                }}
                                style={selectS}
                            >
                                <option value="">كل المساجد</option>
                                {mosqueOptions.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Session */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#f8fafc",
                                borderRadius: 10,
                                padding: "0 12px",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <FiClock size={13} color="#94a3b8" />
                            <select
                                value={sessionFilter}
                                onChange={(e) => {
                                    setSessionFilter(e.target.value);
                                    setPage(1);
                                }}
                                style={selectS}
                            >
                                <option value="">كل الفترات</option>
                                <option value="asr">حلقة العصر</option>
                                <option value="maghrib">حلقة المغرب</option>
                            </select>
                        </div>

                        {/* Status tabs */}
                        <div
                            style={{
                                display: "flex",
                                gap: 4,
                                background: "#f8fafc",
                                borderRadius: 12,
                                padding: 4,
                            }}
                        >
                            {(
                                [
                                    "all",
                                    "active",
                                    "suspended",
                                    "inactive",
                                ] as const
                            ).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setPage(1);
                                    }}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: 10,
                                        border: "none",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        fontSize: 12,
                                        fontFamily: "inherit",
                                        background:
                                            activeTab === tab
                                                ? "#1e293b"
                                                : "transparent",
                                        color:
                                            activeTab === tab
                                                ? "#fff"
                                                : "#64748b",
                                        transition: "all .15s",
                                    }}
                                >
                                    {
                                        {
                                            all: "الكل",
                                            active: "مفعّل",
                                            suspended: "موقوف",
                                            inactive: "غير نشط",
                                        }[tab]
                                    }
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={resetFilters}
                            style={btnS(
                                "#f8fafc",
                                "#64748b",
                                "1px solid #e2e8f0",
                            )}
                        >
                            <FiX size={13} /> إعادة ضبط
                        </button>
                    </div>
                </div>

                {/* ── Error ── */}
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

                {/* ── Table shell ── */}
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 20,
                        boxShadow: "0 2px 16px #0001",
                        overflow: "hidden",
                    }}
                >
                    {/* head */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 20px",
                            borderBottom: "1px solid #f1f5f9",
                            flexWrap: "wrap",
                            gap: 8,
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 900,
                                    color: "#0f6e56",
                                }}
                            >
                                قائمة الموظفين
                            </h2>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#94a3b8",
                                    marginTop: 2,
                                }}
                            >
                                عرض {filtered.length} موظف
                                {loading ? " — جاري التحديث..." : ""}
                            </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                            الصفحة {page} من {totalPages}
                        </div>
                    </div>

                    {/* table */}
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
                                    {[
                                        "الموظف",
                                        "الدور",
                                        "الحلقة / القسم",
                                        "المسجد",
                                        "آخر تحديث",
                                        "الحالة",
                                        "الإجراءات",
                                    ].map((h) => (
                                        <th key={h} style={TH}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.length > 0 ? (
                                    pageItems.map((teacher, idx) => {
                                        const isExpanded = expandedIds.has(
                                            teacher.id,
                                        );
                                        const loadingAction =
                                            togglingIds.has(teacher.id) ||
                                            deletingIds.has(teacher.id);
                                        return (
                                            <React.Fragment key={teacher.id}>
                                                <tr
                                                    style={{
                                                        background: isExpanded
                                                            ? "#f0fdf4"
                                                            : idx % 2 === 0
                                                              ? "#fff"
                                                              : "#fafafa",
                                                    }}
                                                >
                                                    {/* Name */}
                                                    <td style={TD}>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 10,
                                                            }}
                                                        >
                                                            <TeacherAvatar
                                                                idx={
                                                                    (page - 1) *
                                                                        PER_PAGE +
                                                                    idx
                                                                }
                                                                name={
                                                                    teacher.name
                                                                }
                                                            />
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontWeight: 700,
                                                                        fontSize: 13,
                                                                        color: "#1e293b",
                                                                    }}
                                                                >
                                                                    {
                                                                        teacher.name
                                                                    }
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize: 11,
                                                                        color: "#94a3b8",
                                                                    }}
                                                                >
                                                                    {
                                                                        teacher.email
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Role */}
                                                    <td style={TD}>
                                                        <RolePill
                                                            role={
                                                                teacher.teacher
                                                                    ?.role
                                                            }
                                                        />
                                                    </td>
                                                    {/* Circle */}
                                                    <td
                                                        style={{
                                                            ...TD,
                                                            maxWidth: 190,
                                                            fontSize: 12,
                                                            color: "#64748b",
                                                        }}
                                                    >
                                                        {getCircleInfo(teacher)}
                                                    </td>
                                                    {/* Mosque */}
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
                                                            />{" "}
                                                            {getMosqueName(
                                                                teacher,
                                                            )}
                                                        </span>
                                                    </td>
                                                    {/* Date */}
                                                    <td
                                                        style={{
                                                            ...TD,
                                                            fontSize: 12,
                                                            color: "#64748b",
                                                        }}
                                                    >
                                                        {formatDate(
                                                            teacher.updated_at,
                                                        )}
                                                    </td>
                                                    {/* Status */}
                                                    <td style={TD}>
                                                        <StatusBadge
                                                            status={
                                                                teacher.status
                                                            }
                                                        />
                                                    </td>
                                                    {/* Actions */}
                                                    <td style={TD}>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                gap: 5,
                                                                flexWrap:
                                                                    "wrap",
                                                                alignItems:
                                                                    "center",
                                                            }}
                                                        >
                                                            <button
                                                                disabled={
                                                                    loadingAction
                                                                }
                                                                onClick={() =>
                                                                    handleToggleSuspend(
                                                                        teacher,
                                                                    )
                                                                }
                                                                style={btnS(
                                                                    teacher.status ===
                                                                        "active"
                                                                        ? "#fee2e2"
                                                                        : "#dcfce7",
                                                                    teacher.status ===
                                                                        "active"
                                                                        ? "#dc2626"
                                                                        : "#15803d",
                                                                    teacher.status ===
                                                                        "active"
                                                                        ? "1px solid #fecaca"
                                                                        : "1px solid #bbf7d0",
                                                                    {
                                                                        fontSize: 11,
                                                                        padding:
                                                                            "5px 10px",
                                                                    },
                                                                )}
                                                            >
                                                                {togglingIds.has(
                                                                    teacher.id,
                                                                ) ? (
                                                                    "جاري..."
                                                                ) : teacher.status ===
                                                                  "active" ? (
                                                                    <>
                                                                        <FiXCircle
                                                                            size={
                                                                                11
                                                                            }
                                                                        />{" "}
                                                                        إيقاف
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FiCheckCircle
                                                                            size={
                                                                                11
                                                                            }
                                                                        />{" "}
                                                                        تفعيل
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    setShowUserSuspendModel(
                                                                        true,
                                                                    )
                                                                }
                                                                style={btnS(
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
                                                                <FiAlertTriangle
                                                                    size={11}
                                                                />{" "}
                                                                سبب
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    setShowHistoryModel(
                                                                        true,
                                                                    )
                                                                }
                                                                style={btnS(
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
                                                                <FiActivity
                                                                    size={11}
                                                                />{" "}
                                                                سجل
                                                            </button>
                                                            <button
                                                                disabled={
                                                                    loadingAction
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        teacher,
                                                                    )
                                                                }
                                                                style={btnS(
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
                                                                {deletingIds.has(
                                                                    teacher.id,
                                                                ) ? (
                                                                    "جاري..."
                                                                ) : (
                                                                    <>
                                                                        <FiTrash2
                                                                            size={
                                                                                11
                                                                            }
                                                                        />{" "}
                                                                        حذف
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    toggleDetail(
                                                                        teacher.id,
                                                                    )
                                                                }
                                                                style={btnS(
                                                                    "#f8fafc",
                                                                    "#475569",
                                                                    "1px solid #e2e8f0",
                                                                    {
                                                                        fontSize: 11,
                                                                        padding:
                                                                            "5px 8px",
                                                                    },
                                                                )}
                                                            >
                                                                {isExpanded ? (
                                                                    <FiChevronDown
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <FiEye
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded row */}
                                                {isExpanded && (
                                                    <tr>
                                                        <td
                                                            colSpan={7}
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
                                                                    display:
                                                                        "grid",
                                                                    gridTemplateColumns:
                                                                        "repeat(auto-fit,minmax(160px,1fr))",
                                                                    gap: 8,
                                                                }}
                                                            >
                                                                <InfoTile
                                                                    icon={
                                                                        <FiPhone
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="الهاتف"
                                                                    value={
                                                                        teacher.phone ||
                                                                        "لا يوجد"
                                                                    }
                                                                />
                                                                <InfoTile
                                                                    icon={
                                                                        <FiMail
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="البريد الإلكتروني"
                                                                    value={
                                                                        teacher.email
                                                                    }
                                                                />
                                                                <InfoTile
                                                                    icon={
                                                                        <FiClock
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="آخر دخول"
                                                                    value={
                                                                        teacher.last_login ||
                                                                        "غير متوفر"
                                                                    }
                                                                />
                                                                <InfoTile
                                                                    icon={
                                                                        <FiClock
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="وقت الحلقة"
                                                                    value={
                                                                        SESSION_LABELS[
                                                                            teacher
                                                                                .teacher
                                                                                ?.session_time ||
                                                                                ""
                                                                        ] ||
                                                                        "غير محدد"
                                                                    }
                                                                />
                                                                <InfoTile
                                                                    icon={
                                                                        <FiUsers
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="عدد الطلاب"
                                                                    value={`${teacher.students_count || 0} طالب`}
                                                                />
                                                                <InfoTile
                                                                    icon={
                                                                        <FaChalkboardTeacher
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="عدد الحلقات"
                                                                    value={`${teacher.circles_count || 0} حلقة`}
                                                                />
                                                                <InfoTile
                                                                    icon={
                                                                        <FaMoneyBillWave
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="الراتب الأساسي"
                                                                    value={`${(teacher.salary || 0).toLocaleString()} ج.م`}
                                                                />
                                                                <InfoTile
                                                                    icon={
                                                                        <FiAlertTriangle
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="سبب الإيقاف"
                                                                    value={getReason(
                                                                        teacher,
                                                                    )}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7}>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    padding: "60px 20px",
                                                    color: "#94a3b8",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 36,
                                                        marginBottom: 10,
                                                    }}
                                                >
                                                    <FiSearch size={36} />
                                                </div>
                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: 15,
                                                    }}
                                                >
                                                    {search ||
                                                    roleFilter ||
                                                    mosqueFilter ||
                                                    sessionFilter ||
                                                    activeTab !== "all"
                                                        ? "لا توجد نتائج مطابقة للفلاتر."
                                                        : "لا يوجد موظفون لعرضهم."}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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
                                {filtered.length} موظف
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
            </div>

            {/* Modals */}
            {confirm && (
                <ConfirmModal
                    title={confirm.title}
                    desc={confirm.desc}
                    onConfirm={confirm.cb}
                    onCancel={() => setConfirm(null)}
                />
            )}
            {showUserSuspendModel && (
                <UserSuspendModel
                    isOpen={showUserSuspendModel}
                    onClose={() => setShowUserSuspendModel(false)}
                />
            )}
            {showHistoryModel && (
                <HistoryModel
                    isOpen={showHistoryModel}
                    onClose={() => setShowHistoryModel(false)}
                />
            )}
        </>
    );
};

const selectS: React.CSSProperties = {
    border: "none",
    background: "transparent",
    padding: "9px 0",
    fontSize: 13,
    fontFamily: "'Tajawal',sans-serif",
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

export default UserSuspend;
