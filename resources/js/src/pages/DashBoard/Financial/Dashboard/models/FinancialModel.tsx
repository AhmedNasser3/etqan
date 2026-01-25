import { FiX } from "react-icons/fi";

interface FinancialModelProps {
    isOpen: boolean;
    onClose: () => void;
}

const FinancialModel: React.FC<FinancialModelProps> = ({ isOpen, onClose }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
                        <div
                            className="ParentModel__main"
                            style={{ margin: "12px 0" }}
                        >
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1 className="ParentModel__innerTitle">
                                    تعديل بيانات الموظف
                                </h1>
                                <p>
                                    لماذا؟
                                    <span>
                                        يمكنك تعديل بيانات الموظف والرواتب
                                        والخصومات{" "}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="ParentModel__container">
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الاسم</label>
                                    <input
                                        defaultValue="أحمد محمد صالح"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الدور</label>
                                    <input defaultValue="معلم" type="text" />
                                </div>

                                <div className="inputs__email">
                                    <label>الراتب الأساسي</label>
                                    <input defaultValue="5000" type="number" />
                                </div>
                                <div className="inputs__email">
                                    <label>أيام الدوام</label>
                                    <input defaultValue="22/26" type="text" />
                                </div>
                            </div>
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الخصومات</label>
                                    <input defaultValue="-200" type="number" />
                                </div>

                                <div className="inputs__email">
                                    <label>المستحق</label>
                                    <input defaultValue="4800" type="number" />
                                </div>
                                <div className="inputs__email">
                                    <label>الحالة</label>
                                    <select>
                                        <option>✅ مدفوع</option>
                                        <option>⏳ معلق</option>
                                    </select>
                                </div>
                            </div>

                            <div className="inputs__email">
                                <div>
                                    <div
                                        className="inputs__submitBtn"
                                        id="ParentModel__btn"
                                    >
                                        <button
                                            type="submit"
                                            form="payrollForm"
                                        >
                                            حفظ التعديلات
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialModel;
