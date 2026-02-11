import React from "react";
import toast from "react-hot-toast";

interface DeleteModalProps {
    show: boolean;
    title?: string;
    message: string;
    onClose: () => void;
    onConfirm: () => void; // ✅ مطلوب للحذف
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
    show,
    title = "تأكيد الحذف",
    message,
    onClose,
    onConfirm,
    confirmText = "حذف نهائياً",
    cancelText = "إلغاء",
    loading = false,
}) => {
    if (!show) return null;

    return (
        <>
            {/* ✅ Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            />

            {/* ✅ Modal Content */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 border border-red-600 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                جاري الحذف...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default DeleteModal;
