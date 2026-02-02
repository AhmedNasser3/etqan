import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { useAuthUser } from "../../../../../layouts/hooks/useAuthUser";
import { usePlanFormCreate } from "../hooks/usePlanFormCreate";

interface CreatePlanPageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreatePlanPage: React.FC<CreatePlanPageProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        centersData,
        loadingData,
        user,
    } = usePlanFormCreate();

    const handleSubmit = async (formDataSubmit: FormData) => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch("/api/v1/plans", {
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
                console.error("Error response:", errorData);

                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(errorMessages[0] || "حدث خطأ في الإضافة");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("Create plan response:", result);

            toast.success("تم إضافة الخطة بنجاح!");
            onSuccess();
        } catch (error: any) {
            console.error("Create plan error:", error);
            toast.error(error.message || "حدث خطأ في الإضافة");
        }
    };

    // Center Owner Logic
    const isCenterOwner = user?.role?.id === 1;
    const showSingleCenter = centersData.length === 1 && isCenterOwner;
    const currentCenter = centersData.find(
        (c) => c.id.toString() === formData.center_id,
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
                                <p>خطة حفظ جديدة</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>إضافة خطة حفظ جديدة</h1>
                                <p>
                                    يرجى إدخال بيانات الخطة بشكل صحيح
                                    {loadingData && (
                                        <span className="block text-sm text-blue-600 mt-1">
                                            جاري تحميل البيانات...
                                        </span>
                                    )}
                                    {showSingleCenter && (
                                        <span className="block text-sm text-green-600 mt-1">
                                            مجمعك: {centersData[0]?.name}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* اسم الخطة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>اسم الخطة *</label>
                                    <input
                                        required
                                        type="text"
                                        name="plan_name"
                                        value={formData.plan_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.plan_name
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="مثال: خطة حفظ سورة البقرة 12 شهر"
                                        disabled={isSubmitting || loadingData}
                                    />
                                    {errors.plan_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.plan_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* المجمع */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المجمع التابع له *</label>
                                    <select
                                        required
                                        name="center_id"
                                        value={formData.center_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.center_id || loadingData
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            showSingleCenter
                                        }
                                    >
                                        <option value="">
                                            {loadingData
                                                ? "جاري التحميل..."
                                                : centersData.length === 0
                                                  ? "لا توجد مجمعات"
                                                  : showSingleCenter
                                                    ? centersData[0].name
                                                    : "اختر المجمع"}
                                        </option>
                                        {centersData.map((center) => (
                                            <option
                                                key={center.id}
                                                value={center.id}
                                            >
                                                {center.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.center_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.center_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* عدد الشهور */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>مدة الخطة (بالشهور) *</label>
                                    <input
                                        required
                                        type="number"
                                        name="total_months"
                                        value={formData.total_months}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="36"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.total_months
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="12"
                                        disabled={isSubmitting || loadingData}
                                    />
                                    {errors.total_months && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.total_months}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ملاحظات */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات (اختياري)</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="مثال: خطة مكثفة - 4 أيام حفظ أسبوعياً"
                                        disabled={isSubmitting || loadingData}
                                    />
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
                                    disabled={isSubmitting || loadingData}
                                    className="w-full"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري الإضافة...
                                        </>
                                    ) : (
                                        <>إضافة الخطة الجديدة</>
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

export default CreatePlanPage;
