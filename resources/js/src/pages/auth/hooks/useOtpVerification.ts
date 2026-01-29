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
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const shieldRef = useRef<HTMLDivElement>(null);

    const showAlert = (message: string) => {
        alert(message);
    };

    const sendOtp = useCallback(async (email: string) => {
        setLoading(true);
        try {
            const response = await fetch("/api/email/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                showAlert(`رمز التحقق: ${data.otp} - ادخله في الحقول أدناه`);
            } else {
                showAlert(data.message);
            }
        } catch (err) {
            showAlert("فشل في ارسال رمز التحقق");
        } finally {
            setLoading(false);
        }
    }, []);

    const verifyOtp = useCallback(
        async (otp: string, onSuccess?: () => void) => {
            setLoading(true);
            setError(false);

            try {
                const response = await fetch("/api/email/verify-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ otp }),
                });

                const data = await response.json();

                if (data.success) {
                    setVerified(true);
                    showAlert("تم التحقق بنجاح!");

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
                    setError(true);
                    showAlert(data.message);
                    setTimeout(() => setError(false), 1000);
                }
            } catch (err) {
                setError(true);
                showAlert("حدث خطأ في التحقق");
                setTimeout(() => setError(false), 1000);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return { verified, error, loading, verifyOtp, sendOtp, shieldRef };
};
