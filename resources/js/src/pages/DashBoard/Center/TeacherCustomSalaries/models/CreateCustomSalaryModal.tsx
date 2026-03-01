import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import {
    useTeacherCustomSalaryFormCreate,
    FormData,
    TeacherOption,
} from "../hooks/useTeacherCustomSalaryFormCreate";

interface CreateCustomSalaryModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateCustomSalaryModal: React.FC<CreateCustomSalaryModalProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        existingSalary,
        loadingTeachers,
        teachers,
        loadingRules,
        handleInputChange,
        submitForm,
    } = useTeacherCustomSalaryFormCreate();

    const handleSubmitForm = async () => {
        const success = await submitForm();
        if (success) {
            onSuccess();
            onClose();
        }
    };

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
                                <p>راتب مخصص جديد</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>إضافة راتب مخصص جديد</h1>
                                <p>
                                    اختر المعلم وأدخل الراتب المخصص له. سيتم
                                    استخدام هذا الراتب بدلاً من الراتب
                                    الافتراضي.
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* اختيار المعلم */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المعلم *</label>
                                    <select
                                        required
                                        name="teacher_id"
                                        value={formData.teacher_id as number}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.teacher_id ||
                                            existingSalary ||
                                            loadingRules ||
                                            loadingTeachers
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting || loadingTeachers
                                        }
                                    >
                                        <option value="">اختر المعلم</option>
                                        {teachers.map((teacher) => (
                                            <option
                                                key={teacher.id}
                                                value={teacher.id}
                                            >
                                                {teacher.name} - {teacher.role}
                                            </option>
                                        ))}
                                    </select>
                                    {existingSalary && (
                                        <p className="mt-1 text-sm text-red-600">
                                            يوجد بالفعل راتب مخصص نشط لهذا
                                            المعلم
                                        </p>
                                    )}
                                    {errors.teacher_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.teacher_id}
                                        </p>
                                    )}
                                    {loadingRules && (
                                        <div className="mt-1 text-sm text-blue-600 flex items-center">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            جاري فحص الراتب المخصص...
                                        </div>
                                    )}
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
                                        placeholder="سبب تحديد هذا الراتب المخصص..."
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
                                    disabled={
                                        isSubmitting ||
                                        existingSalary ||
                                        loadingRules ||
                                        !formData.teacher_id ||
                                        loadingTeachers
                                    }
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري الإضافة...
                                        </>
                                    ) : (
                                        <>إضافة الراتب المخصص</>
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

export default CreateCustomSalaryModal;
