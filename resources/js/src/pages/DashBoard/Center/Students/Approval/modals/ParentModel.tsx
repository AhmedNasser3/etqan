// ParentModel.tsx - مصحح مع نفس ديزاين PayrollModel + ToastContext + Classes موحدة
import { useState } from "react";
import { useToast } from "../../../../../../../contexts/ToastContext";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { notifySuccess, notifyError } = useToast();

    const ICO: Record<string, JSX.Element> = {
        x: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
    };

    function FG({
        label,
        children,
        required = false,
    }: {
        label: string;
        children: React.ReactNode;
        required?: boolean;
    }) {
        return (
            <div style={{ marginBottom: 13 }}>
                <label
                    style={{
                        display: "block",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        color: "var(--n700)",
                        marginBottom: 4,
                    }}
                >
                    {label}{" "}
                    {required && <span style={{ color: "var(--red)" }}>*</span>}
                </label>
                {children}
            </div>
        );
    }

    // ✅ جيب الـ CSRF token
    const getCsrfToken = (): string | null => {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || null
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guardianEmail.trim()) {
            notifyError("يرجى إدخال بريد ولي الأمر");
            return;
        }

        setIsSubmitting(true);
        const csrfToken = getCsrfToken();

        if (!csrfToken) {
            notifyError("فشل في جلب رمز الحماية");
            setIsSubmitting(false);
            return;
        }

        try {
            // ربط ولي أمر موجود
            const response = await fetch(
                `/api/v1/centers/students/${student?.id}/link-guardian`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({ guardian_email: guardianEmail }),
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("LINK GUARDIAN ERROR:", errorText);

                try {
                    const errorData = JSON.parse(errorText);
                    if (
                        errorData.message?.includes("ولي الأمر") ||
                        errorData.message?.includes("غير مسجل") ||
                        response.status === 404 ||
                        response.status === 422
                    ) {
                        setShowConfirmDialog(true);
                        return;
                    }
                    notifyError(errorData.message || "فشل في ربط الحساب");
                    return;
                } catch (e) {
                    notifyError(`خطأ ${response.status}`);
                    return;
                }
            }

            const result = await response.json();
            notifySuccess("تم ربط حساب ولي الأمر بنجاح!");
            setTimeout(onClose, 1500);
        } catch (error: any) {
            notifyError(error.message || "حدث خطأ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateGuardian = async () => {
        setIsSubmitting(true);
        const csrfToken = getCsrfToken();

        if (!csrfToken) {
            notifyError("فشل في جلب رمز الحماية");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/centers/students/${student?.id}/create-guardian`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({ guardian_email: guardianEmail }),
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                const errorData = JSON.parse(errorText);
                notifyError(errorData.message || "فشل في إنشاء الحساب");
                return;
            }

            const result = await response.json();
            if (result.success) {
                notifySuccess("تم إنشاء حساب ولي الأمر وربطه بالطالب بنجاح!");
                notifySuccess(`البريد: ${guardianEmail}\nكلمة السر: 12345678`);
                setTimeout(onClose, 2000);
            } else {
                notifyError(result.message || "فشل في إنشاء الحساب");
            }
        } catch (error: any) {
            notifyError(error.message || "خطأ في إنشاء الحساب");
        } finally {
            setIsSubmitting(false);
            setShowConfirmDialog(false);
        }
    };

    const handleCloseModal = () => {
        setGuardianEmail("");
        setShowConfirmDialog(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">
                            ربط حساب ولي الأمر -{" "}
                            {student?.name || student?.user?.name}
                        </span>
                        <button
                            className="mx"
                            onClick={handleCloseModal}
                            disabled={isSubmitting}
                        >
                            <span
                                style={{
                                    width: 12,
                                    height: 12,
                                    display: "inline-flex",
                                }}
                            >
                                {ICO.x}
                            </span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb">
                            <FG label="بريد إلكتروني ولي الأمر" required>
                                <input
                                    className="fi2"
                                    type="email"
                                    placeholder="parent@example.com"
                                    required
                                    disabled={isSubmitting}
                                />
                            </FG>
                        </div>
                        <div className="mf">
                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    justifyContent: "flex-end",
                                    marginTop: "20px",
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn bs"
                                    onClick={handleCloseModal}
                                    disabled={isSubmitting}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="btn bp"
                                    disabled={
                                        isSubmitting || !guardianEmail.trim()
                                    }
                                >
                                    {isSubmitting
                                        ? "جاري البحث..."
                                        : "ربط حساب ولي الأمر"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* مودال التأكيد */}
            {showConfirmDialog && (
                <div
                    className="conf-ov on"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3001,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div className="conf-box">
                        <div className="conf-ico">
                            <span
                                style={{
                                    width: 22,
                                    height: 22,
                                    display: "inline-flex",
                                    color: "var(--yellow)",
                                }}
                            >
                                ⚠️
                            </span>
                        </div>
                        <div className="conf-t">البريد غير مسجل</div>
                        <div className="conf-d">
                            <p>
                                البريد: <strong>{guardianEmail}</strong>
                            </p>
                            <p>
                                هل تريد إنشاء حساب جديد لولي الأمر وربطه
                                بالطالب؟
                            </p>
                        </div>
                        <div className="conf-acts">
                            <button
                                className="btn bp"
                                onClick={handleCreateGuardian}
                                disabled={isSubmitting}
                            >
                                نعم، إنشاء حساب
                            </button>
                            <button
                                className="btn bs"
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    setGuardianEmail("");
                                }}
                                disabled={isSubmitting}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ParentModel;
