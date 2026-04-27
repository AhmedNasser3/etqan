// pages/admin/StaffAttendancePage.tsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttendanceRecord {
    id: number;
    teacher_id: number;
    teacher_name: string;
    role: string;
    center_name: string;
    status: "present" | "late" | "absent";
    notes: string;
    date: string;
    checkin_time: string;
    delay_minutes: number;
}
interface Stats {
    total: number;
    present: number;
    late: number;
    absent: number;
    monthly_rate: number;
    avg_delay: number;
}
interface Filters {
    date_filter: "today" | "yesterday" | "week" | "month" | "custom";
    date_from: string;
    date_to: string;
    status: string;
    search: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
const useStaffAttendance = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState<Filters>({
        date_filter: "today",
        date_from: "",
        date_to: "",
        status: "",
        search: "",
    });

    const fetchData = useCallback(async (f: Filters) => {
        setLoading(true);
        setError("");
        try {
            const params: Record<string, string> = {
                date_filter: f.date_filter,
            };
            if (f.date_filter === "custom") {
                if (f.date_from) params.date_from = f.date_from;
                if (f.date_to) params.date_to = f.date_to;
            }
            const res = await axios.get("/v1/attendance/staff-list", {
                params,
            });
            if (res.data.success) {
                setRecords(res.data.data ?? []);
                setStats(res.data.stats ?? null);
            }
        } catch {
            setError("فشل في تحميل البيانات - تأكد من الاتصال");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(filters);
    }, []);

    const applyFilters = (updated: Partial<Filters>) => {
        const next = { ...filters, ...updated };
        setFilters(next);
        fetchData(next);
    };

    const filtered = records.filter((r) => {
        const matchStatus = !filters.status || r.status === filters.status;
        const matchSearch =
            !filters.search ||
            r.teacher_name
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
            r.center_name.includes(filters.search);
        return matchStatus && matchSearch;
    });

    return { filtered, stats, loading, error, filters, applyFilters };
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CFG = {
    present: {
        label: "حاضر",
        icon: "✓",
        bg: "#dcfce7",
        color: "#15803d",
        border: "#bbf7d0",
    },
    late: {
        label: "متأخر",
        icon: "⏰",
        bg: "#fef9c3",
        color: "#a16207",
        border: "#fde68a",
    },
    absent: {
        label: "غائب",
        icon: "✕",
        bg: "#fee2e2",
        color: "#b91c1c",
        border: "#fecaca",
    },
} as const;

const DATE_TABS = [
    { key: "today" as const, label: "اليوم" },
    { key: "yesterday" as const, label: "أمس" },
    { key: "week" as const, label: "هذا الأسبوع" },
    { key: "month" as const, label: "هذا الشهر" },
    { key: "custom" as const, label: "📅 تخصيص" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const StaffAttendancePage: React.FC = () => {
    const { filtered, stats, loading, error, filters, applyFilters } =
        useStaffAttendance();

    return (
        <div className="content" id="contentArea" style={{ direction: "rtl" }}>
            {/* ══ HEADER ══ */}
            <div style={styles.headerCard}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                    }}
                >
                    <div style={styles.headerIcon}>👥</div>
                    <div>
                        <h1 style={styles.headerTitle}>سجل حضور الموظفين</h1>
                        <p style={styles.headerSub}>
                            متابعة وإدارة حضور وغياب جميع الموظفين
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => applyFilters({})}
                    style={styles.refreshBtn}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f1f5f9")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "white")
                    }
                >
                    <span style={{ fontSize: "1rem" }}>🔄</span> تحديث
                </button>
            </div>

            {/* ══ STATS ══ */}
            {stats && (
                <div style={styles.statsGrid}>
                    <StatBox
                        label="إجمالي السجلات"
                        value={stats.total}
                        icon="📋"
                        color="#6366f1"
                        light="#eef2ff"
                    />
                    <StatBox
                        label="حاضر"
                        value={stats.present}
                        icon="✅"
                        color="#16a34a"
                        light="#dcfce7"
                    />
                    <StatBox
                        label="متأخر"
                        value={stats.late}
                        icon="⏰"
                        color="#d97706"
                        light="#fef9c3"
                    />
                    <StatBox
                        label="غائب"
                        value={stats.absent}
                        icon="❌"
                        color="#dc2626"
                        light="#fee2e2"
                    />
                    <StatBox
                        label="نسبة الحضور"
                        value={`${stats.monthly_rate}%`}
                        icon="📊"
                        color="#0891b2"
                        light="#e0f2fe"
                        wide
                    />
                    <StatBox
                        label="متوسط التأخير"
                        value={`${stats.avg_delay} دقيقة`}
                        icon="⏱️"
                        color="#7c3aed"
                        light="#ede9fe"
                        wide
                    />
                </div>
            )}

            {/* ══ FILTERS ══ */}
            <div style={styles.filtersCard}>
                {/* Date Tabs */}
                <div style={styles.tabsRow}>
                    {DATE_TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => applyFilters({ date_filter: t.key })}
                            style={{
                                ...styles.tabBtn,
                                background:
                                    filters.date_filter === t.key
                                        ? "#6366f1"
                                        : "transparent",
                                color:
                                    filters.date_filter === t.key
                                        ? "white"
                                        : "#64748b",
                                fontWeight:
                                    filters.date_filter === t.key ? 700 : 500,
                                boxShadow:
                                    filters.date_filter === t.key
                                        ? "0 2px 8px rgba(99,102,241,0.35)"
                                        : "none",
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Custom Date Range */}
                {filters.date_filter === "custom" && (
                    <div style={styles.dateRangeRow}>
                        <div style={styles.dateField}>
                            <label style={styles.label}>من تاريخ</label>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) =>
                                    applyFilters({ date_from: e.target.value })
                                }
                                style={styles.input}
                            />
                        </div>
                        <div style={{ ...styles.dateField }}>
                            <label style={styles.label}>إلى تاريخ</label>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) =>
                                    applyFilters({ date_to: e.target.value })
                                }
                                style={styles.input}
                            />
                        </div>
                        <button
                            onClick={() => applyFilters({})}
                            style={styles.applyBtn}
                        >
                            بحث
                        </button>
                    </div>
                )}

                {/* Search + Status */}
                <div style={styles.searchRow}>
                    <div style={styles.searchWrap}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو المركز..."
                            value={filters.search}
                            onChange={(e) =>
                                applyFilters({ search: e.target.value })
                            }
                            style={styles.searchInput}
                        />
                        {filters.search && (
                            <button
                                onClick={() => applyFilters({ search: "" })}
                                style={styles.clearBtn}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <div style={styles.statusTabs}>
                        {[
                            { v: "", l: "الكل" },
                            { v: "present", l: "✓ حاضر" },
                            { v: "late", l: "⏰ متأخر" },
                            { v: "absent", l: "✕ غائب" },
                        ].map((s) => (
                            <button
                                key={s.v}
                                onClick={() => applyFilters({ status: s.v })}
                                style={{
                                    ...styles.statusTab,
                                    background:
                                        filters.status === s.v
                                            ? "#1e293b"
                                            : "transparent",
                                    color:
                                        filters.status === s.v
                                            ? "white"
                                            : "#64748b",
                                }}
                            >
                                {s.l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ TABLE ══ */}
            <div style={styles.tableCard}>
                {/* Table Meta */}
                <div style={styles.tableMeta}>
                    <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
                        {loading ? (
                            "⏳ جاري التحميل..."
                        ) : (
                            <>
                                <strong style={{ color: "#1e293b" }}>
                                    {filtered.length}
                                </strong>{" "}
                                سجل
                            </>
                        )}
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div style={styles.errorBox}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} style={styles.skeletonRow}>
                                <div
                                    style={{
                                        ...styles.skeletonCell,
                                        width: "30px",
                                    }}
                                />
                                <div
                                    style={{
                                        ...styles.skeletonCell,
                                        width: "140px",
                                    }}
                                />
                                <div
                                    style={{
                                        ...styles.skeletonCell,
                                        width: "80px",
                                    }}
                                />
                                <div
                                    style={{
                                        ...styles.skeletonCell,
                                        width: "100px",
                                    }}
                                />
                                <div
                                    style={{
                                        ...styles.skeletonCell,
                                        width: "90px",
                                    }}
                                />
                                <div
                                    style={{
                                        ...styles.skeletonCell,
                                        width: "70px",
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Desktop Table */}
                {!loading && (
                    <div
                        style={{ overflowX: "auto" }}
                        className="desktop-table"
                    >
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    {[
                                        "#",
                                        "الموظف",
                                        "المركز",
                                        "التاريخ",
                                        "وقت الحضور",
                                        "الحالة",
                                        "التأخير",
                                        "الملاحظات",
                                    ].map((h) => (
                                        <th key={h} style={styles.th}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            style={styles.emptyCell}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "3rem",
                                                    marginBottom: "12px",
                                                }}
                                            >
                                                📭
                                            </div>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    color: "#475569",
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                لا توجد سجلات
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.85rem",
                                                    color: "#94a3b8",
                                                }}
                                            >
                                                جرب تغيير الفترة الزمنية أو
                                                الفلاتر
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((r, i) => {
                                        const s =
                                            STATUS_CFG[r.status] ??
                                            STATUS_CFG.absent;
                                        return (
                                            <tr
                                                key={r.id}
                                                style={styles.tr}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "#f8fafc")
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "white")
                                                }
                                            >
                                                <td
                                                    style={{
                                                        ...styles.td,
                                                        color: "#94a3b8",
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    {i + 1}
                                                </td>
                                                <td style={styles.td}>
                                                    <div
                                                        style={
                                                            styles.teacherCell
                                                        }
                                                    >
                                                        <div
                                                            style={
                                                                styles.avatar
                                                            }
                                                        >
                                                            {r.teacher_name.charAt(
                                                                0,
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div
                                                                style={{
                                                                    fontWeight: 600,
                                                                    color: "#1e293b",
                                                                    fontSize:
                                                                        "0.9rem",
                                                                }}
                                                            >
                                                                {r.teacher_name}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    color: "#94a3b8",
                                                                }}
                                                            >
                                                                {r.role}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <span
                                                        style={
                                                            styles.centerBadge
                                                        }
                                                    >
                                                        🏢 {r.center_name}
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        ...styles.td,
                                                        color: "#475569",
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {r.date}
                                                </td>
                                                <td
                                                    style={{
                                                        ...styles.td,
                                                        color: "#475569",
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {r.checkin_time || "-"}
                                                </td>
                                                <td style={styles.td}>
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "5px",
                                                            background: s.bg,
                                                            color: s.color,
                                                            border: `1px solid ${s.border}`,
                                                            padding: "4px 12px",
                                                            borderRadius:
                                                                "999px",
                                                            fontWeight: 700,
                                                            fontSize: "0.8rem",
                                                        }}
                                                    >
                                                        <span>{s.icon}</span>{" "}
                                                        {s.label}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    {r.delay_minutes > 0 ? (
                                                        <span
                                                            style={
                                                                styles.delayBadge
                                                            }
                                                        >
                                                            ⏱ {r.delay_minutes}{" "}
                                                            د
                                                        </span>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                color: "#cbd5e1",
                                                            }}
                                                        >
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td
                                                    style={{
                                                        ...styles.td,
                                                        maxWidth: "180px",
                                                    }}
                                                >
                                                    <span
                                                        title={r.notes}
                                                        style={styles.notesText}
                                                    >
                                                        {r.notes || "—"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Mobile Cards */}
                {!loading && (
                    <div className="mobile-cards" style={{ display: "none" }}>
                        {filtered.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "48px 0",
                                    color: "#94a3b8",
                                }}
                            >
                                <div style={{ fontSize: "3rem" }}>📭</div>
                                <div
                                    style={{
                                        marginTop: "12px",
                                        fontWeight: 600,
                                    }}
                                >
                                    لا توجد سجلات
                                </div>
                            </div>
                        ) : (
                            filtered.map((r) => {
                                const s =
                                    STATUS_CFG[r.status] ?? STATUS_CFG.absent;
                                return (
                                    <div key={r.id} style={styles.mobileCard}>
                                        {/* Card Header */}
                                        <div style={styles.mobileCardHeader}>
                                            <div style={styles.teacherCell}>
                                                <div style={styles.avatar}>
                                                    {r.teacher_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: 700,
                                                            color: "#1e293b",
                                                        }}
                                                    >
                                                        {r.teacher_name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            color: "#94a3b8",
                                                        }}
                                                    >
                                                        {r.role}
                                                    </div>
                                                </div>
                                            </div>
                                            <span
                                                style={{
                                                    background: s.bg,
                                                    color: s.color,
                                                    border: `1px solid ${s.border}`,
                                                    padding: "4px 12px",
                                                    borderRadius: "999px",
                                                    fontWeight: 700,
                                                    fontSize: "0.8rem",
                                                }}
                                            >
                                                {s.icon} {s.label}
                                            </span>
                                        </div>
                                        {/* Card Details */}
                                        <div style={styles.mobileCardDetails}>
                                            <MobileDetail
                                                icon="🏢"
                                                text={r.center_name}
                                            />
                                            <MobileDetail
                                                icon="📅"
                                                text={r.date}
                                            />
                                            <MobileDetail
                                                icon="🕐"
                                                text={r.checkin_time || "—"}
                                            />
                                            {r.delay_minutes > 0 && (
                                                <MobileDetail
                                                    icon="⏱️"
                                                    text={`${r.delay_minutes} دقيقة تأخير`}
                                                    warn
                                                />
                                            )}
                                        </div>
                                        {r.notes && r.notes !== "-" && (
                                            <div style={styles.mobileNotes}>
                                                📝 {r.notes}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-table { display: none !important; }
                    .mobile-cards  { display: block !important; }
                }
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
            `}</style>
        </div>
    );
};

// ─── Sub Components ───────────────────────────────────────────────────────────

const StatBox: React.FC<{
    icon: string;
    label: string;
    value: number | string;
    color: string;
    light: string;
    wide?: boolean;
}> = ({ icon, label, value, color, light, wide }) => (
    <div
        style={{
            ...styles.statBox,
            gridColumn: wide ? "span 2" : "span 1",
            background: "white",
        }}
    >
        <div style={{ ...styles.statIcon, background: light, color }}>
            {icon}
        </div>
        <div>
            <div
                style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color,
                    lineHeight: 1,
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontSize: "0.78rem",
                    color: "#94a3b8",
                    marginTop: "4px",
                    fontWeight: 500,
                }}
            >
                {label}
            </div>
        </div>
    </div>
);

const MobileDetail: React.FC<{
    icon: string;
    text: string;
    warn?: boolean;
}> = ({ icon, text, warn }) => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: warn ? "#d97706" : "#64748b",
            fontSize: "0.85rem",
            fontWeight: warn ? 600 : 400,
        }}
    >
        <span>{icon}</span>
        <span>{text}</span>
    </div>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    headerCard: {
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        borderRadius: "16px",
        padding: "24px 28px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
    },
    headerIcon: {
        width: "52px",
        height: "52px",
        background: "rgba(255,255,255,0.2)",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
        flexShrink: 0,
    },
    headerTitle: {
        margin: 0,
        fontSize: "1.35rem",
        fontWeight: 800,
        color: "white",
        letterSpacing: "-0.3px",
    },
    headerSub: {
        margin: "4px 0 0",
        fontSize: "0.85rem",
        color: "rgba(255,255,255,0.75)",
    },
    refreshBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "white",
        border: "none",
        borderRadius: "10px",
        padding: "10px 18px",
        cursor: "pointer",
        fontWeight: 600,
        color: "#4f46e5",
        fontSize: "0.875rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "background .15s",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "12px",
        marginBottom: "20px",
    },
    statBox: {
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    },
    statIcon: {
        width: "46px",
        height: "46px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem",
        flexShrink: 0,
    },
    filtersCard: {
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "20px 24px",
        marginBottom: "20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    },
    tabsRow: {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        marginBottom: "16px",
        background: "#f8fafc",
        padding: "6px",
        borderRadius: "12px",
        width: "fit-content",
    },
    tabBtn: {
        padding: "8px 18px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "0.875rem",
        transition: "all .2s",
    },
    dateRangeRow: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        alignItems: "flex-end",
        marginBottom: "16px",
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "12px",
        border: "1px dashed #cbd5e1",
    },
    dateField: { display: "flex", flexDirection: "column" },
    label: {
        fontSize: "0.78rem",
        color: "#64748b",
        fontWeight: 600,
        marginBottom: "6px",
    },
    input: {
        padding: "9px 14px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        fontSize: "0.9rem",
        outline: "none",
        direction: "rtl",
        background: "white",
        color: "#1e293b",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    },
    applyBtn: {
        padding: "9px 22px",
        background: "#6366f1",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "0.9rem",
        alignSelf: "flex-end",
        boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
    },
    searchRow: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        alignItems: "center",
    },
    searchWrap: {
        flex: 1,
        minWidth: "220px",
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    searchIcon: {
        position: "absolute",
        right: "14px",
        fontSize: "0.9rem",
        pointerEvents: "none",
    },
    searchInput: {
        width: "100%",
        padding: "10px 42px 10px 36px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        fontSize: "0.9rem",
        outline: "none",
        direction: "rtl",
        background: "#f8fafc",
        color: "#1e293b",
        boxSizing: "border-box",
        transition: "border-color .2s",
    },
    clearBtn: {
        position: "absolute",
        left: "12px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#94a3b8",
        fontSize: "0.9rem",
        lineHeight: 1,
    },
    statusTabs: {
        display: "flex",
        background: "#f8fafc",
        borderRadius: "10px",
        padding: "4px",
        border: "1px solid #e2e8f0",
    },
    statusTab: {
        padding: "7px 14px",
        border: "none",
        cursor: "pointer",
        borderRadius: "7px",
        fontSize: "0.8rem",
        fontWeight: 600,
        transition: "all .15s",
        whiteSpace: "nowrap" as const,
    },
    tableCard: {
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    },
    tableMeta: {
        marginBottom: "16px",
        paddingBottom: "16px",
        borderBottom: "1px solid #f1f5f9",
    },
    errorBox: {
        background: "#fee2e2",
        color: "#b91c1c",
        padding: "12px 16px",
        borderRadius: "10px",
        marginBottom: "16px",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        border: "1px solid #fecaca",
    },
    skeletonRow: {
        display: "flex",
        gap: "16px",
        padding: "16px 0",
        borderBottom: "1px solid #f1f5f9",
    },
    skeletonCell: {
        height: "16px",
        borderRadius: "6px",
        background:
            "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
    },
    table: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#f8fafc" },
    th: {
        padding: "13px 16px",
        textAlign: "right",
        fontWeight: 700,
        color: "#64748b",
        fontSize: "0.78rem",
        textTransform: "uppercase" as const,
        letterSpacing: "0.5px",
        borderBottom: "2px solid #e2e8f0",
        whiteSpace: "nowrap" as const,
    },
    tr: {
        borderBottom: "1px solid #f1f5f9",
        transition: "background .1s",
        cursor: "default",
        background: "white",
    },
    td: { padding: "14px 16px", verticalAlign: "middle" as const },
    emptyCell: {
        textAlign: "center" as const,
        padding: "64px 0",
        color: "#94a3b8",
    },
    teacherCell: { display: "flex", alignItems: "center", gap: "10px" },
    avatar: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: "0.95rem",
        flexShrink: 0,
    },
    centerBadge: {
        background: "#f1f5f9",
        color: "#475569",
        padding: "4px 10px",
        borderRadius: "8px",
        fontSize: "0.8rem",
        fontWeight: 500,
        border: "1px solid #e2e8f0",
    },
    delayBadge: {
        background: "#fef9c3",
        color: "#a16207",
        border: "1px solid #fde68a",
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "0.8rem",
        fontWeight: 600,
    },
    notesText: {
        display: "block",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap" as const,
        color: "#64748b",
        fontSize: "0.82rem",
    },
    mobileCard: {
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "16px",
        marginBottom: "12px",
        background: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    },
    mobileCardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    },
    mobileCardDetails: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: "10px 20px",
    },
    mobileNotes: {
        marginTop: "10px",
        padding: "8px 12px",
        background: "#f8fafc",
        borderRadius: "8px",
        fontSize: "0.82rem",
        color: "#64748b",
        border: "1px solid #f1f5f9",
    },
};

export default StaffAttendancePage;
