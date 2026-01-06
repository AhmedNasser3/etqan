import { useState, useEffect, useCallback } from "react";

interface UseOtpTimerReturn {
    timer: number;
    resendCode: () => void;
    isTimerActive: boolean;
}

export const useOtpTimer = (initialTimer: number = 30): UseOtpTimerReturn => {
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const resendCode = useCallback(() => {
        setTimer(initialTimer);
    }, [initialTimer]);

    return {
        timer,
        resendCode,
        isTimerActive: timer > 0,
    };
};
