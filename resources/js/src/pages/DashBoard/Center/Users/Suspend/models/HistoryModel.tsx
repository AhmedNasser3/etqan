import { useState } from "react";
import { FiX } from "react-icons/fi";

interface HistoryModelProps {
    isOpen: boolean;
    onClose: () => void;
}

const HistoryModel: React.FC<HistoryModelProps> = ({ isOpen, onClose }) => {
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
                                <h1 className="ParentModel__innerTitle red">
                                    وقف
                                </h1>
                                <p>
                                    تم وقف الموظف بسبب:
                                    <span>انتهاك شروط وسياسة منصة اتقان</span>
                                </p>
                            </div>
                        </div>
                        <div
                            className="ParentModel__main"
                            style={{ margin: "12px 0" }}
                        >
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1 className="ParentModel__innerTitle green">
                                    تفعيل
                                </h1>
                                <p>
                                    تم وقف الموظف بسبب:
                                    <span>انتهاك شروط وسياسة منصة اتقان</span>
                                </p>
                            </div>
                        </div>
                        <div
                            className="ParentModel__main"
                            style={{ margin: "12px 0" }}
                        >
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1 className="ParentModel__innerTitle green">
                                    تفعيل
                                </h1>
                                <p>
                                    تم وقف الموظف بسبب:
                                    <span>انتهاك شروط وسياسة منصة اتقان</span>
                                </p>
                            </div>
                        </div>
                        <div
                            className="ParentModel__main"
                            style={{ margin: "12px 0" }}
                        >
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1 className="ParentModel__innerTitle red">
                                    وقف
                                </h1>
                                <p>
                                    تم وقف الموظف بسبب:
                                    <span>انتهاك شروط وسياسة منصة اتقان</span>
                                </p>
                            </div>
                        </div>
                        <div
                            className="ParentModel__main"
                            style={{ margin: "12px 0" }}
                        >
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1 className="ParentModel__innerTitle green">
                                    تفعيل
                                </h1>
                                <p>
                                    تم وقف الموظف بسبب:
                                    <span>انتهاك شروط وسياسة منصة اتقان</span>
                                </p>
                            </div>
                        </div>
                        <div
                            className="ParentModel__main"
                            style={{ margin: "12px 0" }}
                        >
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1 className="ParentModel__innerTitle green">
                                    تفعيل
                                </h1>
                                <p>
                                    تم وقف الموظف بسبب:
                                    <span>انتهاك شروط وسياسة منصة اتقان</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryModel;
