import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiCalendar,
    FiUsers,
    FiX,
    FiMail,
    FiPhone,
    FiTrendingUp,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaMosque } from "react-icons/fa";

// ── Types ────────────────────────────────────────────────────────
interface DaySession {
    date: string;
    day_name: string;
    sessions_count: number;
    total_minutes: number;
    total_hours: number;
    duration_label: string;
    first_joined: string;
    last_left: string | null;
    sessions: {
        log_id: number;
        circle_name: string;
        joined_at: string;
        left_at: string | null;
        duration_minutes: number;
        is_open: boolean;
    }[];
}

interface Schedule {
    schedule_id: number;
    plan_name: string;
    circle_name: string;
    day_of_week: string;
    time_range: string;
    max_students: number | null;
    booked: number;
}

interface Circle {
    id: number;
    name: string;
    students_count: number;
}

interface Plan {
    title: string;
    circle_name: string;
    time_range: string;
    weekly_days: string[];
    sessions_done: number;
}

interface Teacher {
    teacher_id: number;
    user_id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    status: "active" | "pending" | "suspended" | "inactive";
    created_at: string;
    last_login_at: string | null;
    teacher: {
        role: string;
        session_time: string | null;
        notes: string | null;
    };
    circles: Circle[];
    circles_count: number;
    students_count: number;
    schedules: Schedule[];
    plan: Plan | null;
    attendance_today: "present" | "late" | null;
    last_checkin: string | null;
    delay_minutes: number;
    days_attended: number;
    total_sessions: number;
    total_minutes: number;
    hours_this_period: number;
    duration_label: string;
    daily_sessions: DaySession[];
    period: { from: string; to: string };
}

interface Stats {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    present_today: number;
    total_hours_period: number;
    duration_label: string;
}

interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

// ── Helpers ──────────────────────────────────────────────────────
const csrf = () =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") ?? "";

const apiFetch = async (url: string) => {
    const res = await fetch(url, {
        credentials: "include",
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": csrf(),
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
};

const roleLabel: Record<string, string> = {
    teacher: "مدرس",
    supervisor: "مشرف",
    motivator: "محفز",
    student_affairs: "شؤون طلاب",
    financial: "مالي",
};

// ── Avatar ───────────────────────────────────────────────────────
const Avatar = ({ idx }: { idx: number }) => {
    const skins = ["#F5D3A8", "#E8B97A", "#D4915A", "#F0C894"];
    const robes = ["#1A5C3A", "#C9A84C", "#1565C0", "#6D4C41"];
    return (
        <svg viewBox="0 0 80 80" fill="none" width="48" height="48">
            <circle cx="40" cy="40" r="38" fill="#EDF5F0" />
            <path
                d="M15 80C15 58 25 52 40 52C55 52 65 58 65 80Z"
                fill={robes[idx % 4]}
            />
            <ellipse cx="40" cy="34" rx="14" ry="15" fill={skins[idx % 4]} />
            <ellipse
                cx="40"
                cy="21"
                rx="12"
                ry="5"
                fill="#FFF"
                fillOpacity=".95"
            />
            <circle cx="35" cy="35" r="2.5" fill="#2C1810" />
            <circle cx="45" cy="35" r="2.5" fill="#2C1810" />
            <path
                d="M36 40Q40 43 44 40"
                stroke="#B87040"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    );
};

// ── Status Badge ─────────────────────────────────────────────────
const STATUS_MAP = {
    active: { label: "نشط", bg: "#dcfce7", color: "#16a34a" },
    pending: { label: "معلّق", bg: "#fef9c3", color: "#ca8a04" },
    suspended: { label: "موقوف", bg: "#fee2e2", color: "#dc2626" },
    inactive: { label: "غير نشط", bg: "#f1f5f9", color: "#64748b" },
    present: { label: "حاضر", bg: "#dcfce7", color: "#16a34a" },
    late: { label: "متأخر", bg: "#fef9c3", color: "#ca8a04" },
};

const Badge = ({ type }: { type: string }) => {
    const s = STATUS_MAP[type as keyof typeof STATUS_MAP] ?? {
        label: type,
        bg: "#f1f5f9",
        color: "#64748b",
    };
    return (
        <span
            style={{
                background: s.bg,
                color: s.color,
                borderRadius: 20,
                padding: "2px 10px",
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap",
            }}
        >
            {s.label}
        </span>
    );
};

// ── Stat Card ────────────────────────────────────────────────────
const StatCard = ({
    icon,
    label,
    value,
    sub,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    accent: string;
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px 24px",
            boxShadow: "0 2px 12px #0001",
            borderTop: `4px solid ${accent}`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
        }}
    >
        <div style={{ color: accent, fontSize: 22 }}>{icon}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#1e293b" }}>
            {value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
            {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>}
    </div>
);

// ── Day Row ──────────────────────────────────────────────────────
const DayRow = ({ day }: { day: DaySession }) => {
    const [open, setOpen] = useState(false);
    return (
        <div
            style={{
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 6,
                border: "1px solid #e2e8f0",
            }}
        >
            <div
                onClick={() => setOpen((v) => !v)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    cursor: "pointer",
                    background: open ? "#f0fdf4" : "#fafafa",
                    userSelect: "none",
                }}
            >
                <div style={{ minWidth: 90 }}>
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#1e293b",
                        }}
                    >
                        {day.date}
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>
                        {day.day_name}
                    </div>
                </div>
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        gap: 16,
                        flexWrap: "wrap",
                    }}
                >
                    <span style={{ fontSize: 12, color: "#475569" }}>
                        🕐 {day.first_joined}{" "}
                        {day.last_left ? `← ${day.last_left}` : "(مفتوح)"}
                    </span>
                    <span
                        style={{
                            fontSize: 12,
                            color: "#059669",
                            fontWeight: 700,
                        }}
                    >
                        ⏱ {day.duration_label}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                        {day.sessions_count} جلسة
                    </span>
                </div>
                {open ? (
                    <FiChevronDown size={14} color="#94a3b8" />
                ) : (
                    <FiChevronLeft size={14} color="#94a3b8" />
                )}
            </div>
            {open && (
                <div style={{ padding: "8px 14px 12px", background: "#fff" }}>
                    {day.sessions.map((s, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                                padding: "6px 0",
                                borderBottom: "1px solid #f1f5f9",
                            }}
                        >
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: s.is_open
                                        ? "#f59e0b"
                                        : "#22c55e",
                                    display: "inline-block",
                                    flexShrink: 0,
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "#475569",
                                    minWidth: 80,
                                }}
                            >
                                {s.joined_at?.slice(0, 5)} →{" "}
                                {s.left_at?.slice(0, 5) ?? "جارٍ"}
                            </span>
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "#64748b",
                                    flex: 1,
                                }}
                            >
                                {s.circle_name ?? "—"}
                            </span>
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "#059669",
                                    fontWeight: 700,
                                }}
                            >
                                {s.duration_minutes} د
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Teacher Card ─────────────────────────────────────────────────
const TeacherCard = ({
    teacher,
    index,
}: {
    teacher: Teacher;
    index: number;
}) => {
    const [expanded, setExpanded] = useState(false);
    const [tab, setTab] = useState<"sessions" | "circles" | "schedules">(
        "sessions",
    );
    const T = teacher;

    return (
        <article
            style={{
                background: "#fff",
                borderRadius: 20,
                boxShadow: "0 2px 16px #0001",
                marginBottom: 16,
                overflow: "hidden",
                borderRight: `4px solid ${T.status === "active" ? "#22c55e" : T.status === "suspended" ? "#ef4444" : "#f59e0b"}`,
            }}
        >
            {/* ── رأس البطاقة ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    flexWrap: "wrap",
                }}
            >
                <Avatar idx={index} />

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
                                fontSize: 15,
                                color: "#1e293b",
                            }}
                        >
                            {T.name}
                        </span>
                        <Badge type={T.status} />
                        {T.attendance_today && (
                            <Badge type={T.attendance_today} />
                        )}
                        <span
                            style={{
                                background: "#ede9fe",
                                color: "#7c3aed",
                                borderRadius: 20,
                                padding: "2px 10px",
                                fontSize: 11,
                                fontWeight: 700,
                            }}
                        >
                            {roleLabel[T.teacher?.role] ?? "مدرس"}
                        </span>
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            color: "#64748b",
                            marginTop: 4,
                            display: "flex",
                            gap: 14,
                            flexWrap: "wrap",
                        }}
                    >
                        <span>
                            <FiMail size={11} /> {T.email}
                        </span>
                        {T.phone && (
                            <span>
                                <FiPhone size={11} /> {T.phone}
                            </span>
                        )}
                        <span>
                            <FiUsers size={11} /> {T.students_count} طالب
                        </span>
                        <span>
                            <FaChalkboardTeacher size={11} /> {T.circles_count}{" "}
                            حلقة
                        </span>
                    </div>
                </div>

                {/* إحصائيات سريعة */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[
                        {
                            label: "ساعات الفترة",
                            value: T.hours_this_period,
                            color: "#0284c7",
                        },
                        {
                            label: "أيام الحضور",
                            value: T.days_attended,
                            color: "#16a34a",
                        },
                        {
                            label: "الجلسات",
                            value: T.total_sessions,
                            color: "#9333ea",
                        },
                    ].map((s) => (
                        <div
                            key={s.label}
                            style={{
                                textAlign: "center",
                                background: "#f8fafc",
                                borderRadius: 12,
                                padding: "8px 14px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 900,
                                    color: s.color,
                                }}
                            >
                                {s.value}
                            </div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setExpanded((v) => !v)}
                    style={{
                        background: "#f1f5f9",
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 12px",
                        cursor: "pointer",
                        color: "#475569",
                    }}
                >
                    {expanded ? (
                        <FiChevronDown size={18} />
                    ) : (
                        <FiChevronLeft size={18} />
                    )}
                </button>
            </div>

            {/* ── شريط الخطة ── */}
            {T.plan && (
                <div
                    style={{
                        margin: "0 20px 12px",
                        padding: "10px 14px",
                        background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                        borderRadius: 12,
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#15803d",
                        }}
                    >
                        📖 {T.plan.title}
                    </span>
                    <span style={{ fontSize: 11, color: "#166534" }}>
                        ⏰ {T.plan.time_range}
                    </span>
                    <span style={{ fontSize: 11, color: "#166534" }}>
                        {T.plan.weekly_days.join(" · ")}
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            color: "#166534",
                            marginRight: "auto",
                        }}
                    >
                        {T.plan.sessions_done} جلسة منجزة
                    </span>
                </div>
            )}

            {/* ── آخر حضور ── */}
            {T.last_checkin && (
                <div
                    style={{
                        margin: "0 20px 14px",
                        fontSize: 12,
                        color: "#475569",
                        display: "flex",
                        gap: 16,
                    }}
                >
                    <span>
                        🕐 آخر دخول: <b>{T.last_checkin}</b>
                    </span>
                    {T.delay_minutes > 0 && (
                        <span style={{ color: "#f59e0b" }}>
                            ⚠️ تأخير {T.delay_minutes} دقيقة
                        </span>
                    )}
                    <span>⏱ {T.duration_label}</span>
                </div>
            )}

            {/* ── تفاصيل موسّعة ── */}
            {expanded && (
                <div
                    style={{
                        borderTop: "1px solid #f1f5f9",
                        padding: "16px 20px",
                    }}
                >
                    {/* تبويب */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        {(["sessions", "circles", "schedules"] as const).map(
                            (t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    style={{
                                        padding: "6px 16px",
                                        borderRadius: 20,
                                        border: "none",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        fontSize: 12,
                                        background:
                                            tab === t ? "#1e293b" : "#f1f5f9",
                                        color: tab === t ? "#fff" : "#475569",
                                    }}
                                >
                                    {
                                        {
                                            sessions: "الجلسات",
                                            circles: "الحلقات",
                                            schedules: "المواعيد",
                                        }[t]
                                    }
                                </button>
                            ),
                        )}
                    </div>

                    {/* الجلسات اليومية */}
                    {tab === "sessions" && (
                        <div>
                            {T.daily_sessions.length === 0 ? (
                                <div
                                    style={{
                                        color: "#94a3b8",
                                        textAlign: "center",
                                        padding: 20,
                                    }}
                                >
                                    لا توجد جلسات في هذه الفترة
                                </div>
                            ) : (
                                T.daily_sessions.map((d, i) => (
                                    <DayRow key={i} day={d} />
                                ))
                            )}
                        </div>
                    )}

                    {/* الحلقات */}
                    {tab === "circles" && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            {T.circles.length === 0 ? (
                                <div
                                    style={{
                                        color: "#94a3b8",
                                        textAlign: "center",
                                        padding: 20,
                                    }}
                                >
                                    لا توجد حلقات
                                </div>
                            ) : (
                                T.circles.map((c) => (
                                    <div
                                        key={c.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "10px 14px",
                                            background: "#f8fafc",
                                            borderRadius: 10,
                                            fontSize: 13,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: 700,
                                                color: "#1e293b",
                                            }}
                                        >
                                            {c.name}
                                        </span>
                                        <span
                                            style={{
                                                color: "#059669",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {c.students_count} طالب
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* المواعيد */}
                    {tab === "schedules" && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            {T.schedules.length === 0 ? (
                                <div
                                    style={{
                                        color: "#94a3b8",
                                        textAlign: "center",
                                        padding: 20,
                                    }}
                                >
                                    لا توجد مواعيد
                                </div>
                            ) : (
                                T.schedules.map((s, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            gap: 12,
                                            alignItems: "center",
                                            padding: "10px 14px",
                                            background: "#f8fafc",
                                            borderRadius: 10,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 800,
                                                color: "#1e293b",
                                                minWidth: 80,
                                            }}
                                        >
                                            {s.day_of_week}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                color: "#0284c7",
                                            }}
                                        >
                                            ⏰ {s.time_range}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                color: "#475569",
                                                flex: 1,
                                            }}
                                        >
                                            {s.circle_name}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                color: "#64748b",
                                            }}
                                        >
                                            {s.plan_name}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                color: "#059669",
                                            }}
                                        >
                                            {s.booked}/{s.max_students ?? "∞"}{" "}
                                            طالب
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </article>
    );
};

// ── Main Component ───────────────────────────────────────────────
const TeacherAttendanceReport: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        per_page: 8,
        total: 0,
        last_page: 1,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDS] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(8);
    const [dateFrom, setDateFrom] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .slice(0, 10),
    );
    const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
    const timer = useRef<number>();

    useEffect(() => {
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setDS(search), 350);
        return () => clearTimeout(timer.current);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const p = new URLSearchParams({
                page: String(page),
                per_page: String(perPage),
                search: debouncedSearch,
                status,
                date_from: dateFrom,
                date_to: dateTo,
            });
            const d = await apiFetch(`/api/v1/teachers/attendance-report?${p}`);
            setTeachers(d.data ?? []);
            setPagination(
                d.pagination ?? {
                    current_page: 1,
                    per_page: 8,
                    total: 0,
                    last_page: 1,
                },
            );
            setStats(d.stats ?? null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, debouncedSearch, status, dateFrom, dateTo]);

    useEffect(() => {
        load();
    }, [load]);

    const pages = () => {
        const last = pagination.last_page;
        if (last <= 6) return Array.from({ length: last }, (_, i) => i + 1);
        if (page <= 3) return [1, 2, 3, 4, "...", last];
        if (page >= last - 2)
            return [1, "...", last - 3, last - 2, last - 1, last];
        return [1, "...", page - 1, page, page + 1, "...", last];
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
            {/* ── Header ── */}
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
                        تقرير حضور المعلمين
                    </h1>
                    <p
                        style={{
                            margin: "6px 0 0",
                            color: "#94a3b8",
                            fontSize: 13,
                        }}
                    >
                        متابعة شاملة لأوقات الدخول والخروج والجلسات اليومية لكل
                        معلم
                    </p>
                </div>
            </div>

            {/* ── Stats ── */}
            {stats && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(160px,1fr))",
                        gap: 14,
                        marginBottom: 24,
                    }}
                >
                    <StatCard
                        icon={<FaChalkboardTeacher />}
                        label="إجمالي المعلمين"
                        value={stats.total}
                        accent="#1e293b"
                    />
                    <StatCard
                        icon={<FiCheckCircle />}
                        label="نشطون"
                        value={stats.active}
                        accent="#16a34a"
                    />
                    <StatCard
                        icon={<FiCheckCircle />}
                        label="حضور اليوم"
                        value={stats.present_today}
                        accent="#0284c7"
                    />
                    <StatCard
                        icon={<FiClock />}
                        label="معلقون"
                        value={stats.pending}
                        accent="#ca8a04"
                    />
                    <StatCard
                        icon={<FiXCircle />}
                        label="موقوفون"
                        value={stats.suspended}
                        accent="#dc2626"
                    />
                    <StatCard
                        icon={<FiTrendingUp />}
                        label="ساعات الفترة"
                        value={stats.total_hours_period}
                        sub={stats.duration_label}
                        accent="#9333ea"
                    />
                </div>
            )}

            {/* ── Filters ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    boxShadow: "0 2px 10px #0001",
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
                        minWidth: 180,
                    }}
                >
                    <FiSearch size={15} color="#94a3b8" />
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="ابحث باسم المعلم أو البريد"
                        style={{
                            border: "none",
                            background: "transparent",
                            outline: "none",
                            fontSize: 13,
                            flex: 1,
                            fontFamily: "inherit",
                        }}
                    />
                </label>

                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: "8px 14px",
                        fontSize: 13,
                        fontFamily: "inherit",
                        background: "#f8fafc",
                        color: "#475569",
                    }}
                >
                    <option value="">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="pending">معلق</option>
                    <option value="suspended">موقوف</option>
                </select>

                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: "8px 14px",
                        fontSize: 13,
                        fontFamily: "inherit",
                        background: "#f8fafc",
                    }}
                />

                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: "8px 14px",
                        fontSize: 13,
                        fontFamily: "inherit",
                        background: "#f8fafc",
                    }}
                />

                <select
                    value={perPage}
                    onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                    }}
                    style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: "8px 14px",
                        fontSize: 13,
                        fontFamily: "inherit",
                        background: "#f8fafc",
                        color: "#475569",
                    }}
                >
                    {[8, 12, 20].map((n) => (
                        <option key={n} value={n}>
                            {n} / صفحة
                        </option>
                    ))}
                </select>

                <button
                    onClick={load}
                    style={{
                        background: "#1e293b",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                    }}
                >
                    <FiRefreshCw size={14} /> تحديث
                </button>

                <button
                    onClick={() => {
                        setSearch("");
                        setStatus("");
                        setPage(1);
                    }}
                    style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                    }}
                >
                    <FiX size={14} /> إعادة ضبط
                </button>
            </div>

            {/* ── Error ── */}
            {error && (
                <div
                    style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        borderRadius: 12,
                        padding: "12px 16px",
                        marginBottom: 16,
                        fontSize: 13,
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

            {/* ── List ── */}
            {loading ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: 60,
                        color: "#94a3b8",
                        fontSize: 18,
                    }}
                >
                    ⏳ جارٍ تحميل البيانات...
                </div>
            ) : teachers.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: 60,
                        color: "#94a3b8",
                    }}
                >
                    لا توجد نتائج مطابقة.
                </div>
            ) : (
                teachers.map((t, i) => (
                    <TeacherCard key={t.teacher_id} teacher={t} index={i} />
                ))
            )}

            {/* ── Pagination ── */}
            {pagination.last_page > 1 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 24,
                    }}
                >
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            padding: "6px 12px",
                            background: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        <FiChevronRight size={14} />
                    </button>
                    {pages().map((p2, i) =>
                        p2 === "..." ? (
                            <span
                                key={i}
                                style={{ padding: "0 4px", color: "#94a3b8" }}
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={i}
                                onClick={() => setPage(p2 as number)}
                                style={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 8,
                                    padding: "6px 12px",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    background:
                                        page === p2 ? "#1e293b" : "#fff",
                                    color: page === p2 ? "#fff" : "#475569",
                                }}
                            >
                                {p2}
                            </button>
                        ),
                    )}
                    <button
                        onClick={() =>
                            setPage((p) =>
                                Math.min(pagination.last_page, p + 1),
                            )
                        }
                        disabled={page >= pagination.last_page}
                        style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            padding: "6px 12px",
                            background: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        <FiChevronLeft size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendanceReport;
