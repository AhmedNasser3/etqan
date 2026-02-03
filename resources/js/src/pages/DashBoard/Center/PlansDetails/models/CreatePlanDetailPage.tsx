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
            console.log("✅ Create plan detail success:", result);

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
        <div className="ParentModel">
            <div className="ParentModel__overlay" onClick={onClose}>
                <div
                    className="ParentModel__content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="ParentModel__inner">
                        <div className="ParentModel__header">
                            <button
                                className="ParentModel__close"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>يوم جديد للخطة</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>إضافة يوم جديد للخطة</h1>
                                <p>
                                    اختر الخطة وأدخل تفاصيل الحفظ والمراجعة
                                    لليوم
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* ✅ اختيار الخطة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الخطة *</label>
                                    <select
                                        required
                                        name="plan_id"
                                        value={formData.plan_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.plan_id || loadingPlans
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={isSubmitting || loadingPlans}
                                    >
                                        <option value={0}>
                                            -- اختر خطة --
                                        </option>
                                        {availablePlans.map((plan, index) => (
                                            <option
                                                key={`plan-${plan.id}-${index}`} // ✅ key فريد 100%
                                                value={plan.id}
                                            >
                                                {plan.plan_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.plan_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.plan_id}
                                        </p>
                                    )}
                                    {loadingPlans && (
                                        <div className="mt-1 text-sm text-blue-600 flex items-center">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            جاري تحميل الخطط...
                                        </div>
                                    )}
                                    {availablePlans.length === 0 &&
                                        !loadingPlans && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                لا توجد خطط متاحة
                                            </p>
                                        )}
                                </div>
                            </div>

                            {/* ✅ الأيام الموجودة */}
                            {formData.plan_id > 0 &&
                                existingDays.length > 0 && (
                                    <div className="inputs__verifyOTPBirth">
                                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                            <p className="text-sm text-yellow-800 font-medium mb-1">
                                                الأيام الموجودة في الخطة:
                                            </p>
                                            <p className="text-xs text-yellow-700">
                                                {existingDays
                                                    .map(
                                                        (d) =>
                                                            `يوم ${d.day_number}`,
                                                    )
                                                    .join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* رقم اليوم */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>رقم اليوم *</label>
                                    <input
                                        required
                                        type="number"
                                        name="day_number"
                                        value={formData.day_number}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="999"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.day_number || isDayExists
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="1"
                                        disabled={isSubmitting}
                                    />
                                    {isDayExists && (
                                        <p className="mt-1 text-sm text-red-600">
                                            هذا اليوم موجود بالفعل في الخطة
                                            المختارة
                                        </p>
                                    )}
                                    {errors.day_number && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.day_number}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الحفظ الجديد */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الحفظ الجديد</label>
                                    <input
                                        type="text"
                                        name="new_memorization"
                                        value={formData.new_memorization}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                        placeholder="البقرة ٤٦-٥٠"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* المراجعة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المراجعة</label>
                                    <input
                                        type="text"
                                        name="review_memorization"
                                        value={formData.review_memorization}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="البقرة ١-١٠"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* الحالة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الحالة الافتراضية</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        disabled={isSubmitting}
                                    >
                                        <option value="pending">
                                            قيد الانتظار
                                        </option>
                                        <option value="current">حالي</option>
                                        <option value="completed">مكتمل</option>
                                    </select>
                                </div>
                            </div>

                            {/* زر الإرسال */}
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button
                                    type="button"
                                    onClick={() => submitForm(handleSubmit)}
                                    disabled={
                                        isSubmitting ||
                                        isDayExists ||
                                        !formData.plan_id ||
                                        loadingPlans ||
                                        availablePlans.length === 0
                                    }
                                    className="w-full"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري الإضافة...
                                        </>
                                    ) : (
                                        <>إضافة اليوم الجديد</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePlanDetailPage;
