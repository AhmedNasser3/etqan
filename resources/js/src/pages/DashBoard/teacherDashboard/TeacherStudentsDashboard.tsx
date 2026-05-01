import { useState, useEffect, useCallback, useRef } from "react";

/* ══════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════ */
interface Student {
    id: number;
    name: string;
    phone: string | null;
    avatar: string | null;
    gender: string | null;
    grade_level: string | null;
    health_status: string | null;
    reading_level: string | null;
    notes: string | null;
}
interface Circle {
    id: number;
    name: string;
}
interface Plan {
    id: number;
    name: string;
    total_months: number;
}
interface Schedule {
    day_of_week: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    schedule_date: string;
}
interface Stats {
    total_sessions: number;
    present_count: number;
    absent_count: number;
    attendance_rate: number;
    avg_rating: number;
    completed_days: number;
    pending_days: number;
    retake_days: number;
    total_plan_days: number;
    progress_pct: number;
    current_day: number;
    total_days: number;
}
interface RecentSession {
    day_number: number;
    status: string;
    new_memorization: string | null;
    review_memorization: string | null;
    session_time: string | null;
    attendance: string;
    note: string | null;
    rating: number;
}
interface StudentRecord {
    booking_id: number;
    plan_id: number;
    booking_status: string;
    progress_status: string;
    started_at: string | null;
    completed_at: string | null;
    student: Student;
    circle: Circle;
    plan: Plan;
    schedule: Schedule;
    current_plan_day: {
        day_number: number;
        memorization: string | null;
        review: string | null;
    };
    stats: Stats;
    last_note: string | null;
    recent_sessions: RecentSession[];
    achievements: { total_points: number; total_records: number };
}
interface Summary {
    total_students: number;
    total_circles: number;
    avg_attendance: number;
    avg_progress: number;
}
interface FilterOption {
    id: number;
    name: string;
}

/* ══════════════════════════════════════════════
   ICONS  (pure SVG — no emoji)
══════════════════════════════════════════════ */
const Icon = {
    users: (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    circle: (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
        </svg>
    ),
    chart: (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    star: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    starO: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    check: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    clock: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    note: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    ),
    phone: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    ),
    book: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    calendar: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    refresh: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
    ),
    search: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    filter: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    ),
    trophy: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <polyline points="8 21 12 21 16 21" />
            <line x1="12" y1="17" x2="12" y2="21" />
            <path d="M7 4H17l-1 7a5 5 0 0 1-10 0L5 4z" />
            <path d="M5 9H3a2 2 0 0 0 2 2" />
            <path d="M19 9h2a2 2 0 0 1-2 2" />
        </svg>
    ),
    chevron: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    ),
    x: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    absent: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    health: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    ),
    progress: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
    mosque: (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        >
            <path d="M3 21h18" />
            <path d="M5 21V10l7-7 7 7v11" />
            <path d="M9 21v-6h6v6" />
            <path d="M12 3v4" />
            <path d="M8 10h8" />
        </svg>
    ),
};

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const DAY_AR: Record<string, string> = {
    sunday: "الأحد",
    monday: "الاثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
};
const HEALTH_AR: Record<string, { label: string; color: string }> = {
    healthy: { label: "سليم", color: "#16a34a" },
    needs_attention: { label: "يحتاج متابعة", color: "#d97706" },
    special_needs: { label: "احتياجات خاصة", color: "#7c3aed" },
};
const PROGRESS_AR: Record<string, { label: string; color: string }> = {
    not_started: { label: "لم يبدأ", color: "#6b7280" },
    in_progress: { label: "جارٍ", color: "#2563eb" },
    completed: { label: "مكتمل", color: "#16a34a" },
};
function formatTime(t: string) {
    try {
        return new Date(`2000-01-01T${t}`).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return t;
    }
}
function initials(name: string) {
    return name
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
}
const AVATAR_COLORS = [
    "#16a34a",
    "#0891b2",
    "#7c3aed",
    "#d97706",
    "#dc2626",
    "#9333ea",
    "#0284c7",
    "#059669",
];
function avatarColor(name: string) {
    return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

/* ── Progress Ring ── */
function Ring({
    pct,
    size = 52,
    stroke = 5,
    color = "#16a34a",
}: {
    pct: number;
    size?: number;
    stroke?: number;
    color?: string;
}) {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <svg
            width={size}
            height={size}
            style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={stroke}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset .8s ease" }}
            />
            <text
                x={size / 2}
                y={size / 2}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fill: color,
                    fontFamily: "inherit",
                    transform: "rotate(90deg)",
                    transformOrigin: `${size / 2}px ${size / 2}px`,
                }}
            >
                {pct}%
            </text>
        </svg>
    );
}

/* ── Stars display ── */
function Stars({ val }: { val: number }) {
    return (
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((n) => (
                <span
                    key={n}
                    style={{
                        color: n <= Math.round(val) ? "#f59e0b" : "#d1d5db",
                        display: "flex",
                    }}
                >
                    {n <= Math.round(val) ? Icon.star : Icon.starO}
                </span>
            ))}
            <span style={{ fontSize: 11, color: "#6b7280", marginRight: 3 }}>
                {val.toFixed(1)}
            </span>
        </div>
    );
}

/* ── Avatar ── */
function Avatar({ s }: { s: Student }) {
    const color = avatarColor(s.name);
    if (s.avatar)
        return (
            <img
                src={s.avatar}
                alt={s.name}
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${color}55`,
                    flexShrink: 0,
                }}
            />
        );
    return (
        <div
            style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: color + "18",
                border: `2px solid ${color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color,
                flexShrink: 0,
            }}
        >
            {initials(s.name)}
        </div>
    );
}

/* ── Mini stat pill ── */
function Pill({
    icon,
    label,
    val,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    val: string | number;
    color: string;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: color + "12",
                borderRadius: 8,
                padding: "5px 10px",
            }}
        >
            <span style={{ color, display: "flex" }}>{icon}</span>
            <div>
                <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1 }}>
                    {label}
                </div>
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color,
                        lineHeight: 1.4,
                    }}
                >
                    {val}
                </div>
            </div>
        </div>
    );
}

/* ── Expand Sessions Table ── */
function SessionsTable({ rows }: { rows: RecentSession[] }) {
    if (!rows.length)
        return (
            <p
                style={{
                    fontSize: 13,
                    color: "#9ca3af",
                    textAlign: "center",
                    padding: "12px 0",
                }}
            >
                لا توجد جلسات مسجلة
            </p>
        );
    return (
        <div style={{ overflowX: "auto" }}>
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                }}
            >
                <thead>
                    <tr style={{ background: "#f0fdf4" }}>
                        {[
                            "اليوم",
                            "الحالة",
                            "الحضور",
                            "الحفظ",
                            "المراجعة",
                            "التقييم",
                            "ملاحظة",
                        ].map((h) => (
                            <th
                                key={h}
                                style={{
                                    padding: "7px 10px",
                                    color: "#16a34a",
                                    fontWeight: 700,
                                    textAlign: "right",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr
                            key={i}
                            style={{
                                borderBottom: "1px solid #f0fdf4",
                                background: i % 2 === 0 ? "#fff" : "#fafff7",
                            }}
                        >
                            <td
                                style={{
                                    padding: "7px 10px",
                                    fontWeight: 700,
                                    color: "#374151",
                                }}
                            >
                                {r.day_number}
                            </td>
                            <td style={{ padding: "7px 10px" }}>
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        padding: "2px 8px",
                                        borderRadius: 99,
                                        background:
                                            r.status === "مكتمل"
                                                ? "#dcfce7"
                                                : r.status === "إعادة"
                                                  ? "#dbeafe"
                                                  : "#fef3c7",
                                        color:
                                            r.status === "مكتمل"
                                                ? "#15803d"
                                                : r.status === "إعادة"
                                                  ? "#1e40af"
                                                  : "#92400e",
                                    }}
                                >
                                    {r.status}
                                </span>
                            </td>
                            <td style={{ padding: "7px 10px" }}>
                                <span
                                    style={{
                                        color:
                                            r.attendance === "حاضر"
                                                ? "#16a34a"
                                                : "#dc2626",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 3,
                                    }}
                                >
                                    {r.attendance === "حاضر"
                                        ? Icon.check
                                        : Icon.absent}
                                    <span style={{ fontSize: 11 }}>
                                        {r.attendance}
                                    </span>
                                </span>
                            </td>
                            <td
                                style={{
                                    padding: "7px 10px",
                                    color: "#374151",
                                    maxWidth: 120,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {r.new_memorization || "—"}
                            </td>
                            <td
                                style={{
                                    padding: "7px 10px",
                                    color: "#374151",
                                    maxWidth: 120,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {r.review_memorization || "—"}
                            </td>
                            <td style={{ padding: "7px 10px" }}>
                                <div style={{ display: "flex", gap: 1 }}>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <span
                                            key={n}
                                            style={{
                                                color:
                                                    n <= r.rating
                                                        ? "#f59e0b"
                                                        : "#e5e7eb",
                                                fontSize: 12,
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td
                                style={{
                                    padding: "7px 10px",
                                    color: "#6b7280",
                                    maxWidth: 140,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {r.note || "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ══════════════════════════════════════════════
   STUDENT CARD
══════════════════════════════════════════════ */
function StudentCard({ rec }: { rec: StudentRecord }) {
    const [open, setOpen] = useState(false);
    const s = rec.student;
    const st = rec.stats;
    const color = avatarColor(s.name);
    const health = HEALTH_AR[s.health_status ?? ""] ?? null;
    const prog = PROGRESS_AR[rec.progress_status] ?? PROGRESS_AR.not_started;

    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #bbf7d0",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: open ? "0 8px 32px #16a34a14" : "0 2px 12px #0001",
                transition: "box-shadow .3s, transform .2s",
            }}
            onMouseEnter={(e) => {
                if (!open)
                    (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
            }}
        >
            {/* ── Top bar ── */}
            <div
                style={{
                    height: 4,
                    background: `linear-gradient(90deg, ${color}, #16a34a)`,
                }}
            />

            {/* ── Main row ── */}
            <div
                style={{
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                {/* avatar + name */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flex: 1,
                        minWidth: 180,
                    }}
                >
                    <Avatar s={s} />
                    <div>
                        <div
                            style={{
                                fontSize: 15,
                                fontWeight: 800,
                                color: "#111827",
                            }}
                        >
                            {s.name}
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#9ca3af",
                                marginTop: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <span style={{ display: "flex" }}>
                                {Icon.circle}
                            </span>
                            {rec.circle.name} · {rec.plan.name}
                        </div>
                        {s.phone && (
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#6b7280",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                    marginTop: 2,
                                }}
                            >
                                <span style={{ display: "flex" }}>
                                    {Icon.phone}
                                </span>{" "}
                                {s.phone}
                            </div>
                        )}
                    </div>
                </div>

                {/* ring + attendance */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ textAlign: "center" }}>
                        <Ring pct={st.progress_pct} color={color} />
                        <div
                            style={{
                                fontSize: 10,
                                color: "#6b7280",
                                marginTop: 3,
                            }}
                        >
                            التقدم
                        </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <Ring
                            pct={st.attendance_rate}
                            color={
                                st.attendance_rate >= 80
                                    ? "#16a34a"
                                    : st.attendance_rate >= 60
                                      ? "#d97706"
                                      : "#dc2626"
                            }
                        />
                        <div
                            style={{
                                fontSize: 10,
                                color: "#6b7280",
                                marginTop: 3,
                            }}
                        >
                            الحضور
                        </div>
                    </div>
                </div>

                {/* pills */}
                <div
                    style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    <Pill
                        icon={Icon.check}
                        label="حاضر"
                        val={st.present_count}
                        color="#16a34a"
                    />
                    <Pill
                        icon={Icon.absent}
                        label="غائب"
                        val={st.absent_count}
                        color="#dc2626"
                    />
                    <Pill
                        icon={Icon.chart}
                        label="أيام منجزة"
                        val={`${st.completed_days}/${st.total_plan_days}`}
                        color="#2563eb"
                    />
                </div>

                {/* rating */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        alignItems: "flex-end",
                    }}
                >
                    <Stars val={st.avg_rating} />
                    {rec.achievements.total_points > 0 && (
                        <div
                            style={{
                                fontSize: 11,
                                color: "#d97706",
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                            }}
                        >
                            <span style={{ display: "flex" }}>
                                {Icon.trophy}
                            </span>
                            {rec.achievements.total_points} نقطة
                        </div>
                    )}
                    <span
                        style={{
                            fontSize: 11,
                            padding: "2px 9px",
                            borderRadius: 99,
                            fontWeight: 700,
                            background: prog.color + "18",
                            color: prog.color,
                        }}
                    >
                        {prog.label}
                    </span>
                </div>

                {/* expand btn */}
                <button
                    onClick={() => setOpen((o) => !o)}
                    style={{
                        background: open ? "#f0fdf4" : "transparent",
                        border: "1.5px solid #bbf7d0",
                        borderRadius: 10,
                        padding: "6px 12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#16a34a",
                        transition: "all .2s",
                    }}
                >
                    <span
                        style={{
                            display: "flex",
                            transform: open ? "rotate(180deg)" : "rotate(0)",
                            transition: "transform .3s",
                        }}
                    >
                        {Icon.chevron}
                    </span>
                    {open ? "إخفاء" : "التفاصيل"}
                </button>
            </div>

            {/* ── Expanded details ── */}
            {open && (
                <div
                    style={{
                        borderTop: "1px solid #f0fdf4",
                        background: "#fafff7",
                        animation: "sd-expand .3s ease",
                    }}
                >
                    {/* info strip */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(170px, 1fr))",
                            gap: 8,
                            padding: "14px 16px 10px",
                        }}
                    >
                        {[
                            {
                                icon: Icon.calendar,
                                label: "الجدول",
                                val: `${DAY_AR[rec.schedule.day_of_week] ?? rec.schedule.day_of_week} ${formatTime(rec.schedule.start_time)} — ${formatTime(rec.schedule.end_time)}`,
                            },
                            {
                                icon: Icon.book,
                                label: "حفظ اليوم",
                                val: rec.current_plan_day.memorization ?? "—",
                            },
                            {
                                icon: Icon.book,
                                label: "مراجعة اليوم",
                                val: rec.current_plan_day.review ?? "—",
                            },
                            {
                                icon: Icon.progress,
                                label: "اليوم الحالي",
                                val: `${rec.stats.current_day} / ${rec.stats.total_days}`,
                            },
                            {
                                icon: Icon.clock,
                                label: "مدة الحصة",
                                val: `${rec.schedule.duration_minutes} دقيقة`,
                            },
                            ...(s.grade_level
                                ? [
                                      {
                                          icon: Icon.book,
                                          label: "الصف",
                                          val: s.grade_level,
                                      },
                                  ]
                                : []),
                            ...(health
                                ? [
                                      {
                                          icon: Icon.health,
                                          label: "الصحة",
                                          val: health.label,
                                      },
                                  ]
                                : []),
                            ...(s.notes
                                ? [
                                      {
                                          icon: Icon.note,
                                          label: "ملاحظات",
                                          val: s.notes,
                                      },
                                  ]
                                : []),
                        ].map((item, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "#fff",
                                    borderRadius: 10,
                                    border: "1px solid #dcfce7",
                                    padding: "10px 12px",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 7,
                                }}
                            >
                                <span
                                    style={{
                                        color: "#16a34a",
                                        display: "flex",
                                        marginTop: 1,
                                    }}
                                >
                                    {item.icon}
                                </span>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#9ca3af",
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "#1f2937",
                                        }}
                                    >
                                        {item.val}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* last note */}
                    {rec.last_note && (
                        <div
                            style={{
                                margin: "0 16px 10px",
                                background: "#fefce8",
                                border: "1px solid #fef08a",
                                borderRadius: 10,
                                padding: "10px 12px",
                                fontSize: 13,
                                color: "#713f12",
                                display: "flex",
                                gap: 7,
                                alignItems: "flex-start",
                            }}
                        >
                            <span
                                style={{
                                    display: "flex",
                                    marginTop: 1,
                                    color: "#d97706",
                                }}
                            >
                                {Icon.note}
                            </span>
                            <div>
                                <span style={{ fontWeight: 700 }}>
                                    آخر ملاحظة:{" "}
                                </span>
                                {rec.last_note}
                            </div>
                        </div>
                    )}

                    {/* recent sessions */}
                    <div style={{ padding: "0 16px 16px" }}>
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#16a34a",
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                            }}
                        >
                            <span style={{ display: "flex" }}>
                                {Icon.chart}
                            </span>{" "}
                            آخر الجلسات
                        </div>
                        <SessionsTable rows={rec.recent_sessions} />
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════ */
const TeacherStudentsDashboard: React.FC = () => {
    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [circleId, setCircleId] = useState("");
    const [planId, setPlanId] = useState("");
    const [circles, setCircles] = useState<FilterOption[]>([]);
    const [plans, setPlans] = useState<FilterOption[]>([]);
    const [toast, setToast] = useState<{
        text: string;
        kind: "ok" | "err";
    } | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout>>();

    const showToast = (text: string, kind: "ok" | "err" = "ok") => {
        setToast({ text, kind });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3500);
    };

    const fetchFilters = useCallback(async () => {
        try {
            const res = await fetch("/api/v1/teachers/my-students/filters", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            const d = await res.json();
            if (d.success) {
                setCircles(d.circles);
                setPlans(d.plans);
            }
        } catch {}
    }, []);

    const fetchStudents = useCallback(
        async (pg = 1) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: String(pg),
                    per_page: "15",
                });
                if (search) params.set("search", search);
                if (circleId) params.set("circle_id", circleId);
                if (planId) params.set("plan_id", planId);

                const res = await fetch(
                    `/api/v1/teachers/my-students?${params}`,
                    {
                        credentials: "include",
                        headers: { Accept: "application/json" },
                    },
                );
                const d = await res.json();
                if (d.success) {
                    setRecords(d.students);
                    setSummary(d.summary);
                    setPage(d.meta.current_page);
                    setLastPage(d.meta.last_page);
                    setTotal(d.meta.total);
                    showToast(`${d.meta.total} طالب`);
                } else showToast(d.message || "خطأ في جلب البيانات", "err");
            } catch {
                showToast("خطأ في الاتصال", "err");
            } finally {
                setLoading(false);
            }
        },
        [search, circleId, planId],
    );

    useEffect(() => {
        fetchFilters();
    }, [fetchFilters]);
    useEffect(() => {
        fetchStudents(1);
    }, [fetchStudents]);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        @keyframes sd-fadein{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sd-expand{from{opacity:0;max-height:0}to{opacity:1;max-height:2000px}}
        @keyframes sd-spin{to{transform:rotate(360deg)}}
        @keyframes sd-toast{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
        @keyframes sd-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes sd-pulse{0%,100%{opacity:1}50%{opacity:.4}}

        .sd-wrap{
          direction:rtl;font-family:'Tajawal',sans-serif;
          min-height:100vh;padding:20px 16px;
        }
        .sd-inner{margin:0 auto;display:flex;flex-direction:column;gap:16px}

        /* header */
        .sd-hdr{
          background:linear-gradient(135deg,#16a34a 0%,#15803d 50%,#166534 100%);
          border-radius:18px;padding:22px 24px;
          position:relative;overflow:hidden;
          box-shadow:0 4px 24px #16a34a33;
        }
        .sd-hdr::before{
          content:'';position:absolute;inset:0;
          background: radial-gradient(circle at 80% 20%, #ffffff0a 0%, transparent 60%);
        }
        .sd-hdr-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
        .sd-brand{display:flex;align-items:center;gap:10px}
        .sd-brand-ico{
          width:44px;height:44px;background:#ffffff22;border-radius:12px;
          display:flex;align-items:center;justify-content:center;color:#fff;
        }
        .sd-brand-txt{font-size:20px;font-weight:800;color:#fff}
        .sd-brand-sub{font-size:12px;color:#86efac;margin-top:1px}
        .sd-hdr-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .sd-btn-ref{
          background:#ffffff22;border:1px solid #ffffff33;border-radius:10px;
          padding:8px 14px;font-size:13px;font-weight:700;color:#fff;cursor:pointer;
          font-family:'Tajawal',sans-serif;transition:all .2s;
          display:flex;align-items:center;gap:6px;
        }
        .sd-btn-ref:hover{background:#ffffff33;transform:scale(1.03)}
        .sd-btn-ref:disabled{opacity:.5;cursor:not-allowed}
        .sd-spinner-ico{animation:sd-spin .7s linear infinite;display:flex}

        /* summary cards */
        .sd-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}
        .sd-scard{
          background:#ffffff33;backdrop-filter:blur(4px);
          border:1px solid #ffffff33;border-radius:12px;padding:12px 14px;
        }
        .sd-scard-lbl{font-size:11px;color:#86efac;font-weight:600}
        .sd-scard-val{font-size:22px;font-weight:800;color:#fff;line-height:1.1}

        /* filters */
        .sd-filters{
          background:#fff;border-radius:14px;border:1px solid #bbf7d0;
          padding:14px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
          box-shadow:0 2px 10px #16a34a10;
        }
        .sd-filter-ico{color:#16a34a;display:flex}
        .sd-search-wrap{position:relative;flex:1;min-width:160px}
        .sd-search-ico{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:#9ca3af;display:flex}
        .sd-search{
          width:100%;padding:9px 36px 9px 12px;border-radius:10px;
          border:1.5px solid #bbf7d0;font-family:'Tajawal',sans-serif;
          font-size:13px;outline:none;color:#374151;transition:border-color .2s;
        }
        .sd-search:focus{border-color:#16a34a;box-shadow:0 0 0 3px #16a34a15}
        .sd-search::placeholder{color:#d1d5db}
        .sd-select{
          padding:9px 12px;border-radius:10px;border:1.5px solid #bbf7d0;
          font-family:'Tajawal',sans-serif;font-size:13px;color:#374151;
          outline:none;cursor:pointer;background:#fff;transition:border-color .2s;
        }
        .sd-select:focus{border-color:#16a34a;box-shadow:0 0 0 3px #16a34a15}
        .sd-clear{
          background:#fee2e2;border:none;border-radius:8px;padding:8px 12px;
          color:#dc2626;font-size:12px;font-weight:700;cursor:pointer;
          font-family:'Tajawal',sans-serif;display:flex;align-items:center;gap:4px;
          transition:background .2s;
        }
        .sd-clear:hover{background:#fecaca}

        /* skeleton */
        .sd-skel{
          height:90px;border-radius:14px;
          background:linear-gradient(90deg,#f0fdf4 25%,#dcfce7 50%,#f0fdf4 75%);
          background-size:400% 100%;animation:sd-shimmer 1.4s infinite;
        }

        /* loading overlay */
        .sd-loading{display:flex;justify-content:center;padding:40px;animation:sd-pulse 1.5s infinite}

        /* list */
        .sd-list{display:flex;flex-direction:column;gap:12px;animation:sd-fadein .4s ease}

        /* empty */
        .sd-empty{text-align:center;padding:48px;color:#9ca3af;background:#fff;border-radius:16px;border:1px solid #bbf7d0}
        .sd-empty-ico{color:#bbf7d0;display:flex;justify-content:center;margin-bottom:10px}

        /* pagination */
        .sd-pages{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
        .sd-page-btn{
          padding:7px 14px;border-radius:9px;border:1.5px solid #bbf7d0;
          background:#fff;color:#16a34a;font-weight:700;font-size:13px;
          cursor:pointer;font-family:'Tajawal',sans-serif;transition:all .2s;
        }
        .sd-page-btn:hover:not(:disabled){background:#f0fdf4;border-color:#16a34a}
        .sd-page-btn:disabled{opacity:.4;cursor:not-allowed}
        .sd-page-btn--active{background:#16a34a;color:#fff;border-color:#16a34a}
        .sd-page-info{font-size:13px;color:#6b7280;padding:0 4px}

        /* toast */
        .sd-toast{
          position:fixed;bottom:22px;left:22px;z-index:9999;
          padding:11px 16px;border-radius:12px;font-size:13px;font-weight:700;
          font-family:'Tajawal',sans-serif;animation:sd-toast .3s ease;
          box-shadow:0 4px 20px #0002;display:flex;align-items:center;gap:7px;
        }
        .sd-toast--ok{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}
        .sd-toast--err{background:#fff1f2;color:#be123c;border:1px solid #fecdd3}

        @media(max-width:640px){
          .sd-summary{grid-template-columns:1fr 1fr}
          .sd-hdr{padding:16px}
          .sd-filters{flex-direction:column;align-items:stretch}
          .sd-search-wrap{min-width:unset}
        }
      `}</style>

            {/* Toast */}
            {toast && (
                <div className={`sd-toast sd-toast--${toast.kind}`}>
                    {toast.kind === "ok" ? (
                        <span style={{ display: "flex" }}>{Icon.check}</span>
                    ) : (
                        <span style={{ display: "flex" }}>{Icon.x}</span>
                    )}
                    {toast.text}
                </div>
            )}

            <div className="sd-wrap">
                <div className="sd-inner">
                    {/* ══ Header ══ */}
                    <div className="sd-hdr">
                        <div className="sd-hdr-top">
                            <div className="sd-brand">
                                <div className="sd-brand-ico">
                                    {Icon.mosque}
                                </div>
                                <div>
                                    <div className="sd-brand-txt">طلابي</div>
                                    <div className="sd-brand-sub">
                                        لوحة متابعة المعلم
                                    </div>
                                </div>
                            </div>
                            <div className="sd-hdr-actions">
                                <button
                                    className="sd-btn-ref"
                                    onClick={() => fetchStudents(page)}
                                    disabled={loading}
                                >
                                    <span
                                        className={
                                            loading ? "sd-spinner-ico" : ""
                                        }
                                        style={{ display: "flex" }}
                                    >
                                        {Icon.refresh}
                                    </span>
                                    {loading ? "جارٍ التحميل..." : "تحديث"}
                                </button>
                            </div>
                        </div>

                        {/* summary */}
                        {summary && (
                            <div className="sd-summary">
                                <div className="sd-scard">
                                    <div className="sd-scard-lbl">
                                        إجمالي الطلاب
                                    </div>
                                    <div className="sd-scard-val">{total}</div>
                                </div>
                                <div className="sd-scard">
                                    <div className="sd-scard-lbl">
                                        عدد الحلقات
                                    </div>
                                    <div className="sd-scard-val">
                                        {summary.total_circles}
                                    </div>
                                </div>
                                <div className="sd-scard">
                                    <div className="sd-scard-lbl">
                                        متوسط الحضور
                                    </div>
                                    <div className="sd-scard-val">
                                        {summary.avg_attendance?.toFixed(0) ??
                                            0}
                                        %
                                    </div>
                                </div>
                                <div className="sd-scard">
                                    <div className="sd-scard-lbl">
                                        متوسط التقدم
                                    </div>
                                    <div className="sd-scard-val">
                                        {summary.avg_progress?.toFixed(0) ?? 0}%
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ══ Filters ══ */}
                    <div className="sd-filters">
                        <span className="sd-filter-ico">{Icon.filter}</span>
                        <div className="sd-search-wrap">
                            <span className="sd-search-ico">{Icon.search}</span>
                            <input
                                className="sd-search"
                                type="search"
                                placeholder="بحث بالاسم أو الهاتف..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="sd-select"
                            value={circleId}
                            onChange={(e) => setCircleId(e.target.value)}
                        >
                            <option value="">كل الحلقات</option>
                            {circles.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="sd-select"
                            value={planId}
                            onChange={(e) => setPlanId(e.target.value)}
                        >
                            <option value="">كل الخطط</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        {(search || circleId || planId) && (
                            <button
                                className="sd-clear"
                                onClick={() => {
                                    setSearch("");
                                    setCircleId("");
                                    setPlanId("");
                                }}
                            >
                                <span style={{ display: "flex" }}>
                                    {Icon.x}
                                </span>{" "}
                                مسح
                            </button>
                        )}
                    </div>

                    {/* ══ List ══ */}
                    {loading ? (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                            }}
                        >
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="sd-skel" />
                            ))}
                        </div>
                    ) : records.length === 0 ? (
                        <div className="sd-empty">
                            <div className="sd-empty-ico">
                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                            </div>
                            <div
                                style={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: "#374151",
                                }}
                            >
                                لا يوجد طلاب
                            </div>
                            <div style={{ fontSize: 13, marginTop: 4 }}>
                                {search || circleId || planId
                                    ? "جرب تغيير الفلاتر"
                                    : "لا توجد بيانات حالياً"}
                            </div>
                        </div>
                    ) : (
                        <div className="sd-list">
                            {records.map((r) => (
                                <StudentCard key={r.booking_id} rec={r} />
                            ))}
                        </div>
                    )}

                    {/* ══ Pagination ══ */}
                    {lastPage > 1 && !loading && (
                        <div className="sd-pages">
                            <button
                                className="sd-page-btn"
                                disabled={page <= 1}
                                onClick={() => fetchStudents(page - 1)}
                            >
                                السابق
                            </button>
                            {Array.from(
                                { length: Math.min(lastPage, 7) },
                                (_, i) => {
                                    const n = page <= 4 ? i + 1 : page - 3 + i;
                                    if (n < 1 || n > lastPage) return null;
                                    return (
                                        <button
                                            key={n}
                                            className={`sd-page-btn${n === page ? " sd-page-btn--active" : ""}`}
                                            onClick={() => fetchStudents(n)}
                                        >
                                            {n}
                                        </button>
                                    );
                                },
                            )}
                            <button
                                className="sd-page-btn"
                                disabled={page >= lastPage}
                                onClick={() => fetchStudents(page + 1)}
                            >
                                التالي
                            </button>
                            <span className="sd-page-info">({total} طالب)</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TeacherStudentsDashboard;
