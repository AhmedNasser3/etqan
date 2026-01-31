import { useState, useCallback, useRef } from "react";

interface UseOtpVerificationReturn {
    verified: boolean;
    error: boolean;
    loading: boolean;
    verifyOtp: (otp: string, onSuccess?: () => void) => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    shieldRef: React.RefObject<HTMLDivElement>;
}

export const useOtpVerification = (): UseOtpVerificationReturn => {
    const [verified, setVerified] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const shieldRef = useRef<HTMLDivElement>(null);

    const showAlert = useCallback((message: string) => {
        alert(message);
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
                    } as HeadersInit, // ✅ إصلاح TypeScript
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showAlert(
                        `رمز التحقق: ${data.otp} - ادخله في الحقول أدناه`,
                    );
                } else {
                    const errorMessage = Array.isArray(data.message)
                        ? (Object.values(data.message)[0] as string[])[0]
                        : (data.message as string) || "فشل في ارسال OTP";
                    showAlert(errorMessage);
                    setError(true);
                    setTimeout(() => setError(false), 2000);
                }
            } catch (err: unknown) {
                // ✅ إصلاح any type
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
                    } as HeadersInit, // ✅ إصلاح TypeScript
                    body: JSON.stringify({ otp }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setVerified(true);
                    showAlert("✅ تم تسجيل الدخول بنجاح!");

                    if (shieldRef.current) {
                        shieldRef.current.classList.add("verified-animation");
                        setTimeout(() => {
                            shieldRef.current?.classList.remove(
                                "verified-animation",
                            );
                        }, 1500);
                    }

                    setTimeout(() => {
                        onSuccess?.();
                    }, 1500);
                } else {
                    let errorMessage = "رمز التحقق غير صحيح";
                    if (response.status === 422 && data.message) {
                        errorMessage = Array.isArray(data.message)
                            ? (Object.values(data.message)[0] as string[])[0]
                            : (data.message as string);
                    } else if (data.message) {
                        errorMessage = data.message as string;
                    }

                    setError(true);
                    showAlert(errorMessage);
                    setTimeout(() => setError(false), 2000);
                }
            } catch (err: unknown) {
                // ✅ إصلاح any type
                console.error("Verify OTP Error:", err);
                setError(true);
                showAlert("فشل في الاتصال بالخادم");
                setTimeout(() => setError(false), 2000);
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
    };
};
