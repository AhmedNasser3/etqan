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
            <div className="ParentModel">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p>جاري تحميل بيانات اليوم...</p>
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
                                <p>تعديل يوم الخطة</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل بيانات اليوم</h1>
                                <p>قم بتعديل تفاصيل الحفظ والمراجعة</p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
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
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                                            errors.day_number
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200"
                                        }`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.day_number && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.day_number}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الحفظ الجديد</label>
                                    <input
                                        type="text"
                                        name="new_memorization"
                                        value={formData.new_memorization}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                        placeholder="البقرة ٤٦-٥٠"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المراجعة</label>
                                    <input
                                        type="text"
                                        name="review_memorization"
                                        value={formData.review_memorization}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        placeholder="البقرة ١-١٠"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الحالة</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
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

                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                {" "}
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
                                        <>تحديث التفاصيل</>
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

export default UpdatePlanDetailPage;
