import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { usePlanFormUpdate } from "../hooks/usePlanFormUpdate";

interface UpdatePlanPageProps {
    planId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdatePlanPage: React.FC<UpdatePlanPageProps> = ({
    planId,
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
        loadingPlan,
        user,
    } = usePlanFormUpdate(planId);

    const handleSubmit = async (formDataSubmit: FormData) => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(`/api/v1/plans/${planId}`, {
                method: "POST", // Laravel PUT via POST + _method
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

            const result = await response.json();
            console.log("Update plan response:", result);
            toast.success("تم تحديث الخطة بنجاح!");
            onSuccess();
        } catch (error: any) {
            console.error("Update plan error:", error);
            toast.error(error.message || "حدث خطأ في التحديث");
        }
    };

    const isCenterOwner = user?.role?.id === 1;
    const showSingleCenter = centersData.length === 1 && isCenterOwner;

    if (loadingPlan || loadingData) {
        return (
            <div className="ParentModel">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p>جاري تحميل بيانات الخطة...</p>
                    </div>
                </div>
            </div>
        );
    }

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
                                <p>تعديل خطة حفظ</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل بيانات الخطة</h1>
                                <p>قم بتعديل البيانات المطلوبة</p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>اسم الخطة *</label>
                                    <input
                                        required
                                        type="text"
                                        name="plan_name"
                                        value={formData.plan_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                                            errors.plan_name
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200"
                                        }`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.plan_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.plan_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المجمع *</label>
                                    <select
                                        required
                                        name="center_id"
                                        value={formData.center_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                                            errors.center_id
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200"
                                        }`}
                                        disabled={
                                            isSubmitting || showSingleCenter
                                        }
                                    >
                                        <option value="">
                                            {showSingleCenter
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
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                                            errors.total_months
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200"
                                        }`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.total_months && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.total_months}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات (اختياري)</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="inputs__submitBtn">
                                <button
                                    type="button"
                                    onClick={() => submitForm(handleSubmit)}
                                    disabled={isSubmitting}
                                    className="w-full"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري التحديث...
                                        </>
                                    ) : (
                                        <>تحديث الخطة</>
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

export default UpdatePlanPage;
