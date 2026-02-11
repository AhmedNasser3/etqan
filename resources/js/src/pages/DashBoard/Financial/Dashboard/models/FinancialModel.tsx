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
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit) {
            const formData = new FormData(e.currentTarget);
            onSubmit(formData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                        تعديل بيانات الموظف
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الاسم
                        </label>
                        <input
                            name="name"
                            defaultValue={
                                payroll?.user?.name ||
                                payroll?.teacher?.name ||
                                ""
                            }
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الدور
                        </label>
                        <input
                            name="role"
                            defaultValue={payroll?.teacher?.role || ""}
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الراتب الأساسي
                            </label>
                            <input
                                name="base_salary"
                                defaultValue={payroll?.base_salary || ""}
                                type="number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                أيام الدوام
                            </label>
                            <input
                                name="attendance_days"
                                defaultValue={
                                    payroll?.attendance_days
                                        ? `${payroll.attendance_days}/26`
                                        : ""
                                }
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الخصومات
                            </label>
                            <input
                                name="deductions"
                                defaultValue={payroll?.deductions || ""}
                                type="number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المستحق
                            </label>
                            <input
                                name="total_due"
                                defaultValue={payroll?.total_due || ""}
                                type="number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الحالة
                        </label>
                        <select
                            name="status"
                            defaultValue={payroll?.status || "pending"}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="pending">⏳ معلق</option>
                            <option value="paid">✅ مدفوع</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all"
                    >
                        حفظ التعديلات
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FinancialModel;
