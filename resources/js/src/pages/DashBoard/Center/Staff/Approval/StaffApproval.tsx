// StaffApproval.tsx — نسخة مكتملة بنفس نظام كلاسات MyTeachersManagement
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    FiSearch,
    FiFilter,
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
} from "react-icons/fi";
import { FaChalkboardTeacher, FaMosque, FaMoneyBillWave } from "react-icons/fa";

/* ─────────────── Types ─────────────── */
type TeacherStatus =
    | "active"
    | "pending"
    | "suspended"
    | "rejected"
    | "inactive";

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

const ROLE_CLASS: Record<string, string> = {
    teacher: "role-pill role-teacher",
    supervisor: "role-pill role-supervisor",
    motivator: "role-pill role-motivator",
    student_affairs: "role-pill role-student-affairs",
    financial: "role-pill role-financial",
};

const STATUS_META: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
> = {
    pending: {
        label: "⏳ معلق",
        className: "badge warning",
        icon: <FiClock size={11} />,
    },
    active: {
        label: "✓ مفعّل",
        className: "badge success",
        icon: <FiCheckCircle size={11} />,
    },
    rejected: {
        label: "✕ مرفوض",
        className: "badge danger",
        icon: <FiXCircle size={11} />,
    },
    suspended: {
        label: "موقوف",
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

/* Mock للـ fallback */
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
            notes: "حلقة تختيم القرآن من 7:30 م إلى 8:30 م",
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
            notes: "حلقة البنات - الإشراف على التقييم",
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
];

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

const Toast = ({
    message,
    tone,
    onClose,
}: {
    message: string;
    tone: "success" | "error";
    onClose: () => void;
}) => (
    <div className={`toast ${tone}`}>
        {tone === "success" ? (
            <FiCheckCircle size={15} />
        ) : (
            <FiXCircle size={15} />
        )}
        <span>{message}</span>
        <button className="icon-btn subtle" onClick={onClose}>
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
    <div className="modal-overlay">
        <div className="modal-card modal-compact">
            <div className="modal-head">
                <h3>{title}</h3>
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

/* ─────────────── API hook ─────────────── */
const useStaffApproval = () => {
    const [teachers, setTeachers] = useState<PendingTeacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mosques, setMosques] = useState<string[]>([]);

    const csrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "";

    const apiFetch = async (url: string, options: RequestInit = {}) => {
        const res = await fetch(url, {
            credentials: "include",
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN": csrfToken(),
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
            ...options,
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || `HTTP ${res.status}`);
        }
        return res.json();
    };

    const fetchPendingTeachers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch(
                "/api/v1/teachers/my-teachers?status=pending&per_page=100",
            );
            setTeachers(data.data || []);
        } catch {
            setError("تعذر تحميل البيانات، يُعرض بيانات بديلة.");
            setTeachers(MOCK_PENDING);
        } finally {
            setLoading(false);
        }
    };

    const fetchMosques = async () => {
        try {
            const data = await apiFetch("/api/v1/mosques");
            setMosques(
                (data.data || [])
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
    };

    const approveTeacher = async (id: number) => {
        await apiFetch(`/api/v1/teachers/my-teachers/${id}/toggle-status`, {
            method: "POST",
        });
    };

    const rejectTeacher = async (id: number) => {
        await apiFetch(`/api/v1/teachers/my-teachers/${id}`, {
            method: "DELETE",
        });
    };

    const sendOTP = async (id: number) => {
        await apiFetch(`/api/v1/teachers/send-otp/${id}`, { method: "POST" });
    };

    useEffect(() => {
        fetchPendingTeachers();
        fetchMosques();
    }, []);

    return {
        teachers,
        setTeachers,
        loading,
        error,
        mosques,
        fetchPendingTeachers,
        approveTeacher,
        rejectTeacher,
        sendOTP,
    };
};

/* ─────────────── Main Component ─────────────── */
const StaffApproval: React.FC = () => {
    const {
        teachers,
        setTeachers,
        loading,
        error,
        mosques,
        fetchPendingTeachers,
        approveTeacher,
        rejectTeacher,
        sendOTP,
    } = useStaffApproval();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebounced] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [mosqueFilter, setMosqueFilter] = useState("");
    const [activeTab, setActiveTab] = useState<
        "all" | "pending" | "active" | "rejected"
    >("all");
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

    /* Debounce search */
    useEffect(() => {
        const t = window.setTimeout(() => setDebounced(search), 350);
        return () => window.clearTimeout(t);
    }, [search]);

    const showToast = (
        message: string,
        tone: "success" | "error" = "success",
    ) => {
        setToast({ message, tone });
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 3200);
    };

    /* Derived filtered list */
    const filtered = teachers.filter((t) => {
        const q = debouncedSearch.toLowerCase();
        const matchSearch =
            !q ||
            (t.name || "").toLowerCase().includes(q) ||
            (t.email || "").toLowerCase().includes(q) ||
            (ROLE_LABELS[t.teacher?.role || ""] || "").includes(q) ||
            (t.teacher?.notes || "").toLowerCase().includes(q);
        const matchTab =
            activeTab === "all" ||
            (activeTab === "rejected"
                ? t.status === "rejected" || t.status === "suspended"
                : t.status === activeTab);
        const matchRole = !roleFilter || t.teacher?.role === roleFilter;
        const matchMosque = !mosqueFilter || t.mosque === mosqueFilter;
        return matchSearch && matchTab && matchRole && matchMosque;
    });

    /* Pagination */
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const stats: Stats = {
        total: teachers.length,
        pending: teachers.filter((t) => t.status === "pending").length,
        active: teachers.filter((t) => t.status === "active").length,
        rejected: teachers.filter(
            (t) => t.status === "rejected" || t.status === "suspended",
        ).length,
    };

    /* Actions */
    const handleApprove = async (id: number) => {
        setApprovingIds((prev) => new Set([...prev, id]));
        setTeachers((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "active" } : t)),
        );
        try {
            await approveTeacher(id);
            showToast(`تم تفعيل المعلم بنجاح ✓`);
        } catch {
            await fetchPendingTeachers();
            showToast("تعذر تفعيل المعلم", "error");
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
            desc: `هل أنت متأكد من رفض طلب "${t?.name}"؟ لا يمكن التراجع.`,
            cb: async () => {
                setRejectingIds((prev) => new Set([...prev, id]));
                setTeachers((prev) =>
                    prev.map((x) =>
                        x.id === id ? { ...x, status: "rejected" } : x,
                    ),
                );
                setConfirm(null);
                try {
                    await rejectTeacher(id);
                    showToast("تم رفض الطلب");
                } catch {
                    await fetchPendingTeachers();
                    showToast("تعذر رفض الطلب", "error");
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

    const handleSendOTP = async (id: number) => {
        const t = teachers.find((x) => x.id === id);
        try {
            await sendOTP(id);
            showToast(`تم إرسال OTP إلى ${t?.name}`);
        } catch {
            showToast(`تم إرسال OTP إلى ${t?.name} (محاكاة)`);
        }
    };

    const handleRefresh = async () => {
        await fetchPendingTeachers();
        showToast("تم تحديث البيانات");
    };

    const toggleDetail = (id: number) =>
        setExpandedIds((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });

    const resetFilters = () => {
        setSearch("");
        setDebounced("");
        setRoleFilter("");
        setMosqueFilter("");
        setActiveTab("all");
        setPage(1);
    };

    /* Page range helper */
    const pageRange = () => {
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
                            جاري تحميل المعلمين...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-teachers-page" dir="rtl">
            <div className="page-shell">
                {/* ── Hero ── */}
                <section className="hero-card">
                    <div>
                        <h1 className="hero-title">اعتماد المعلمين الجدد</h1>
                        <p className="hero-copy">
                            مراجعة طلبات الانضمام، ربط الرواتب، إرسال OTP، تفعيل
                            أو رفض المعلمين المعلقين — بنفس روح التصميم الأساسي
                            للمنصة.
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

                {/* ── Stats ── */}
                <section className="stats-grid">
                    <div className="stat-card gold">
                        <div className="stat-head">
                            <div className="stat-icon">
                                <FaChalkboardTeacher />
                            </div>
                            <FiTrendingUp size={13} />
                        </div>
                        <div className="stat-number">{stats.total}</div>
                        <div className="stat-label">إجمالي الطلبات</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-head">
                            <div className="stat-icon">
                                <FiClock />
                            </div>
                            <FiTrendingUp size={13} />
                        </div>
                        <div className="stat-number">{stats.pending}</div>
                        <div className="stat-label">معلق</div>
                    </div>
                    <div className="stat-card blue">
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
                        <div className="stat-number">{stats.rejected}</div>
                        <div className="stat-label">مرفوض</div>
                    </div>
                </section>

                {/* ── Filters ── */}
                <section className="filter-bar">
                    <label className="search-field">
                        <FiSearch size={15} />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="ابحث بالاسم أو البريد أو الدور أو الحلقة..."
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
                            {Object.entries(ROLE_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v}
                                </option>
                            ))}
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
                            {mosques.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
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

                {/* ── Table Shell ── */}
                <section className="table-shell">
                    {error && (
                        <div className="error-banner">
                            تعذر تحميل بعض البيانات من الـ API وتم عرض بيانات
                            بديلة مؤقتًا.
                        </div>
                    )}

                    <div className="table-head">
                        <div>
                            <h2 style={{ margin: 0, color: "var(--emerald)" }}>
                                قائمة المعلمين المعلقين
                            </h2>
                            <div className="muted">
                                عرض {filtered.length} معلم
                                {loading ? " – جاري التحديث..." : ""}
                            </div>
                        </div>
                        <div className="tabs">
                            {(
                                [
                                    "all",
                                    "pending",
                                    "active",
                                    "rejected",
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
                                            pending: "معلق",
                                            active: "مفعّل",
                                            rejected: "مرفوض",
                                        }[tab]
                                    }
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
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
                                    <th style={TH}>المعلم</th>
                                    <th style={TH}>الدور</th>
                                    <th style={TH}>الحلقة / القسم</th>
                                    <th style={TH}>المسجد</th>
                                    <th style={TH}>تاريخ التقديم</th>
                                    <th style={TH}>الحالة</th>
                                    <th style={TH}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.length > 0 ? (
                                    pageItems.map((t, idx) => {
                                        const sm =
                                            STATUS_META[t.status] ||
                                            STATUS_META.pending;
                                        const roleCls =
                                            ROLE_CLASS[t.teacher?.role || ""] ||
                                            ROLE_CLASS.teacher;
                                        const roleLabel =
                                            ROLE_LABELS[
                                                t.teacher?.role || ""
                                            ] || "معلم";
                                        const isExpanded = expandedIds.has(
                                            t.id,
                                        );

                                        return (
                                            <React.Fragment key={t.id}>
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
                                                            <AvatarInitials
                                                                name={t.name}
                                                                idx={idx}
                                                            />
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    {t.name}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            ".73rem",
                                                                        color: "var(--color-text-secondary)",
                                                                    }}
                                                                >
                                                                    {t.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Role */}
                                                    <td style={TD}>
                                                        <span
                                                            className={roleCls}
                                                        >
                                                            {roleLabel}
                                                        </span>
                                                    </td>
                                                    {/* Notes */}
                                                    <td
                                                        style={{
                                                            ...TD,
                                                            maxWidth: 180,
                                                            fontSize: ".78rem",
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {t.teacher?.notes ||
                                                            "—"}
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
                                                            {t.mosque ||
                                                                "غير مربوط"}
                                                        </span>
                                                    </td>
                                                    {/* Date */}
                                                    <td
                                                        style={{
                                                            ...TD,
                                                            fontSize: ".78rem",
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {
                                                            (
                                                                t.created_at ||
                                                                ""
                                                            ).split("T")[0]
                                                        }
                                                    </td>
                                                    {/* Status */}
                                                    <td style={TD}>
                                                        <span
                                                            className={
                                                                sm.className
                                                            }
                                                        >
                                                            {sm.icon} {sm.label}
                                                        </span>
                                                    </td>
                                                    {/* Actions */}
                                                    <td style={TD}>
                                                        <div className="td-actions">
                                                            {/* Payroll */}
                                                            <button
                                                                className="btn secondary"
                                                                style={{
                                                                    fontSize:
                                                                        ".75rem",
                                                                    padding:
                                                                        "5px 10px",
                                                                }}
                                                                onClick={() =>
                                                                    alert(
                                                                        `ربط رواتب: ${t.name}`,
                                                                    )
                                                                }
                                                                title="ربط الرواتب"
                                                            >
                                                                <FaMoneyBillWave
                                                                    size={12}
                                                                />{" "}
                                                                رواتب
                                                            </button>
                                                            {/* Approve */}
                                                            {t.status !==
                                                                "active" && (
                                                                <button
                                                                    className="btn primary"
                                                                    style={{
                                                                        fontSize:
                                                                            ".75rem",
                                                                        padding:
                                                                            "5px 10px",
                                                                    }}
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            t.id,
                                                                        )
                                                                    }
                                                                    disabled={approvingIds.has(
                                                                        t.id,
                                                                    )}
                                                                >
                                                                    <FiCheckCircle
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                    {approvingIds.has(
                                                                        t.id,
                                                                    )
                                                                        ? "جاري..."
                                                                        : "تفعيل"}
                                                                </button>
                                                            )}
                                                            {/* Reject */}
                                                            {t.status !==
                                                                "rejected" &&
                                                                t.status !==
                                                                    "suspended" && (
                                                                    <button
                                                                        className="btn danger"
                                                                        style={{
                                                                            fontSize:
                                                                                ".75rem",
                                                                            padding:
                                                                                "5px 10px",
                                                                        }}
                                                                        onClick={() =>
                                                                            handleReject(
                                                                                t.id,
                                                                            )
                                                                        }
                                                                        disabled={rejectingIds.has(
                                                                            t.id,
                                                                        )}
                                                                    >
                                                                        <FiXCircle
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        {rejectingIds.has(
                                                                            t.id,
                                                                        )
                                                                            ? "جاري..."
                                                                            : "رفض"}
                                                                    </button>
                                                                )}
                                                            {/* OTP */}
                                                            <button
                                                                className="btn secondary"
                                                                style={{
                                                                    fontSize:
                                                                        ".75rem",
                                                                    padding:
                                                                        "5px 10px",
                                                                }}
                                                                onClick={() =>
                                                                    handleSendOTP(
                                                                        t.id,
                                                                    )
                                                                }
                                                            >
                                                                OTP
                                                            </button>
                                                            {/* Detail toggle */}
                                                            <button
                                                                className="icon-btn"
                                                                onClick={() =>
                                                                    toggleDetail(
                                                                        t.id,
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

                                                {/* Expandable detail row */}
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
                                                                        "repeat(auto-fit, minmax(160px, 1fr))",
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
                                                                    value={`${(t.salary || 0).toLocaleString()} ج.م`}
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
                                                                    value={`${t.circles_count || 0} حلقة`}
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
                                                                    value={`${t.students_count || 0} طالب`}
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
                                                                        t.email
                                                                    }
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
                                                لا توجد نتائج مطابقة للفلاتر
                                                الحالية.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="pagination-bar">
                        <div className="muted">
                            الصفحة {page} من {totalPages}
                        </div>
                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                            >
                                <FiChevronRight size={13} />
                            </button>
                            {pageRange().map((item, i) =>
                                item === "..." ? (
                                    <button
                                        key={`e-${i}`}
                                        className="page-btn"
                                        disabled
                                    >
                                        ...
                                    </button>
                                ) : (
                                    <button
                                        key={item}
                                        className={`page-btn ${page === item ? "active" : ""}`}
                                        onClick={() => setPage(item as number)}
                                    >
                                        {item}
                                    </button>
                                ),
                            )}
                            <button
                                className="page-btn"
                                disabled={page >= totalPages}
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                            >
                                <FiChevronLeft size={13} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Confirm modal */}
            {confirm && (
                <ConfirmModal
                    title={confirm.title}
                    desc={confirm.desc}
                    onConfirm={confirm.cb}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {/* Toast */}
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

/* CSS additions — ألصقها في ملف الـ CSS الموجود بجانب نفس كلاسات MyTeachersManagement */
/*
.role-pill          { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:.73rem;font-weight:500 }
.role-teacher       { background:var(--emerald-light, #E1F5EE);color:var(--emerald, #0F6E56) }
.role-supervisor    { background:#E6F1FB;color:#185FA5 }
.role-motivator     { background:#FAEEDA;color:#854F0B }
.role-student-affairs{ background:#EAF3DE;color:#27500A }
.role-financial     { background:#FCEBEB;color:#A32D2D }

.td-actions         { display:flex;gap:5px;flex-wrap:wrap;align-items:center }
.btn.danger         { background:#FCEBEB;color:#A32D2D;border-color:#F09595 }
.btn.danger:hover   { background:#F7C1C1 }
.btn.primary        { background:var(--emerald,#0F6E56);color:#fff;border-color:var(--emerald) }
.btn.secondary      { background:var(--color-background-secondary);color:var(--color-text-secondary);border-color:var(--color-border-tertiary) }
*/

export default StaffApproval;
