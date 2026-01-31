import { useState } from "react";
import {
    FiX,
    FiCheckCircle,
    FiUserPlus,
    FiAlertTriangle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useLinkGuardian } from "../hooks/usePendingStudents";

interface ParentModelProps {
    isOpen: boolean;
    onClose: () => void;
    student?: any;
}

const ParentModel: React.FC<ParentModelProps> = ({
    isOpen,
    onClose,
    student,
}) => {
    const [guardianEmail, setGuardianEmail] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const { linkGuardian } = useLinkGuardian(student?.id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guardianEmail.trim()) {
            toast.error("يرجى إدخال بريد ولي الأمر");
            return;
        }

        setLoading(true);
        try {
            await linkGuardian(guardianEmail);
            toast.success("✅ تم ربط حساب ولي الأمر بنجاح!");
            setTimeout(onClose, 1500);
        } catch (error: any) {
            console.log("=== ERROR DEBUG ===");
            console.log("Full error:", error);
            console.log("Error message:", error.message);
            console.log("Error status:", error.status);
            console.log("==================");

            if (
                error.message?.includes("ولي الأمر") ||
                error.message?.includes("غير مسجل") ||
                error.message?.includes("invalid") ||
                error.status === 404 ||
                error.status === 422 ||
                error.response?.status === 404 ||
                error.response?.status === 422
            ) {
                setShowConfirmDialog(true);
                toast.dismiss();
            } else {
                toast.error(error.message || "فشل في ربط الحساب");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGuardian = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/v1/centers/students/${student?.id}/create-guardian`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ guardian_email: guardianEmail }),
                },
            );

            const result = await response.json();

            if (result.success) {
                toast.success(
                    "✅ تم إنشاء حساب ولي الأمر وربطه بالطالب بنجاح!",
                );
                toast.success(`البريد: ${guardianEmail}\nكلمة السر: 12345678`);
                setTimeout(onClose, 2000);
            } else {
                toast.error(result.message || "فشل في إنشاء الحساب");
            }
        } catch (error: any) {
            toast.error(error.message || "خطأ في إنشاء الحساب");
        } finally {
            setLoading(false);
            setShowConfirmDialog(false);
        }
    };

    const handleCloseModal = () => {
        setGuardianEmail("");
        setShowConfirmDialog(false);
        onClose();
    };

    const handleCancelConfirm = () => {
        setShowConfirmDialog(false);
        setGuardianEmail("");
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="ParentModel">
                <div
                    className="ParentModel__overlay"
                    onClick={handleCloseModal}
                >
                    <div
                        className="ParentModel__content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="ParentModel__inner">
                            <div className="ParentModel__header">
                                <button
                                    className="ParentModel__close"
                                    onClick={handleCloseModal}
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div className="ParentModel__main">
                                <div className="ParentModel__date">
                                    <p>
                                        {new Date().toLocaleDateString("ar-EG")}{" "}
                                        |{" "}
                                        {new Date().toLocaleDateString(
                                            "ar-EG",
                                            {
                                                weekday: "long",
                                            },
                                        )}
                                    </p>
                                </div>
                                <div className="ParentModel__innerTitle">
                                    <h1>ربط حساب ولي الأمر</h1>
                                    <p>
                                        أدخل بريد إلكتروني ولي الأمر المسجل في
                                        النظام لربطه بالطالب:{" "}
                                        <strong>
                                            {student?.name ||
                                                student?.user?.name}
                                        </strong>
                                    </p>
                                </div>
                            </div>

                            <div className="ParentModel__container">
                                <form id="parentForm" onSubmit={handleSubmit}>
                                    <div className="inputs__verifyOTPBirth">
                                        <div className="inputs__email">
                                            <label>
                                                بريد إلكتروني ولي الأمر *
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                value={guardianEmail}
                                                onChange={(e) =>
                                                    setGuardianEmail(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="parent@example.com"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div
                                        className="inputs__submitBtn"
                                        id="ParentModel__btn"
                                    >
                                        <button
                                            type="submit"
                                            disabled={
                                                loading || !guardianEmail.trim()
                                            }
                                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-reverse space-x-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>جاري البحث...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiCheckCircle className="text-xl" />
                                                    <span>
                                                        ربط حساب ولي الأمر
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showConfirmDialog && (
                <div className="confirmation-popup">
                    <div className="popup-content">
                        <div className="popup-header">
                            <div className="icon-container">
                                <FiAlertTriangle />
                            </div>
                            <h2>البريد غير مسجل</h2>
                            <p className="email-display">{guardianEmail}</p>
                        </div>

                        <div className="popup-body">
                            <p>
                                هل تريد إنشاء حساب جديد لولي الأمر وربطه
                                بالطالب؟
                            </p>
                        </div>

                        <div className="popup-footer">
                            <div className="button-group">
                                <button
                                    className="confirm-btn"
                                    onClick={handleCreateGuardian}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner" />
                                            جاري الإنشاء...
                                        </>
                                    ) : (
                                        <>نعم، إنشاء حساب</>
                                    )}
                                </button>
                                <button
                                    className="cancel-btn"
                                    onClick={handleCancelConfirm}
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ParentModel;
