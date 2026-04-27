// CreatePlanDetailPage.tsx - مع تطبيق الـ CSS Classes من CreateCertificatePage
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { usePlanDetailFormCreate } from "../hooks/usePlanDetailFormCreate";

interface CreatePlanDetailPageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreatePlanDetailPage: React.FC<CreatePlanDetailPageProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        existingDays,
        availablePlans,
        loadingPlans,
    } = usePlanDetailFormCreate();

    const handleSubmit = async (formDataSubmit: FormData) => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            console.log("📤 إرسال بيانات اليوم الجديد...");

            const response = await fetch(`/api/v1/plans/details`, {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: formDataSubmit,
            });

            console.log("📡 Response status:", response.status);

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                console.error("❌ Error response:", errorData);

                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(errorMessages[0] || "حدث خطأ في الإضافة");
                    return;
                }
                if (response.status === 401) {
                    toast.error("⚠️ يرجى تسجيل الدخول مرة أخرى");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log(" Create plan detail success:", result);

            toast.success("تم إضافة اليوم بنجاح!");
            onSuccess();
        } catch (error: any) {
            console.error("❌ Create plan detail error:", error);
            toast.error(error.message || "حدث خطأ في الإضافة");
        }
    };

    const isDayExists = existingDays.some(
        (day) => day.day_number === parseInt(formData.day_number || "0"),
    );

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
                        يوم جديد للخطة
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
                    {/* اختيار الخطة */}
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
                            الخطة *
                        </label>
                        <select
                            required
                            name="plan_id"
                            value={formData.plan_id}
                            onChange={handleInputChange}
                            className={`fi2 ${
                                errors.plan_id || loadingPlans
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                            disabled={isSubmitting || loadingPlans}
                        >
                            <option value={0}>-- اختر خطة --</option>
                            {availablePlans.map((plan, index) => (
                                <option
                                    key={`plan-${plan.id}-${index}`}
                                    value={plan.id}
                                >
                                    {plan.plan_name}
                                </option>
                            ))}
                        </select>
                        {errors.plan_id && (
                            <p
                                style={{
                                    fontSize: "10px",
                                    color: "var(--red-600)",
                                    margin: "2px 0 0 0",
                                }}
                            >
                                {errors.plan_id}
                            </p>
                        )}
                        {loadingPlans && (
                            <p
                                style={{
                                    fontSize: "10px",
                                    color: "var(--blue-600)",
                                    margin: "2px 0 0 0",
                                }}
                            >
                                جاري تحميل الخطط...
                            </p>
                        )}
                    </div>

                    {/* الأيام الموجودة */}
                    {formData.plan_id > 0 && existingDays.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                <p className="text-sm text-yellow-800 font-medium mb-1">
                                    الأيام الموجودة في الخطة:
                                </p>
                                <p className="text-xs text-yellow-700">
                                    {existingDays
                                        .map((d) => `يوم ${d.day_number}`)
                                        .join(", ")}
                                </p>
                            </div>
                        </div>
                    )}

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
                            max="999"
                            className={`fi2 ${
                                errors.day_number || isDayExists
                                    ? "border-red-300 bg-red-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                            placeholder="1"
                            disabled={isSubmitting}
                        />
                        {isDayExists && (
                            <p
                                style={{
                                    fontSize: "10px",
                                    color: "var(--red-600)",
                                    margin: "2px 0 0 0",
                                }}
                            >
                                هذا اليوم موجود بالفعل في الخطة المختارة
                            </p>
                        )}
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
                            الحالة الافتراضية
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
                            disabled={
                                isSubmitting ||
                                isDayExists ||
                                !formData.plan_id ||
                                loadingPlans ||
                                availablePlans.length === 0
                            }
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
                                    <span>جاري الإضافة...</span>
                                </span>
                            ) : (
                                "إضافة اليوم الجديد"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePlanDetailPage;
