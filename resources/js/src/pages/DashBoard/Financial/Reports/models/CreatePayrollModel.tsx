import { FiX } from "react-icons/fi";

interface CreatePayrollModelProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreatePayrollModel: React.FC<CreatePayrollModelProps> = ({
    isOpen,
    onClose,
}) => {
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
                                    إنشاء موظف جديد
                                </h1>
                                <p>
                                    لماذا؟
                                    <span>
                                        يمكنك إضافة موظف جديد مع بياناته ورواتبه
                                        وخصوماته{" "}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="ParentModel__container">
                            <form id="payrollForm" onSubmit={handleSubmit}>
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>الاسم *</label>
                                        <input required type="text" />
                                    </div>
                                </div>
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>الدور *</label>
                                        <input required type="text" />
                                    </div>
                                    <div className="inputs__email">
                                        <label>الراتب الأساسي *</label>
                                        <input required type="number" min="0" />
                                    </div>
                                    <div className="inputs__email">
                                        <label>أيام الدوام</label>
                                        <input
                                            type="text"
                                            placeholder="22/26"
                                        />
                                    </div>
                                </div>
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>الخصومات</label>
                                        <input type="number" min="0" />
                                    </div>
                                    <div className="inputs__email">
                                        <label>المستحق</label>
                                        <input type="number" min="0" />
                                    </div>
                                    <div className="inputs__email">
                                        <label>الحالة</label>
                                        <select>
                                            <option>⏳ معلق</option>
                                            <option>✅ مدفوع</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="inputs__email">
                                    <div>
                                        <div
                                            className="inputs__submitBtn"
                                            id="ParentModel__btn"
                                        >
                                            <button type="submit">
                                                إنشاء الموظف
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePayrollModel;
