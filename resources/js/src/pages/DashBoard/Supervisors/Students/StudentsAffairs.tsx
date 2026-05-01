import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    FiSearch,
    FiRefreshCw,
    FiX,
    FiEdit2,
    FiDownload,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiUsers,
    FiMail,
    FiPhone,
    FiStar,
    FiVideo,
    FiCalendar,
    FiBook,
    FiTrendingUp,
    FiAward,
    FiChevronDown,
    FiChevronUp,
    FiMessageSquare,
    FiPrinter,
    FiFilter,
    FiGrid,
    FiList,
} from "react-icons/fi";
import { FaMosque, FaQuran } from "react-icons/fa";
import * as XLSX from "xlsx";

// ── Types ──────────────────────────────────────────────────────────────────
interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    rate: number;
    avg_rating: number;
}
interface Achievement {
    total_points: number;
    added_points: number;
    deducted_points: number;
    history: any[];
}
interface BookingInfo {
    id: number;
    status: string;
    progress_status: string;
    start_mode: string;
    current_day: number;
    completed_days: number;
    total_days: number;
    started_at: string;
    plan_name: string;
    total_months: number;
    circle_name: string;
    mosque_name: string;
    teacher_name: string;
    schedule_time: string;
    jitsi_url: string | null;
    jitsi_room: string | null;
}
interface PlanDay {
    id: number;
    day_number: number;
    plan_day_number: number | null;
    new_memorization: string;
    review_memorization: string;
    status: string;
    session_time: string;
}
interface StudentDetail {
    id: number;
    id_number: string;
    grade_level: string;
    health_status: string;
    reading_level: string;
    session_time: string;
    notes: string;
    status: string;
    name: string;
    email: string;
    phone: string;
    birth_date: string;
    avatar: string;
    guardian_name: string;
    guardian_phone: string;
    guardian_email: string;
    booking: BookingInfo | null;
    attendance: AttendanceStats;
    achievements: Achievement;
    plan_progress: PlanDay[];
}
interface StudentRow {
    id: number;
    name: string;
    idNumber: string;
    circle: string;
    guardianName: string;
    guardianPhone: string;
    attendanceRate: string;
    balance: string;
    status: string;
    img: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function csrf(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") ?? ""
    );
}
function getPortalCenterId(): string | null {
    return (window as any).__PORTAL_CENTER_ID__
        ? String((window as any).__PORTAL_CENTER_ID__)
        : null;
}
function buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const h: Record<string, string> = {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...extra,
    };
    const c = getPortalCenterId();
    if (c) h["X-Center-Id"] = c;
    return h;
}
async function apiFetch(url: string, opts: RequestInit = {}) {
    const res = await fetch(url, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrf(),
            ...buildHeaders(),
            ...(opts.headers || {}),
        },
        ...opts,
    });
    if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || `HTTP ${res.status}`);
    }
    return res.json();
}

const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

// ── Sub Components ───────────────────────────────────────────────────────────
function Avatar({
    name,
    idx,
    size = 42,
    img,
}: {
    name: string;
    idx: number;
    size?: number;
    img?: string;
}) {
    const av = AV_COLORS[idx % AV_COLORS.length];
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
    if (img)
        return (
            <img
                src={img}
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                }}
            />
        );
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: av.bg,
                color: av.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: size * 0.3,
                fontWeight: 700,
                flexShrink: 0,
            }}
        >
            {initials}
        </div>
    );
}

function Badge({
    label,
    bg,
    color,
}: {
    label: string;
    bg: string;
    color: string;
}) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: bg,
                color,
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
            }}
        >
            {label}
        </span>
    );
}

function StatBox({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 14,
                padding: "16px 18px",
                boxShadow: "0 2px 10px #0001",
                borderTop: `3px solid ${color}`,
                display: "flex",
                flexDirection: "column",
                gap: 4,
            }}
        >
            <div style={{ color, fontSize: 18 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#1e293b" }}>
                {value}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>
                {label}
            </div>
        </div>
    );
}

function Toast({
    message,
    tone,
    onClose,
}: {
    message: string;
    tone: "success" | "error";
    onClose: () => void;
}) {
    return (
        <div
            style={{
                position: "fixed",
                bottom: 24,
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
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                }}
            >
                <FiX size={13} />
            </button>
        </div>
    );
}

// ── Student Detail Modal ─────────────────────────────────────────────────────
function StudentDetailModal({
    studentId,
    onClose,
}: {
    studentId: number;
    onClose: () => void;
}) {
    const [data, setData] = useState<StudentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<
        "info" | "plan" | "attendance" | "achievements"
    >("info");
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<Partial<StudentDetail>>({});

    useEffect(() => {
        apiFetch(`/api/v1/student-affairs/${studentId}`)
            .then((r) => {
                setData(r.data);
                setForm(r.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [studentId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiFetch(`/api/v1/student-affairs/${studentId}`, {
                method: "PUT",
                body: JSON.stringify(form),
            });
            setEditMode(false);
            const r = await apiFetch(`/api/v1/student-affairs/${studentId}`);
            setData(r.data);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const TABS = [
        { key: "info", label: "البيانات", icon: <FiUsers size={13} /> },
        { key: "plan", label: "الخطة", icon: <FiBook size={13} /> },
        { key: "attendance", label: "الحضور", icon: <FiCalendar size={13} /> },
        {
            key: "achievements",
            label: "الإنجازات",
            icon: <FiAward size={13} />,
        },
    ] as const;

    const STATUS_DAY: Record<string, { bg: string; color: string }> = {
        مكتمل: { bg: "#dcfce7", color: "#166534" },
        "قيد الانتظار": { bg: "#fef9c3", color: "#854d0e" },
        إعادة: { bg: "#fee2e2", color: "#991b1b" },
    };

    const PROGRESS_LABEL: Record<string, string> = {
        not_started: "لم يبدأ",
        in_progress: "جاري",
        completed: "مكتمل",
    };
    const MODE_LABEL: Record<string, string> = {
        normal: "من البداية",
        reverse: "معكوس",
        from_day: "من يوم معين",
        reverse_from_day: "معكوس من يوم",
    };

    const F = ({
        label,
        children,
    }: {
        label: string;
        children: React.ReactNode;
    }) => (
        <div style={{ marginBottom: 12 }}>
            <div
                style={{
                    fontSize: 10,
                    color: "#94a3b8",
                    marginBottom: 4,
                    fontWeight: 700,
                }}
            >
                {label}
            </div>
            {children}
        </div>
    );
    const Input = ({
        val,
        onChange,
    }: {
        val: string;
        onChange: (v: string) => void;
    }) => (
        <input
            value={val}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "7px 10px",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                background: "#f8fafc",
            }}
        />
    );
    const Sel = ({
        val,
        onChange,
        options,
    }: {
        val: string;
        onChange: (v: string) => void;
        options: [string, string][];
    }) => (
        <select
            value={val}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "7px 10px",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                background: "#f8fafc",
            }}
        >
            {options.map(([v, l]) => (
                <option key={v} value={v}>
                    {l}
                </option>
            ))}
        </select>
    );

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 5000,
                background: "rgba(0,0,0,.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 24,
                    width: "100%",
                    maxWidth: 780,
                    maxHeight: "92vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "'Tajawal',sans-serif",
                    direction: "rtl",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        flexShrink: 0,
                    }}
                >
                    {data && (
                        <Avatar
                            name={data.name}
                            idx={studentId % 6}
                            size={52}
                            img={data.avatar}
                        />
                    )}
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                color: "#86efac",
                                fontSize: 11,
                                marginBottom: 2,
                            }}
                        >
                            ملف الطالب
                        </div>
                        <div
                            style={{
                                color: "#fff",
                                fontWeight: 900,
                                fontSize: 18,
                            }}
                        >
                            {data?.name ?? "..."}
                        </div>
                        <div
                            style={{
                                color: "#94a3b8",
                                fontSize: 12,
                                marginTop: 2,
                                display: "flex",
                                gap: 12,
                                flexWrap: "wrap",
                            }}
                        >
                            {data?.id_number && (
                                <span>رقم الهوية: {data.id_number}</span>
                            )}
                            {data?.grade_level && (
                                <span>{data.grade_level}</span>
                            )}
                            {data?.booking?.circle_name && (
                                <span>
                                    <FaMosque
                                        size={11}
                                        style={{ marginLeft: 3 }}
                                    />
                                    {data.booking.circle_name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {data?.booking?.jitsi_url && (
                            <a
                                href={data.booking.jitsi_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background: "#2563eb",
                                    color: "#fff",
                                    borderRadius: 10,
                                    padding: "8px 14px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    textDecoration: "none",
                                }}
                            >
                                <FiVideo size={13} /> انضمام للحصة
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                background: "#ffffff22",
                                border: "none",
                                color: "#fff",
                                borderRadius: 10,
                                padding: "8px 12px",
                                cursor: "pointer",
                                display: "flex",
                            }}
                        >
                            <FiX size={16} />
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                {data && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4,1fr)",
                            gap: 0,
                            borderBottom: "1px solid #f1f5f9",
                            flexShrink: 0,
                        }}
                    >
                        {[
                            {
                                label: "الحضور",
                                value: `${data.attendance.rate}%`,
                                color: "#16a34a",
                            },
                            {
                                label: "الأيام المكتملة",
                                value: data.booking?.completed_days ?? 0,
                                color: "#0284c7",
                            },
                            {
                                label: "النقاط",
                                value: data.achievements.total_points,
                                color: "#9333ea",
                            },
                            {
                                label: "التقييم",
                                value: `${data.attendance.avg_rating}/5`,
                                color: "#f59e0b",
                            },
                        ].map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: "14px 16px",
                                    borderLeft:
                                        i < 3 ? "1px solid #f1f5f9" : "none",
                                    textAlign: "center",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 900,
                                        color: s.color,
                                    }}
                                >
                                    {s.value}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#64748b",
                                        marginTop: 2,
                                    }}
                                >
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div
                    style={{
                        display: "flex",
                        gap: 0,
                        borderBottom: "1px solid #f1f5f9",
                        flexShrink: 0,
                    }}
                >
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            style={{
                                flex: 1,
                                padding: "12px 8px",
                                border: "none",
                                background:
                                    activeTab === t.key ? "#fff" : "#f8fafc",
                                borderBottom:
                                    activeTab === t.key
                                        ? "2px solid #0f6e56"
                                        : "2px solid transparent",
                                color:
                                    activeTab === t.key ? "#0f6e56" : "#64748b",
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 5,
                                fontFamily: "inherit",
                            }}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                    {loading ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: 60,
                                color: "#94a3b8",
                            }}
                        >
                            <FiClock size={32} style={{ marginBottom: 10 }} />
                            <br />
                            جاري التحميل...
                        </div>
                    ) : !data ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: 60,
                                color: "#ef4444",
                            }}
                        >
                            خطأ في تحميل البيانات
                        </div>
                    ) : // ── Tab: Info ──────────────────────────────────────────────
                    activeTab === "info" ? (
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 900,
                                        fontSize: 15,
                                        color: "#1e293b",
                                    }}
                                >
                                    البيانات الشخصية
                                </div>
                                {editMode ? (
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            onClick={() => setEditMode(false)}
                                            style={{
                                                padding: "6px 14px",
                                                borderRadius: 8,
                                                border: "1px solid #e2e8f0",
                                                background: "#f8fafc",
                                                cursor: "pointer",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            style={{
                                                padding: "6px 14px",
                                                borderRadius: 8,
                                                border: "none",
                                                background: "#0f6e56",
                                                color: "#fff",
                                                cursor: "pointer",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            {saving
                                                ? "جاري الحفظ..."
                                                : "حفظ التغييرات"}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "6px 14px",
                                            borderRadius: 8,
                                            border: "1px solid #e2e8f0",
                                            background: "#f8fafc",
                                            cursor: "pointer",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            fontFamily: "inherit",
                                            color: "#475569",
                                        }}
                                    >
                                        <FiEdit2 size={12} /> تعديل
                                    </button>
                                )}
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 12,
                                }}
                            >
                                <F label="الاسم">
                                    {editMode ? (
                                        <Input
                                            val={form.name ?? ""}
                                            onChange={(v) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    name: v,
                                                }))
                                            }
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: "#1e293b",
                                            }}
                                        >
                                            {data.name}
                                        </div>
                                    )}
                                </F>
                                <F label="رقم الهوية">
                                    {editMode ? (
                                        <Input
                                            val={form.id_number ?? ""}
                                            onChange={(v) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    id_number: v,
                                                }))
                                            }
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "#1e293b",
                                            }}
                                        >
                                            {data.id_number}
                                        </div>
                                    )}
                                </F>
                                <F label="المرحلة الدراسية">
                                    {editMode ? (
                                        <Sel
                                            val={form.grade_level ?? ""}
                                            onChange={(v) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    grade_level: v,
                                                }))
                                            }
                                            options={[
                                                ["elementary", "ابتدائي"],
                                                ["middle", "متوسط"],
                                                ["high", "ثانوي"],
                                            ]}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "#1e293b",
                                            }}
                                        >
                                            {data.grade_level}
                                        </div>
                                    )}
                                </F>
                                <F label="الحالة الصحية">
                                    {editMode ? (
                                        <Sel
                                            val={form.health_status ?? ""}
                                            onChange={(v) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    health_status: v,
                                                }))
                                            }
                                            options={[
                                                ["healthy", "سليم"],
                                                [
                                                    "needs_attention",
                                                    "يحتاج متابعة",
                                                ],
                                                [
                                                    "special_needs",
                                                    "ذوي احتياجات",
                                                ],
                                            ]}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "#1e293b",
                                            }}
                                        >
                                            {data.health_status}
                                        </div>
                                    )}
                                </F>
                                <F label="البريد الإلكتروني">
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: "#0284c7",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 5,
                                        }}
                                    >
                                        <FiMail size={12} />
                                        {data.email || "—"}
                                    </div>
                                </F>
                                <F label="رقم الهاتف">
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: "#1e293b",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 5,
                                        }}
                                    >
                                        <FiPhone size={12} />
                                        {data.phone || "—"}
                                    </div>
                                </F>
                                <F label="ولي الأمر">
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "#1e293b",
                                        }}
                                    >
                                        {data.guardian_name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#64748b",
                                            marginTop: 2,
                                            display: "flex",
                                            gap: 12,
                                        }}
                                    >
                                        <span>
                                            <FiPhone
                                                size={11}
                                                style={{ marginLeft: 3 }}
                                            />
                                            {data.guardian_phone}
                                        </span>
                                        <span>
                                            <FiMail
                                                size={11}
                                                style={{ marginLeft: 3 }}
                                            />
                                            {data.guardian_email || "—"}
                                        </span>
                                    </div>
                                </F>
                                <F label="الحالة">
                                    {editMode ? (
                                        <Sel
                                            val={form.status ?? ""}
                                            onChange={(v) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    status: v,
                                                }))
                                            }
                                            options={[
                                                ["نشط", "نشط"],
                                                ["معلق", "معلق"],
                                                ["موقوف", "موقوف"],
                                            ]}
                                        />
                                    ) : (
                                        <Badge
                                            label={data.status}
                                            bg={
                                                data.status === "نشط"
                                                    ? "#dcfce7"
                                                    : "#fee2e2"
                                            }
                                            color={
                                                data.status === "نشط"
                                                    ? "#166534"
                                                    : "#991b1b"
                                            }
                                        />
                                    )}
                                </F>
                                <F label="مستوى القراءة">
                                    {editMode ? (
                                        <Input
                                            val={form.reading_level ?? ""}
                                            onChange={(v) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    reading_level: v,
                                                }))
                                            }
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "#1e293b",
                                            }}
                                        >
                                            {data.reading_level || "—"}
                                        </div>
                                    )}
                                </F>
                                <F label="وقت الجلسة">
                                    {editMode ? (
                                        <Sel
                                            val={form.session_time ?? ""}
                                            onChange={(v) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    session_time: v,
                                                }))
                                            }
                                            options={[
                                                ["", "—"],
                                                ["asr", "العصر"],
                                                ["maghrib", "المغرب"],
                                            ]}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "#1e293b",
                                            }}
                                        >
                                            {data.session_time === "asr"
                                                ? "العصر"
                                                : data.session_time ===
                                                    "maghrib"
                                                  ? "المغرب"
                                                  : "—"}
                                        </div>
                                    )}
                                </F>
                            </div>

                            <F label="ملاحظات">
                                {editMode ? (
                                    <textarea
                                        value={form.notes ?? ""}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                notes: e.target.value,
                                            }))
                                        }
                                        style={{
                                            width: "100%",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 8,
                                            padding: "7px 10px",
                                            fontSize: 13,
                                            fontFamily: "inherit",
                                            outline: "none",
                                            background: "#f8fafc",
                                            minHeight: 70,
                                            resize: "vertical",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: "#64748b",
                                            background: "#f8fafc",
                                            borderRadius: 8,
                                            padding: "10px 12px",
                                        }}
                                    >
                                        {data.notes || "لا توجد ملاحظات"}
                                    </div>
                                )}
                            </F>

                            {/* بيانات الحلقة والخطة */}
                            {data.booking && (
                                <div
                                    style={{
                                        marginTop: 16,
                                        background:
                                            "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                                        borderRadius: 14,
                                        padding: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 900,
                                            fontSize: 14,
                                            color: "#0f6e56",
                                            marginBottom: 12,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                        }}
                                    >
                                        <FaQuran size={14} /> بيانات الخطة
                                        والحلقة
                                    </div>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: 10,
                                        }}
                                    >
                                        {[
                                            {
                                                l: "الخطة",
                                                v: data.booking.plan_name,
                                            },
                                            {
                                                l: "مدة الخطة",
                                                v: `${data.booking.total_months} شهر`,
                                            },
                                            {
                                                l: "الحلقة",
                                                v: data.booking.circle_name,
                                            },
                                            {
                                                l: "المسجد",
                                                v: data.booking.mosque_name,
                                            },
                                            {
                                                l: "المعلم",
                                                v: data.booking.teacher_name,
                                            },
                                            {
                                                l: "وقت الحصة",
                                                v: data.booking.schedule_time,
                                            },
                                            {
                                                l: "طريقة البداية",
                                                v:
                                                    MODE_LABEL[
                                                        data.booking.start_mode
                                                    ] ??
                                                    data.booking.start_mode,
                                            },
                                            {
                                                l: "التقدم",
                                                v:
                                                    PROGRESS_LABEL[
                                                        data.booking
                                                            .progress_status
                                                    ] ??
                                                    data.booking
                                                        .progress_status,
                                            },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    background: "#fff",
                                                    borderRadius: 10,
                                                    padding: "10px 12px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: "#94a3b8",
                                                        marginBottom: 3,
                                                    }}
                                                >
                                                    {item.l}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        color: "#1e293b",
                                                    }}
                                                >
                                                    {item.v || "—"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ marginTop: 12 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                fontSize: 12,
                                                color: "#64748b",
                                                marginBottom: 5,
                                            }}
                                        >
                                            <span>تقدم الخطة</span>
                                            <span>
                                                {data.booking.completed_days} /{" "}
                                                {data.booking.total_days} يوم
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                background: "#d1fae5",
                                                borderRadius: 10,
                                                height: 10,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "100%",
                                                    background: "#0f6e56",
                                                    borderRadius: 10,
                                                    width: `${data.booking.total_days > 0 ? (data.booking.completed_days / data.booking.total_days) * 100 : 0}%`,
                                                    transition: "width .5s",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Jitsi Room */}
                                    {data.booking.jitsi_url && (
                                        <div
                                            style={{
                                                marginTop: 12,
                                                background: "#eff6ff",
                                                borderRadius: 12,
                                                padding: "12px 16px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: 13,
                                                        color: "#1e40af",
                                                    }}
                                                >
                                                    غرفة الحصة الافتراضية
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#64748b",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {data.booking.jitsi_room}
                                                </div>
                                            </div>
                                            <a
                                                href={data.booking.jitsi_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    background: "#2563eb",
                                                    color: "#fff",
                                                    borderRadius: 10,
                                                    padding: "8px 16px",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    textDecoration: "none",
                                                }}
                                            >
                                                <FiVideo size={13} /> انضمام
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : // ── Tab: Plan ──────────────────────────────────────────────
                    activeTab === "plan" ? (
                        <div>
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: 15,
                                    color: "#1e293b",
                                    marginBottom: 14,
                                }}
                            >
                                تفاصيل أيام الخطة
                            </div>
                            {data.plan_progress.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: 40,
                                        color: "#94a3b8",
                                    }}
                                >
                                    <FiBook
                                        size={32}
                                        style={{ marginBottom: 10 }}
                                    />
                                    <br />
                                    لا توجد تفاصيل خطة
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                    }}
                                >
                                    {data.plan_progress.map((day, i) => {
                                        const s = STATUS_DAY[day.status] ?? {
                                            bg: "#f1f5f9",
                                            color: "#475569",
                                        };
                                        return (
                                            <div
                                                key={day.id}
                                                style={{
                                                    background: "#f8fafc",
                                                    borderRadius: 12,
                                                    padding: "12px 14px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 12,
                                                    borderRight: `3px solid ${s.color}`,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: "50%",
                                                        background: s.bg,
                                                        color: s.color,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontWeight: 900,
                                                        fontSize: 13,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {i + 1}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: 8,
                                                            alignItems:
                                                                "center",
                                                            marginBottom: 3,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontWeight: 700,
                                                                fontSize: 13,
                                                                color: "#1e293b",
                                                            }}
                                                        >
                                                            يوم {day.day_number}
                                                        </span>
                                                        {day.plan_day_number &&
                                                            day.plan_day_number !==
                                                                day.day_number && (
                                                                <span
                                                                    style={{
                                                                        fontSize: 10,
                                                                        color: "#94a3b8",
                                                                    }}
                                                                >
                                                                    (أصله يوم{" "}
                                                                    {
                                                                        day.plan_day_number
                                                                    }
                                                                    )
                                                                </span>
                                                            )}
                                                        <Badge
                                                            label={day.status}
                                                            bg={s.bg}
                                                            color={s.color}
                                                        />
                                                    </div>
                                                    {day.new_memorization && (
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                color: "#0f6e56",
                                                            }}
                                                        >
                                                            حفظ:{" "}
                                                            {
                                                                day.new_memorization
                                                            }
                                                        </div>
                                                    )}
                                                    {day.review_memorization && (
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                color: "#0284c7",
                                                            }}
                                                        >
                                                            مراجعة:{" "}
                                                            {
                                                                day.review_memorization
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                {day.session_time && (
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#64748b",
                                                        }}
                                                    >
                                                        <FiClock
                                                            size={11}
                                                            style={{
                                                                marginLeft: 3,
                                                            }}
                                                        />
                                                        {day.session_time}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : // ── Tab: Attendance ────────────────────────────────────────
                    activeTab === "attendance" ? (
                        <div>
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: 15,
                                    color: "#1e293b",
                                    marginBottom: 14,
                                }}
                            >
                                إحصائيات الحضور
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3,1fr)",
                                    gap: 10,
                                    marginBottom: 16,
                                }}
                            >
                                <StatBox
                                    icon={<FiCheckCircle />}
                                    label="إجمالي الحضور"
                                    value={data.attendance.present}
                                    color="#16a34a"
                                />
                                <StatBox
                                    icon={<FiXCircle />}
                                    label="إجمالي الغياب"
                                    value={data.attendance.absent}
                                    color="#dc2626"
                                />
                                <StatBox
                                    icon={<FiTrendingUp />}
                                    label="نسبة الحضور"
                                    value={`${data.attendance.rate}%`}
                                    color="#0284c7"
                                />
                            </div>
                            <div
                                style={{
                                    background: "#f8fafc",
                                    borderRadius: 14,
                                    padding: 16,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 8,
                                        fontSize: 13,
                                        color: "#64748b",
                                    }}
                                >
                                    <span>نسبة الحضور الإجمالية</span>
                                    <span
                                        style={{
                                            fontWeight: 700,
                                            color: "#1e293b",
                                        }}
                                    >
                                        {data.attendance.rate}%
                                    </span>
                                </div>
                                <div
                                    style={{
                                        background: "#e2e8f0",
                                        borderRadius: 10,
                                        height: 12,
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "100%",
                                            borderRadius: 10,
                                            width: `${data.attendance.rate}%`,
                                            background:
                                                data.attendance.rate >= 80
                                                    ? "#16a34a"
                                                    : data.attendance.rate >= 60
                                                      ? "#f59e0b"
                                                      : "#dc2626",
                                            transition: "width .5s",
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        marginTop: 12,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        fontSize: 13,
                                        color: "#64748b",
                                    }}
                                >
                                    <FiStar
                                        size={13}
                                        style={{ color: "#f59e0b" }}
                                    />
                                    متوسط التقييم:{" "}
                                    <strong style={{ color: "#1e293b" }}>
                                        {data.attendance.avg_rating} / 5
                                    </strong>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // ── Tab: Achievements ──────────────────────────────────────
                        <div>
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: 15,
                                    color: "#1e293b",
                                    marginBottom: 14,
                                }}
                            >
                                الإنجازات والنقاط
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3,1fr)",
                                    gap: 10,
                                    marginBottom: 16,
                                }}
                            >
                                <StatBox
                                    icon={<FiAward />}
                                    label="صافي النقاط"
                                    value={data.achievements.total_points}
                                    color="#9333ea"
                                />
                                <StatBox
                                    icon={<FiCheckCircle />}
                                    label="نقاط مضافة"
                                    value={data.achievements.added_points}
                                    color="#16a34a"
                                />
                                <StatBox
                                    icon={<FiXCircle />}
                                    label="نقاط مخصومة"
                                    value={data.achievements.deducted_points}
                                    color="#dc2626"
                                />
                            </div>
                            {data.achievements.history.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: 40,
                                        color: "#94a3b8",
                                    }}
                                >
                                    <FiAward
                                        size={32}
                                        style={{ marginBottom: 10 }}
                                    />
                                    <br />
                                    لا توجد إنجازات بعد
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                    }}
                                >
                                    {data.achievements.history.map(
                                        (a: any, i: number) => (
                                            <div
                                                key={i}
                                                style={{
                                                    background: "#f8fafc",
                                                    borderRadius: 12,
                                                    padding: "10px 14px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 12,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: "50%",
                                                        background:
                                                            a.points_action ===
                                                            "added"
                                                                ? "#dcfce7"
                                                                : "#fee2e2",
                                                        color:
                                                            a.points_action ===
                                                            "added"
                                                                ? "#166534"
                                                                : "#991b1b",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontWeight: 900,
                                                        fontSize: 14,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {a.points_action === "added"
                                                        ? "+"
                                                        : "-"}
                                                    {a.points}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            color: "#1e293b",
                                                        }}
                                                    >
                                                        {a.reason ||
                                                            a.achievement_type ||
                                                            "نقاط"}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#94a3b8",
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        {
                                                            a.created_at?.split(
                                                                "T",
                                                            )[0]
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
const StudentAffairs: React.FC = () => {
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("الكل");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        tone: "success" | "error";
    } | null>(null);
    const toastTimer = useRef<number | null>(null);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeStudents: 0,
        pendingStudents: 0,
    });
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const showToast = useCallback(
        (message: string, tone: "success" | "error" = "success") => {
            setToast({ message, tone });
            if (toastTimer.current) clearTimeout(toastTimer.current);
            toastTimer.current = window.setTimeout(() => setToast(null), 3500);
        },
        [],
    );

    const fetchStudents = useCallback(
        async (p = 1) => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (p > 1) params.set("page", String(p));
                if (search) params.set("search", search);
                if (filterStatus !== "الكل") params.set("status", filterStatus);
                const r = await apiFetch(`/api/v1/student-affairs?${params}`);
                setStudents(r.data ?? []);
                setLastPage(r.last_page ?? 1);
                setTotal(r.total ?? 0);
                if (r.stats) setStats(r.stats);
                setPage(p);
            } catch (e: any) {
                showToast(e.message, "error");
            } finally {
                setLoading(false);
            }
        },
        [search, filterStatus, showToast],
    );

    useEffect(() => {
        fetchStudents(1);
    }, [search, filterStatus]);

    const handleWhatsApp = async (id: number, phone: string) => {
        try {
            const r = await apiFetch(`/api/v1/student-affairs/${id}/whatsapp`);
            window.open(r.whatsapp_url, "_blank");
        } catch {
            window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");
        }
    };

    const handleExport = () => {
        if (!students.length) return showToast("لا توجد بيانات", "error");
        const rows = students.map((s) => ({
            الاسم: s.name,
            "رقم الهوية": s.idNumber,
            الحلقة: s.circle,
            "ولي الأمر": s.guardianName,
            الجوال: s.guardianPhone,
            الحضور: s.attendanceRate,
            الحالة: s.status,
        }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(rows),
            "الطلاب",
        );
        XLSX.writeFile(
            wb,
            `الطلاب_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.xlsx`,
        );
        showToast(`تم تصدير ${students.length} طالب`);
    };

    const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
        نشط: { bg: "#dcfce7", color: "#166534" },
        معلق: { bg: "#fef9c3", color: "#854d0e" },
        "متأخر مالياً": { bg: "#fee2e2", color: "#991b1b" },
    };

    const TH: React.CSSProperties = {
        padding: "10px 14px",
        textAlign: "right",
        color: "#64748b",
        fontWeight: 700,
        fontSize: 12,
        borderBottom: "1px solid #f1f5f9",
        whiteSpace: "nowrap",
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
                padding: 20,
            }}
        >
            {/* Header */}
            <div
                style={{
                    background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                    borderRadius: 20,
                    padding: "24px 28px",
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
                        opacity: 0.05,
                        backgroundImage:
                            "radial-gradient(circle at 20% 50%,#fff 1px,transparent 1px)",
                        backgroundSize: "22px 22px",
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
                        منصة إتقان
                    </div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
                        شؤون الطلاب
                    </h1>
                    <p
                        style={{
                            margin: "4px 0 0",
                            color: "#94a3b8",
                            fontSize: 13,
                        }}
                    >
                        إدارة بيانات الطلاب — الخطط — الحلقات — الحضور —
                        الإنجازات
                    </p>
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                        <button
                            onClick={() => fetchStudents(page)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "7px 14px",
                                borderRadius: 10,
                                border: "1px solid #ffffff33",
                                background: "#ffffff22",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiRefreshCw size={12} /> تحديث
                        </button>
                        <button
                            onClick={handleExport}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "7px 14px",
                                borderRadius: 10,
                                border: "1px solid #ffffff33",
                                background: "#ffffff22",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiDownload size={12} /> تصدير Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                    gap: 12,
                    marginBottom: 20,
                }}
            >
                <StatBox
                    icon={<FiUsers />}
                    label="إجمالي الطلاب"
                    value={stats.totalStudents}
                    color="#1e293b"
                />
                <StatBox
                    icon={<FiCheckCircle />}
                    label="طلاب نشطين"
                    value={stats.activeStudents}
                    color="#16a34a"
                />
                <StatBox
                    icon={<FiClock />}
                    label="معلق"
                    value={stats.pendingStudents}
                    color="#f59e0b"
                />
                <StatBox
                    icon={<FiUsers />}
                    label="في هذه الصفحة"
                    value={students.length}
                    color="#0284c7"
                />
            </div>

            {/* Filter Bar */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 14,
                    boxShadow: "0 2px 10px #0001",
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
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
                        placeholder="ابحث بالاسم أو رقم الهوية..."
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
                        gap: 4,
                        background: "#f8fafc",
                        borderRadius: 10,
                        padding: 4,
                    }}
                >
                    {["الكل", "نشط", "معلق"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 700,
                                fontSize: 12,
                                fontFamily: "inherit",
                                background:
                                    filterStatus === s
                                        ? "#1e293b"
                                        : "transparent",
                                color: filterStatus === s ? "#fff" : "#64748b",
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
                عرض{" "}
                <strong style={{ color: "#1e293b" }}>{students.length}</strong>{" "}
                من أصل <strong style={{ color: "#1e293b" }}>{total}</strong>
            </div>

            {/* Table */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 2px 16px #0001",
                }}
            >
                {loading ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#94a3b8",
                        }}
                    >
                        <FiClock size={32} style={{ marginBottom: 10 }} />
                        <br />
                        جاري التحميل...
                    </div>
                ) : students.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#94a3b8",
                        }}
                    >
                        <FiUsers size={40} style={{ marginBottom: 10 }} />
                        <br />
                        <div style={{ fontWeight: 700 }}>لا توجد طلاب</div>
                    </div>
                ) : (
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
                                    <th style={TH}>الطالب</th>
                                    <th style={TH}>رقم الهوية</th>
                                    <th style={TH}>الحلقة</th>
                                    <th style={TH}>ولي الأمر</th>
                                    <th style={TH}>الحضور</th>
                                    <th style={TH}>الحالة</th>
                                    <th style={{ ...TH, cursor: "default" }}>
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, i) => {
                                    const sc = STATUS_COLOR[s.status] ?? {
                                        bg: "#f1f5f9",
                                        color: "#475569",
                                    };
                                    return (
                                        <tr
                                            key={s.id}
                                            style={{
                                                background:
                                                    i % 2 === 0
                                                        ? "#fff"
                                                        : "#fafafa",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => setSelectedId(s.id)}
                                        >
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 10,
                                                    }}
                                                >
                                                    <Avatar
                                                        name={s.name}
                                                        idx={i}
                                                        img={s.img}
                                                    />
                                                    <div>
                                                        <div
                                                            style={{
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
                                                            {s.attendanceRate}{" "}
                                                            حضور
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontFamily: "monospace",
                                                        fontSize: 12,
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {s.idNumber}
                                                </span>
                                            </td>
                                            <td
                                                style={{
                                                    ...TD,
                                                    fontSize: 12,
                                                    color: "#0f6e56",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {s.circle || "—"}
                                            </td>
                                            <td style={TD}>
                                                <div style={{ fontSize: 13 }}>
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {s.guardianName}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#0284c7",
                                                        }}
                                                    >
                                                        {s.guardianPhone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            background:
                                                                "#e2e8f0",
                                                            borderRadius: 10,
                                                            height: 6,
                                                            width: 60,
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                height: "100%",
                                                                background:
                                                                    "#16a34a",
                                                                borderRadius: 10,
                                                                width: s.attendanceRate,
                                                            }}
                                                        />
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: "#16a34a",
                                                        }}
                                                    >
                                                        {s.attendanceRate}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={TD}>
                                                <Badge
                                                    label={s.status}
                                                    bg={sc.bg}
                                                    color={sc.color}
                                                />
                                            </td>
                                            <td
                                                style={TD}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 5,
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            setSelectedId(s.id)
                                                        }
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            padding: "5px 10px",
                                                            borderRadius: 8,
                                                            border: "1px solid #e2e8f0",
                                                            background:
                                                                "#f8fafc",
                                                            cursor: "pointer",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                            color: "#475569",
                                                        }}
                                                    >
                                                        <FiEdit2 size={11} />{" "}
                                                        تفاصيل
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleWhatsApp(
                                                                s.id,
                                                                s.guardianPhone,
                                                            )
                                                        }
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            padding: "5px 10px",
                                                            borderRadius: 8,
                                                            border: "none",
                                                            background:
                                                                "#dcfce7",
                                                            cursor: "pointer",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                            color: "#166534",
                                                        }}
                                                    >
                                                        <FiMessageSquare
                                                            size={11}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 20px",
                            borderTop: "1px solid #f1f5f9",
                        }}
                    >
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                            الصفحة {page} من {lastPage}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button
                                disabled={page <= 1}
                                onClick={() => fetchStudents(page - 1)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    background: "#fff",
                                    cursor:
                                        page <= 1 ? "not-allowed" : "pointer",
                                    opacity: page <= 1 ? 0.4 : 1,
                                    fontFamily: "inherit",
                                    fontWeight: 700,
                                    fontSize: 12,
                                }}
                            >
                                السابق
                            </button>
                            <button
                                disabled={page >= lastPage}
                                onClick={() => fetchStudents(page + 1)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    background: "#fff",
                                    cursor:
                                        page >= lastPage
                                            ? "not-allowed"
                                            : "pointer",
                                    opacity: page >= lastPage ? 0.4 : 1,
                                    fontFamily: "inherit",
                                    fontWeight: 700,
                                    fontSize: 12,
                                }}
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedId && (
                <StudentDetailModal
                    studentId={selectedId}
                    onClose={() => setSelectedId(null)}
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

export default StudentAffairs;
