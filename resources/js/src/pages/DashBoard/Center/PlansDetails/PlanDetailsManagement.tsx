// PlanDetailsManagement.tsx — نسخة مُعاد تصميمها بالكامل
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { RiFileExcel2Line } from "react-icons/ri";
import {
    FiTrash2,
    FiPlus,
    FiUpload,
    FiSearch,
    FiX,
    FiGrid,
    FiList,
    FiChevronDown,
    FiDownload,
    FiCheckCircle,
    FiBook,
    FiRotateCcw,
    FiInfo,
} from "react-icons/fi";
import { usePlanDetails } from "./hooks/usePlanDetails";
import CreatePlanDetailPage from "./models/CreatePlanDetailPage";
import UpdatePlanDetailPage from "./models/UpdatePlanDetailPage";
import DeleteModal from "./components/DeleteModal";
import "../../../../assets/scss/main.scss";

/* ══════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════ */
interface PlanDetailType {
    id: number;
    day_number: number;
    new_memorization: string | null;
    review_memorization: string | null;
    status: "pending" | "current" | "completed";
    plan_name?: string;
    plan?: { plan_name: string };
}

interface PlatformPlanOption {
    id: number;
    title: string;
    description?: string;
    duration_days: number;
    details_count: number;
    is_featured: boolean;
}

interface CenterPlan {
    id: number;
    plan_name: string;
    total_months: number;
    details_count: number;
}

type ViewMode = "table" | "cards";
type StatusFilter = "" | "pending" | "current" | "completed";

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

const STATUS_CFG = {
    completed: {
        bg: "#dcfce7",
        color: "#15803d",
        border: "#bbf7d0",
        dot: "#16a34a",
        label: "مكتمل",
        cardBorder: "#16a34a",
    },
    current: {
        bg: "#fef9c3",
        color: "#a16207",
        border: "#fde68a",
        dot: "#d97706",
        label: "حالي",
        cardBorder: "#d97706",
    },
    pending: {
        bg: "#f1f5f9",
        color: "#475569",
        border: "#e2e8f0",
        dot: "#94a3b8",
        label: "معلق",
        cardBorder: "#CBD5E1",
    },
} as const;

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

const StatusBadge = ({ status }: { status: PlanDetailType["status"] }) => {
    const s = STATUS_CFG[status] ?? STATUS_CFG.pending;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap",
            }}
        >
            <span
                style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: s.dot,
                    display: "inline-block",
                }}
            />
            {s.label}
        </span>
    );
};

/* ══════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════ */
const PlanDetailsManagement: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const planIdNum = planId ? parseInt(planId) : 0;

    /* ── Center Plans ── */
    const [centerPlans, setCenterPlans] = useState<CenterPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(
        planIdNum > 0 ? planIdNum : null,
    );
    const [planName, setPlanName] = useState<string>("");
    const [loadingCenterPlans, setLoadingCenterPlans] = useState(true);

    /* ── Filters / View ── */
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
    const [viewMode, setViewMode] = useState<ViewMode>("table");

    /* ── Bulk select ── */
    const [selectedDetails, setSelectedDetails] = useState<Set<number>>(
        new Set(),
    );
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    /* ── Hook ── */
    const { details, loading, pagination, currentPage, goToPage, refetch } =
        usePlanDetails(selectedPlanId ?? 0);

    /* ── Modals ── */
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState<number | null>(
        null,
    );
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    /* ── Excel ── */
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── Platform Plans ── */
    const [platformPlans, setPlatformPlans] = useState<PlatformPlanOption[]>(
        [],
    );
    const [loadingPlatformPlans, setLoadingPlatformPlans] = useState(false);
    const [selectedPlatformPlanId, setSelectedPlatformPlanId] = useState<
        number | null
    >(null);
    const [importingFromPlatform, setImportingFromPlatform] = useState(false);
    const [showPlatformSection, setShowPlatformSection] = useState(false);
    const [platformSearch, setPlatformSearch] = useState("");

    /* ── Session ── */
    const [sessionRunning, setSessionRunning] = useState(false);

    /* ════════════════════════════════════════
       Data fetching
    ════════════════════════════════════════ */
    const fetchCenterPlans = useCallback(async () => {
        setLoadingCenterPlans(true);
        try {
            const res = await fetch(
                "/api/v1/plans/my-center-plans?per_page=100",
                { credentials: "include" },
            );
            if (res.ok) {
                const data = await res.json();
                const list: CenterPlan[] = data.data ?? [];
                setCenterPlans(list);
                if (list.length > 0) {
                    const fromUrl = list.find((p) => p.id === planIdNum);
                    const toSelect = fromUrl ?? list[0];
                    setSelectedPlanId(toSelect.id);
                    setPlanName(toSelect.plan_name);
                }
            }
        } catch {
            toast.error("خطأ في جلب خطط المجمع");
        } finally {
            setLoadingCenterPlans(false);
        }
    }, [planIdNum]);

    useEffect(() => {
        fetchCenterPlans();
    }, [fetchCenterPlans]);

    useEffect(() => {
        if (!selectedPlanId) return;
        const found = centerPlans.find((p) => p.id === selectedPlanId);
        if (found) setPlanName(found.plan_name);
    }, [selectedPlanId, centerPlans]);

    useEffect(() => {
        setSelectedDetails(new Set());
        setSearchText("");
        setStatusFilter("");
    }, [selectedPlanId]);

    const fetchPlatformPlans = useCallback(async () => {
        setLoadingPlatformPlans(true);
        try {
            const res = await fetch("/api/v1/platform-plans/available", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setPlatformPlans(data.data ?? []);
            }
        } catch {
            toast.error("خطأ في جلب خطط المنصة");
        } finally {
            setLoadingPlatformPlans(false);
        }
    }, []);

    useEffect(() => {
        if (showPlatformSection && platformPlans.length === 0)
            fetchPlatformPlans();
    }, [showPlatformSection, fetchPlatformPlans, platformPlans.length]);

    /* ════════════════════════════════════════
       Filtering
    ════════════════════════════════════════ */
    const filteredDetails = useMemo(
        () =>
            details.filter((item: PlanDetailType) => {
                const q = searchText.trim();
                const matchSearch =
                    !q ||
                    String(item.day_number).includes(q) ||
                    (item.new_memorization ?? "").includes(q) ||
                    (item.review_memorization ?? "").includes(q);
                const matchStatus =
                    statusFilter === "" || item.status === statusFilter;
                return matchSearch && matchStatus;
            }),
        [details, searchText, statusFilter],
    );

    const filteredPlatformPlans = useMemo(
        () =>
            platformPlans.filter(
                (p) =>
                    platformSearch.trim() === "" ||
                    p.title.includes(platformSearch.trim()) ||
                    (p.description ?? "").includes(platformSearch.trim()),
            ),
        [platformPlans, platformSearch],
    );

    /* ── computed stats ── */
    const statCompleted = details.filter(
        (d: PlanDetailType) => d.status === "completed",
    ).length;
    const statCurrent = details.filter(
        (d: PlanDetailType) => d.status === "current",
    ).length;
    const statPending = details.filter(
        (d: PlanDetailType) => d.status === "pending",
    ).length;
    const total = details.length;
    const progress = total ? Math.round((statCompleted / total) * 100) : 0;

    /* ════════════════════════════════════════
       Handlers
    ════════════════════════════════════════ */
    const allSelected =
        filteredDetails.length > 0 &&
        selectedDetails.size === filteredDetails.length;

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedDetails(new Set());
        } else {
            setSelectedDetails(
                new Set(filteredDetails.map((i: PlanDetailType) => i.id)),
            );
        }
    };

    const toggleSelectItem = (id: number) => {
        const s = new Set(selectedDetails);
        s.has(id) ? s.delete(id) : s.add(id);
        setSelectedDetails(s);
    };

    const handleBulkDeleteConfirm = async () => {
        if (!selectedDetails.size) return;
        setBulkDeleting(true);
        try {
            const csrf =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch("/api/v1/plans/plan-details/bulk-delete", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrf,
                },
                body: JSON.stringify({ ids: Array.from(selectedDetails) }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success(
                    `تم حذف ${result.deleted || selectedDetails.size} عنصر بنجاح!`,
                );
                refetch();
                setSelectedDetails(new Set());
                setShowBulkDeleteModal(false);
            } else {
                toast.error(result.message || "فشل الحذف الجماعي");
            }
        } catch {
            toast.error("خطأ في الحذف الجماعي");
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const csrf =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch(`/api/v1/plans/plan-details/${deleteId}`, {
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
                toast.success("تم حذف اليوم بنجاح");
                refetch();
                setShowDeleteModal(false);
                setDeleteId(null);
            } else {
                toast.error(result.message || "فشل في الحذف");
            }
        } catch {
            toast.error("حدث خطأ في الحذف");
        } finally {
            setDeleting(false);
        }
    };

    const exportToExcel = useCallback(() => {
        if (!selectedPlanId) return;
        try {
            const rows = [
                [
                    "رقم الخطة",
                    "رقم اليوم",
                    "الحفظ الجديد",
                    "المراجعة",
                    "الحالة",
                ],
                [`${selectedPlanId}`, "", "", "", ""],
                ...details.map((item: PlanDetailType) => [
                    `${selectedPlanId}`,
                    item.day_number,
                    item.new_memorization || "",
                    item.review_memorization || "",
                    item.status === "completed"
                        ? "مكتمل"
                        : item.status === "current"
                          ? "حالي"
                          : "معلق",
                ]),
            ];
            const ws = XLSX.utils.aoa_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                wb,
                ws,
                `تفاصيل_خطة_${selectedPlanId}`,
            );
            XLSX.writeFile(wb, `خطة_${selectedPlanId}_${Date.now()}.xlsx`, {
                bookType: "xlsx",
            });
            toast.success("تم التصدير بنجاح!");
        } catch {
            toast.error("خطأ في التصدير");
        }
    }, [details, selectedPlanId]);

    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                if (rows.length < 3) {
                    toast.error("الملف فارغ");
                    return;
                }
                const filePlanId = parseInt(
                    (rows[1]?.[0] || "").toString().trim(),
                );
                if (!filePlanId || filePlanId <= 0) {
                    toast.error("رقم الخطة غير صحيح في الملف");
                    return;
                }
                const headers = (rows[0] as any[]).map((h: any) =>
                    h.toString().trim(),
                );
                const dayIdx = headers.findIndex(
                    (h) => h.includes("يوم") || h.includes("Day"),
                );
                const newIdx = headers.findIndex(
                    (h) => h.includes("حفظ") || h.includes("New"),
                );
                const revIdx = headers.findIndex(
                    (h) => h.includes("مراجعة") || h.includes("Review"),
                );
                const stIdx = headers.findIndex(
                    (h) => h.includes("حالة") || h.includes("Status"),
                );
                if (dayIdx === -1 || newIdx === -1 || revIdx === -1) {
                    toast.error("أعمدة الملف غير صحيحة");
                    return;
                }
                const importData: any[] = [];
                for (let i = 2; i < rows.length; i++) {
                    const row = rows[i] as any[];
                    const dayNumber = parseInt(
                        (row[dayIdx] || "").toString().trim(),
                    );
                    if (!isNaN(dayNumber) && dayNumber > 0) {
                        const statusText = (row[stIdx] || "").toString();
                        let status: "pending" | "current" | "completed" =
                            "pending";
                        if (statusText.includes("مكتمل")) status = "completed";
                        else if (statusText.includes("حالي"))
                            status = "current";
                        importData.push({
                            plan_id: filePlanId,
                            day_number: dayNumber,
                            new_memorization:
                                row[newIdx]?.toString().trim() || null,
                            review_memorization:
                                row[revIdx]?.toString().trim() || null,
                            status,
                        });
                    }
                }
                if (!importData.length) {
                    toast.error("لا توجد أيام صالحة في الملف");
                    return;
                }
                const csrf =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") || "";
                const res = await fetch(
                    `/api/v1/plans/${filePlanId}/bulk-import`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            "X-CSRF-TOKEN": csrf,
                        },
                        body: JSON.stringify({ details: importData }),
                    },
                );
                const result = await res.json();
                if (res.ok) {
                    toast.success(
                        `تم استيراد ${result.imported || importData.length} يوم بنجاح!`,
                    );
                    refetch();
                } else {
                    toast.error(result.message || "فشل الاستيراد");
                }
            } catch {
                toast.error("خطأ أثناء قراءة الملف");
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        },
        [refetch],
    );

    const handleImportFromPlatform = useCallback(async () => {
        if (!selectedPlatformPlanId) {
            toast.error("اختر خطة منصة أولاً");
            return;
        }
        if (!selectedPlanId) {
            toast.error("اختر خطة مجمع أولاً");
            return;
        }
        setImportingFromPlatform(true);
        try {
            const csrf =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const res = await fetch(
                `/api/v1/plans/${selectedPlanId}/import-from-platform`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrf,
                    },
                    body: JSON.stringify({
                        platform_plan_id: selectedPlatformPlanId,
                    }),
                },
            );
            const result = await res.json();
            if (res.ok) {
                toast.success(result.message ?? "تم الاستيراد بنجاح!");
                refetch();
                setSelectedPlatformPlanId(null);
                setShowPlatformSection(false);
                setPlatformSearch("");
            } else {
                toast.error(result.message || "فشل الاستيراد");
            }
        } catch {
            toast.error("خطأ في الاتصال");
        } finally {
            setImportingFromPlatform(false);
        }
    }, [selectedPlatformPlanId, selectedPlanId, refetch]);

    const hasPrev = currentPage > 1;
    const hasNext = pagination && currentPage < pagination.last_page;

    /* ════════════════════════════════════════
       Styles shared
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
       Loading state
    ════════════════════════════════════════ */
    if (loadingCenterPlans) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 400,
                    gap: 14,
                    fontFamily: "'Tajawal',sans-serif",
                }}
            >
                <div
                    style={{
                        width: 44,
                        height: 44,
                        border: "4px solid #dbeafe",
                        borderTopColor: "#2563eb",
                        borderRadius: "50%",
                        animation: "pdm-spin 0.8s linear infinite",
                    }}
                />
                <span style={{ color: "#64748b", fontSize: 14 }}>
                    جاري تحميل الخطط...
                </span>
                <style>{`@keyframes pdm-spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

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
            <DeleteModal
                show={showDeleteModal}
                title="تأكيد حذف اليوم"
                message="هل أنت متأكد من حذف هذا اليوم؟ لا يمكن التراجع عن هذا الإجراء."
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                }}
                onConfirm={handleDeleteConfirm}
                confirmText={deleting ? "جاري الحذف..." : "حذف اليوم"}
                showConfirm
                loading={deleting}
            />

            <DeleteModal
                show={showBulkDeleteModal}
                title="تأكيد الحذف الجماعي"
                message={`هل أنت متأكد من حذف ${selectedDetails.size} عنصر؟ لا يمكن التراجع عن هذا الإجراء.`}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={handleBulkDeleteConfirm}
                confirmText={
                    bulkDeleting
                        ? "جاري الحذف..."
                        : `حذف ${selectedDetails.size} عنصر`
                }
                showConfirm
                loading={bulkDeleting}
            />

            {showCreateModal && selectedPlanId && (
                <CreatePlanDetailPage
                    planId={selectedPlanId}
                    onClose={() => {
                        setShowCreateModal(false);
                        refetch();
                    }}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        refetch();
                    }}
                />
            )}
            {showUpdateModal && selectedDetailId && (
                <UpdatePlanDetailPage
                    detailId={selectedDetailId}
                    onClose={() => {
                        setShowUpdateModal(false);
                        setSelectedDetailId(null);
                        refetch();
                    }}
                    onSuccess={() => {
                        setShowUpdateModal(false);
                        setSelectedDetailId(null);
                        refetch();
                    }}
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
                                إدارة تفاصيل الخطط
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                إدارة أيام الحفظ والمراجعة لكل خطة في مجمعك
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
                                                "pdm-pulse 1.4s ease-in-out infinite",
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
                                        <FiX size={12} /> إيقاف الجلسة
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle size={12} /> بدء الجلسة
                                    </>
                                )}
                            </button>
                            {selectedPlanId && (
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
                                    <FiPlus size={12} /> يوم جديد
                                </button>
                            )}
                        </div>
                    </div>

                    {/* stats bar */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            {
                                label: "مكتمل",
                                value: statCompleted,
                                color: "#4ade80",
                            },
                            {
                                label: "حالي",
                                value: statCurrent,
                                color: "#fbbf24",
                            },
                            {
                                label: "معلق",
                                value: statPending,
                                color: "#94a3b8",
                            },
                            {
                                label: "الإجمالي",
                                value: total,
                                color: "rgba(255,255,255,.7)",
                            },
                            {
                                label: "الإنجاز",
                                value: `${progress}%`,
                                color: "#38bdf8",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                style={{
                                    background: "rgba(255,255,255,.07)",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    textAlign: "center",
                                    minWidth: 72,
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
                                نسبة الإنجاز
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
                                        width: `${progress}%`,
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
                PLAN SELECTOR
            ══════════════════════════════ */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    boxShadow: "0 2px 14px #0001",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        borderBottom: "1px solid #f1f5f9",
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
                            اختيار الخطة
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            {centerPlans.length} خطط متاحة في مجمعك
                        </div>
                    </div>
                </div>

                {centerPlans.length === 0 ? (
                    <div
                        style={{
                            padding: "32px 20px",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: 13,
                        }}
                    >
                        <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                        <div>لا توجد خطط في مجمعك بعد — أنشئ خطة أولاً</div>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            padding: "14px 20px",
                        }}
                    >
                        {centerPlans.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id)}
                                style={{
                                    padding: "12px 18px",
                                    borderRadius: 12,
                                    cursor: "pointer",
                                    border: `2px solid ${selectedPlanId === plan.id ? "#2563eb" : "#e2e8f0"}`,
                                    background:
                                        selectedPlanId === plan.id
                                            ? "#eff6ff"
                                            : "#f8fafc",
                                    transition: "all .15s",
                                    minWidth: 150,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color:
                                            selectedPlanId === plan.id
                                                ? "#1d4ed8"
                                                : "#1e293b",
                                    }}
                                >
                                    {plan.plan_name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#94a3b8",
                                        marginTop: 3,
                                    }}
                                >
                                    {plan.details_count} يوم ·{" "}
                                    {plan.total_months} شهر
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ══════════════════════════════
                DETAILS TABLE / CARDS
            ══════════════════════════════ */}
            {selectedPlanId ? (
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
                                تفاصيل الخطة —{" "}
                                <span style={{ color: "#2563eb" }}>
                                    {planName}
                                </span>
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: "#94a3b8",
                                        fontWeight: 400,
                                        marginRight: 6,
                                    }}
                                >
                                    ({details.length} يوم)
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#94a3b8",
                                    marginTop: 2,
                                }}
                            >
                                عرض {filteredDetails.length} من {details.length}{" "}
                                يوم
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
                            <FiPlus size={14} /> يوم جديد
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
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder="بحث برقم اليوم أو الحفظ أو المراجعة..."
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    outline: "none",
                                    fontSize: 12,
                                    flex: 1,
                                    fontFamily: "inherit",
                                }}
                            />
                            {searchText && (
                                <button
                                    onClick={() => setSearchText("")}
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
                            <option value="completed">مكتمل</option>
                            <option value="current">حالي</option>
                            <option value="pending">معلق</option>
                        </select>

                        {(searchText || statusFilter) && (
                            <button
                                onClick={() => {
                                    setSearchText("");
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
                            {filteredDetails.length} نتيجة
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
                                        <th style={{ ...TH, width: 90 }}>
                                            رقم اليوم
                                        </th>
                                        <th style={TH}>الحفظ الجديد</th>
                                        <th style={TH}>المراجعة</th>
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
                                                colSpan={6}
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
                                                            "pdm-spin 0.7s linear infinite",
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ) : filteredDetails.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
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
                                                        {searchText ||
                                                        statusFilter
                                                            ? "لا توجد نتائج مطابقة"
                                                            : "لا توجد تفاصيل لهذه الخطة"}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDetails.map(
                                            (
                                                item: PlanDetailType,
                                                idx: number,
                                            ) => (
                                                <tr
                                                    key={item.id}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.background =
                                                            "#f8fafc")
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.background =
                                                            "#fff")
                                                    }
                                                    style={{
                                                        transition:
                                                            "background .1s",
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
                                                            checked={selectedDetails.has(
                                                                item.id,
                                                            )}
                                                            onChange={() =>
                                                                toggleSelectItem(
                                                                    item.id,
                                                                )
                                                            }
                                                            style={{
                                                                cursor: "pointer",
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={TD}>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 10,
                                                            }}
                                                        >
                                                            <Avatar
                                                                name={String(
                                                                    item.day_number,
                                                                )}
                                                                idx={idx}
                                                            />
                                                            <span
                                                                style={{
                                                                    fontWeight: 800,
                                                                    fontSize: 17,
                                                                    color: "#0C447C",
                                                                }}
                                                            >
                                                                {String(
                                                                    item.day_number,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={TD}>
                                                        <span
                                                            style={{
                                                                fontSize: 12,
                                                                color: "#475569",
                                                                maxWidth: 200,
                                                                display:
                                                                    "block",
                                                                overflow:
                                                                    "hidden",
                                                                textOverflow:
                                                                    "ellipsis",
                                                                whiteSpace:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            {item.new_memorization ||
                                                                "—"}
                                                        </span>
                                                    </td>
                                                    <td style={TD}>
                                                        <span
                                                            style={{
                                                                fontSize: 12,
                                                                color: "#475569",
                                                                maxWidth: 200,
                                                                display:
                                                                    "block",
                                                                overflow:
                                                                    "hidden",
                                                                textOverflow:
                                                                    "ellipsis",
                                                                whiteSpace:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            {item.review_memorization ||
                                                                "—"}
                                                        </span>
                                                    </td>
                                                    <td style={TD}>
                                                        <StatusBadge
                                                            status={item.status}
                                                        />
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
                                                                    setSelectedDetailId(
                                                                        item.id,
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
                                                                    padding:
                                                                        "5px 12px",
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
                                                                    setDeleteId(
                                                                        item.id,
                                                                    );
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
                                                                    padding:
                                                                        "5px 12px",
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
                                            ),
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── CARDS VIEW ── */}
                    {viewMode === "cards" && (
                        <div style={{ padding: "16px 20px" }}>
                            {loading ? (
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
                                                "pdm-spin 0.7s linear infinite",
                                        }}
                                    />
                                </div>
                            ) : filteredDetails.length === 0 ? (
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
                                        {searchText || statusFilter
                                            ? "لا توجد نتائج مطابقة"
                                            : "لا توجد تفاصيل لهذه الخطة"}
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
                                    {filteredDetails.map(
                                        (item: PlanDetailType) => {
                                            const s =
                                                STATUS_CFG[item.status] ??
                                                STATUS_CFG.pending;
                                            return (
                                                <div
                                                    key={item.id}
                                                    style={{
                                                        background: "#f8fafc",
                                                        borderRadius: 14,
                                                        border: "1px solid #e2e8f0",
                                                        borderRight: `4px solid ${s.cardBorder}`,
                                                        padding: "16px",
                                                        transition: "all .15s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (
                                                            e.currentTarget as HTMLDivElement
                                                        ).style.background =
                                                            "#fff";
                                                        (
                                                            e.currentTarget as HTMLDivElement
                                                        ).style.boxShadow =
                                                            "0 4px 16px #0001";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (
                                                            e.currentTarget as HTMLDivElement
                                                        ).style.background =
                                                            "#f8fafc";
                                                        (
                                                            e.currentTarget as HTMLDivElement
                                                        ).style.boxShadow =
                                                            "none";
                                                    }}
                                                >
                                                    {/* top row */}
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
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
                                                                gap: 6,
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedDetails.has(
                                                                    item.id,
                                                                )}
                                                                onChange={() =>
                                                                    toggleSelectItem(
                                                                        item.id,
                                                                    )
                                                                }
                                                                style={{
                                                                    cursor: "pointer",
                                                                }}
                                                            />
                                                            <span
                                                                style={{
                                                                    fontSize: 24,
                                                                    fontWeight: 900,
                                                                    color: "#0C447C",
                                                                }}
                                                            >
                                                                {String(
                                                                    item.day_number,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                )}
                                                            </span>
                                                        </div>
                                                        <StatusBadge
                                                            status={item.status}
                                                        />
                                                    </div>

                                                    {/* body */}
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                            gap: 8,
                                                            marginBottom: 14,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                gap: 8,
                                                                alignItems:
                                                                    "flex-start",
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
                                                                📖 الحفظ
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontSize: 12,
                                                                    color: "#475569",
                                                                    lineHeight: 1.5,
                                                                    flex: 1,
                                                                }}
                                                            >
                                                                {item.new_memorization ||
                                                                    "—"}
                                                            </span>
                                                        </div>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                gap: 8,
                                                                alignItems:
                                                                    "flex-start",
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
                                                                🔁 مراجعة
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontSize: 12,
                                                                    color: "#475569",
                                                                    lineHeight: 1.5,
                                                                    flex: 1,
                                                                }}
                                                            >
                                                                {item.review_memorization ||
                                                                    "—"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* actions */}
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: 8,
                                                            paddingTop: 12,
                                                            borderTop:
                                                                "1px solid #f1f5f9",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDetailId(
                                                                    item.id,
                                                                );
                                                                setShowUpdateModal(
                                                                    true,
                                                                );
                                                            }}
                                                            style={{
                                                                flex: 1,
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                gap: 4,
                                                                padding:
                                                                    "6px 0",
                                                                borderRadius: 8,
                                                                border: "1px solid #B5D4F4",
                                                                background:
                                                                    "#E6F1FB",
                                                                color: "#0C447C",
                                                                cursor: "pointer",
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                fontFamily:
                                                                    "inherit",
                                                            }}
                                                        >
                                                            تعديل
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeleteId(
                                                                    item.id,
                                                                );
                                                                setShowDeleteModal(
                                                                    true,
                                                                );
                                                            }}
                                                            style={{
                                                                padding:
                                                                    "6px 14px",
                                                                borderRadius: 8,
                                                                border: "1px solid #fecaca",
                                                                background:
                                                                    "#fee2e2",
                                                                color: "#b91c1c",
                                                                cursor: "pointer",
                                                                fontSize: 12,
                                                                fontWeight: 700,
                                                                fontFamily:
                                                                    "inherit",
                                                            }}
                                                        >
                                                            حذف
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* bulk action bar */}
                    {selectedDetails.size > 0 && (
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
                                        "pdm-pulse 1.4s ease-in-out infinite",
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
                                {selectedDetails.size} عناصر محددة
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
                                <FiTrash2 size={13} /> حذف{" "}
                                {selectedDetails.size}
                            </button>
                            <button
                                onClick={() => setSelectedDetails(new Set())}
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

                    {/* pagination */}
                    {pagination && pagination.last_page > 1 && (
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
                                عرض {filteredDetails.length} من{" "}
                                {pagination.total} يوم · الصفحة{" "}
                                <strong>{currentPage}</strong> من{" "}
                                <strong>{pagination.last_page}</strong>
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={!hasPrev || loading}
                                    style={{
                                        padding: "5px 14px",
                                        borderRadius: 8,
                                        border: "1px solid #e2e8f0",
                                        background: "#f8fafc",
                                        color: "#475569",
                                        cursor: !hasPrev
                                            ? "not-allowed"
                                            : "pointer",
                                        fontSize: 12,
                                        fontFamily: "inherit",
                                        opacity: !hasPrev ? 0.4 : 1,
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
                                    {currentPage}
                                </button>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasNext || loading}
                                    style={{
                                        padding: "5px 14px",
                                        borderRadius: 8,
                                        border: "1px solid #e2e8f0",
                                        background: "#f8fafc",
                                        color: "#475569",
                                        cursor: !hasNext
                                            ? "not-allowed"
                                            : "pointer",
                                        fontSize: 12,
                                        fontFamily: "inherit",
                                        opacity: !hasNext ? 0.4 : 1,
                                    }}
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 20,
                        boxShadow: "0 2px 14px #0001",
                        padding: "50px 20px",
                        textAlign: "center",
                        color: "#94a3b8",
                    }}
                >
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                        اختر خطة من الأعلى لعرض تفاصيلها
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                        ستظهر هنا أيام الحفظ والمراجعة المرتبطة بالخطة المختارة
                    </div>
                </div>
            )}

            {/* ══════════════════════════════
                PLATFORM IMPORT
            ══════════════════════════════ */}
            {selectedPlanId && (
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 20,
                        boxShadow: "0 2px 14px #0001",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "16px 20px",
                            borderBottom: showPlatformSection
                                ? "1px solid #f1f5f9"
                                : "none",
                            flexWrap: "wrap",
                            gap: 8,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    background: "#eff6ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 15,
                                }}
                            >
                                📋
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontWeight: 900,
                                        fontSize: 15,
                                        color: "#1e293b",
                                    }}
                                >
                                    استيراد من خطط المنصة
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#94a3b8",
                                        marginTop: 1,
                                    }}
                                >
                                    اختر خطة من المنصة لاستيراد أيامها مباشرة
                                    إلى "{planName}"
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowPlatformSection((v) => !v);
                                setSelectedPlatformPlanId(null);
                                setPlatformSearch("");
                            }}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "7px 14px",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                                color: "#475569",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiChevronDown
                                size={13}
                                style={{
                                    transform: showPlatformSection
                                        ? "rotate(180deg)"
                                        : "none",
                                    transition: "transform .2s",
                                }}
                            />
                            {showPlatformSection
                                ? "إخفاء"
                                : "عرض الخطط المتاحة"}
                        </button>
                    </div>

                    {showPlatformSection && (
                        <div style={{ padding: "14px 20px" }}>
                            {/* platform search */}
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    background: "#f8fafc",
                                    borderRadius: 10,
                                    padding: "7px 12px",
                                    maxWidth: 340,
                                    border: "1px solid #e2e8f0",
                                    marginBottom: 14,
                                }}
                            >
                                <FiSearch size={13} color="#94a3b8" />
                                <input
                                    value={platformSearch}
                                    onChange={(e) =>
                                        setPlatformSearch(e.target.value)
                                    }
                                    placeholder="بحث في خطط المنصة..."
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        outline: "none",
                                        fontSize: 12,
                                        flex: 1,
                                        fontFamily: "inherit",
                                    }}
                                />
                            </label>

                            {loadingPlatformPlans ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "24px 0",
                                        color: "#94a3b8",
                                        fontSize: 13,
                                    }}
                                >
                                    جاري تحميل خطط المنصة...
                                </div>
                            ) : filteredPlatformPlans.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "24px 0",
                                        color: "#94a3b8",
                                        fontSize: 13,
                                    }}
                                >
                                    {platformSearch
                                        ? "لا توجد خطط مطابقة"
                                        : "لا توجد خطط متاحة من المنصة"}
                                </div>
                            ) : (
                                <>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 8,
                                            flexWrap: "wrap",
                                            marginBottom: 16,
                                        }}
                                    >
                                        {filteredPlatformPlans.map((plan) => (
                                            <div
                                                key={plan.id}
                                                onClick={() =>
                                                    setSelectedPlatformPlanId(
                                                        selectedPlatformPlanId ===
                                                            plan.id
                                                            ? null
                                                            : plan.id,
                                                    )
                                                }
                                                style={{
                                                    padding: "10px 16px",
                                                    borderRadius: 12,
                                                    cursor: "pointer",
                                                    minWidth: 155,
                                                    border: `2px solid ${selectedPlatformPlanId === plan.id ? "#2563eb" : "#e2e8f0"}`,
                                                    background:
                                                        selectedPlatformPlanId ===
                                                        plan.id
                                                            ? "#eff6ff"
                                                            : "#f8fafc",
                                                    transition: "all .15s",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        color:
                                                            selectedPlatformPlanId ===
                                                            plan.id
                                                                ? "#1d4ed8"
                                                                : "#1e293b",
                                                    }}
                                                >
                                                    {plan.is_featured && (
                                                        <span
                                                            style={{
                                                                marginLeft: 4,
                                                            }}
                                                        >
                                                            ⭐
                                                        </span>
                                                    )}
                                                    {plan.title}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#94a3b8",
                                                        marginTop: 3,
                                                    }}
                                                >
                                                    {plan.details_count} يوم ·{" "}
                                                    {plan.duration_days} يوم
                                                    إجمالي
                                                </div>
                                                {plan.description && (
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#b0b8c8",
                                                            marginTop: 3,
                                                            fontStyle: "italic",
                                                        }}
                                                    >
                                                        {plan.description}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {selectedPlatformPlanId && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 12,
                                                padding: "14px 16px",
                                                borderRadius: 12,
                                                background: "#eff6ff",
                                                border: "1.5px solid #bfdbfe",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        color: "#1d4ed8",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    سيتم استيراد{" "}
                                                    <strong>
                                                        {
                                                            platformPlans.find(
                                                                (p) =>
                                                                    p.id ===
                                                                    selectedPlatformPlanId,
                                                            )?.details_count
                                                        }
                                                    </strong>{" "}
                                                    يوم من خطة "
                                                    {
                                                        platformPlans.find(
                                                            (p) =>
                                                                p.id ===
                                                                selectedPlatformPlanId,
                                                        )?.title
                                                    }
                                                    "
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#93c5fd",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    إلى خطة "{planName}" — تأكد
                                                    من المراجعة قبل الاستيراد
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                }}
                                            >
                                                <button
                                                    onClick={
                                                        handleImportFromPlatform
                                                    }
                                                    disabled={
                                                        importingFromPlatform
                                                    }
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 6,
                                                        padding: "7px 16px",
                                                        borderRadius: 9,
                                                        border: "none",
                                                        background: "#2563eb",
                                                        color: "#fff",
                                                        cursor: importingFromPlatform
                                                            ? "not-allowed"
                                                            : "pointer",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                        opacity:
                                                            importingFromPlatform
                                                                ? 0.7
                                                                : 1,
                                                    }}
                                                >
                                                    {importingFromPlatform
                                                        ? "جاري الاستيراد..."
                                                        : "استيراد الخطة"}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setSelectedPlatformPlanId(
                                                            null,
                                                        )
                                                    }
                                                    disabled={
                                                        importingFromPlatform
                                                    }
                                                    style={{
                                                        padding: "7px 14px",
                                                        borderRadius: 9,
                                                        border: "1px solid #e2e8f0",
                                                        background: "#fff",
                                                        color: "#64748b",
                                                        cursor: "pointer",
                                                        fontSize: 12,
                                                        fontFamily: "inherit",
                                                    }}
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════
                EXCEL ACTIONS
            ══════════════════════════════ */}
            {selectedPlanId && (
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
                        يمكنك تصدير الخطة لـ Excel أو رفع ملف لاستيراد الأيام
                        دفعةً واحدة
                    </span>
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
                            cursor: uploading ? "not-allowed" : "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "inherit",
                            opacity: uploading ? 0.5 : 1,
                        }}
                    >
                        <FiUpload size={14} />
                        {uploading ? "جاري الرفع..." : "رفع Excel"}
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
                                details.length === 0 || uploading
                                    ? "not-allowed"
                                    : "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "inherit",
                            opacity: details.length === 0 ? 0.5 : 1,
                        }}
                    >
                        <RiFileExcel2Line size={16} /> تصدير Excel
                    </button>
                </div>
            )}

            <style>{`
                @keyframes pdm-spin  { to { transform: rotate(360deg); } }
                @keyframes pdm-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
            `}</style>
        </div>
    );
};

export default PlanDetailsManagement;
