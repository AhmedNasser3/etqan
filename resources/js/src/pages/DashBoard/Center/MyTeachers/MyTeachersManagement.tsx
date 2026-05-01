import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
    FiCalendar,
    FiCheckCircle,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiEdit3,
    FiEye,
    FiFilter,
    FiMail,
    FiPhone,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiTrash2,
    FiTrendingUp,
    FiUsers,
    FiX,
    FiXCircle,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaMosque, FaMoneyBillWave } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { RiRobot2Fill } from "react-icons/ri";

/* ─── Types ─── */
type TeacherStatus = "active" | "pending" | "suspended" | "inactive";
type AttendanceStatus = "present" | "late" | "absent";
type DetailTab = "circles" | "students";

interface TeacherCircle {
    id: number | string;
    name: string;
    studentsCount: number;
    timeRange?: string | null;
    notes?: string | null;
}
interface TeacherStudent {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
}
interface TeacherPlan {
    id: string;
    title: string;
    description?: string;
    studentsCount: number;
    sessionsDone: number;
    sessionsTotal: number;
    weeklyDays: string[];
    timeRange?: string | null;
}
interface Teacher {
    id: number;
    user_id?: number;
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
    deduction?: number;
    net_salary?: number;
    attendance_rate?: number;
    hours_this_month?: number;
    last_checkin?: string | null;
    attendance_today?: AttendanceStatus | null;
    delay_minutes?: number;
    circles?: TeacherCircle[];
    students?: TeacherStudent[];
    plan?: TeacherPlan | null;
    teacher?: { role?: string; notes?: string; session_time?: string };
}
interface Pagination {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from?: number;
    to?: number;
}
interface Stats {
    total: number;
    active: number;
    pending: number;
    suspended: number;
}
interface AttendanceRecord {
    teacher_id?: number;
    status?: AttendanceStatus;
    checkin_time?: string;
    delay_minutes?: number;
}

/* ─── Constants ─── */
const ROLE_LABELS: Record<string, string> = {
    teacher: "مدرس",
    supervisor: "مشرف",
    motivator: "محفز",
    student_affairs: "شؤون طلاب",
    financial: "مالي",
};

const STATUS_META: Record<
    string,
    { label: string; bg: string; color: string; icon: ReactNode }
> = {
    active: {
        label: "نشط",
        bg: "#DCFCE7",
        color: "#166534",
        icon: <FiCheckCircle size={11} />,
    },
    pending: {
        label: "معلّق",
        bg: "#FEF9C3",
        color: "#854D0E",
        icon: <FiClock size={11} />,
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
        icon: <FiXCircle size={11} />,
    },
    present: {
        label: "حاضر",
        bg: "#DCFCE7",
        color: "#166534",
        icon: <FiCheckCircle size={11} />,
    },
    late: {
        label: "متأخر",
        bg: "#FEF9C3",
        color: "#854D0E",
        icon: <FiClock size={11} />,
    },
    absent: {
        label: "غائب",
        bg: "#FEE2E2",
        color: "#991B1B",
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

const MOCK_TEACHERS: Teacher[] = [
    {
        id: 1,
        name: "الشيخ محمد أحمد عبد الله",
        email: "m.ahmed@example.com",
        phone: "0501234567",
        status: "active",
        created_at: "2024-01-10",
        mosque: "مسجد النور",
        mosque_id: 11,
        circles_count: 3,
        students_count: 67,
        salary: 3200,
        deduction: 320,
        net_salary: 2880,
        attendance_rate: 92,
        hours_this_month: 18,
        last_checkin: "07:55",
        attendance_today: "present",
        delay_minutes: 0,
        teacher: {
            role: "teacher",
            notes: "يتابع حلقتين صباحيتين وخطة ختمة شهرية.",
            session_time: "07:00 - 12:00",
        },
        circles: [
            {
                id: 1,
                name: "حلقة: تختيم القرآن (2) - (8-9 سنوات) (ID: 1) | من 7:30 م إلى 8:30 م",
                studentsCount: 24,
            },
            {
                id: 2,
                name: "حلقة: حلقة الرحمن لتختيم القرآن (ID: 8) | من 5:00 م إلى 6:00 م",
                studentsCount: 18,
            },
            {
                id: 3,
                name: "حلقة: مراجعة المتقدمين (ID: 9) | من 8:30 م إلى 9:30 م",
                studentsCount: 25,
            },
        ],
        students: [
            { id: 101, name: "أحمد محمد علي", phone: "0501110001" },
            { id: 102, name: "محمود عبد الله", phone: "0501110002" },
            { id: 103, name: "يوسف إبراهيم", phone: "0501110003" },
        ],
        plan: {
            id: "p-1",
            title: "خطة ختم القرآن خلال 17 شهرًا",
            description: "وجه يومي مع مراجعة أسبوعية.",
            studentsCount: 24,
            sessionsDone: 62,
            sessionsTotal: 170,
            weeklyDays: ["السبت", "الثلاثاء"],
            timeRange: "07:00 - 09:00",
        },
    },
    {
        id: 2,
        name: "الشيخة آمنة إبراهيم",
        email: "amina@example.com",
        phone: "0509876543",
        status: "active",
        created_at: "2024-03-21",
        mosque: "مسجد الفتح",
        mosque_id: 12,
        circles_count: 2,
        students_count: 44,
        salary: 2600,
        deduction: 0,
        net_salary: 2600,
        attendance_rate: 100,
        hours_this_month: 20,
        last_checkin: "08:05",
        attendance_today: "present",
        delay_minutes: 0,
        teacher: {
            role: "supervisor",
            notes: "تشرف على حلقة البنات وتتابع التقييم الشهري.",
            session_time: "08:00 - 12:00",
        },
        circles: [
            {
                id: 4,
                name: "حلقة: بنات النور (ID: 4) | من 8:00 ص إلى 10:00 ص",
                studentsCount: 24,
            },
            {
                id: 5,
                name: "حلقة: التحفيظ النسائي (ID: 5) | من 10:00 ص إلى 12:00 م",
                studentsCount: 20,
            },
        ],
        students: [
            { id: 201, name: "سلمى أحمد", phone: "0502220001" },
            { id: 202, name: "إيمان علي", phone: "0502220002" },
        ],
        plan: {
            id: "p-2",
            title: "خطة تحفيظ 10 أجزاء",
            description: "برنامج تدريجي للأجزاء 21 إلى 30.",
            studentsCount: 24,
            sessionsDone: 31,
            sessionsTotal: 80,
            weeklyDays: ["السبت", "الثلاثاء"],
            timeRange: "08:00 - 10:00",
        },
    },
    {
        id: 3,
        name: "الشيخ طارق فوزي البكري",
        email: "tarek@example.com",
        phone: "0502221111",
        status: "suspended",
        created_at: "2023-11-02",
        mosque: "مسجد الرحمة",
        mosque_id: 13,
        circles_count: 1,
        students_count: 0,
        salary: 3100,
        deduction: 620,
        net_salary: 2480,
        attendance_rate: 53,
        hours_this_month: 8,
        last_checkin: null,
        attendance_today: "absent",
        delay_minutes: 0,
        teacher: {
            role: "teacher",
            notes: "يحتاج متابعة انتظام الحضور.",
            session_time: "09:00 - 11:30",
        },
        circles: [
            {
                id: 6,
                name: "حلقة: تختيم القرآن (2) (ID: 6) | من 9:00 ص إلى 11:00 ص",
                studentsCount: 0,
            },
        ],
        students: [],
        plan: {
            id: "p-3",
            title: "خطة ختم القرآن للمتقدمين",
            description: "ختم مجود مع جلسات مراجعة.",
            studentsCount: 0,
            sessionsDone: 55,
            sessionsTotal: 180,
            weeklyDays: ["السبت", "الثلاثاء", "الخميس"],
            timeRange: "09:00 - 11:00",
        },
    },
];

/* ─── Helpers ─── */
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

const fmtSalary = (n?: number) =>
    n ? `${n.toLocaleString("ar-EG")} ج.م` : "—";
const fmtPct = (n?: number) => (n != null ? `${n}%` : "—");

const parseCircle = (c: TeacherCircle) => {
    const src = (c.notes || c.name || "").trim();
    const parts = src.split("|").map((p) => p.trim());
    const title = (parts[0] || src)
        .replace(/^حلقة:\s*/i, "")
        .replace(/\s*\(ID:\s*\d+\)\s*$/i, "")
        .trim();
    return {
        title: title || "حلقة غير محددة",
        time: parts[1] || c.timeRange || "غير محدد",
    };
};

/* ─── Sub-components ─── */

/* Avatar illustration - improved */
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
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");

    return (
        <div
            style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: av.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
                overflow: "hidden",
                border: `2px solid ${av.color}22`,
            }}
        >
            <svg
                viewBox="0 0 80 80"
                width="52"
                height="52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: "absolute", inset: 0 }}
            >
                {/* body / robe */}
                <path
                    d="M8 82C8 56 22 49 40 49C58 49 72 56 72 82Z"
                    fill={robe}
                />
                {/* collar */}
                <path
                    d="M33 49C33 49 40 56 47 49"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    fill="none"
                />
                {/* neck */}
                <rect x="35" y="42" width="10" height="9" rx="3" fill={skin} />
                {/* head */}
                <ellipse cx="40" cy="31" rx="14" ry="15" fill={skin} />
                {/* hair / kufi */}
                <path
                    d="M26 27C26 18.7 32.3 12 40 12C47.7 12 54 18.7 54 27H26Z"
                    fill="#2C1810"
                    fillOpacity="0.85"
                />
                {/* kufi band */}
                <rect
                    x="26"
                    y="25"
                    width="28"
                    height="4"
                    rx="2"
                    fill="#fff"
                    fillOpacity="0.15"
                />
                {/* beard */}
                <path
                    d="M29 40Q34 50 40 51Q46 50 51 40Q48 46 40 48Q32 46 29 40Z"
                    fill="#2C1810"
                    fillOpacity="0.55"
                />
                {/* eyes */}
                <ellipse cx="35.5" cy="32" rx="2.2" ry="2.5" fill="#fff" />
                <ellipse cx="44.5" cy="32" rx="2.2" ry="2.5" fill="#fff" />
                <circle cx="36" cy="32.5" r="1.4" fill="#1a0f0a" />
                <circle cx="45" cy="32.5" r="1.4" fill="#1a0f0a" />
                <circle cx="36.6" cy="31.8" r="0.5" fill="#fff" />
                <circle cx="45.6" cy="31.8" r="0.5" fill="#fff" />
                {/* brows */}
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
                {/* smile */}
                <path
                    d="M37 38Q40 41 43 38"
                    stroke="#B87040"
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinecap="round"
                />
                {/* ears */}
                <ellipse cx="26.5" cy="33" rx="2" ry="3" fill={skin} />
                <ellipse cx="53.5" cy="33" rx="2" ry="3" fill={skin} />
            </svg>
            {/* fallback initials overlay - hidden but accessible */}
            <span
                style={{
                    position: "absolute",
                    opacity: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    color: av.color,
                }}
            >
                {initials}
            </span>
        </div>
    );
};

/* Status badge */
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

/* Role pill */
const RolePill = ({ role }: { role?: string }) => {
    const roleStyle: Record<string, { bg: string; color: string }> = {
        teacher: { bg: "#E1F5EE", color: "#085041" },
        supervisor: { bg: "#E6F1FB", color: "#0C447C" },
        motivator: { bg: "#FAEEDA", color: "#633806" },
        student_affairs: { bg: "#EAF3DE", color: "#27500A" },
        financial: { bg: "#FCEBEB", color: "#A32D2D" },
    };
    const s = roleStyle[role || "teacher"] ?? roleStyle.teacher;
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
            {ROLE_LABELS[role || "teacher"] ?? "مدرس"}
        </span>
    );
};

/* Info tile */
const InfoTile = ({
    icon,
    label,
    value,
    accent,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    accent?: string;
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
        <div
            style={{ color: accent || "#0f6e56", marginTop: 2, flexShrink: 0 }}
        >
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

/* Toast */
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

/* Confirm Modal */
const ConfirmModal = ({
    message,
    onConfirm,
    onCancel,
}: {
    message: string;
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
                تأكيد الإجراء
            </h3>
            <p
                style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 24,
                    lineHeight: 1.7,
                }}
            >
                {message}
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

/* Teacher Form Modal */
const TeacherFormModal = ({
    title,
    submitLabel,
    mosques,
    initialValues,
    onClose,
    onSubmit,
}: {
    title: string;
    submitLabel: string;
    mosques: string[];
    initialValues: {
        name: string;
        email: string;
        phone: string;
        teacher_role: string;
        notes: string;
        mosque: string;
    };
    onClose: () => void;
    onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}) => {
    const [form, setForm] = useState(initialValues);
    const [saving, setSaving] = useState(false);
    const upd =
        (key: keyof typeof form) =>
        (
            e: ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) =>
            setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const submit = async () => {
        setSaving(true);
        try {
            await onSubmit(form);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const fieldStyle: React.CSSProperties = {
        width: "100%",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "9px 13px",
        fontSize: 13,
        fontFamily: "'Tajawal',sans-serif",
        background: "#f8fafc",
        color: "#1e293b",
        outline: "none",
        boxSizing: "border-box",
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9000,
                background: "rgba(0,0,0,0.45)",
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
                    padding: "28px 32px",
                    maxWidth: 680,
                    width: "100%",
                    fontFamily: "'Tajawal',sans-serif",
                    direction: "rtl",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                {/* ornament strip */}
                <div
                    style={{
                        height: 4,
                        background:
                            "linear-gradient(90deg,#0f6e56,#22c55e,#0f6e56)",
                        borderRadius: 4,
                        marginBottom: 20,
                    }}
                />
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 20,
                    }}
                >
                    <div>
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
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: 12,
                                color: "#94a3b8",
                            }}
                        >
                            أدخل البيانات المطلوبة بدقة
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            border: "none",
                            background: "#f1f5f9",
                            borderRadius: 8,
                            padding: 6,
                            cursor: "pointer",
                            display: "flex",
                        }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(260px,1fr))",
                        gap: 20,
                    }}
                >
                    {/* Panel 1 */}
                    <div>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: "#0f6e56",
                                marginBottom: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <FiEdit3 size={13} /> البيانات الأساسية
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            {[
                                {
                                    label: "الاسم",
                                    key: "name" as const,
                                    type: "text",
                                },
                                {
                                    label: "البريد الإلكتروني",
                                    key: "email" as const,
                                    type: "email",
                                },
                                {
                                    label: "الهاتف",
                                    key: "phone" as const,
                                    type: "tel",
                                },
                            ].map((f) => (
                                <label
                                    key={f.key}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 4,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: "#64748b",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {f.label}
                                    </span>
                                    <input
                                        type={f.type}
                                        value={form[f.key]}
                                        onChange={upd(f.key)}
                                        style={fieldStyle}
                                    />
                                </label>
                            ))}
                            <label
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "#64748b",
                                        fontWeight: 700,
                                    }}
                                >
                                    الدور الوظيفي
                                </span>
                                <select
                                    value={form.teacher_role}
                                    onChange={upd("teacher_role")}
                                    style={fieldStyle}
                                >
                                    {Object.entries(ROLE_LABELS).map(
                                        ([k, v]) => (
                                            <option key={k} value={k}>
                                                {v}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </label>
                        </div>
                    </div>
                    {/* Panel 2 */}
                    <div>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: "#0f6e56",
                                marginBottom: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <FaMosque size={13} /> الربط والملاحظات
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            <label
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "#64748b",
                                        fontWeight: 700,
                                    }}
                                >
                                    المسجد
                                </span>
                                <select
                                    value={form.mosque}
                                    onChange={upd("mosque")}
                                    style={fieldStyle}
                                >
                                    <option value="">بلا مسجد</option>
                                    {mosques.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "#64748b",
                                        fontWeight: 700,
                                    }}
                                >
                                    الملاحظات
                                </span>
                                <textarea
                                    rows={6}
                                    value={form.notes}
                                    onChange={upd("notes")}
                                    style={{
                                        ...fieldStyle,
                                        resize: "vertical",
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                        marginTop: 24,
                        paddingTop: 16,
                        borderTop: "1px solid #f1f5f9",
                    }}
                >
                    <button
                        onClick={onClose}
                        style={btnS("#f8fafc", "#475569", "1px solid #e2e8f0")}
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={submit}
                        disabled={saving}
                        style={btnS("#0f6e56", "#fff")}
                    >
                        {saving ? "جاري الحفظ..." : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Teacher Card ─── */
const TeacherCard = ({
    teacher,
    index,
    expanded,
    onToggleExpand,
    onEdit,
    onToggleStatus,
    onDelete,
    onStudentClick,
    onViewAllStudents,
}: {
    teacher: Teacher;
    index: number;
    expanded: boolean;
    onToggleExpand: () => void;
    onEdit: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
    onStudentClick: (s: TeacherStudent) => void;
    onViewAllStudents: (t: Teacher) => void;
}) => {
    const [detailTab, setDetailTab] = useState<DetailTab>("circles");
    const plan = teacher.plan;
    const planPct = plan
        ? Math.min(
              100,
              Math.round(
                  (plan.sessionsDone / Math.max(plan.sessionsTotal, 1)) * 100,
              ),
          )
        : 0;
    const borderColor =
        teacher.status === "active"
            ? "#22c55e"
            : teacher.status === "suspended"
              ? "#ef4444"
              : "#f59e0b";

    return (
        <article
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
            {/* Head */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px 18px",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    <button
                        onClick={onToggleExpand}
                        style={{
                            border: "none",
                            background: "#f8fafc",
                            borderRadius: 8,
                            padding: 6,
                            cursor: "pointer",
                            display: "flex",
                            flexShrink: 0,
                        }}
                    >
                        {expanded ? (
                            <FiChevronDown size={15} />
                        ) : (
                            <FiChevronLeft size={15} />
                        )}
                    </button>
                    <TeacherAvatar idx={index} name={teacher.name} />
                    <div style={{ minWidth: 0 }}>
                        <div
                            style={{
                                fontWeight: 900,
                                fontSize: 14,
                                color: "#1e293b",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {teacher.name}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                                marginTop: 5,
                                flexWrap: "wrap",
                                alignItems: "center",
                            }}
                        >
                            <RolePill role={teacher.teacher?.role} />
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                ·
                            </span>
                            <span style={{ fontSize: 11, color: "#64748b" }}>
                                {teacher.mosque || "غير مربوط"}
                            </span>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                ·
                            </span>
                            <span style={{ fontSize: 11, color: "#64748b" }}>
                                {teacher.students_count || 0} طالب
                            </span>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                ·
                            </span>
                            <span style={{ fontSize: 11, color: "#64748b" }}>
                                {teacher.circles_count || 0} حلقات
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                    }}
                >
                    <StatusBadge status={teacher.status} />
                    {teacher.attendance_today && (
                        <StatusBadge status={teacher.attendance_today} />
                    )}
                    <button onClick={onEdit} style={iconBtn()} title="تعديل">
                        <FiEdit3 size={14} />
                    </button>
                    <button
                        onClick={onToggleStatus}
                        style={iconBtn()}
                        title="تغيير الحالة"
                    >
                        <FiRefreshCw size={14} />
                    </button>
                    <button
                        onClick={onDelete}
                        style={iconBtn("#fee2e2", "#dc2626")}
                        title="تعليق"
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Info grid */}
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    padding: "0 18px 14px",
                    flexWrap: "wrap",
                }}
            >
                <InfoTile
                    icon={<FaMosque size={14} />}
                    label="المسجد"
                    value={teacher.mosque || "بلا مسجد"}
                />
                <InfoTile
                    icon={<FiUsers size={14} />}
                    label="الطلاب"
                    value={`${teacher.students_count || 0} طالب`}
                    accent="#0284c7"
                />
                <InfoTile
                    icon={<FiClock size={14} />}
                    label="آخر حضور"
                    value={teacher.last_checkin || "لا يوجد"}
                    accent="#9333ea"
                />
                <InfoTile
                    icon={<FaMoneyBillWave size={14} />}
                    label="الصافي"
                    value={fmtSalary(teacher.net_salary)}
                    accent="#059669"
                />
                {teacher.attendance_rate != null && (
                    <InfoTile
                        icon={<FiTrendingUp size={14} />}
                        label="نسبة الحضور"
                        value={fmtPct(teacher.attendance_rate)}
                        accent="#f59e0b"
                    />
                )}
            </div>

            {/* Plan strip */}
            {plan && (
                <div
                    style={{
                        margin: "0 18px 14px",
                        padding: "12px 14px",
                        background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                        borderRadius: 14,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 6,
                            fontWeight: 800,
                            fontSize: 13,
                            color: "#15803d",
                        }}
                    >
                        <GoGoal size={14} /> {plan.title}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            fontSize: 11,
                            color: "#166534",
                            marginBottom: 8,
                            flexWrap: "wrap",
                        }}
                    >
                        <span>{plan.studentsCount} طالب</span>
                        <span>{plan.timeRange || "—"}</span>
                        <span>{plan.weeklyDays.join(" · ")}</span>
                    </div>
                    <div
                        style={{
                            background: "#bbf7d0",
                            borderRadius: 99,
                            height: 6,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${planPct}%`,
                                background:
                                    "linear-gradient(90deg,#16a34a,#22c55e)",
                                borderRadius: 99,
                                transition: "width .4s",
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 10,
                            color: "#166534",
                            marginTop: 4,
                        }}
                    >
                        <span>{plan.sessionsDone} جلسة منجزة</span>
                        <span>
                            {planPct}% · {plan.sessionsTotal} إجمالي
                        </span>
                    </div>
                </div>
            )}

            {/* Expanded panel */}
            {expanded && (
                <div style={{ borderTop: "1px solid #f1f5f9" }}>
                    {/* Tab bar */}
                    <div
                        style={{
                            display: "flex",
                            gap: 0,
                            borderBottom: "1px solid #f1f5f9",
                        }}
                    >
                        {(
                            [
                                ["circles", "الحلقات"],
                                ["students", "الطلاب"],
                            ] as [DetailTab, string][]
                        ).map(([tab, label]) => (
                            <button
                                key={tab}
                                onClick={() => setDetailTab(tab)}
                                style={{
                                    flex: 1,
                                    padding: "10px 0",
                                    border: "none",
                                    borderBottom:
                                        detailTab === tab
                                            ? "2px solid #0f6e56"
                                            : "2px solid transparent",
                                    background: "transparent",
                                    cursor: "pointer",
                                    fontFamily: "'Tajawal',sans-serif",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color:
                                        detailTab === tab
                                            ? "#0f6e56"
                                            : "#94a3b8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                }}
                            >
                                {tab === "circles" ? (
                                    <FaChalkboardTeacher size={13} />
                                ) : (
                                    <FiUsers size={13} />
                                )}{" "}
                                {label}
                            </button>
                        ))}
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit,minmax(240px,1fr))",
                            gap: 0,
                        }}
                    >
                        {/* Details column */}
                        <div
                            style={{
                                padding: "14px 18px",
                                borderLeft: "1px solid #f8fafc",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: "#64748b",
                                    marginBottom: 10,
                                }}
                            >
                                البيانات التفصيلية
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                {[
                                    {
                                        icon: <FiMail size={12} />,
                                        val: teacher.email,
                                    },
                                    {
                                        icon: <FiPhone size={12} />,
                                        val: teacher.phone || "لا يوجد رقم",
                                    },
                                    {
                                        icon: <FiCalendar size={12} />,
                                        val: teacher.created_at?.slice(0, 10),
                                    },
                                    {
                                        icon: <RiRobot2Fill size={12} />,
                                        val:
                                            teacher.teacher?.notes ||
                                            "لا توجد ملاحظات",
                                    },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 8,
                                            fontSize: 12,
                                            color: "#475569",
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: "#0f6e56",
                                                marginTop: 1,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                        <span>{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Circles / Students column */}
                        <div style={{ padding: "14px 18px" }}>
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: "#64748b",
                                    marginBottom: 10,
                                }}
                            >
                                {detailTab === "circles"
                                    ? "الحلقات المرتبطة"
                                    : "الطلاب"}
                            </div>
                            {detailTab === "circles" ? (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                    }}
                                >
                                    {(teacher.circles || []).length > 0 ? (
                                        teacher.circles!.map((c) => {
                                            const p = parseCircle(c);
                                            return (
                                                <div
                                                    key={c.id}
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                        padding: "8px 12px",
                                                        background: "#f8fafc",
                                                        borderRadius: 10,
                                                        gap: 8,
                                                    }}
                                                >
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                color: "#1e293b",
                                                            }}
                                                        >
                                                            {p.title}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#94a3b8",
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            {c.studentsCount}{" "}
                                                            طالب
                                                        </div>
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#0f6e56",
                                                            fontWeight: 700,
                                                            whiteSpace:
                                                                "nowrap",
                                                            background:
                                                                "#e1f5ee",
                                                            padding: "3px 8px",
                                                            borderRadius: 8,
                                                        }}
                                                    >
                                                        {p.time}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#94a3b8",
                                            }}
                                        >
                                            لا توجد حلقات مرتبطة.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                    }}
                                >
                                    {(teacher.students || []).length > 0 ? (
                                        <>
                                            {teacher
                                                .students!.slice(0, 3)
                                                .map((s) => (
                                                    <div
                                                        key={s.id}
                                                        style={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "center",
                                                            padding: "8px 12px",
                                                            background:
                                                                "#f8fafc",
                                                            borderRadius: 10,
                                                        }}
                                                    >
                                                        <div>
                                                            <div
                                                                style={{
                                                                    fontSize: 12,
                                                                    fontWeight: 700,
                                                                    color: "#1e293b",
                                                                }}
                                                            >
                                                                {s.name}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 11,
                                                                    color: "#94a3b8",
                                                                }}
                                                            >
                                                                {s.phone || "—"}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                onStudentClick(
                                                                    s,
                                                                )
                                                            }
                                                            style={btnS(
                                                                "#e1f5ee",
                                                                "#0f6e56",
                                                                "none",
                                                                {
                                                                    fontSize: 11,
                                                                    padding:
                                                                        "4px 10px",
                                                                },
                                                            )}
                                                        >
                                                            <FiEye size={11} />{" "}
                                                            فتح
                                                        </button>
                                                    </div>
                                                ))}
                                            {teacher.students!.length > 3 && (
                                                <button
                                                    onClick={() =>
                                                        onViewAllStudents(
                                                            teacher,
                                                        )
                                                    }
                                                    style={btnS(
                                                        "#0f6e56",
                                                        "#fff",
                                                        "none",
                                                        {
                                                            width: "100%",
                                                            justifyContent:
                                                                "center",
                                                        },
                                                    )}
                                                >
                                                    <FiUsers size={12} /> جميع
                                                    الطلاب (
                                                    {teacher.students!.length})
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#94a3b8",
                                            }}
                                        >
                                            لا يوجد طلبة.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
};

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
    padding: "8px 16px",
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
const iconBtn = (bg = "#f8fafc", color = "#475569"): React.CSSProperties => ({
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "6px 8px",
    background: bg,
    color,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "background .15s",
});
const selectS: React.CSSProperties = {
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "'Tajawal',sans-serif",
    background: "#f8fafc",
    color: "#1e293b",
    outline: "none",
};

/* ─── Hook ─── */
const useMyTeachers = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        total: 0,
        per_page: 8,
        last_page: 1,
    });
    const [stats, setStats] = useState<Stats>({
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0,
    });
    const [mosques, setMosques] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizeTeacher = (
        t: Teacher,
        amap: Map<number, AttendanceRecord>,
    ): Teacher => {
        const mock = MOCK_TEACHERS.find((m) => m.id === t.id);
        const att = amap.get(t.id);
        const merged = {
            ...mock,
            ...t,
            teacher: { ...mock?.teacher, ...t.teacher },
        };
        return {
            ...merged,
            circles_count: merged.circles_count ?? merged.circles?.length ?? 0,
            students_count:
                merged.students_count ?? merged.students?.length ?? 0,
            net_salary:
                merged.net_salary ??
                Math.max(0, (merged.salary ?? 0) - (merged.deduction ?? 0)),
            last_checkin: att?.checkin_time ?? merged.last_checkin ?? null,
            attendance_today: att?.status ?? merged.attendance_today ?? null,
            delay_minutes: att?.delay_minutes ?? merged.delay_minutes ?? 0,
        };
    };

    const fetchStats = async () => {
        try {
            const d = await apiFetch(
                "/api/v1/teachers/my-teachers?per_page=200",
            );
            const items: Teacher[] = d.data || [];
            setStats({
                total: items.length,
                active: items.filter((i) => i.status === "active").length,
                pending: items.filter((i) => i.status === "pending").length,
                suspended: items.filter(
                    (i) => i.status === "suspended" || i.status === "inactive",
                ).length,
            });
        } catch {
            setStats({
                total: MOCK_TEACHERS.length,
                active: MOCK_TEACHERS.filter((i) => i.status === "active")
                    .length,
                pending: MOCK_TEACHERS.filter((i) => i.status === "pending")
                    .length,
                suspended: MOCK_TEACHERS.filter((i) => i.status === "suspended")
                    .length,
            });
        }
    };

    const loadMosques = async () => {
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
                    new Set(MOCK_TEACHERS.map((t) => t.mosque).filter(Boolean)),
                ) as string[],
            );
        }
    };

    const fetchTeachers = async (
        page = 1,
        perPage = 8,
        search = "",
        status = "",
        mosque = "",
    ) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(page),
                per_page: String(perPage),
                search,
            });
            if (status) params.set("status", status);

            const [td, ad] = await Promise.all([
                apiFetch(`/api/v1/teachers/my-teachers?${params.toString()}`),
                fetch("/api/v1/attendance/staff-attendance?date_filter=today", {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                })
                    .then((r) => (r.ok ? r.json() : { data: [] }))
                    .catch(() => ({ data: [] })),
            ]);

            const amap = new Map<number, AttendanceRecord>();
            (ad.data || []).forEach((r: AttendanceRecord) => {
                if (r.teacher_id != null) amap.set(r.teacher_id, r);
            });

            const normalized = ((td.data || []) as Teacher[])
                .map((t) => normalizeTeacher(t, amap))
                .filter((t) => (mosque ? (t.mosque || "") === mosque : true));

            setTeachers(normalized);
            setPagination(
                td.pagination || {
                    current_page: page,
                    total: normalized.length,
                    per_page: perPage,
                    last_page: 1,
                },
            );
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "تعذر تحميل البيانات";
            setError(msg);
            let fb = [...MOCK_TEACHERS];
            if (search.trim()) {
                const q = search.trim().toLowerCase();
                fb = fb.filter(
                    (t) =>
                        t.name.toLowerCase().includes(q) ||
                        t.email.toLowerCase().includes(q),
                );
            }
            if (status) fb = fb.filter((t) => t.status === status);
            if (mosque) fb = fb.filter((t) => t.mosque === mosque);
            setTeachers(fb);
            setPagination({
                current_page: 1,
                total: fb.length,
                per_page: perPage,
                last_page: 1,
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (id: number) =>
        apiFetch(`/api/v1/teachers/my-teachers/${id}/toggle-status`, {
            method: "POST",
        });
    const deleteTeacher = (id: number) =>
        apiFetch(`/api/v1/teachers/my-teachers/${id}`, { method: "DELETE" });
    const updateTeacher = (id: number, payload: Record<string, unknown>) =>
        apiFetch(`/api/v1/teachers/my-teachers/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    const createTeacher = (payload: Record<string, unknown>) =>
        apiFetch(`/api/v1/teachers/my-teachers`, {
            method: "POST",
            body: JSON.stringify(payload),
        });

    useEffect(() => {
        loadMosques();
        fetchStats();
    }, []);

    return {
        teachers,
        pagination,
        stats,
        mosques,
        loading,
        error,
        fetchTeachers,
        fetchStats,
        toggleStatus,
        deleteTeacher,
        updateTeacher,
        createTeacher,
    };
};

/* ─── Main Component ─── */
const MyTeachersManagement: React.FC = () => {
    const [search, setSearch] = useState("");
    const [debSearch, setDebSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "active" | "suspended">(
        "all",
    );
    const [mosqueFilter, setMosqueFilter] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(8);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [confirmTeacher, setConfirmTeacher] = useState<Teacher | null>(null);
    const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        tone: "success" | "error";
    } | null>(null);
    const toastTimer = useRef<number | null>(null);

    const {
        teachers,
        pagination,
        stats,
        mosques,
        loading,
        error,
        fetchTeachers,
        fetchStats,
        toggleStatus,
        deleteTeacher,
        updateTeacher,
        createTeacher,
    } = useMyTeachers();

    useEffect(() => {
        const t = window.setTimeout(() => setDebSearch(search), 350);
        return () => window.clearTimeout(t);
    }, [search]);
    useEffect(() => {
        fetchTeachers(
            page,
            perPage,
            debSearch,
            activeTab === "all" ? "" : activeTab,
            mosqueFilter,
        );
    }, [page, perPage, debSearch, activeTab, mosqueFilter]);

    const showToast = (
        message: string,
        tone: "success" | "error" = "success",
    ) => {
        setToast({ message, tone });
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 3200);
    };

    const displayTeachers = useMemo(() => {
        if (activeTab === "active")
            return teachers.filter((t) => t.status === "active");
        if (activeTab === "suspended")
            return teachers.filter(
                (t) => t.status === "suspended" || t.status === "inactive",
            );
        return teachers;
    }, [teachers, activeTab]);

    const handleRefresh = async () => {
        await fetchTeachers(
            page,
            perPage,
            debSearch,
            activeTab === "all" ? "" : activeTab,
            mosqueFilter,
        );
        await fetchStats();
        showToast("تم تحديث البيانات");
    };

    const handleToggleStatus = async (t: Teacher) => {
        try {
            await toggleStatus(t.id);
            await handleRefresh();
        } catch {
            showToast("تعذر تحديث الحالة", "error");
        }
    };

    const handleDelete = async (t: Teacher) => {
        try {
            await deleteTeacher(t.id);
            setConfirmTeacher(null);
            await handleRefresh();
            showToast("تم تعليق حساب المعلم");
        } catch {
            showToast("تعذر تنفيذ العملية", "error");
        }
    };

    const handleSave = async (payload: Record<string, unknown>) => {
        if (!editTeacher) return;
        try {
            await updateTeacher(editTeacher.id, payload);
            await handleRefresh();
            showToast("تم حفظ التعديلات");
        } catch {
            showToast("تعذر حفظ التعديلات", "error");
            throw new Error("save_failed");
        }
    };

    const handleCreate = async (payload: Record<string, unknown>) => {
        try {
            await createTeacher(payload);
            await handleRefresh();
            showToast("تم إنشاء المعلم بنجاح");
        } catch {
            showToast("تعذر إنشاء المعلم", "error");
            throw new Error("create_failed");
        }
    };

    const pageRange = (): (number | "...")[] => {
        const tp = pagination.last_page || 1;
        if (tp <= 6) return Array.from({ length: tp }, (_, i) => i + 1);
        if (page <= 3) return [1, 2, 3, 4, "...", tp];
        if (page >= tp - 2) return [1, "...", tp - 3, tp - 2, tp - 1, tp];
        return [1, "...", page - 1, page, page + 1, "...", tp];
    };

    const STAT_CARDS = [
        {
            label: "إجمالي المعلمين",
            value: stats.total,
            icon: <FaChalkboardTeacher size={18} />,
            accent: "#1e293b",
            sub: "كل الأدوار",
        },
        {
            label: "المعلمون النشطون",
            value: stats.active,
            icon: <FiCheckCircle size={18} />,
            accent: "#16a34a",
            sub: "يعملون الآن",
        },
        {
            label: "الطلبات المعلقة",
            value: stats.pending,
            icon: <FiClock size={18} />,
            accent: "#f59e0b",
            sub: "بانتظار الاعتماد",
        },
        {
            label: "الموقوفون",
            value: stats.suspended,
            icon: <FiXCircle size={18} />,
            accent: "#dc2626",
            sub: "معلق أو غير نشط",
        },
    ];

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
                    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>
                        إدارة المعلمين
                    </h1>
                    <p
                        style={{
                            margin: "6px 0 16px",
                            color: "#94a3b8",
                            fontSize: 13,
                        }}
                    >
                        عرض شامل للمعلمين · الحلقات · الطلاب · الحضور · الرواتب
                    </p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                        <button
                            onClick={() => setShowCreate(true)}
                            style={btnS("#22c55e", "#fff")}
                        >
                            <FiPlus size={13} /> إضافة معلم
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
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
                        <div
                            style={{
                                color: s.accent,
                                fontSize: 18,
                                marginBottom: 6,
                            }}
                        >
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
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            {s.sub}
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
                            placeholder="ابحث باسم المعلم أو البريد..."
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

                    {/* Mosque filter */}
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
                            style={{
                                ...selectS,
                                border: "none",
                                background: "transparent",
                                padding: "9px 0",
                            }}
                        >
                            <option value="">كل المساجد</option>
                            {mosques.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Per page */}
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
                        <FiFilter size={13} color="#94a3b8" />
                        <select
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setPage(1);
                            }}
                            style={{
                                ...selectS,
                                border: "none",
                                background: "transparent",
                                padding: "9px 0",
                            }}
                        >
                            <option value={8}>8 / صفحة</option>
                            <option value={12}>12 / صفحة</option>
                            <option value={20}>20 / صفحة</option>
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
                        {(["all", "active", "suspended"] as const).map(
                            (tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setPage(1);
                                    }}
                                    style={{
                                        padding: "6px 14px",
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
                                            active: "النشطون",
                                            suspended: "الموقوفون",
                                        }[tab]
                                    }
                                </button>
                            ),
                        )}
                    </div>

                    {/* Reset */}
                    <button
                        onClick={() => {
                            setSearch("");
                            setDebSearch("");
                            setMosqueFilter("");
                            setActiveTab("all");
                            setPage(1);
                        }}
                        style={btnS("#f8fafc", "#64748b", "1px solid #e2e8f0")}
                    >
                        <FiX size={13} /> إعادة ضبط
                    </button>
                </div>
            </div>

            {/* ── Error banner ── */}
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
                    ⚠️ تعذر تحميل البيانات من الـ API — يُعرض بيانات بديلة
                    مؤقتًا.
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
                {/* Head */}
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
                            قائمة المعلمين
                        </h2>
                        <div
                            style={{
                                fontSize: 12,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            عرض {displayTeachers.length} معلم
                            {loading ? " — جاري التحديث..." : ""}
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                        الصفحة {pagination.current_page} من{" "}
                        {pagination.last_page || 1}
                    </div>
                </div>

                {/* Content */}
                {loading && displayTeachers.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#94a3b8",
                            fontSize: 16,
                        }}
                    >
                        ⏳ جارٍ تحميل البيانات...
                    </div>
                ) : displayTeachers.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#94a3b8",
                        }}
                    >
                        <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                            لا توجد نتائج مطابقة
                        </div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>
                            جرب تعديل الفلاتر
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            padding: 16,
                        }}
                    >
                        {displayTeachers.map((t, i) => (
                            <TeacherCard
                                key={t.id}
                                teacher={t}
                                index={i}
                                expanded={expandedIds.has(t.id)}
                                onToggleExpand={() =>
                                    setExpandedIds((prev) => {
                                        const s = new Set(prev);
                                        s.has(t.id)
                                            ? s.delete(t.id)
                                            : s.add(t.id);
                                        return s;
                                    })
                                }
                                onEdit={() => setEditTeacher(t)}
                                onToggleStatus={() => handleToggleStatus(t)}
                                onDelete={() => setConfirmTeacher(t)}
                                onStudentClick={(s) =>
                                    showToast(`الطالب: ${s.name}`)
                                }
                                onViewAllStudents={(tc) => {
                                    window.location.href = `/teachers/${tc.id}/students`;
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
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
                            الصفحة {pagination.current_page} من{" "}
                            {pagination.last_page} · {pagination.total} معلم
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
                                        onClick={() => setPage(p2 as number)}
                                        style={pgBtn(page === p2)}
                                    >
                                        {p2}
                                    </button>
                                ),
                            )}
                            <button
                                disabled={page >= (pagination.last_page || 1)}
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(
                                            pagination.last_page || 1,
                                            p + 1,
                                        ),
                                    )
                                }
                                style={pgBtn(
                                    false,
                                    page >= (pagination.last_page || 1),
                                )}
                            >
                                <FiChevronLeft size={13} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {confirmTeacher && (
                <ConfirmModal
                    message={`سيتم تعليق حساب "${confirmTeacher.name}". هل تريد المتابعة؟`}
                    onCancel={() => setConfirmTeacher(null)}
                    onConfirm={() => handleDelete(confirmTeacher)}
                />
            )}

            {editTeacher && (
                <TeacherFormModal
                    title="تعديل بيانات المعلم"
                    submitLabel="حفظ التعديلات"
                    mosques={mosques}
                    initialValues={{
                        name: editTeacher.name,
                        email: editTeacher.email,
                        phone: editTeacher.phone || "",
                        teacher_role: editTeacher.teacher?.role || "teacher",
                        notes: editTeacher.teacher?.notes || "",
                        mosque: editTeacher.mosque || "",
                    }}
                    onClose={() => setEditTeacher(null)}
                    onSubmit={handleSave}
                />
            )}

            {showCreate && (
                <TeacherFormModal
                    title="إضافة معلم جديد"
                    submitLabel="إنشاء المعلم"
                    mosques={mosques}
                    initialValues={{
                        name: "",
                        email: "",
                        phone: "",
                        teacher_role: "teacher",
                        notes: "",
                        mosque: "",
                    }}
                    onClose={() => setShowCreate(false)}
                    onSubmit={handleCreate}
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

export default MyTeachersManagement;
