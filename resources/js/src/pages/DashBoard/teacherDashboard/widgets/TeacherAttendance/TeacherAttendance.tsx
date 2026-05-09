import React, { useEffect, useRef, useState } from "react";
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
    FiTrendingUp,
    FiEye,
    FiCalendar,
} from "react-icons/fi";
import { FaChalkboardTeacher, FaMosque } from "react-icons/fa";
import {
    useTeacherAttendance,
    AttendanceDay,
    AttendanceSession,
} from "./hooks/useTeacherAttendance";

type AttendanceTab = "all" | "present" | "partial" | "absent";

const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

const STATUS_META: Record<
    AttendanceDay["totalStatus"],
    { label: string; className: string; icon: React.ReactNode }
> = {
    present: {
        label: "حاضر كامل",
        className: "badge success",
        icon: <FiCheckCircle size={11} />,
    },
    partial: {
        label: "حاضر جزئي",
        className: "badge warning",
        icon: <FiClock size={11} />,
    },
    absent: {
        label: "غائب",
        className: "badge danger",
        icon: <FiXCircle size={11} />,
    },
};

const AvatarInitials = ({ name, idx }: { name: string; idx: number }) => {
    const av = AV_COLORS[idx % AV_COLORS.length];
    const initials = (name || "؟")
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

const formatTimeTo12Hour = (time24: string): string => {
    const [time] = String(time24 || "").split(" ");
    if (!time || !time.includes(":")) return time24 || "";
    const [hours, minutes] = time.split(":");
    const hourNum = parseInt(hours, 10);
    if (Number.isNaN(hourNum)) return time24 || "";
    const newHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    const period = hourNum >= 12 ? "م" : "ص";
    return `${newHour}:${minutes} ${period}`;
};

const extractTimeFromNotes = (notes: string | null | undefined): string => {
    if (!notes) return "";
    const m = notes.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (m) return formatTimeTo12Hour(`${m[1]}:${m[2]}:00`);
    return "";
};

const formatPercentage = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return "0%";
    if (typeof value === "number") return `${Math.round(value)}%`;
    return String(value).includes("%") ? String(value) : `${value}%`;
};

const getAttendanceStatusText = (day: AttendanceDay) => {
    if (day.status === "late") {
        return `متأخر${day.delayMinutes ? ` (${day.delayMinutes} دقيقة)` : ""}`;
    }
    if (day.status === "present") {
        return "حاضر";
    }
    return "غائب";
};

const getSessionStyle = (
    status: AttendanceSession["status"],
): React.CSSProperties => {
    if (status === "present") {
        return {
            background: "#E1F5EE",
            color: "#0F6E56",
            border: "1px solid #CFE9E0",
        };
    }
    return {
        background: "#FCEBEB",
        color: "#A32D2D",
        border: "1px solid #F3C5C5",
    };
};

const getSessionStatusIcon = (status: AttendanceSession["status"]) =>
    status === "present" ? (
        <FiCheckCircle size={13} style={{ color: "#10b981" }} />
    ) : (
        <FiXCircle size={13} style={{ color: "#ef4444" }} />
    );

const getTotalStatusText = (status: AttendanceDay["totalStatus"]) =>
    status === "present"
        ? "حاضر كامل"
        : status === "partial"
          ? "حاضر جزئي"
          : "غائب";

const renderDayStatusAsSession = (day: AttendanceDay): AttendanceSession[] => {
    if (day.sessions?.length > 0) return day.sessions;

    const timeFromNotes = day.checkinTime ?? extractTimeFromNotes(day.notes);
    const statusText = getAttendanceStatusText(day);

    return [
        {
            id: day.id,
            time: timeFromNotes
                ? `${statusText} - ${timeFromNotes}`
                : statusText,
            status:
                day.totalStatus === "present"
                    ? "present"
                    : ("absent" as AttendanceSession["status"]),
        },
    ];
};

const TeacherAttendance: React.FC = () => {
    const {
        dateFrom,
        dateTo,
        filteredData,
        attendanceData,
        attendancePercentage,
        lastDayToday,
        totalDays,
        loading,
        error,
        toggleSessionStatus,
        setDateFrom,
        setDateTo,
        refetchData,
        getDayName,
    } = useTeacherAttendance();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [centerFilter, setCenterFilter] = useState("");
    const [activeTab, setActiveTab] = useState<AttendanceTab>("all");
    const [page, setPage] = useState(1);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [togglingKeys, setTogglingKeys] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<{
        message: string;
        tone: "success" | "error";
    } | null>(null);
    const toastTimer = useRef<number | null>(null);

    const PER_PAGE = 10;

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(search);
        }, 350);

        return () => window.clearTimeout(timer);
    }, [search]);

    const showToast = (
        message: string,
        tone: "success" | "error" = "success",
    ) => {
        setToast({ message, tone });
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 3200);
    };

    const centerOptions = Array.from(
        new Set(attendanceData.map((day) => day.centerName).filter(Boolean)),
    ) as string[];

    const filtered = filteredData
        .filter((day) => {
            const q = debouncedSearch.trim();
            const matchSearch =
                !q ||
                day.date.includes(q) ||
                (day.centerName ?? "").includes(q) ||
                (day.teacherName ?? "").includes(q) ||
                (day.notes ?? "").includes(q) ||
                getAttendanceStatusText(day).includes(q);

            const matchCenter =
                !centerFilter || (day.centerName ?? "") === centerFilter;

            const matchTab =
                activeTab === "all" || day.totalStatus === activeTab;

            return matchSearch && matchCenter && matchTab;
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const stats = {
        present: attendanceData.filter((d) => d.totalStatus === "present")
            .length,
        partial: attendanceData.filter((d) => d.totalStatus === "partial")
            .length,
        absent: attendanceData.filter((d) => d.totalStatus === "absent").length,
        late: attendanceData.filter((d) => (d.delayMinutes ?? 0) > 0).length,
    };

    const handleRefresh = async () => {
        try {
            await Promise.resolve(refetchData());
            showToast("تم تحديث سجل الحضور");
        } catch {
            showToast("تعذر تحديث السجل", "error");
        }
    };

    const handleApplyDateFilter = async () => {
        setPage(1);
        try {
            await Promise.resolve(refetchData());
            showToast("تم تطبيق الفترة الزمنية");
        } catch {
            showToast("تعذر تطبيق الفلترة", "error");
        }
    };

    const handleToggleSession = async (dayId: number, sessionId: number) => {
        const key = `${dayId}-${sessionId}`;
        setTogglingKeys((prev) => new Set([...prev, key]));
        try {
            await Promise.resolve(toggleSessionStatus(dayId, sessionId));
            showToast("تم تحديث حالة الجلسة");
        } catch {
            showToast("تعذر تحديث حالة الجلسة", "error");
        } finally {
            setTogglingKeys((prev) => {
                const s = new Set(prev);
                s.delete(key);
                return s;
            });
        }
    };

    const toggleDetail = (id: number) => {
        setExpandedIds((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const resetFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setCenterFilter("");
        setActiveTab("all");
        setPage(1);
    };

    const pageRange = (): Array<number | string> => {
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

    if (loading) {
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
                            جاري تحميل سجل الحضور...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-teachers-page" dir="rtl">
                <div className="page-shell">
                    <section className="table-shell">
                        <div className="error-banner">
                            خطأ في تحميل سجل الحضور: {error}
                        </div>
                        <div
                            style={{
                                padding: "0 1.25rem 1.25rem",
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                className="btn primary"
                                onClick={handleRefresh}
                            >
                                <FiRefreshCw size={14} /> إعادة المحاولة
                            </button>
                            <button
                                className="btn secondary"
                                onClick={() => window.location.reload()}
                            >
                                <FiRefreshCw size={14} /> إعادة تحميل الصفحة
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="my-teachers-page" dir="rtl">
            <div className="page-shell">
                <section className="hero-card">
                    <div>
                        <h1 className="hero-title">متبعة حضورك اليومي</h1>
                    </div>
                    <div className="hero-actions">
                        <div
                            className={
                                lastDayToday ? "badge success" : "badge warning"
                            }
                            style={{ marginBottom: 8 }}
                        >
                            {lastDayToday
                                ? "تم تسجيل حضور اليوم"
                                : "آخر سجل ليس لليوم"}
                        </div>

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
                                <FiCalendar />
                            </div>
                            <FiTrendingUp size={13} />
                        </div>
                        <div className="stat-number">{totalDays}</div>
                        <div className="stat-label">إجمالي الأيام</div>
                    </div>

                    <div className="stat-card green">
                        <div className="stat-head">
                            <div className="stat-icon">
                                <FiCheckCircle />
                            </div>
                            <FiTrendingUp size={13} />
                        </div>
                        <div className="stat-number">
                            {formatPercentage(attendancePercentage)}
                        </div>
                        <div className="stat-label">نسبة الالتزام</div>
                    </div>

                    <div className="stat-card blue">
                        <div className="stat-head">
                            <div className="stat-icon">
                                <FiUsers />
                            </div>
                            <FiTrendingUp size={13} />
                        </div>
                        <div className="stat-number">{stats.present}</div>
                        <div className="stat-label">حضور كامل</div>
                    </div>

                    <div className="stat-card orange">
                        <div className="stat-head">
                            <div className="stat-icon">
                                <FiClock />
                            </div>
                            <FiTrendingUp size={13} />
                        </div>
                        <div className="stat-number">{stats.late}</div>
                        <div className="stat-label">أيام بها تأخير</div>
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
                            placeholder="ابحث بالاسم أو التاريخ أو المركز أو الملاحظات..."
                        />
                    </label>

                    <label className="select-field">
                        <FaMosque size={13} />
                        <select
                            value={centerFilter}
                            onChange={(e) => {
                                setCenterFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">كل المراكز</option>
                            {centerOptions.map((center) => (
                                <option key={center} value={center}>
                                    {center}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="select-field">
                        <FiCalendar size={13} />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            style={DATE_INPUT_STYLE}
                        />
                    </label>

                    <label className="select-field">
                        <FiCalendar size={13} />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            style={DATE_INPUT_STYLE}
                        />
                    </label>

                    <div className="toolbar">
                        <button
                            className="btn primary"
                            onClick={handleApplyDateFilter}
                        >
                            <FiRefreshCw size={14} /> تطبيق
                        </button>
                        <button
                            className="btn secondary"
                            onClick={resetFilters}
                        >
                            <FiX size={14} /> إعادة ضبط
                        </button>
                    </div>
                </section>

                <section className="table-shell">
                    <div className="table-head">
                        <div>
                            <h2 style={{ margin: 0, color: "var(--emerald)" }}>
                                كشف الحضور اليومي
                            </h2>
                            <div className="muted">
                                عرض {filtered.length} سجل
                                {loading ? " – جاري التحديث..." : ""}
                            </div>
                        </div>

                        <div className="tabs">
                            {(
                                [
                                    "all",
                                    "present",
                                    "partial",
                                    "absent",
                                ] as AttendanceTab[]
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
                                            present: "حاضر كامل",
                                            partial: "جزئي",
                                            absent: "غائب",
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
                                    <th style={TH}>التاريخ</th>
                                    <th style={TH}>الحالة / الجلسات</th>
                                    <th style={TH}>المركز</th>
                                    <th style={TH}>التأخير</th>
                                    <th style={TH}>الحالة الإجمالية</th>
                                    <th style={TH}>الإجراءات</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pageItems.length > 0 ? (
                                    pageItems.map((day, idx) => {
                                        const statusMeta =
                                            STATUS_META[day.totalStatus];
                                        const isExpanded = expandedIds.has(
                                            day.id,
                                        );
                                        const sessions =
                                            renderDayStatusAsSession(day);
                                        const previewSessions = sessions.slice(
                                            0,
                                            2,
                                        );

                                        return (
                                            <React.Fragment key={day.id}>
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
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 10,
                                                            }}
                                                        >
                                                            <AvatarInitials
                                                                name={
                                                                    day.teacherName ??
                                                                    "غير محدد"
                                                                }
                                                                idx={
                                                                    (page - 1) *
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
                                                                    {day.teacherName ??
                                                                        "غير محدد"}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            ".73rem",
                                                                        color: "var(--color-text-secondary)",
                                                                    }}
                                                                >
                                                                    {day.dayName ||
                                                                        getDayName(
                                                                            day.date,
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td style={TD}>
                                                        <div
                                                            style={{
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {day.date}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    ".73rem",
                                                                color: "var(--color-text-secondary)",
                                                            }}
                                                        >
                                                            {day.checkinTime
                                                                ? `دخول: ${formatTimeTo12Hour(day.checkinTime)}`
                                                                : "لا يوجد وقت دخول"}
                                                        </div>
                                                    </td>

                                                    <td style={TD}>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexWrap:
                                                                    "wrap",
                                                                gap: 6,
                                                            }}
                                                        >
                                                            {previewSessions.map(
                                                                (session) => {
                                                                    const key = `${day.id}-${session.id}`;
                                                                    return (
                                                                        <button
                                                                            key={
                                                                                session.id
                                                                            }
                                                                            type="button"
                                                                            style={{
                                                                                ...getSessionStyle(
                                                                                    session.status,
                                                                                ),
                                                                                display:
                                                                                    "inline-flex",
                                                                                alignItems:
                                                                                    "center",
                                                                                gap: 6,
                                                                                padding:
                                                                                    "4px 8px",
                                                                                borderRadius: 999,
                                                                                fontSize: 12,
                                                                                cursor: "pointer",
                                                                            }}
                                                                            onClick={() =>
                                                                                handleToggleSession(
                                                                                    day.id,
                                                                                    session.id,
                                                                                )
                                                                            }
                                                                            disabled={togglingKeys.has(
                                                                                key,
                                                                            )}
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    session.time
                                                                                }
                                                                            </span>
                                                                            {togglingKeys.has(
                                                                                key,
                                                                            ) ? (
                                                                                <FiRefreshCw
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                    style={{
                                                                                        animation:
                                                                                            "spin 1s linear infinite",
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                getSessionStatusIcon(
                                                                                    session.status,
                                                                                )
                                                                            )}
                                                                        </button>
                                                                    );
                                                                },
                                                            )}

                                                            {sessions.length >
                                                                2 && (
                                                                <span
                                                                    style={{
                                                                        fontSize: 12,
                                                                        color: "var(--color-text-secondary)",
                                                                        alignSelf:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    +
                                                                    {sessions.length -
                                                                        2}
                                                                </span>
                                                            )}
                                                        </div>
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
                                                            {day.centerName ||
                                                                "غير محدد"}
                                                        </span>
                                                    </td>

                                                    <td style={TD}>
                                                        {day.delayMinutes &&
                                                        day.delayMinutes > 0 ? (
                                                            <span
                                                                className="badge danger"
                                                                style={{
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                {
                                                                    day.delayMinutes
                                                                }{" "}
                                                                دقيقة
                                                            </span>
                                                        ) : (
                                                            <span
                                                                style={{
                                                                    color: "var(--color-text-secondary)",
                                                                    fontSize:
                                                                        ".78rem",
                                                                }}
                                                            >
                                                                بدون تأخير
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td style={TD}>
                                                        <span
                                                            className={
                                                                statusMeta.className
                                                            }
                                                        >
                                                            {statusMeta.icon}{" "}
                                                            {statusMeta.label}
                                                        </span>
                                                    </td>

                                                    <td style={TD}>
                                                        <div className="td-actions">
                                                            <button
                                                                className="btn secondary"
                                                                style={{
                                                                    fontSize:
                                                                        ".75rem",
                                                                    padding:
                                                                        "5px 10px",
                                                                }}
                                                                onClick={() =>
                                                                    toggleDetail(
                                                                        day.id,
                                                                    )
                                                                }
                                                            >
                                                                <FiEye
                                                                    size={12}
                                                                />
                                                                {isExpanded
                                                                    ? "إخفاء"
                                                                    : "التفاصيل"}
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
                                                                    marginBottom:
                                                                        day.notes
                                                                            ? "1rem"
                                                                            : 0,
                                                                }}
                                                            >
                                                                <DetailItem
                                                                    icon={
                                                                        <FaChalkboardTeacher
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="الموظف"
                                                                    value={
                                                                        day.teacherName ??
                                                                        "غير محدد"
                                                                    }
                                                                />
                                                                <DetailItem
                                                                    icon={
                                                                        <FiCalendar
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="التاريخ"
                                                                    value={
                                                                        day.date
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
                                                                    label="وصف الحضور"
                                                                    value={getAttendanceStatusText(
                                                                        day,
                                                                    )}
                                                                />
                                                                <DetailItem
                                                                    icon={
                                                                        <FiClock
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="وقت الدخول"
                                                                    value={
                                                                        day.checkinTime
                                                                            ? formatTimeTo12Hour(
                                                                                  day.checkinTime,
                                                                              )
                                                                            : extractTimeFromNotes(
                                                                                  day.notes,
                                                                              ) ||
                                                                              "غير متوفر"
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
                                                                    label="المركز"
                                                                    value={
                                                                        day.centerName ||
                                                                        "غير محدد"
                                                                    }
                                                                />
                                                                <DetailItem
                                                                    icon={
                                                                        <FiTrendingUp
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="الحالة الإجمالية"
                                                                    value={getTotalStatusText(
                                                                        day.totalStatus,
                                                                    )}
                                                                />
                                                                <DetailItem
                                                                    icon={
                                                                        <FiUsers
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="عدد الجلسات"
                                                                    value={`${sessions.length} جلسة`}
                                                                />
                                                                <DetailItem
                                                                    icon={
                                                                        <FiClock
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    }
                                                                    label="التأخير"
                                                                    value={
                                                                        day.delayMinutes &&
                                                                        day.delayMinutes >
                                                                            0
                                                                            ? `${day.delayMinutes} دقيقة`
                                                                            : "لا يوجد"
                                                                    }
                                                                />
                                                            </div>

                                                            <div
                                                                style={{
                                                                    marginBottom:
                                                                        day.notes
                                                                            ? "1rem"
                                                                            : 0,
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            ".8rem",
                                                                        fontWeight: 600,
                                                                        marginBottom: 8,
                                                                        color: "var(--emerald)",
                                                                    }}
                                                                >
                                                                    الجلسات
                                                                    اليومية
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        flexWrap:
                                                                            "wrap",
                                                                        gap: 8,
                                                                    }}
                                                                >
                                                                    {sessions.map(
                                                                        (
                                                                            session,
                                                                        ) => {
                                                                            const key = `${day.id}-${session.id}`;
                                                                            return (
                                                                                <button
                                                                                    key={
                                                                                        session.id
                                                                                    }
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        handleToggleSession(
                                                                                            day.id,
                                                                                            session.id,
                                                                                        )
                                                                                    }
                                                                                    disabled={togglingKeys.has(
                                                                                        key,
                                                                                    )}
                                                                                    style={{
                                                                                        ...getSessionStyle(
                                                                                            session.status,
                                                                                        ),
                                                                                        display:
                                                                                            "inline-flex",
                                                                                        alignItems:
                                                                                            "center",
                                                                                        gap: 8,
                                                                                        padding:
                                                                                            "8px 12px",
                                                                                        borderRadius: 12,
                                                                                        cursor: "pointer",
                                                                                        fontSize:
                                                                                            ".78rem",
                                                                                    }}
                                                                                >
                                                                                    <span>
                                                                                        {
                                                                                            session.time
                                                                                        }
                                                                                    </span>
                                                                                    {togglingKeys.has(
                                                                                        key,
                                                                                    ) ? (
                                                                                        <FiRefreshCw
                                                                                            size={
                                                                                                12
                                                                                            }
                                                                                            style={{
                                                                                                animation:
                                                                                                    "spin 1s linear infinite",
                                                                                            }}
                                                                                        />
                                                                                    ) : (
                                                                                        getSessionStatusIcon(
                                                                                            session.status,
                                                                                        )
                                                                                    )}
                                                                                </button>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {day.notes && (
                                                                <div
                                                                    style={{
                                                                        padding:
                                                                            "12px 14px",
                                                                        background:
                                                                            "#fff",
                                                                        border: "0.5px solid var(--color-border-tertiary)",
                                                                        borderRadius: 12,
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                ".82rem",
                                                                            fontWeight: 600,
                                                                            marginBottom: 6,
                                                                            color: "var(--emerald)",
                                                                        }}
                                                                    >
                                                                        ملاحظات
                                                                        اليوم
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                ".8rem",
                                                                            lineHeight: 1.8,
                                                                            color: "var(--color-text-secondary)",
                                                                            whiteSpace:
                                                                                "pre-wrap",
                                                                        }}
                                                                    >
                                                                        {
                                                                            day.notes
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
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
                                                centerFilter ||
                                                activeTab !== "all"
                                                    ? "لا توجد نتائج مطابقة للفلاتر الحالية."
                                                    : "لا توجد بيانات حضور في هذه الفترة."}
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

const DATE_INPUT_STYLE: React.CSSProperties = {
    border: 0,
    outline: 0,
    background: "transparent",
    width: 130,
    fontSize: ".82rem",
    color: "var(--color-text-primary)",
};

export default TeacherAttendance;
