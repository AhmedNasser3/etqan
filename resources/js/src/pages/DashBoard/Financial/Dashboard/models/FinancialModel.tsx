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

        // ✅ تحويل البيانات للـ API format الصحيح
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

            // ✅ PUT بدلاً من PATCH ليطابق الـ route الجديد
            const response = await fetch(
                `/api/v1/teacher/payrolls/${payroll.id}`,
                {
                    method: "PUT", // ✅ تغيير من PATCH إلى PUT
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
                // ✅ نجح التحديث - نفّذ الـ callback
                onSubmit?.(formData);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "فشل في التحديث");
            }
        } catch (error: any) {
            console.error("خطأ في التحديث:", error);
            alert(`خطأ: ${error.message || "حدث خطأ في حفظ التعديلات"}`);
            return; // ✅ لا تغلق المودل في حالة الخطأ
        }

        onClose();
    };

    if (!isOpen) return null;

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
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>تعديل بيانات الموظف</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل بيانات الراتب</h1>
                                <p>يرجي تعديل البيانات المطلوبة بدقة</p>
                            </div>
                        </div>
                        <div className="ParentModel__container">
                            <form onSubmit={handleSubmit} id="financialForm">
                                {/* ✅ الاسم read-only */}
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>الاسم</label>
                                        <input
                                            name="name"
                                            value={
                                                payroll?.teacher?.user?.name ||
                                                "غير معروف"
                                            }
                                            type="text"
                                            className="bg-gray-100 cursor-not-allowed border border-gray-300"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* ✅ الدور read-only */}
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>الدور</label>
                                        <input
                                            name="role"
                                            value={payroll?.teacher?.role || ""}
                                            type="text"
                                            className="bg-gray-100 cursor-not-allowed border border-gray-300"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* ✅ الراتب الأساسي */}
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>الراتب الأساسي *</label>
                                        <input
                                            name="base_salary"
                                            defaultValue={
                                                payroll?.base_salary || ""
                                            }
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="border border-gray-300 rounded p-2"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* ✅ أيام الدوام */}
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>أيام الدوام</label>
                                        <input
                                            name="attendance_days"
                                            defaultValue={
                                                payroll?.attendance_days?.toString() ||
                                                ""
                                            }
                                            type="number"
                                            min="0"
                                            max="31"
                                            className="border border-gray-300 rounded p-2"
                                        />
                                    </div>
                                </div>

                                {/* ✅ الخصومات */}
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>الخصومات</label>
                                        <input
                                            name="deductions"
                                            defaultValue={
                                                payroll?.deductions || ""
                                            }
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="border border-gray-300 rounded p-2"
                                        />
                                    </div>
                                </div>

                                {/* ✅ المستحق */}
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>المستحق *</label>
                                        <input
                                            name="total_due"
                                            defaultValue={
                                                payroll?.total_due || ""
                                            }
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="border border-gray-300 rounded p-2"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* ✅ الحالة */}
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>الحالة</label>
                                        <select
                                            name="status"
                                            defaultValue={
                                                payroll?.status || "pending"
                                            }
                                            className="border border-gray-300 rounded p-2 w-full"
                                        >
                                            <option value="pending">
                                                معلق
                                            </option>
                                            <option value="paid">
                                                ✅ مدفوع
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div
                                    className="inputs__submitBtn"
                                    id="ParentModel__btn"
                                >
                                    <button
                                        type="submit"
                                        form="financialForm"
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        حفظ التعديلات
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialModel;
