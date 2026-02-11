// src/pages/DashBoard/Center/Plans/CreatePlanPage.tsx
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
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

    const isLoading = loadingData || !user;
    const currentCenter = centersData[0];

    if (isLoading) {
        return (
            <div className="ParentModel">
                <div className="ParentModel__overlay">
                    <div className="ParentModel__content">
                        <div className="flex items-center justify-center min-h-[400px] p-8">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-lg text-gray-600">
                                    جاري تحميل بيانات المجمع...
                                </p>
                            </div>
                        </div>
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
                                <p>خطة حفظ جديدة</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>إضافة خطة حفظ جديدة</h1>
                                <p className="flex items-center gap-2 flex-wrap">
                                    مجمعك:
                                    <span className="font-semibold text-green-600">
                                        {currentCenter?.name ||
                                            user?.center?.name ||
                                            "غير محدد"}
                                    </span>
                                </p>
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
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.plan_name
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="مثال: خطة حفظ سورة البقرة 12 شهر"
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
                                    <label>المجمع:</label>
                                    <input
                                        type="text"
                                        value={
                                            currentCenter?.name ||
                                            user?.center?.name ||
                                            "جاري التحميل..."
                                        }
                                        className="w-full px-4 py-3 border border-green-200 bg-green-50 rounded-xl text-green-800 font-medium"
                                        disabled
                                    />
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
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.total_months
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="12"
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
                                    <label>ملاحظات</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="أي ملاحظات إضافية..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button
                                    type="button"
                                    onClick={() => submitForm(handleSubmit)}
                                    disabled={
                                        isSubmitting || !formData.center_id
                                    }
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
