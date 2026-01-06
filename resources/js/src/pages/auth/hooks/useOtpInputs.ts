import { useRef, useState, useCallback, useEffect } from "react";

interface UseOtpInputsReturn {
    inputsRef: React.RefObject<(HTMLInputElement | null)[]>;
    otpValue: string;
    otpFilled: boolean;
    handleInputChange: (index: number, value: string) => void;
    handleKeyDown: (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => void;
}

export const useOtpInputs = (otpLength: number = 4): UseOtpInputsReturn => {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const [otpValue, setOtpValue] = useState("");
    const [otpFilled, setOtpFilled] = useState(false);

    // Auto focus first input
    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const updateOtpValue = useCallback(
        (index: number, value: string) => {
            const newOtp = otpValue.split("");
            newOtp[index] = value;
            const newOtpValue = newOtp.join("");
            setOtpValue(newOtpValue);

            // ✅ تحقق من الـ inputs الفعلية مش الـ otpValue
            const isFilled = inputsRef.current.every(
                (input, i) => input?.value.length === 1 || newOtpValue[i] !== ""
            );
            setOtpFilled(isFilled);
        },
        [otpValue]
    );

    const handleInputChange = useCallback(
        (index: number, value: string) => {
            if (/[0-9]/.test(value) || value === "") {
                // ✅ حدث الـ input value الأول
                const targetInput = inputsRef.current[index];
                if (targetInput) {
                    targetInput.value = value;
                }

                updateOtpValue(index, value);

                // ✅ التنقل بين الـ inputs
                if (value && index < otpLength - 1) {
                    inputsRef.current[index + 1]?.focus();
                } else if (value === "" && index > 0) {
                    inputsRef.current[index - 1]?.focus();
                }
            }
        },
        [otpLength, updateOtpValue]
    );

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Backspace") {
                e.preventDefault();

                // ✅ لو الـ input فاضي ومش أول input، روح للي قبله
                if (otpValue[index] === "" && index > 0) {
                    inputsRef.current[index - 1]?.focus();
                }

                // ✅ امسح الـ input الحالي
                handleInputChange(index, "");
            }
        },
        [otpValue, handleInputChange]
    );

    // ✅ تحديث الـ otpFilled لما الـ otpValue يتغير
    useEffect(() => {
        const isFilled =
            otpValue.length === otpLength &&
            otpValue.split("").every((char) => char !== "");
        setOtpFilled(isFilled);
    }, [otpValue, otpLength]);

    return {
        inputsRef,
        otpValue,
        otpFilled,
        handleInputChange,
        handleKeyDown,
    };
};
