// models/FinancialModel.tsx
import { FiX } from "react-icons/fi";
import { PayrollItem } from "../hooks/useTeacherPayrolls";

interface FinancialModelProps {
    isOpen: boolean;
    onClose: () => void;
    payroll?: Partial<PayrollItem> | null;
    onSubmit?: (data: FormData) => void;
}

const FinancialModel: React.FC<FinancialModelProps> = ({
    isOpen,
    onClose,
    payroll,
    onSubmit,
}) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!payroll?.id || !onSubmit) {
            onClose();
            return;
        }

        const formData = new FormData(e.currentTarget);

        //  تحويل البيانات للـ API format الصحيح
        const updateData: any = {
            base_salary: formData.get("base_salary") as string,
            attendance_days: parseInt(
                formData.get("attendance_days")?.toString() || "0",
            ),
            deductions: formData.get("deductions") as string,
            total_due: formData.get("total_due") as string,
            status: formData.get("status") as "pending" | "paid",
        };

        try {
            const token =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            //  PUT بدلاً من PATCH ليطابق الـ route الجديد
            const response = await fetch(
                `/api/v1/teacher/payrolls/${payroll.id}`,
                {
                    method: "PUT", //  تغيير من PATCH إلى PUT
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        ...(token && { "X-CSRF-TOKEN": token }),
                    },
                    body: JSON.stringify(updateData),
                },
            );

            if (response.ok) {
                //  نجح التحديث - نفّذ الـ callback
                onSubmit?.(formData);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "فشل في التحديث");
            }
        } catch (error: any) {
            console.error("خطأ في التحديث:", error);
            alert(`خطأ: ${error.message || "حدث خطأ في حفظ التعديلات"}`);
            return; //  لا تغلق المودل في حالة الخطأ
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">
                        <span
                            style={{
                                width: 32,
                                height: 32,
                                display: "inline-flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 8,
                                background: "var(--blue-100)",
                                color: "var(--blue-700)",
                                fontSize: "18px",
                            }}
                        >
                            💰
                        </span>{" "}
                        تعديل بيانات الراتب
                    </span>
                    <button className="mx" onClick={onClose}>
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
                    {/* الاسم read-only */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            الاسم:
                        </label>
                        <input
                            name="name"
                            value={payroll?.teacher?.user?.name || "غير معروف"}
                            type="text"
                            className="fi2 bg-gray-100 cursor-not-allowed border border-gray-300"
                            readOnly
                        />
                    </div>

                    {/* الدور read-only */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            الدور:
                        </label>
                        <input
                            name="role"
                            value={payroll?.teacher?.role || ""}
                            type="text"
                            className="fi2 bg-gray-100 cursor-not-allowed border border-gray-300"
                            readOnly
                        />
                    </div>

                    {/* الراتب الأساسي */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            الراتب الأساسي *
                        </label>
                        <input
                            name="base_salary"
                            defaultValue={payroll?.base_salary || ""}
                            type="number"
                            step="0.01"
                            min="0"
                            className="fi2"
                            required
                        />
                    </div>

                    {/* أيام الدوام */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            أيام الدوام
                        </label>
                        <input
                            name="attendance_days"
                            defaultValue={
                                payroll?.attendance_days?.toString() || ""
                            }
                            type="number"
                            min="0"
                            max="31"
                            className="fi2"
                        />
                    </div>

                    {/* الخصومات */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            الخصومات
                        </label>
                        <input
                            name="deductions"
                            defaultValue={payroll?.deductions || ""}
                            type="number"
                            step="0.01"
                            min="0"
                            className="fi2"
                        />
                    </div>

                    {/* المستحق */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            المستحق *
                        </label>
                        <input
                            name="total_due"
                            defaultValue={payroll?.total_due || ""}
                            type="number"
                            step="0.01"
                            min="0"
                            className="fi2"
                            required
                        />
                    </div>

                    {/* الحالة */}
                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "10px",
                                fontWeight: 700,
                                color: "var(--n700)",
                                marginBottom: 4,
                            }}
                        >
                            الحالة
                        </label>
                        <select
                            name="status"
                            defaultValue={payroll?.status || "pending"}
                            className="fi2"
                        >
                            <option value="pending">معلق</option>
                            <option value="paid">مدفوع</option>
                        </select>
                    </div>
                </div>

                <div className="mf">
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end",
                            marginTop: "16px",
                        }}
                    >
                        <button
                            className="btn bs"
                            onClick={onClose}
                            type="button"
                        >
                            إلغاء
                        </button>
                        <button
                            className="btn bp"
                            type="submit"
                            form="financialForm"
                        >
                            حفظ التعديلات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialModel;
