// UpdatePlanDetailPage.tsx - مع تطبيق الـ CSS Classes من CreateCertificatePage
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { usePlanDetailFormUpdate } from "../hooks/usePlanDetailFormUpdate";

interface UpdatePlanDetailPageProps {
    detailId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdatePlanDetailPage: React.FC<UpdatePlanDetailPageProps> = ({
    detailId,
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        loadingDetail,
    } = usePlanDetailFormUpdate(detailId);

    const handleSubmit = async (formDataSubmit: FormData) => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(`/api/v1/plan-details/${detailId}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: formDataSubmit,
            });

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(errorMessages[0] || "حدث خطأ في التحديث");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            toast.success("تم تحديث اليوم بنجاح!");
            onSuccess();
        } catch (error: any) {
            console.error("Update plan detail error:", error);
            toast.error(error.message || "حدث خطأ في التحديث");
        }
    };

    if (loadingDetail) {
        return (
            <div className="ov on">
                <div className="modal">
                    <div className="flex items-center justify-center min-h-[400px] p-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                            <p className="text-gray-600">
                                جاري تحميل بيانات اليوم...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ov on">
            <div className="modal">
                {/* Header مطابق تماماً */}
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
                                fontSize: "18px",
                            }}
                        ></span>{" "}
                        تعديل بيانات اليوم
                    </span>
                    <button
                        className="mx"
                        onClick={onClose}
                        disabled={isSubmitting}
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

                {/* Body مطابق تماماً */}
                <div className="mb">
                    {/* رقم اليوم */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            رقم اليوم *
                        </label>
                        <input
                            required
                            type="number"
                            name="day_number"
                            value={formData.day_number}
                            onChange={handleInputChange}
                            min="1"
                            className={`fi2 ${
                                errors.day_number
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                            disabled={isSubmitting}
                        />
                        {errors.day_number && (
                            <p
                                style={{
                                    fontSize: "10px",
                                    color: "var(--red-600)",
                                    margin: "2px 0 0 0",
                                }}
                            >
                                {errors.day_number}
                            </p>
                        )}
                    </div>

                    {/* الحفظ الجديد */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            الحفظ الجديد
                        </label>
                        <input
                            type="text"
                            name="new_memorization"
                            value={formData.new_memorization}
                            onChange={handleInputChange}
                            className="fi2 border-gray-200 hover:border-gray-300"
                            placeholder="البقرة ٤٦-٥٠"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* المراجعة */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            المراجعة
                        </label>
                        <input
                            type="text"
                            name="review_memorization"
                            value={formData.review_memorization}
                            onChange={handleInputChange}
                            className="fi2 border-gray-200 hover:border-gray-300"
                            placeholder="البقرة ١-١٠"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* الحالة */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            الحالة
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="fi2 border-gray-200 hover:border-gray-300"
                            disabled={isSubmitting}
                        >
                            <option value="pending">قيد الانتظار</option>
                            <option value="current">حالي</option>
                            <option value="completed">مكتمل</option>
                        </select>
                    </div>
                </div>

                {/* Footer مطابق تماماً */}
                <div className="mf">
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end",
                            marginTop: "16px",
                        }}
                    >
                        <button
                            className="btn bs"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            إلغاء
                        </button>
                        <button
                            className="btn bp"
                            onClick={() => submitForm(handleSubmit)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                                    <div
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                        style={{
                                            width: 14,
                                            height: 14,
                                        }}
                                    ></div>
                                    <span>جاري التحديث...</span>
                                </span>
                            ) : (
                                "تحديث التفاصيل"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePlanDetailPage;
