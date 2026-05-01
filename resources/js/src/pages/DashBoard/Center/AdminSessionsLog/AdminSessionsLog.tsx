// components/AdminSessionsLog.tsx
import React, { useEffect, useState, useCallback } from "react";

interface SessionLog {
    id: number;
    teacher_name: string;
    schedule_id: number;
    circle_name: string | null;
    joined_at: string;
    left_at: string | null;
    duration_minutes: number | null;
    session_date: string;
}

const AdminSessionsLog: React.FC = () => {
    const [logs, setLogs] = useState<SessionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState("today");

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `/api/v1/sessions/log/admin?date_filter=${dateFilter}`,
                {
                    credentials: "include",
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                },
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setLogs(data.logs || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "خطأ في التحميل");
        } finally {
            setLoading(false);
        }
    }, [dateFilter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const fmtTime = (iso: string | null) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const fmtDuration = (mins: number | null) => {
        if (!mins) return "—";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}س ${m}د` : `${m} دقيقة`;
    };

    const fmtDate = (iso: string) =>
        new Date(iso).toLocaleDateString("ar-EG", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const totalMinutes = logs.reduce(
        (s, l) => s + (l.duration_minutes || 0),
        0,
    );
    const completedLogs = logs.filter((l) => l.duration_minutes);
    const avgMinutes = completedLogs.length
        ? Math.round(totalMinutes / completedLogs.length)
        : 0;

    return (
        <div className="content" id="contentArea">
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
                .shimmer-cell {
                    height: 13px;
                    border-radius: 6px;
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.4s infinite;
                }
            `}</style>

            <div className="widget">
                {/* ── Header ── */}
                <div className="wh">
                    <div className="wh-l">📋 سجل حضور المعلمين · الحلقات</div>
                    <div className="flx" style={{ gap: 8 }}>
                        <select
                            className="fi"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="today">اليوم</option>
                            <option value="yesterday">أمس</option>
                            <option value="week">هذا الأسبوع</option>
                            <option value="month">هذا الشهر</option>
                        </select>
                        <button className="btn bp bsm" onClick={fetchLogs}>
                            🔄 تحديث
                        </button>
                    </div>
                </div>

                {/* ── Stats Cards ── */}
                {!loading && logs.length > 0 && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(150px, 1fr))",
                            gap: 12,
                            padding: "16px 24px",
                        }}
                    >
                        {[
                            {
                                label: "إجمالي الجلسات",
                                value: logs.length,
                                icon: "📊",
                                color: "#6366f1",
                                bg: "#eef2ff",
                                border: "#c7d2fe",
                            },
                            {
                                label: "إجمالي الوقت",
                                value: fmtDuration(totalMinutes),
                                icon: "⏱️",
                                color: "#0891b2",
                                bg: "#e0f2fe",
                                border: "#bae6fd",
                            },
                            {
                                label: "متوسط المدة",
                                value: fmtDuration(avgMinutes),
                                icon: "📈",
                                color: "#16a34a",
                                bg: "#dcfce7",
                                border: "#bbf7d0",
                            },
                            {
                                label: "جلسات جارية",
                                value: logs.filter((l) => !l.left_at).length,
                                icon: "🟢",
                                color: "#d97706",
                                bg: "#fef3c7",
                                border: "#fde68a",
                            },
                        ].map(({ label, value, icon, color, bg, border }) => (
                            <div
                                key={label}
                                style={{
                                    background: bg,
                                    border: `1px solid ${border}`,
                                    borderRadius: 14,
                                    padding: "14px 16px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "1.4rem",
                                        marginBottom: 6,
                                    }}
                                >
                                    {icon}
                                </div>
                                <div
                                    style={{
                                        fontSize: "1.25rem",
                                        fontWeight: 800,
                                        color,
                                    }}
                                >
                                    {value}
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.72rem",
                                        color: "#94a3b8",
                                        marginTop: 3,
                                    }}
                                >
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Table ── */}
                <div style={{ overflowX: "auto" }}>
                    <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                        <thead>
                            <tr
                                style={{
                                    background: "#f8fafc",
                                    borderBottom: "2px solid #e2e8f0",
                                }}
                            >
                                {[
                                    "#",
                                    "المعلم",
                                    "الحلقة",
                                    "التاريخ",
                                    "وقت الدخول",
                                    "وقت الخروج",
                                    "المدة",
                                    "الحالة",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: "12px 14px",
                                            textAlign: "right",
                                            fontWeight: 700,
                                            color: "#64748b",
                                            fontSize: "0.78rem",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {/* ── Loading Skeleton ── */}
                            {loading &&
                                [1, 2, 3, 4].map((i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            borderBottom: "1px solid #f1f5f9",
                                        }}
                                    >
                                        {[50, 120, 100, 90, 70, 70, 60, 80].map(
                                            (w, j) => (
                                                <td
                                                    key={j}
                                                    style={{ padding: 14 }}
                                                >
                                                    <div
                                                        className="shimmer-cell"
                                                        style={{ width: w }}
                                                    />
                                                </td>
                                            ),
                                        )}
                                    </tr>
                                ))}

                            {/* ── Error ── */}
                            {!loading && error && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        style={{
                                            textAlign: "center",
                                            padding: 40,
                                            color: "#b91c1c",
                                        }}
                                    >
                                        ❌ {error}
                                    </td>
                                </tr>
                            )}

                            {/* ── Empty ── */}
                            {!loading && !error && logs.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        style={{
                                            textAlign: "center",
                                            padding: 56,
                                            color: "#94a3b8",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 40,
                                                marginBottom: 8,
                                            }}
                                        >
                                            📭
                                        </div>
                                        لا توجد جلسات في هذه الفترة
                                    </td>
                                </tr>
                            )}

                            {/* ── Rows ── */}
                            {!loading &&
                                !error &&
                                logs.map((log, i) => {
                                    const isActive = !log.left_at;
                                    return (
                                        <tr
                                            key={log.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                                background: isActive
                                                    ? "#f0fdf4"
                                                    : "white",
                                                transition: "background 0.2s",
                                            }}
                                        >
                                            {/* # */}
                                            <td
                                                style={{
                                                    padding: "12px 14px",
                                                    color: "#94a3b8",
                                                    fontSize: 13,
                                                }}
                                            >
                                                {i + 1}
                                            </td>

                                            {/* المعلم */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 34,
                                                            height: 34,
                                                            borderRadius: 9,
                                                            background:
                                                                "linear-gradient(135deg,#6366f1,#4f46e5)",
                                                            color: "white",
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontWeight: 800,
                                                            fontSize: "0.95rem",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {log.teacher_name?.charAt(
                                                            0,
                                                        ) || "م"}
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                            fontSize: 14,
                                                            color: "#1e293b",
                                                        }}
                                                    >
                                                        {log.teacher_name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* الحلقة */}
                                            <td
                                                style={{
                                                    padding: "12px 14px",
                                                    fontSize: 13,
                                                    color: "#475569",
                                                }}
                                            >
                                                {log.circle_name ||
                                                    `حصة #${log.schedule_id}`}
                                            </td>

                                            {/* التاريخ */}
                                            <td
                                                style={{
                                                    padding: "12px 14px",
                                                    fontSize: 13,
                                                    color: "#475569",
                                                }}
                                            >
                                                {fmtDate(
                                                    log.session_date ||
                                                        log.joined_at,
                                                )}
                                            </td>

                                            {/* وقت الدخول */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                <span
                                                    style={{
                                                        background: "#dcfce7",
                                                        color: "#15803d",
                                                        padding: "3px 10px",
                                                        borderRadius: 999,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {fmtTime(log.joined_at)}
                                                </span>
                                            </td>

                                            {/* وقت الخروج */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                {log.left_at ? (
                                                    <span
                                                        style={{
                                                            background:
                                                                "#fee2e2",
                                                            color: "#b91c1c",
                                                            padding: "3px 10px",
                                                            borderRadius: 999,
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {fmtTime(log.left_at)}
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            background:
                                                                "#fef9c3",
                                                            color: "#a16207",
                                                            padding: "3px 10px",
                                                            borderRadius: 999,
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        لم يخرج بعد
                                                    </span>
                                                )}
                                            </td>

                                            {/* المدة */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                <span
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: 14,
                                                        color: log.duration_minutes
                                                            ? "#0891b2"
                                                            : "#94a3b8",
                                                    }}
                                                >
                                                    {fmtDuration(
                                                        log.duration_minutes,
                                                    )}
                                                </span>
                                            </td>

                                            {/* الحالة */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                <span
                                                    style={{
                                                        background: isActive
                                                            ? "#dcfce7"
                                                            : "#f1f5f9",
                                                        color: isActive
                                                            ? "#15803d"
                                                            : "#64748b",
                                                        border: `1px solid ${isActive ? "#bbf7d0" : "#e2e8f0"}`,
                                                        padding: "4px 12px",
                                                        borderRadius: 999,
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {isActive
                                                        ? "🟢 جارية"
                                                        : "⚪ انتهت"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSessionsLog;
