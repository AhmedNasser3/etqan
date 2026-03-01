import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import {
    useTeacherCustomSalaryFormUpdate,
    FormData,
    TeacherOption,
} from "../hooks/useTeacherCustomSalaryFormUpdate";

interface UpdateCustomSalaryModalProps {
    salaryId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateCustomSalaryModal: React.FC<UpdateCustomSalaryModalProps> = ({
    salaryId,
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        loadingDetail,
        teachers,
        loadingTeachers,
        handleInputChange,
        submitForm,
    } = useTeacherCustomSalaryFormUpdate(salaryId);

    const handleSubmitForm = async () => {
        const success = await submitForm();
        if (success) {
            onSuccess();
            onClose();
        }
    };

    if (loadingDetail) {
        return (
            <div className="ParentModel">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p>جاري تحميل بيانات الراتب المخصص...</p>
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
                                <p>تعديل راتب مخصص</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل بيانات الراتب المخصص</h1>
                                <p>
                                    قم بتعديل الراتب المخصص أو الملاحظات. سيظل
                                    هذا الراتب نشطاً ما لم تقم بإلغاء تفعيله.
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* المعلم (للعرض فقط - غير قابل للتعديل) */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المعلم</label>
                                    <input
                                        type="text"
                                        value={`${teachers.find((t) => t.id === formData.teacher_id)?.name || ""} - ${teachers.find((t) => t.id === formData.teacher_id)?.role || ""}`}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* الراتب المخصص */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الراتب المخصص (ر.س) *</label>
                                    <input
                                        required
                                        type="number"
                                        name="custom_base_salary"
                                        value={formData.custom_base_salary}
                                        onChange={handleInputChange}
                                        min="1000"
                                        step="0.01"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                                            errors.custom_base_salary
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="5000"
                                        disabled={isSubmitting}
                                    />
                                    {errors.custom_base_salary && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.custom_base_salary}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الملاحظات */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات (اختياري)</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all resize-vertical"
                                        placeholder="ملاحظات إضافية..."
                                        disabled={isSubmitting}
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
                                    onClick={handleSubmitForm}
                                    disabled={isSubmitting || loadingTeachers}
                                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري التحديث...
                                        </>
                                    ) : (
                                        <>تحديث الراتب المخصص</>
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

export default UpdateCustomSalaryModal;
