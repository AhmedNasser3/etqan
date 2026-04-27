// pages/admin/WorkSchedulePage.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiClock, FiCalendar, FiSun } from "react-icons/fi";
import { BsPersonCheck } from "react-icons/bs";

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

const DAY_NAMES = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
];

const TABS = [
    { key: "schedules" as const, label: "جداول العمل", Icon: FiClock },
    { key: "offdays" as const, label: "أيام الراحة", Icon: FiSun },
    { key: "holidays" as const, label: "الإجازات", Icon: FiCalendar },
];

const WorkSchedulePage: React.FC = () => {
    const [tab, setTab] = useState<"schedules" | "offdays" | "holidays">(
        "schedules",
    );
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [offDays, setOffDays] = useState<OffDay[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const [form, setForm] = useState({
        teacher_id: "",
        work_start_time: "08:00",
        allowed_late_minutes: "15",
        label: "",
        day_of_week: "5",
        holiday_date: "",
        reason: "",
        type: "full_day", // ✅ مضاف - كان ناقص وسبب الـ 422
    });

    // ── load ──────────────────────────────────────────────────────────────────
    const load = async () => {
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
            showMsg("فشل في تحميل البيانات", false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const showMsg = (text: string, ok = true) => {
        setMsg({ text, ok });
        setTimeout(() => setMsg(null), 3000);
    };

    const f = (k: keyof typeof form, v: string) =>
        setForm((p) => ({ ...p, [k]: v }));

    // ── save schedule ─────────────────────────────────────────────────────────
    const saveSchedule = async () => {
        try {
            await axios.post("/api/v1/schedules", {
                teacher_id: form.teacher_id || null,
                work_start_time: form.work_start_time,
                allowed_late_minutes: parseInt(form.allowed_late_minutes),
                label: form.label || null,
            });
            showMsg("تم حفظ جدول العمل بنجاح");
            load();
        } catch (e: any) {
            showMsg(e.response?.data?.message ?? "فشل الحفظ", false);
        }
    };

    // ── save off day ──────────────────────────────────────────────────────────
    const saveOffDay = async () => {
        try {
            await axios.post("/api/v1/schedules/off-days", {
                teacher_id: form.teacher_id || null,
                day_of_week: parseInt(form.day_of_week),
            });
            showMsg("تم إضافة يوم الراحة بنجاح");
            load();
        } catch (e: any) {
            showMsg(e.response?.data?.message ?? "فشل الحفظ", false);
        }
    };

    // ── save holiday ──────────────────────────────────────────────────────────
    const saveHoliday = async () => {
        if (!form.holiday_date) {
            showMsg("يرجى اختيار تاريخ الإجازة", false);
            return;
        }
        try {
            await axios.post("/api/v1/schedules/holidays", {
                teacher_id: form.teacher_id || null,
                holiday_date: form.holiday_date,
                reason: form.reason || null,
                type: form.type, // ✅ مضاف - كان ناقص وسبب الـ 422
            });
            showMsg("تم إضافة الإجازة بنجاح");
            load();
        } catch (e: any) {
            const errors = e.response?.data?.errors;
            const firstErr = errors
                ? Object.values(errors).flat().join(" - ")
                : (e.response?.data?.message ?? "فشل الحفظ");
            showMsg(firstErr, false);
        }
    };

    // ── delete helpers ────────────────────────────────────────────────────────
    const deleteSchedule = async (id: number) => {
        if (!confirm("هل تريد حذف هذا الجدول؟")) return;
        try {
            await axios.delete(`/api/v1/schedules/${id}`);
            showMsg("تم الحذف");
            load();
        } catch {
            showMsg("فشل الحذف", false);
        }
    };

    const deleteOffDay = async (id: number) => {
        if (!confirm("هل تريد حذف يوم الراحة؟")) return;
        try {
            await axios.delete(`/api/v1/schedules/off-days/${id}`);
            showMsg("تم الحذف");
            load();
        } catch {
            showMsg("فشل الحذف", false);
        }
    };

    const deleteHoliday = async (id: number) => {
        if (!confirm("هل تريد حذف هذه الإجازة؟")) return;
        try {
            await axios.delete(`/api/v1/schedules/holidays/${id}`);
            showMsg("تم الحذف");
            load();
        } catch {
            showMsg("فشل الحذف", false);
        }
    };

    // ── teacher select (مشترك) ────────────────────────────────────────────────
    const teacherSelect = (
        <select
            value={form.teacher_id}
            onChange={(e) => f("teacher_id", e.target.value)}
            style={inputStyle}
        >
            <option value="">الكل (افتراضي للمجمع)</option>
            {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                    {t.name}
                </option>
            ))}
        </select>
    );

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="content" id="contentArea">
            <div className="widget">
                {/* Header */}
                <div className="wh">
                    <div className="wh-l">إدارة جداول العمل والإجازات</div>
                    <button
                        className="btn bs bsm"
                        onClick={load}
                        disabled={loading}
                    >
                        تحديث
                    </button>
                </div>

                {/* Toast */}
                {msg && (
                    <div
                        style={{
                            background: msg.ok ? "#dcfce7" : "#fee2e2",
                            color: msg.ok ? "#15803d" : "#b91c1c",
                            border: `1px solid ${msg.ok ? "#bbf7d0" : "#fecaca"}`,
                            padding: "12px 16px",
                            borderRadius: 10,
                            marginBottom: 16,
                            fontWeight: 600,
                            fontSize: "0.9rem",
                        }}
                    >
                        {msg.text}
                    </div>
                )}

                {/* Tabs */}
                <div
                    style={{
                        display: "flex",
                        gap: 4,
                        marginBottom: 24,
                        background: "#f8fafc",
                        padding: 4,
                        borderRadius: 12,
                        width: "fit-content",
                        border: "1px solid #e2e8f0",
                        margin: "12px 6px",
                    }}
                >
                    {TABS.map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            style={{
                                padding: "9px 20px",
                                borderRadius: 9,
                                border: "none",
                                cursor: "pointer",
                                fontWeight: tab === key ? 700 : 500,
                                background:
                                    tab === key ? "white" : "transparent",
                                color: tab === key ? "#6366f1" : "#64748b",
                                boxShadow:
                                    tab === key
                                        ? "0 1px 4px rgba(0,0,0,.08)"
                                        : "none",
                                fontSize: "0.875rem",
                                transition: "all .15s",
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                            }}
                        >
                            <Icon size={15} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: 40,
                            color: "#94a3b8",
                        }}
                    >
                        <BsPersonCheck
                            size={32}
                            style={{ marginBottom: 8, opacity: 0.4 }}
                        />
                        <div>جاري التحميل...</div>
                    </div>
                )}

                {/* ══ TAB: جداول العمل ══ */}
                {tab === "schedules" && !loading && (
                    <div>
                        <div style={formCard}>
                            <div style={formTitle}>
                                <FiPlus size={16} style={{ marginLeft: 6 }} />
                                إضافة / تعديل جدول عمل
                            </div>
                            <div style={grid}>
                                <div>
                                    <label style={lbl}>
                                        المعلم (اتركه فارغاً للكل)
                                    </label>
                                    {teacherSelect}
                                </div>
                                <div>
                                    <label style={lbl}>وقت بدء العمل</label>
                                    <input
                                        type="time"
                                        value={form.work_start_time}
                                        onChange={(e) =>
                                            f("work_start_time", e.target.value)
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={lbl}>
                                        دقائق التأخير المسموحة
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={120}
                                        value={form.allowed_late_minutes}
                                        onChange={(e) =>
                                            f(
                                                "allowed_late_minutes",
                                                e.target.value,
                                            )
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={lbl}>
                                        اسم الجدول (اختياري)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.label}
                                        placeholder="مثال: جدول الصباح"
                                        onChange={(e) =>
                                            f("label", e.target.value)
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <button
                                className="btn bp bsm"
                                onClick={saveSchedule}
                                style={{ marginTop: 16 }}
                            >
                                <FiPlus size={14} style={{ marginLeft: 6 }} />
                                حفظ الجدول
                            </button>
                        </div>

                        <table style={tbl}>
                            <thead>
                                <tr
                                    style={{
                                        background: "#f8fafc",
                                        borderBottom: "2px solid #e2e8f0",
                                    }}
                                >
                                    {[
                                        "المعلم",
                                        "وقت البدء",
                                        "التأخير المسموح",
                                        "الاسم",
                                        "",
                                    ].map((h) => (
                                        <th key={h} style={th}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={empty}>
                                            لا توجد جداول
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((s) => (
                                        <tr
                                            key={s.id}
                                            style={tr}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#f8fafc")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    "white")
                                            }
                                        >
                                            <td style={td}>{s.teacher_name}</td>
                                            <td style={td}>
                                                <span style={timeBadge}>
                                                    <FiClock size={12} />
                                                    {s.work_start_time}
                                                </span>
                                            </td>
                                            <td style={td}>
                                                {s.allowed_late_minutes} دقيقة
                                            </td>
                                            <td
                                                style={{
                                                    ...td,
                                                    color: "#94a3b8",
                                                }}
                                            >
                                                {s.label || "—"}
                                            </td>
                                            <td style={td}>
                                                <button
                                                    className="btn bd bxs"
                                                    onClick={() =>
                                                        deleteSchedule(s.id)
                                                    }
                                                    style={{
                                                        padding: "4px 10px",
                                                    }}
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ══ TAB: أيام الراحة ══ */}
                {tab === "offdays" && !loading && (
                    <div>
                        <div style={formCard}>
                            <div style={formTitle}>
                                <FiPlus size={16} style={{ marginLeft: 6 }} />
                                إضافة يوم راحة أسبوعي
                            </div>
                            <div style={grid}>
                                <div>
                                    <label style={lbl}>
                                        المعلم (اتركه فارغاً للكل)
                                    </label>
                                    {teacherSelect}
                                </div>
                                <div>
                                    <label style={lbl}>اليوم</label>
                                    <select
                                        value={form.day_of_week}
                                        onChange={(e) =>
                                            f("day_of_week", e.target.value)
                                        }
                                        style={inputStyle}
                                    >
                                        {DAY_NAMES.map((n, i) => (
                                            <option key={i} value={i}>
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                className="btn bp bsm"
                                onClick={saveOffDay}
                                style={{ marginTop: 16 }}
                            >
                                <FiPlus size={14} style={{ marginLeft: 6 }} />
                                إضافة يوم الراحة
                            </button>
                        </div>

                        <table style={tbl}>
                            <thead>
                                <tr
                                    style={{
                                        background: "#f8fafc",
                                        borderBottom: "2px solid #e2e8f0",
                                    }}
                                >
                                    {["المعلم", "اليوم", ""].map((h) => (
                                        <th key={h} style={th}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {offDays.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={empty}>
                                            لا توجد أيام راحة
                                        </td>
                                    </tr>
                                ) : (
                                    offDays.map((d) => (
                                        <tr
                                            key={d.id}
                                            style={tr}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#f8fafc")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    "white")
                                            }
                                        >
                                            <td style={td}>{d.teacher_name}</td>
                                            <td style={td}>
                                                <span
                                                    style={{
                                                        ...timeBadge,
                                                        background: "#ede9fe",
                                                        color: "#7c3aed",
                                                    }}
                                                >
                                                    <FiSun size={12} />
                                                    {d.day_name}
                                                </span>
                                            </td>
                                            <td style={td}>
                                                <button
                                                    className="btn bd bxs"
                                                    onClick={() =>
                                                        deleteOffDay(d.id)
                                                    }
                                                    style={{
                                                        padding: "4px 10px",
                                                    }}
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ══ TAB: الإجازات ══ */}
                {tab === "holidays" && !loading && (
                    <div>
                        <div style={formCard}>
                            <div style={formTitle}>
                                <FiPlus size={16} style={{ marginLeft: 6 }} />
                                إضافة إجازة
                            </div>
                            <div style={grid}>
                                <div>
                                    <label style={lbl}>
                                        المعلم (اتركه فارغاً للكل)
                                    </label>
                                    {teacherSelect}
                                </div>
                                <div>
                                    <label style={lbl}>التاريخ *</label>
                                    <input
                                        type="date"
                                        value={form.holiday_date}
                                        onChange={(e) =>
                                            f("holiday_date", e.target.value)
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                                {/* ✅ نوع الإجازة - كان ناقص وسبب الـ 422 */}
                                <div>
                                    <label style={lbl}>نوع الإجازة</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) =>
                                            f("type", e.target.value)
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="full_day">
                                            يوم كامل
                                        </option>
                                        <option value="weekend">
                                            نهاية أسبوع
                                        </option>
                                        <option value="custom">مخصصة</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={lbl}>السبب (اختياري)</label>
                                    <input
                                        type="text"
                                        value={form.reason}
                                        placeholder="مثال: إجازة رسمية"
                                        onChange={(e) =>
                                            f("reason", e.target.value)
                                        }
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <button
                                className="btn bp bsm"
                                onClick={saveHoliday}
                                style={{ marginTop: 16 }}
                            >
                                <FiPlus size={14} style={{ marginLeft: 6 }} />
                                إضافة الإجازة
                            </button>
                        </div>

                        <table style={tbl}>
                            <thead>
                                <tr
                                    style={{
                                        background: "#f8fafc",
                                        borderBottom: "2px solid #e2e8f0",
                                    }}
                                >
                                    {[
                                        "المعلم",
                                        "التاريخ",
                                        "النوع",
                                        "السبب",
                                        "",
                                    ].map((h) => (
                                        <th key={h} style={th}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {holidays.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={empty}>
                                            لا توجد إجازات
                                        </td>
                                    </tr>
                                ) : (
                                    holidays.map((h) => (
                                        <tr
                                            key={h.id}
                                            style={tr}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#f8fafc")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    "white")
                                            }
                                        >
                                            <td style={td}>{h.teacher_name}</td>
                                            <td style={td}>
                                                <span
                                                    style={{
                                                        ...timeBadge,
                                                        background: "#e0f2fe",
                                                        color: "#0369a1",
                                                    }}
                                                >
                                                    <FiCalendar size={12} />
                                                    {h.holiday_date}
                                                </span>
                                            </td>
                                            <td style={td}>
                                                <span
                                                    style={{
                                                        background: "#f1f5f9",
                                                        color: "#475569",
                                                        padding: "3px 10px",
                                                        borderRadius: 999,
                                                        fontSize: "0.78rem",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {h.type === "full_day"
                                                        ? "يوم كامل"
                                                        : h.type === "weekend"
                                                          ? "نهاية أسبوع"
                                                          : "مخصصة"}
                                                </span>
                                            </td>
                                            <td
                                                style={{
                                                    ...td,
                                                    color: "#64748b",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                {h.reason || "—"}
                                            </td>
                                            <td style={td}>
                                                <button
                                                    className="btn bd bxs"
                                                    onClick={() =>
                                                        deleteHoliday(h.id)
                                                    }
                                                    style={{
                                                        padding: "4px 10px",
                                                    }}
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const formCard: React.CSSProperties = {
    background: "#f8fafc",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 24,
    border: "1px solid #e2e8f0",
    margin: "12px 6px",
};
const formTitle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#1e293b",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
};
const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
    gap: 16,
};
const lbl: React.CSSProperties = {
    display: "block",
    fontWeight: 600,
    color: "#475569",
    marginBottom: 6,
    fontSize: "0.8rem",
};
const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: "0.9rem",
    outline: "none",
    direction: "rtl",
    background: "white",
    color: "#1e293b",
    boxSizing: "border-box",
};
const tbl: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const th: React.CSSProperties = {
    padding: "12px 14px",
    textAlign: "right",
    fontWeight: 700,
    color: "#64748b",
    fontSize: "0.78rem",
    whiteSpace: "nowrap",
};
const tr: React.CSSProperties = {
    borderBottom: "1px solid #f1f5f9",
    background: "white",
    transition: "background .1s",
};
const td: React.CSSProperties = {
    padding: "12px 14px",
    color: "#1e293b",
    fontSize: "0.875rem",
};
const empty: React.CSSProperties = {
    textAlign: "center",
    padding: "40px 0",
    color: "#94a3b8",
    fontSize: "0.9rem",
};
const timeBadge: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: "0.78rem",
    fontWeight: 600,
};

export default WorkSchedulePage;
