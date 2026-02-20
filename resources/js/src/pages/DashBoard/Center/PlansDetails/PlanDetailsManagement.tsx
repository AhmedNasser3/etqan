// PlanDetailsManagement.tsx - كامل مع عمود اسم الخطة في الجدول ✅
import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { RiRobot2Fill, RiFileExcel2Line } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2, FiPlus, FiUpload } from "react-icons/fi";
import { usePlanDetails } from "./hooks/usePlanDetails";
import CreatePlanDetailPage from "./models/CreatePlanDetailPage";
import UpdatePlanDetailPage from "./models/UpdatePlanDetailPage";
import DeleteModal from "./components/DeleteModal";
import "../../.../../../../assets/scss/main.scss";

interface PlanDetailType {
    id: number;
    day_number: number;
    new_memorization: string | null;
    review_memorization: string | null;
    status: "pending" | "current" | "completed";
    plan_name?: string; // ✅ إضافة اسم الخطة من الهوك
}

const PlanDetailsManagement: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const planIdNum = planId ? parseInt(planId!) : 0;
    const [planName, setPlanName] = useState(`خطة ${planIdNum}`);

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

    // Modal Delete State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteDetailId, setDeleteDetailId] = useState<number | null>(null);

    // Excel States
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Debug log
    console.log("🔍 planIdNum:", planIdNum, "planId:", planId);

    // جلب اسم الخطة
    useEffect(() => {
        if (planIdNum > 0) {
            fetch(`/api/v1/plans/${planIdNum}`)
                .then((res) => res.json())
                .then((data) => {
                    setPlanName(
                        data.plan_name || data.name || `خطة ${planIdNum}`,
                    );
                })
                .catch(() => {
                    setPlanName(`خطة ${planIdNum}`);
                });
        }
    }, [planIdNum]);

    // ✅ تصدير Excel مع plan_id و plan_name في الصفوف المخفية
    const exportToExcel = useCallback(() => {
        try {
            const exportData = [
                // ✅ صف العناوين
                [
                    "رقم الخطة",
                    "اسم الخطة",
                    "رقم اليوم",
                    "الحفظ الجديد",
                    "المراجعة",
                    "الحالة",
                ],
                // ✅ صف Plan ID و Plan Name (مخفي)
                [`${planIdNum}`, `${planName}`, "", "", "", ""],
                // ✅ البيانات الفعلية
                ...details.map((item: PlanDetailType) => [
                    `${planIdNum}`,
                    `${planName}`,
                    item.day_number,
                    item.new_memorization || "",
                    item.review_memorization || "",
                    item.status === "completed"
                        ? "✅ مكتمل"
                        : item.status === "current"
                          ? "🔥 حالي"
                          : "⏳ معلق",
                ]),
            ];

            const ws = XLSX.utils.aoa_to_sheet(exportData);

            // ✅ إعدادات Excel محسنة للعربية + إخفاء Plan ID و Plan Name
            const range = XLSX.utils.decode_range(ws["!ref"]!);

            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
                    if (ws[cell_address]) {
                        ws[cell_address].z = "@";
                        ws[cell_address].t = "s";

                        if (!ws[cell_address].s) {
                            ws[cell_address].s = {
                                alignment: {
                                    horizontal: C <= 1 ? "center" : "right",
                                    vertical: "center",
                                    wrapText: true,
                                },
                                font: {
                                    name: "Arial",
                                    sz: R === 0 ? 14 : 12,
                                    bold: R === 0 || R === 1,
                                },
                            };
                        }
                    }
                }
            }

            // ✅ إخفاء عمودي Plan ID و Plan Name
            ws["!cols"] = [
                { hidden: true, wch: 0 }, // Plan ID
                { hidden: true, wch: 0 }, // Plan Name
                { wch: 12 }, // رقم اليوم
                { wch: 25 }, // الحفظ الجديد
                { wch: 25 }, // المراجعة
                { wch: 20 }, // الحالة
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, `تفاصيل_خطة_${planName}`);

            const cleanFileName = `خطة_${planIdNum}_${planName.replace(/[^a-zA-Z0-9\\u0600-\\u06FF\\s]/g, "")}_${new Date().toISOString().slice(0, 10)}`;

            XLSX.writeFile(wb, `${cleanFileName}.xlsx`, {
                bookType: "xlsx",
                type: "array",
                compression: true,
            });

            toast.success(
                "✅ تم تصدير Excel جاهز للرفع مع Plan ID واسم الخطة!",
            );
        } catch (error) {
            console.error("خطأ في التصدير:", error);
            toast.error("❌ حدث خطأ في تصدير البيانات");
        }
    }, [details, planIdNum, planName]);

    // ✅ رفع Excel - يقرا plan_id و plan_name من الملف
    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) {
                toast.error("❌ اختر ملف صالح");
                return;
            }

            console.log("📤 بدء رفع الملف");
            setUploading(true);

            try {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(
                    worksheet,
                    { header: 1, defval: "", raw: false },
                );

                if (jsonData.length <= 2) {
                    toast.error("❌ الملف فارغ");
                    return;
                }

                // ✅ قراءة Plan ID و Plan Name من الصف الثاني
                const filePlanIdRaw = jsonData[1]?.[0]?.toString() || "";
                const filePlanNameRaw = jsonData[1]?.[1]?.toString() || "";
                const filePlanId = parseInt(filePlanIdRaw);

                console.log(
                    "📋 Plan ID:",
                    filePlanId,
                    "Plan Name:",
                    filePlanNameRaw,
                );

                if (!filePlanId || isNaN(filePlanId) || filePlanId <= 0) {
                    toast.error(`❌ رقم الخطة غير صالح: ${filePlanIdRaw}`);
                    return;
                }

                // استخراج الأعمدة
                const headers = jsonData[0] as string[];
                const dayIndex = headers.findIndex(
                    (h) =>
                        h.includes("يوم") ||
                        h.includes("Day") ||
                        h.includes("رقم"),
                );
                const newMemIndex = headers.findIndex(
                    (h) =>
                        h.includes("حفظ") ||
                        h.includes("جديد") ||
                        h.includes("New"),
                );
                const reviewIndex = headers.findIndex(
                    (h) => h.includes("مراجعة") || h.includes("Review"),
                );
                const statusIndex = headers.findIndex(
                    (h) => h.includes("حالة") || h.includes("Status"),
                );

                if (
                    dayIndex === -1 ||
                    newMemIndex === -1 ||
                    reviewIndex === -1
                ) {
                    toast.error(
                        "❌ الملف يحتاج أعمدة: رقم اليوم، الحفظ الجديد، المراجعة",
                    );
                    return;
                }

                // تحضير البيانات
                const importData: any[] = [];
                for (let i = 2; i < jsonData.length; i++) {
                    const row = jsonData[i] as any[];
                    const dayNumber = parseInt(
                        row[dayIndex]?.toString() || "0",
                    );

                    if (dayNumber > 0) {
                        const statusText = row[statusIndex]?.toString() || "";
                        let status: PlanDetailType["status"] = "pending";

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
                            plan_name: filePlanNameRaw,
                            day_number: dayNumber,
                            new_memorization:
                                row[newMemIndex]?.toString() || null,
                            review_memorization:
                                row[reviewIndex]?.toString() || null,
                            status,
                        });
                    }
                }

                if (importData.length === 0) {
                    toast.error("❌ مافيش بيانات صالحة");
                    return;
                }

                // إرسال البيانات
                const csrfToken =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") || "";
                const response = await fetch(
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

                const result = await response.json();
                console.log("📥 Response:", response.status, result);

                if (response.ok) {
                    toast.success(
                        `✅ تم استيراد ${result.imported || 0} يوم للخطة "${filePlanNameRaw}" (${filePlanId})!`,
                    );
                    refetch();
                } else {
                    toast.error(result.message || "فشل في الاستيراد");
                }
            } catch (error) {
                console.error("💥 Error:", error);
                toast.error("❌ خطأ في رفع الملف");
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
                    <p className="text-gray-600">جاري تحميل تفاصيل الخطة...</p>
                </div>
            </div>
        );
    }

    const handleDeleteConfirm = async () => {
        if (!deleteDetailId) return;

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const response = await fetch(
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

            if (response.ok) {
                toast.success("تم حذف اليوم بنجاح!");
                refetch();
                setShowDeleteModal(false);
                setDeleteDetailId(null);
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || "حدث خطأ في الحذف");
            }
        } catch (error) {
            toast.error("حدث خطأ في الاتصال");
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

    const hasPrev = currentPage > 1;
    const hasNext = pagination && currentPage < pagination.last_page;

    return (
        <>
            {/* DeleteModal */}
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

            {/* Create Modal */}
            {showCreateModal && (
                <CreatePlanDetailPage
                    planId={planIdNum}
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCloseCreateModal}
                />
            )}

            {/* Update Modal */}
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

                {/* Header مع أزرار Excel */}
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
                            <h2>تفاصيل الخطة: {planName}</h2>

                            {/* أزرار Excel */}
                            <div className="flex gap-2">
                                <label
                                    className={`teacherStudent__status-btn upload-btn p-3 rounded-xl border-2 bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100 font-medium cursor-pointer flex items-center gap-2 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <FiUpload size={18} />
                                    <span>
                                        {uploading
                                            ? "جاري الرفع..."
                                            : "رفع Excel"}
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>

                                <button
                                    onClick={exportToExcel}
                                    disabled={details.length === 0 || uploading}
                                    className="teacherStudent__status-btn download-btn p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium flex items-center gap-2 disabled:opacity-50"
                                    title="تصدير Excel جاهز للرفع (مع رقم الخطة واسمها)"
                                >
                                    <RiFileExcel2Line size={20} />
                                    تصدير Excel
                                </button>

                                <button
                                    className="teacherStudent__status-btn add-btn p-3 rounded-xl border-2 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100 font-medium flex items-center gap-2"
                                    onClick={() => setShowCreateModal(true)}
                                    disabled={uploading}
                                >
                                    <FiPlus size={20} />
                                    يوم جديد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ الجدول مع عمود اسم الخطة */}
                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th
                                    colSpan={6}
                                    className="bg-purple-50 text-purple-800 py-4 text-lg"
                                >
                                    📋 تفاصيل خطة: <strong>{planName}</strong>{" "}
                                    (رقم: {planIdNum})
                                </th>
                            </tr>
                            <tr>
                                <th>اسم الخطة</th> {/* ✅ عمود جديد */}
                                <th>رقم اليوم</th>
                                <th>الحفظ الجديد</th>
                                <th>المراجعة</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isEmpty ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-8 text-gray-500"
                                    >
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
                                                    استخدم زر "رفع Excel" أو أضف
                                                    أول يوم لحلقة حفظك
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                details.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="plan__row active"
                                    >
                                        <td className="font-medium text-purple-700 bg-purple-50">
                                            {item.plan_name || planName}{" "}
                                            {/* ✅ اسم الخطة */}
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
                                                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(item.status)}`}
                                            >
                                                {item.status === "completed"
                                                    ? "✅ مكتمل"
                                                    : item.status === "current"
                                                      ? "🔥 حالي"
                                                      : "⏳ معلق"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleEdit(item.id)
                                                    }
                                                    title="تعديل اليوم"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    title="حذف اليوم"
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
                                عرض {details.length} من {pagination.total} يوم •
                                خطة "{planName}" • الصفحة{" "}
                                <strong>{currentPage}</strong> من{" "}
                                <strong>{pagination.last_page}</strong>
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
