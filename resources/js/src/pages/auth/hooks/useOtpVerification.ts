import { useState, useCallback, useRef } from "react";

interface UseOtpVerificationReturn {
    verified: boolean;
    error: boolean;
    verifyOtp: (otp: string, onSuccess?: () => void) => void;
    shieldRef: React.RefObject<any>;
}

export const useOtpVerification = (): UseOtpVerificationReturn => {
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);
    const shieldRef = useRef<any>(null);

    const verifyOtp = useCallback((otp: string, onSuccess?: () => void) => {
        if (otp === "1234") {
            setVerified(true);

            if (shieldRef.current) {
                const element = shieldRef.current as HTMLElement;
                if (element) {
                    element.classList.add("verified-animation");
                    setTimeout(() => {
                        element.classList.remove("verified-animation");
                    }, 1500);
                }
            }

            setTimeout(() => {
                onSuccess?.();
            }, 1500);
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    }, []);

    return { verified, error, verifyOtp, shieldRef };
};
