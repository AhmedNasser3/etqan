// components/ModalNotification.tsx - محدث مع دعم أزرار متعددة
import React from "react";
import "../../.../../../../../assets/scss/main.scss";

interface ModalNotificationProps {
    show: boolean;
    title?: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    showConfirm?: boolean;
}

const ModalNotification: React.FC<ModalNotificationProps> = ({
    show,
    title = "تنبيه",
    message,
    onClose,
    onConfirm,
    confirmText = "تأكيد",
    showConfirm = false,
}) => {
    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <div className="modal-footer">
                    {showConfirm ? (
                        <>
                            <button
                                onClick={onClose}
                                className="modal-btn modal-btn-cancel"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={onConfirm}
                                className="modal-btn modal-btn-confirm"
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="modal-btn">
                            تم
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalNotification;
