// PlanDetailsManagement.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { RiFileExcel2Line } from "react-icons/ri";
import { FiTrash2, FiPlus, FiUpload, FiSearch } from "react-icons/fi";
import { usePlanDetails } from "./hooks/usePlanDetails";
import CreatePlanDetailPage from "./models/CreatePlanDetailPage";
import UpdatePlanDetailPage from "./models/UpdatePlanDetailPage";
import DeleteModal from "./components/DeleteModal";
import "../../../../assets/scss/main.scss";

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

const PlanDetailsManagement: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const planIdNum = planId ? parseInt(planId!) : 0;

    // ── خطط المجمع ──────────────────────────────────────────────
    const [centerPlans, setCenterPlans] = useState<CenterPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(
        planIdNum > 0 ? planIdNum : null,
    );
    const [planName, setPlanName] = useState<string>("");
    const [loadingCenterPlans, setLoadingCenterPlans] = useState(true);
    const [searchText, setSearchText] = useState(""); // ✅ موجود دلوقتي

    // ✅ CORRECT - Proper union types
    const [statusFilter, setStatusFilter] = useState<
        "" | "pending" | "current" | "completed"
    >("");

    // ── حذف جماعي ───────────────────────────────────────────────
    const [selectedDetails, setSelectedDetails] = useState<Set<number>>(
        new Set(),
    );
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // نبعت 0 للـ hook لما مفيش خطة مختارة عشان يرجع بيانات فارغة
    const { details, loading, pagination, currentPage, goToPage, refetch } =
        usePlanDetails(selectedPlanId ?? 0);

    // ── Modals ───────────────────────────────────────────────────
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState<number | null>(
        null,
    );
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteDetailId, setDeleteDetailId] = useState<number | null>(null);

    // ── Excel ────────────────────────────────────────────────────
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── خطط المنصة ──────────────────────────────────────────────
    const [platformPlans, setPlatformPlans] = useState<PlatformPlanOption[]>(
        [],
    );
    const [loadingPlatformPlans, setLoadingPlatformPlans] = useState(false);
    // ✅ CORRECT - Proper nullable union type
    const [selectedPlatformPlanId, setSelectedPlatformPlanId] = useState<
        number | null
    >(null);

    const [importingFromPlatform, setImportingFromPlatform] = useState(false);
    const [showPlatformSection, setShowPlatformSection] = useState(false);
    const [platformSearch, setPlatformSearch] = useState("");

    // ── جلب خطط المجمع — مع اختيار تلقائي للأولى ───────────────
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
                    // لو في planId في الـ URL حاول تلاقيه، لو لأ خد الأول
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

    // ── تحديث اسم الخطة عند تغيير الاختيار ─────────────────────
    useEffect(() => {
        if (!selectedPlanId) return;
        const found = centerPlans.find((p) => p.id === selectedPlanId);
        if (found) setPlanName(found.plan_name);
    }, [selectedPlanId, centerPlans]);

    // ── إعادة تعيين الفلاتر عند تغيير الخطة ────────────────────
    useEffect(() => {
        setSelectedDetails(new Set());
        setSearchText("");
        setStatusFilter("");
    }, [selectedPlanId]);

    // ── جلب خطط المنصة ──────────────────────────────────────────
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
        if (showPlatformSection && platformPlans.length === 0) {
            fetchPlatformPlans();
        }
    }, [showPlatformSection, fetchPlatformPlans, platformPlans.length]);

    // ── فلترة التفاصيل ───────────────────────────────────────────
    const filteredDetails = details.filter((item: PlanDetailType) => {
        const matchSearch =
            searchText.trim() === "" ||
            String(item.day_number).includes(searchText.trim()) ||
            (item.new_memorization ?? "").includes(searchText.trim()) ||
            (item.review_memorization ?? "").includes(searchText.trim());
        const matchStatus = statusFilter === "" || item.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // ── تحديد الكل ───────────────────────────────────────────────
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

    // ── حذف جماعي ────────────────────────────────────────────────
    const handleBulkDeleteConfirm = async () => {
        if (selectedDetails.size === 0) return;
        setBulkDeleting(true);
        try {
            const csrfToken =
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
                    "X-CSRF-TOKEN": csrfToken,
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
    // في الـ state
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // دالة الحذف
    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(`/api/v1/super/mosques/${deleteId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success("تم حذف المسجد بنجاح");
                refetch();
                setShowDeleteModal(false);
                setDeleteId(null);
            } else {
                toast.error(result.message || "فشل في حذف المسجد");
            }
        } catch {
            toast.error("حدث خطأ في الحذف");
        } finally {
            setDeleting(false);
        }
    };

    // زر الحذف في الجدول
    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };
    // ── تصدير Excel ───────────────────────────────────────────────
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

    // ── استيراد Excel ─────────────────────────────────────────────
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

                const csrfToken =
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
                            "X-CSRF-TOKEN": csrfToken,
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

    // ── استيراد من خطة المنصة ────────────────────────────────────
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
            const csrfToken =
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
                        "X-CSRF-TOKEN": csrfToken,
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

    // ── Helpers ───────────────────────────────────────────────────
    const getStatusBadge = (status: PlanDetailType["status"]) => {
        switch (status) {
            case "completed":
                return {
                    label: "مكتمل",
                    style: {
                        background: "var(--green-100)",
                        color: "var(--green-800)",
                        border: "1.5px solid var(--green-200)",
                    },
                };
            case "current":
                return {
                    label: "حالي",
                    style: {
                        background: "var(--yellow-100)",
                        color: "var(--yellow-800)",
                        border: "1.5px solid var(--yellow-200)",
                    },
                };
            default:
                return {
                    label: "معلق",
                    style: {
                        background: "var(--n100)",
                        color: "var(--n600)",
                        border: "1.5px solid var(--n200)",
                    },
                };
        }
    };

    const filteredPlatformPlans = platformPlans.filter(
        (p) =>
            platformSearch.trim() === "" ||
            p.title.includes(platformSearch.trim()) ||
            (p.description ?? "").includes(platformSearch.trim()),
    );

    const hasPrev = currentPage > 1;
    const hasNext = pagination && currentPage < pagination.last_page;

    // ── شاشة التحميل الأولية ─────────────────────────────────────
    if (loadingCenterPlans) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 400,
                }}
            >
                <div
                    style={{
                        width: 48,
                        height: 48,
                        border: "4px solid var(--blue-100)",
                        borderTopColor: "var(--blue-600)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <>
            {/* ── Modals ── */}
            <DeleteModal
                show={showDeleteModal}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا اليوم؟"
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteDetailId(null);
                }}
                onConfirm={handleDeleteConfirm}
                confirmText="حذف اليوم"
                showConfirm
            />
            <DeleteModal
                show={showBulkDeleteModal}
                title="تأكيد الحذف الجماعي"
                message={`هل أنت متأكد من حذف ${selectedDetails.size} عنصر؟ لا يمكن التراجع!`}
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

            <div className="content" id="contentArea">
                {/* ══════════════════════════════════════════════════════
                    قسم 1 — اختيار الخطة
                ══════════════════════════════════════════════════════ */}
                <div className="widget" style={{ marginBottom: 16 }}>
                    <div className="wh">
                        <div className="wh-l">اختيار الخطة</div>
                        <span style={{ fontSize: 12, color: "var(--n500)" }}>
                            {centerPlans.length} خطة متاحة
                        </span>
                    </div>

                    {centerPlans.length === 0 ? (
                        <div
                            style={{
                                padding: "20px 0",
                                color: "var(--n500)",
                                fontSize: 13,
                                textAlign: "center",
                            }}
                        >
                            لا توجد خطط في مجمعك بعد — أنشئ خطة أولاً
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
                            {centerPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    style={{
                                        padding: "10px 16px",
                                        borderRadius: 10,
                                        cursor: "pointer",
                                        border: `2px solid ${
                                            selectedPlanId === plan.id
                                                ? "var(--blue-500)"
                                                : "var(--border)"
                                        }`,
                                        background:
                                            selectedPlanId === plan.id
                                                ? "var(--blue-50)"
                                                : "var(--bg2)",
                                        transition: "all 0.15s",
                                        minWidth: 140,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color:
                                                selectedPlanId === plan.id
                                                    ? "var(--blue-700)"
                                                    : "var(--n800)",
                                        }}
                                    >
                                        {plan.plan_name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "var(--n500)",
                                            marginTop: 2,
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

                {/* ══════════════════════════════════════════════════════
                    قسم 2 — جدول التفاصيل (يظهر فقط لو في خطة مختارة)
                ══════════════════════════════════════════════════════ */}
                {selectedPlanId ? (
                    <div className="widget">
                        {/* رأس الويدجت */}
                        <div className="wh">
                            <div className="wh-l">
                                تفاصيل الخطة —{" "}
                                <span
                                    style={{
                                        color: "var(--blue-600)",
                                        fontWeight: 700,
                                    }}
                                >
                                    {planName}
                                </span>
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: "var(--n500)",
                                        fontWeight: 400,
                                        marginRight: 8,
                                    }}
                                >
                                    ({details.length} يوم)
                                </span>
                            </div>
                            <button
                                className="btn bp bsm"
                                onClick={() => setShowCreateModal(true)}
                                disabled={loading}
                            >
                                <FiPlus
                                    size={16}
                                    style={{
                                        marginRight: 6,
                                        verticalAlign: -1,
                                    }}
                                />
                                يوم جديد
                            </button>
                        </div>

                        {/* ── شريط البحث والفلاتر ── */}
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                                padding: "10px  14px",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    flex: "1 1 220px",
                                    minWidth: 180,
                                }}
                            >
                                <FiSearch
                                    size={15}
                                    style={{
                                        position: "absolute",
                                        right: 10,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--n400)",
                                        pointerEvents: "none",
                                    }}
                                />
                                <input
                                    className="fi"
                                    placeholder="بحث برقم اليوم أو الحفظ أو المراجعة..."
                                    value={searchText}
                                    onChange={(e) =>
                                        setSearchText(e.target.value)
                                    }
                                    style={{ paddingRight: 32, width: "100%" }}
                                />
                            </div>

                            <select
                                className="fi"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value as any)
                                }
                                style={{ minWidth: 130, flex: "0 0 auto" }}
                            >
                                <option value="">كل الحالات</option>
                                <option value="pending">معلق</option>
                                <option value="current">حالي</option>
                                <option value="completed">مكتمل</option>
                            </select>

                            {(searchText || statusFilter) && (
                                <button
                                    className="btn bs bsm"
                                    onClick={() => {
                                        setSearchText("");
                                        setStatusFilter("");
                                    }}
                                >
                                    مسح الفلاتر
                                </button>
                            )}

                            <span
                                style={{
                                    fontSize: 12,
                                    color: "var(--n500)",
                                    marginRight: "auto",
                                }}
                            >
                                {filteredDetails.length} نتيجة
                            </span>
                        </div>

                        {/* ── الجدول ── */}
                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th>رقم اليوم</th>
                                        <th>الحفظ الجديد</th>
                                        <th>المراجعة</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                style={{
                                                    textAlign: "center",
                                                    padding: 32,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        margin: "0 auto",
                                                        border: "3px solid var(--blue-100)",
                                                        borderTopColor:
                                                            "var(--blue-500)",
                                                        borderRadius: "50%",
                                                        animation:
                                                            "spin 0.7s linear infinite",
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ) : filteredDetails.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
                                                <div
                                                    className="empty"
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "32px 0",
                                                        color: "var(--n500)",
                                                    }}
                                                >
                                                    {searchText || statusFilter
                                                        ? "لا توجد نتائج مطابقة للبحث"
                                                        : "لا توجد تفاصيل لهذه الخطة — أضف يوماً أو استورد"}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDetails.map(
                                            (item: PlanDetailType) => {
                                                const badge = getStatusBadge(
                                                    item.status,
                                                );
                                                return (
                                                    <tr key={item.id}>
                                                        <td>
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
                                                            />
                                                        </td>
                                                        <td
                                                            style={{
                                                                fontWeight: 700,
                                                                fontSize: 16,
                                                            }}
                                                        >
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
                                                        <td>
                                                            <span
                                                                style={{
                                                                    padding:
                                                                        "3px 12px",
                                                                    borderRadius: 20,
                                                                    fontSize: 12,
                                                                    fontWeight: 600,
                                                                    ...badge.style,
                                                                }}
                                                            >
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="td-actions">
                                                                <button
                                                                    className="btn bp bxs"
                                                                    onClick={() => {
                                                                        setSelectedDetailId(
                                                                            item.id,
                                                                        );
                                                                        setShowUpdateModal(
                                                                            true,
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        loading
                                                                    }
                                                                >
                                                                    تعديل
                                                                </button>
                                                                <button
                                                                    className="btn bd bxs"
                                                                    onClick={() => {
                                                                        setDeleteDetailId(
                                                                            item.id,
                                                                        );
                                                                        setShowDeleteModal(
                                                                            true,
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        loading
                                                                    }
                                                                >
                                                                    حذف
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            },
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        {pagination && pagination.last_page > 1 && (
                            <div
                                style={{
                                    marginTop: 12,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                }}
                            >
                                <span style={{ color: "var(--n500)" }}>
                                    عرض {filteredDetails.length} من{" "}
                                    {pagination.total} يوم · الصفحة{" "}
                                    <strong>{currentPage}</strong> من{" "}
                                    <strong>{pagination.last_page}</strong>
                                </span>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button
                                        className="btn bs bxs"
                                        onClick={() =>
                                            goToPage(currentPage - 1)
                                        }
                                        disabled={!hasPrev || loading}
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
                                            goToPage(currentPage + 1)
                                        }
                                        disabled={!hasNext || loading}
                                    >
                                        التالي
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="widget">
                        <div
                            style={{
                                padding: "40px 0",
                                textAlign: "center",
                                color: "var(--n500)",
                                fontSize: 14,
                            }}
                        >
                            اختر خطة من الأعلى لعرض تفاصيلها
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════
                    قسم 3 — استيراد من خطط المنصة (يظهر فقط لو في خطة مختارة)
                ══════════════════════════════════════════════════════ */}
                {selectedPlanId && (
                    <div className="widget" style={{ marginTop: 16 }}>
                        <div className="wh">
                            <div
                                className="wh-l"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <span
                                    style={{
                                        width: 26,
                                        height: 26,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: 7,
                                        background: "var(--blue-100)",
                                        fontSize: 14,
                                    }}
                                >
                                    📋
                                </span>
                                استيراد من خطط المنصة
                            </div>
                            <button
                                className="btn bs bsm"
                                onClick={() => {
                                    setShowPlatformSection((v) => !v);
                                    setSelectedPlatformPlanId(null);
                                    setPlatformSearch("");
                                }}
                            >
                                {showPlatformSection
                                    ? "إخفاء"
                                    : "عرض الخطط المتاحة"}
                            </button>
                        </div>

                        {showPlatformSection && (
                            <div style={{ paddingBottom: 8, padding: " 14px" }}>
                                {/* بحث داخل خطط المنصة */}
                                <div
                                    style={{
                                        position: "relative",
                                        maxWidth: 340,
                                        marginBottom: 14,
                                    }}
                                >
                                    <FiSearch
                                        size={14}
                                        style={{
                                            position: "absolute",
                                            right: 10,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "var(--n400)",
                                            pointerEvents: "none",
                                        }}
                                    />
                                    <input
                                        className="fi"
                                        placeholder="بحث في خطط المنصة..."
                                        value={platformSearch}
                                        onChange={(e) =>
                                            setPlatformSearch(e.target.value)
                                        }
                                        style={{
                                            paddingRight: 32,
                                            width: "100%",
                                        }}
                                    />
                                </div>

                                {loadingPlatformPlans ? (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: 24,
                                            color: "var(--n500)",
                                        }}
                                    >
                                        جاري تحميل خطط المنصة...
                                    </div>
                                ) : filteredPlatformPlans.length === 0 ? (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: 24,
                                            color: "var(--n500)",
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
                                                marginBottom: 14,
                                            }}
                                        >
                                            {filteredPlatformPlans.map(
                                                (plan) => (
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
                                                            padding:
                                                                "10px 16px",
                                                            borderRadius: 10,
                                                            cursor: "pointer",
                                                            minWidth: 150,
                                                            border: `2px solid ${
                                                                selectedPlatformPlanId ===
                                                                plan.id
                                                                    ? "var(--blue-500)"
                                                                    : "var(--border)"
                                                            }`,
                                                            background:
                                                                selectedPlatformPlanId ===
                                                                plan.id
                                                                    ? "var(--blue-50)"
                                                                    : "var(--bg2)",
                                                            transition:
                                                                "all 0.15s",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 700,
                                                                color:
                                                                    selectedPlatformPlanId ===
                                                                    plan.id
                                                                        ? "var(--blue-700)"
                                                                        : "var(--n800)",
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
                                                                color: "var(--n500)",
                                                                marginTop: 3,
                                                            }}
                                                        >
                                                            {plan.details_count}{" "}
                                                            يوم ·{" "}
                                                            {plan.duration_days}{" "}
                                                            يوم إجمالي
                                                        </div>
                                                        {plan.description && (
                                                            <div
                                                                style={{
                                                                    fontSize: 11,
                                                                    color: "var(--n400)",
                                                                    marginTop: 3,
                                                                    fontStyle:
                                                                        "italic",
                                                                }}
                                                            >
                                                                {
                                                                    plan.description
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {/* شريط التأكيد */}
                                        {selectedPlatformPlanId && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 12,
                                                    padding: "12px 16px",
                                                    borderRadius: 10,
                                                    background:
                                                        "var(--blue-50)",
                                                    border: "1.5px solid var(--blue-200)",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 13,
                                                        color: "var(--blue-700)",
                                                        fontWeight: 600,
                                                        flex: 1,
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
                                                    " إلى خطة "{planName}"
                                                </span>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <button
                                                        className="btn bp bsm"
                                                        onClick={
                                                            handleImportFromPlatform
                                                        }
                                                        disabled={
                                                            importingFromPlatform
                                                        }
                                                    >
                                                        {importingFromPlatform ? (
                                                            <span
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 6,
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: 13,
                                                                        height: 13,
                                                                        border: "2px solid rgba(255,255,255,0.4)",
                                                                        borderTopColor:
                                                                            "#fff",
                                                                        borderRadius:
                                                                            "50%",
                                                                        animation:
                                                                            "spin 0.7s linear infinite",
                                                                    }}
                                                                />
                                                                جاري
                                                                الاستيراد...
                                                            </span>
                                                        ) : (
                                                            "استيراد الخطة"
                                                        )}
                                                    </button>
                                                    <button
                                                        className="btn bs bsm"
                                                        onClick={() =>
                                                            setSelectedPlatformPlanId(
                                                                null,
                                                            )
                                                        }
                                                        disabled={
                                                            importingFromPlatform
                                                        }
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

                {/* ══════════════════════════════════════════════════════
                    قسم 4 — أزرار Excel والحذف الجماعي
                ══════════════════════════════════════════════════════ */}
                {selectedPlanId && (
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
                            className={`btn bd bsm${uploading ? " disabled" : ""}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                cursor: uploading ? "not-allowed" : "pointer",
                                opacity: uploading ? 0.5 : 1,
                            }}
                        >
                            <FiUpload size={16} />
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
                            className="btn bp bsm"
                            onClick={exportToExcel}
                            disabled={details.length === 0 || uploading}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <RiFileExcel2Line size={18} />
                            تصدير Excel
                        </button>

                        {selectedDetails.size > 0 && (
                            <button
                                className="btn bd bsm"
                                onClick={() => setShowBulkDeleteModal(true)}
                                disabled={bulkDeleting}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <FiTrash2 size={16} />
                                حذف {selectedDetails.size}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
};

export default PlanDetailsManagement;
