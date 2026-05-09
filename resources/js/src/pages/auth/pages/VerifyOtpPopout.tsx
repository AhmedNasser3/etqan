import React, { useRef } from "react";
import { useOtpTimer } from "../hooks/useOtpTimer";
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
    const { verified, error, loading, verifyOtp } = useOtpVerification();

    // ✅ إدارة الـ OTP محلياً لإصلاح bug المسح
    const [otp, setOtp] = React.useState<string[]>(["", "", "", ""]);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        // قبول رقم واحد فقط
        const digit = value.replace(/\D/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        // الانتقال للتالي عند الإدخال
        if (digit && index < 3) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const newOtp = [...otp];
            if (otp[index]) {
                // ✅ إذا فيه رقم في الخانة الحالية — امسحه فقط
                newOtp[index] = "";
                setOtp(newOtp);
            } else if (index > 0) {
                // ✅ إذا الخانة فاضية — انتقل للخانة السابقة وامسحها
                newOtp[index - 1] = "";
                setOtp(newOtp);
                inputsRef.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowRight" && index < 3) {
            inputsRef.current[index + 1]?.focus();
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const otpFilled = otp.every((d) => d !== "");
    const otpValue = otp.join("");

    const handleVerify = () => {
        if (!otpValue || otpValue.length !== 4) return;
        verifyOtp(otpValue, onSuccess);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');

                .vop-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,.5);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 999999; padding: 1rem;
                    animation: vop-bg-in .3s ease;
                    font-family: 'Tajawal', sans-serif;
                    direction: rtl;
                }
                @keyframes vop-bg-in { from { opacity: 0; } to { opacity: 1; } }

                .vop-modal {
                    background: #fff; border-radius: 28px;
                    width: 100%; max-width: 380px;
                    overflow: hidden;
                    animation: vop-modal-in .4s cubic-bezier(.16,1,.3,1);
                    box-shadow:
                        0 0 0 1px rgba(0,0,0,.06),
                        0 32px 64px rgba(0,0,0,.22),
                        0 8px 24px rgba(15,110,86,.12);
                    position: relative;
                }
                @keyframes vop-modal-in {
                    from { opacity: 0; transform: scale(.88) translateY(24px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                /* زر الإغلاق */
                .vop-close {
                    position: absolute; top: 14px; left: 14px;
                    width: 32px; height: 32px; border-radius: 50%;
                    background: rgba(255,255,255,.2);
                    border: 1px solid rgba(255,255,255,.25);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: white; z-index: 10;
                    transition: all .2s; font-size: 14px;
                }
                .vop-close:hover { background: rgba(255,255,255,.35); transform: scale(1.1); }

                /* الهيدر */
                .vop-head {
                    background: linear-gradient(150deg, #0F6E56 0%, #0d5c48 60%, #1a9e7a 100%);
                    padding: 2.25rem 2rem 2rem;
                    text-align: center; position: relative; overflow: hidden;
                }
                .vop-head::before {
                    content: ''; position: absolute; inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }
                .vop-shield-wrap {
                    width: 72px; height: 72px;
                    background: rgba(255,255,255,.12);
                    border: 2px solid rgba(255,255,255,.2);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1.1rem;
                    position: relative; z-index: 1;
                    animation: vop-pulse 2.5s ease infinite;
                }
                @keyframes vop-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,.2); }
                    50% { box-shadow: 0 0 0 12px rgba(255,255,255,.0); }
                }
                .vop-shield-inner {
                    width: 52px; height: 52px;
                    background: rgba(255,255,255,.15);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                }
                .vop-head h2 { color: #fff; font-size: 1.2rem; font-weight: 900; margin-bottom: 6px; position: relative; z-index: 1; }
                .vop-head p { color: rgba(255,255,255,.75); font-size: .82rem; position: relative; z-index: 1; line-height: 1.5; }

                /* البودي */
                .vop-body { padding: 1.75rem 1.75rem 1.5rem; }

                /* حقول OTP */
                .vop-otp-row {
                    display: flex; gap: 10px; justify-content: center;
                    margin-bottom: 1.25rem; direction: ltr;
                }
                .vop-otp-digit {
                    width: 60px; height: 66px;
                    border: 2px solid #e5e7eb; border-radius: 16px;
                    text-align: center; font-size: 1.75rem; font-weight: 900;
                    font-family: 'Tajawal', sans-serif;
                    outline: none; background: #fafbfa; color: #0a1a14;
                    transition: all .2s cubic-bezier(.34,1.56,.64,1);
                    caret-color: transparent;
                }
                .vop-otp-digit:focus {
                    border-color: #0F6E56; background: #fff;
                    box-shadow: 0 0 0 4px rgba(15,110,86,.12);
                    transform: scale(1.06) translateY(-2px);
                }
                .vop-otp-digit.has-value {
                    border-color: #0F6E56; background: #f0faf6; color: #0F6E56;
                }
                .vop-otp-digit.err-state {
                    border-color: #ef4444; background: #fff5f5; color: #ef4444;
                    animation: vop-shake .45s ease;
                }
                @keyframes vop-shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-7px); }
                    40% { transform: translateX(7px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
                }

                .vop-err-msg {
                    text-align: center; font-size: .8rem; color: #dc2626;
                    padding: 9px 12px; background: #fff5f5;
                    border: 1px solid #fecaca; border-radius: 10px;
                    margin-bottom: 1rem;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                }

                /* الزر الرئيسي */
                .vop-btn {
                    width: 100%; padding: 13px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #0F6E56, #1a9e7a);
                    color: #fff; border: none;
                    font-size: .95rem; font-weight: 700;
                    font-family: 'Tajawal', sans-serif;
                    cursor: pointer;
                    transition: transform .15s, box-shadow .15s;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    box-shadow: 0 4px 16px rgba(15,110,86,.3);
                    position: relative; overflow: hidden;
                }
                .vop-btn::before {
                    content: ''; position: absolute; inset: 0;
                    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,.12));
                }
                .vop-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,110,86,.35); }
                .vop-btn:disabled { opacity: .45; cursor: not-allowed; }

                .vop-spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
                    border-radius: 50%; animation: vop-spin .7s linear infinite;
                }
                @keyframes vop-spin { to { transform: rotate(360deg); } }

                .vop-resend-row {
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    font-size: .8rem; color: #9ca3af; margin-top: 1rem;
                }
                .vop-resend-btn {
                    color: #0F6E56; font-weight: 700;
                    border: none; background: none; cursor: pointer;
                    font-family: inherit; font-size: inherit; padding: 0;
                }
                .vop-resend-btn:disabled { opacity: .4; cursor: not-allowed; color: #9ca3af; }

                .vop-ghost-btn {
                    display: block; width: 100%; text-align: center;
                    padding: 9px;
                    border: 1.5px solid #e5e7eb; border-radius: 10px;
                    background: transparent; color: #6b7280;
                    font-size: .82rem; font-family: 'Tajawal', sans-serif;
                    cursor: pointer; margin-top: .75rem;
                    transition: all .2s;
                }
                .vop-ghost-btn:hover { border-color: #0F6E56; color: #0F6E56; background: #f0faf6; }

                .vop-success-wrap {
                    text-align: center; padding: .5rem 0 1rem;
                }
                .vop-success-icon {
                    width: 56px; height: 56px;
                    background: #f0faf6; border: 2px solid #bbf7d0;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto .75rem;
                    animation: vop-pop .4s cubic-bezier(.34,1.56,.64,1);
                }
                @keyframes vop-pop { from { transform: scale(0); } to { transform: scale(1); } }
                .vop-success-msg { font-size: .9rem; font-weight: 700; color: #0F6E56; }
            `}</style>

            <div className="vop-overlay">
                <div className="vop-modal">
                    <button className="vop-close" onClick={onClose}>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <div className="vop-head">
                        <div className="vop-shield-wrap">
                            <div className="vop-shield-inner">
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                >
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    {verified && (
                                        <polyline points="9 12 11 14 15 10" />
                                    )}
                                </svg>
                            </div>
                        </div>
                        <h2>التحقق من الهوية</h2>
                        <p>
                            أدخل الرمز المكون من 4 أرقام
                            <br />
                            الذي أرسلناه إلى بريدك الإلكتروني
                        </p>
                    </div>

                    <div className="vop-body">
                        {verified ? (
                            <div className="vop-success-wrap">
                                <div className="vop-success-icon">
                                    <svg
                                        width="26"
                                        height="26"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#0F6E56"
                                        strokeWidth="2.5"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div className="vop-success-msg">
                                    تم التحقق بنجاح
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="vop-otp-row">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) =>
                                                (inputsRef.current[index] = el)
                                            }
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleKeyDown(index, e)
                                            }
                                            onPaste={(e) => e.preventDefault()}
                                            className={`vop-otp-digit${error ? " err-state" : ""}${digit ? " has-value" : ""}`}
                                            autoComplete={
                                                index === 0
                                                    ? "one-time-code"
                                                    : "off"
                                            }
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="vop-err-msg">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <line
                                                x1="12"
                                                y1="8"
                                                x2="12"
                                                y2="12"
                                            />
                                            <line
                                                x1="12"
                                                y1="16"
                                                x2="12.01"
                                                y2="16"
                                            />
                                        </svg>
                                        الرمز غير صحيح، حاول مرة أخرى
                                    </div>
                                )}

                                <button
                                    className="vop-btn"
                                    onClick={handleVerify}
                                    disabled={loading || !otpFilled}
                                >
                                    {loading ? (
                                        <>
                                            <span className="vop-spinner" />{" "}
                                            جاري التحقق...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                <polyline points="9 12 11 14 15 10" />
                                            </svg>
                                            تأكيد الرمز
                                        </>
                                    )}
                                </button>

                                <div className="vop-resend-row">
                                    <span>لم يصلك الرمز؟</span>
                                    <button
                                        className="vop-resend-btn"
                                        onClick={resendCode}
                                        disabled={isTimerActive}
                                    >
                                        {isTimerActive
                                            ? `إرسال مرة أخرى (${timer}ث)`
                                            : "إرسال مرة أخرى"}
                                    </button>
                                </div>

                                <button
                                    className="vop-ghost-btn"
                                    onClick={onClose}
                                >
                                    العودة وتغيير البريد الإلكتروني
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyOtpPopout;
