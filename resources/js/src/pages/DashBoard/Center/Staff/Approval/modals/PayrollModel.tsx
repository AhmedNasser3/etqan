import { useState } from "react";
import { FiX } from "react-icons/fi";

interface PayrollModelProps {
    isOpen: boolean;
    onClose: () => void;
}

const PayrollModel: React.FC<PayrollModelProps> = ({ isOpen, onClose }) => {
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
                                <h1>ربط حسابات الموظف</h1>
                                <p>
                                    يرجي ربط الحسابات المطلوبة لضمان استلام
                                    راتبك بشكل سليم
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
                                    <label> رقم IBAN البنكي *</label>
                                    <input
                                        required
                                        type="text"
                                        name="iban_number"
                                        id="iban_number"
                                        placeholder="SA1234567890123456789012"
                                    />
                                </div>
                            </div>
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label> رقم التأمينات الاجتماعية *</label>
                                    <input
                                        required
                                        type="text"
                                        name="insurance_number"
                                        id="insurance_number"
                                        placeholder="400-1234-56789"
                                    />
                                </div>
                            </div>
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button type="submit" form="payrollForm">
                                    ربط حساب الرواتب
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollModel;
