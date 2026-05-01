// WorkSchedulePage.tsx — نسخة مكتملة بتصميم جديد + وضعان عرض + ميزات إضافية
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
    FiPlus,
    FiTrash2,
    FiClock,
    FiCalendar,
    FiSun,
    FiRefreshCw,
    FiGrid,
    FiList,
    FiDownload,
    FiSearch,
    FiX,
    FiEdit2,
    FiInfo,
    FiUsers,
    FiCheck,
} from "react-icons/fi";
import {
    BsPersonCheck,
    BsClipboardData,
    BsBuilding,
    BsBarChart,
    BsClock,
    BsCalendarCheck,
} from "react-icons/bs";
import { FaMosque } from "react-icons/fa";

/* ══════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════ */
interface Schedule {
    id: number;
    teacher_id: number | null;
    teacher_name: string;
    work_start_time: string;
    allowed_late_minutes: number;
    label: string;
}
interface OffDay {
    id: number;
    teacher_id: number | null;
    teacher_name: string;
    day_of_week: number;
    day_name: string;
}
interface Holiday {
    id: number;
    teacher_id: number | null;
    teacher_name: string;
    holiday_date: string;
    reason: string;
    type: string;
}
interface Teacher {
    id: number;
    name: string;
}
type TabKey = "schedules" | "offdays" | "holidays";
type ViewMode = "table" | "cards";

/* ══════════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════════ */
const DAY_NAMES = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
];

const TABS: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    accent: string;
    bg: string;
}[] = [
    {
        key: "schedules",
        label: "جداول العمل",
        icon: <FiClock size={15} />,
        accent: "#0284c7",
        bg: "#e0f2fe",
    },
    {
        key: "offdays",
        label: "أيام الراحة",
        icon: <FiSun size={15} />,
        accent: "#7c3aed",
        bg: "#ede9fe",
    },
    {
        key: "holidays",
        label: "الإجازات",
        icon: <FiCalendar size={15} />,
        accent: "#059669",
        bg: "#dcfce7",
    },
];

const HOLIDAY_TYPES: Record<
    string,
    { label: string; bg: string; color: string }
> = {
    full_day: { label: "يوم كامل", bg: "#e0f2fe", color: "#0369a1" },
    weekend: { label: "نهاية أسبوع", bg: "#ede9fe", color: "#7c3aed" },
    custom: { label: "مخصصة", bg: "#fef9c3", color: "#a16207" },
};

const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

/* ══════════════════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════════════════ */
const Avatar = ({ name, idx }: { name: string; idx: number }) => {
    const av = AV_COLORS[idx % AV_COLORS.length];
    const initials =
        name === "الكل (افتراضي)"
            ? "كل"
            : name
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
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
                fontFamily: "'Tajawal',sans-serif",
            }}
        >
            {initials}
        </div>
    );
};

const Btn = ({
    bg,
    color,
    border = "none",
    disabled = false,
    onClick,
    children,
    style: extra = {},
}: {
    bg: string;
    color: string;
    border?: string;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 10,
            border,
            background: bg,
            color,
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Tajawal',sans-serif",
            opacity: disabled ? 0.6 : 1,
            transition: "opacity .15s",
            whiteSpace: "nowrap",
            ...extra,
        }}
    >
        {children}
    </button>
);

const StatCard = ({
    label,
    value,
    icon,
    accent,
    bg,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    accent: string;
    bg: string;
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: 16,
            padding: "18px 20px",
            boxShadow: "0 2px 12px #0001",
            borderTop: `4px solid ${accent}`,
            display: "flex",
            alignItems: "center",
            gap: 14,
        }}
    >
        <div
            style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: bg,
                color: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
            }}
        >
            {icon}
        </div>
        <div>
            <div
                style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: accent,
                    lineHeight: 1,
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 4,
                    fontWeight: 600,
                }}
            >
                {label}
            </div>
        </div>
    </div>
);

const Toast = ({
    msg,
    onClose,
}: {
    msg: { text: string; ok: boolean };
    onClose: () => void;
}) => (
    <div
        style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: msg.ok ? "#1e293b" : "#7f1d1d",
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
        {msg.ok ? <FiCheck size={15} /> : <FiX size={15} />}
        <span>{msg.text}</span>
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

const ConfirmModal = ({
    text,
    onConfirm,
    onCancel,
}: {
    text: string;
    onConfirm: () => void;
    onCancel: () => void;
}) => (
    <div
        style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
        }}
    >
        <div
            style={{
                background: "#fff",
                borderRadius: 20,
                padding: "28px 32px",
                maxWidth: 380,
                width: "90%",
                fontFamily: "'Tajawal',sans-serif",
                direction: "rtl",
            }}
        >
            <div style={{ fontSize: 18, marginBottom: 8 }}>⚠️</div>
            <div
                style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#1e293b",
                    marginBottom: 20,
                }}
            >
                {text}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
                <Btn
                    bg="#dc2626"
                    color="#fff"
                    onClick={onConfirm}
                    style={{ flex: 1, justifyContent: "center" }}
                >
                    تأكيد الحذف
                </Btn>
                <Btn
                    bg="#f8fafc"
                    color="#475569"
                    border="1px solid #e2e8f0"
                    onClick={onCancel}
                    style={{ flex: 1, justifyContent: "center" }}
                >
                    إلغاء
                </Btn>
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════
   Form Field helpers
══════════════════════════════════════════════════════════ */
const inputSt: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 13,
    outline: "none",
    direction: "rtl",
    background: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box",
    fontFamily: "'Tajawal',sans-serif",
};
const Label = ({ children }: { children: React.ReactNode }) => (
    <label
        style={{
            display: "block",
            fontSize: 11,
            color: "#64748b",
            fontWeight: 700,
            marginBottom: 6,
        }}
    >
        {children}
    </label>
);

/* ══════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════ */
const WorkSchedulePage: React.FC = () => {
    const [tab, setTab] = useState<TabKey>("schedules");
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [offDays, setOffDays] = useState<OffDay[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [confirm, setConfirm] = useState<{
        text: string;
        cb: () => void;
    } | null>(null);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(true);

    const [form, setForm] = useState({
        teacher_id: "",
        work_start_time: "08:00",
        allowed_late_minutes: "15",
        label: "",
        day_of_week: "5",
        holiday_date: "",
        reason: "",
        type: "full_day",
    });
    const f = (k: keyof typeof form, v: string) =>
        setForm((p) => ({ ...p, [k]: v }));

    /* ── load ── */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [sch, off, hol, tch] = await Promise.all([
                axios.get("/api/v1/schedules"),
                axios.get("/api/v1/schedules/off-days"),
                axios.get("/api/v1/schedules/holidays"),
                axios.get("/api/v1/teachers"),
            ]);
            setSchedules(sch.data.data ?? []);
            setOffDays(off.data.data ?? []);
            setHolidays(hol.data.data ?? []);
            setTeachers(tch.data.data ?? []);
        } catch {
            showToast("فشل في تحميل البيانات", false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const showToast = (text: string, ok = true) => {
        setMsg({ text, ok });
        setTimeout(() => setMsg(null), 3500);
    };

    /* ── saves ── */
    const saveSchedule = async () => {
        try {
            await axios.post("/api/v1/schedules", {
                teacher_id: form.teacher_id || null,
                work_start_time: form.work_start_time,
                allowed_late_minutes: parseInt(form.allowed_late_minutes),
                label: form.label || null,
            });
            showToast("تم حفظ جدول العمل بنجاح ✓");
            load();
        } catch (e: any) {
            showToast(e.response?.data?.message ?? "فشل الحفظ", false);
        }
    };

    const saveOffDay = async () => {
        try {
            await axios.post("/api/v1/schedules/off-days", {
                teacher_id: form.teacher_id || null,
                day_of_week: parseInt(form.day_of_week),
            });
            showToast("تم إضافة يوم الراحة بنجاح ✓");
            load();
        } catch (e: any) {
            showToast(e.response?.data?.message ?? "فشل الحفظ", false);
        }
    };

    const saveHoliday = async () => {
        if (!form.holiday_date) {
            showToast("يرجى اختيار تاريخ الإجازة", false);
            return;
        }
        try {
            await axios.post("/api/v1/schedules/holidays", {
                teacher_id: form.teacher_id || null,
                holiday_date: form.holiday_date,
                reason: form.reason || null,
                type: form.type,
            });
            showToast("تم إضافة الإجازة بنجاح ✓");
            load();
        } catch (e: any) {
            const errors = e.response?.data?.errors;
            showToast(
                errors
                    ? Object.values(errors).flat().join(" - ")
                    : (e.response?.data?.message ?? "فشل الحفظ"),
                false,
            );
        }
    };

    /* ── deletes ── */
    const askDelete = (text: string, cb: () => void) =>
        setConfirm({ text, cb });

    const deleteSchedule = (id: number) =>
        askDelete("هل تريد حذف هذا الجدول؟", async () => {
            setConfirm(null);
            try {
                await axios.delete(`/api/v1/schedules/${id}`);
                showToast("تم الحذف");
                load();
            } catch {
                showToast("فشل الحذف", false);
            }
        });
    const deleteOffDay = (id: number) =>
        askDelete("هل تريد حذف يوم الراحة؟", async () => {
            setConfirm(null);
            try {
                await axios.delete(`/api/v1/schedules/off-days/${id}`);
                showToast("تم الحذف");
                load();
            } catch {
                showToast("فشل الحذف", false);
            }
        });
    const deleteHoliday = (id: number) =>
        askDelete("هل تريد حذف هذه الإجازة؟", async () => {
            setConfirm(null);
            try {
                await axios.delete(`/api/v1/schedules/holidays/${id}`);
                showToast("تم الحذف");
                load();
            } catch {
                showToast("فشل الحذف", false);
            }
        });

    /* ── export CSV ── */
    const exportCSV = () => {
        const now = tab;
        let rows: string[][] = [];
        let headers: string[] = [];
        if (now === "schedules") {
            headers = ["المعلم", "وقت البدء", "التأخير المسموح", "الاسم"];
            rows = schedules.map((s) => [
                s.teacher_name,
                s.work_start_time,
                `${s.allowed_late_minutes} دقيقة`,
                s.label || "—",
            ]);
        } else if (now === "offdays") {
            headers = ["المعلم", "اليوم"];
            rows = offDays.map((d) => [d.teacher_name, d.day_name]);
        } else {
            headers = ["المعلم", "التاريخ", "النوع", "السبب"];
            rows = holidays.map((h) => [
                h.teacher_name,
                h.holiday_date,
                HOLIDAY_TYPES[h.type]?.label || h.type,
                h.reason || "—",
            ]);
        }
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${now}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("تم تصدير الملف بنجاح ✓");
    };

    /* ── filtered data ── */
    const q = search.toLowerCase();
    const filteredSchedules = schedules.filter(
        (s) => !q || s.teacher_name.includes(q) || (s.label || "").includes(q),
    );
    const filteredOffDays = offDays.filter(
        (d) => !q || d.teacher_name.includes(q) || d.day_name.includes(q),
    );
    const filteredHolidays = holidays.filter(
        (h) =>
            !q ||
            h.teacher_name.includes(q) ||
            h.holiday_date.includes(q) ||
            (h.reason || "").includes(q),
    );

    /* ── stats ── */
    const stats = {
        schedules: schedules.length,
        offDays: offDays.length,
        holidays: holidays.length,
        teachers: teachers.length,
        globalSchedules: schedules.filter((s) => !s.teacher_id).length,
        upcomingHolidays: holidays.filter(
            (h) => h.holiday_date >= new Date().toISOString().slice(0, 10),
        ).length,
    };

    /* ── shared teacher select ── */
    const teacherSelect = (
        <select
            value={form.teacher_id}
            onChange={(e) => f("teacher_id", e.target.value)}
            style={inputSt}
        >
            <option value="">الكل (افتراضي للمجمع)</option>
            {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                    {t.name}
                </option>
            ))}
        </select>
    );

    /* ── style tokens ── */
    const TH: React.CSSProperties = {
        padding: "11px 14px",
        textAlign: "right",
        color: "#64748b",
        fontWeight: 700,
        fontSize: 11,
        whiteSpace: "nowrap",
        borderBottom: "1px solid #f1f5f9",
        background: "#f8fafc",
    };
    const TD: React.CSSProperties = {
        padding: "12px 14px",
        borderBottom: "1px solid #f8fafc",
        verticalAlign: "middle",
        fontSize: 13,
        color: "#1e293b",
    };

    const currentTab = TABS.find((t) => t.key === tab)!;

    /* ══════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════ */
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
            {/* ── Hero Header ── */}
            <div
                style={{
                    background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                    borderRadius: 24,
                    padding: "30px 36px",
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
                        pointerEvents: "none",
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
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>
                        إدارة جداول العمل والإجازات
                    </h1>
                    <p
                        style={{
                            margin: "6px 0 0",
                            color: "#94a3b8",
                            fontSize: 13,
                        }}
                    >
                        ضبط أوقات الدوام · أيام الراحة الأسبوعية · الإجازات
                        الرسمية والمخصصة لكل معلم
                    </p>
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            marginTop: 18,
                            flexWrap: "wrap",
                        }}
                    >
                        <Btn
                            bg="#ffffff22"
                            color="#fff"
                            border="1px solid #ffffff33"
                            onClick={load}
                            disabled={loading}
                        >
                            <FiRefreshCw
                                size={13}
                                style={{
                                    animation: loading
                                        ? "ws-spin 1s linear infinite"
                                        : "none",
                                }}
                            />{" "}
                            تحديث
                        </Btn>
                        <Btn
                            bg="#ffffff22"
                            color="#fff"
                            border="1px solid #ffffff33"
                            onClick={exportCSV}
                        >
                            <FiDownload size={13} /> تصدير CSV
                        </Btn>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                    gap: 14,
                    marginBottom: 24,
                }}
            >
                <StatCard
                    label="المعلمون"
                    value={stats.teachers}
                    icon={<FiUsers size={20} />}
                    accent="#1e293b"
                    bg="#f1f5f9"
                />
                <StatCard
                    label="جداول العمل"
                    value={stats.schedules}
                    icon={<BsClock size={20} />}
                    accent="#0284c7"
                    bg="#e0f2fe"
                />
                <StatCard
                    label="جداول مجمع"
                    value={stats.globalSchedules}
                    icon={<BsBuilding size={20} />}
                    accent="#7c3aed"
                    bg="#ede9fe"
                />
                <StatCard
                    label="أيام الراحة"
                    value={stats.offDays}
                    icon={<FiSun size={20} />}
                    accent="#d97706"
                    bg="#fef9c3"
                />
                <StatCard
                    label="إجازات مسجّلة"
                    value={stats.holidays}
                    icon={<BsCalendarCheck size={20} />}
                    accent="#059669"
                    bg="#dcfce7"
                />
                <StatCard
                    label="إجازات قادمة"
                    value={stats.upcomingHolidays}
                    icon={<FiCalendar size={20} />}
                    accent="#dc2626"
                    bg="#fee2e2"
                />
            </div>

            {/* ── Filter + View Toggle Bar ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 20,
                    boxShadow: "0 2px 10px #0001",
                    display: "flex",
                    gap: 12,
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
                        minWidth: 180,
                        border: "1px solid #e2e8f0",
                    }}
                >
                    <FiSearch size={14} color="#94a3b8" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="بحث في القائمة الحالية..."
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

                {/* View mode */}
                <div
                    style={{
                        display: "flex",
                        gap: 4,
                        background: "#f8fafc",
                        borderRadius: 10,
                        padding: 4,
                    }}
                >
                    {(
                        [
                            ["table", "جدول"],
                            ["cards", "بطاقات"],
                        ] as [ViewMode, string][]
                    ).map(([v, l]) => (
                        <button
                            key={v}
                            onClick={() => setViewMode(v)}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 700,
                                fontSize: 12,
                                fontFamily: "inherit",
                                background:
                                    viewMode === v ? "#1e293b" : "transparent",
                                color: viewMode === v ? "#fff" : "#64748b",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "all .15s",
                            }}
                        >
                            {v === "table" ? (
                                <FiList size={13} />
                            ) : (
                                <FiGrid size={13} />
                            )}
                            {l}
                        </button>
                    ))}
                </div>

                {/* Form toggle */}
                <Btn
                    bg={showForm ? "#1e293b" : "#f8fafc"}
                    color={showForm ? "#fff" : "#475569"}
                    border="1px solid #e2e8f0"
                    onClick={() => setShowForm((v) => !v)}
                >
                    <FiPlus size={13} />{" "}
                    {showForm ? "إخفاء النموذج" : "إضافة جديد"}
                </Btn>
            </div>

            {/* ── Tabs ── */}
            <div
                style={{
                    display: "flex",
                    gap: 6,
                    marginBottom: 20,
                    background: "#fff",
                    borderRadius: 16,
                    padding: 8,
                    boxShadow: "0 2px 10px #0001",
                    flexWrap: "wrap",
                }}
            >
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            padding: "10px 22px",
                            borderRadius: 12,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 13,
                            fontFamily: "inherit",
                            background:
                                tab === t.key ? t.accent : "transparent",
                            color: tab === t.key ? "#fff" : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all .15s",
                            flex: 1,
                            justifyContent: "center",
                        }}
                    >
                        {t.icon}
                        {t.label}
                        <span
                            style={{
                                background:
                                    tab === t.key
                                        ? "rgba(255,255,255,.25)"
                                        : t.bg,
                                color: tab === t.key ? "#fff" : t.accent,
                                borderRadius: 20,
                                padding: "1px 8px",
                                fontSize: 11,
                                fontWeight: 900,
                            }}
                        >
                            {t.key === "schedules"
                                ? schedules.length
                                : t.key === "offdays"
                                  ? offDays.length
                                  : holidays.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "50px 20px",
                        color: "#94a3b8",
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            border: "3px solid #e2e8f0",
                            borderTop: "3px solid #0284c7",
                            borderRadius: "50%",
                            animation: "ws-spin 1s linear infinite",
                            margin: "0 auto 12px",
                        }}
                    />
                    <div style={{ fontSize: 14 }}>جارٍ تحميل البيانات...</div>
                </div>
            )}

            {!loading && (
                <>
                    {/* ══════════════════════════════════════
                        TAB: جداول العمل
                    ══════════════════════════════════════ */}
                    {tab === "schedules" && (
                        <>
                            {/* Form */}
                            {showForm && (
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: 16,
                                        padding: "20px 24px",
                                        marginBottom: 20,
                                        boxShadow: "0 2px 10px #0001",
                                        borderRight: "4px solid #0284c7",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            marginBottom: 18,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: 10,
                                                background: "#e0f2fe",
                                                color: "#0284c7",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 18,
                                            }}
                                        >
                                            <FiClock />
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: 900,
                                                fontSize: 15,
                                                color: "#1e293b",
                                            }}
                                        >
                                            إضافة جدول عمل جديد
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(auto-fill,minmax(200px,1fr))",
                                            gap: 14,
                                            marginBottom: 16,
                                        }}
                                    >
                                        <div>
                                            <Label>
                                                المعلم (فارغ = للمجمع كله)
                                            </Label>
                                            {teacherSelect}
                                        </div>
                                        <div>
                                            <Label>وقت بدء العمل</Label>
                                            <input
                                                type="time"
                                                value={form.work_start_time}
                                                onChange={(e) =>
                                                    f(
                                                        "work_start_time",
                                                        e.target.value,
                                                    )
                                                }
                                                style={inputSt}
                                            />
                                        </div>
                                        <div>
                                            <Label>
                                                دقائق التأخير المسموحة
                                            </Label>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 6,
                                                    marginBottom: 6,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                {[5, 10, 15, 20, 30].map(
                                                    (m) => (
                                                        <button
                                                            key={m}
                                                            onClick={() =>
                                                                f(
                                                                    "allowed_late_minutes",
                                                                    String(m),
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    "4px 12px",
                                                                borderRadius: 8,
                                                                border: `1px solid ${form.allowed_late_minutes === String(m) ? "#0284c7" : "#e2e8f0"}`,
                                                                background:
                                                                    form.allowed_late_minutes ===
                                                                    String(m)
                                                                        ? "#e0f2fe"
                                                                        : "#f8fafc",
                                                                color:
                                                                    form.allowed_late_minutes ===
                                                                    String(m)
                                                                        ? "#0369a1"
                                                                        : "#64748b",
                                                                cursor: "pointer",
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                fontFamily:
                                                                    "inherit",
                                                            }}
                                                        >
                                                            {m}د
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                min={0}
                                                max={120}
                                                value={
                                                    form.allowed_late_minutes
                                                }
                                                onChange={(e) =>
                                                    f(
                                                        "allowed_late_minutes",
                                                        e.target.value,
                                                    )
                                                }
                                                style={inputSt}
                                                placeholder="أو اكتب"
                                            />
                                        </div>
                                        <div>
                                            <Label>اسم الجدول (اختياري)</Label>
                                            <input
                                                type="text"
                                                value={form.label}
                                                placeholder="مثال: جدول الصباح"
                                                onChange={(e) =>
                                                    f("label", e.target.value)
                                                }
                                                style={inputSt}
                                            />
                                        </div>
                                    </div>
                                    <Btn
                                        bg="#0284c7"
                                        color="#fff"
                                        onClick={saveSchedule}
                                    >
                                        <FiPlus size={14} /> حفظ الجدول
                                    </Btn>
                                </div>
                            )}

                            {/* Content */}
                            {viewMode === "table" ? (
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: 20,
                                        overflow: "hidden",
                                        boxShadow: "0 2px 16px #0001",
                                    }}
                                >
                                    <div style={{ overflowX: "auto" }}>
                                        <table
                                            style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                            }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th style={TH}></th>
                                                    <th style={TH}>المعلم</th>
                                                    <th style={TH}>
                                                        وقت البدء
                                                    </th>
                                                    <th style={TH}>
                                                        التأخير المسموح
                                                    </th>
                                                    <th style={TH}>الاسم</th>
                                                    <th style={TH}>النطاق</th>
                                                    <th
                                                        style={{
                                                            ...TH,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        حذف
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredSchedules.length ===
                                                0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={7}
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                                padding:
                                                                    "50px 20px",
                                                                color: "#94a3b8",
                                                            }}
                                                        >
                                                            لا توجد جداول مطابقة
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredSchedules.map(
                                                        (s, i) => (
                                                            <tr
                                                                key={s.id}
                                                                style={{
                                                                    borderBottom:
                                                                        "1px solid #f8fafc",
                                                                    transition:
                                                                        "background .12s",
                                                                }}
                                                                onMouseEnter={(
                                                                    e,
                                                                ) =>
                                                                    (e.currentTarget.style.background =
                                                                        "#f8fafc")
                                                                }
                                                                onMouseLeave={(
                                                                    e,
                                                                ) =>
                                                                    (e.currentTarget.style.background =
                                                                        "#fff")
                                                                }
                                                            >
                                                                <td
                                                                    style={{
                                                                        ...TD,
                                                                        width: 52,
                                                                    }}
                                                                >
                                                                    <Avatar
                                                                        name={
                                                                            s.teacher_name
                                                                        }
                                                                        idx={i}
                                                                    />
                                                                </td>
                                                                <td style={TD}>
                                                                    <div
                                                                        style={{
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        {
                                                                            s.teacher_name
                                                                        }
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
                                                                            background:
                                                                                "#e0f2fe",
                                                                            color: "#0369a1",
                                                                            padding:
                                                                                "4px 10px",
                                                                            borderRadius: 20,
                                                                            fontSize: 11,
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        <FiClock
                                                                            size={
                                                                                11
                                                                            }
                                                                        />
                                                                        {
                                                                            s.work_start_time
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td style={TD}>
                                                                    <span
                                                                        style={{
                                                                            background:
                                                                                "#fef9c3",
                                                                            color: "#a16207",
                                                                            padding:
                                                                                "3px 10px",
                                                                            borderRadius: 20,
                                                                            fontSize: 11,
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        {
                                                                            s.allowed_late_minutes
                                                                        }{" "}
                                                                        دقيقة
                                                                    </span>
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        ...TD,
                                                                        color: "#64748b",
                                                                    }}
                                                                >
                                                                    {s.label ||
                                                                        "—"}
                                                                </td>
                                                                <td style={TD}>
                                                                    <span
                                                                        style={{
                                                                            background:
                                                                                s.teacher_id
                                                                                    ? "#ede9fe"
                                                                                    : "#dcfce7",
                                                                            color: s.teacher_id
                                                                                ? "#7c3aed"
                                                                                : "#15803d",
                                                                            padding:
                                                                                "3px 10px",
                                                                            borderRadius: 20,
                                                                            fontSize: 11,
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        {s.teacher_id
                                                                            ? "فردي"
                                                                            : "مجمع"}
                                                                    </span>
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        ...TD,
                                                                        textAlign:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    <Btn
                                                                        bg="#fee2e2"
                                                                        color="#dc2626"
                                                                        border="1px solid #fecaca"
                                                                        onClick={() =>
                                                                            deleteSchedule(
                                                                                s.id,
                                                                            )
                                                                        }
                                                                        style={{
                                                                            padding:
                                                                                "5px 10px",
                                                                            fontSize: 11,
                                                                        }}
                                                                    >
                                                                        <FiTrash2
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    </Btn>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fill,minmax(280px,1fr))",
                                        gap: 14,
                                    }}
                                >
                                    {filteredSchedules.length === 0 ? (
                                        <div
                                            style={{
                                                gridColumn: "1/-1",
                                                textAlign: "center",
                                                padding: "50px 20px",
                                                color: "#94a3b8",
                                                background: "#fff",
                                                borderRadius: 16,
                                            }}
                                        >
                                            لا توجد جداول مطابقة
                                        </div>
                                    ) : (
                                        filteredSchedules.map((s, i) => (
                                            <div
                                                key={s.id}
                                                style={{
                                                    background: "#fff",
                                                    borderRadius: 16,
                                                    padding: "18px 20px",
                                                    boxShadow:
                                                        "0 2px 12px #0001",
                                                    borderTop:
                                                        "4px solid #0284c7",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 10,
                                                        marginBottom: 14,
                                                    }}
                                                >
                                                    <Avatar
                                                        name={s.teacher_name}
                                                        idx={i}
                                                    />
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            minWidth: 0,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontWeight: 700,
                                                                fontSize: 13,
                                                                color: "#1e293b",
                                                            }}
                                                        >
                                                            {s.teacher_name}
                                                        </div>
                                                        <span
                                                            style={{
                                                                background:
                                                                    s.teacher_id
                                                                        ? "#ede9fe"
                                                                        : "#dcfce7",
                                                                color: s.teacher_id
                                                                    ? "#7c3aed"
                                                                    : "#15803d",
                                                                padding:
                                                                    "2px 8px",
                                                                borderRadius: 20,
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {s.teacher_id
                                                                ? "فردي"
                                                                : "مجمع"}
                                                        </span>
                                                    </div>
                                                    <Btn
                                                        bg="#fee2e2"
                                                        color="#dc2626"
                                                        border="1px solid #fecaca"
                                                        onClick={() =>
                                                            deleteSchedule(s.id)
                                                        }
                                                        style={{
                                                            padding: "5px 8px",
                                                        }}
                                                    >
                                                        <FiTrash2 size={12} />
                                                    </Btn>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns:
                                                            "1fr 1fr",
                                                        gap: 8,
                                                    }}
                                                >
                                                    {[
                                                        {
                                                            l: "وقت البدء",
                                                            v: s.work_start_time,
                                                            bg: "#e0f2fe",
                                                            c: "#0369a1",
                                                        },
                                                        {
                                                            l: "التأخير المسموح",
                                                            v: `${s.allowed_late_minutes} دقيقة`,
                                                            bg: "#fef9c3",
                                                            c: "#a16207",
                                                        },
                                                    ].map((it) => (
                                                        <div
                                                            key={it.l}
                                                            style={{
                                                                background:
                                                                    it.bg,
                                                                borderRadius: 10,
                                                                padding:
                                                                    "10px 12px",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 10,
                                                                    color: it.c,
                                                                    marginBottom: 2,
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                {it.l}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 14,
                                                                    fontWeight: 900,
                                                                    color: it.c,
                                                                }}
                                                            >
                                                                {it.v}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {s.label && (
                                                    <div
                                                        style={{
                                                            marginTop: 10,
                                                            fontSize: 12,
                                                            color: "#64748b",
                                                            background:
                                                                "#f8fafc",
                                                            borderRadius: 8,
                                                            padding: "6px 10px",
                                                        }}
                                                    >
                                                        📋 {s.label}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ══════════════════════════════════════
                        TAB: أيام الراحة
                    ══════════════════════════════════════ */}
                    {tab === "offdays" && (
                        <>
                            {showForm && (
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: 16,
                                        padding: "20px 24px",
                                        marginBottom: 20,
                                        boxShadow: "0 2px 10px #0001",
                                        borderRight: "4px solid #7c3aed",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            marginBottom: 18,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: 10,
                                                background: "#ede9fe",
                                                color: "#7c3aed",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 18,
                                            }}
                                        >
                                            <FiSun />
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: 900,
                                                fontSize: 15,
                                                color: "#1e293b",
                                            }}
                                        >
                                            إضافة يوم راحة أسبوعي
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(auto-fill,minmax(200px,1fr))",
                                            gap: 14,
                                            marginBottom: 16,
                                        }}
                                    >
                                        <div>
                                            <Label>
                                                المعلم (فارغ = للمجمع كله)
                                            </Label>
                                            {teacherSelect}
                                        </div>
                                        <div>
                                            <Label>اليوم</Label>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 6,
                                                    flexWrap: "wrap",
                                                    marginBottom: 8,
                                                }}
                                            >
                                                {DAY_NAMES.map((n, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() =>
                                                            f(
                                                                "day_of_week",
                                                                String(i),
                                                            )
                                                        }
                                                        style={{
                                                            padding: "6px 12px",
                                                            borderRadius: 10,
                                                            border: `1px solid ${form.day_of_week === String(i) ? "#7c3aed" : "#e2e8f0"}`,
                                                            background:
                                                                form.day_of_week ===
                                                                String(i)
                                                                    ? "#ede9fe"
                                                                    : "#f8fafc",
                                                            color:
                                                                form.day_of_week ===
                                                                String(i)
                                                                    ? "#7c3aed"
                                                                    : "#64748b",
                                                            cursor: "pointer",
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        {n}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Btn
                                        bg="#7c3aed"
                                        color="#fff"
                                        onClick={saveOffDay}
                                    >
                                        <FiPlus size={14} /> إضافة يوم الراحة
                                    </Btn>
                                </div>
                            )}

                            {viewMode === "table" ? (
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: 20,
                                        overflow: "hidden",
                                        boxShadow: "0 2px 16px #0001",
                                    }}
                                >
                                    <div style={{ overflowX: "auto" }}>
                                        <table
                                            style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                            }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th style={TH}></th>
                                                    <th style={TH}>المعلم</th>
                                                    <th style={TH}>
                                                        يوم الراحة
                                                    </th>
                                                    <th style={TH}>النطاق</th>
                                                    <th
                                                        style={{
                                                            ...TH,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        حذف
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOffDays.length ===
                                                0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={5}
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                                padding:
                                                                    "50px 20px",
                                                                color: "#94a3b8",
                                                            }}
                                                        >
                                                            لا توجد أيام راحة
                                                            مطابقة
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredOffDays.map(
                                                        (d, i) => (
                                                            <tr
                                                                key={d.id}
                                                                style={{
                                                                    borderBottom:
                                                                        "1px solid #f8fafc",
                                                                    transition:
                                                                        "background .12s",
                                                                }}
                                                                onMouseEnter={(
                                                                    e,
                                                                ) =>
                                                                    (e.currentTarget.style.background =
                                                                        "#f8fafc")
                                                                }
                                                                onMouseLeave={(
                                                                    e,
                                                                ) =>
                                                                    (e.currentTarget.style.background =
                                                                        "#fff")
                                                                }
                                                            >
                                                                <td
                                                                    style={{
                                                                        ...TD,
                                                                        width: 52,
                                                                    }}
                                                                >
                                                                    <Avatar
                                                                        name={
                                                                            d.teacher_name
                                                                        }
                                                                        idx={i}
                                                                    />
                                                                </td>
                                                                <td style={TD}>
                                                                    <div
                                                                        style={{
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        {
                                                                            d.teacher_name
                                                                        }
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
                                                                            background:
                                                                                "#ede9fe",
                                                                            color: "#7c3aed",
                                                                            padding:
                                                                                "4px 10px",
                                                                            borderRadius: 20,
                                                                            fontSize: 11,
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        <FiSun
                                                                            size={
                                                                                11
                                                                            }
                                                                        />
                                                                        {
                                                                            d.day_name
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td style={TD}>
                                                                    <span
                                                                        style={{
                                                                            background:
                                                                                d.teacher_id
                                                                                    ? "#ede9fe"
                                                                                    : "#dcfce7",
                                                                            color: d.teacher_id
                                                                                ? "#7c3aed"
                                                                                : "#15803d",
                                                                            padding:
                                                                                "3px 10px",
                                                                            borderRadius: 20,
                                                                            fontSize: 11,
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        {d.teacher_id
                                                                            ? "فردي"
                                                                            : "مجمع"}
                                                                    </span>
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        ...TD,
                                                                        textAlign:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    <Btn
                                                                        bg="#fee2e2"
                                                                        color="#dc2626"
                                                                        border="1px solid #fecaca"
                                                                        onClick={() =>
                                                                            deleteOffDay(
                                                                                d.id,
                                                                            )
                                                                        }
                                                                        style={{
                                                                            padding:
                                                                                "5px 10px",
                                                                            fontSize: 11,
                                                                        }}
                                                                    >
                                                                        <FiTrash2
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    </Btn>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fill,minmax(240px,1fr))",
                                        gap: 14,
                                    }}
                                >
                                    {filteredOffDays.length === 0 ? (
                                        <div
                                            style={{
                                                gridColumn: "1/-1",
                                                textAlign: "center",
                                                padding: "50px 20px",
                                                color: "#94a3b8",
                                                background: "#fff",
                                                borderRadius: 16,
                                            }}
                                        >
                                            لا توجد أيام راحة مطابقة
                                        </div>
                                    ) : (
                                        filteredOffDays.map((d, i) => (
                                            <div
                                                key={d.id}
                                                style={{
                                                    background: "#fff",
                                                    borderRadius: 16,
                                                    padding: "18px 20px",
                                                    boxShadow:
                                                        "0 2px 12px #0001",
                                                    borderTop:
                                                        "4px solid #7c3aed",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 12,
                                                }}
                                            >
                                                <Avatar
                                                    name={d.teacher_name}
                                                    idx={i}
                                                />
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontWeight: 700,
                                                            fontSize: 13,
                                                            color: "#1e293b",
                                                        }}
                                                    >
                                                        {d.teacher_name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: 6,
                                                            marginTop: 6,
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                background:
                                                                    "#ede9fe",
                                                                color: "#7c3aed",
                                                                padding:
                                                                    "3px 10px",
                                                                borderRadius: 20,
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 4,
                                                            }}
                                                        >
                                                            <FiSun size={10} />
                                                            {d.day_name}
                                                        </span>
                                                        <span
                                                            style={{
                                                                background:
                                                                    d.teacher_id
                                                                        ? "#ede9fe"
                                                                        : "#dcfce7",
                                                                color: d.teacher_id
                                                                    ? "#7c3aed"
                                                                    : "#15803d",
                                                                padding:
                                                                    "3px 10px",
                                                                borderRadius: 20,
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {d.teacher_id
                                                                ? "فردي"
                                                                : "مجمع"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Btn
                                                    bg="#fee2e2"
                                                    color="#dc2626"
                                                    border="1px solid #fecaca"
                                                    onClick={() =>
                                                        deleteOffDay(d.id)
                                                    }
                                                    style={{
                                                        padding: "5px 8px",
                                                    }}
                                                >
                                                    <FiTrash2 size={12} />
                                                </Btn>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ══════════════════════════════════════
                        TAB: الإجازات
                    ══════════════════════════════════════ */}
                    {tab === "holidays" && (
                        <>
                            {showForm && (
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: 16,
                                        padding: "20px 24px",
                                        marginBottom: 20,
                                        boxShadow: "0 2px 10px #0001",
                                        borderRight: "4px solid #059669",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            marginBottom: 18,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: 10,
                                                background: "#dcfce7",
                                                color: "#059669",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 18,
                                            }}
                                        >
                                            <FiCalendar />
                                        </div>
                                        <div
                                            style={{
                                                fontWeight: 900,
                                                fontSize: 15,
                                                color: "#1e293b",
                                            }}
                                        >
                                            إضافة إجازة
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(auto-fill,minmax(200px,1fr))",
                                            gap: 14,
                                            marginBottom: 16,
                                        }}
                                    >
                                        <div>
                                            <Label>
                                                المعلم (فارغ = للمجمع كله)
                                            </Label>
                                            {teacherSelect}
                                        </div>
                                        <div>
                                            <Label>التاريخ *</Label>
                                            <input
                                                type="date"
                                                value={form.holiday_date}
                                                onChange={(e) =>
                                                    f(
                                                        "holiday_date",
                                                        e.target.value,
                                                    )
                                                }
                                                style={inputSt}
                                            />
                                        </div>
                                        <div>
                                            <Label>نوع الإجازة</Label>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 6,
                                                    flexWrap: "wrap",
                                                    marginBottom: 8,
                                                }}
                                            >
                                                {Object.entries(
                                                    HOLIDAY_TYPES,
                                                ).map(([k, v]) => (
                                                    <button
                                                        key={k}
                                                        onClick={() =>
                                                            f("type", k)
                                                        }
                                                        style={{
                                                            padding: "6px 14px",
                                                            borderRadius: 10,
                                                            border: `1px solid ${form.type === k ? v.color : "#e2e8f0"}`,
                                                            background:
                                                                form.type === k
                                                                    ? v.bg
                                                                    : "#f8fafc",
                                                            color:
                                                                form.type === k
                                                                    ? v.color
                                                                    : "#64748b",
                                                            cursor: "pointer",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        {v.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <Label>السبب (اختياري)</Label>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 6,
                                                    flexWrap: "wrap",
                                                    marginBottom: 6,
                                                }}
                                            >
                                                {[
                                                    "إجازة رسمية",
                                                    "عيد وطني",
                                                    "إجازة دينية",
                                                    "ظرف طارئ",
                                                ].map((r) => (
                                                    <button
                                                        key={r}
                                                        onClick={() =>
                                                            f("reason", r)
                                                        }
                                                        style={{
                                                            padding: "4px 10px",
                                                            borderRadius: 8,
                                                            border: `1px solid ${form.reason === r ? "#059669" : "#e2e8f0"}`,
                                                            background:
                                                                form.reason ===
                                                                r
                                                                    ? "#dcfce7"
                                                                    : "#f8fafc",
                                                            color:
                                                                form.reason ===
                                                                r
                                                                    ? "#15803d"
                                                                    : "#64748b",
                                                            cursor: "pointer",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                value={form.reason}
                                                placeholder="أو اكتب السبب..."
                                                onChange={(e) =>
                                                    f("reason", e.target.value)
                                                }
                                                style={inputSt}
                                            />
                                        </div>
                                    </div>
                                    <Btn
                                        bg="#059669"
                                        color="#fff"
                                        onClick={saveHoliday}
                                    >
                                        <FiPlus size={14} /> إضافة الإجازة
                                    </Btn>
                                </div>
                            )}

                            {viewMode === "table" ? (
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: 20,
                                        overflow: "hidden",
                                        boxShadow: "0 2px 16px #0001",
                                    }}
                                >
                                    <div style={{ overflowX: "auto" }}>
                                        <table
                                            style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                            }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th style={TH}></th>
                                                    <th style={TH}>المعلم</th>
                                                    <th style={TH}>التاريخ</th>
                                                    <th style={TH}>النوع</th>
                                                    <th style={TH}>السبب</th>
                                                    <th style={TH}>النطاق</th>
                                                    <th
                                                        style={{
                                                            ...TH,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        حذف
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredHolidays.length ===
                                                0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={7}
                                                            style={{
                                                                textAlign:
                                                                    "center",
                                                                padding:
                                                                    "50px 20px",
                                                                color: "#94a3b8",
                                                            }}
                                                        >
                                                            لا توجد إجازات
                                                            مطابقة
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredHolidays.map(
                                                        (h, i) => {
                                                            const ht =
                                                                HOLIDAY_TYPES[
                                                                    h.type
                                                                ] ??
                                                                HOLIDAY_TYPES.full_day;
                                                            const isPast =
                                                                h.holiday_date <
                                                                new Date()
                                                                    .toISOString()
                                                                    .slice(
                                                                        0,
                                                                        10,
                                                                    );
                                                            return (
                                                                <tr
                                                                    key={h.id}
                                                                    style={{
                                                                        borderBottom:
                                                                            "1px solid #f8fafc",
                                                                        transition:
                                                                            "background .12s",
                                                                        opacity:
                                                                            isPast
                                                                                ? 0.7
                                                                                : 1,
                                                                    }}
                                                                    onMouseEnter={(
                                                                        e,
                                                                    ) =>
                                                                        (e.currentTarget.style.background =
                                                                            "#f8fafc")
                                                                    }
                                                                    onMouseLeave={(
                                                                        e,
                                                                    ) =>
                                                                        (e.currentTarget.style.background =
                                                                            "#fff")
                                                                    }
                                                                >
                                                                    <td
                                                                        style={{
                                                                            ...TD,
                                                                            width: 52,
                                                                        }}
                                                                    >
                                                                        <Avatar
                                                                            name={
                                                                                h.teacher_name
                                                                            }
                                                                            idx={
                                                                                i
                                                                            }
                                                                        />
                                                                    </td>
                                                                    <td
                                                                        style={
                                                                            TD
                                                                        }
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                fontWeight: 700,
                                                                            }}
                                                                        >
                                                                            {
                                                                                h.teacher_name
                                                                            }
                                                                        </div>
                                                                        {isPast && (
                                                                            <div
                                                                                style={{
                                                                                    fontSize: 10,
                                                                                    color: "#94a3b8",
                                                                                }}
                                                                            >
                                                                                منتهية
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td
                                                                        style={
                                                                            TD
                                                                        }
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                display:
                                                                                    "inline-flex",
                                                                                alignItems:
                                                                                    "center",
                                                                                gap: 5,
                                                                                background:
                                                                                    "#e0f2fe",
                                                                                color: "#0369a1",
                                                                                padding:
                                                                                    "4px 10px",
                                                                                borderRadius: 20,
                                                                                fontSize: 11,
                                                                                fontWeight: 700,
                                                                            }}
                                                                        >
                                                                            <FiCalendar
                                                                                size={
                                                                                    11
                                                                                }
                                                                            />
                                                                            {
                                                                                h.holiday_date
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                    <td
                                                                        style={
                                                                            TD
                                                                        }
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                background:
                                                                                    ht.bg,
                                                                                color: ht.color,
                                                                                padding:
                                                                                    "3px 10px",
                                                                                borderRadius: 20,
                                                                                fontSize: 11,
                                                                                fontWeight: 700,
                                                                            }}
                                                                        >
                                                                            {
                                                                                ht.label
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            ...TD,
                                                                            color: "#64748b",
                                                                            fontSize: 12,
                                                                        }}
                                                                    >
                                                                        {h.reason ||
                                                                            "—"}
                                                                    </td>
                                                                    <td
                                                                        style={
                                                                            TD
                                                                        }
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                background:
                                                                                    h.teacher_id
                                                                                        ? "#ede9fe"
                                                                                        : "#dcfce7",
                                                                                color: h.teacher_id
                                                                                    ? "#7c3aed"
                                                                                    : "#15803d",
                                                                                padding:
                                                                                    "3px 10px",
                                                                                borderRadius: 20,
                                                                                fontSize: 11,
                                                                                fontWeight: 700,
                                                                            }}
                                                                        >
                                                                            {h.teacher_id
                                                                                ? "فردي"
                                                                                : "مجمع"}
                                                                        </span>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            ...TD,
                                                                            textAlign:
                                                                                "center",
                                                                        }}
                                                                    >
                                                                        <Btn
                                                                            bg="#fee2e2"
                                                                            color="#dc2626"
                                                                            border="1px solid #fecaca"
                                                                            onClick={() =>
                                                                                deleteHoliday(
                                                                                    h.id,
                                                                                )
                                                                            }
                                                                            style={{
                                                                                padding:
                                                                                    "5px 10px",
                                                                                fontSize: 11,
                                                                            }}
                                                                        >
                                                                            <FiTrash2
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />
                                                                        </Btn>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fill,minmax(280px,1fr))",
                                        gap: 14,
                                    }}
                                >
                                    {filteredHolidays.length === 0 ? (
                                        <div
                                            style={{
                                                gridColumn: "1/-1",
                                                textAlign: "center",
                                                padding: "50px 20px",
                                                color: "#94a3b8",
                                                background: "#fff",
                                                borderRadius: 16,
                                            }}
                                        >
                                            لا توجد إجازات مطابقة
                                        </div>
                                    ) : (
                                        filteredHolidays.map((h, i) => {
                                            const ht =
                                                HOLIDAY_TYPES[h.type] ??
                                                HOLIDAY_TYPES.full_day;
                                            const isPast =
                                                h.holiday_date <
                                                new Date()
                                                    .toISOString()
                                                    .slice(0, 10);
                                            return (
                                                <div
                                                    key={h.id}
                                                    style={{
                                                        background: "#fff",
                                                        borderRadius: 16,
                                                        padding: "18px 20px",
                                                        boxShadow:
                                                            "0 2px 12px #0001",
                                                        borderTop:
                                                            "4px solid #059669",
                                                        opacity: isPast
                                                            ? 0.7
                                                            : 1,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 10,
                                                            marginBottom: 14,
                                                        }}
                                                    >
                                                        <Avatar
                                                            name={
                                                                h.teacher_name
                                                            }
                                                            idx={i}
                                                        />
                                                        <div
                                                            style={{
                                                                flex: 1,
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontWeight: 700,
                                                                    fontSize: 13,
                                                                    color: "#1e293b",
                                                                }}
                                                            >
                                                                {h.teacher_name}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    gap: 5,
                                                                    marginTop: 4,
                                                                    flexWrap:
                                                                        "wrap",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        background:
                                                                            ht.bg,
                                                                        color: ht.color,
                                                                        padding:
                                                                            "2px 8px",
                                                                        borderRadius: 20,
                                                                        fontSize: 10,
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {ht.label}
                                                                </span>
                                                                <span
                                                                    style={{
                                                                        background:
                                                                            h.teacher_id
                                                                                ? "#ede9fe"
                                                                                : "#dcfce7",
                                                                        color: h.teacher_id
                                                                            ? "#7c3aed"
                                                                            : "#15803d",
                                                                        padding:
                                                                            "2px 8px",
                                                                        borderRadius: 20,
                                                                        fontSize: 10,
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {h.teacher_id
                                                                        ? "فردي"
                                                                        : "مجمع"}
                                                                </span>
                                                                {isPast && (
                                                                    <span
                                                                        style={{
                                                                            background:
                                                                                "#f1f5f9",
                                                                            color: "#94a3b8",
                                                                            padding:
                                                                                "2px 8px",
                                                                            borderRadius: 20,
                                                                            fontSize: 10,
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        منتهية
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Btn
                                                            bg="#fee2e2"
                                                            color="#dc2626"
                                                            border="1px solid #fecaca"
                                                            onClick={() =>
                                                                deleteHoliday(
                                                                    h.id,
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    "5px 8px",
                                                            }}
                                                        >
                                                            <FiTrash2
                                                                size={12}
                                                            />
                                                        </Btn>
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns:
                                                                "1fr 1fr",
                                                            gap: 8,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                background:
                                                                    "#e0f2fe",
                                                                borderRadius: 10,
                                                                padding:
                                                                    "10px 12px",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 10,
                                                                    color: "#0369a1",
                                                                    marginBottom: 2,
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                التاريخ
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 13,
                                                                    fontWeight: 900,
                                                                    color: "#0369a1",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 4,
                                                                }}
                                                            >
                                                                <FiCalendar
                                                                    size={11}
                                                                />
                                                                {h.holiday_date}
                                                            </div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                background:
                                                                    "#f8fafc",
                                                                borderRadius: 10,
                                                                padding:
                                                                    "10px 12px",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 10,
                                                                    color: "#64748b",
                                                                    marginBottom: 2,
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                السبب
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 12,
                                                                    fontWeight: 700,
                                                                    color: "#475569",
                                                                }}
                                                            >
                                                                {h.reason ||
                                                                    "—"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Confirm Modal */}
            {confirm && (
                <ConfirmModal
                    text={confirm.text}
                    onConfirm={confirm.cb}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {/* Toast */}
            {msg && <Toast msg={msg} onClose={() => setMsg(null)} />}

            <style>{`
                @keyframes ws-spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default WorkSchedulePage;
