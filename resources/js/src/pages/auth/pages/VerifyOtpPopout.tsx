import React from "react";
import { XIcon } from "../../../../components/XIcon";
import { ShieldCheckIcon } from "../../../../components/ShieldCheckIcon";
import { useOtpTimer } from "../hooks/useOtpTimer";
import { useOtpInputs } from "../hooks/useOtpInputs";
import { useOtpVerification } from "../hooks/useOtpVerification";

interface VerifyOtpPopoutProps {
    onClose: () => void;
    onSuccess?: () => void;
}

const VerifyOtpPopout: React.FC<VerifyOtpPopoutProps> = ({
    onClose,
    onSuccess,
}) => {
    const { timer, resendCode, isTimerActive } = useOtpTimer();
    const { inputsRef, otpValue, otpFilled, handleInputChange, handleKeyDown } =
        useOtpInputs();
    const { verified, error, loading, verifyOtp } = useOtpVerification();

    const handleVerify = () => {
        const otpString = Array.isArray(otpValue)
            ? otpValue.join("")
            : String(otpValue);
        verifyOtp(otpString, onSuccess);
    };

    return (
        <div className="verifyPopout visible">
            <div className="verifyPopout__inner">
                <div className="verifyPopout__container">
                    <div className="verifyPopout__exit">
                        <i onClick={onClose}>
                            <XIcon />
                        </i>
                    </div>
                </div>
                <div className="verifyPopout__content">
                    <div className="verifyPopout__data">
                        <div className="verifyPopout__header">
                            <i
                                className={verified ? "verified" : ""}
                                title="حماية البيانات محمية"
                            >
                                <ShieldCheckIcon />
                            </i>
                            <h1>التحقق من البريد الإلكتروني</h1>
                            <p>
                                ادخل الرمز الذي ظهر في الرسالة أعلاه (4 أرقام)
                            </p>
                        </div>

                        <div
                            className={`verifyPopout__OTP ${
                                error ? "error" : ""
                            }`}
                        >
                            {Array.from({ length: 4 }, (_, index) => (
                                <input
                                    key={index}
                                    ref={(el) =>
                                        (inputsRef.current[index] = el)
                                    }
                                    type="text"
                                    maxLength={1}
                                    value={otpValue[index] || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            index,
                                            e.target.value.slice(-1),
                                        )
                                    }
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={(e) => e.preventDefault()}
                                    onCopy={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    onContextMenu={(e) => e.preventDefault()}
                                    onDragStart={(e) => e.preventDefault()}
                                    onDrop={(e) => e.preventDefault()}
                                    spellCheck="false"
                                    style={{
                                        textAlign: "center",
                                        userSelect: "none",
                                        WebkitUserSelect: "none",
                                        MozUserSelect: "none",
                                        msUserSelect: "none",
                                    }}
                                    autoComplete="off"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className={verified ? "verified" : ""}
                                />
                            ))}
                        </div>

                        <div
                            className="inputs__verifyOTPtimer"
                            id="verifyPopout__verifyOTPtimer"
                        >
                            {isTimerActive ? (
                                <p>
                                    {timer} ث <span>اعد ارسال الكود؟</span>
                                </p>
                            ) : (
                                <span
                                    className="resend-link"
                                    onClick={resendCode}
                                >
                                    اعد ارسال الكود؟
                                </span>
                            )}
                        </div>

                        <div className="verifyPopout__submitBtnVerfiry">
                            <button
                                onClick={handleVerify}
                                disabled={loading || !otpFilled}
                            >
                                {loading
                                    ? "جاري التحقق..."
                                    : verified
                                      ? "تم التحقق"
                                      : "التحقق"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtpPopout;
