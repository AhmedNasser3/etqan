import React, { useState } from "react";
import VerifyOtpPopout from "./verifyOtpPopout";
import { useOtpVerification } from "../hooks/useOtpVerification";

const VerifyOtp: React.FC = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    const { verified } = useOtpVerification();

    const handleOpenPopup = () => {
        setShowPopup(true);
    };

    const handleVerificationSuccess = () => {
        setIsVerified(true);
        setShowPopup(false);
    };

    return (
        <div className="auth-page">
            <div className="inputs__select">
                <select name="" id="">
                    <option value="">966+</option>
                    <option value="">20+</option>
                    <option value="">12+</option>
                </select>
                <div className="inputs__verifyOTP">
                    <label>
                        رقم الجوال <span>(سيتم التحقق منه)</span>
                    </label>
                    <input
                        type="text"
                        name="verifyOTP"
                        id="verifyOTP"
                        placeholder="512 *** *** ***"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        maxLength={11}
                    />
                </div>
            </div>
            <div className="inputs__verifyOTPBtn">
                <button
                    className={`open-popup ${
                        isVerified ? "sms-btn-active" : ""
                    }`}
                    onClick={handleOpenPopup}
                    disabled={phoneNumber.length < 9 || isVerified}
                >
                    (sms) {isVerified ? "تم التحقق" : "التحقق عبر رسالة"}
                </button>
            </div>
            <div className="inputs__submitBtn" id="inputs__submitBtn">
                <button
                    disabled={!isVerified}
                    className={`login-btn ${
                        isVerified ? "login-btn-active" : ""
                    }`}
                >
                    تسجيل الدخول
                </button>
            </div>
            {showPopup && (
                <VerifyOtpPopout
                    onClose={() => setShowPopup(false)}
                    onSuccess={handleVerificationSuccess}
                />
            )}
        </div>
    );
};

export default VerifyOtp;
