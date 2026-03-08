// PlanDetailsManagement.tsx - كامل مصحح 100% مع البحث بالدروب داون والحذف الجماعي 🚀
import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { RiRobot2Fill, RiFileExcel2Line } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2, FiPlus, FiUpload, FiSearch } from "react-icons/fi";
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
    plan?: {
        plan_name: string;
    };
}

const PlanDetailsManagement: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const planIdNum = planId ? parseInt(planId!) : 0;
    const [planName, setPlanName] = useState(`خطة ${planIdNum}`);

    // حالة البحث بالدروب داون والحذف الجماعي
    const [selectedPlanName, setSelectedPlanName] = useState<string>("");
    const [availablePlans, setAvailablePlans] = useState<string[]>([]);
    const [selectedDetails, setSelectedDetails] = useState<Set<number>>(
        new Set(),
    );
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const {
        details,
        loading,
        pagination,
        currentPage,
        goToPage,
        refetch,
        isEmpty,
        stats,
    } = usePlanDetails(planIdNum);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedDetailId, setSelectedDetailId] = useState<number | null>(
        null,
    );
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteDetailId, setDeleteDetailId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // جلب اسم الخطة
    useEffect(() => {
        if (!planIdNum) return;
        fetch(`/api/v1/plans/${planIdNum}`)
            .then((res) => res.json())
            .then((data) => {
                setPlanName(data.plan_name || data.name || `خطة ${planIdNum}`);
            })
            .catch(() => {
                setPlanName(`خطة ${planIdNum}`);
            });
    }, [planIdNum]);

    // جلب أسماء الخطط المتاحة للدروب داون
    useEffect(() => {
        if (!details.length) return;

        const uniquePlanNames = Array.from(
            new Set(
                details
                    .map(
                        (item: PlanDetailType) =>
                            item.plan_name || item.plan?.plan_name || planName,
                    )
                    .filter(Boolean),
            ),
        );
        setAvailablePlans(uniquePlanNames as string[]);

        // تعيين القيمة الافتراضية
        if (uniquePlanNames.length > 0 && !selectedPlanName) {
            setSelectedPlanName(uniquePlanNames[0]);
        }
    }, [details, planName, selectedPlanName]);

    // تصفية البيانات حسب الخطة المختارة من الدروب داون
    const filteredDetails = selectedPlanName
        ? details.filter(
              (item) =>
                  (item.plan_name || "").toLowerCase() ===
                      selectedPlanName.toLowerCase() ||
                  (item.plan?.plan_name || "").toLowerCase() ===
                      selectedPlanName.toLowerCase(),
          )
        : details;

    // التحقق من وجود عناصر مختارة
    const hasSelected = selectedDetails.size > 0;
    const allSelected =
        filteredDetails.length > 0 &&
        selectedDetails.size === filteredDetails.length;

    // تحديد/إلغاء تحديد الكل
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedDetails(new Set());
        } else {
            const newSelected = new Set(filteredDetails.map((item) => item.id));
            setSelectedDetails(newSelected);
        }
    };

    // تحديد/إلغاء تحديد عنصر واحد
    const toggleSelectItem = (id: number) => {
        const newSelected = new Set(selectedDetails);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedDetails(newSelected);
    };

    // حذف جماعي
    const handleBulkDeleteConfirm = async () => {
        if (selectedDetails.size === 0) return;

        setBulkDeleting(true);
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const deleteIds = Array.from(selectedDetails);

            const res = await fetch(`/api/v1/plans/plan-details/bulk-delete`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ ids: deleteIds }),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(
                    `✅ تم حذف ${result.deleted || deleteIds.length} عنصر بنجاح!`,
                );
                refetch();
                setSelectedDetails(new Set());
                setShowBulkDeleteModal(false);
            } else {
                toast.error(result.message || "❌ فشل الحذف الجماعي");
            }
        } catch (error) {
            console.error(error);
            toast.error("❌ خطأ في الحذف الجماعي");
        } finally {
            setBulkDeleting(false);
        }
    };

    // تصدير Excel
    const exportToExcel = useCallback(() => {
        try {
            const exportData = [
                [
                    "رقم الخطة",
                    "رقم اليوم",
                    "الحفظ الجديد",
                    "المراجعة",
                    "الحالة",
                ],
                [`${planIdNum}`, "", "", "", ""],
                ...details.map((item: PlanDetailType) => [
                    `${planIdNum}`,
                    item.day_number,
                    item.new_memorization || "",
                    item.review_memorization || "",
                    item.status === "completed"
                        ? " مكتمل"
                        : item.status === "current"
                          ? " حالي"
                          : " معلق",
                ]),
            ];

            const ws = XLSX.utils.aoa_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, `تفاصيل_خطة_${planIdNum}`);
            const cleanFileName = `خطة_${planIdNum}_${Date.now()}.xlsx`;
            XLSX.writeFile(wb, cleanFileName, { bookType: "xlsx" });
            toast.success("✅ تم التصدير بسرعة فائقة!");
        } catch {
            toast.error("❌ خطأ في التصدير");
        }
    }, [details, planIdNum]);

    // رفع Excel (Bulk Import)
    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) {
                toast.error("❌ اختر ملف Excel");
                return;
            }

            setUploading(true);

            try {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];

                const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
                    header: 1,
                    defval: "",
                    raw: false,
                });

                if (rows.length < 3) {
                    toast.error("❌ الملف فارغ");
                    return;
                }

                // Plan ID من الصف الثاني
                const filePlanId = parseInt(
                    (rows[1]?.[0] || "").toString().trim(),
                );
                if (!filePlanId || filePlanId <= 0) {
                    toast.error("❌ رقم الخطة غير صحيح في الملف");
                    return;
                }

                const headers = rows[0].map((h: any) => h.toString().trim());

                const dayIndex = headers.findIndex(
                    (h) => h.includes("يوم") || h.includes("Day"),
                );
                const newIndex = headers.findIndex(
                    (h) => h.includes("حفظ") || h.includes("New"),
                );
                const reviewIndex = headers.findIndex(
                    (h) => h.includes("مراجعة") || h.includes("Review"),
                );
                const statusIndex = headers.findIndex(
                    (h) => h.includes("حالة") || h.includes("Status"),
                );

                if (dayIndex === -1 || newIndex === -1 || reviewIndex === -1) {
                    toast.error("❌ الأعمدة غير صحيحة في ملف Excel");
                    return;
                }

                const importData: any[] = [];

                for (let i = 2; i < rows.length; i++) {
                    const row = rows[i];
                    const dayNumber = parseInt(
                        (row[dayIndex] || "").toString().trim(),
                    );

                    if (!isNaN(dayNumber) && dayNumber > 0) {
                        const statusText = (row[statusIndex] || "").toString();

                        let status: "pending" | "current" | "completed" =
                            "pending";
                        if (
                            statusText.includes("مكتمل") ||
                            statusText.includes("✅")
                        )
                            status = "completed";
                        else if (
                            statusText.includes("حالي") ||
                            statusText.includes("🔥")
                        )
                            status = "current";

                        importData.push({
                            plan_id: filePlanId,
                            day_number: dayNumber,
                            new_memorization:
                                row[newIndex]?.toString().trim() || null,
                            review_memorization:
                                row[reviewIndex]?.toString().trim() || null,
                            status,
                        });
                    }
                }

                if (importData.length === 0) {
                    toast.error("❌ لا توجد أيام صالحة في الملف");
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
                        `✅ تم استيراد ${result.imported || importData.length} يوم بنجاح!`,
                    );
                    refetch();
                } else {
                    toast.error(result.message || "❌ فشل الاستيراد");
                }
            } catch (err) {
                console.error(err);
                toast.error("❌ خطأ أثناء قراءة الملف");
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        },
        [refetch],
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="navbar">
                        <div className="navbar__inner">
                            <div className="navbar__loading">
                                <div className="loading-spinner">
                                    <div className="spinner-circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>{" "}
                </div>
            </div>
        );
    }

    /* =========================
        Helpers
    ========================= */
    const getStatusColor = (status: PlanDetailType["status"]) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-200";
            case "current":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "pending":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDetailId) return;
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const res = await fetch(
                `/api/v1/plans/plan-details/${deleteDetailId}`,
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
                refetch();
                setShowDeleteModal(false);
                setDeleteDetailId(null);
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(errorData.message || "خطأ في الحذف");
            }
        } catch (error) {
            toast.error("خطأ في الاتصال");
        }
    };

    const handleDelete = (id: number) => {
        setDeleteDetailId(id);
        setShowDeleteModal(true);
    };

    const handleEdit = (detailId: number) => {
        setSelectedDetailId(detailId);
        setShowUpdateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        refetch();
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedDetailId(null);
        refetch();
    };

    const hasPrev = currentPage > 1;
    const hasNext = pagination && currentPage < pagination.last_page;

    return (
        <>
            {/* Delete Modal - فردي */}
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
                showConfirm={true}
            />

            {/* Bulk Delete Modal */}
            <DeleteModal
                show={showBulkDeleteModal}
                title="تأكيد الحذف الجماعي"
                message={`هل أنت متأكد من حذف ${selectedDetails.size} عنصر مختار؟ هذا الإجراء لا يمكن التراجع عنه!`}
                onClose={() => {
                    setShowBulkDeleteModal(false);
                }}
                onConfirm={handleBulkDeleteConfirm}
                confirmText={
                    bulkDeleting
                        ? "جاري الحذف..."
                        : `حذف ${selectedDetails.size} عنصر`
                }
                showConfirm={true}
                loading={bulkDeleting}
            />

            {showCreateModal && (
                <CreatePlanDetailPage
                    planId={planIdNum}
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCloseCreateModal}
                />
            )}

            {showUpdateModal && selectedDetailId && (
                <UpdatePlanDetailPage
                    detailId={selectedDetailId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleCloseUpdateModal}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/* Stats Cards */}
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon purpleColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي الأيام</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blueColor">
                            <i>
                                <GrStatusCritical />
                            </i>
                        </div>
                        <div>
                            <h3>مكتملة</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.completed}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>
                                <PiWhatsappLogoDuotone />
                            </i>
                        </div>
                        <div>
                            <h3>حالي</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.current}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Header مع الدروب داون للخطط */}
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            تفاصيل يومية للحفظ والمراجعة - خطة "{planName}"
                        </div>

                        <div className="plan__current flex items-center gap-3">
                            <h2>تفاصيل الخطة</h2>
                            <div
                                className="flex gap-2"
                                style={{ display: "flex" }}
                                id="userProfile__verifyOTPBirth"
                            >
                                {/* 🔥 الـ Dropdown لاختيار الخطة */}
                                <div className="search-bulk-container">
                                    <div className="search-input-wrapper">
                                        <select
                                            value={selectedPlanName}
                                            onChange={(e) =>
                                                setSelectedPlanName(
                                                    e.target.value,
                                                )
                                            }
                                            className="search-input"
                                        >
                                            <option value="">جميع الخطط</option>
                                            {availablePlans.map((plan) => (
                                                <option key={plan} value={plan}>
                                                    {plan}
                                                </option>
                                            ))}
                                        </select>
                                        <FiSearch className="search-icon" />
                                    </div>

                                    {hasSelected && (
                                        <>
                                            <button
                                                onClick={toggleSelectAll}
                                                className="select-all-btn"
                                            >
                                                {allSelected
                                                    ? "إلغاء الكل"
                                                    : "اختيار الكل"}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setShowBulkDeleteModal(true)
                                                }
                                                className="bulk-delete-btn"
                                                disabled={bulkDeleting}
                                            >
                                                <FiTrash2 size={18} />
                                                <span className="count-badge">
                                                    {selectedDetails.size}
                                                </span>
                                            </button>
                                        </>
                                    )}
                                </div>
                                {hasSelected && (
                                    <button
                                        onClick={toggleSelectAll}
                                        className="teacherStudent__status-btn p-3 rounded-xl border-2 bg-purple-50 border-purple-300 text-purple-600 hover:bg-purple-100 font-medium flex items-center gap-2"
                                    >
                                        {allSelected
                                            ? "إلغاء الكل"
                                            : "اختيار الكل"}
                                    </button>
                                )}
                                <label
                                    className={`teacherStudent__status-btn upload-btn p-3 rounded-xl border-2 bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100 font-medium cursor-pointer flex items-center gap-2 ${
                                        uploading
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <FiUpload size={18} />
                                    <span>
                                        {uploading
                                            ? "جاري الرفع..."
                                            : " Excel رفع "}
                                    </span>
                                    <div className="custom-file-input">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                        <span className="button-text">
                                            {uploading ? "جاري الرفع..." : ""}
                                        </span>
                                    </div>
                                </label>
                                <button
                                    onClick={exportToExcel}
                                    disabled={details.length === 0 || uploading}
                                    className="teacherStudent__status-btn download-btn p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium flex items-center gap-2 disabled:opacity-50"
                                    title="تصدير Excel سريع"
                                >
                                    <RiFileExcel2Line size={20} /> تصدير Excel
                                </button>
                                <button
                                    className="teacherStudent__status-btn add-btn p-3 rounded-xl border-2 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100 font-medium flex items-center gap-2"
                                    onClick={() => setShowCreateModal(true)}
                                    disabled={uploading}
                                >
                                    <FiPlus size={20} /> يوم جديد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* الجدول مع عمود الـ checkbox */}
                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                </th>
                                <th>اسم الخطة</th>
                                <th>رقم اليوم</th>
                                <th>الحفظ الجديد</th>
                                <th>المراجعة</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDetails.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        {selectedPlanName ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                                    🔍
                                                </div>
                                                <div>
                                                    <p className="text-xl font-semibold mb-2">
                                                        لا توجد نتائج للخطة "
                                                        {selectedPlanName}"
                                                    </p>
                                                    <p className="text-gray-400">
                                                        اختر خطة أخرى أو أضف
                                                        بيانات جديدة
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                                    📭
                                                </div>
                                                <div>
                                                    <p className="text-xl font-semibold mb-2">
                                                        لا توجد أيام لخطة "
                                                        {planName}"
                                                    </p>
                                                    <p className="text-gray-400">
                                                        استخدم زر "رفع Excel" أو
                                                        أضف أول يوم
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredDetails.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="plan__row active"
                                    >
                                        <td className="font-medium text-purple-700 bg-purple-50">
                                            <input
                                                type="checkbox"
                                                checked={selectedDetails.has(
                                                    item.id,
                                                )}
                                                onChange={() =>
                                                    toggleSelectItem(item.id)
                                                }
                                                className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 mx-auto"
                                            />
                                        </td>
                                        <td className="font-medium text-purple-700 bg-purple-50">
                                            {item.plan?.plan_name ||
                                                item.plan_name ||
                                                planName}
                                        </td>
                                        <td className="font-bold text-xl">
                                            {item.day_number}
                                        </td>
                                        <td>{item.new_memorization || "-"}</td>
                                        <td>
                                            {item.review_memorization || "-"}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(
                                                    item.status,
                                                )}`}
                                            >
                                                {item.status === "completed"
                                                    ? " مكتمل"
                                                    : item.status === "current"
                                                      ? " حالي"
                                                      : " معلق"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleEdit(item.id)
                                                    }
                                                    title="تعديل"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    title="حذف"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div
                        className="inputs__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        <div className="flex justify-between items-center p-4">
                            <div className="text-sm text-gray-600">
                                عرض {filteredDetails.length} من{" "}
                                {pagination.total} يوم • خطة "{planName}" •
                                الصفحة <strong>{currentPage}</strong> من{" "}
                                <strong>{pagination.last_page}</strong>
                                {hasSelected && (
                                    <span className="ml-4 bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                        {selectedDetails.size} مختار
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={!hasPrev}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                >
                                    السابق
                                </button>
                                <span className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold">
                                    {currentPage}
                                </span>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasNext}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Bars */}
                <div
                    className="inputs__verifyOTPBirth"
                    id="userProfile__verifyOTPBirth"
                    style={{ width: "100%" }}
                >
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>تقدم خطة "{planName}"</h1>
                        </div>
                        <p>{stats.progress}%</p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{ width: `${stats.progress}%` }}
                            ></span>
                        </div>
                    </div>
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>عدد أيام الخطة</h1>
                        </div>
                        <p>{details.length}</p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{
                                    width: `${Math.min((details.length / 50) * 100, 100)}%`,
                                }}
                            ></span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlanDetailsManagement;
