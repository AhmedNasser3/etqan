// pages/QuickCheckinPage.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuickCheckin } from "./hooks/useQuickCheckin";
import {
    FiMapPin,
    FiCheck,
    FiClock,
    FiRefreshCw,
    FiCalendar,
    FiHome,
    FiTrendingUp,
    FiTrendingDown,
    FiAlertCircle,
    FiUsers,
} from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceRecord {
    id: number;
    date: string;
    day_name: string;
    status: "present" | "late" | "absent" | "holiday";
    checkin_time: string | null;
    delay_minutes: number;
    notes: string | null;
}

interface StatsData {
    present: number;
    late: number;
    absent: number;
    avg_delay: number;
    total: number;
}

interface ScheduleData {
    work_start_time: string | null;
    allowed_late_minutes: number;
    is_holiday: boolean;
    today_day: string;
    off_days: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowFormatted(): string {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const suffix = h >= 12 ? "مساءً" : "صباحاً";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function to12h(t: string | null | undefined): string {
    if (!t) return "";
    if (t.includes("صباحاً") || t.includes("مساءً")) return t;
    // handle full timestamps like "2026-05-07T18:54:00.000000Z"
    let timePart = t;
    if (t.includes("T")) {
        timePart = t.split("T")[1];
    }
    const [hStr, mStr] = timePart.split(":");
    const h = parseInt(hStr, 10);
    const suffix = h >= 12 ? "مساءً" : "صباحاً";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${(mStr ?? "00").slice(0, 2)} ${suffix}`;
}

const DAYS_AR: Record<string, string> = {
    Sunday: "الأحد",
    Monday: "الاثنين",
    Tuesday: "الثلاثاء",
    Wednesday: "الأربعاء",
    Thursday: "الخميس",
    Friday: "الجمعة",
    Saturday: "السبت",
};

const STATUS_LABEL: Record<string, string> = {
    present: "حاضر",
    late: "متأخر",
    absent: "غائب",
    holiday: "إجازة",
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner: React.FC<{ white?: boolean }> = ({ white }) => (
    <span
        style={{
            display: "inline-block",
            width: 18,
            height: 18,
            border: `2.5px solid ${white ? "rgba(255,255,255,.3)" : "#94a3b8"}`,
            borderTop: `2.5px solid ${white ? "#fff" : "#1e293b"}`,
            borderRadius: "50%",
            animation: "spin .7s linear infinite",
            flexShrink: 0,
        }}
    />
);

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({
    label,
    value,
    icon,
    accent,
    sub,
    loading,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    accent: string;
    sub?: string;
    loading?: boolean;
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px 18px",
            boxShadow: "0 2px 12px #0001",
            borderTop: `4px solid ${accent}`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
        }}
    >
        <div style={{ color: accent, fontSize: 18 }}>{icon}</div>
        {loading ? (
            <div
                style={{
                    width: 40,
                    height: 28,
                    borderRadius: 6,
                    background: "#e2e8f0",
                    animation: "pulse 1.5s ease-in-out infinite",
                }}
            />
        ) : (
            <div style={{ fontSize: 24, fontWeight: 900, color: "#1e293b" }}>
                {value}
            </div>
        )}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
            {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const QuickCheckinPage: React.FC = () => {
    const {
        isTodayChecked,
        isLoading,
        isDisabled,
        message,
        checkinTime,
        todayStatus,
        error,
        requiresReason,
        delayMinutes,
        workStartTime,
        quickCheckin,
        resetError,
    } = useQuickCheckin();

    const [lateReason, setLateReason] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [liveClock, setLiveClock] = useState(nowFormatted());
    const [historyFilter, setHistoryFilter] = useState<
        "all" | "present" | "late"
    >("all");

    const [stats, setStats] = useState<StatsData | null>(null);
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [schedule, setSchedule] = useState<ScheduleData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const id = setInterval(() => setLiveClock(nowFormatted()), 30_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (requiresReason) {
            setShowModal(true);
            setTimeout(() => textareaRef.current?.focus(), 150);
        }
    }, [requiresReason]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch("/api/v1/attendance/stats", {
                headers: { Accept: "application/json" },
            });
            const json = await res.json();
            if (json.success && json.data) {
                setStats({
                    present: parseInt(json.data.present ?? 0),
                    late: parseInt(json.data.late ?? 0),
                    absent: parseInt(json.data.absent ?? 0),
                    avg_delay: parseInt(json.data.avg_delay ?? 0),
                    total: parseInt(json.data.total ?? 0),
                });
            }
        } catch (_) {}
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const from = new Date();
            from.setDate(from.getDate() - 14);
            const dateFrom = from.toISOString().slice(0, 10);
            const res = await fetch(
                `/api/v1/attendance?date_from=${dateFrom}&per_page=20`,
                { headers: { Accept: "application/json" } },
            );
            const json = await res.json();
            if (json.success && json.data?.data) setHistory(json.data.data);
        } catch (_) {}
    }, []);

    const fetchToday = useCallback(async () => {
        try {
            const res = await fetch("/api/v1/attendance/today", {
                headers: { Accept: "application/json" },
            });
            const json = await res.json();
            if (json.success) {
                setSchedule({
                    work_start_time: json.work_start_time ?? null,
                    allowed_late_minutes: 15,
                    is_holiday: json.is_holiday ?? false,
                    today_day:
                        DAYS_AR[
                            new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                            })
                        ] ?? "",
                    off_days: "الجمعة والسبت",
                });
            }
        } catch (_) {}
    }, []);

    const loadAll = useCallback(async () => {
        setDataLoading(true);
        await Promise.all([fetchStats(), fetchHistory(), fetchToday()]);
        setDataLoading(false);
    }, [fetchStats, fetchHistory, fetchToday]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    useEffect(() => {
        if (isTodayChecked) {
            fetchStats();
            fetchHistory();
        }
    }, [isTodayChecked]);

    const handleCheckin = () => quickCheckin();

    const handleSubmitLate = () => {
        if (!lateReason.trim()) return;
        setShowModal(false);
        quickCheckin(lateReason);
    };

    const closeModal = () => {
        setShowModal(false);
        setLateReason("");
        resetError();
    };

    const attendanceRate =
        stats && stats.total > 0
            ? Math.round(((stats.present + stats.late) / stats.total) * 100)
            : 0;

    const filteredHistory = history.filter((r) =>
        historyFilter === "all" ? true : r.status === historyFilter,
    );

    const todayStatusText = (() => {
        if (schedule?.is_holiday)
            return <span style={{ color: "#0284c7" }}>يوم إجازة</span>;
        if (isTodayChecked) {
            return todayStatus === "late" ? (
                <span style={{ color: "#b45309" }}>
                    تم التسجيل — متأخر {delayMinutes} د
                </span>
            ) : (
                <span style={{ color: "#166534" }}>تم التسجيل — حاضر</span>
            );
        }
        return <span style={{ color: "#94a3b8" }}>لم يُسجَّل بعد</span>;
    })();

    const iconState: "idle" | "done" | "late" | "holiday" = (() => {
        if (schedule?.is_holiday) return "holiday";
        if (isTodayChecked) return todayStatus === "late" ? "late" : "done";
        return "idle";
    })();

    const accentColor = {
        done: "#16a34a",
        late: "#d97706",
        holiday: "#0284c7",
        idle: "#64748b",
    }[iconState];

    const renderIcon = () => {
        const configs = {
            done: { bg: "#dcfce7", color: "#16a34a", Icon: FiCheck },
            late: { bg: "#fef3c7", color: "#d97706", Icon: FiClock },
            holiday: { bg: "#dbeafe", color: "#0284c7", Icon: FiHome },
            idle: { bg: "#f1f5f9", color: "#64748b", Icon: FiMapPin },
        };
        const { bg, color, Icon } = configs[iconState];
        return (
            <div
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Icon size={32} color={color} />
            </div>
        );
    };

    const renderBtn = () => {
        const base: React.CSSProperties = {
            width: "100%",
            maxWidth: 300,
            height: 52,
            fontSize: 15,
            fontWeight: 700,
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontFamily: "'Tajawal', sans-serif",
            transition: "opacity .15s",
        };

        if (schedule?.is_holiday)
            return (
                <button
                    style={{
                        ...base,
                        background: "#dbeafe",
                        color: "#0284c7",
                        border: "1.5px solid #bfdbfe",
                        cursor: "default",
                    }}
                    disabled
                >
                    <FiHome size={17} /> يوم إجازة
                </button>
            );
        if (isLoading)
            return (
                <button
                    style={{
                        ...base,
                        background: "#e2e8f0",
                        color: "#94a3b8",
                        cursor: "not-allowed",
                    }}
                    disabled
                >
                    <Spinner white /> جاري التسجيل...
                </button>
            );
        if (isTodayChecked && todayStatus === "late")
            return (
                <button
                    style={{
                        ...base,
                        background: "#fef3c7",
                        color: "#d97706",
                        border: "1.5px solid #fde68a",
                        cursor: "default",
                    }}
                    disabled
                >
                    <FiClock size={17} /> متأخر {delayMinutes} دقيقة
                </button>
            );
        if (isTodayChecked)
            return (
                <button
                    style={{
                        ...base,
                        background: "#dcfce7",
                        color: "#16a34a",
                        border: "1.5px solid #bbf7d0",
                        cursor: "default",
                    }}
                    disabled
                >
                    <FiCheck size={17} /> تم تسجيل الحضور
                </button>
            );
        return (
            <button
                style={{
                    ...base,
                    background: "linear-gradient(135deg, #1e293b, #0f4c35)",
                    color: "#fff",
                }}
                disabled={isDisabled}
                onClick={handleCheckin}
            >
                <FiMapPin size={17} /> تسجيل الحضور الآن
            </button>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div
            style={{
                fontFamily: "'Tajawal', sans-serif",
                direction: "rtl",
                background: "#f8fafc",
                minHeight: "100vh",
            }}
        >
            {/* ── Hero Header ── */}
            <div
                style={{
                    background: "linear-gradient(135deg, #1e293b, #0f4c35)",
                    padding: "32px 24px",
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
                            "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
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
                            {new Date().toLocaleDateString("ar-EG", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                        <h1
                            style={{ margin: 0, fontSize: 22, fontWeight: 900 }}
                        >
                            تسجيل الحضور
                        </h1>
                        <div
                            style={{
                                fontSize: 28,
                                fontWeight: 900,
                                letterSpacing: "-1px",
                                marginTop: 4,
                                color: "#fff",
                            }}
                        >
                            {liveClock}
                        </div>
                    </div>
                    <button
                        onClick={loadAll}
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: 10,
                            color: "#fff",
                            padding: "8px 14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: "'Tajawal', sans-serif",
                        }}
                    >
                        <FiRefreshCw size={14} /> تحديث
                    </button>
                </div>
            </div>

            <div
                style={{
                    padding: "20px 20px 60px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                {/* ── Stats ── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(130px, 1fr))",
                        gap: 12,
                    }}
                >
                    <StatCard
                        label="أيام حضور"
                        value={stats?.present ?? 0}
                        icon={<FiCheck />}
                        accent="#16a34a"
                        sub="هذا الشهر"
                        loading={dataLoading}
                    />
                    <StatCard
                        label="أيام تأخير"
                        value={stats?.late ?? 0}
                        icon={<FiClock />}
                        accent="#d97706"
                        sub={
                            stats?.avg_delay
                                ? `${stats.avg_delay} د متوسط`
                                : "لا يوجد"
                        }
                        loading={dataLoading}
                    />
                    <StatCard
                        label="نسبة الحضور"
                        value={`${attendanceRate}%`}
                        icon={
                            attendanceRate >= 80 ? (
                                <FiTrendingUp />
                            ) : (
                                <FiTrendingDown />
                            )
                        }
                        accent={
                            attendanceRate >= 80
                                ? "#16a34a"
                                : attendanceRate >= 60
                                  ? "#d97706"
                                  : "#dc2626"
                        }
                        sub="من إجمالي الأيام"
                        loading={dataLoading}
                    />
                </div>

                {/* ── Hero Checkin Card ── */}
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "0 2px 16px #0001",
                        border: "1px solid #e2e8f0",
                    }}
                >
                    {/* accent bar */}
                    <div
                        style={{
                            height: 4,
                            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
                        }}
                    />

                    <div
                        style={{
                            padding: "32px 24px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 16,
                        }}
                    >
                        {renderIcon()}

                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 900,
                                color: "#1e293b",
                                textAlign: "center",
                            }}
                        >
                            {isTodayChecked
                                ? "تم تسجيل الحضور"
                                : schedule?.is_holiday
                                  ? "يوم إجازة"
                                  : "سجّل حضورك الآن"}
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                color: "#64748b",
                                textAlign: "center",
                                lineHeight: 1.5,
                                marginTop: -8,
                            }}
                        >
                            {isTodayChecked
                                ? todayStatus === "late"
                                    ? `متأخر ${delayMinutes} دقيقة`
                                    : "حاضر في الوقت المحدد"
                                : schedule?.is_holiday
                                  ? "لا يمكن تسجيل الحضور في أيام الإجازة"
                                  : "اضغط على الزر أدناه لتسجيل حضورك"}
                        </div>

                        {renderBtn()}

                        {isTodayChecked && checkinTime && (
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    padding: "7px 16px",
                                    borderRadius: 999,
                                    fontSize: 13,
                                    color: "#475569",
                                }}
                            >
                                <FiClock size={13} />
                                تم التسجيل الساعة&nbsp;
                                <strong>{to12h(checkinTime)}</strong>
                            </div>
                        )}

                        {workStartTime &&
                            !isTodayChecked &&
                            !schedule?.is_holiday && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        fontSize: 13,
                                        color: "#94a3b8",
                                    }}
                                >
                                    <FiClock size={13} />
                                    موعد بدء العمل:&nbsp;
                                    <strong style={{ color: "#475569" }}>
                                        {to12h(workStartTime)}
                                    </strong>
                                </div>
                            )}

                        {message && !error && !isLoading && (
                            <div
                                style={{
                                    background: "#dcfce7",
                                    color: "#166534",
                                    padding: "8px 18px",
                                    borderRadius: 999,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    border: "1px solid #bbf7d0",
                                }}
                            >
                                {message}
                            </div>
                        )}
                        {error && !requiresReason && (
                            <div
                                style={{
                                    background: "#fee2e2",
                                    color: "#dc2626",
                                    padding: "8px 18px",
                                    borderRadius: 999,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    border: "1px solid #fecaca",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <FiAlertCircle size={13} /> {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Schedule Card ── */}
                <div>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "1.2px",
                            textTransform: "uppercase" as const,
                            color: "#94a3b8",
                            paddingBottom: 10,
                        }}
                    >
                        جدول العمل
                    </div>
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            border: "1px solid #e2e8f0",
                            padding: "4px 20px",
                            boxShadow: "0 2px 12px #0001",
                        }}
                    >
                        {[
                            {
                                label: "موعد البدء",
                                value: schedule?.work_start_time
                                    ? to12h(schedule.work_start_time)
                                    : dataLoading
                                      ? null
                                      : "—",
                                color: "#166534",
                            },
                            {
                                label: "هامش التأخير المسموح",
                                value: schedule
                                    ? `${schedule.allowed_late_minutes} دقيقة`
                                    : dataLoading
                                      ? null
                                      : "—",
                                color: "#b45309",
                            },
                            {
                                label: "حالة اليوم",
                                value: null,
                                node: todayStatusText,
                            },
                            {
                                label: "أيام الراحة",
                                value:
                                    schedule?.off_days ??
                                    (dataLoading ? null : "—"),
                                color: "#475569",
                            },
                        ].map((row, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "13px 0",
                                    borderBottom:
                                        i < 3 ? "1px solid #f1f5f9" : "none",
                                }}
                            >
                                <span
                                    style={{ fontSize: 13, color: "#94a3b8" }}
                                >
                                    {row.label}
                                </span>
                                {row.node ? (
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {row.node}
                                    </span>
                                ) : row.value === null ? (
                                    <div
                                        style={{
                                            width: 80,
                                            height: 14,
                                            borderRadius: 4,
                                            background: "#e2e8f0",
                                            animation:
                                                "pulse 1.5s ease-in-out infinite",
                                        }}
                                    />
                                ) : (
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: row.color,
                                        }}
                                    >
                                        {row.value}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── History ── */}
                <div>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "1.2px",
                            textTransform: "uppercase" as const,
                            color: "#94a3b8",
                            paddingBottom: 10,
                        }}
                    >
                        السجل الأخير
                    </div>
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            border: "1px solid #e2e8f0",
                            overflow: "hidden",
                            boxShadow: "0 2px 12px #0001",
                        }}
                    >
                        {/* header */}
                        <div
                            style={{
                                padding: "14px 20px",
                                borderBottom: "1px solid #f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#1e293b",
                                }}
                            >
                                آخر 14 يوم
                            </span>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 0,
                                    background: "#f8fafc",
                                    borderRadius: 8,
                                    padding: 3,
                                }}
                            >
                                {(["all", "present", "late"] as const).map(
                                    (f) => (
                                        <button
                                            key={f}
                                            onClick={() => setHistoryFilter(f)}
                                            style={{
                                                height: 30,
                                                borderRadius: 6,
                                                border: "none",
                                                fontFamily:
                                                    "'Tajawal', sans-serif",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                padding: "0 12px",
                                                background:
                                                    historyFilter === f
                                                        ? "#fff"
                                                        : "transparent",
                                                color:
                                                    historyFilter === f
                                                        ? "#1e293b"
                                                        : "#94a3b8",
                                                boxShadow:
                                                    historyFilter === f
                                                        ? "0 1px 4px #0001"
                                                        : "none",
                                                transition: "all .15s",
                                            }}
                                        >
                                            {
                                                {
                                                    all: "الكل",
                                                    present: "حضور",
                                                    late: "تأخير",
                                                }[f]
                                            }
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>

                        {/* rows */}
                        {dataLoading ? (
                            [1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "14px 20px",
                                        borderBottom: "1px solid #f8fafc",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            background: "#e2e8f0",
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                width: "40%",
                                                height: 13,
                                                borderRadius: 4,
                                                background: "#e2e8f0",
                                                marginBottom: 5,
                                                animation:
                                                    "pulse 1.5s ease-in-out infinite",
                                            }}
                                        />
                                        <div
                                            style={{
                                                width: "60%",
                                                height: 11,
                                                borderRadius: 4,
                                                background: "#e2e8f0",
                                                animation:
                                                    "pulse 1.5s ease-in-out infinite",
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: 50,
                                            height: 20,
                                            borderRadius: 999,
                                            background: "#e2e8f0",
                                            animation:
                                                "pulse 1.5s ease-in-out infinite",
                                        }}
                                    />
                                </div>
                            ))
                        ) : filteredHistory.length === 0 ? (
                            <div
                                style={{
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#94a3b8",
                                    fontSize: 13,
                                }}
                            >
                                لا توجد سجلات
                            </div>
                        ) : (
                            filteredHistory.map((r) => {
                                const dotColor =
                                    {
                                        present: "#16a34a",
                                        late: "#d97706",
                                        absent: "#dc2626",
                                        holiday: "#0284c7",
                                    }[r.status] ?? "#94a3b8";
                                const pillStyle =
                                    {
                                        present: {
                                            background: "#dcfce7",
                                            color: "#166534",
                                        },
                                        late: {
                                            background: "#fef3c7",
                                            color: "#b45309",
                                        },
                                        absent: {
                                            background: "#fee2e2",
                                            color: "#dc2626",
                                        },
                                        holiday: {
                                            background: "#dbeafe",
                                            color: "#0284c7",
                                        },
                                    }[r.status] ?? {};

                                return (
                                    <div
                                        key={r.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: "13px 20px",
                                            borderBottom: "1px solid #f8fafc",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                background: dotColor,
                                                flexShrink: 0,
                                            }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: "#1e293b",
                                                }}
                                            >
                                                {r.day_name} — {r.date}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#94a3b8",
                                                    marginTop: 2,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {r.notes ?? "—"}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "flex-end",
                                                gap: 4,
                                            }}
                                        >
                                            {r.checkin_time && (
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#94a3b8",
                                                    }}
                                                >
                                                    {to12h(r.checkin_time)}
                                                </div>
                                            )}
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    padding: "2px 10px",
                                                    borderRadius: 999,
                                                    ...pillStyle,
                                                }}
                                            >
                                                {STATUS_LABEL[r.status] ??
                                                    r.status}
                                                {r.status === "late" &&
                                                    r.delay_minutes > 0 &&
                                                    ` ${r.delay_minutes}د`}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* ── Late Modal ── */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,.45)",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                    }}
                    onClick={(e) =>
                        e.target === e.currentTarget && closeModal()
                    }
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            width: "100%",
                            maxWidth: 420,
                            overflow: "hidden",
                            boxShadow: "0 20px 60px rgba(0,0,0,.2)",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        {/* top accent */}
                        <div
                            style={{
                                height: 4,
                                background:
                                    "linear-gradient(90deg, #d97706, #fbbf24)",
                            }}
                        />

                        <div
                            style={{
                                padding: "20px 22px",
                                borderBottom: "1px solid #f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    background: "#fef3c7",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <FiClock size={20} color="#d97706" />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 900,
                                        color: "#1e293b",
                                    }}
                                >
                                    أنت متأخر {delayMinutes} دقيقة
                                </div>
                                {workStartTime && (
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#94a3b8",
                                            marginTop: 2,
                                        }}
                                    >
                                        موعد العمل: {to12h(workStartTime)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: "18px 22px 4px" }}>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#475569",
                                    marginBottom: 8,
                                }}
                            >
                                سبب التأخير *
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={lateReason}
                                onChange={(e) => setLateReason(e.target.value)}
                                placeholder="اكتب سبب التأخير هنا..."
                                rows={3}
                                style={{
                                    width: "100%",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 10,
                                    padding: 12,
                                    fontSize: 14,
                                    resize: "vertical",
                                    outline: "none",
                                    direction: "rtl",
                                    fontFamily: "'Tajawal', sans-serif",
                                    background: "#f8fafc",
                                    color: "#1e293b",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div
                            style={{
                                padding: "14px 22px 20px",
                                display: "flex",
                                gap: 10,
                            }}
                        >
                            <button
                                style={{
                                    flex: 1,
                                    height: 48,
                                    background:
                                        !lateReason.trim() || isLoading
                                            ? "#e2e8f0"
                                            : "linear-gradient(135deg, #1e293b, #0f4c35)",
                                    color:
                                        !lateReason.trim() || isLoading
                                            ? "#94a3b8"
                                            : "#fff",
                                    border: "none",
                                    borderRadius: 10,
                                    fontFamily: "'Tajawal', sans-serif",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor:
                                        !lateReason.trim() || isLoading
                                            ? "not-allowed"
                                            : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    transition: "all .15s",
                                }}
                                disabled={!lateReason.trim() || isLoading}
                                onClick={handleSubmitLate}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner white /> جاري التسجيل...
                                    </>
                                ) : (
                                    <>
                                        <FiCheck size={15} /> تسجيل الحضور
                                    </>
                                )}
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    height: 48,
                                    background: "#f8fafc",
                                    color: "#475569",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 10,
                                    fontFamily: "'Tajawal', sans-serif",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                                onClick={closeModal}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            `}</style>
        </div>
    );
};

export default QuickCheckinPage;
