import { useState, useCallback, useRef } from "react";

interface ModalState {
    show: boolean;
    title?: string;
    message: string;
}

interface UseOtpVerificationReturn {
    verified: boolean;
    error: boolean;
    loading: boolean;
    verifyOtp: (otp: string, onSuccess?: () => void) => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    shieldRef: React.RefObject<HTMLDivElement>;
    modal: ModalState;
    closeModal: () => void;
}

// ✅ دالة مشتركة لجلب الـ CSRF token
const getCSRFToken = (): string => {
    return decodeURIComponent(
        document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1] ?? "",
    );
};

export const useOtpVerification = (): UseOtpVerificationReturn => {
    const [verified, setVerified] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [modal, setModal] = useState<ModalState>({
        show: false,
        message: "",
    });

    const shieldRef = useRef<HTMLDivElement>(null);

    const closeModal = useCallback(() => {
        setModal((m) => ({ ...m, show: false }));
    }, []);

    const showAlert = useCallback((message: string): void => {
        setModal({
            show: true,
            title: "تنبيه",
            message,
        });
    }, []);

    const sendOtp = useCallback(
        async (email: string) => {
            setLoading(true);
            setError(false);

            try {
                const response = await fetch("/email/send-otp", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-XSRF-TOKEN": getCSRFToken(), // ✅
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (response.ok && data.success === true) {
                    if (data.otp != null) {
                        showAlert(
                            `رمز التحقق المؤقت: ${data.otp} - ادخله في الحقول أدناه`,
                        );
                    } else {
                        showAlert("تم إرسال رمز التحقق للبريد الإلكتروني.");
                    }
                } else {
                    let msg = Array.isArray(data.message)
                        ? String(
                              Object.values(data.message)[0] ??
                                  "فشل في إرسال OTP",
                          )
                        : String(data.message ?? "فشل في إرسال OTP");

                    if (data.reason === "pending") {
                        setModal({
                            show: true,
                            title: "تنبيه",
                            message:
                                "الحساب لم يتم قبوله بعد، انتظر التفعيل من الإدارة",
                        });
                    } else {
                        setError(true);
                        showAlert(msg);
                        setTimeout(() => setError(false), 2000);
                    }
                }
            } catch (err) {
                console.error("Send OTP Error:", err);
                showAlert("فشل في الاتصال بالخادم، تأكد من تشغيل Laravel");
                setError(true);
                setTimeout(() => setError(false), 2000);
            } finally {
                setLoading(false);
            }
        },
        [showAlert],
    );

    const verifyOtp = useCallback(
        async (otp: string, onSuccess?: () => void) => {
            setLoading(true);
            setError(false);

            try {
                const response = await fetch("/email/verify-otp", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-XSRF-TOKEN": getCSRFToken(), // ✅
                    },
                    body: JSON.stringify({ otp }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setVerified(true);
                    showAlert("تم تسجيل الدخول بنجاح!");

                    if (shieldRef.current) {
                        shieldRef.current.classList.add("verified-animation");
                        setTimeout(() => {
                            shieldRef.current?.classList.remove(
                                "verified-animation",
                            );
                        }, 1500);
                    }

                    setTimeout(() => onSuccess?.(), 1500);
                } else {
                    let eMsg = Array.isArray(data.message)
                        ? String(
                              Object.values(data.message)[0] ??
                                  "رمز التحقق غير صحيح",
                          )
                        : String(data.message ?? "رمز التحقق غير صحيح");

                    if (data.reason === "pending") {
                        setModal({
                            show: true,
                            title: "طلب تفعيل من الإدارة",
                            message:
                                "الحساب لم يتم قبوله بعد، انتظر التفعيل من الإدارة",
                        });
                    } else {
                        setError(true);
                        showAlert(eMsg);
                        setTimeout(() => setError(false), 3000);
                    }
                }
            } catch (err) {
                console.error("Verify OTP Error:", err);
                setError(true);
                showAlert("فشل في الاتصال بالخادم");
                setTimeout(() => setError(false), 3000);
            } finally {
                setLoading(false);
            }
        },
        [showAlert],
    );

    return {
        verified,
        error,
        loading,
        verifyOtp,
        sendOtp,
        shieldRef,
        modal,
        closeModal,
    };
};
