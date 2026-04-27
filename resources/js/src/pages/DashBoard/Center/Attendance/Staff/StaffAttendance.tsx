// StaffAttendance.tsx
import { useState } from "react";
import toast from "react-hot-toast";
import { FiFileText, FiRefreshCw } from "react-icons/fi";
import { CiCircleCheck, CiWarning, CiCircleRemove } from "react-icons/ci";
import {
    BsPersonCheck,
    BsPersonX,
    BsPersonExclamation,
    BsBarChart,
    BsClock,
    BsClipboardData,
    BsBuilding,
} from "react-icons/bs";
import {
    useStaffAttendance,
    StaffAttendance as StaffAttendanceType,
} from "./hooks/useStaffAttendance";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
    present: {
        label: "حاضر",
        bg: "#dcfce7",
        color: "#15803d",
        border: "#bbf7d0",
    },
    late: {
        label: "متأخر",
        bg: "#fef9c3",
        color: "#a16207",
        border: "#fde68a",
    },
    absent: {
        label: "غائب",
        bg: "#fee2e2",
        color: "#b91c1c",
        border: "#fecaca",
    },
} as const;

const ROLE_CFG: Record<string, { bg: string; color: string }> = {
    معلم: { bg: "#dcfce7", color: "#15803d" },
    "مشرف تعليمي": { bg: "#dbeafe", color: "#1d4ed8" },
    مدير: { bg: "#ede9fe", color: "#7c3aed" },
};
const roleStyle = (role: string) =>
    ROLE_CFG[role] ?? { bg: "#f1f5f9", color: "#475569" };

const DATE_LABELS = {
    today: "اليومي",
    yesterday: "الأمس",
    week: "الأسبوعي",
    month: "الشهري",
} as const;

// ── Component ─────────────────────────────────────────────────────────────────
const StaffAttendance: React.FC = () => {
    const {
        staff,
        stats,
        loading,
        search,
        dateFilter,
        error,
        isEmpty,
        setSearch,
        setDateFilter,
        fetchAttendance,
        markAttendance,
    } = useStaffAttendance();

    const [markingId, setMarkingId] = useState<number | null>(null);
    const [lateModal, setLateModal] = useState<{ id: number } | null>(null);
    const [lateReason, setLateReason] = useState("");
    const [lateMinutes, setLateMinutes] = useState(15);

    // ── handlers ─────────────────────────────────────────────────────────────
    const handleMark = async (
        id: number,
        status: "present" | "late" | "absent",
        reason?: string,
        minutes?: number,
    ) => {
        setMarkingId(id);
        const ok = await markAttendance(id, status, reason, minutes);
        if (ok) {
            toast.success(
                status === "present"
                    ? "تم تسجيل الحضور"
                    : status === "late"
                      ? "تم تسجيل التأخير"
                      : "تم تسجيل الغياب",
                { duration: 3000, position: "top-right" },
            );
            setTimeout(fetchAttendance, 800);
        } else {
            toast.error("فشل في التحديث - حاول مرة أخرى", {
                duration: 4000,
                position: "top-right",
            });
        }
        setMarkingId(null);
    };

    const handleLateSubmit = async () => {
        if (!lateModal) return;
        setLateModal(null);
        await handleMark(lateModal.id, "late", lateReason, lateMinutes);
        setLateReason("");
        setLateMinutes(15);
    };

    const handleExportPDF = () => {
        toast.loading("جاري إعداد ملف PDF...", { id: "pdf" });
        window.open(
            `/api/v1/attendance/export-pdf?date_filter=${dateFilter}`,
            "_blank",
        );
        setTimeout(() => toast.success("تم فتح الملف!", { id: "pdf" }), 1000);
    };

    // ── error state ───────────────────────────────────────────────────────────
    if (error)
        return (
            <div className="content" id="contentArea">
                <div className="widget">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "48px 24px",
                            color: "#b91c1c",
                            background: "#fee2e2",
                            borderRadius: "12px",
                            margin: "24px",
                        }}
                    >
                        <CiCircleRemove
                            size={48}
                            style={{ marginBottom: 12, opacity: 0.7 }}
                        />
                        <div style={{ fontWeight: 600, marginBottom: "16px" }}>
                            خطأ في تحميل البيانات: {error}
                        </div>
                        <button
                            className="btn bp bsm"
                            onClick={fetchAttendance}
                        >
                            <FiRefreshCw size={14} style={{ marginLeft: 6 }} />
                            إعادة المحاولة
                        </button>
                    </div>
                </div>
            </div>
        );

    // ── main render ───────────────────────────────────────────────────────────
    return (
        <div className="content" id="contentArea">
            <div className="widget">
                {/* ── Header ── */}
                <div className="wh">
                    <div className="wh-l">
                        سجل الحضور {DATE_LABELS[dateFilter]}
                    </div>
                    <div
                        className="flx"
                        style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                        }}
                    >
                        <select
                            value={dateFilter}
                            onChange={(e) =>
                                setDateFilter(e.target.value as any)
                            }
                            className="fi"
                            disabled={loading}
                        >
                            <option value="today">اليوم</option>
                            <option value="yesterday">أمس</option>
                            <option value="week">هذا الأسبوع</option>
                            <option value="month">هذا الشهر</option>
                        </select>
                        <input
                            type="search"
                            placeholder="بحث بالاسم أو الدور أو المركز..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="fi"
                            disabled={loading}
                            style={{ minWidth: "200px" }}
                        />
                        <button
                            onClick={fetchAttendance}
                            className="btn bs bsm"
                            disabled={loading}
                        >
                            <FiRefreshCw size={14} style={{ marginLeft: 6 }} />
                            تحديث
                        </button>
                        <button
                            onClick={handleExportPDF}
                            disabled={loading || staff.length === 0}
                            className="btn bp bsm"
                        >
                            <FiFileText size={14} style={{ marginLeft: 6 }} />
                            PDF
                        </button>
                    </div>
                </div>

                {/* ── Stats Bar ── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(130px,1fr))",
                        gap: "10px",
                        marginBottom: "20px",
                        padding: "24px",
                    }}
                >
                    {[
                        {
                            label: "الإجمالي",
                            value: stats.total,
                            Icon: BsClipboardData,
                            color: "#6366f1",
                            bg: "#eef2ff",
                        },
                        {
                            label: "حاضر",
                            value: stats.present,
                            Icon: BsPersonCheck,
                            color: "#16a34a",
                            bg: "#dcfce7",
                        },
                        {
                            label: "متأخر",
                            value: stats.late,
                            Icon: BsPersonExclamation,
                            color: "#d97706",
                            bg: "#fef9c3",
                        },
                        {
                            label: "غائب",
                            value: stats.absent,
                            Icon: BsPersonX,
                            color: "#dc2626",
                            bg: "#fee2e2",
                        },
                        {
                            label: "نسبة الحضور",
                            value: `${stats.monthlyAttendanceRate}%`,
                            Icon: BsBarChart,
                            color: "#0891b2",
                            bg: "#e0f2fe",
                        },
                        {
                            label: "متوسط التأخير",
                            value: `${stats.avgDelay} د`,
                            Icon: BsClock,
                            color: "#7c3aed",
                            bg: "#ede9fe",
                        },
                    ].map(({ label, value, Icon, color, bg }) => (
                        <div
                            key={label}
                            style={{
                                background: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "14px 16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                            }}
                        >
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 10,
                                    background: bg,
                                    color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Icon size={18} />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: "1.3rem",
                                        fontWeight: 800,
                                        color,
                                        lineHeight: 1,
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
                        </div>
                    ))}
                </div>

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
                                    "",
                                    "الموظف",
                                    "الدور",
                                    "المركز",
                                    "الحالة",
                                    "التأخير",
                                    "الملاحظات",
                                    "الإجراءات",
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
                            {/* Loading Skeleton */}
                            {loading &&
                                [1, 2, 3, 4].map((i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            borderBottom: "1px solid #f1f5f9",
                                        }}
                                    >
                                        {[
                                            50, 160, 90, 110, 80, 70, 130, 110,
                                        ].map((w, j) => (
                                            <td
                                                key={j}
                                                style={{ padding: "14px" }}
                                            >
                                                <div
                                                    style={{
                                                        height: 14,
                                                        width: w,
                                                        borderRadius: 6,
                                                        background:
                                                            "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                                                        backgroundSize:
                                                            "200% 100%",
                                                        animation:
                                                            "shimmer 1.4s infinite",
                                                    }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                            {/* Empty */}
                            {!loading && staff.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        style={{
                                            textAlign: "center",
                                            padding: "56px 0",
                                            color: "#94a3b8",
                                        }}
                                    >
                                        <BsClipboardData
                                            size={48}
                                            style={{
                                                marginBottom: 12,
                                                opacity: 0.4,
                                            }}
                                        />
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                color: "#64748b",
                                                marginBottom: 6,
                                            }}
                                        >
                                            {isEmpty
                                                ? "لا توجد سجلات حضور لهذه الفترة"
                                                : "لا توجد نتائج للبحث"}
                                        </div>
                                        <div style={{ fontSize: "0.85rem" }}>
                                            جرب تغيير الفترة الزمنية أو الفلتر
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Rows */}
                            {!loading &&
                                staff.map((item) => {
                                    const s =
                                        STATUS_CFG[item.status] ??
                                        STATUS_CFG.absent;
                                    const rs = roleStyle(item.role);
                                    const isMarking = markingId === item.id;

                                    return (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                                background: "white",
                                                transition: "background .1s",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#f8fafc")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    "white")
                                            }
                                        >
                                            {/* Avatar */}
                                            <td
                                                style={{
                                                    padding: "12px 14px",
                                                    width: 52,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 38,
                                                        height: 38,
                                                        borderRadius: 10,
                                                        background:
                                                            "linear-gradient(135deg,#6366f1,#4f46e5)",
                                                        color: "white",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontWeight: 800,
                                                        fontSize: "1rem",
                                                    }}
                                                >
                                                    {item.teacher_name.charAt(
                                                        0,
                                                    )}
                                                </div>
                                            </td>

                                            {/* Name + date */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        color: "#1e293b",
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    {item.teacher_name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "#94a3b8",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {item.date}
                                                    {item.checkin_time &&
                                                        ` · ${item.checkin_time}`}
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                <span
                                                    style={{
                                                        background: rs.bg,
                                                        color: rs.color,
                                                        padding: "3px 10px",
                                                        borderRadius: 999,
                                                        fontSize: "0.75rem",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {item.role}
                                                </span>
                                            </td>

                                            {/* Center */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 5,
                                                        background: "#f1f5f9",
                                                        color: "#475569",
                                                        padding: "3px 10px",
                                                        borderRadius: 8,
                                                        fontSize: "0.8rem",
                                                        border: "1px solid #e2e8f0",
                                                    }}
                                                >
                                                    <BsBuilding size={12} />
                                                    {item.center_name}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                <span
                                                    style={{
                                                        background: s.bg,
                                                        color: s.color,
                                                        border: `1px solid ${s.border}`,
                                                        padding: "4px 12px",
                                                        borderRadius: 999,
                                                        fontSize: "0.78rem",
                                                        fontWeight: 700,
                                                        display: "inline-block",
                                                    }}
                                                >
                                                    {s.label}
                                                </span>
                                            </td>

                                            {/* Delay */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                {item.delay_minutes > 0 ? (
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            background:
                                                                "#fef9c3",
                                                            color: "#a16207",
                                                            border: "1px solid #fde68a",
                                                            padding: "3px 10px",
                                                            borderRadius: 999,
                                                            fontSize: "0.78rem",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        <BsClock size={11} />
                                                        {item.delay_minutes} د
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

                                            {/* Notes */}
                                            <td
                                                style={{
                                                    padding: "12px 14px",
                                                    maxWidth: 180,
                                                }}
                                            >
                                                <span
                                                    title={item.notes}
                                                    style={{
                                                        display: "block",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        color: "#64748b",
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    {item.notes || "—"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td
                                                style={{ padding: "12px 14px" }}
                                            >
                                                <div className="td-actions">
                                                    {/* حاضر */}
                                                    <button
                                                        className="btn bp bxs"
                                                        onClick={() =>
                                                            handleMark(
                                                                item.id,
                                                                "present",
                                                            )
                                                        }
                                                        disabled={
                                                            isMarking || loading
                                                        }
                                                        title="تسجيل حاضر"
                                                        style={{
                                                            padding: "5px 10px",
                                                        }}
                                                    >
                                                        {isMarking ? (
                                                            <div
                                                                style={
                                                                    spinnerStyle
                                                                }
                                                            />
                                                        ) : (
                                                            <CiCircleCheck
                                                                size={17}
                                                            />
                                                        )}
                                                    </button>

                                                    {/* متأخر - يفتح modal السبب */}
                                                    <button
                                                        className="btn bs bxs"
                                                        onClick={() => {
                                                            setLateModal({
                                                                id: item.id,
                                                            });
                                                            setLateReason("");
                                                            setLateMinutes(15);
                                                        }}
                                                        disabled={
                                                            isMarking || loading
                                                        }
                                                        title="تسجيل متأخر"
                                                        style={{
                                                            padding: "5px 10px",
                                                        }}
                                                    >
                                                        <CiWarning size={17} />
                                                    </button>

                                                    {/* غائب */}
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() =>
                                                            handleMark(
                                                                item.id,
                                                                "absent",
                                                            )
                                                        }
                                                        disabled={
                                                            isMarking || loading
                                                        }
                                                        title="تسجيل غائب"
                                                        style={{
                                                            padding: "5px 10px",
                                                        }}
                                                    >
                                                        <CiCircleRemove
                                                            size={17}
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
            </div>

            {/* ── Late Reason Modal ── */}
            {lateModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.45)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            borderRadius: 16,
                            padding: 28,
                            width: "100%",
                            maxWidth: 420,
                            boxShadow: "0 20px 60px rgba(0,0,0,.25)",
                        }}
                    >
                        {/* Modal Header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 20,
                            }}
                        >
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 10,
                                    background: "#fef9c3",
                                    color: "#a16207",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <BsClock size={20} />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        fontSize: "1rem",
                                        color: "#1e293b",
                                    }}
                                >
                                    تسجيل تأخير
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "#94a3b8",
                                    }}
                                >
                                    أدخل مدة التأخير وسببه
                                </div>
                            </div>
                        </div>

                        {/* دقائق التأخير */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>
                                مدة التأخير (بالدقائق)
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={120}
                                value={lateMinutes}
                                onChange={(e) =>
                                    setLateMinutes(Number(e.target.value))
                                }
                                style={inputStyle}
                            />
                        </div>

                        {/* سبب التأخير */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>سبب التأخير *</label>
                            <textarea
                                value={lateReason}
                                onChange={(e) => setLateReason(e.target.value)}
                                placeholder="اكتب سبب التأخير هنا..."
                                rows={3}
                                style={{
                                    ...inputStyle,
                                    resize: "vertical",
                                    fontFamily: "inherit",
                                    lineHeight: 1.6,
                                }}
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                className="btn bp bsm"
                                onClick={handleLateSubmit}
                                disabled={!lateReason.trim()}
                                style={{ flex: 1, height: 42, fontWeight: 700 }}
                            >
                                <CiWarning
                                    size={16}
                                    style={{ marginLeft: 6 }}
                                />
                                تسجيل التأخير
                            </button>
                            <button
                                className="btn bs bsm"
                                onClick={() => setLateModal(null)}
                                style={{ flex: 1, height: 42 }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const spinnerStyle: React.CSSProperties = {
    width: 15,
    height: 15,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    color: "#475569",
    fontWeight: 600,
    marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: "0.9rem",
    outline: "none",
    direction: "rtl",
    background: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box",
};

export default StaffAttendance;
