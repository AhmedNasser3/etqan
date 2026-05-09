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
    FiUpload,
    FiFileText,
    FiAlertCircle,
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
interface ImportResult {
    success_count: number;
    failed_count: number;
    errors: string[];
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

// ── Arabic ↔ API mappers ─────────────────────────────────────────────────────
// القالب يُنزَّل بالعربية؛ عند الرفع نحوّل كل قيمة للإنجليزية قبل إرسالها للـ API

/** أسماء أعمدة القالب العربي ← مفاتيح API */
const AR_COL_MAP: Record<string, string> = {
    "الاسم الأول": "first_name",
    "اسم العائلة": "family_name",
    "رقم الهوية": "id_number",
    "تاريخ الميلاد": "birth_date",
    "المرحلة الدراسية": "grade_level",
    الجنس: "gender",
    "البريد الإلكتروني للطالب": "student_email",
    "بريد ولي الأمر": "guardian_email",
    "رمز دولة ولي الأمر": "guardian_country_code",
    "هاتف ولي الأمر": "guardian_phone",
    "الحالة الصحية": "health_status",
    "مستوى القراءة": "reading_level",
    "وقت الجلسة": "session_time",
    ملاحظات: "notes",
    الحلقة: "circle",
};

/** قيم عربية → قيم API */
const AR_VALUE_MAP: Record<string, Record<string, string>> = {
    grade_level: {
        // ابتدائي
        ابتدائي: "elementary",
        "أول ابتدائي": "elementary",
        "ثاني ابتدائي": "elementary",
        "ثالث ابتدائي": "elementary",
        "رابع ابتدائي": "elementary",
        "خامس ابتدائي": "elementary",
        "سادس ابتدائي": "elementary",
        "اول ابتدائي": "elementary",
        ثاني: "elementary",
        ثالث: "elementary",
        رابع: "elementary",
        خامس: "elementary",
        سادس: "elementary",
        elementary: "elementary",
        // متوسط
        متوسط: "middle",
        "أول متوسط": "middle",
        "ثاني متوسط": "middle",
        "ثالث متوسط": "middle",
        "اول متوسط": "middle",
        middle: "middle",
        // ثانوي
        ثانوي: "high",
        "أول ثانوي": "high",
        "ثاني ثانوي": "high",
        "ثالث ثانوي": "high",
        "اول ثانوي": "high",
        high: "high",
    },
    gender: {
        ذكر: "male",
        male: "male",
        أنثى: "female",
        انثى: "female",
        female: "female",
    },
    health_status: {
        سليم: "healthy",
        healthy: "healthy",
        "يحتاج متابعة": "needs_attention",
        needs_attention: "needs_attention",
        "ذوي احتياجات": "special_needs",
        special_needs: "special_needs",
    },
    session_time: {
        العصر: "asr",
        عصر: "asr",
        asr: "asr",
        المغرب: "maghrib",
        مغرب: "maghrib",
        maghrib: "maghrib",
        "": "",
    },
    guardian_country_code: {
        "966": "966",
        السعودية: "966",
        "20": "20",
        مصر: "20",
        "971": "971",
        الإمارات: "971",
        الامارات: "971",
    },
};

/** تطبيع تاريخ الميلاد: يقبل M/D/YYYY أو YYYY-MM-DD أو serial Excel */
function normalizeDate(raw: any): string {
    if (!raw && raw !== 0) return "";
    // Excel serial number
    if (typeof raw === "number") {
        const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
        return d.toISOString().split("T")[0];
    }
    const s = String(raw).trim();
    // already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // M/D/YYYY or MM/DD/YYYY
    const parts = s.split("/");
    if (parts.length === 3) {
        const [m, d, y] = parts;
        return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    return s;
}

/** تحويل صف من القالب العربي إلى كائن API */
function mapArabicRow(raw: Record<string, any>): Record<string, string> {
    const out: Record<string, string> = {};

    for (const [colAr, apiKey] of Object.entries(AR_COL_MAP)) {
        // ابحث عن العمود بالاسم العربي أولاً، ثم بالمفتاح الإنجليزي fallback
        const val = raw[colAr] ?? raw[apiKey] ?? "";
        out[apiKey] = String(val ?? "").trim();
    }

    // تحويل القيم
    const mappable = [
        "grade_level",
        "gender",
        "health_status",
        "session_time",
        "guardian_country_code",
    ] as const;
    for (const key of mappable) {
        const original = out[key];
        const mapped = AR_VALUE_MAP[key]?.[original];
        if (mapped !== undefined) out[key] = mapped;
        // إذا لم نجد تطابقاً نترك القيمة كما هي (سيرفضها الـ API بوضوح)
    }

    // تطبيع التاريخ
    const rawDate = raw["تاريخ الميلاد"] ?? raw["birth_date"] ?? "";
    out["birth_date"] = normalizeDate(rawDate);

    // fallback للحالة الصحية
    if (!out["health_status"]) out["health_status"] = "healthy";

    return out;
}

// ── Import Modal ─────────────────────────────────────────────────────────────
function ImportModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── القالب بالعربية كاملاً ──
    const AR_TEMPLATE_HEADERS = [
        "الاسم الأول",
        "اسم العائلة",
        "رقم الهوية",
        "تاريخ الميلاد",
        "المرحلة الدراسية",
        "الجنس",
        "البريد الإلكتروني للطالب",
        "بريد ولي الأمر",
        "رمز دولة ولي الأمر",
        "هاتف ولي الأمر",
        "الحالة الصحية",
        "مستوى القراءة",
        "وقت الجلسة",
        "ملاحظات",
        "الحلقة",
    ];

    const AR_TEMPLATE_EXAMPLE = [
        {
            "الاسم الأول": "محمد",
            "اسم العائلة": "الأحمد",
            "رقم الهوية": "1234567890",
            "تاريخ الميلاد": "2010-05-15",
            "المرحلة الدراسية": "سادس",
            الجنس: "ذكر",
            "البريد الإلكتروني للطالب": "student@example.com",
            "بريد ولي الأمر": "guardian@example.com",
            "رمز دولة ولي الأمر": "966",
            "هاتف ولي الأمر": "500000000",
            "الحالة الصحية": "سليم",
            "مستوى القراءة": "متوسط",
            "وقت الجلسة": "العصر",
            ملاحظات: "",
            الحلقة: "",
        },
    ];

    const downloadTemplate = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(AR_TEMPLATE_EXAMPLE, {
            header: AR_TEMPLATE_HEADERS,
        });
        ws["!cols"] = AR_TEMPLATE_HEADERS.map(() => ({ wch: 24 }));
        // تعليق توضيحي في الصف الثاني (بعد المثال)
        XLSX.utils.book_append_sheet(wb, ws, "قالب الطلاب");

        // ورقة ثانية للقيم المقبولة
        const helpData = [
            {
                الحقل: "المرحلة الدراسية",
                "القيم المقبولة":
                    "ابتدائي / متوسط / ثانوي (أو: أول ابتدائي، ثاني متوسط، ثالث ثانوي ...)",
            },
            { الحقل: "الجنس", "القيم المقبولة": "ذكر / أنثى" },
            {
                الحقل: "الحالة الصحية",
                "القيم المقبولة": "سليم / يحتاج متابعة / ذوي احتياجات",
            },
            {
                الحقل: "وقت الجلسة",
                "القيم المقبولة": "العصر / المغرب (اختياري)",
            },
            {
                الحقل: "رمز دولة ولي الأمر",
                "القيم المقبولة": "966 (السعودية) / 20 (مصر) / 971 (الإمارات)",
            },
            {
                الحقل: "تاريخ الميلاد",
                "القيم المقبولة":
                    "YYYY-MM-DD أو M/D/YYYY مثال: 2010-05-15 أو 5/15/2010",
            },
        ];
        const wsHelp = XLSX.utils.json_to_sheet(helpData);
        wsHelp["!cols"] = [{ wch: 22 }, { wch: 60 }];
        XLSX.utils.book_append_sheet(wb, wsHelp, "القيم المقبولة");

        XLSX.writeFile(wb, "قالب_تسجيل_الطلاب.xlsx");
    };

    const handleFile = (f: File) => {
        if (!f.name.match(/\.(xlsx|xls)$/i)) {
            alert("يرجى رفع ملف Excel فقط (.xlsx أو .xls)");
            return;
        }
        setFile(f);
        setResult(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setResult(null);
        try {
            const rawRows = await new Promise<any[]>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const wb = XLSX.read(e.target?.result, {
                            type: "binary",
                            cellDates: false,
                        });
                        const ws = wb.Sheets[wb.SheetNames[0]];
                        const rows = XLSX.utils.sheet_to_json(ws, {
                            defval: "",
                        });
                        resolve(rows as any[]);
                    } catch {
                        reject(new Error("فشل في قراءة الملف"));
                    }
                };
                reader.onerror = () => reject(new Error("فشل في قراءة الملف"));
                reader.readAsBinaryString(file);
            });

            if (!rawRows.length)
                throw new Error("الملف فارغ أو لا يحتوي على بيانات");

            // تحويل كل صف من العربي للـ API
            const students = rawRows.map(mapArabicRow);

            const r = await apiFetch("/api/v1/auth/student/import-register", {
                method: "POST",
                body: JSON.stringify({ students }),
            });

            setResult(r.data);
            if (r.data?.success_count > 0) onSuccess();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setUploading(false);
        }
    };

    const GRADE_OPTS = [
        "ابتدائي / أول ابتدائي / سادس ...",
        "متوسط / أول متوسط / ثالث متوسط ...",
        "ثانوي / ثاني ثانوي ...",
    ];

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 6000,
                background: "rgba(0,0,0,.55)",
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
                    maxWidth: 560,
                    maxHeight: "90vh",
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
                        justifyContent: "space-between",
                        flexShrink: 0,
                    }}
                >
                    <div>
                        <div
                            style={{
                                color: "#86efac",
                                fontSize: 11,
                                marginBottom: 2,
                            }}
                        >
                            استيراد جماعي
                        </div>
                        <div
                            style={{
                                color: "#fff",
                                fontWeight: 900,
                                fontSize: 17,
                            }}
                        >
                            رفع ملف الطلاب
                        </div>
                        <div
                            style={{
                                color: "#94a3b8",
                                fontSize: 11,
                                marginTop: 2,
                            }}
                        >
                            القالب والملف كلهم بالعربي ✓
                        </div>
                    </div>
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

                {/* Body */}
                <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                    {/* Step 1 */}
                    <div
                        style={{
                            background: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: 14,
                            padding: "14px 18px",
                            marginBottom: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: 14,
                                    color: "#0f6e56",
                                    marginBottom: 3,
                                }}
                            >
                                الخطوة 1: تحميل القالب
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>
                                قالب بالعربي كامل + ورقة القيم المقبولة
                            </div>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 7,
                                padding: "9px 18px",
                                borderRadius: 10,
                                border: "none",
                                background: "#0f6e56",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 700,
                                fontFamily: "inherit",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <FiDownload size={14} /> تحميل القالب
                        </button>
                    </div>

                    {/* Step 2 */}
                    <div
                        style={{
                            fontWeight: 900,
                            fontSize: 14,
                            color: "#1e293b",
                            marginBottom: 10,
                        }}
                    >
                        الخطوة 2: رفع الملف المعبأ
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: `2px dashed ${dragOver ? "#0f6e56" : file ? "#0f6e56" : "#cbd5e1"}`,
                            borderRadius: 14,
                            padding: "32px 20px",
                            textAlign: "center",
                            cursor: "pointer",
                            background: dragOver
                                ? "#f0fdf4"
                                : file
                                  ? "#f0fdf4"
                                  : "#f8fafc",
                            transition: "all .2s",
                            marginBottom: 16,
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            style={{ display: "none" }}
                            onChange={(e) =>
                                e.target.files?.[0] &&
                                handleFile(e.target.files[0])
                            }
                        />
                        {file ? (
                            <div>
                                <FiFileText
                                    size={32}
                                    color="#0f6e56"
                                    style={{ marginBottom: 8 }}
                                />
                                <div
                                    style={{
                                        fontWeight: 700,
                                        color: "#0f6e56",
                                        fontSize: 14,
                                    }}
                                >
                                    {file.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#64748b",
                                        marginTop: 4,
                                    }}
                                >
                                    {(file.size / 1024).toFixed(1)} KB — اضغط
                                    لتغيير الملف
                                </div>
                            </div>
                        ) : (
                            <div>
                                <FiUpload
                                    size={32}
                                    color="#94a3b8"
                                    style={{ marginBottom: 8 }}
                                />
                                <div
                                    style={{
                                        fontWeight: 700,
                                        color: "#475569",
                                        fontSize: 14,
                                    }}
                                >
                                    اسحب ملف Excel هنا أو اضغط للاختيار
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#94a3b8",
                                        marginTop: 4,
                                    }}
                                >
                                    يدعم .xlsx و .xls فقط
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: 12,
                            border: "none",
                            background:
                                !file || uploading ? "#e2e8f0" : "#0f6e56",
                            color: !file || uploading ? "#94a3b8" : "#fff",
                            cursor:
                                !file || uploading ? "not-allowed" : "pointer",
                            fontSize: 14,
                            fontWeight: 900,
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            transition: "all .2s",
                        }}
                    >
                        {uploading ? (
                            <>
                                <FiRefreshCw
                                    size={15}
                                    style={{
                                        animation: "spin 1s linear infinite",
                                    }}
                                />
                                جاري الرفع والمعالجة...
                            </>
                        ) : (
                            <>
                                <FiUpload size={15} /> رفع الملف وتسجيل الطلاب
                            </>
                        )}
                    </button>

                    {/* Result */}
                    {result && (
                        <div style={{ marginTop: 18 }}>
                            <div
                                style={{
                                    background:
                                        result.success_count > 0
                                            ? "#f0fdf4"
                                            : "#fef2f2",
                                    border: `1px solid ${result.success_count > 0 ? "#bbf7d0" : "#fecaca"}`,
                                    borderRadius: 14,
                                    padding: "14px 18px",
                                    marginBottom: result.errors.length ? 12 : 0,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 16,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {result.success_count > 0 && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                color: "#166534",
                                                fontWeight: 700,
                                                fontSize: 14,
                                            }}
                                        >
                                            <FiCheckCircle size={16} />
                                            تم تسجيل {result.success_count} طالب
                                            بنجاح
                                        </div>
                                    )}
                                    {result.failed_count > 0 && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                color: "#991b1b",
                                                fontWeight: 700,
                                                fontSize: 14,
                                            }}
                                        >
                                            <FiXCircle size={16} />
                                            فشل {result.failed_count} سطر
                                        </div>
                                    )}
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div
                                    style={{
                                        background: "#fef2f2",
                                        border: "1px solid #fecaca",
                                        borderRadius: 14,
                                        padding: "14px 18px",
                                        maxHeight: 200,
                                        overflowY: "auto",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            fontSize: 13,
                                            color: "#991b1b",
                                            marginBottom: 8,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                        }}
                                    >
                                        <FiAlertCircle size={14} /> تفاصيل
                                        الأخطاء
                                    </div>
                                    {result.errors.map((err, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                fontSize: 12,
                                                color: "#7f1d1d",
                                                paddingBottom: 4,
                                                borderBottom:
                                                    i < result.errors.length - 1
                                                        ? "1px solid #fecaca"
                                                        : "none",
                                                marginBottom: 4,
                                            }}
                                        >
                                            {err}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tips */}
                    <div
                        style={{
                            marginTop: 18,
                            background: "#f8fafc",
                            borderRadius: 12,
                            padding: "12px 16px",
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: "#475569",
                                marginBottom: 8,
                            }}
                        >
                            القيم المقبولة في الملف:
                        </div>
                        {[
                            [
                                "المرحلة الدراسية",
                                "ابتدائي / متوسط / ثانوي (أو: سادس، أول متوسط، ثاني ثانوي ...)",
                            ],
                            ["الجنس", "ذكر / أنثى"],
                            [
                                "الحالة الصحية",
                                "سليم / يحتاج متابعة / ذوي احتياجات",
                            ],
                            ["وقت الجلسة", "العصر / المغرب (اختياري)"],
                            ["رمز الدولة", "966 أو 20 أو 971"],
                            ["تاريخ الميلاد", "YYYY-MM-DD أو M/D/YYYY"],
                        ].map(([field, vals], i) => (
                            <div
                                key={i}
                                style={{
                                    fontSize: 11,
                                    color: "#64748b",
                                    marginBottom: 5,
                                    display: "flex",
                                    gap: 8,
                                    alignItems: "flex-start",
                                }}
                            >
                                <span
                                    style={{
                                        color: "#0f6e56",
                                        fontWeight: 900,
                                        minWidth: 90,
                                        flexShrink: 0,
                                    }}
                                >
                                    {field}:
                                </span>
                                <span>{vals}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
                    ) : activeTab === "info" ? (
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
                    ) : activeTab === "plan" ? (
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
                    ) : activeTab === "attendance" ? (
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
    const [showImport, setShowImport] = useState(false);
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
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            marginTop: 14,
                            flexWrap: "wrap",
                        }}
                    >
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
                        {/* ── زر الاستيراد الجماعي ── */}
                        <button
                            onClick={() => setShowImport(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "7px 14px",
                                borderRadius: 10,
                                border: "1px solid #86efac55",
                                background: "#16a34a33",
                                color: "#86efac",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiUpload size={12} /> استيراد طلاب
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

            {/* Import Modal */}
            {showImport && (
                <ImportModal
                    onClose={() => setShowImport(false)}
                    onSuccess={() => {
                        setShowImport(false);
                        fetchStudents(1);
                        showToast("تم استيراد الطلاب بنجاح ✓");
                    }}
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
