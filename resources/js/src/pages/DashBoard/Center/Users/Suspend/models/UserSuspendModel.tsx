import { useState } from "react";
import { FiX } from "react-icons/fi";

interface UserSuspendModelProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserSuspendModel: React.FC<UserSuspendModelProps> = ({
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
                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>سبب الإيقاف ؟</h1>
                                <p>
                                    يرجي كتابة سببب صريح للإيقاف مثال : انتهاك
                                    خصوصية, مخالفة شروط...الخ
                                </p>
                            </div>
                        </div>
                        <div className="ParentModel__container">
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label> اسم الموظف *</label>
                                    <input
                                        required
                                        type="text"
                                        name="staff_name"
                                        id="staff_name"
                                        placeholder="أحمد محمد صالح العتيبي"
                                    />
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="text-lg font-semibold mb-4 block">
                                        سبب الإيقاف ؟
                                    </label>
                                    <textarea
                                        placeholder="اكتب سبب الإيقاف هنا..."
                                        rows={8}
                                        className="ParentModel__comment w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button type="submit" form="payrollForm">
                                    وضع سبب الإيقاف
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSuspendModel;
