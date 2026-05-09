// TeacherAchievementsManagement.tsx — نسخة مُعاد تصميمها بالكامل
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    FiSearch,
    FiX,
    FiGrid,
    FiList,
    FiRotateCcw,
    FiTrash2,
    FiEdit2,
    FiPlus,
    FiMinus,
    FiCheckCircle,
    FiXCircle,
    FiStar,
    FiAward,
} from "react-icons/fi";

/* ══════════════════════════════════════════════
   Types
══════════════════════════════════════════════ */
type PointsAction = "added" | "deducted";
type ViewMode = "table" | "cards";

interface StudentRow {
    id: number;
    name: string;
    email: string;
    phone?: string;
    total_points: number;
    added_points: number;
    deducted_points: number;
    status?: string;
}

interface AchievementRow {
    id: number;
    points: number;
    points_action: PointsAction;
    total_points: number;
    added_points: number;
    deducted_points: number;
    achievements: Record<string, any>;
    reason: string;
    achievement_type?: string;
    created_at_formatted: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        center_id?: number;
    };
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PointsForm {
    points: number;
    points_action: PointsAction;
    reason: string;
}

/* ══════════════════════════════════════════════
   Colors / helpers
══════════════════════════════════════════════ */
const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

const getCsrf = () =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") || "";

const apiFetch = async (url: string, opts: RequestInit = {}) => {
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

/* ══════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════ */
const Avatar = ({ name, idx }: { name: string; idx: number }) => {
    const av = AV_COLORS[idx % AV_COLORS.length];
    const initials = name
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
                fontWeight: 700,
                flexShrink: 0,
                fontFamily: "'Tajawal',sans-serif",
            }}
        >
            {initials}
        </div>
    );
};

const PointsBadge = ({ points }: { points: number }) => {
    const pos = points > 0;
    const zero = points === 0;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: zero ? "#f1f5f9" : pos ? "#dcfce7" : "#fee2e2",
                color: zero ? "#64748b" : pos ? "#15803d" : "#b91c1c",
                border: `1px solid ${zero ? "#e2e8f0" : pos ? "#bbf7d0" : "#fecaca"}`,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
            }}
        >
            {pos ? "+" : ""}
            {points}
            {points >= 100 && " "}
            {points >= 100 && <FiStar size={10} style={{ color: "#d97706" }} />}
        </span>
    );
};

const ActionBadge = ({ action }: { action: PointsAction }) => (
    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: action === "added" ? "#dcfce7" : "#fee2e2",
            color: action === "added" ? "#15803d" : "#b91c1c",
            border: `1px solid ${action === "added" ? "#bbf7d0" : "#fecaca"}`,
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
        }}
    >
        {action === "added" ? <FiPlus size={9} /> : <FiMinus size={9} />}
        {action === "added" ? "إضافة" : "خصم"}
    </span>
);

/* ── Toast ── */
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

/* ── Points Modal ── */
const PointsModal = ({
    title,
    subtitle,
    form,
    setForm,
    onSubmit,
    onClose,
    submitting,
}: {
    title: string;
    subtitle?: string;
    form: PointsForm;
    setForm: React.Dispatch<React.SetStateAction<PointsForm>>;
    onSubmit: () => void;
    onClose: () => void;
    submitting: boolean;
}) => (
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
            fontFamily: "'Tajawal',sans-serif",
            direction: "rtl",
        }}
    >
        <div
            style={{
                background: "#fff",
                borderRadius: 22,
                width: "100%",
                maxWidth: 440,
                overflow: "hidden",
                boxShadow: "0 20px 60px #0003",
            }}
        >
            {/* header */}
            <div
                style={{
                    background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                    padding: "20px 24px",
                    color: "#fff",
                    position: "relative",
                }}
            >
                <div
                    style={{ fontSize: 11, color: "#86efac", marginBottom: 3 }}
                >
                    ﷽ — منصة إتقان
                </div>
                <div style={{ fontSize: 17, fontWeight: 900 }}>{title}</div>
                {subtitle && (
                    <div
                        style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,.55)",
                            marginTop: 2,
                        }}
                    >
                        {subtitle}
                    </div>
                )}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 14,
                        left: 14,
                        width: 30,
                        height: 30,
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
                    <FiX size={14} />
                </button>
            </div>
            {/* body */}
            <div
                style={{
                    padding: "22px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                {/* action toggle */}
                <div style={{ display: "flex", gap: 8 }}>
                    {(["added", "deducted"] as PointsAction[]).map((a) => (
                        <button
                            key={a}
                            onClick={() =>
                                setForm((p) => ({ ...p, points_action: a }))
                            }
                            style={{
                                flex: 1,
                                padding: "9px 0",
                                borderRadius: 10,
                                border: `2px solid ${form.points_action === a ? (a === "added" ? "#0f6e56" : "#dc2626") : "#e2e8f0"}`,
                                background:
                                    form.points_action === a
                                        ? a === "added"
                                            ? "#f0fdf4"
                                            : "#fef2f2"
                                        : "#f8fafc",
                                color:
                                    form.points_action === a
                                        ? a === "added"
                                            ? "#0f6e56"
                                            : "#dc2626"
                                        : "#64748b",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 700,
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                transition: "all .15s",
                            }}
                        >
                            {a === "added" ? (
                                <FiPlus size={13} />
                            ) : (
                                <FiMinus size={13} />
                            )}
                            {a === "added" ? "إضافة نقاط" : "خصم نقاط"}
                        </button>
                    ))}
                </div>
                {/* points */}
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
                        عدد النقاط
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={form.points}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                points: Math.max(1, Number(e.target.value)),
                            }))
                        }
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            fontSize: 13,
                            fontFamily: "inherit",
                            outline: "none",
                            boxSizing: "border-box",
                        }}
                    />
                </div>
                {/* reason */}
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
                        السبب *
                    </label>
                    <input
                        placeholder="سبب الإضافة أو الخصم..."
                        value={form.reason}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, reason: e.target.value }))
                        }
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            fontSize: 13,
                            fontFamily: "inherit",
                            outline: "none",
                            boxSizing: "border-box",
                        }}
                    />
                </div>
            </div>
            {/* footer */}
            <div
                style={{
                    padding: "14px 24px",
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
                    onClick={onSubmit}
                    disabled={submitting}
                    style={{
                        padding: "9px 22px",
                        borderRadius: 10,
                        border: "none",
                        background:
                            form.points_action === "added"
                                ? "#0f6e56"
                                : "#dc2626",
                        color: "#fff",
                        cursor: submitting ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "inherit",
                        opacity: submitting ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    {submitting ? (
                        "جاري..."
                    ) : (
                        <>
                            <FiCheckCircle size={13} /> تأكيد
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
);

/* ── Confirm Modal ── */
const ConfirmModal = ({
    onConfirm,
    onCancel,
    loading,
}: {
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}) => (
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
            fontFamily: "'Tajawal',sans-serif",
            direction: "rtl",
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
            }}
        >
            <div
                style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    color: "#dc2626",
                }}
            >
                <FiTrash2 size={22} />
            </div>
            <div
                style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#1e293b",
                    marginBottom: 8,
                }}
            >
                حذف الإنجاز
            </div>
            <div
                style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 24,
                    lineHeight: 1.7,
                }}
            >
                هل أنت متأكد من حذف هذا الإنجاز؟ لا يمكن التراجع.
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
                    {loading ? "جاري..." : "تأكيد الحذف"}
                </button>
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════ */
const TeacherAchievementsManagement: React.FC = () => {
    const { notify, toast } = useToastLocal();

    /* ── state: students ── */
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [studPagi, setStudPagi] = useState<Pagination | null>(null);
    const [studPage, setStudPage] = useState(1);
    const [studSearch, setStudSearch] = useState("");
    const [loadingStudents, setLoadingStudents] = useState(true);

    /* ── state: achievements ── */
    const [achievements, setAchievements] = useState<AchievementRow[]>([]);
    const [achPagi, setAchPagi] = useState<Pagination | null>(null);
    const [achPage, setAchPage] = useState(1);
    const [achSearch, setAchSearch] = useState("");
    const [loadingAch, setLoadingAch] = useState(true);

    /* ── ui ── */
    const [tab, setTab] = useState<"students" | "achievements">("students");
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sessionRunning, setSessionRunning] = useState(false);

    /* ── modals ── */
    const [showSingle, setShowSingle] = useState(false);
    const [singleStudent, setSingleStudent] = useState<StudentRow | null>(null);
    const [singleForm, setSingleForm] = useState<PointsForm>({
        points: 10,
        points_action: "added",
        reason: "",
    });
    const [submittingSingle, setSubmittingSingle] = useState(false);

    const [showBulk, setShowBulk] = useState(false);
    const [bulkForm, setBulkForm] = useState<PointsForm>({
        points: 10,
        points_action: "added",
        reason: "",
    });
    const [submittingBulk, setSubmittingBulk] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editAch, setEditAch] = useState<AchievementRow | null>(null);
    const [editForm, setEditForm] = useState<PointsForm>({
        points: 10,
        points_action: "added",
        reason: "",
    });
    const [submittingEdit, setSubmittingEdit] = useState(false);

    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    /* ── fetch students ── */
    const fetchStudents = useCallback(
        async (page = 1, search = "") => {
            setLoadingStudents(true);
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    per_page: "12",
                    ...(search ? { search } : {}),
                });
                const data = await apiFetch(
                    `/api/v1/teacher/students?${params}`,
                );
                setStudents(data.data || []);
                setStudPagi({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    per_page: data.per_page,
                    total: data.total,
                });
            } catch (e: any) {
                notify(e.message || "فشل في تحميل الطلاب", "error");
            } finally {
                setLoadingStudents(false);
            }
        },
        [notify],
    );

    /* ── fetch achievements ── */
    const fetchAchievements = useCallback(
        async (page = 1, search = "") => {
            setLoadingAch(true);
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    per_page: "15",
                    ...(search ? { search } : {}),
                });
                const data = await apiFetch(
                    `/api/v1/teacher/achievements?${params}`,
                );
                setAchievements(data.data || []);
                setAchPagi({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    per_page: data.per_page,
                    total: data.total,
                });
            } catch (e: any) {
                notify(e.message || "فشل في تحميل الإنجازات", "error");
            } finally {
                setLoadingAch(false);
            }
        },
        [notify],
    );

    useEffect(() => {
        fetchStudents(studPage, studSearch);
    }, [studPage, studSearch]);
    useEffect(() => {
        fetchAchievements(achPage, achSearch);
    }, [achPage, achSearch]);

    /* ── stats ── */
    const totalPoints = students.reduce((a, s) => a + s.total_points, 0);
    const topStudent = students.reduce(
        (top, s) => (!top || s.total_points > top.total_points ? s : top),
        null as StudentRow | null,
    );
    const avgPoints = students.length
        ? Math.round(totalPoints / students.length)
        : 0;

    /* ── bulk select ── */
    const allSelected =
        students.length > 0 && selectedIds.length === students.length;
    const toggleAll = () =>
        setSelectedIds(allSelected ? [] : students.map((s) => s.id));
    const toggleOne = (id: number) =>
        setSelectedIds((p) =>
            p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
        );

    /* ── handlers ── */
    const openSingle = (student: StudentRow) => {
        setSingleStudent(student);
        setSingleForm({ points: 10, points_action: "added", reason: "" });
        setShowSingle(true);
    };

    const submitSingle = async () => {
        if (!singleStudent) return;
        if (!singleForm.reason.trim()) {
            notify("أدخل السبب", "error");
            return;
        }
        setSubmittingSingle(true);
        try {
            await apiFetch("/api/v1/teacher/achievements", {
                method: "POST",
                body: JSON.stringify({
                    user_id: singleStudent.id,
                    ...singleForm,
                }),
            });
            notify("تم تحديث النقاط بنجاح");
            setShowSingle(false);
            fetchStudents(studPage, studSearch);
            if (tab === "achievements") fetchAchievements(achPage, achSearch);
        } catch (e: any) {
            notify(e.message || "فشل", "error");
        } finally {
            setSubmittingSingle(false);
        }
    };

    const submitBulk = async () => {
        if (!selectedIds.length) {
            notify("اختر طلاباً أولاً", "error");
            return;
        }
        if (!bulkForm.reason.trim()) {
            notify("أدخل السبب", "error");
            return;
        }
        setSubmittingBulk(true);
        try {
            const res = await apiFetch("/api/v1/teacher/achievements/bulk", {
                method: "POST",
                body: JSON.stringify({ user_ids: selectedIds, ...bulkForm }),
            });
            notify(res.message || "تم بنجاح");
            setSelectedIds([]);
            setShowBulk(false);
            fetchStudents(studPage, studSearch);
        } catch (e: any) {
            notify(e.message || "فشل", "error");
        } finally {
            setSubmittingBulk(false);
        }
    };

    const openEdit = (ach: AchievementRow) => {
        setEditAch(ach);
        setEditForm({
            points: Math.abs(ach.points),
            points_action: ach.points_action,
            reason: ach.reason,
        });
        setShowEditModal(true);
    };

    const submitEdit = async () => {
        if (!editAch) return;
        if (!editForm.reason.trim()) {
            notify("أدخل السبب", "error");
            return;
        }
        setSubmittingEdit(true);
        try {
            await apiFetch(`/api/v1/teacher/achievements/${editAch.id}`, {
                method: "PUT",
                body: JSON.stringify(editForm),
            });
            notify("تم تحديث الإنجاز بنجاح");
            setShowEditModal(false);
            fetchAchievements(achPage, achSearch);
            fetchStudents(studPage, studSearch);
        } catch (e: any) {
            notify(e.message || "فشل", "error");
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await apiFetch(`/api/v1/teacher/achievements/${confirmDeleteId}`, {
                method: "DELETE",
            });
            notify("تم الحذف بنجاح");
            setConfirmDeleteId(null);
            fetchAchievements(achPage, achSearch);
            fetchStudents(studPage, studSearch);
        } catch (e: any) {
            notify(e.message || "فشل", "error");
        } finally {
            setDeleting(false);
        }
    };

    /* ── shared styles ── */
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
    const editBtn: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 12px",
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
        padding: "5px 12px",
        borderRadius: 8,
        border: "1px solid #fecaca",
        background: "#fee2e2",
        color: "#b91c1c",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "inherit",
    };
    const pointsBtn: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 12px",
        borderRadius: 8,
        border: "1px solid #B5D4F4",
        background: "#E6F1FB",
        color: "#0C447C",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "inherit",
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
                        animation: "tch-toast .3s ease",
                        pointerEvents: "none",
                        fontFamily: "'Tajawal',sans-serif",
                    }}
                >
                    {toast.type === "success" ? (
                        <FiCheckCircle size={15} />
                    ) : (
                        <FiXCircle size={15} />
                    )}{" "}
                    {toast.msg}
                </div>
            )}

            {/* ── Modals ── */}
            {showSingle && singleStudent && (
                <PointsModal
                    title={`تعديل نقاط: ${singleStudent.name}`}
                    subtitle={`النقاط الحالية: ${singleStudent.total_points}`}
                    form={singleForm}
                    setForm={setSingleForm}
                    onSubmit={submitSingle}
                    onClose={() => setShowSingle(false)}
                    submitting={submittingSingle}
                />
            )}
            {showBulk && (
                <PointsModal
                    title={`نقاط جماعية لـ ${selectedIds.length} طالب`}
                    form={bulkForm}
                    setForm={setBulkForm}
                    onSubmit={submitBulk}
                    onClose={() => setShowBulk(false)}
                    submitting={submittingBulk}
                />
            )}
            {showEditModal && editAch && (
                <PointsModal
                    title={`تعديل إنجاز: ${editAch.user.name}`}
                    subtitle={`السبب الحالي: ${editAch.reason}`}
                    form={editForm}
                    setForm={setEditForm}
                    onSubmit={submitEdit}
                    onClose={() => setShowEditModal(false)}
                    submitting={submittingEdit}
                />
            )}
            {confirmDeleteId && (
                <ConfirmModal
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDeleteId(null)}
                    loading={deleting}
                />
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
                                نقاط الطلاب والإنجازات
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                إدارة نقاط طلابك وإضافتها أو خصمها بشكل فردي أو
                                جماعي
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
                                                "tch-pulse 1.4s ease-in-out infinite",
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
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={() => setShowBulk(true)}
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
                                    <FiAward size={12} /> نقاط للمحددين (
                                    {selectedIds.length})
                                </button>
                            )}
                        </div>
                    </div>
                    {/* stats bar */}
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
                        {[
                            {
                                label: "إجمالي الطلاب",
                                value: studPagi?.total ?? students.length,
                                color: "#4ade80",
                            },
                            {
                                label: "مجموع النقاط",
                                value: totalPoints,
                                color: "#fbbf24",
                            },
                            {
                                label: "متوسط النقاط",
                                value: avgPoints,
                                color: "#38bdf8",
                            },
                            {
                                label: "الأعلى نقاطاً",
                                value: topStudent?.total_points ?? 0,
                                color: "#f472b6",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                style={{
                                    background: "rgba(255,255,255,.07)",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    textAlign: "center",
                                    minWidth: 85,
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
                        {/* progress */}
                        <div
                            style={{
                                flex: 1,
                                minWidth: 160,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                gap: 6,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "rgba(255,255,255,.5)",
                                }}
                            >
                                {topStudent
                                    ? `الأعلى: ${topStudent.name}`
                                    : "لا يوجد طلاب"}
                            </div>
                            <div
                                style={{
                                    height: 8,
                                    background: "rgba(255,255,255,.1)",
                                    borderRadius: 4,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width:
                                            topStudent &&
                                            topStudent.total_points > 0
                                                ? `${Math.min(100, (avgPoints / topStudent.total_points) * 100)}%`
                                                : "0%",
                                        background:
                                            "linear-gradient(90deg,#4ade80,#22d3ee)",
                                        borderRadius: 4,
                                        transition: "width .6s ease",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════
                TABS
            ══════════════════════════════ */}
            <div style={{ display: "flex", gap: 8 }}>
                {(
                    [
                        ["students", "طلابي", <FiAward size={13} />],
                        ["achievements", "سجل الإنجازات", <FiStar size={13} />],
                    ] as [typeof tab, string, React.ReactNode][]
                ).map(([v, lbl, ico]) => (
                    <button
                        key={v}
                        onClick={() => setTab(v)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "9px 20px",
                            borderRadius: 12,
                            border: `2px solid ${tab === v ? "#0f6e56" : "#e2e8f0"}`,
                            background: tab === v ? "#0f6e56" : "#fff",
                            color: tab === v ? "#fff" : "#64748b",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "inherit",
                            transition: "all .15s",
                        }}
                    >
                        {ico} {lbl}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════
                TAB: STUDENTS
            ══════════════════════════════ */}
            {tab === "students" && (
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
                                طلابي{" "}
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: "#94a3b8",
                                        fontWeight: 400,
                                        marginRight: 4,
                                    }}
                                >
                                    ({studPagi?.total ?? students.length} طالب)
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#94a3b8",
                                    marginTop: 2,
                                }}
                            >
                                عرض {students.length} في الصفحة الحالية
                            </div>
                        </div>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => setShowBulk(true)}
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
                                <FiPlus size={14} /> نقاط للمحددين (
                                {selectedIds.length})
                            </button>
                        )}
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
                                value={studSearch}
                                onChange={(e) => {
                                    setStudSearch(e.target.value);
                                    setStudPage(1);
                                }}
                                placeholder="بحث بالاسم أو الإيميل..."
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    outline: "none",
                                    fontSize: 12,
                                    flex: 1,
                                    fontFamily: "inherit",
                                }}
                            />
                            {studSearch && (
                                <button
                                    onClick={() => {
                                        setStudSearch("");
                                        setStudPage(1);
                                    }}
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
                        {studSearch && (
                            <button
                                onClick={() => {
                                    setStudSearch("");
                                    setStudPage(1);
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
                        <span
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginRight: "auto",
                            }}
                        >
                            {students.length} نتيجة
                        </span>
                        {/* view toggle */}
                        <div
                            style={{
                                display: "flex",
                                gap: 3,
                                background: "#f1f5f9",
                                borderRadius: 10,
                                padding: 3,
                            }}
                        >
                            {(
                                [
                                    ["table", <FiList size={12} />, "جدول"],
                                    ["cards", <FiGrid size={12} />, "بطاقات"],
                                ] as [ViewMode, React.ReactNode, string][]
                            ).map(([v, ico, lbl]) => (
                                <button
                                    key={v}
                                    onClick={() => setViewMode(v)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        padding: "5px 12px",
                                        borderRadius: 7,
                                        border: "none",
                                        cursor: "pointer",
                                        background:
                                            viewMode === v
                                                ? "#1e293b"
                                                : "transparent",
                                        color:
                                            viewMode === v ? "#fff" : "#64748b",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        fontFamily: "inherit",
                                        transition: "all .15s",
                                    }}
                                >
                                    {ico} {lbl}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── TABLE ── */}
                    {viewMode === "table" && (
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th style={{ ...TH, width: 44 }}>
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleAll}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </th>
                                        <th style={{ ...TH, width: 50 }}></th>
                                        <th style={TH}>الطالب</th>
                                        <th style={TH}>إجمالي النقاط</th>
                                        <th style={TH}>مضافة</th>
                                        <th style={TH}>مخصومة</th>
                                        <th style={{ ...TH, width: 140 }}>
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingStudents ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                style={{
                                                    textAlign: "center",
                                                    padding: 40,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        margin: "0 auto",
                                                        border: "3px solid #dbeafe",
                                                        borderTopColor:
                                                            "#2563eb",
                                                        borderRadius: "50%",
                                                        animation:
                                                            "tch-spin .7s linear infinite",
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ) : students.length === 0 ? (
                                        <tr>
                                            <td colSpan={7}>
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "40px 0",
                                                        color: "#94a3b8",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 30,
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        🏅
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {studSearch
                                                            ? "لا توجد نتائج"
                                                            : "لا يوجد طلاب"}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((student, idx) => {
                                            const isSel = selectedIds.includes(
                                                student.id,
                                            );
                                            return (
                                                <tr
                                                    key={student.id}
                                                    style={{
                                                        transition:
                                                            "background .1s",
                                                        background: isSel
                                                            ? "#eff6ff"
                                                            : "#fff",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSel)
                                                            e.currentTarget.style.background =
                                                                "#f8fafc";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            isSel
                                                                ? "#eff6ff"
                                                                : "#fff";
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            ...TD,
                                                            width: 44,
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSel}
                                                            onChange={() =>
                                                                toggleOne(
                                                                    student.id,
                                                                )
                                                            }
                                                            style={{
                                                                cursor: "pointer",
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={TD}>
                                                        <Avatar
                                                            name={student.name}
                                                            idx={idx}
                                                        />
                                                    </td>
                                                    <td style={TD}>
                                                        <div
                                                            style={{
                                                                fontWeight: 800,
                                                                fontSize: 13,
                                                                color: "#0C447C",
                                                            }}
                                                        >
                                                            {student.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#94a3b8",
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            {student.email}
                                                        </div>
                                                    </td>
                                                    <td style={TD}>
                                                        <PointsBadge
                                                            points={
                                                                student.total_points
                                                            }
                                                        />
                                                    </td>
                                                    <td style={TD}>
                                                        <span
                                                            style={{
                                                                fontSize: 13,
                                                                color: "#15803d",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            +
                                                            {
                                                                student.added_points
                                                            }
                                                        </span>
                                                    </td>
                                                    <td style={TD}>
                                                        <span
                                                            style={{
                                                                fontSize: 13,
                                                                color: "#b91c1c",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            -
                                                            {
                                                                student.deducted_points
                                                            }
                                                        </span>
                                                    </td>
                                                    <td style={TD}>
                                                        <button
                                                            style={pointsBtn}
                                                            onClick={() =>
                                                                openSingle(
                                                                    student,
                                                                )
                                                            }
                                                        >
                                                            <FiAward
                                                                size={11}
                                                            />{" "}
                                                            تعديل النقاط
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── CARDS ── */}
                    {viewMode === "cards" && (
                        <div style={{ padding: "16px 20px" }}>
                            {loadingStudents ? (
                                <div
                                    style={{ textAlign: "center", padding: 40 }}
                                >
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            margin: "0 auto",
                                            border: "3px solid #dbeafe",
                                            borderTopColor: "#2563eb",
                                            borderRadius: "50%",
                                            animation:
                                                "tch-spin .7s linear infinite",
                                        }}
                                    />
                                </div>
                            ) : students.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "40px 0",
                                        color: "#94a3b8",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 30,
                                            marginBottom: 8,
                                        }}
                                    >
                                        🏅
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {studSearch
                                            ? "لا توجد نتائج"
                                            : "لا يوجد طلاب"}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fill,minmax(240px,1fr))",
                                        gap: 12,
                                    }}
                                >
                                    {students.map((student, idx) => {
                                        const av =
                                            AV_COLORS[idx % AV_COLORS.length];
                                        const isSel = selectedIds.includes(
                                            student.id,
                                        );
                                        return (
                                            <div
                                                key={student.id}
                                                style={{
                                                    background: isSel
                                                        ? "#eff6ff"
                                                        : "#f8fafc",
                                                    borderRadius: 14,
                                                    border: `1px solid ${isSel ? "#bfdbfe" : "#e2e8f0"}`,
                                                    borderRight: `4px solid ${av.color}`,
                                                    padding: 16,
                                                    transition: "all .15s",
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSel) {
                                                        (
                                                            e.currentTarget as HTMLDivElement
                                                        ).style.background =
                                                            "#fff";
                                                        (
                                                            e.currentTarget as HTMLDivElement
                                                        ).style.boxShadow =
                                                            "0 4px 16px #0001";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    (
                                                        e.currentTarget as HTMLDivElement
                                                    ).style.background = isSel
                                                        ? "#eff6ff"
                                                        : "#f8fafc";
                                                    (
                                                        e.currentTarget as HTMLDivElement
                                                    ).style.boxShadow = "none";
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "space-between",
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 8,
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSel}
                                                            onChange={() =>
                                                                toggleOne(
                                                                    student.id,
                                                                )
                                                            }
                                                            style={{
                                                                cursor: "pointer",
                                                            }}
                                                        />
                                                        <Avatar
                                                            name={student.name}
                                                            idx={idx}
                                                        />
                                                    </div>
                                                    <PointsBadge
                                                        points={
                                                            student.total_points
                                                        }
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 900,
                                                        color: "#0C447C",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    {student.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#94a3b8",
                                                        marginBottom: 12,
                                                    }}
                                                >
                                                    {student.email}
                                                </div>
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns:
                                                            "1fr 1fr",
                                                        gap: 8,
                                                        marginBottom: 14,
                                                        background: "#f1f5f9",
                                                        borderRadius: 10,
                                                        padding: 10,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: 16,
                                                                fontWeight: 900,
                                                                color: "#15803d",
                                                            }}
                                                        >
                                                            +
                                                            {
                                                                student.added_points
                                                            }
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                color: "#94a3b8",
                                                            }}
                                                        >
                                                            مضافة
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: 16,
                                                                fontWeight: 900,
                                                                color: "#b91c1c",
                                                            }}
                                                        >
                                                            -
                                                            {
                                                                student.deducted_points
                                                            }
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                color: "#94a3b8",
                                                            }}
                                                        >
                                                            مخصومة
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        openSingle(student)
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        gap: 6,
                                                        padding: "7px 0",
                                                        borderRadius: 9,
                                                        border: "1px solid #B5D4F4",
                                                        background: "#E6F1FB",
                                                        color: "#0C447C",
                                                        cursor: "pointer",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                    }}
                                                >
                                                    <FiAward size={11} /> تعديل
                                                    النقاط
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* bulk bar */}
                    {selectedIds.length > 0 && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 20px",
                                background: "#fef9c3",
                                borderTop: "1px solid #fde68a",
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: "#d97706",
                                    display: "inline-block",
                                    animation:
                                        "tch-pulse 1.4s ease-in-out infinite",
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#92400e",
                                    flex: 1,
                                }}
                            >
                                {selectedIds.length} طلاب محددين
                            </span>
                            <button
                                onClick={() => setShowBulk(true)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "6px 14px",
                                    borderRadius: 9,
                                    border: "1px solid #B5D4F4",
                                    background: "#E6F1FB",
                                    color: "#0C447C",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                <FiPlus size={13} /> إضافة / خصم نقاط
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "6px 14px",
                                    borderRadius: 9,
                                    border: "1px solid #e2e8f0",
                                    background: "#fff",
                                    color: "#64748b",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontFamily: "inherit",
                                }}
                            >
                                <FiX size={11} /> إلغاء
                            </button>
                        </div>
                    )}

                    {/* pagination students */}
                    {studPagi && studPagi.last_page > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 8,
                                padding: "12px 20px",
                                borderTop: "1px solid #f1f5f9",
                            }}
                        >
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                الصفحة <strong>{studPagi.current_page}</strong>{" "}
                                من <strong>{studPagi.last_page}</strong>
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                                {[
                                    [
                                        "السابق",
                                        studPagi.current_page - 1,
                                        studPagi.current_page <= 1,
                                    ],
                                    [
                                        "التالي",
                                        studPagi.current_page + 1,
                                        studPagi.current_page >=
                                            studPagi.last_page,
                                    ],
                                ].map(([lbl, pg, dis]) => (
                                    <button
                                        key={String(lbl)}
                                        onClick={() =>
                                            setStudPage(pg as number)
                                        }
                                        disabled={dis as boolean}
                                        style={{
                                            padding: "5px 14px",
                                            borderRadius: 8,
                                            border: "1px solid #e2e8f0",
                                            background: "#f8fafc",
                                            color: "#475569",
                                            cursor: dis
                                                ? "not-allowed"
                                                : "pointer",
                                            fontSize: 12,
                                            fontFamily: "inherit",
                                            opacity: dis ? 0.4 : 1,
                                        }}
                                    >
                                        {lbl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════
                TAB: ACHIEVEMENTS
            ══════════════════════════════ */}
            {tab === "achievements" && (
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
                                سجل الإنجازات{" "}
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: "#94a3b8",
                                        fontWeight: 400,
                                        marginRight: 4,
                                    }}
                                >
                                    ({achPagi?.total ?? 0} إنجاز)
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#94a3b8",
                                    marginTop: 2,
                                }}
                            >
                                جميع إضافات وخصومات نقاط طلابك
                            </div>
                        </div>
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
                                value={achSearch}
                                onChange={(e) => {
                                    setAchSearch(e.target.value);
                                    setAchPage(1);
                                }}
                                placeholder="بحث بالطالب أو السبب..."
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    outline: "none",
                                    fontSize: 12,
                                    flex: 1,
                                    fontFamily: "inherit",
                                }}
                            />
                            {achSearch && (
                                <button
                                    onClick={() => {
                                        setAchSearch("");
                                        setAchPage(1);
                                    }}
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
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            {achievements.length} نتيجة
                        </span>
                    </div>

                    {/* table */}
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={TH}>الطالب</th>
                                    <th style={TH}>النقاط</th>
                                    <th style={TH}>النوع</th>
                                    <th style={TH}>إجمالي النقاط</th>
                                    <th style={TH}>السبب</th>
                                    <th style={TH}>التاريخ</th>
                                    <th style={{ ...TH, width: 140 }}>
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingAch ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: "center",
                                                padding: 40,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    margin: "0 auto",
                                                    border: "3px solid #dbeafe",
                                                    borderTopColor: "#2563eb",
                                                    borderRadius: "50%",
                                                    animation:
                                                        "tch-spin .7s linear infinite",
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ) : achievements.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    padding: "40px 0",
                                                    color: "#94a3b8",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 30,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    📋
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {achSearch
                                                        ? "لا توجد نتائج"
                                                        : "لا يوجد إنجازات بعد"}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    achievements.map((ach, idx) => (
                                        <tr
                                            key={ach.id}
                                            style={{
                                                transition: "background .1s",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#f8fafc")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#fff")
                                            }
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
                                                        name={ach.user.name}
                                                        idx={idx}
                                                    />
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontWeight: 700,
                                                                fontSize: 13,
                                                                color: "#0C447C",
                                                            }}
                                                        >
                                                            {ach.user.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#94a3b8",
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            {ach.user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={TD}>
                                                <PointsBadge
                                                    points={
                                                        ach.points_action ===
                                                        "added"
                                                            ? ach.points
                                                            : -ach.points
                                                    }
                                                />
                                            </td>
                                            <td style={TD}>
                                                <ActionBadge
                                                    action={ach.points_action}
                                                />
                                            </td>
                                            <td style={TD}>
                                                <PointsBadge
                                                    points={ach.total_points}
                                                />
                                            </td>
                                            <td
                                                style={{
                                                    ...TD,
                                                    maxWidth: 180,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    color: "#64748b",
                                                }}
                                                title={ach.reason}
                                            >
                                                {ach.reason}
                                            </td>
                                            <td
                                                style={{
                                                    ...TD,
                                                    color: "#64748b",
                                                    fontSize: 12,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {ach.created_at_formatted}
                                            </td>
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <button
                                                        style={editBtn}
                                                        onClick={() =>
                                                            openEdit(ach)
                                                        }
                                                    >
                                                        <FiEdit2 size={11} />{" "}
                                                        تعديل
                                                    </button>
                                                    <button
                                                        style={delBtn}
                                                        onClick={() =>
                                                            setConfirmDeleteId(
                                                                ach.id,
                                                            )
                                                        }
                                                    >
                                                        <FiTrash2 size={11} />{" "}
                                                        حذف
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* pagination achievements */}
                    {achPagi && achPagi.last_page > 1 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 8,
                                padding: "12px 20px",
                                borderTop: "1px solid #f1f5f9",
                            }}
                        >
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                الصفحة <strong>{achPagi.current_page}</strong>{" "}
                                من <strong>{achPagi.last_page}</strong> ·{" "}
                                <strong>{achPagi.total}</strong> إنجاز
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    onClick={() => setAchPage((p) => p - 1)}
                                    disabled={achPagi.current_page <= 1}
                                    style={{
                                        padding: "5px 14px",
                                        borderRadius: 8,
                                        border: "1px solid #e2e8f0",
                                        background: "#f8fafc",
                                        color: "#475569",
                                        cursor:
                                            achPagi.current_page <= 1
                                                ? "not-allowed"
                                                : "pointer",
                                        fontSize: 12,
                                        fontFamily: "inherit",
                                        opacity:
                                            achPagi.current_page <= 1 ? 0.4 : 1,
                                    }}
                                >
                                    السابق
                                </button>
                                <button
                                    style={{
                                        padding: "5px 14px",
                                        borderRadius: 8,
                                        border: "none",
                                        background: "#1e293b",
                                        color: "#fff",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {achPagi.current_page}
                                </button>
                                <button
                                    onClick={() => setAchPage((p) => p + 1)}
                                    disabled={
                                        achPagi.current_page >=
                                        achPagi.last_page
                                    }
                                    style={{
                                        padding: "5px 14px",
                                        borderRadius: 8,
                                        border: "1px solid #e2e8f0",
                                        background: "#f8fafc",
                                        color: "#475569",
                                        cursor:
                                            achPagi.current_page >=
                                            achPagi.last_page
                                                ? "not-allowed"
                                                : "pointer",
                                        fontSize: 12,
                                        fontFamily: "inherit",
                                        opacity:
                                            achPagi.current_page >=
                                            achPagi.last_page
                                                ? 0.4
                                                : 1,
                                    }}
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes tch-spin  { to { transform: rotate(360deg); } }
                @keyframes tch-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
                @keyframes tch-toast { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
            `}</style>
        </div>
    );
};

export default TeacherAchievementsManagement;
