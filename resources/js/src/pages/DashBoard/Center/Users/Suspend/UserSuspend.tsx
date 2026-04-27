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
} from "react-icons/fi";
import { FaChalkboardTeacher, FaMosque, FaMoneyBillWave } from "react-icons/fa";

/* ─────────────── Types ─────────────── */
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

/* ─────────────── Constants ─────────────── */
const ROLE_LABELS: Record<string, string> = {
    teacher: "معلم قرآن",
    supervisor: "مشرف تعليمي",
    motivator: "مشرف تحفيز",
    student_affairs: "شؤون الطلاب",
    financial: "مشرف مالي",
};

const ROLE_CLASS: Record<string, string> = {
    teacher: "role-pill role-teacher",
    supervisor: "role-pill role-supervisor",
    motivator: "role-pill role-motivator",
    student_affairs: "role-pill role-student-affairs",
    financial: "role-pill role-financial",
};

const SESSION_LABELS: Record<string, string> = {
    asr: "حلقة العصر",
    maghrib: "حلقة المغرب",
};

const STATUS_META: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
> = {
    active: {
        label: "✓ مفعّل",
        className: "badge success",
        icon: <FiCheckCircle size={11} />,
    },
    suspended: {
        label: "⏸ موقوف",
        className: "badge danger",
        icon: <FiXCircle size={11} />,
    },
    inactive: {
        label: "غير نشط",
        className: "badge warning",
        icon: <FiClock size={11} />,
    },
    pending: {
        label: "⏳ معلّق",
        className: "badge warning",
        icon: <FiClock size={11} />,
    },
    rejected: {
        label: "✕ مرفوض",
        className: "badge danger",
        icon: <FiXCircle size={11} />,
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

/* Mock fallback */
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

/* ─────────────── Helpers ─────────────── */
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

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    return value.split("T")[0].split(" ")[0];
};

const dateValue = (value?: string | null) => {
    if (!value) return 0;
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const time = new Date(normalized).getTime();
    return Number.isNaN(time) ? 0 : time;
};

const isRecent = (value?: string | null) => {
    const time = dateValue(value);
    if (!time) return false;
    return Date.now() - time <= 7 * 24 * 60 * 60 * 1000;
};

const getMosqueName = (teacher: TeacherType) =>
    teacher.mosque || teacher.teacher?.mosque || "غير مربوط";

const getCircleInfo = (teacher: TeacherType) => {
    if (teacher.teacher?.notes) return teacher.teacher.notes;
    if (teacher.teacher?.session_time === "asr") return "حلقة العصر";
    if (teacher.teacher?.session_time === "maghrib") return "حلقة المغرب";
    return "غير محدد";
};

const getReason = (teacher: TeacherType) =>
    teacher.suspension_reason ||
    teacher.teacher?.suspension_reason ||
    "غير محدد";

/* ─────────────── UI Sub-components ─────────────── */
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
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: av.bg,
                color: av.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 500,
                flexShrink: 0,
            }}
        >
            {initials}
        </div>
    );
};

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
    <div className="modal-overlay">
        <div className="modal-card modal-compact">
            <div className="modal-head">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span style={{ color: "#A32D2D", display: "inline-flex" }}>
                        <FiTrash2 size={16} />
                    </span>
                    <h3 style={{ margin: 0 }}>{title}</h3>
                </div>
                <button className="icon-btn subtle" onClick={onCancel}>
                    <FiX size={15} />
                </button>
            </div>
            <p className="modal-copy">{desc}</p>
            <div className="modal-actions">
                <button className="btn secondary" onClick={onCancel}>
                    إلغاء
                </button>
                <button className="btn danger" onClick={onConfirm}>
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
    <div className="info-tile">
        <div className="info-tile-icon">{icon}</div>
        <div>
            <div className="info-label">{label}</div>
            <div className="info-value">{value}</div>
        </div>
    </div>
);

/* ─────────────── API Hook ─────────────── */
const useUserSuspendData = () => {
    const [teachers, setTeachers] = useState<TeacherType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mosques, setMosques] = useState<string[]>([]);

    const csrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "";

    const apiFetch = async (url: string, options: RequestInit = {}) => {
        const headers: Record<string, string> = {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": csrfToken(),
        };

        if (!(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

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
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || `HTTP ${res.status}`);
        }

        if (res.status === 204) return null;

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) return null;

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
                    new Set(
                        MOCK_USERS.map((teacher) => teacher.mosque).filter(
                            Boolean,
                        ),
                    ),
                ) as string[],
            );
        }
    };

    const toggleTeacherStatus = async (id: number) => {
        await apiFetch(`/api/v1/teachers/my-teachers/${id}/toggle-status`, {
            method: "POST",
        });
    };

    const removeTeacher = async (id: number) => {
        await apiFetch(`/api/v1/teachers/my-teachers/${id}`, {
            method: "DELETE",
        });
    };

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

/* ─────────────── Main Component ─────────────── */
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
        const timer = window.setTimeout(() => {
            setDebouncedSearch(search);
        }, 350);

        return () => window.clearTimeout(timer);
    }, [search]);

    const mosqueOptions = Array.from(
        new Set(
            [...mosques, ...teachers.map((teacher) => getMosqueName(teacher))]
                .filter(Boolean)
                .filter((name) => name !== "غير مربوط"),
        ),
    ) as string[];

    const filtered = teachers
        .filter((teacher) => {
            const q = debouncedSearch.trim().toLowerCase();
            const roleLabel =
                ROLE_LABELS[teacher.teacher?.role || ""] || "موظف";
            const sessionLabel =
                SESSION_LABELS[teacher.teacher?.session_time || ""] || "";
            const matchSearch =
                !q ||
                (teacher.name || "").toLowerCase().includes(q) ||
                (teacher.email || "").toLowerCase().includes(q) ||
                roleLabel.toLowerCase().includes(q) ||
                (getCircleInfo(teacher) || "").toLowerCase().includes(q) ||
                (getMosqueName(teacher) || "").toLowerCase().includes(q) ||
                (getReason(teacher) || "").toLowerCase().includes(q) ||
                sessionLabel.toLowerCase().includes(q);

            const matchTab =
                activeTab === "all" || teacher.status === activeTab;
            const matchRole =
                !roleFilter || teacher.teacher?.role === roleFilter;
            const matchMosque =
                !mosqueFilter || getMosqueName(teacher) === mosqueFilter;
            const matchSession =
                !sessionFilter ||
                teacher.teacher?.session_time === sessionFilter;

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
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const stats: Stats = {
        total: teachers.length,
        active: teachers.filter((teacher) => teacher.status === "active")
            .length,
        suspended: teachers.filter((teacher) => teacher.status === "suspended")
            .length,
        recent: teachers.filter((teacher) => isRecent(teacher.updated_at))
            .length,
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
        } catch (error: any) {
            await fetchTeachers();
            notifyError(error?.message || "تعذر تحديث حالة الموظف");
        } finally {
            setTogglingIds((prev) => {
                const set = new Set(prev);
                set.delete(teacher.id);
                return set;
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
                } catch (error: any) {
                    notifyError(error?.message || "تعذر حذف الموظف");
                } finally {
                    setDeletingIds((prev) => {
                        const set = new Set(prev);
                        set.delete(teacher.id);
                        return set;
                    });
                }
            },
        });
    };

    const handleRefresh = async () => {
        const ok = await fetchTeachers();
        if (ok) {
            notifySuccess("تم تحديث البيانات");
        } else {
            notifyError("تعذر التحديث من الـ API وتم عرض بيانات بديلة");
        }
    };

    const toggleDetail = (id: number) => {
        setExpandedIds((prev) => {
            const set = new Set(prev);
            set.has(id) ? set.delete(id) : set.add(id);
            return set;
        });
    };

    const resetFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setRoleFilter("");
        setMosqueFilter("");
        setSessionFilter("");
        setActiveTab("all");
        setPage(1);
    };

    const pageRange = () => {
        if (totalPages <= 6) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
        if (page >= totalPages - 2) {
            return [
                1,
                "...",
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }
        return [1, "...", page - 1, page, page + 1, "...", totalPages];
    };

    if (loading && !teachers.length) {
        return (
            <div className="my-teachers-page" dir="rtl">
                <div className="page-shell">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "4rem",
                            color: "var(--color-text-secondary)",
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
            <div className="my-teachers-page" dir="rtl">
                <div className="page-shell">
                    <section className="hero-card">
                        <div>
                            <h1 className="hero-title">
                                إدارة إيقاف وتفعيل الموظفين
                            </h1>
                            <p className="hero-copy">
                                متابعة حالات المعلمين والمشرفين، مراجعة آخر
                                التحديثات، الاطلاع على أسباب الإيقاف، وتفعيل أو
                                إيقاف الحسابات بنفس روح تصميم StaffApproval
                                وبهوية أنيقة هادئة مناسبة للمنصة.
                            </p>
                        </div>
                        <div className="hero-actions">
                            <button
                                className="btn secondary"
                                onClick={handleRefresh}
                            >
                                <FiRefreshCw size={14} /> تحديث
                            </button>
                        </div>
                    </section>

                    <section className="stats-grid">
                        <div className="stat-card gold">
                            <div className="stat-head">
                                <div className="stat-icon">
                                    <FaChalkboardTeacher />
                                </div>
                                <FiTrendingUp size={13} />
                            </div>
                            <div className="stat-number">{stats.total}</div>
                            <div className="stat-label">إجمالي الموظفين</div>
                        </div>

                        <div className="stat-card green">
                            <div className="stat-head">
                                <div className="stat-icon">
                                    <FiCheckCircle />
                                </div>
                                <FiTrendingUp size={13} />
                            </div>
                            <div className="stat-number">{stats.active}</div>
                            <div className="stat-label">مفعّل</div>
                        </div>

                        <div className="stat-card orange">
                            <div className="stat-head">
                                <div className="stat-icon">
                                    <FiXCircle />
                                </div>
                                <FiUsers size={13} />
                            </div>
                            <div className="stat-number">{stats.suspended}</div>
                            <div className="stat-label">موقوف</div>
                        </div>

                        <div className="stat-card blue">
                            <div className="stat-head">
                                <div className="stat-icon">
                                    <FiClock />
                                </div>
                                <FiTrendingUp size={13} />
                            </div>
                            <div className="stat-number">{stats.recent}</div>
                            <div className="stat-label">آخر 7 أيام</div>
                        </div>
                    </section>

                    <section className="filter-bar">
                        <label className="search-field">
                            <FiSearch size={15} />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="ابحث بالاسم أو البريد أو الدور أو السبب..."
                            />
                        </label>

                        <label className="select-field">
                            <FaChalkboardTeacher size={13} />
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">كل الأدوار</option>
                                {Object.entries(ROLE_LABELS).map(
                                    ([key, value]) => (
                                        <option key={key} value={key}>
                                            {value}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        <label className="select-field">
                            <FaMosque size={13} />
                            <select
                                value={mosqueFilter}
                                onChange={(e) => {
                                    setMosqueFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">كل المساجد</option>
                                {mosqueOptions.map((mosque) => (
                                    <option key={mosque} value={mosque}>
                                        {mosque}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="select-field">
                            <FiClock size={13} />
                            <select
                                value={sessionFilter}
                                onChange={(e) => {
                                    setSessionFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">كل الفترات</option>
                                <option value="asr">حلقة العصر</option>
                                <option value="maghrib">حلقة المغرب</option>
                            </select>
                        </label>

                        <div className="toolbar">
                            <button
                                className="btn secondary"
                                onClick={resetFilters}
                            >
                                <FiX size={14} /> إعادة ضبط
                            </button>
                        </div>
                    </section>

                    <section className="table-shell">
                        {error && <div className="error-banner">{error}</div>}

                        <div className="table-head">
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        color: "var(--emerald)",
                                    }}
                                >
                                    قائمة الموظفين
                                </h2>
                                <div className="muted">
                                    عرض {filtered.length} موظف
                                    {loading ? " – جاري التحديث..." : ""}
                                </div>
                            </div>

                            <div className="tabs">
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
                                        className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setPage(1);
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
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: ".83rem",
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            background:
                                                "var(--color-background-secondary)",
                                        }}
                                    >
                                        <th style={TH}>الموظف</th>
                                        <th style={TH}>الدور</th>
                                        <th style={TH}>الحلقة / القسم</th>
                                        <th style={TH}>المسجد</th>
                                        <th style={TH}>آخر تحديث</th>
                                        <th style={TH}>الحالة</th>
                                        <th style={TH}>الإجراءات</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pageItems.length > 0 ? (
                                        pageItems.map((teacher, idx) => {
                                            const statusMeta =
                                                STATUS_META[teacher.status] ||
                                                STATUS_META.inactive;
                                            const roleClass =
                                                ROLE_CLASS[
                                                    teacher.teacher?.role || ""
                                                ] || ROLE_CLASS.teacher;
                                            const roleLabel =
                                                ROLE_LABELS[
                                                    teacher.teacher?.role || ""
                                                ] || "موظف";
                                            const isExpanded = expandedIds.has(
                                                teacher.id,
                                            );
                                            const loadingAction =
                                                togglingIds.has(teacher.id) ||
                                                deletingIds.has(teacher.id);

                                            return (
                                                <React.Fragment
                                                    key={teacher.id}
                                                >
                                                    <tr
                                                        style={
                                                            isExpanded
                                                                ? {
                                                                      background:
                                                                          "var(--color-background-secondary)",
                                                                  }
                                                                : {}
                                                        }
                                                    >
                                                        <td style={TD}>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 10,
                                                                }}
                                                            >
                                                                <AvatarInitials
                                                                    name={
                                                                        teacher.name
                                                                    }
                                                                    idx={
                                                                        (page -
                                                                            1) *
                                                                            PER_PAGE +
                                                                        idx
                                                                    }
                                                                />
                                                                <div>
                                                                    <div
                                                                        style={{
                                                                            fontWeight: 500,
                                                                        }}
                                                                    >
                                                                        {
                                                                            teacher.name
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                ".73rem",
                                                                            color: "var(--color-text-secondary)",
                                                                        }}
                                                                    >
                                                                        {
                                                                            teacher.email
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td style={TD}>
                                                            <span
                                                                className={
                                                                    roleClass
                                                                }
                                                            >
                                                                {roleLabel}
                                                            </span>
                                                        </td>

                                                        <td
                                                            style={{
                                                                ...TD,
                                                                maxWidth: 190,
                                                                fontSize:
                                                                    ".78rem",
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            {getCircleInfo(
                                                                teacher,
                                                            )}
                                                        </td>

                                                        <td style={TD}>
                                                            <span
                                                                style={{
                                                                    display:
                                                                        "inline-flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 5,
                                                                    fontSize:
                                                                        ".8rem",
                                                                }}
                                                            >
                                                                <FaMosque
                                                                    size={11}
                                                                    style={{
                                                                        color: "var(--emerald)",
                                                                    }}
                                                                />
                                                                {getMosqueName(
                                                                    teacher,
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td
                                                            style={{
                                                                ...TD,
                                                                fontSize:
                                                                    ".78rem",
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            {formatDate(
                                                                teacher.updated_at,
                                                            )}
                                                        </td>

                                                        <td style={TD}>
                                                            <span
                                                                className={
                                                                    statusMeta.className
                                                                }
                                                            >
                                                                {
                                                                    statusMeta.icon
                                                                }{" "}
                                                                {
                                                                    statusMeta.label
                                                                }
                                                            </span>
                                                        </td>

                                                        <td style={TD}>
                                                            <div className="td-actions">
                                                                <button
                                                                    className={
                                                                        teacher.status ===
                                                                        "active"
                                                                            ? "btn danger"
                                                                            : "btn primary"
                                                                    }
                                                                    style={{
                                                                        fontSize:
                                                                            ".75rem",
                                                                        padding:
                                                                            "5px 10px",
                                                                    }}
                                                                    onClick={() =>
                                                                        handleToggleSuspend(
                                                                            teacher,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loadingAction
                                                                    }
                                                                    title={
                                                                        teacher.status ===
                                                                        "active"
                                                                            ? "إيقاف الموظف"
                                                                            : "تفعيل الموظف"
                                                                    }
                                                                >
                                                                    {togglingIds.has(
                                                                        teacher.id,
                                                                    )
                                                                        ? "جاري..."
                                                                        : teacher.status ===
                                                                            "active"
                                                                          ? "إيقاف"
                                                                          : "تفعيل"}
                                                                </button>

                                                                <button
                                                                    className="btn secondary"
                                                                    style={{
                                                                        fontSize:
                                                                            ".75rem",
                                                                        padding:
                                                                            "5px 10px",
                                                                    }}
                                                                    onClick={() =>
                                                                        setShowUserSuspendModel(
                                                                            true,
                                                                        )
                                                                    }
                                                                    title="سبب الإيقاف"
                                                                >
                                                                    سبب
                                                                </button>

                                                                <button
                                                                    className="btn secondary"
                                                                    style={{
                                                                        fontSize:
                                                                            ".75rem",
                                                                        padding:
                                                                            "5px 10px",
                                                                    }}
                                                                    onClick={() =>
                                                                        setShowHistoryModel(
                                                                            true,
                                                                        )
                                                                    }
                                                                    title="عرض السجل"
                                                                >
                                                                    سجل
                                                                </button>

                                                                <button
                                                                    className="btn danger"
                                                                    style={{
                                                                        fontSize:
                                                                            ".75rem",
                                                                        padding:
                                                                            "5px 10px",
                                                                    }}
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            teacher,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loadingAction
                                                                    }
                                                                    title="حذف نهائي"
                                                                >
                                                                    {deletingIds.has(
                                                                        teacher.id,
                                                                    )
                                                                        ? "جاري..."
                                                                        : "حذف"}
                                                                </button>

                                                                <button
                                                                    className="icon-btn"
                                                                    onClick={() =>
                                                                        toggleDetail(
                                                                            teacher.id,
                                                                        )
                                                                    }
                                                                    title="تفاصيل"
                                                                >
                                                                    {isExpanded ? (
                                                                        <FiChevronDown
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <FiEye
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {isExpanded && (
                                                        <tr>
                                                            <td
                                                                colSpan={7}
                                                                style={{
                                                                    background:
                                                                        "var(--color-background-secondary)",
                                                                    padding:
                                                                        "14px 1.25rem",
                                                                    borderBottom:
                                                                        "0.5px solid var(--color-border-tertiary)",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "grid",
                                                                        gridTemplateColumns:
                                                                            "repeat(auto-fit, minmax(170px, 1fr))",
                                                                        gap: ".75rem",
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
                                                                            teacher.phone ||
                                                                            "لا يوجد"
                                                                        }
                                                                    />
                                                                    <DetailItem
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
                                                                    <DetailItem
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
                                                                    <DetailItem
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
                                                                    <DetailItem
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
                                                                    <DetailItem
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
                                                                    <DetailItem
                                                                        icon={
                                                                            <FaMoneyBillWave
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />
                                                                        }
                                                                        label="الراتب الأساسي"
                                                                        value={`${(
                                                                            teacher.salary ||
                                                                            0
                                                                        ).toLocaleString()} ج.م`}
                                                                    />
                                                                    <DetailItem
                                                                        icon={
                                                                            <FiXCircle
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
                                                <div className="empty-state">
                                                    {search ||
                                                    roleFilter ||
                                                    mosqueFilter ||
                                                    sessionFilter ||
                                                    activeTab !== "all"
                                                        ? "لا توجد نتائج مطابقة للفلاتر الحالية."
                                                        : "لا يوجد موظفون لعرضهم حاليًا."}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="pagination-bar">
                            <div className="muted">
                                الصفحة {page} من {totalPages}
                            </div>

                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    disabled={page <= 1}
                                    onClick={() =>
                                        setPage((prev) => Math.max(1, prev - 1))
                                    }
                                >
                                    <FiChevronRight size={13} />
                                </button>

                                {pageRange().map((item, index) =>
                                    item === "..." ? (
                                        <button
                                            key={`ellipsis-${index}`}
                                            className="page-btn"
                                            disabled
                                        >
                                            ...
                                        </button>
                                    ) : (
                                        <button
                                            key={item}
                                            className={`page-btn ${page === item ? "active" : ""}`}
                                            onClick={() =>
                                                setPage(item as number)
                                            }
                                        >
                                            {item}
                                        </button>
                                    ),
                                )}

                                <button
                                    className="page-btn"
                                    disabled={page >= totalPages}
                                    onClick={() =>
                                        setPage((prev) =>
                                            Math.min(totalPages, prev + 1),
                                        )
                                    }
                                >
                                    <FiChevronLeft size={13} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

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

/* ─────────────── Tiny helpers ─────────────── */
const TH: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "right",
    color: "var(--color-text-secondary)",
    fontWeight: 500,
    fontSize: ".78rem",
    whiteSpace: "nowrap",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
};

const TD: React.CSSProperties = {
    padding: "12px 14px",
    borderBottom: "0.5px solid rgba(0,0,0,.05)",
    verticalAlign: "middle",
};

/*
لو نفس CSS بتاع StaffApproval موجود عندك، الصفحة هتطلع بنفس الروح تقريبًا مباشرة.
ولو محتاج تضيف الكلاسات دي فقط:

.role-pill           { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:.73rem;font-weight:500 }
.role-teacher        { background:var(--emerald-light, #E1F5EE);color:var(--emerald, #0F6E56) }
.role-supervisor     { background:#E6F1FB;color:#185FA5 }
.role-motivator      { background:#FAEEDA;color:#854F0B }
.role-student-affairs{ background:#EAF3DE;color:#27500A }
.role-financial      { background:#FCEBEB;color:#A32D2D }

.td-actions          { display:flex;gap:5px;flex-wrap:wrap;align-items:center }
.btn.danger          { background:#FCEBEB;color:#A32D2D;border-color:#F09595 }
.btn.danger:hover    { background:#F7C1C1 }
.btn.primary         { background:var(--emerald,#0F6E56);color:#fff;border-color:var(--emerald) }
.btn.secondary       { background:var(--color-background-secondary);color:var(--color-text-secondary);border-color:var(--color-border-tertiary) }
*/

export default UserSuspend;
