// CreateSchedulePage.tsx — الجديد + متوافق مع الباك اند القديم
import React, { useState, useEffect } from "react";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

const DAYS_AR: Record<string, string> = {
    sunday: "الأحد",
    monday: "الإثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
};
const ALL_DAYS = Object.keys(DAYS_AR);

const DAY_COLORS: Record<
    string,
    { bg: string; border: string; text: string; active: string }
> = {
    sunday: {
        bg: "#f0fdf4",
        border: "#86efac",
        text: "#15803d",
        active: "#16a34a",
    },
    monday: {
        bg: "#eff6ff",
        border: "#93c5fd",
        text: "#1d4ed8",
        active: "#2563eb",
    },
    tuesday: {
        bg: "#fdf4ff",
        border: "#d8b4fe",
        text: "#7e22ce",
        active: "#9333ea",
    },
    wednesday: {
        bg: "#fff7ed",
        border: "#fdba74",
        text: "#c2410c",
        active: "#ea580c",
    },
    thursday: {
        bg: "#f0fdfa",
        border: "#5eead4",
        text: "#0f766e",
        active: "#0d9488",
    },
    friday: {
        bg: "#fef9c3",
        border: "#fde047",
        text: "#854d0e",
        active: "#ca8a04",
    },
    saturday: {
        bg: "#fdf2f8",
        border: "#f0abfc",
        text: "#86198f",
        active: "#a21caf",
    },
};

// ✅ تحويل أيام إنجليزية → نص عربي للباك اند القديم (حقل days)
function buildDaysString(repeatType: string, repeatDays: string[]): string {
    if (repeatType === "daily") return "يومي";
    if (repeatDays.length === 0) return "";
    return repeatDays.map((d) => DAYS_AR[d]).join("/");
}

// ✅ حساب schedule_date (أول يوم تشغيل) للباك اند القديم
function calcFirstDate(repeatType: string, repeatDays: string[]): string {
    const dayMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
    };
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (repeatType === "daily") {
        return tomorrow.toISOString().split("T")[0];
    }

    const selectedNums = repeatDays.map((d) => dayMap[d]).sort((a, b) => a - b);
    const cur = new Date(tomorrow);
    for (let i = 0; i < 14; i++) {
        if (selectedNums.includes(cur.getDay())) {
            return cur.toISOString().split("T")[0];
        }
        cur.setDate(cur.getDate() + 1);
    }
    return tomorrow.toISOString().split("T")[0];
}

export default function CreateSchedulePage({ onClose, onSuccess }: Props) {
    const [plans, setPlans] = useState<{ id: number; name: string }[]>([]);
    const [circles, setCircles] = useState<{ id: number; name: string }[]>([]);
    const [teachers, setTeachers] = useState<{ id: number; name: string }[]>(
        [],
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        plan_id: "",
        circle_id: "",
        teacher_id: "",
        start_time: "17:00",
        end_time: "18:00",
        max_students: "",
        notes: "",
        jitsi_room_name: "",
        repeat_type: "specific_days" as "daily" | "specific_days",
        repeat_days: [] as string[],
        plan_total_days: "30",
    });

    const [preview, setPreview] = useState<{
        firstDate: string;
        endDate: string;
        label: string;
    } | null>(null);

    // ── جلب البيانات ─────────────────────────────────────────
    useEffect(() => {
        const csrf =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";
        const headers = {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": csrf,
        };
        Promise.all([
            fetch("/api/v1/schedule-create/plans", {
                credentials: "include",
                headers,
            }).then((r) => r.json()),
            fetch("/api/v1/schedule-create/circles", {
                credentials: "include",
                headers,
            }).then((r) => r.json()),
            fetch("/api/v1/schedule-create/teachers", {
                credentials: "include",
                headers,
            }).then((r) => r.json()),
        ]).then(([p, c, t]) => {
            setPlans(Array.isArray(p) ? p : []);
            setCircles(Array.isArray(c) ? c : []);
            setTeachers(Array.isArray(t) ? t : []);
        });
    }, []);

    // ── حساب Preview ──────────────────────────────────────────
    useEffect(() => {
        if (
            form.repeat_type === "specific_days" &&
            form.repeat_days.length === 0
        ) {
            setPreview(null);
            return;
        }
        const totalDays = parseInt(form.plan_total_days) || 0;
        if (totalDays === 0) {
            setPreview(null);
            return;
        }

        const dayMap: Record<string, number> = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        let firstDate: Date | null = null;
        if (form.repeat_type === "daily") {
            firstDate = new Date(tomorrow);
        } else {
            const selectedNums = form.repeat_days
                .map((d) => dayMap[d])
                .sort((a, b) => a - b);
            const cur = new Date(tomorrow);
            for (let i = 0; i < 14; i++) {
                if (selectedNums.includes(cur.getDay())) {
                    firstDate = new Date(cur);
                    break;
                }
                cur.setDate(cur.getDate() + 1);
            }
        }
        if (!firstDate) {
            setPreview(null);
            return;
        }

        let endDate: Date;
        if (form.repeat_type === "daily") {
            endDate = new Date(firstDate);
            endDate.setDate(endDate.getDate() + totalDays - 1);
        } else {
            const selectedNums = form.repeat_days.map((d) => dayMap[d]);
            let count = 0;
            const cur = new Date(firstDate);
            while (count < totalDays) {
                if (selectedNums.includes(cur.getDay())) {
                    count++;
                    if (count === totalDays) break;
                }
                cur.setDate(cur.getDate() + 1);
            }
            endDate = new Date(cur);
        }

        const arabicDays = [
            "الأحد",
            "الإثنين",
            "الثلاثاء",
            "الأربعاء",
            "الخميس",
            "الجمعة",
            "السبت",
        ];
        const fmt = (d: Date) =>
            `${arabicDays[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

        setPreview({
            firstDate: firstDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
            label: `يبدأ: ${fmt(firstDate)} — ينتهي: ${fmt(endDate)}`,
        });
    }, [form.repeat_type, form.repeat_days, form.plan_total_days]);

    const toggleDay = (day: string) => {
        setForm((prev) => ({
            ...prev,
            repeat_days: prev.repeat_days.includes(day)
                ? prev.repeat_days.filter((d) => d !== day)
                : [...prev.repeat_days, day],
        }));
    };

    // ── الإرسال ───────────────────────────────────────────────
    const handleSubmit = async () => {
        setError("");

        if (!form.plan_id || !form.circle_id) {
            setError("اختر الخطة والحلقة");
            return;
        }
        if (
            form.repeat_type === "specific_days" &&
            form.repeat_days.length === 0
        ) {
            setError("اختر أيام الأسبوع");
            return;
        }
        if (!form.plan_total_days || parseInt(form.plan_total_days) < 1) {
            setError("أدخل عدد أيام الخطة");
            return;
        }

        setLoading(true);
        try {
            const csrf =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            // ✅ الحقول الجديدة (للباك اند الجديد)
            const body: Record<string, any> = {
                plan_id: parseInt(form.plan_id),
                circle_id: parseInt(form.circle_id),
                teacher_id: form.teacher_id ? parseInt(form.teacher_id) : null,
                start_time: form.start_time,
                end_time: form.end_time,
                max_students: form.max_students
                    ? parseInt(form.max_students)
                    : null,
                notes: form.notes || null,
                jitsi_room_name: form.jitsi_room_name || null,
                repeat_type: form.repeat_type,
                repeat_days:
                    form.repeat_type === "specific_days"
                        ? form.repeat_days
                        : [],
                plan_total_days: parseInt(form.plan_total_days),

                // ✅ الحقول القديمة (للباك اند القديم — بيتحسبوا تلقائياً)
                schedule_date: calcFirstDate(
                    form.repeat_type,
                    form.repeat_days,
                ),
                days: buildDaysString(form.repeat_type, form.repeat_days),
            };

            console.log("🚀 [SUBMIT]:", body);

            const res = await fetch("/api/v1/plans/schedules", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrf,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) {
                // عرض أول خطأ من الـ validation errors لو موجود
                if (data.errors) {
                    const firstError = Object.values(
                        data.errors,
                    ).flat()[0] as string;
                    setError(firstError || "خطأ في البيانات");
                } else {
                    setError(data.message || data.error || "فشل في الإنشاء");
                }
                return;
            }

            onSuccess();
            onClose();
        } catch {
            setError("حدث خطأ في الاتصال");
        } finally {
            setLoading(false);
        }
    };

    // ── Styles ────────────────────────────────────────────────
    const inp: React.CSSProperties = {
        width: "100%",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "9px 12px",
        fontSize: 13,
        fontFamily: "'Tajawal',sans-serif",
        background: "#f8fafc",
        outline: "none",
        boxSizing: "border-box",
    };
    const lbl: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 700,
        color: "#475569",
        marginBottom: 5,
        display: "block",
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2000,
                background: "rgba(0,0,0,.55)",
                backdropFilter: "blur(6px)",
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
                    width: "100%",
                    maxWidth: 560,
                    maxHeight: "92vh",
                    overflowY: "auto",
                    boxShadow: "0 24px 80px #0003",
                    fontFamily: "'Tajawal',sans-serif",
                    direction: "rtl",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(135deg,#0f4c35,#1e293b)",
                        borderRadius: "24px 24px 0 0",
                        padding: "22px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 900,
                                color: "#fff",
                            }}
                        >
                            📅 موعد جديد
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#86efac",
                                marginTop: 2,
                            }}
                        >
                            إنشاء جدول حلقة جديدة
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "rgba(255,255,255,.12)",
                            border: "none",
                            borderRadius: 10,
                            width: 34,
                            height: 34,
                            cursor: "pointer",
                            color: "#fff",
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div
                    style={{
                        padding: "22px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                    }}
                >
                    {/* الخطة + الحلقة */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                        }}
                    >
                        <div>
                            <span style={lbl}>📖 الخطة *</span>
                            <select
                                value={form.plan_id}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        plan_id: e.target.value,
                                    }))
                                }
                                style={inp}
                            >
                                <option value="">اختر الخطة</option>
                                {plans.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <span style={lbl}>🔵 الحلقة *</span>
                            <select
                                value={form.circle_id}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        circle_id: e.target.value,
                                    }))
                                }
                                style={inp}
                            >
                                <option value="">اختر الحلقة</option>
                                {circles.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* المعلم + السعة */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                        }}
                    >
                        <div>
                            <span style={lbl}>👨‍🏫 المعلم</span>
                            <select
                                value={form.teacher_id}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        teacher_id: e.target.value,
                                    }))
                                }
                                style={inp}
                            >
                                <option value="">اختياري</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <span style={lbl}>👥 أقصى عدد طلاب</span>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={form.max_students}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        max_students: e.target.value,
                                    }))
                                }
                                placeholder="مفتوح"
                                style={inp}
                            />
                        </div>
                    </div>

                    {/* الأوقات */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                        }}
                    >
                        <div>
                            <span style={lbl}>🕐 وقت البداية *</span>
                            <input
                                type="time"
                                value={form.start_time}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        start_time: e.target.value,
                                    }))
                                }
                                style={inp}
                            />
                        </div>
                        <div>
                            <span style={lbl}>🕔 وقت النهاية *</span>
                            <input
                                type="time"
                                value={form.end_time}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        end_time: e.target.value,
                                    }))
                                }
                                style={inp}
                            />
                        </div>
                    </div>

                    {/* عدد أيام الخطة */}
                    <div>
                        <span style={lbl}>📆 عدد أيام الخطة الإجمالي *</span>
                        <input
                            type="number"
                            min={1}
                            max={365}
                            value={form.plan_total_days}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    plan_total_days: e.target.value,
                                }))
                            }
                            style={inp}
                            placeholder="مثال: 30"
                        />
                    </div>

                    {/* نوع التكرار */}
                    <div>
                        <span style={lbl}>🔁 نوع الجدول *</span>
                        <div style={{ display: "flex", gap: 10 }}>
                            {[
                                { value: "daily", label: "📅 كل يوم" },
                                {
                                    value: "specific_days",
                                    label: "🗓️ أيام محددة",
                                },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() =>
                                        setForm((p) => ({
                                            ...p,
                                            repeat_type: opt.value as any,
                                            repeat_days: [],
                                        }))
                                    }
                                    style={{
                                        flex: 1,
                                        padding: "10px 8px",
                                        borderRadius: 12,
                                        border:
                                            form.repeat_type === opt.value
                                                ? "2px solid #0f6e56"
                                                : "1px solid #e2e8f0",
                                        background:
                                            form.repeat_type === opt.value
                                                ? "#e1f5ee"
                                                : "#f8fafc",
                                        color:
                                            form.repeat_type === opt.value
                                                ? "#085041"
                                                : "#64748b",
                                        cursor: "pointer",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        fontFamily: "inherit",
                                        transition: "all .15s",
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* اختيار الأيام */}
                    {form.repeat_type === "specific_days" && (
                        <div>
                            <span style={lbl}>📌 اختر أيام الأسبوع *</span>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 6,
                                    flexWrap: "wrap",
                                }}
                            >
                                {ALL_DAYS.map((day) => {
                                    const selected =
                                        form.repeat_days.includes(day);
                                    const colors = DAY_COLORS[day];
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(day)}
                                            style={{
                                                padding: "8px 14px",
                                                borderRadius: 20,
                                                border: selected
                                                    ? `2px solid ${colors.active}`
                                                    : `1px solid ${colors.border}`,
                                                background: selected
                                                    ? colors.active
                                                    : colors.bg,
                                                color: selected
                                                    ? "#fff"
                                                    : colors.text,
                                                cursor: "pointer",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                fontFamily: "inherit",
                                                transition: "all .15s",
                                                transform: selected
                                                    ? "scale(1.05)"
                                                    : "scale(1)",
                                            }}
                                        >
                                            {DAYS_AR[day]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    {preview && (
                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg,#e1f5ee,#eff6ff)",
                                border: "1px solid #9FE1CB",
                                borderRadius: 14,
                                padding: "14px 16px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 900,
                                    color: "#085041",
                                    marginBottom: 6,
                                }}
                            >
                                📋 معاينة الجدول
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#0f4c35",
                                    lineHeight: 1.8,
                                }}
                            >
                                {preview.label}
                            </div>
                            {form.repeat_type === "specific_days" &&
                                form.repeat_days.length > 0 && (
                                    <div
                                        style={{
                                            marginTop: 6,
                                            fontSize: 11,
                                            color: "#475569",
                                        }}
                                    >
                                        أيام الحضور:{" "}
                                        {form.repeat_days
                                            .map((d) => DAYS_AR[d])
                                            .join(" — ")}
                                    </div>
                                )}
                            {/* ✅ يعرض القيم اللي هتتبعت للباك اند القديم */}
                            <div
                                style={{
                                    marginTop: 8,
                                    fontSize: 10,
                                    color: "#64748b",
                                    borderTop: "1px solid #9FE1CB",
                                    paddingTop: 6,
                                }}
                            >
                                schedule_date: {preview.firstDate} &nbsp;|&nbsp;
                                days:{" "}
                                {buildDaysString(
                                    form.repeat_type,
                                    form.repeat_days,
                                )}
                            </div>
                        </div>
                    )}

                    {/* Jitsi */}
                    <div>
                        <span style={lbl}>🎥 اسم غرفة Jitsi</span>
                        <input
                            value={form.jitsi_room_name}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    jitsi_room_name: e.target.value,
                                }))
                            }
                            placeholder="room-123"
                            style={inp}
                        />
                    </div>

                    {/* ملاحظات */}
                    <div>
                        <span style={lbl}>📝 ملاحظات</span>
                        <textarea
                            value={form.notes}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    notes: e.target.value,
                                }))
                            }
                            rows={2}
                            placeholder="ملاحظات اختيارية..."
                            style={{ ...inp, resize: "none" }}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                background: "#fee2e2",
                                border: "1px solid #fecaca",
                                borderRadius: 10,
                                padding: "10px 14px",
                                color: "#b91c1c",
                                fontSize: 12,
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "12px 0",
                                borderRadius: 12,
                                border: "none",
                                background: loading ? "#94a3b8" : "#0f6e56",
                                color: "#fff",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontSize: 14,
                                fontWeight: 900,
                                fontFamily: "inherit",
                            }}
                        >
                            {loading ? "⏳ جاري الإنشاء..." : "✅ إنشاء الموعد"}
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                padding: "12px 20px",
                                borderRadius: 12,
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                                color: "#64748b",
                                cursor: "pointer",
                                fontSize: 13,
                                fontFamily: "inherit",
                            }}
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
