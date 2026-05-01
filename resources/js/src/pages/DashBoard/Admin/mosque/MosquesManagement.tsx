// MosquesManagement.tsx — نسخة مُعاد تصميمها + إصلاح كامل للإنشاء والتعديل والحذف
import React, { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import {
    FiPlus,
    FiSearch,
    FiX,
    FiEdit2,
    FiTrash2,
    FiEye,
    FiDownload,
    FiRefreshCw,
    FiCheckCircle,
    FiXCircle,
    FiMapPin,
    FiUser,
    FiCalendar,
    FiRotateCcw,
} from "react-icons/fi";
import { FaMosque } from "react-icons/fa";

/* ══════════════════════════════════════════════
   Types
══════════════════════════════════════════════ */
interface Mosque {
    id: number;
    name: string;
    circle?: string;
    circleId?: number;
    supervisor: string;
    supervisorId: number | null;
    logo: string | null;
    is_active: boolean;
    created_at: string;
    notes?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    supervisors: number;
}

/* ══════════════════════════════════════════════
   Constants
══════════════════════════════════════════════ */
const API = "/api/v1";
const PER_PAGE = 10;

const DEMO_MOSQUES: Mosque[] = [
    {
        id: 1,
        name: "مسجد النور",
        supervisor: "أحمد محمد علي",
        supervisorId: 1,
        circleId: 1,
        logo: null,
        is_active: true,
        created_at: "2024-01-10",
        notes: "المسجد الرئيسي للمجمع",
    },
    {
        id: 2,
        name: "مسجد الفتح",
        supervisor: "سارة إبراهيم",
        supervisorId: 2,
        circleId: 1,
        logo: null,
        is_active: true,
        created_at: "2024-02-15",
    },
    {
        id: 3,
        name: "مسجد الرحمة",
        supervisor: "محمود حسن",
        supervisorId: 3,
        circleId: 1,
        logo: null,
        is_active: false,
        created_at: "2023-11-01",
        notes: "تحت الصيانة حالياً",
    },
    {
        id: 4,
        name: "مسجد التقوى",
        supervisor: "فاطمة علي",
        supervisorId: 4,
        circleId: 1,
        logo: null,
        is_active: true,
        created_at: "2024-03-20",
    },
    {
        id: 5,
        name: "مسجد السلام",
        supervisor: "عمر خالد",
        supervisorId: 5,
        circleId: 1,
        logo: null,
        is_active: true,
        created_at: "2024-04-05",
    },
];

const DEMO_USERS: User[] = [
    { id: 1, name: "أحمد محمد علي", email: "a@ex.com" },
    { id: 2, name: "سارة إبراهيم", email: "s@ex.com" },
    { id: 3, name: "محمود حسن", email: "m@ex.com" },
    { id: 4, name: "فاطمة علي", email: "f@ex.com" },
    { id: 5, name: "عمر خالد", email: "o@ex.com" },
];

/* ══════════════════════════════════════════════
   Colors
══════════════════════════════════════════════ */
const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

/* ══════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════ */
const getCsrf = () =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") || "";

const apiFetchJSON = async (url: string, opts: RequestInit = {}) => {
    const res = await fetch(url, {
        credentials: "include",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": getCsrf(),
            ...(opts.headers || {}),
        },
        ...opts,
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((d as any).message || `HTTP ${res.status}`);
    return d;
};

// ✅ FormData: لا نضبط Content-Type — browser يضبطه مع boundary تلقائياً
const apiFetchForm = async (url: string, body: FormData, method = "POST") => {
    const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": getCsrf(),
        },
        body,
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((d as any).message || `HTTP ${res.status}`);
    return d;
};

const initials = (name: string) =>
    (name || "؟")
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");

/* ══════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════ */
const StatusBadge = ({ active }: { active: boolean }) => (
    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: active ? "#dcfce7" : "#fee2e2",
            color: active ? "#15803d" : "#b91c1c",
            border: `1px solid ${active ? "#bbf7d0" : "#fecaca"}`,
        }}
    >
        <span
            style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: active ? "#16a34a" : "#dc2626",
                display: "inline-block",
            }}
        />
        {active ? "نشط" : "معلق"}
    </span>
);

/* ══════════════════════════════════════════════
   Form Modal
══════════════════════════════════════════════ */
interface FormData_ {
    name: string;
    supervisorId: string;
    centerId: string;
    isActive: string;
    notes: string;
}

interface FormModalProps {
    title: string;
    submitLabel: string;
    users: User[];
    initial: FormData_;
    onClose: () => void;
    onSubmit: (d: FormData_) => Promise<void>;
}

const FormModal: React.FC<FormModalProps> = ({
    title,
    submitLabel,
    users,
    initial,
    onClose,
    onSubmit,
}) => {
    const [form, setForm] = useState<FormData_>(initial);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData_>>({});

    const set =
        (k: keyof FormData_) =>
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) =>
            setForm((p) => ({ ...p, [k]: e.target.value }));

    const validate = (): boolean => {
        const err: Partial<FormData_> = {};
        if (!form.name.trim()) err.name = "اسم المسجد مطلوب";
        if (!form.supervisorId) err.supervisorId = "يرجى اختيار مشرف";
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            await onSubmit(form);
            onClose();
        } catch {
            /* error shown by parent */
        } finally {
            setSaving(false);
        }
    };

    const overlay: React.CSSProperties = {
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    };
    const inp = (hasErr: boolean): React.CSSProperties => ({
        width: "100%",
        padding: "11px 14px",
        borderRadius: 10,
        border: `1.5px solid ${hasErr ? "#fca5a5" : "#e2e8f0"}`,
        background: hasErr ? "#fff5f5" : "#f8fafc",
        outline: "none",
        fontSize: 13,
        fontFamily: "inherit",
        color: "#1e293b",
        transition: "all .2s",
    });

    return (
        <div
            style={overlay}
            onClick={(e) => {
                if ((e.target as HTMLElement) === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 22,
                    width: "100%",
                    maxWidth: 580,
                    maxHeight: "90vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "'Tajawal',sans-serif",
                    direction: "rtl",
                }}
            >
                {/* header */}
                <div
                    style={{
                        background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                        padding: "22px 26px",
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
                    <div
                        style={{
                            fontSize: 11,
                            color: "#86efac",
                            marginBottom: 4,
                        }}
                    >
                        ﷽ — منصة إتقان
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: 16,
                            left: 16,
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            border: "none",
                            background: "rgba(255,255,255,.15)",
                            color: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                        }}
                    >
                        <FiX size={15} />
                    </button>
                </div>

                {/* body */}
                <div
                    style={{
                        padding: "22px 26px",
                        overflowY: "auto",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                    }}
                >
                    {/* mosque name */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#475569",
                                marginBottom: 6,
                            }}
                        >
                            اسم المسجد *
                        </label>
                        <input
                            value={form.name}
                            onChange={set("name")}
                            placeholder="مثال: مسجد النور"
                            style={inp(!!errors.name)}
                        />
                        {errors.name && (
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#dc2626",
                                    marginTop: 4,
                                }}
                            >
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 14,
                        }}
                    >
                        {/* supervisor */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#475569",
                                    marginBottom: 6,
                                }}
                            >
                                المشرف *
                            </label>
                            <select
                                value={form.supervisorId}
                                onChange={set("supervisorId")}
                                style={
                                    inp(
                                        !!errors.supervisorId,
                                    ) as React.CSSProperties
                                }
                            >
                                <option value="">اختر المشرف...</option>
                                {users.map((u) => (
                                    <option key={u.id} value={String(u.id)}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                            {errors.supervisorId && (
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#dc2626",
                                        marginTop: 4,
                                    }}
                                >
                                    {errors.supervisorId}
                                </div>
                            )}
                        </div>

                        {/* status */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#475569",
                                    marginBottom: 6,
                                }}
                            >
                                الحالة
                            </label>
                            <select
                                value={form.isActive}
                                onChange={set("isActive")}
                                style={inp(false) as React.CSSProperties}
                            >
                                <option value="1">نشط</option>
                                <option value="0">معلق</option>
                            </select>
                        </div>
                    </div>

                    {/* notes */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#475569",
                                marginBottom: 6,
                            }}
                        >
                            ملاحظات
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={set("notes")}
                            placeholder="ملاحظات إضافية..."
                            rows={3}
                            style={
                                {
                                    ...inp(false),
                                    resize: "vertical",
                                } as React.CSSProperties
                            }
                        />
                    </div>
                </div>

                {/* footer */}
                <div
                    style={{
                        padding: "16px 26px",
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: "9px 20px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            color: "#475569",
                            cursor: "pointer",
                            fontSize: 13,
                            fontFamily: "inherit",
                        }}
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={submit}
                        disabled={saving}
                        style={{
                            padding: "9px 22px",
                            borderRadius: 10,
                            border: "none",
                            background: saving ? "#94a3b8" : "#0f6e56",
                            color: "#fff",
                            cursor: saving ? "not-allowed" : "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        {saving ? (
                            "جاري الحفظ..."
                        ) : (
                            <>
                                <FiCheckCircle size={13} /> {submitLabel}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════
   Detail Modal
══════════════════════════════════════════════ */
const DetailModal: React.FC<{
    mosque: Mosque;
    onClose: () => void;
    onEdit: () => void;
}> = ({ mosque, onClose, onEdit }) => {
    const overlay: React.CSSProperties = {
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    };
    const row = (k: string, v: React.ReactNode) => (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #f8fafc",
            }}
        >
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                {v}
            </span>
        </div>
    );
    return (
        <div
            style={overlay}
            onClick={(e) => {
                if ((e.target as HTMLElement) === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: 22,
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
                <div
                    style={{
                        background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                        padding: "22px 26px",
                        color: "#fff",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            fontSize: 11,
                            color: "#86efac",
                            marginBottom: 4,
                        }}
                    >
                        تفاصيل المسجد
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>
                        🕌 {mosque.name}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: 16,
                            left: 16,
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            border: "none",
                            background: "rgba(255,255,255,.15)",
                            color: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <FiX size={15} />
                    </button>
                </div>
                <div
                    style={{
                        padding: "22px 26px",
                        overflowY: "auto",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 14,
                        }}
                    >
                        <div
                            style={{
                                background: "#f8fafc",
                                borderRadius: 12,
                                padding: "16px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "#94a3b8",
                                    marginBottom: 10,
                                    textTransform: "uppercase",
                                    letterSpacing: ".5px",
                                }}
                            >
                                🕌 بيانات المسجد
                            </div>
                            {row("الاسم", mosque.name)}
                            {row(
                                "الحالة",
                                <StatusBadge active={mosque.is_active} />,
                            )}
                            {row(
                                "تاريخ الإضافة",
                                mosque.created_at?.slice(0, 10) || "—",
                            )}
                            {row("المعرّف", `#${mosque.id}`)}
                        </div>
                        <div
                            style={{
                                background: "#f8fafc",
                                borderRadius: 12,
                                padding: "16px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "#94a3b8",
                                    marginBottom: 10,
                                    textTransform: "uppercase",
                                    letterSpacing: ".5px",
                                }}
                            >
                                👤 بيانات المشرف
                            </div>
                            {row("الاسم", mosque.supervisor || "غير محدد")}
                            {row("المعرّف", `#${mosque.supervisorId || "—"}`)}
                            {row("الدور", "مشرف رئيسي")}
                        </div>
                    </div>
                    {mosque.notes && (
                        <div
                            style={{
                                background: "#fffbeb",
                                border: "1px solid #fde68a",
                                borderRadius: 12,
                                padding: "14px 16px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "#92400e",
                                    marginBottom: 8,
                                }}
                            >
                                📝 ملاحظات
                            </div>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: "#78350f",
                                    lineHeight: 1.7,
                                }}
                            >
                                {mosque.notes}
                            </p>
                        </div>
                    )}
                </div>
                <div
                    style={{
                        padding: "16px 26px",
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: "9px 20px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            color: "#475569",
                            cursor: "pointer",
                            fontSize: 13,
                            fontFamily: "inherit",
                        }}
                    >
                        إغلاق
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            onEdit();
                        }}
                        style={{
                            padding: "9px 22px",
                            borderRadius: 10,
                            border: "none",
                            background: "#0f6e56",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <FiEdit2 size={13} /> تعديل
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════
   Confirm Modal
══════════════════════════════════════════════ */
const ConfirmModal: React.FC<{
    name: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}> = ({ name, onConfirm, onCancel, loading }) => (
    <div
        style={{
            position: "fixed",
            inset: 0,
            zIndex: 3000,
            background: "rgba(0,0,0,.55)",
            backdropFilter: "blur(5px)",
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
                padding: "32px 28px",
                maxWidth: 400,
                width: "100%",
                textAlign: "center",
                fontFamily: "'Tajawal',sans-serif",
                direction: "rtl",
            }}
        >
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    color: "#dc2626",
                }}
            >
                <FiTrash2 size={24} />
            </div>
            <div
                style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: "#1e293b",
                    marginBottom: 8,
                }}
            >
                حذف المسجد
            </div>
            <div
                style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 24,
                    lineHeight: 1.7,
                }}
            >
                هل أنت متأكد من حذف <strong>"{name}"</strong>؟<br />
                لا يمكن التراجع عن هذا الإجراء.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: "9px 22px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        color: "#475569",
                        cursor: "pointer",
                        fontSize: 13,
                        fontFamily: "inherit",
                    }}
                >
                    إلغاء
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    style={{
                        padding: "9px 22px",
                        borderRadius: 10,
                        border: "none",
                        background: "#dc2626",
                        color: "#fff",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "inherit",
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? "جاري الحذف..." : "تأكيد الحذف"}
                </button>
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════
   Toast Hook
══════════════════════════════════════════════ */
const useToastLocal = () => {
    const [toast, setToast] = useState<{
        msg: string;
        type: "success" | "error";
    } | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const notify = useCallback(
        (msg: string, type: "success" | "error" = "success") => {
            setToast({ msg, type });
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => setToast(null), 3200);
        },
        [],
    );
    return { toast, notify };
};

/* ══════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════ */
const MosquesManagement: React.FC = () => {
    const [mosques, setMosques] = useState<Mosque[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filtered, setFiltered] = useState<Mosque[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [stats, setStats] = useState<Stats>({
        total: 0,
        active: 0,
        inactive: 0,
        supervisors: 0,
    });
    const [sessionRunning, setSessionRunning] = useState(false);

    // ✅ الإصلاح الرئيسي: نخزن center_id من الـ API response
    const [centerId, setCenterId] = useState<number | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [editMosque, setEditMosque] = useState<Mosque | null>(null);
    const [detailMosque, setDetailMosque] = useState<Mosque | null>(null);
    const [deleteMosque, setDeleteMosque] = useState<Mosque | null>(null);

    const { toast, notify } = useToastLocal();

    /* ── Load ── */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetchJSON(`${API}/super/mosques`);
            const list: Mosque[] = data.data || [];
            const us: User[] = data.users || [];

            // ✅ استخرج center_id من أول مسجد أو من مصفوفة centers
            const resolvedCenterId: number | null =
                data.centers?.[0]?.id ?? list[0]?.circleId ?? null;
            setCenterId(resolvedCenterId);

            setMosques(list);
            setUsers(us);
            calcStats(list);
        } catch {
            // Demo fallback
            setMosques(DEMO_MOSQUES);
            setUsers(DEMO_USERS);
            setCenterId(DEMO_MOSQUES[0]?.circleId ?? 1);
            calcStats(DEMO_MOSQUES);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const calcStats = (list: Mosque[]) => {
        const active = list.filter((m) => m.is_active).length;
        const sups = new Set(list.map((m) => m.supervisorId).filter(Boolean))
            .size;
        setStats({
            total: list.length,
            active,
            inactive: list.length - active,
            supervisors: sups,
        });
    };

    /* ── Filter ── */
    useEffect(() => {
        const q = search.toLowerCase().trim();
        const result = mosques.filter((m) => {
            const matchQ =
                !q ||
                m.name.toLowerCase().includes(q) ||
                (m.supervisor || "").toLowerCase().includes(q);
            const matchS =
                !statusFilter ||
                (statusFilter === "active" ? m.is_active : !m.is_active);
            return matchQ && matchS;
        });
        setFiltered(result);
        setPage(1);
    }, [search, statusFilter, mosques]);

    /* ── Pagination ── */
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    /* ═══════════════════════════════
       ✅ Create — مُصلح: يبعت center_id
    ═══════════════════════════════ */
    const handleCreate = async (form: FormData_) => {
        if (!centerId) {
            notify("لم يتم تحديد المركز، يرجى إعادة تحميل الصفحة", "error");
            throw new Error("no center_id");
        }

        const body = new FormData();
        body.append("mosque_name", form.name.trim());
        body.append("supervisor_id", form.supervisorId);
        body.append("center_id", String(centerId)); // ✅ الإصلاح الأساسي
        body.append("is_active", form.isActive);
        if (form.notes.trim()) body.append("notes", form.notes.trim());

        try {
            await apiFetchForm(`${API}/super/mosques`, body, "POST");
            notify("تم إضافة المسجد بنجاح ✓");
            load();
        } catch (e: any) {
            notify(e.message || "حدث خطأ أثناء الإضافة", "error");
            throw e;
        }
    };

    /* ═══════════════════════════════
       ✅ Update — مُصلح: يبعت center_id
    ═══════════════════════════════ */
    const handleEdit = async (form: FormData_) => {
        if (!editMosque) return;

        const body = new FormData();
        body.append("_method", "PUT"); // Laravel method spoofing
        body.append("mosque_name", form.name.trim());
        body.append("supervisor_id", form.supervisorId);
        // ✅ نبعت center_id الخاص بالمسجد نفسه (أو الـ centerId العام)
        const cId = editMosque.circleId ?? centerId;
        if (cId) body.append("center_id", String(cId));
        body.append("is_active", form.isActive);
        if (form.notes.trim()) body.append("notes", form.notes.trim());

        try {
            await apiFetchForm(
                `${API}/super/mosques/${editMosque.id}`,
                body,
                "POST",
            );
            notify("تم تحديث بيانات المسجد بنجاح ✓");
            load();
        } catch (e: any) {
            notify(e.message || "حدث خطأ أثناء التحديث", "error");
            throw e;
        }
    };

    /* ═══════════════════════════════
       ✅ Delete
    ═══════════════════════════════ */
    const handleDelete = async () => {
        if (!deleteMosque) return;
        setDeleting(true);
        try {
            await apiFetchJSON(`${API}/super/mosques/${deleteMosque.id}`, {
                method: "DELETE",
            });
            notify("تم حذف المسجد بنجاح ✓");
            setMosques((prev) => {
                const updated = prev.filter((m) => m.id !== deleteMosque.id);
                calcStats(updated);
                return updated;
            });
        } catch (e: any) {
            notify(e.message || "حدث خطأ أثناء الحذف", "error");
        } finally {
            setDeleting(false);
            setDeleteMosque(null);
        }
    };

    /* ── Export ── */
    const handleExport = () => {
        if (!mosques.length) {
            notify("لا توجد بيانات للتصدير", "error");
            return;
        }
        const rows = mosques.map((m) => ({
            "اسم المسجد": m.name,
            المشرف: m.supervisor || "—",
            الحالة: m.is_active ? "نشط" : "معلق",
            "تاريخ الإضافة": m.created_at?.slice(0, 10) || "—",
            ملاحظات: m.notes || "",
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [
            { wch: 30 },
            { wch: 25 },
            { wch: 12 },
            { wch: 16 },
            { wch: 30 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, "المساجد");
        XLSX.writeFile(
            wb,
            `المساجد_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.xlsx`,
        );
        notify(`تم تصدير ${mosques.length} مسجد ✓`);
    };

    /* ── Shared button styles ── */
    const editBtn: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 11px",
        borderRadius: 8,
        border: "1px solid #B5D4F4",
        background: "#E6F1FB",
        color: "#0C447C",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "inherit",
    };
    const delBtn: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 11px",
        borderRadius: 8,
        border: "1px solid #fecaca",
        background: "#fee2e2",
        color: "#b91c1c",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "inherit",
    };
    const viewBtn: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 11px",
        borderRadius: 8,
        border: "1px solid #fde68a",
        background: "#fef9c3",
        color: "#92400e",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "inherit",
    };

    const TH: React.CSSProperties = {
        padding: "10px 16px",
        textAlign: "right",
        color: "#64748b",
        fontWeight: 700,
        fontSize: 11,
        whiteSpace: "nowrap",
        borderBottom: "1px solid #f1f5f9",
        background: "#f8fafc",
    };
    const TD: React.CSSProperties = {
        padding: "13px 16px",
        borderBottom: "1px solid #f8fafc",
        verticalAlign: "middle",
        fontSize: 13,
        color: "#1e293b",
    };

    /* ════════════════════════════════════════
       RENDER
    ════════════════════════════════════════ */
    return (
        <div
            style={{
                fontFamily: "'Tajawal',sans-serif",
                direction: "rtl",
                background: "#f8fafc",
                minHeight: "100vh",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            {/* ── Modals ── */}
            {showCreate && (
                <FormModal
                    title="إضافة مسجد جديد"
                    submitLabel="إضافة المسجد"
                    users={users}
                    initial={{
                        name: "",
                        supervisorId: "",
                        centerId: String(centerId ?? ""),
                        isActive: "1",
                        notes: "",
                    }}
                    onClose={() => setShowCreate(false)}
                    onSubmit={handleCreate}
                />
            )}
            {editMosque && (
                <FormModal
                    title="تعديل بيانات المسجد"
                    submitLabel="حفظ التعديلات"
                    users={users}
                    initial={{
                        name: editMosque.name,
                        supervisorId: String(editMosque.supervisorId || ""),
                        centerId: String(editMosque.circleId ?? centerId ?? ""),
                        isActive: editMosque.is_active ? "1" : "0",
                        notes: editMosque.notes || "",
                    }}
                    onClose={() => setEditMosque(null)}
                    onSubmit={handleEdit}
                />
            )}
            {detailMosque && (
                <DetailModal
                    mosque={detailMosque}
                    onClose={() => setDetailMosque(null)}
                    onEdit={() => {
                        setDetailMosque(null);
                        setEditMosque(detailMosque);
                    }}
                />
            )}
            {deleteMosque && (
                <ConfirmModal
                    name={deleteMosque.name}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteMosque(null)}
                    loading={deleting}
                />
            )}

            {/* ── Toast ── */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 24,
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "12px 24px",
                        borderRadius: 50,
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        zIndex: 4000,
                        background:
                            toast.type === "success" ? "#0f6e56" : "#dc2626",
                        color: "#fff",
                        boxShadow: "0 8px 32px #0004",
                        animation: "mosq-toast .3s ease",
                        pointerEvents: "none",
                        fontFamily: "'Tajawal',sans-serif",
                    }}
                >
                    {toast.type === "success" ? (
                        <FiCheckCircle size={15} />
                    ) : (
                        <FiXCircle size={15} />
                    )}
                    {toast.msg}
                </div>
            )}

            {/* ══════════════════════════════
                HERO HEADER
            ══════════════════════════════ */}
            <div
                style={{
                    background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                    borderRadius: 24,
                    padding: "28px 32px",
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
                        backgroundSize: "24px 24px",
                        pointerEvents: "none",
                    }}
                />
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 16,
                            marginBottom: 22,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#86efac",
                                    marginBottom: 4,
                                    letterSpacing: ".5px",
                                }}
                            >
                                ﷽ — منصة إتقان
                            </div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: 22,
                                    fontWeight: 900,
                                }}
                            >
                                إدارة المساجد
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                إدارة شاملة للمساجد وإحصائياتها ومشرفيها
                            </p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexWrap: "wrap",
                            }}
                        >
                            {sessionRunning && (
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        background: "rgba(255,255,255,.1)",
                                        padding: "5px 12px",
                                        borderRadius: 20,
                                        fontSize: 11,
                                        color: "rgba(255,255,255,.8)",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: "50%",
                                            background: "#4ade80",
                                            display: "inline-block",
                                            animation:
                                                "mosq-pulse 1.4s ease-in-out infinite",
                                        }}
                                    />
                                    جلسة جارية
                                </span>
                            )}
                            <button
                                onClick={() => setSessionRunning((p) => !p)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "7px 14px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,.2)",
                                    background: sessionRunning
                                        ? "#dc2626"
                                        : "rgba(255,255,255,.12)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                {sessionRunning ? (
                                    <>
                                        <FiXCircle size={12} /> إيقاف
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle size={12} /> بدء الجلسة
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowCreate(true)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "7px 14px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,.2)",
                                    background: "rgba(255,255,255,.12)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                <FiPlus size={12} /> مسجد جديد
                            </button>
                            <button
                                onClick={handleExport}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "7px 14px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,.2)",
                                    background: "rgba(255,255,255,.12)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                <FiDownload size={12} /> Excel
                            </button>
                            <button
                                onClick={load}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "7px 14px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,.2)",
                                    background: "rgba(255,255,255,.12)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                <FiRefreshCw size={12} /> تحديث
                            </button>
                        </div>
                    </div>

                    {/* stats bar */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            {
                                label: "إجمالي المساجد",
                                value: stats.total,
                                color: "rgba(255,255,255,.9)",
                            },
                            {
                                label: "نشط",
                                value: stats.active,
                                color: "#4ade80",
                            },
                            {
                                label: "معلق",
                                value: stats.inactive,
                                color: "#f87171",
                            },
                            {
                                label: "المشرفون",
                                value: stats.supervisors,
                                color: "#fbbf24",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                style={{
                                    background: "rgba(255,255,255,.07)",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    textAlign: "center",
                                    minWidth: 80,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 900,
                                        color: s.color,
                                        lineHeight: 1,
                                    }}
                                >
                                    {s.value}
                                </div>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "rgba(255,255,255,.45)",
                                        marginTop: 3,
                                    }}
                                >
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════
                TABLE CARD
            ══════════════════════════════ */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    boxShadow: "0 2px 14px #0001",
                    overflow: "hidden",
                }}
            >
                {/* header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        flexWrap: "wrap",
                        gap: 10,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontWeight: 900,
                                fontSize: 15,
                                color: "#1e293b",
                            }}
                        >
                            قائمة المساجد
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            {search || statusFilter
                                ? `${filtered.length} نتيجة من ${mosques.length}`
                                : `${mosques.length} مسجد`}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 16px",
                            borderRadius: 10,
                            border: "none",
                            background: "#0f6e56",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "inherit",
                        }}
                    >
                        <FiPlus size={14} /> مسجد جديد
                    </button>
                </div>

                {/* toolbar */}
                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        padding: "12px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        background: "#fafbfc",
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            background: "#fff",
                            borderRadius: 10,
                            padding: "7px 12px",
                            flex: 1,
                            minWidth: 200,
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <FiSearch size={13} color="#94a3b8" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث باسم المسجد أو المشرف..."
                            style={{
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: 12,
                                flex: 1,
                                fontFamily: "inherit",
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
                                <FiX size={11} />
                            </button>
                        )}
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 10,
                            padding: "7px 12px",
                            fontSize: 12,
                            fontFamily: "inherit",
                            background: "#fff",
                            color: "#1e293b",
                            cursor: "pointer",
                            outline: "none",
                            minWidth: 130,
                        }}
                    >
                        <option value="">كل الحالات</option>
                        <option value="active">نشط</option>
                        <option value="inactive">معلق</option>
                    </select>
                    {(search || statusFilter) && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("");
                            }}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 12px",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                color: "#64748b",
                                cursor: "pointer",
                                fontSize: 12,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiRotateCcw size={11} /> مسح
                        </button>
                    )}
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {filtered.length} نتيجة
                    </span>
                </div>

                {/* table */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                margin: "0 auto",
                                border: "3px solid #dbeafe",
                                borderTopColor: "#2563eb",
                                borderRadius: "50%",
                                animation: "mosq-spin .7s linear infinite",
                            }}
                        />
                    </div>
                ) : pageData.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "50px 20px",
                            color: "#94a3b8",
                        }}
                    >
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🕌</div>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                marginBottom: 4,
                            }}
                        >
                            {search || statusFilter
                                ? "لا توجد نتائج مطابقة"
                                : "لا توجد مساجد بعد"}
                        </div>
                        <div style={{ fontSize: 12, marginBottom: 20 }}>
                            أضف أول مسجد الآن
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "9px 20px",
                                borderRadius: 10,
                                border: "none",
                                background: "#0f6e56",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiPlus size={14} /> إضافة مسجد
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={TH}>المسجد</th>
                                    <th style={TH}>المشرف</th>
                                    <th style={TH}>الحالة</th>
                                    <th style={TH}>تاريخ الإضافة</th>
                                    <th style={TH}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.map((m, idx) => {
                                    const av =
                                        AV_COLORS[idx % AV_COLORS.length];
                                    const supAv =
                                        AV_COLORS[(idx + 2) % AV_COLORS.length];
                                    return (
                                        <tr
                                            key={m.id}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#f8fafc")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#fff")
                                            }
                                            style={{
                                                transition: "background .1s",
                                            }}
                                        >
                                            {/* mosque cell */}
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 12,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 42,
                                                            height: 42,
                                                            borderRadius: 12,
                                                            background: av.bg,
                                                            color: av.color,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: 18,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        🕌
                                                    </div>
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontWeight: 700,
                                                                fontSize: 14,
                                                            }}
                                                        >
                                                            {m.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#94a3b8",
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            أُضيف{" "}
                                                            {m.created_at?.slice(
                                                                0,
                                                                10,
                                                            ) || "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* supervisor cell */}
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 10,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 34,
                                                            height: 34,
                                                            borderRadius: "50%",
                                                            background:
                                                                supAv.bg,
                                                            color: supAv.color,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            flexShrink: 0,
                                                            border: `2px solid ${supAv.color}22`,
                                                        }}
                                                    >
                                                        {initials(m.supervisor)}
                                                    </div>
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontWeight: 600,
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            {m.supervisor ||
                                                                "غير محدد"}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#94a3b8",
                                                            }}
                                                        >
                                                            مشرف
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={TD}>
                                                <StatusBadge
                                                    active={m.is_active}
                                                />
                                            </td>
                                            <td
                                                style={{
                                                    ...TD,
                                                    color: "#64748b",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {m.created_at?.slice(0, 10) ||
                                                    "—"}
                                            </td>

                                            {/* actions */}
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <button
                                                        style={viewBtn}
                                                        onClick={() =>
                                                            setDetailMosque(m)
                                                        }
                                                    >
                                                        <FiEye size={11} /> عرض
                                                    </button>
                                                    <button
                                                        style={editBtn}
                                                        onClick={() =>
                                                            setEditMosque(m)
                                                        }
                                                    >
                                                        <FiEdit2 size={11} />{" "}
                                                        تعديل
                                                    </button>
                                                    <button
                                                        style={delBtn}
                                                        onClick={() =>
                                                            setDeleteMosque(m)
                                                        }
                                                    >
                                                        <FiTrash2 size={11} />{" "}
                                                        حذف
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

                {/* pagination */}
                {totalPages > 1 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 20px",
                            borderTop: "1px solid #f1f5f9",
                            fontSize: 11,
                        }}
                    >
                        <span style={{ color: "#94a3b8" }}>
                            عرض {(page - 1) * PER_PAGE + 1}–
                            {Math.min(page * PER_PAGE, filtered.length)} من{" "}
                            {filtered.length} · الصفحة {page} من {totalPages}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button
                                onClick={() => setPage((p) => p - 1)}
                                disabled={page === 1}
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    cursor:
                                        page === 1 ? "not-allowed" : "pointer",
                                    fontSize: 12,
                                    fontFamily: "inherit",
                                    opacity: page === 1 ? 0.4 : 1,
                                }}
                            >
                                السابق
                            </button>
                            {Array.from(
                                { length: Math.min(totalPages, 5) },
                                (_, i) => {
                                    const n =
                                        Math.max(
                                            1,
                                            Math.min(page - 2, totalPages - 4),
                                        ) + i;
                                    return (
                                        <button
                                            key={n}
                                            onClick={() => setPage(n)}
                                            style={
                                                {
                                                    padding: "5px 12px",
                                                    borderRadius: 8,
                                                    border: "none",
                                                    background:
                                                        n === page
                                                            ? "#1e293b"
                                                            : "#f8fafc",
                                                    color:
                                                        n === page
                                                            ? "#fff"
                                                            : "#475569",
                                                    cursor: "pointer",
                                                    fontSize: 12,
                                                    fontWeight:
                                                        n === page ? 700 : 400,
                                                    fontFamily: "inherit",
                                                    border:
                                                        n === page
                                                            ? "none"
                                                            : "1px solid #e2e8f0",
                                                } as React.CSSProperties
                                            }
                                        >
                                            {n}
                                        </button>
                                    );
                                },
                            )}
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page === totalPages}
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    cursor:
                                        page === totalPages
                                            ? "not-allowed"
                                            : "pointer",
                                    fontSize: 12,
                                    fontFamily: "inherit",
                                    opacity: page === totalPages ? 0.4 : 1,
                                }}
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}

                {/* footer add */}
                {pageData.length > 0 && (
                    <div
                        style={{
                            padding: "12px 20px",
                            borderTop: "1px solid #f1f5f9",
                            background: "#fafbfc",
                        }}
                    >
                        <button
                            onClick={() => setShowCreate(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "7px 16px",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                color: "#0f6e56",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiPlus size={13} /> إضافة مسجد آخر
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes mosq-spin  { to { transform: rotate(360deg); } }
                @keyframes mosq-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
                @keyframes mosq-toast { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
            `}</style>
        </div>
    );
};

export default MosquesManagement;
