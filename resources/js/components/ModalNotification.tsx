// components/ModalNotification.tsx - Component نظيف بدون inline styles
import React from "react";
import "../src/assets/scss/main.scss";
interface ModalNotificationProps {
    show: boolean;
    title?: string;
    message: string;
    onClose: () => void;
}

const ModalNotification: React.FC<ModalNotificationProps> = ({
    show,
    title = "تنبيه",
    message,
    onClose,
}) => {
    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-btn">
                        تم
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalNotification;
