import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useOtpTimer } from "../hooks/useOtpTimer";
import { useOtpInputs } from "../hooks/useOtpInputs";
import { useOtpVerification } from "../hooks/useOtpVerification";
import ModalNotification from "../../../../components/ModalNotification";
import logo from "../../../assets/images/logo.png";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [codeError, setCodeError] = useState(false);

    const { timer, resendCode, isTimerActive } = useOtpTimer();
    const { inputsRef, otpValue, otpFilled, handleInputChange, handleKeyDown } =
        useOtpInputs();
    const { loading, sendOtp, verifyOtp, modal, closeModal } =
        useOtpVerification();

    const { centerSlug: paramSlug } = useParams<{ centerSlug?: string }>();
    const location = useLocation();

    const getCenterSlug = () => {
        const pathParts = location.pathname.split("/").filter(Boolean);
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (pathParts[i + 1] === "login") return pathParts[i];
        }
        return paramSlug || null;
    };

    const centerSlug = getCenterSlug();

    const handleSendOtp = async () => {
        if (!email || email.trim().length < 5) {
            alert("البريد الإلكتروني غير صالح.");
            return;
        }
        await sendOtp(email, centerSlug);
        setShowOtp(true);
        setCodeError(false);
    };

    const handleVerifyCode = () => {
        const code = Array.isArray(otpValue)
            ? otpValue.join("")
            : String(otpValue);
        if (!code || code.length !== 4) {
            setCodeError(true);
            return;
        }
        verifyOtp(code, () => {
            window.location.href = "/";
        });
    };

    const getRegisterLink = () =>
        centerSlug ? `/register/${centerSlug}` : "/center-register";
    const getTeacherRegisterLink = () =>
        centerSlug ? `/${centerSlug}/teacher-register` : "/center-register";
    const getCenterRegisterLink = () => "/center-register";

    return (
        <>
            <style>{`
                /* ── Register cards ── */
                .reg-section {
                    margin-top: 28px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .reg-divider {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 4px;
                }
                .reg-divider::before,
                .reg-divider::after {
                    content: "";
                    flex: 1;
                    height: 1px;
                    background: rgba(0,0,0,.1);
                }
                .reg-divider span {
                    font-size: .75rem;
                    color: #9CA3AF;
                    white-space: nowrap;
                }

                .reg-cards {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .reg-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px;
                    border-radius: 14px;
                    border: 1.5px solid transparent;
                    cursor: pointer;
                    text-decoration: none;
                    transition: transform .15s, box-shadow .15s, border-color .15s, background .15s;
                    position: relative;
                    overflow: hidden;
                }
                .reg-card::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transition: opacity .2s;
                }
                .reg-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.1); }
                .reg-card:hover::before { opacity: 1; }
                .reg-card:active { transform: translateY(0); }

                /* Teacher card — emerald */
                .reg-card.teacher {
                    background: linear-gradient(135deg, #E1F5EE 0%, #F0FAF6 100%);
                    border-color: rgba(15,110,86,.25);
                }
                .reg-card.teacher::before {
                    background: linear-gradient(135deg, rgba(29,158,117,.12) 0%, transparent 100%);
                }
                .reg-card.teacher:hover { border-color: rgba(15,110,86,.5); }

                /* Student card — gold/amber */
                .reg-card.student {
                    background: linear-gradient(135deg, #FAEEDA 0%, #FEF9F0 100%);
                    border-color: rgba(186,117,23,.25);
                }
                .reg-card.student::before {
                    background: linear-gradient(135deg, rgba(239,159,39,.12) 0%, transparent 100%);
                }
                .reg-card.student:hover { border-color: rgba(186,117,23,.5); }

                .reg-card-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-size: 17px;
                    position: relative;
                    z-index: 1;
                }
                .teacher .reg-card-icon { background: rgba(15,110,86,.12); }
                .student .reg-card-icon { background: rgba(186,117,23,.12); }

                .reg-card-text {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    position: relative;
                    z-index: 1;
                    text-align: right;
                }
                .reg-card-title {
                    font-size: .82rem;
                    font-weight: 600;
                    line-height: 1.2;
                }
                .teacher .reg-card-title { color: #085041; }
                .student .reg-card-title { color: #7C4A0A; }

                .reg-card-sub {
                    font-size: .7rem;
                    line-height: 1.3;
                }
                .teacher .reg-card-sub { color: #0F6E56; opacity: .75; }
                .student .reg-card-sub { color: #854F0B; opacity: .75; }

                .reg-card-arrow {
                    margin-right: auto;
                    font-size: .75rem;
                    opacity: .45;
                    position: relative;
                    z-index: 1;
                    transition: opacity .15s, transform .15s;
                }
                .reg-card:hover .reg-card-arrow { opacity: .85; transform: translateX(-3px); }
                .teacher .reg-card-arrow { color: #0F6E56; }
                .student .reg-card-arrow { color: #BA7517; }
            `}</style>

            <div className="auth-root" dir="rtl">
                <div>
                    <div className="auth-bg-deco" />

                    <div className="auth-card" key="login">
                        {/* BRAND */}
                        <div className="brand-row">
                            <div>
                                <img
                                    style={{ width: "60px" }}
                                    src={logo}
                                    alt=""
                                />
                            </div>
                        </div>

                        {!showOtp && (
                            <>
                                <div className="auth-heading">
                                    <h1>مرحباً بك</h1>
                                    <p>أدخل بريدك الإلكتروني لتسجيل الدخول</p>
                                </div>

                                <div className="form-stack">
                                    <div className="form-group">
                                        <label
                                            className="form-label"
                                            style={{ marginBottom: "6px" }}
                                        >
                                            البريد الإلكتروني
                                        </label>
                                        <div className="input-box">
                                            <input
                                                type="email"
                                                placeholder="parent@example.com"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                className="bare-input"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="btn-primary"
                                        onClick={handleSendOtp}
                                        disabled={
                                            !email ||
                                            email.length === 0 ||
                                            loading
                                        }
                                    >
                                        {loading
                                            ? "جاري الإرسال..."
                                            : "إرسال رمز التحقق"}
                                    </button>

                                    {/* ── Register section ── */}
                                    <div className="reg-section">
                                        <div className="reg-divider">
                                            <span>ليس لديك حساب؟ سجّل كـ</span>
                                        </div>

                                        <div className="reg-cards">
                                            {/* Teacher */}
                                            <a
                                                href={getTeacherRegisterLink()}
                                                className="reg-card teacher"
                                            >
                                                <div className="reg-card-icon">
                                                    🎓
                                                </div>
                                                <div className="reg-card-text">
                                                    <span className="reg-card-title">
                                                        معلم
                                                    </span>
                                                    <span className="reg-card-sub">
                                                        انضم كمعلم قرآن
                                                    </span>
                                                </div>
                                                <span className="reg-card-arrow">
                                                    ←
                                                </span>
                                            </a>

                                            {/* Student */}
                                            <a
                                                href={getRegisterLink()}
                                                className="reg-card student"
                                            >
                                                <div className="reg-card-icon">
                                                    📖
                                                </div>
                                                <div className="reg-card-text">
                                                    <span className="reg-card-title">
                                                        طالب
                                                    </span>
                                                    <span className="reg-card-sub">
                                                        سجّل كطالب جديد
                                                    </span>
                                                </div>
                                                <span className="reg-card-arrow">
                                                    ←
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* OTP popup */}
                        {showOtp && (
                            <div className="otp-popup-overlay">
                                <div className="otp-popup-container">
                                    <div className="auth-heading">
                                        <div className="otp-shield" />
                                        <h1>رمز التحقق</h1>
                                        <p>
                                            أرسلنا رمزاً من 4 أرقام إلى
                                            <br />
                                            <strong dir="ltr">{email}</strong>
                                        </p>
                                    </div>

                                    <div className="form-stack">
                                        <div
                                            className={`otp-grid ${codeError ? "err" : ""}`}
                                        >
                                            {Array.from(
                                                { length: 4 },
                                                (_, index) => (
                                                    <input
                                                        key={index}
                                                        ref={(el) =>
                                                            (inputsRef.current[
                                                                index
                                                            ] = el)
                                                        }
                                                        type="text"
                                                        maxLength={1}
                                                        value={
                                                            otpValue[index] ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                index,
                                                                e.target.value.slice(
                                                                    -1,
                                                                ),
                                                            )
                                                        }
                                                        onKeyDown={(e) =>
                                                            handleKeyDown(
                                                                index,
                                                                e,
                                                            )
                                                        }
                                                        onPaste={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        onCopy={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        onCut={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        onContextMenu={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        onDragStart={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        onDrop={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        spellCheck="false"
                                                        autoComplete="one-time-code"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        className="otp-input"
                                                    />
                                                ),
                                            )}
                                        </div>

                                        {codeError && (
                                            <div className="otp-err-msg">
                                                الرمز غير صحيح، حاول مرة أخرى
                                            </div>
                                        )}

                                        <button
                                            className="btn-primary"
                                            onClick={handleVerifyCode}
                                            disabled={loading || !otpFilled}
                                        >
                                            {loading
                                                ? "جاري التحقق..."
                                                : "تسجيل الدخول"}
                                        </button>

                                        <div className="resend-row">
                                            <span>لم يصلك الرمز؟</span>
                                            <button
                                                className={`resend-btn${isTimerActive ? " disabled" : ""}`}
                                                onClick={resendCode}
                                                disabled={isTimerActive}
                                            >
                                                {isTimerActive
                                                    ? `إرسال مرة أخرى (${timer}ث)`
                                                    : "إرسال مرة أخرى"}
                                            </button>
                                        </div>

                                        <button
                                            className="ghost-btn"
                                            onClick={() => {
                                                setShowOtp(false);
                                                setCodeError(false);
                                            }}
                                        >
                                            ← تغيير البريد الإلكتروني
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ModalNotification
                            show={modal.show}
                            title={modal.title}
                            message={modal.message}
                            onClose={closeModal}
                        />
                    </div>

                    <div className="auth-footer-strip">
                        <span>منصة إتقان لتسهيل حفظ القرآن</span>
                        <span className="dot" />
                        <span>بالقرآن نحيا</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
