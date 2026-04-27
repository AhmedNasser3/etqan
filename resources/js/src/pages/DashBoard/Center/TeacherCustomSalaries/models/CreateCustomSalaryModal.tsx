import { useState, useEffect } from "react";
import { useToast } from "../../../../../../contexts/ToastContext";
import {
    useTeacherCustomSalaryFormCreate,
    TeacherOption,
} from "../hooks/useTeacherCustomSalaryFormCreate";
import { ICO } from "../../../icons";
import {
    CURRENCIES,
    CurrencyCode,
} from "../../SalaryRules/SalaryRulesManagement";
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

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">راتب مخصص جديد</span>
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
                    {/* المعلم */}
                    <FG label="المعلم" required>
                        <select
                            name="teacher_id"
                            value={formData.teacher_id || ""}
                            onChange={handleInputChange}
                            className={`fi2 ${
                                errors.teacher_id ||
                                existingSalary ||
                                loadingRules
                                    ? "border-red-300 bg-red-50"
                                    : ""
                            }`}
                            disabled={loadingTeachers}
                        >
                            <option value="">اختر المعلم</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} - {teacher.role}
                                </option>
                            ))}
                        </select>
                        {existingSalary && (
                            <p
                                style={{
                                    marginTop: 4,
                                    fontSize: "11px",
                                    color: "var(--red)",
                                }}
                            >
                                يوجد بالفعل راتب مخصص نشط لهذا المعلم
                            </p>
                        )}
                        {errors.teacher_id && (
                            <p
                                style={{
                                    marginTop: 4,
                                    fontSize: "11px",
                                    color: "var(--red)",
                                }}
                            >
                                {errors.teacher_id}
                            </p>
                        )}
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
                            placeholder="سبب تحديد هذا الراتب المخصص..."
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
                                existingSalary ||
                                loadingRules ||
                                loadingTeachers ||
                                isSubmitting ||
                                !formData.teacher_id ||
                                !formData.custom_base_salary
                            }
                        >
                            {isSubmitting
                                ? "جاري الإضافة..."
                                : "إضافة الراتب المخصص"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCustomSalaryModal;
