// models/CreateSalaryRuleModal.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import {
    useSalaryRuleFormCreate,
    FormData,
} from "../hooks/useSalaryRuleFormCreate";

interface CreateSalaryRuleModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateSalaryRuleModal: React.FC<CreateSalaryRuleModalProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        existingRules,
        loadingRules,
        handleInputChange,
        submitForm,
    } = useSalaryRuleFormCreate();

    const handleSubmitForm = async () => {
        const success = await submitForm();
        if (success) {
            onSuccess();
            onClose();
        }
    };

    const isRoleExists = existingRules.some(
        (rule) => rule.role === formData.role,
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
                                <p>قاعدة راتب جديدة</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>إضافة قاعدة راتب جديدة</h1>
                                <p>
                                    حدد الدور وأدخل تفاصيل الراتب الأساسي وأيام
                                    العمل
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* اختيار الدور */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الدور *</label>
                                    <select
                                        required
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.role ||
                                            isRoleExists ||
                                            loadingRules
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={isSubmitting || loadingRules}
                                    >
                                        <option value="">اختر الدور</option>
                                        <option value="teacher">مدرس</option>
                                        <option value="supervisor">مشرف</option>
                                        <option value="motivator">محفز</option>
                                        <option value="student_affairs">
                                            شؤون الطلاب
                                        </option>
                                        <option value="financial">مالي</option>
                                    </select>
                                    {isRoleExists && (
                                        <p className="mt-1 text-sm text-red-600">
                                            يوجد بالفعل قاعدة راتب لهذا الدور في
                                            مجمعك
                                        </p>
                                    )}
                                    {errors.role && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.role}
                                        </p>
                                    )}
                                    {loadingRules && (
                                        <div className="mt-1 text-sm text-blue-600 flex items-center">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            جاري تحميل القوانين...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* الراتب الأساسي */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الراتب الأساسي (ج.م) *</label>
                                    <input
                                        required
                                        type="number"
                                        name="base_salary"
                                        value={formData.base_salary}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                                            errors.base_salary
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="5000"
                                        disabled={isSubmitting}
                                    />
                                    {errors.base_salary && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.base_salary}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* أيام العمل */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>أيام العمل *</label>
                                    <input
                                        required
                                        type="number"
                                        name="working_days"
                                        value={formData.working_days}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="31"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.working_days
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="26"
                                        disabled={isSubmitting}
                                    />
                                    {errors.working_days && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.working_days}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الراتب اليومي */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الراتب اليومي (حساب تلقائي)</label>
                                    <input
                                        type="number"
                                        name="daily_rate"
                                        value={formData.daily_rate}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                                        placeholder="سيتم الحساب تلقائياً"
                                        disabled
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        سيتم حسابه تلقائياً من (الراتب الأساسي ÷
                                        أيام العمل)
                                    </p>
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
                                    onClick={handleSubmitForm} // ✅ بدون FormData parameter
                                    disabled={
                                        isSubmitting ||
                                        isRoleExists ||
                                        loadingRules
                                    }
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري الإضافة...
                                        </>
                                    ) : (
                                        <>إضافة قاعدة الراتب الجديدة</>
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

export default CreateSalaryRuleModal;
