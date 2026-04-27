import { useState, useEffect } from "react";
import { useToast } from "../../../../../../contexts/ToastContext";
import {
    useTeacherCustomSalaryFormUpdate,
    TeacherOption,
} from "../hooks/useTeacherCustomSalaryFormUpdate";
import { ICO } from "../../../icons";
import {
    CURRENCIES,
    CurrencyCode,
} from "../../SalaryRules/SalaryRulesManagement";

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

    const { notifySuccess, notifyError } = useToast();

    const handleSubmit = async () => {
        const success = await submitForm();
        if (success) {
            onSuccess();
            onClose();
        }
    };

    function FG({
        label,
        children,
        required = false,
    }: {
        label: string;
        children: React.ReactNode;
        required?: boolean;
    }) {
        return (
            <div style={{ marginBottom: 13 }}>
                <label
                    style={{
                        display: "block",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        color: "var(--n700)",
                        marginBottom: 4,
                    }}
                >
                    {label}{" "}
                    {required && <span style={{ color: "var(--red)" }}>*</span>}
                </label>
                {children}
            </div>
        );
    }

    if (loadingDetail) {
        return (
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">جاري التحميل...</span>
                    </div>
                    <div
                        className="mb"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: "200px",
                        }}
                    >
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                border: "4px solid var(--blue-200)",
                                borderTop: "4px solid var(--blue)",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">تعديل راتب مخصص</span>
                    <button className="mx" onClick={onClose}>
                        <span
                            style={{
                                width: 12,
                                height: 12,
                                display: "inline-flex",
                            }}
                        >
                            {ICO.x}
                        </span>
                    </button>
                </div>

                <div className="mb">
                    {/* المعلم (للعرض فقط) */}
                    <FG label="المعلم">
                        <input
                            type="text"
                            value={
                                teachers.find(
                                    (t) => t.id === formData.teacher_id,
                                )?.name || ""
                            }
                            className="fi2"
                            style={{
                                backgroundColor: "var(--gray-50)",
                                cursor: "not-allowed",
                            }}
                            disabled
                        />
                    </FG>

                    {/* العملة */}
                    <FG label="العملة" required>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="fi2"
                        >
                            {(Object.keys(CURRENCIES) as CurrencyCode[]).map(
                                (code) => (
                                    <option key={code} value={code}>
                                        {CURRENCIES[code].label}
                                    </option>
                                ),
                            )}
                        </select>
                    </FG>

                    {/* الراتب المخصص */}
                    <FG label="الراتب المخصص" required>
                        <input
                            type="number"
                            name="custom_base_salary"
                            value={formData.custom_base_salary}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            placeholder="5000"
                            className={`fi2 ${errors.custom_base_salary ? "border-red-300 bg-red-50" : ""}`}
                        />
                        {errors.custom_base_salary && (
                            <p
                                style={{
                                    marginTop: 4,
                                    fontSize: "11px",
                                    color: "var(--red)",
                                }}
                            >
                                {errors.custom_base_salary}
                            </p>
                        )}
                    </FG>

                    {/* الملاحظات */}
                    <FG label="ملاحظات">
                        <textarea
                            name="notes"
                            value={formData.notes || ""}
                            onChange={handleInputChange}
                            rows={3}
                            className="fi2"
                            placeholder="ملاحظات إضافية..."
                        />
                    </FG>
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
                        <button className="btn bs" onClick={onClose}>
                            إلغاء
                        </button>
                        <button
                            className="btn bp"
                            onClick={handleSubmit}
                            disabled={
                                loadingTeachers ||
                                isSubmitting ||
                                !formData.custom_base_salary
                            }
                        >
                            {isSubmitting
                                ? "جاري التحديث..."
                                : "تحديث الراتب المخصص"}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default UpdateCustomSalaryModal;
