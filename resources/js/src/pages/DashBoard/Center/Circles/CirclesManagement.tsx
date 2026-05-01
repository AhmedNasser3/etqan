// CirclesManagement.tsx — نسخة مُعاد تصميمها بنفس ديزاين PlanDetailsManagement
import React, { useState, useEffect, useRef, useMemo } from "react";
import UpdateCirclePage from "./models/UpdateCirclePage";
import CreateCirclePage from "./models/CreateCirclePage";
import { useCircles } from "./hooks/useCircles";
import { useToast } from "../../../../../contexts/ToastContext";
import * as XLSX from "xlsx";
import {
    FiTrash2,
    FiPlus,
    FiUpload,
    FiSearch,
    FiX,
    FiGrid,
    FiList,
    FiRotateCcw,
} from "react-icons/fi";
import { RiFileExcel2Line } from "react-icons/ri";

/* ══════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════ */
interface CircleType {
    id: number;
    name: string;
    center: { id: number; name: string };
    center_id: number;
    mosque?: { id: number; name: string } | null;
    mosque_id?: number | null;
    teacher?: { id: number; name: string } | null;
    teacher_id?: number | null;
    created_at: string;
    updated_at: string;
}

interface ImportRow {
    "اسم الحلقة": string;
    المسجد?: string;
    المعلم?: string;
}

interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
}

type ViewMode = "table" | "cards";
type StatusFilter = "" | "نشط" | "معلق";

/* ══════════════════════════════════════════════════════════
   Constants / Helpers
══════════════════════════════════════════════════════════ */
const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

/* ── Sub-components ── */
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

const StatusBadge = ({ status }: { status: string }) => {
    const isActive = status === "نشط";
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: isActive ? "#dcfce7" : "#fef9c3",
                color: isActive ? "#15803d" : "#a16207",
                border: `1px solid ${isActive ? "#bbf7d0" : "#fde68a"}`,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap" as const,
            }}
        >
            <span
                style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: isActive ? "#16a34a" : "#d97706",
                    display: "inline-block",
                }}
            />
            {status}
        </span>
    );
};

/* ══════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════ */
const CirclesManagement: React.FC = () => {
    const { circles: circlesFromHook, loading, refetch } = useCircles();
    const { notifySuccess, notifyError } = useToast();

    /* ── State ── */
    const [circles, setCircles] = useState<CircleType[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
    const [viewMode, setViewMode] = useState<ViewMode>("table");

    /* ── Bulk select ── */
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    /* ── Modals ── */
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedCircle, setSelectedCircle] = useState<CircleType | null>(
        null,
    );
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    /* ── Excel ── */
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCircles(circlesFromHook);
    }, [circlesFromHook]);

    /* ════════════════════════════════════════
       Filtering
    ════════════════════════════════════════ */
    const filteredCircles = useMemo(
        () =>
            circles.filter((c) => {
                const q = search.trim().toLowerCase();
                const matchSearch =
                    !q ||
                    c.name.toLowerCase().includes(q) ||
                    c.center.name.toLowerCase().includes(q) ||
                    (c.mosque?.name || "").toLowerCase().includes(q) ||
                    (c.teacher?.name || "").toLowerCase().includes(q);
                // Since all circles are "نشط" by default
                const matchStatus =
                    statusFilter === "" || statusFilter === "نشط";
                return matchSearch && matchStatus;
            }),
        [circles, search, statusFilter],
    );

    /* ── computed stats ── */
    const total = circles.length;
    const withTeacher = circles.filter((c) => c.teacher).length;
    const withMosque = circles.filter((c) => c.mosque).length;

    /* ════════════════════════════════════════
       Bulk select handlers
    ════════════════════════════════════════ */
    const allSelected =
        filteredCircles.length > 0 &&
        selectedItems.size === filteredCircles.length;

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredCircles.map((c) => c.id)));
        }
    };

    const toggleSelectItem = (id: number) => {
        const s = new Set(selectedItems);
        s.has(id) ? s.delete(id) : s.add(id);
        setSelectedItems(s);
    };

    /* ════════════════════════════════════════
       Delete handlers
    ════════════════════════════════════════ */
    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const csrf =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch(`/api/v1/centers/circles/${deleteId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrf,
                },
            });
            const result = await res.json();
            if (res.ok && result.success) {
                notifySuccess("تم حذف الحلقة بنجاح");
                setCircles((prev) => prev.filter((c) => c.id !== deleteId));
                setShowDeleteModal(false);
                setDeleteId(null);
            } else {
                notifyError(result.message || "فشل في الحذف");
            }
        } catch {
            notifyError("حدث خطأ في الحذف");
        } finally {
            setDeleting(false);
        }
    };

    const handleBulkDeleteConfirm = async () => {
        if (!selectedItems.size) return;
        setBulkDeleting(true);
        try {
            const ids = Array.from(selectedItems);
            // Sequential delete (adjust to bulk endpoint if available)
            const csrf =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            let deletedCount = 0;
            for (const id of ids) {
                const res = await fetch(`/api/v1/centers/circles/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrf,
                    },
                });
                if (res.ok) deletedCount++;
            }
            notifySuccess(`تم حذف ${deletedCount} حلقة بنجاح!`);
            refetch();
            setSelectedItems(new Set());
            setShowBulkDeleteModal(false);
        } catch {
            notifyError("خطأ في الحذف الجماعي");
        } finally {
            setBulkDeleting(false);
        }
    };

    /* ════════════════════════════════════════
       Excel handlers
    ════════════════════════════════════════ */
    const handleExport = () => {
        if (circles.length === 0) {
            notifyError("لا توجد بيانات للتصدير");
            return;
        }
        const rows = circles.map((c) => ({
            "اسم الحلقة": c.name,
            المجمع: c.center?.name || "",
            المسجد: c.mosque?.name || "",
            المعلم: c.teacher?.name || "",
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 25 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, ws, "الحلقات");
        XLSX.writeFile(
            wb,
            `الحلقات_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.xlsx`,
        );
        notifySuccess(`تم تصدير ${circles.length} حلقة بنجاح`);
    };

    const handleDownloadTemplate = () => {
        const rows: ImportRow[] = [
            {
                "اسم الحلقة": "حلقة النور",
                المسجد: "مسجد النور",
                المعلم: "احمد ناصر",
            },
            {
                "اسم الحلقة": "حلقة الفجر",
                المسجد: "مسجد السلام",
                المعلم: "محمد علي",
            },
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, ws, "الحلقات");
        XLSX.writeFile(wb, "قالب_استيراد_الحلقات.xlsx");
        notifySuccess("تم تحميل القالب بنجاح");
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";
        setImporting(true);
        setImportResult(null);
        try {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows: ImportRow[] = XLSX.utils.sheet_to_json(ws, {
                defval: "",
            });
            if (rows.length === 0) {
                notifyError("الملف فارغ أو لا يحتوي على بيانات");
                setImporting(false);
                return;
            }
            if (!("اسم الحلقة" in rows[0])) {
                notifyError('تأكد من أن الملف يحتوي على عمود "اسم الحلقة"');
                setImporting(false);
                return;
            }
            const csrf =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            let successCount = 0;
            let failedCount = 0;
            const errors: string[] = [];
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const rowNum = i + 2;
                const circleName = String(row["اسم الحلقة"] || "").trim();
                if (!circleName) {
                    errors.push(`سطر ${rowNum}: اسم الحلقة مطلوب`);
                    failedCount++;
                    continue;
                }
                const formData = new FormData();
                formData.append("name", circleName);
                formData.append(
                    "mosque_name",
                    String(row["المسجد"] || "").trim(),
                );
                formData.append(
                    "teacher_name",
                    String(row["المعلم"] || "").trim(),
                );
                try {
                    const res = await fetch(
                        "/api/v1/centers/circles/import-row",
                        {
                            method: "POST",
                            credentials: "include",
                            headers: {
                                Accept: "application/json",
                                "X-Requested-With": "XMLHttpRequest",
                                "X-CSRF-TOKEN": csrf,
                            },
                            body: formData,
                        },
                    );
                    const result = await res.json();
                    if (res.ok && result.success) {
                        successCount++;
                    } else {
                        failedCount++;
                        errors.push(
                            `سطر ${rowNum} (${circleName}): ${result.message || "فشل"}`,
                        );
                    }
                } catch {
                    failedCount++;
                    errors.push(
                        `سطر ${rowNum} (${circleName}): خطأ في الاتصال`,
                    );
                }
            }
            setImportResult({
                success: successCount,
                failed: failedCount,
                errors,
            });
            if (successCount > 0) {
                notifySuccess(`تم استيراد ${successCount} حلقة بنجاح`);
                refetch();
            }
            if (failedCount > 0) {
                notifyError(`فشل استيراد ${failedCount} حلقة`);
            }
        } catch {
            notifyError("حدث خطأ في قراءة الملف");
        } finally {
            setImporting(false);
        }
    };

    /* ════════════════════════════════════════
       Shared styles
    ════════════════════════════════════════ */
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
            {/* Hidden file input */}
            <input
                ref={importInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleImportFile}
            />

            {/* ── Modals ── */}
            {showCreateModal && (
                <CreateCirclePage
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        refetch();
                    }}
                />
            )}
            {showUpdateModal && selectedCircle && (
                <UpdateCirclePage
                    circleId={selectedCircle.id}
                    initialCircle={selectedCircle}
                    onClose={() => {
                        setShowUpdateModal(false);
                        setSelectedCircle(null);
                    }}
                    onSuccess={() => {
                        notifySuccess("تم تحديث بيانات الحلقة بنجاح");
                        setShowUpdateModal(false);
                        setSelectedCircle(null);
                        refetch();
                    }}
                />
            )}

            {/* Delete confirm modal */}
            {showDeleteModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            padding: "32px 28px",
                            maxWidth: 420,
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 20px 60px #0003",
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
                            }}
                        >
                            <FiTrash2 size={22} color="#b91c1c" />
                        </div>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 900,
                                color: "#1e293b",
                                marginBottom: 8,
                            }}
                        >
                            تأكيد حذف الحلقة
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "#64748b",
                                marginBottom: 24,
                            }}
                        >
                            هل أنت متأكد من حذف هذه الحلقة؟ لا يمكن التراجع عن
                            هذا الإجراء.
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#dc2626",
                                    color: "#fff",
                                    cursor: deleting
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    opacity: deleting ? 0.7 : 1,
                                }}
                            >
                                {deleting ? "جاري الحذف..." : "حذف الحلقة"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteId(null);
                                }}
                                disabled={deleting}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: 10,
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
            )}

            {/* Bulk delete confirm modal */}
            {showBulkDeleteModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            padding: "32px 28px",
                            maxWidth: 420,
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 20px 60px #0003",
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
                            }}
                        >
                            <FiTrash2 size={22} color="#b91c1c" />
                        </div>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 900,
                                color: "#1e293b",
                                marginBottom: 8,
                            }}
                        >
                            تأكيد الحذف الجماعي
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "#64748b",
                                marginBottom: 24,
                            }}
                        >
                            {`هل أنت متأكد من حذف ${selectedItems.size} حلقة؟ لا يمكن التراجع عن هذا الإجراء.`}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                onClick={handleBulkDeleteConfirm}
                                disabled={bulkDeleting}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#dc2626",
                                    color: "#fff",
                                    cursor: bulkDeleting
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    opacity: bulkDeleting ? 0.7 : 1,
                                }}
                            >
                                {bulkDeleting
                                    ? "جاري الحذف..."
                                    : `حذف ${selectedItems.size} حلقة`}
                            </button>
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                disabled={bulkDeleting}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: 10,
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
            )}

            {/* Import result modal */}
            {importResult && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            padding: "28px",
                            maxWidth: 480,
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 20px 60px #0003",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 900,
                                color: "#1e293b",
                                marginBottom: 16,
                            }}
                        >
                            نتيجة الاستيراد
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                justifyContent: "center",
                                marginBottom: 16,
                            }}
                        >
                            <span
                                style={{
                                    background: "#dcfce7",
                                    color: "#15803d",
                                    padding: "6px 16px",
                                    borderRadius: 8,
                                    fontWeight: 700,
                                    fontSize: 13,
                                }}
                            >
                                ✓ نجح: {importResult.success}
                            </span>
                            {importResult.failed > 0 && (
                                <span
                                    style={{
                                        background: "#fee2e2",
                                        color: "#b91c1c",
                                        padding: "6px 16px",
                                        borderRadius: 8,
                                        fontWeight: 700,
                                        fontSize: 13,
                                    }}
                                >
                                    ✗ فشل: {importResult.failed}
                                </span>
                            )}
                        </div>
                        {importResult.errors.length > 0 && (
                            <div
                                style={{
                                    background: "#fff8f8",
                                    border: "1px solid #fecaca",
                                    borderRadius: 10,
                                    padding: 12,
                                    maxHeight: 200,
                                    overflowY: "auto",
                                    textAlign: "right",
                                    fontSize: 12,
                                    marginBottom: 16,
                                }}
                            >
                                {importResult.errors.map((err, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: "2px 0",
                                            color: "#b91c1c",
                                        }}
                                    >
                                        • {err}
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => setImportResult(null)}
                            style={{
                                padding: "8px 24px",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                                color: "#64748b",
                                cursor: "pointer",
                                fontSize: 13,
                                fontFamily: "inherit",
                            }}
                        >
                            إغلاق
                        </button>
                    </div>
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
                    {/* top row */}
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
                                إدارة الحلقات
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                إدارة حلقات التحفيظ في مجمعك — المساجد والمعلمون
                                والأعضاء
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
                            <button
                                onClick={() => setShowCreateModal(true)}
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
                                <FiPlus size={12} /> حلقة جديدة
                            </button>
                        </div>
                    </div>

                    {/* stats bar */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            {
                                label: "إجمالي الحلقات",
                                value: total,
                                color: "#4ade80",
                            },
                            {
                                label: "بها معلم",
                                value: withTeacher,
                                color: "#fbbf24",
                            },
                            {
                                label: "بها مسجد",
                                value: withMosque,
                                color: "#38bdf8",
                            },
                            {
                                label: "نسبة التوثيق",
                                value: total
                                    ? `${Math.round((withTeacher / total) * 100)}%`
                                    : "0%",
                                color: "rgba(255,255,255,.7)",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                style={{
                                    background: "rgba(255,255,255,.07)",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    textAlign: "center",
                                    minWidth: 88,
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

                        {/* progress bar */}
                        <div
                            style={{
                                flex: 1,
                                minWidth: 180,
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
                                نسبة الحلقات الموثقة
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
                                        width: total
                                            ? `${(withTeacher / total) * 100}%`
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
                TABLE / CARDS SECTION
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
                            قائمة الحلقات
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#94a3b8",
                                    fontWeight: 400,
                                    marginRight: 6,
                                }}
                            >
                                ({circles.length} حلقة)
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            عرض {filteredCircles.length} من {circles.length}{" "}
                            حلقة
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
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
                        <FiPlus size={14} /> حلقة جديدة
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
                    {/* search */}
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
                            placeholder="بحث بالاسم أو المجمع أو المسجد أو المعلم..."
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

                    {/* status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value as StatusFilter)
                        }
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
                        <option value="نشط">نشط</option>
                        <option value="معلق">معلق</option>
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
                            <FiRotateCcw size={11} /> مسح الفلاتر
                        </button>
                    )}

                    <span
                        style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginRight: "auto",
                        }}
                    >
                        {filteredCircles.length} نتيجة
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
                                    color: viewMode === v ? "#fff" : "#64748b",
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

                {/* ── TABLE VIEW ── */}
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
                                            onChange={toggleSelectAll}
                                            style={{ cursor: "pointer" }}
                                        />
                                    </th>
                                    <th style={{ ...TH, width: 80 }}>الشعار</th>
                                    <th style={TH}>اسم الحلقة</th>
                                    <th style={TH}>المجمع</th>
                                    <th style={TH}>المسجد</th>
                                    <th style={TH}>المعلم</th>
                                    <th style={{ ...TH, width: 110 }}>
                                        الحالة
                                    </th>
                                    <th style={{ ...TH, width: 150 }}>
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
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
                                                        "cm-spin 0.7s linear infinite",
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ) : filteredCircles.length === 0 ? (
                                    <tr>
                                        <td colSpan={8}>
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
                                                    🔍
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {search || statusFilter
                                                        ? "لا توجد نتائج مطابقة"
                                                        : "لا توجد حلقات بعد"}
                                                </div>
                                                {!search && !statusFilter && (
                                                    <button
                                                        onClick={() =>
                                                            setShowCreateModal(
                                                                true,
                                                            )
                                                        }
                                                        style={{
                                                            marginTop: 12,
                                                            padding: "7px 16px",
                                                            borderRadius: 10,
                                                            border: "none",
                                                            background:
                                                                "#0f6e56",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        إضافة حلقة جديدة
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCircles.map((c, idx) => (
                                        <tr
                                            key={c.id}
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
                                            <td style={{ ...TD, width: 44 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(
                                                        c.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelectItem(c.id)
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                />
                                            </td>
                                            <td style={TD}>
                                                <Avatar
                                                    name={c.name}
                                                    idx={idx}
                                                />
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontWeight: 800,
                                                        fontSize: 14,
                                                        color: "#0C447C",
                                                    }}
                                                >
                                                    {c.name}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {c.center?.name ||
                                                        `مجمع #${c.center_id}`}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {c.mosque?.name || "—"}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {c.teacher?.name || "—"}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <StatusBadge status="نشط" />
                                            </td>
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCircle(
                                                                c,
                                                            );
                                                            setShowUpdateModal(
                                                                true,
                                                            );
                                                        }}
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            padding: "5px 12px",
                                                            borderRadius: 8,
                                                            border: "1px solid #B5D4F4",
                                                            background:
                                                                "#E6F1FB",
                                                            color: "#0C447C",
                                                            cursor: "pointer",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                        }}
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteId(c.id);
                                                            setShowDeleteModal(
                                                                true,
                                                            );
                                                        }}
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 4,
                                                            padding: "5px 12px",
                                                            borderRadius: 8,
                                                            border: "1px solid #fecaca",
                                                            background:
                                                                "#fee2e2",
                                                            color: "#b91c1c",
                                                            cursor: "pointer",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            fontFamily:
                                                                "inherit",
                                                        }}
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
                )}

                {/* ── CARDS VIEW ── */}
                {viewMode === "cards" && (
                    <div style={{ padding: "16px 20px" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: 40 }}>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        margin: "0 auto",
                                        border: "3px solid #dbeafe",
                                        borderTopColor: "#2563eb",
                                        borderRadius: "50%",
                                        animation:
                                            "cm-spin 0.7s linear infinite",
                                    }}
                                />
                            </div>
                        ) : filteredCircles.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px 0",
                                    color: "#94a3b8",
                                }}
                            >
                                <div style={{ fontSize: 30, marginBottom: 8 }}>
                                    📋
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>
                                    {search || statusFilter
                                        ? "لا توجد نتائج مطابقة"
                                        : "لا توجد حلقات"}
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
                                {filteredCircles.map((c, idx) => (
                                    <div
                                        key={c.id}
                                        style={{
                                            background: "#f8fafc",
                                            borderRadius: 14,
                                            border: "1px solid #e2e8f0",
                                            borderRight: `4px solid ${AV_COLORS[idx % AV_COLORS.length].color}`,
                                            padding: "16px",
                                            transition: "all .15s",
                                        }}
                                        onMouseEnter={(e) => {
                                            (
                                                e.currentTarget as HTMLDivElement
                                            ).style.background = "#fff";
                                            (
                                                e.currentTarget as HTMLDivElement
                                            ).style.boxShadow =
                                                "0 4px 16px #0001";
                                        }}
                                        onMouseLeave={(e) => {
                                            (
                                                e.currentTarget as HTMLDivElement
                                            ).style.background = "#f8fafc";
                                            (
                                                e.currentTarget as HTMLDivElement
                                            ).style.boxShadow = "none";
                                        }}
                                    >
                                        {/* top row */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: 12,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(
                                                        c.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelectItem(c.id)
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                />
                                                <Avatar
                                                    name={c.name}
                                                    idx={idx}
                                                />
                                            </div>
                                            <StatusBadge status="نشط" />
                                        </div>

                                        {/* circle name */}
                                        <div
                                            style={{
                                                fontSize: 15,
                                                fontWeight: 900,
                                                color: "#0C447C",
                                                marginBottom: 10,
                                            }}
                                        >
                                            {c.name}
                                        </div>

                                        {/* body */}
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 6,
                                                marginBottom: 14,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#94a3b8",
                                                        width: 52,
                                                        flexShrink: 0,
                                                        marginTop: 1,
                                                    }}
                                                >
                                                    🏛 المجمع
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                        flex: 1,
                                                    }}
                                                >
                                                    {c.center?.name ||
                                                        `مجمع #${c.center_id}`}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#94a3b8",
                                                        width: 52,
                                                        flexShrink: 0,
                                                        marginTop: 1,
                                                    }}
                                                >
                                                    🕌 المسجد
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                        flex: 1,
                                                    }}
                                                >
                                                    {c.mosque?.name || "—"}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#94a3b8",
                                                        width: 52,
                                                        flexShrink: 0,
                                                        marginTop: 1,
                                                    }}
                                                >
                                                    👨‍🏫 المعلم
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                        flex: 1,
                                                    }}
                                                >
                                                    {c.teacher?.name || "—"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* actions */}
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 8,
                                                paddingTop: 12,
                                                borderTop: "1px solid #f1f5f9",
                                            }}
                                        >
                                            <button
                                                onClick={() => {
                                                    setSelectedCircle(c);
                                                    setShowUpdateModal(true);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 4,
                                                    padding: "6px 0",
                                                    borderRadius: 8,
                                                    border: "1px solid #B5D4F4",
                                                    background: "#E6F1FB",
                                                    color: "#0C447C",
                                                    cursor: "pointer",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeleteId(c.id);
                                                    setShowDeleteModal(true);
                                                }}
                                                style={{
                                                    padding: "6px 14px",
                                                    borderRadius: 8,
                                                    border: "1px solid #fecaca",
                                                    background: "#fee2e2",
                                                    color: "#b91c1c",
                                                    cursor: "pointer",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* bulk action bar */}
                {selectedItems.size > 0 && (
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
                                animation: "cm-pulse 1.4s ease-in-out infinite",
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
                            {selectedItems.size} حلقات محددة
                        </span>
                        <button
                            onClick={() => setShowBulkDeleteModal(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 14px",
                                borderRadius: 9,
                                border: "1px solid #fecaca",
                                background: "#fee2e2",
                                color: "#b91c1c",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiTrash2 size={13} /> حذف {selectedItems.size}
                        </button>
                        <button
                            onClick={() => setSelectedItems(new Set())}
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
            </div>

            {/* ══════════════════════════════
                EXCEL ACTIONS
            ══════════════════════════════ */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    boxShadow: "0 2px 14px #0001",
                    padding: "14px 20px",
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <span style={{ flex: 1, fontSize: 12, color: "#94a3b8" }}>
                    يمكنك تصدير الحلقات لـ Excel أو رفع ملف لاستيراد الحلقات
                    دفعةً واحدة
                </span>
                <button
                    onClick={handleDownloadTemplate}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        color: "#475569",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "inherit",
                    }}
                >
                    <RiFileExcel2Line size={15} /> قالب الاستيراد
                </button>
                <label
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        color: "#475569",
                        cursor: importing ? "not-allowed" : "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "inherit",
                        opacity: importing ? 0.5 : 1,
                    }}
                >
                    <FiUpload size={14} />
                    {importing ? "جاري الرفع..." : "رفع Excel"}
                    <input
                        ref={importInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImportFile}
                        disabled={importing}
                        style={{ display: "none" }}
                    />
                </label>
                <button
                    onClick={handleExport}
                    disabled={circles.length === 0 || importing}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: 10,
                        border: "none",
                        background: "#0f6e56",
                        color: "#fff",
                        cursor:
                            circles.length === 0 || importing
                                ? "not-allowed"
                                : "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "inherit",
                        opacity: circles.length === 0 ? 0.5 : 1,
                    }}
                >
                    <RiFileExcel2Line size={16} /> تصدير Excel
                </button>
            </div>

            <style>{`
                @keyframes cm-spin  { to { transform: rotate(360deg); } }
                @keyframes cm-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
            `}</style>
        </div>
    );
};

export default CirclesManagement;
