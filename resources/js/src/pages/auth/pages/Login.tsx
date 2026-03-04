// pages/auth/Login.tsx - مُصحح مع دعم Multi-Tenant كامل (login مع slug)
import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useOtpVerification } from "../hooks/useOtpVerification";
import VerifyOtpPopout from "./VerifyOtpPopout";
import ModalNotification from "../../../../components/ModalNotification";

const Login: React.FC = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [email, setEmail] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    // جلب centerSlug من الـ URL parameters والـ pathname
    const { centerSlug: paramSlug } = useParams<{ centerSlug?: string }>();
    const location = useLocation();

    // استخراج centerSlug من أي مكان في الـ URL
    const getCenterSlug = () => {
        const pathParts = location.pathname.split("/").filter(Boolean);

        // البحث عن centerSlug في أي مكان قبل login
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (pathParts[i + 1] === "login") {
                return pathParts[i]; // center-slug قبل login
            }
        }

        // أو من useParams
        return paramSlug || null;
    };

    const centerSlug = getCenterSlug();

    const { verified, loading, sendOtp, modal, closeModal } =
        useOtpVerification();

    const handleOpenPopup = async () => {
        if (!email || email.trim().length < 5) {
            alert("البريد الإلكتروني غير صالح.");
            return;
        }

        // تمرير centerSlug للـ Backend
        await sendOtp(email, centerSlug);
        setShowPopup(true);
    };

    const handleVerificationSuccess = () => {
        setIsVerified(true);
        setShowPopup(false);
        window.location.href = "/";
    };

    // بناء الروابط الثلاثة مع الـ centerSlug
    const getRegisterLink = () =>
        centerSlug ? `/register/${centerSlug}` : "/center-register";
    const getTeacherRegisterLink = () =>
        centerSlug ? `/${centerSlug}/teacher-register` : "/center-register";
    const getCenterRegisterLink = () => "/center-register"; // ثابتة

    return (
        <>
            <div className="auth">
                <div className="auth__inner">
                    <div className="auth__container">
                        <div className="auth__content">
                            <div
                                className="auth__form"
                                style={{ height: "100%" }}
                            >
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
                                                                    e.target
                                                                        .value,
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
                                                        onClick={
                                                            handleOpenPopup
                                                        }
                                                        disabled={
                                                            email.length ===
                                                                0 ||
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
                                                        className={`login-btn ${isVerified ? "login-btn-active" : ""}`}
                                                        onClick={() => {
                                                            if (!isVerified)
                                                                return;
                                                            handleVerificationSuccess();
                                                        }}
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

                                        {/* الروابط حسب وجود الـ centerSlug */}
                                        <div className="inputs__verifyOTPtimer">
                                            {centerSlug ? (
                                                <div
                                                    style={{ display: "grid" }}
                                                >
                                                    <a href={getRegisterLink()}>
                                                        <span className="resend-link">
                                                            انشيئ حساب طالب
                                                        </span>
                                                    </a>
                                                    <a
                                                        href={getTeacherRegisterLink()}
                                                    >
                                                        <span className="resend-link">
                                                            إنشاء حساب معلم
                                                        </span>
                                                    </a>
                                                </div>
                                            ) : (
                                                <a
                                                    href={getCenterRegisterLink()}
                                                >
                                                    <span className="resend-link">
                                                        إنشاء حساب مجمع
                                                    </span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="auth__bg"
                                style={{ height: "90vh" }}
                            >
                                <div className="auth__bgContainer">
                                    <div className="auth__bgData">
                                        <h1>تسجيل دخول</h1>
                                        <p>
                                            بالقرآن نحيا (منصة سراج لتسهيل حفظ
                                            القرآن)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ModalNotification
                show={modal.show}
                title={modal.title}
                message={modal.message}
                onClose={closeModal}
            />
        </>
    );
};

export default Login;
