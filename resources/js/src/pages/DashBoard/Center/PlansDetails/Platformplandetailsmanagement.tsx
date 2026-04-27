import React, { useState, useCallback, useEffect, useRef, FC } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { RiFileExcel2Line } from "react-icons/ri";
import { FiTrash2, FiPlus, FiUpload, FiChevronDown } from "react-icons/fi";
import DeleteModal from "./components/DeleteModal";

interface PlatformPlan {
    id: number;
    title: string;
    duration_days: number;
    details_count: number;
    is_active: boolean;
    is_featured: boolean;
}

interface PlatformPlanDetail {
    id: number;
    day_number: number;
    new_memorization: string | null;
    review_memorization: string | null;
    verse_from: number | null;
    verse_to: number | null;
    notes: string | null;
}

interface Pagination {
    total: number;
    last_page: number;
    current_page: number;
}

// ── Modal إنشاء خطة جديدة ─────────────────────────────────────
interface CreatePlanModalProps {
    onClose: () => void;
    onSuccess: (plan: PlatformPlan) => void;
}

const CreatePlanModal: FC<CreatePlanModalProps> = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        is_featured: false,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!form.title.trim()) return;
        setSubmitting(true);
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch("/api/v1/admin/platform-plans", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ ...form, is_active: true }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("تم إنشاء الخطة بنجاح!");
                onSuccess(data);
            } else {
                toast.error(data.message || "خطأ في الإنشاء");
            }
        } catch {
            toast.error("خطأ في الاتصال");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">
                        <span
                            style={{
                                width: 32,
                                height: 32,
                                display: "inline-flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 8,
                                background: "var(--blue-100)",
                                color: "var(--blue-700)",
                                fontSize: 18,
                            }}
                        >
                            📋
                        </span>{" "}
                        إنشاء خطة جديدة
                    </span>
                    <button
                        className="mx"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        <span
                            style={{
                                width: 12,
                                height: 12,
                                display: "inline-flex",
                            }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </span>
                    </button>
                </div>
                <div className="mb">
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            اسم الخطة *
                        </label>
                        <input
                            type="text"
                            className="fi2"
                            placeholder="مثال: خطة حفظ القرآن في سنة"
                            value={form.title}
                            onChange={(e) =>
                                setForm({ ...form, title: e.target.value })
                            }
                            disabled={submitting}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            وصف الخطة
                        </label>
                        <input
                            type="text"
                            className="fi2"
                            placeholder="وصف اختياري..."
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            disabled={submitting}
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <input
                            type="checkbox"
                            id="is_featured"
                            checked={form.is_featured}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    is_featured: e.target.checked,
                                })
                            }
                            disabled={submitting}
                        />
                        <label
                            htmlFor="is_featured"
                            style={{
                                fontSize: 13,
                                color: "var(--n700)",
                                cursor: "pointer",
                            }}
                        >
                            خطة مميزة (تظهر أولاً للمجمعات)
                        </label>
                    </div>
                </div>
                <div className="mf">
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            justifyContent: "flex-end",
                            marginTop: 16,
                        }}
                    >
                        <button
                            className="btn bs"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            إلغاء
                        </button>
                        <button
                            className="btn bp"
                            onClick={handleSubmit}
                            disabled={submitting || !form.title.trim()}
                        >
                            {submitting ? "جاري الإنشاء..." : "إنشاء الخطة"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Modal إضافة يوم ────────────────────────────────────────────
interface AddDayModalProps {
    planId: number;
    existingDays: number[];
    onClose: () => void;
    onSuccess: () => void;
}

const AddDayModal: FC<AddDayModalProps> = ({
    planId,
    existingDays,
    onClose,
    onSuccess,
}) => {
    const [form, setForm] = useState({
        day_number: "",
        new_memorization: "",
        review_memorization: "",
        verse_from: "",
        verse_to: "",
        notes: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const parsedDay = parseInt(form.day_number, 10);
    const isDayDuplicate =
        form.day_number !== "" &&
        !isNaN(parsedDay) &&
        existingDays.indexOf(parsedDay) !== -1;

    const handleSubmit = async () => {
        if (!form.day_number || isDayDuplicate) return;
        setSubmitting(true);
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch(
                `/api/v1/admin/platform-plans/${planId}/details`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({
                        day_number: parseInt(form.day_number),
                        new_memorization: form.new_memorization || null,
                        review_memorization: form.review_memorization || null,
                        verse_from: form.verse_from
                            ? parseInt(form.verse_from)
                            : null,
                        verse_to: form.verse_to
                            ? parseInt(form.verse_to)
                            : null,
                        notes: form.notes || null,
                    }),
                },
            );
            const data = await res.json();
            if (res.ok) {
                toast.success("تم إضافة اليوم بنجاح!");
                onSuccess();
            } else toast.error(data.message || "خطأ في الإضافة");
        } catch {
            toast.error("خطأ في الاتصال");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">
                        <span
                            style={{
                                width: 32,
                                height: 32,
                                display: "inline-flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 8,
                                background: "var(--blue-100)",
                                color: "var(--blue-700)",
                                fontSize: 18,
                            }}
                        >
                            📅
                        </span>{" "}
                        إضافة يوم جديد
                    </span>
                    <button
                        className="mx"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        <span
                            style={{
                                width: 12,
                                height: 12,
                                display: "inline-flex",
                            }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </span>
                    </button>
                </div>
                <div className="mb">
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            رقم اليوم *
                        </label>
                        <input
                            type="number"
                            min={1}
                            className={`fi2 ${isDayDuplicate ? "border-red-300 bg-red-50" : ""}`}
                            placeholder="1"
                            value={form.day_number}
                            onChange={(e) =>
                                setForm({ ...form, day_number: e.target.value })
                            }
                            disabled={submitting}
                        />
                        {isDayDuplicate && (
                            <p
                                style={{
                                    fontSize: 10,
                                    color: "var(--red-600)",
                                    margin: "2px 0 0",
                                }}
                            >
                                هذا اليوم موجود بالفعل
                            </p>
                        )}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            الحفظ الجديد
                        </label>
                        <input
                            type="text"
                            className="fi2"
                            placeholder="البقرة ١-٥"
                            value={form.new_memorization}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    new_memorization: e.target.value,
                                })
                            }
                            disabled={submitting}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            المراجعة
                        </label>
                        <input
                            type="text"
                            className="fi2"
                            placeholder="الفاتحة ١-٧"
                            value={form.review_memorization}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    review_memorization: e.target.value,
                                })
                            }
                            disabled={submitting}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "var(--n700)",
                                    marginBottom: 4,
                                }}
                            >
                                من آية
                            </label>
                            <input
                                type="number"
                                min={1}
                                className="fi2"
                                placeholder="1"
                                value={form.verse_from}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        verse_from: e.target.value,
                                    })
                                }
                                disabled={submitting}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "var(--n700)",
                                    marginBottom: 4,
                                }}
                            >
                                إلى آية
                            </label>
                            <input
                                type="number"
                                min={1}
                                className="fi2"
                                placeholder="10"
                                value={form.verse_to}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        verse_to: e.target.value,
                                    })
                                }
                                disabled={submitting}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            ملاحظات
                        </label>
                        <input
                            type="text"
                            className="fi2"
                            placeholder="ملاحظة اختيارية..."
                            value={form.notes}
                            onChange={(e) =>
                                setForm({ ...form, notes: e.target.value })
                            }
                            disabled={submitting}
                        />
                    </div>
                </div>
                <div className="mf">
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            justifyContent: "flex-end",
                            marginTop: 16,
                        }}
                    >
                        <button
                            className="btn bs"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            إلغاء
                        </button>
                        <button
                            className="btn bp"
                            onClick={handleSubmit}
                            disabled={
                                submitting || !form.day_number || isDayDuplicate
                            }
                        >
                            {submitting ? (
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 14,
                                            height: 14,
                                            border: "2px solid rgba(255,255,255,0.4)",
                                            borderTopColor: "#fff",
                                            borderRadius: "50%",
                                            animation:
                                                "spin 0.7s linear infinite",
                                        }}
                                    />
                                    جاري الإضافة...
                                </span>
                            ) : (
                                "إضافة اليوم"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Modal تعديل يوم ────────────────────────────────────────────
interface EditDayModalProps {
    detail: PlatformPlanDetail;
    onClose: () => void;
    onSuccess: () => void;
}

const EditDayModal: FC<EditDayModalProps> = ({
    detail,
    onClose,
    onSuccess,
}) => {
    const [form, setForm] = useState({
        new_memorization: detail.new_memorization ?? "",
        review_memorization: detail.review_memorization ?? "",
        verse_from: detail.verse_from != null ? String(detail.verse_from) : "",
        verse_to: detail.verse_to != null ? String(detail.verse_to) : "",
        notes: detail.notes ?? "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch(
                `/api/v1/admin/platform-plans/details/${detail.id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({
                        new_memorization: form.new_memorization || null,
                        review_memorization: form.review_memorization || null,
                        verse_from: form.verse_from
                            ? parseInt(form.verse_from)
                            : null,
                        verse_to: form.verse_to
                            ? parseInt(form.verse_to)
                            : null,
                        notes: form.notes || null,
                    }),
                },
            );
            const data = await res.json();
            if (res.ok) {
                toast.success("تم التعديل بنجاح!");
                onSuccess();
            } else toast.error(data.message || "خطأ في التعديل");
        } catch {
            toast.error("خطأ في الاتصال");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">
                        <span
                            style={{
                                width: 32,
                                height: 32,
                                display: "inline-flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 8,
                                background: "var(--blue-100)",
                                color: "var(--blue-700)",
                                fontSize: 18,
                            }}
                        >
                            ✏️
                        </span>{" "}
                        تعديل اليوم {detail.day_number}
                    </span>
                    <button
                        className="mx"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        <span
                            style={{
                                width: 12,
                                height: 12,
                                display: "inline-flex",
                            }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </span>
                    </button>
                </div>
                <div className="mb">
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            الحفظ الجديد
                        </label>
                        <input
                            type="text"
                            className="fi2"
                            value={form.new_memorization}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    new_memorization: e.target.value,
                                })
                            }
                            disabled={submitting}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            المراجعة
                        </label>
                        <input
                            type="text"
                            className="fi2"
                            value={form.review_memorization}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    review_memorization: e.target.value,
                                })
                            }
                            disabled={submitting}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "var(--n700)",
                                    marginBottom: 4,
                                }}
                            >
                                من آية
                            </label>
                            <input
                                type="number"
                                className="fi2"
                                value={form.verse_from}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        verse_from: e.target.value,
                                    })
                                }
                                disabled={submitting}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "var(--n700)",
                                    marginBottom: 4,
                                }}
                            >
                                إلى آية
                            </label>
                            <input
                                type="number"
                                className="fi2"
                                value={form.verse_to}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        verse_to: e.target.value,
                                    })
                                }
                                disabled={submitting}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            ملاحظات
                        </label>
                        <input
                            type="text"
                            className="fi2"
                            value={form.notes}
                            onChange={(e) =>
                                setForm({ ...form, notes: e.target.value })
                            }
                            disabled={submitting}
                        />
                    </div>
                </div>
                <div className="mf">
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            justifyContent: "flex-end",
                            marginTop: 16,
                        }}
                    >
                        <button
                            className="btn bs"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            إلغاء
                        </button>
                        <button
                            className="btn bp"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════
//  المكوّن الرئيسي
// ══════════════════════════════════════════════════════════════
const PlatformPlanDetailsManagement: FC = () => {
    // ── قائمة الخطط ───────────────────────────────────────────
    const [plans, setPlans] = useState<PlatformPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [showCreatePlan, setShowCreatePlan] = useState(false);

    // ── تفاصيل الخطة المختارة ─────────────────────────────────
    const [details, setDetails] = useState<PlatformPlanDetail[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // ── Modals ─────────────────────────────────────────────────
    const [showAddModal, setShowAddModal] = useState(false);
    const [editDetail, setEditDetail] = useState<PlatformPlanDetail | null>(
        null,
    );
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePlanId, setDeletePlanId] = useState<number | null>(null);
    const [showDeletePlanModal, setShowDeletePlanModal] = useState(false);

    // ── Bulk ───────────────────────────────────────────────────
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [showBulkDelete, setShowBulkDelete] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // ── Excel ──────────────────────────────────────────────────
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── جلب الخطط ─────────────────────────────────────────────
    const fetchPlans = useCallback(async () => {
        setLoadingPlans(true);
        try {
            const res = await fetch("/api/v1/platform-plans?per_page=100", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                const list: PlatformPlan[] = data.data ?? data;
                setPlans(list);
                if (list.length > 0 && !selectedPlan) {
                    setSelectedPlan(list[0]);
                }
            }
        } catch {
            toast.error("خطأ في جلب الخطط");
        } finally {
            setLoadingPlans(false);
        }
    }, [selectedPlan]);

    // ── جلب التفاصيل ──────────────────────────────────────────
    const fetchDetails = useCallback(
        async (planId: number, page: number = 1) => {
            setLoadingDetails(true);
            try {
                const res = await fetch(
                    `/api/v1/platform-plans/${planId}/details?page=${page}`,
                    { credentials: "include" },
                );
                if (res.ok) {
                    const data = await res.json();
                    setDetails(data.data ?? data);
                    setPagination(data.meta ?? null);
                    setCurrentPage(page);
                }
            } catch {
                toast.error("خطأ في جلب التفاصيل");
            } finally {
                setLoadingDetails(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchPlans();
    }, []);

    useEffect(() => {
        if (selectedPlan) {
            setDetails([]);
            setSelected(new Set());
            fetchDetails(selectedPlan.id, 1);
        }
    }, [selectedPlan, fetchDetails]);

    // ── Helpers ────────────────────────────────────────────────
    const existingDays = details.map((d) => d.day_number);
    const allSelected = details.length > 0 && selected.size === details.length;

    const toggleAll = () => {
        if (allSelected) setSelected(new Set());
        else setSelected(new Set(details.map((d) => d.id)));
    };

    const toggleOne = (id: number) => {
        const s = new Set(selected);
        s.has(id) ? s.delete(id) : s.add(id);
        setSelected(s);
    };

    // ── حذف خطة كاملة ─────────────────────────────────────────
    const handleDeletePlanConfirm = async () => {
        if (!deletePlanId) return;
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch(
                `/api/v1/admin/platform-plans/${deletePlanId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                },
            );
            if (res.ok) {
                toast.success("تم حذف الخطة بنجاح!");
                setSelectedPlan(null);
                setDetails([]);
                fetchPlans();
            } else {
                toast.error("خطأ في حذف الخطة");
            }
        } catch {
            toast.error("خطأ في الاتصال");
        } finally {
            setShowDeletePlanModal(false);
            setDeletePlanId(null);
        }
    };

    // ── حذف يوم فردي ──────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch(
                `/api/v1/admin/platform-plans/details/${deleteId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                },
            );
            if (res.ok) {
                toast.success("تم الحذف بنجاح!");
                if (selectedPlan) fetchDetails(selectedPlan.id, currentPage);
            } else {
                toast.error("خطأ في الحذف");
            }
        } catch {
            toast.error("خطأ في الاتصال");
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    // ── حذف جماعي ─────────────────────────────────────────────
    const handleBulkDeleteConfirm = async () => {
        setBulkDeleting(true);
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch(
                `/api/v1/admin/platform-plans/details/bulk-delete`,
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({ ids: Array.from(selected) }),
                },
            );
            const data = await res.json();
            if (res.ok) {
                toast.success(`تم حذف ${data.deleted} عنصر بنجاح!`);
                setSelected(new Set());
                if (selectedPlan) fetchDetails(selectedPlan.id, currentPage);
            } else {
                toast.error(data.message || "فشل الحذف");
            }
        } catch {
            toast.error("خطأ في الاتصال");
        } finally {
            setBulkDeleting(false);
            setShowBulkDelete(false);
        }
    };

    // ── تصدير Excel ───────────────────────────────────────────
    const exportToExcel = useCallback(() => {
        if (!selectedPlan) return;
        try {
            const rows = [
                [
                    "رقم اليوم",
                    "الحفظ الجديد",
                    "المراجعة",
                    "من آية",
                    "إلى آية",
                    "ملاحظات",
                ],
                ...details.map((d) => [
                    d.day_number,
                    d.new_memorization ?? "",
                    d.review_memorization ?? "",
                    d.verse_from ?? "",
                    d.verse_to ?? "",
                    d.notes ?? "",
                ]),
            ];
            const ws = XLSX.utils.aoa_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "التفاصيل");
            XLSX.writeFile(wb, `${selectedPlan.title}_${Date.now()}.xlsx`, {
                bookType: "xlsx",
            });
            toast.success("تم التصدير بنجاح!");
        } catch {
            toast.error("خطأ في التصدير");
        }
    }, [details, selectedPlan]);

    // ── استيراد Excel ─────────────────────────────────────────
    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!selectedPlan) return;
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            try {
                const buffer = await file.arrayBuffer();
                const wb = XLSX.read(buffer, { type: "array" });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
                    header: 1,
                    defval: "",
                    raw: false,
                });

                if (rows.length < 2) {
                    toast.error("الملف فارغ");
                    return;
                }

                const headers = (rows[0] as any[]).map((h: any) =>
                    String(h).trim(),
                );
                const dayIdx = headers.findIndex(
                    (h) => h.includes("يوم") || h.toLowerCase().includes("day"),
                );
                const newIdx = headers.findIndex(
                    (h) => h.includes("حفظ") || h.toLowerCase().includes("new"),
                );
                const revIdx = headers.findIndex(
                    (h) =>
                        h.includes("مراجعة") ||
                        h.toLowerCase().includes("review"),
                );
                const notesIdx = headers.findIndex(
                    (h) =>
                        h.includes("ملاحظ") || h.toLowerCase().includes("note"),
                );
                const fromIdx = headers.findIndex(
                    (h) =>
                        h.includes("من آية") ||
                        h.toLowerCase().includes("from"),
                );
                const toIdx = headers.findIndex(
                    (h) =>
                        h.includes("إلى آية") || h.toLowerCase().includes("to"),
                );

                if (dayIdx === -1) {
                    toast.error("عمود رقم اليوم غير موجود");
                    return;
                }

                const importData: any[] = [];
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i] as any[];
                    const dayNum = parseInt(String(row[dayIdx] ?? ""), 10);
                    if (!isNaN(dayNum) && dayNum > 0) {
                        importData.push({
                            day_number: dayNum,
                            new_memorization:
                                newIdx >= 0
                                    ? String(row[newIdx] ?? "").trim() || null
                                    : null,
                            review_memorization:
                                revIdx >= 0
                                    ? String(row[revIdx] ?? "").trim() || null
                                    : null,
                            notes:
                                notesIdx >= 0
                                    ? String(row[notesIdx] ?? "").trim() || null
                                    : null,
                            verse_from:
                                fromIdx >= 0
                                    ? parseInt(String(row[fromIdx])) || null
                                    : null,
                            verse_to:
                                toIdx >= 0
                                    ? parseInt(String(row[toIdx])) || null
                                    : null,
                        });
                    }
                }

                if (!importData.length) {
                    toast.error("لا توجد أيام صالحة");
                    return;
                }

                const csrfToken =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") || "";
                const res = await fetch(
                    `/api/v1/admin/platform-plans/${selectedPlan.id}/bulk-import`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            "X-CSRF-TOKEN": csrfToken,
                        },
                        body: JSON.stringify({ details: importData }),
                    },
                );
                const result = await res.json();
                if (res.ok) {
                    toast.success(result.message ?? "تم الاستيراد بنجاح!");
                    fetchDetails(selectedPlan.id, 1);
                    fetchPlans();
                } else {
                    toast.error(result.message || "فشل الاستيراد");
                }
            } catch (err) {
                console.error(err);
                toast.error("خطأ أثناء قراءة الملف");
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        },
        [selectedPlan, fetchDetails, fetchPlans],
    );

    const hasPrev = currentPage > 1;
    const hasNext = pagination != null && currentPage < pagination.last_page;

    return (
        <>
            {/* Modals */}
            {showCreatePlan && (
                <CreatePlanModal
                    onClose={() => setShowCreatePlan(false)}
                    onSuccess={(plan) => {
                        setShowCreatePlan(false);
                        fetchPlans();
                        setSelectedPlan(plan);
                    }}
                />
            )}

            <DeleteModal
                show={showDeleteModal}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا اليوم؟"
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                }}
                onConfirm={handleDeleteConfirm}
                confirmText="حذف اليوم"
                showConfirm
            />

            <DeleteModal
                show={showBulkDelete}
                title="تأكيد الحذف الجماعي"
                message={`هل أنت متأكد من حذف ${selected.size} عنصر؟ لا يمكن التراجع!`}
                onClose={() => setShowBulkDelete(false)}
                onConfirm={handleBulkDeleteConfirm}
                confirmText={
                    bulkDeleting ? "جاري الحذف..." : `حذف ${selected.size} عنصر`
                }
                showConfirm
            />

            <DeleteModal
                show={showDeletePlanModal}
                title="حذف الخطة كاملة"
                message={`هل أنت متأكد من حذف خطة "${plans.find((p) => p.id === deletePlanId)?.title}"؟ سيتم حذف جميع أيامها!`}
                onClose={() => {
                    setShowDeletePlanModal(false);
                    setDeletePlanId(null);
                }}
                onConfirm={handleDeletePlanConfirm}
                confirmText="حذف الخطة"
                showConfirm
            />

            {showAddModal && selectedPlan != null && (
                <AddDayModal
                    planId={selectedPlan.id}
                    existingDays={existingDays}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        if (selectedPlan)
                            fetchDetails(selectedPlan.id, currentPage);
                    }}
                />
            )}

            {editDetail != null && (
                <EditDayModal
                    detail={editDetail}
                    onClose={() => setEditDetail(null)}
                    onSuccess={() => {
                        setEditDetail(null);
                        if (selectedPlan)
                            fetchDetails(selectedPlan.id, currentPage);
                    }}
                />
            )}

            <div className="content" id="contentArea">
                {/* ── اختيار الخطة ── */}
                <div className="widget" style={{ marginBottom: 16 }}>
                    <div className="wh">
                        <div className="wh-l">خطط المنصة</div>
                        <button
                            className="btn bp bsm"
                            onClick={() => setShowCreatePlan(true)}
                        >
                            <FiPlus
                                size={16}
                                style={{ marginRight: 6, verticalAlign: -1 }}
                            />
                            خطة جديدة
                        </button>
                    </div>

                    {loadingPlans ? (
                        <div
                            style={{
                                padding: 20,
                                textAlign: "center",
                                color: "var(--n500)",
                            }}
                        >
                            جاري التحميل...
                        </div>
                    ) : plans.length === 0 ? (
                        <div
                            style={{
                                padding: 20,
                                textAlign: "center",
                                color: "var(--n500)",
                            }}
                        >
                            لا توجد خطط بعد — أنشئ خطة جديدة
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                                padding: "8px 0",
                            }}
                        >
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "8px 14px",
                                        borderRadius: 10,
                                        border: `2px solid ${selectedPlan?.id === plan.id ? "var(--blue-500)" : "var(--border)"}`,
                                        background:
                                            selectedPlan?.id === plan.id
                                                ? "var(--blue-50)"
                                                : "var(--bg2)",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}
                                    onClick={() => setSelectedPlan(plan)}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color:
                                                    selectedPlan?.id === plan.id
                                                        ? "var(--blue-700)"
                                                        : "var(--n800)",
                                            }}
                                        >
                                            {plan.is_featured && (
                                                <span style={{ marginLeft: 4 }}>
                                                    ⭐
                                                </span>
                                            )}
                                            {plan.title}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "var(--n500)",
                                            }}
                                        >
                                            {plan.details_count} يوم ·{" "}
                                            {plan.duration_days} يوم إجمالي
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletePlanId(plan.id);
                                            setShowDeletePlanModal(true);
                                        }}
                                        style={{
                                            marginRight: 4,
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "var(--red-500)",
                                            padding: 2,
                                            borderRadius: 4,
                                        }}
                                        title="حذف الخطة"
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── تفاصيل الخطة المختارة ── */}
                {selectedPlan != null && (
                    <div className="widget">
                        <div className="wh">
                            <div className="wh-l">
                                تفاصيل: {selectedPlan.title}
                                <span
                                    style={{
                                        marginRight: 8,
                                        fontSize: 12,
                                        color: "var(--n500)",
                                        fontWeight: 400,
                                    }}
                                >
                                    ({selectedPlan.duration_days} يوم)
                                </span>
                            </div>
                            <button
                                className="btn bp bsm"
                                onClick={() => setShowAddModal(true)}
                                disabled={loadingDetails}
                            >
                                <FiPlus
                                    size={18}
                                    style={{
                                        marginRight: 6,
                                        verticalAlign: -1,
                                    }}
                                />
                                يوم جديد
                            </button>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleAll}
                                                className="w-5 h-5"
                                            />
                                        </th>
                                        <th>رقم اليوم</th>
                                        <th>الحفظ الجديد</th>
                                        <th>المراجعة</th>
                                        <th>الآيات</th>
                                        <th>ملاحظات</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingDetails ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                style={{
                                                    textAlign: "center",
                                                    padding: 30,
                                                }}
                                            >
                                                <div
                                                    className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"
                                                    style={{ margin: "0 auto" }}
                                                />
                                            </td>
                                        </tr>
                                    ) : details.length === 0 ? (
                                        <tr>
                                            <td colSpan={7}>
                                                <div className="empty text-center py-8 text-gray-500">
                                                    لا توجد أيام بعد — أضف يوماً
                                                    أو استورد من Excel
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        details.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.has(
                                                            item.id,
                                                        )}
                                                        onChange={() =>
                                                            toggleOne(item.id)
                                                        }
                                                        className="w-5 h-5 mx-auto"
                                                    />
                                                </td>
                                                <td className="font-bold text-xl">
                                                    {item.day_number}
                                                </td>
                                                <td>
                                                    {item.new_memorization ??
                                                        "—"}
                                                </td>
                                                <td>
                                                    {item.review_memorization ??
                                                        "—"}
                                                </td>
                                                <td
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--n500)",
                                                    }}
                                                >
                                                    {item.verse_from != null &&
                                                    item.verse_to != null
                                                        ? `${item.verse_from} - ${item.verse_to}`
                                                        : "—"}
                                                </td>
                                                <td
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--n500)",
                                                    }}
                                                >
                                                    {item.notes ?? "—"}
                                                </td>
                                                <td>
                                                    <div className="td-actions">
                                                        <button
                                                            className="btn bp bxs"
                                                            onClick={() =>
                                                                setEditDetail(
                                                                    item,
                                                                )
                                                            }
                                                            disabled={
                                                                loadingDetails
                                                            }
                                                        >
                                                            تعديل
                                                        </button>
                                                        <button
                                                            className="btn bd bxs"
                                                            onClick={() => {
                                                                setDeleteId(
                                                                    item.id,
                                                                );
                                                                setShowDeleteModal(
                                                                    true,
                                                                );
                                                            }}
                                                            disabled={
                                                                loadingDetails
                                                            }
                                                        >
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

                        {pagination != null && pagination.last_page > 1 && (
                            <div
                                className="inputs__verifyOTPBirth"
                                style={{
                                    marginTop: 12,
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 8,
                                    fontSize: 12,
                                }}
                            >
                                <div className="text-gray-600">
                                    عرض {details.length} من {pagination.total}{" "}
                                    يوم · الصفحة <strong>{currentPage}</strong>{" "}
                                    من <strong>{pagination.last_page}</strong>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button
                                        className="btn bs bxs"
                                        onClick={() =>
                                            fetchDetails(
                                                selectedPlan.id,
                                                currentPage - 1,
                                            )
                                        }
                                        disabled={!hasPrev || loadingDetails}
                                    >
                                        السابق
                                    </button>
                                    <span
                                        className="btn bp bxs"
                                        style={{
                                            padding: "4px 12px",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {currentPage}
                                    </span>
                                    <button
                                        className="btn bp bxs"
                                        onClick={() =>
                                            fetchDetails(
                                                selectedPlan.id,
                                                currentPage + 1,
                                            )
                                        }
                                        disabled={!hasNext || loadingDetails}
                                    >
                                        التالي
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* أزرار Excel */}
                {selectedPlan != null && (
                    <div
                        style={{
                            marginTop: 16,
                            display: "flex",
                            gap: 10,
                            justifyContent: "flex-end",
                            flexWrap: "wrap",
                        }}
                    >
                        <label
                            className={`btn bd bsm p-3 rounded-xl border-2 bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100 font-medium cursor-pointer flex items-center gap-2 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <FiUpload size={18} />
                            <span>
                                {uploading ? "جاري الرفع..." : "رفع Excel"}
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                style={{ display: "none" }}
                            />
                        </label>

                        <button
                            onClick={exportToExcel}
                            disabled={details.length === 0 || uploading}
                            className="btn bp bsm p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            <RiFileExcel2Line size={20} />
                            تصدير Excel
                        </button>

                        {selected.size > 0 && (
                            <button
                                onClick={() => setShowBulkDelete(true)}
                                disabled={bulkDeleting}
                                className="btn bd bsm p-3 rounded-xl border-2 bg-red-50 border-red-300 text-red-600 hover:bg-red-100 font-medium flex items-center gap-2"
                            >
                                <FiTrash2 size={18} />
                                حذف {selected.size}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
};

export default PlatformPlanDetailsManagement;
