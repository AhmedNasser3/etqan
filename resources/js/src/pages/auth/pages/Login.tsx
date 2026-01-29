import React, { useState } from "react";
import EmailForm from "../components/EmailForm";
import Men from "../../../assets/images/facelessAvatar.png";
import Woman from "../../../assets/images/facelessAvatarWoman.png";
import { useOtpVerification } from "../hooks/useOtpVerification";
import VerifyOtpPopout from "./verifyOtpPopout";

const Login: React.FC = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [email, setEmail] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    const { verified, loading, sendOtp, verifyOtp } = useOtpVerification(email);

    const handleOpenPopup = async () => {
        await sendOtp(email);
        setShowPopup(true);
    };

    const handleVerificationSuccess = () => {
        setIsVerified(true);
        setShowPopup(false);
        window.location.href = "/";
    };

    return (
        <div className="auth">
            <div className="auth__inner">
                <div className="auth__container">
                    <div className="auth__content">
                        <div className="auth__form" style={{ height: "100%" }}>
                            <div className="auth__formContainer">
                                <div className="auth__formContent">
                                    <div className="auth__formImg">
                                        <img
                                            src="https://quranlives.com/wp-content/uploads/2023/12/logonew3.png"
                                            alt="لوجو"
                                        />
                                    </div>
                                    <div className="inputs">
                                        <div className="inputs__inner">
                                            <div className="inputs__container">
                                                <div className="inputs__email">
                                                    <label>
                                                        بريدك الإلكتروني *
                                                    </label>
                                                    <input
                                                        required
                                                        type="email"
                                                        name="guardian_email"
                                                        id="guardian_email"
                                                        placeholder="parent@example.com"
                                                        value={email}
                                                        onChange={(e) =>
                                                            setEmail(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="inputs__verifyOTPBtn">
                                                <button
                                                    className={`open-popup ${
                                                        email.length > 0 &&
                                                        !isVerified
                                                            ? "sms-btn-active"
                                                            : ""
                                                    }`}
                                                    onClick={handleOpenPopup}
                                                    disabled={
                                                        email.length === 0 ||
                                                        loading ||
                                                        isVerified
                                                    }
                                                >
                                                    {loading
                                                        ? "جاري الإرسال..."
                                                        : "إرسال OTP للبريد الإلكتروني"}
                                                </button>
                                            </div>
                                            <div
                                                className="inputs__submitBtn"
                                                id="inputs__submitBtn"
                                            >
                                                <button
                                                    disabled={!isVerified}
                                                    className={`login-btn ${
                                                        isVerified
                                                            ? "login-btn-active"
                                                            : ""
                                                    }`}
                                                >
                                                    تسجيل الدخول
                                                </button>
                                            </div>
                                            {showPopup && (
                                                <VerifyOtpPopout
                                                    onClose={() =>
                                                        setShowPopup(false)
                                                    }
                                                    onSuccess={
                                                        handleVerificationSuccess
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className="inputs__verifyOTPtimer"
                                        id="verifyPopout__verifyOTPtimer"
                                    >
                                        <a href="/register">
                                            <span className="resend-link">
                                                ليس لديك حساب؟
                                            </span>
                                        </a>
                                    </div>
                                    <div
                                        className="inputs__verifyOTPtimer"
                                        id="verifyPopout__verifyOTPtimer"
                                    >
                                        <a href="/teacher-register">
                                            <span className="resend-link">
                                                انشاء حساب معلم
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="auth__bg" style={{ height: "90vh" }}>
                            <div className="auth__bgContainer">
                                <div className="auth__bgData">
                                    <h1>تسجيل دخول</h1>
                                    <p>
                                        بالقرأن نحيا (منصة اتقان لتسهيل حفظ
                                        القرأن)
                                    </p>
                                </div>
                                <div className="auth__bgImg">
                                    <img src={Men} alt={"رجل"} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
