// models/CreateSalaryRuleModal.tsx
import { useState, useEffect } from "react";
import {
    useSalaryRuleFormCreate,
    FormData,
} from "../hooks/useSalaryRuleFormCreate";
import { useToast } from "../../../../../../contexts/ToastContext";
import { CURRENCIES, CurrencyCode } from "../SalaryRulesManagement";

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

    const { notifySuccess, notifyError } = useToast();

    const isRoleExists = existingRules.some(
        (rule) => rule.role === formData.role,
    );

    const handleSubmitForm = async () => {
        const success = await submitForm();
        if (success) {
            onSuccess();
            onClose();
        }
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "10.5px",
        fontWeight: 700,
        color: "var(--n700)",
        marginBottom: 4,
    };

    const errorStyle: React.CSSProperties = {
        fontSize: "10.5px",
        color: "var(--red-600)",
        margin: "2px 0 0 0",
    };

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">قاعدة راتب جديدة</span>
                    <button
                        className="mx"
                        onClick={onClose}
                        disabled={isSubmitting || loadingRules}
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

                <div className="mb">
                    {/* الدور */}
                    <div style={{ marginBottom: 13 }}>
                        <label style={labelStyle}>الدور *</label>
                        <select
                            required
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className={`fi2 ${errors.role || isRoleExists || loadingRules ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                            disabled={isSubmitting || loadingRules}
                        >
                            <option value="">اختر الدور</option>
                            <option value="teacher">مدرس</option>
                            <option value="supervisor">مشرف</option>
                            <option value="motivator">محفز</option>
                            <option value="student_affairs">شؤون الطلاب</option>
                            <option value="financial">مالي</option>
                        </select>
                        {isRoleExists && (
                            <p style={errorStyle}>
                                يوجد بالفعل قاعدة راتب لهذا الدور في مجمعك
                            </p>
                        )}
                        {errors.role && <p style={errorStyle}>{errors.role}</p>}
                        {loadingRules && (
                            <p
                                style={{
                                    fontSize: "10.5px",
                                    color: "var(--blue-600)",
                                    margin: "2px 0 0 0",
                                }}
                            >
                                جاري تحميل القوانين...
                            </p>
                        )}
                    </div>

                    {/* العملة */}
                    <div style={{ marginBottom: 13 }}>
                        <label style={labelStyle}>العملة *</label>
                        <select
                            required
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="fi2 border-gray-200 hover:border-gray-300"
                            disabled={isSubmitting}
                        >
                            {(Object.keys(CURRENCIES) as CurrencyCode[]).map(
                                (code) => (
                                    <option key={code} value={code}>
                                        {CURRENCIES[code].label}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    {/* الراتب الأساسي */}
                    <div style={{ marginBottom: 13 }}>
                        <label style={labelStyle}>الراتب الأساسي *</label>
                        <input
                            required
                            type="number"
                            name="base_salary"
                            value={formData.base_salary}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className={`fi2 ${errors.base_salary ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                            placeholder="5000"
                            disabled={isSubmitting}
                        />
                        {errors.base_salary && (
                            <p style={errorStyle}>{errors.base_salary}</p>
                        )}
                    </div>

                    {/* أيام العمل */}
                    <div style={{ marginBottom: 13 }}>
                        <label style={labelStyle}>أيام العمل *</label>
                        <input
                            required
                            type="number"
                            name="working_days"
                            value={formData.working_days}
                            onChange={handleInputChange}
                            min="1"
                            max="31"
                            className={`fi2 ${errors.working_days ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                            placeholder="26"
                            disabled={isSubmitting}
                        />
                        {errors.working_days && (
                            <p style={errorStyle}>{errors.working_days}</p>
                        )}
                    </div>

                    {/* الراتب اليومي (قراءة فقط) */}
                    <div style={{ marginBottom: 13 }}>
                        <label style={labelStyle}>
                            الراتب اليومي (حساب تلقائي)
                        </label>
                        <input
                            type="number"
                            name="daily_rate"
                            value={formData.daily_rate}
                            className="fi2 bg-gray-50 cursor-not-allowed"
                            placeholder="سيتم الحساب تلقائياً"
                            disabled
                        />
                        <p
                            style={{
                                fontSize: "9px",
                                color: "var(--n500)",
                                margin: "2px 0 0 0",
                            }}
                        >
                            سيتم حسابه تلقائياً من (الراتب الأساسي ÷ أيام العمل)
                        </p>
                    </div>

                    {/* الملاحظات */}
                    <div style={{ marginBottom: 13 }}>
                        <label style={labelStyle}>ملاحظات (اختياري)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="fi2 resize-vertical"
                            placeholder="ملاحظات إضافية..."
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="mf">
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end",
                            marginTop: "20px",
                        }}
                    >
                        <button
                            className="btn bs"
                            onClick={onClose}
                            disabled={isSubmitting || loadingRules}
                        >
                            إلغاء
                        </button>
                        <button
                            className="btn bp"
                            onClick={handleSubmitForm}
                            disabled={
                                isSubmitting || isRoleExists || loadingRules
                            }
                        >
                            {isSubmitting
                                ? "جاري الإضافة..."
                                : "إضافة قاعدة الراتب الجديدة"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSalaryRuleModal;
