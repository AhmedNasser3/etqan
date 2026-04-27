// components/ModalNotification.tsx
import { useEffect } from "react";
import { FiX } from "react-icons/fi";

interface ModalNotificationProps {
    show: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm: () => void;
    confirmText?: string;
    showConfirm?: boolean;
    cancelText?: string;
}

const ModalNotification: React.FC<ModalNotificationProps> = ({
    show,
    title,
    message,
    onClose,
    onConfirm,
    confirmText = "تأكيد",
    showConfirm = false,
    cancelText = "إلغاء",
}) => {
    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [show]);

    if (!show) return null;

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
                            style={{ direction: "rtl", margin: " 24px 0 " }}
                        >
                            <div className="ParentModel__innerTitle">
                                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                                    {title}
                                </h1>
                                <p className="text-gray-600 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            <div
                                className="inputs__submitBtn  inputs__submitBtn_red"
                                id="ParentModel__btn"
                            >
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-medium transition-all"
                                >
                                    {cancelText}
                                </button>
                            </div>
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                {showConfirm && (
                                    <button
                                        onClick={onConfirm}
                                        className="flex-1 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium transition-all"
                                    >
                                        {confirmText}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalNotification;
