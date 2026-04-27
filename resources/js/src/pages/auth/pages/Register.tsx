import React, { useState } from "react";
import EmailForm from "../components/EmailForm";
import Men from "../../../assets/images/facelessAvatar.png";
import Woman from "../../../assets/images/facelessAvatarWoman.png";
import logo from "../../../assets/images/logo.png";

const Register: React.FC = () => {
    const [selectedGender, setSelectedGender] = useState<"male" | "female">(
        "male",
    );

    // FIELD COMPONENTS
    function FG({
        label,
        req,
        opt,
        hint,
        error,
        children,
    }: {
        label: string;
        req?: boolean;
        opt?: boolean;
        hint?: string;
        error?: string;
        children: React.ReactNode;
    }) {
        return (
            <div className="field-wrap">
                <label className="field-label">
                    {label}
                    {req && <span className="req"> *</span>}
                    {opt && <span className="opt-tag">اختياري</span>}
                </label>
                {children}
                {hint && <div className="field-hint">{hint}</div>}
                {error && <div className="field-err-msg">{error}</div>}
            </div>
        );
    }

    return (
        <div className="auth">
            <div className="auth__inner">
                <div className="auth__container">
                    <div className="auth__content">
                        <div className="auth__form">
                            <div className="auth__formContainer">
                                <div
                                    className="auth-root"
                                    dir="rtl"
                                    style={{
                                        background: "#fff",
                                        marginTop: "64px",
                                    }}
                                >
                                    <div className="auth-root-register-form">
                                        <div className="auth-bg-deco" />

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

                                        {/* FORM STEP */}
                                        <div className="auth-heading">
                                            <h1>طلب تسجيل طالب</h1>
                                            <p>
                                                أكمل البيانات التالية وسيتم
                                                مراجعة طلبك من قِبل المشرف
                                            </p>
                                        </div>

                                        <div className="form-stack">
                                            {/* GENDER */}
                                            <div className="gender-row">
                                                {[
                                                    {
                                                        v: "male" as const,
                                                        l: "ذكر",
                                                        img: Men,
                                                    },
                                                    {
                                                        v: "female" as const,
                                                        l: "أنثى",
                                                        img: Woman,
                                                    },
                                                ].map((g) => (
                                                    <button
                                                        key={g.v}
                                                        className={`gender-btn${selectedGender === g.v ? " active" : ""}`}
                                                        onClick={() =>
                                                            setSelectedGender(
                                                                g.v,
                                                            )
                                                        }
                                                    >
                                                        <span className="g-svg">
                                                            <img
                                                                src={g.img}
                                                                alt={g.l}
                                                                width={40}
                                                                height={40}
                                                            />
                                                        </span>
                                                        {g.l}
                                                        {selectedGender ===
                                                            g.v && (
                                                            <span className="g-check">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* EmailForm بدل الـ form */}
                                            <EmailForm
                                                gender={selectedGender}
                                            />

                                            <div className="switch-row">
                                                <span>لديك حساب بالفعل؟</span>
                                                <a
                                                    href="/login"
                                                    className="link-btn"
                                                >
                                                    تسجيل دخول
                                                </a>
                                            </div>
                                        </div>

                                        <div className="auth-footer-strip">
                                            <span>
                                                منصة إتقان لتسهيل حفظ القرآن
                                            </span>
                                            <span className="dot" />
                                            <span>بالقرآن نحيا</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
