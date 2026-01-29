// TeacherRegister.tsx
import React, { useState } from "react";
import { useTeacherRegister } from "../hooks/useTeacherRegister";
import Men from "../../../assets/images/facelessAvatar.png";
import Woman from "../../../assets/images/facelessAvatarWoman.png";

const TeacherRegister: React.FC = () => {
    const [selectedGender, setSelectedGender] = useState<"male" | "female">(
        "male",
    );
    const {
        data,
        loading,
        success,
        error,
        handleInputChange,
        setGender,
        submitRegister,
    } = useTeacherRegister();

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleInputChange("role", e.target.value);
    };

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleInputChange("session_time", e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setGender(selectedGender);
        submitRegister();
    };

    return (
        <div className="auth">
            <div className="auth__inner">
                <div className="auth__container">
                    <div className="auth__content">
                        <div className="auth__form">
                            <form onSubmit={handleSubmit}>
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
                                                    <div className="inputs__name">
                                                        <div className="inputs__Firstname">
                                                            <label>
                                                                الاسم رباعي
                                                            </label>
                                                            <input
                                                                required
                                                                type="text"
                                                                name="full_name"
                                                                value={
                                                                    data.full_name
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        "full_name",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder={`... ${selectedGender === "male" ? "أحمد محمد علي أحمد" : "فاطمة محمد علي فاطمة"}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="inputs__verifyOTPBirth">
                                                        <div className="inputs__verifyOTP">
                                                            <label>
                                                                الدور المطلوب
                                                            </label>
                                                            <select
                                                                name="role"
                                                                value={
                                                                    data.role
                                                                }
                                                                onChange={
                                                                    handleRoleChange
                                                                }
                                                            >
                                                                <option value="">
                                                                    اختر الدور
                                                                </option>
                                                                <option value="teacher">
                                                                    معلم
                                                                </option>
                                                                <option value="supervisor">
                                                                    مشرف تعليمي
                                                                </option>
                                                                <option value="motivator">
                                                                    مشرف تحفيز
                                                                </option>
                                                                <option value="student_affairs">
                                                                    شؤون الطلاب
                                                                </option>
                                                                <option value="financial">
                                                                    مشرف مالي
                                                                </option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {data.role ===
                                                        "teacher" && (
                                                        <div className="inputs__verifyOTPBirth">
                                                            <div className="inputs__verifyOTP">
                                                                <label>
                                                                    الحلقات
                                                                    المتاحة
                                                                </label>
                                                                <select
                                                                    name="session_time"
                                                                    value={
                                                                        data.session_time
                                                                    }
                                                                    onChange={
                                                                        handleSessionChange
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        اختر
                                                                        الوقت
                                                                    </option>
                                                                    <option value="asr">
                                                                        حلقة
                                                                        العصر (5
                                                                        أماكن
                                                                        شاغرة)
                                                                    </option>
                                                                    <option value="maghrib">
                                                                        حلقة
                                                                        المغرب
                                                                        (3 أماكن
                                                                        شاغرة)
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="inputs__verifyOTPBirth">
                                                        <div className="inputs__email">
                                                            <label>
                                                                بريدك الإلكتروني
                                                                *
                                                            </label>
                                                            <input
                                                                required
                                                                type="email"
                                                                name="email"
                                                                value={
                                                                    data.email
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        "email",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="teacher@example.com"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="inputs__verifyOTP">
                                                        <label>
                                                            ملاحظات/خبرات
                                                        </label>
                                                        <textarea
                                                            name="notes"
                                                            rows={3}
                                                            value={data.notes}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    "notes",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="خبرتك التعليمية، المؤهلات، أو أي ملاحظات..."
                                                            maxLength={1000}
                                                        />
                                                    </div>

                                                    {error && (
                                                        <div
                                                            className="error-message"
                                                            style={{
                                                                color: "#ef4444",
                                                                background:
                                                                    "#fef2f2",
                                                                padding: "12px",
                                                                borderRadius:
                                                                    "8px",
                                                                border: "1px solid #fecaca",
                                                                marginBottom:
                                                                    "16px",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            ❌ {error}
                                                        </div>
                                                    )}

                                                    {success && (
                                                        <div
                                                            className="success-message"
                                                            style={{
                                                                color: "#10b981",
                                                                background:
                                                                    "#f0fdf4",
                                                                padding: "12px",
                                                                borderRadius:
                                                                    "8px",
                                                                border: "1px solid #bbf7d0",
                                                                marginBottom:
                                                                    "16px",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            ✅ تم إرسال طلب
                                                            التسجيل بنجاح!
                                                        </div>
                                                    )}

                                                    <div className="inputs__submitBtn">
                                                        <button
                                                            type="submit"
                                                            disabled={
                                                                loading ||
                                                                !data.full_name ||
                                                                !data.email ||
                                                                !data.role
                                                            }
                                                            style={{
                                                                opacity:
                                                                    loading ||
                                                                    !data.full_name ||
                                                                    !data.email ||
                                                                    !data.role
                                                                        ? 0.6
                                                                        : 1,
                                                                cursor:
                                                                    loading ||
                                                                    !data.full_name ||
                                                                    !data.email ||
                                                                    !data.role
                                                                        ? "not-allowed"
                                                                        : "pointer",
                                                            }}
                                                        >
                                                            {loading
                                                                ? "⏳ جاري الإرسال..."
                                                                : "إرسال طلب التسجيل"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="inputs__verifyOTPtimer"
                                            id="verifyPopout__verifyOTPtimer"
                                        >
                                            <a href="/login">
                                                <span className="resend-link">
                                                    لديك حساب بالفعل؟
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Background Section */}
                        <div className="auth__bg">
                            <div className="auth__bgContainer">
                                <div className="auth__bgData">
                                    <h1>تسجيل معلم</h1>
                                    <p>
                                        بالقرآن نحيا (منصة اتقان لتسهيل حفظ
                                        القرآن)
                                    </p>
                                </div>
                                <div className="auth__bgImg">
                                    <img
                                        src={
                                            selectedGender === "male"
                                                ? Men
                                                : Woman
                                        }
                                        alt={
                                            selectedGender === "male"
                                                ? "رجل"
                                                : "امرأة"
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gender Selector */}
            <div className="gender-selector">
                <div className="gender-buttons">
                    <button
                        className={`gender-btn ${selectedGender === "male" ? "active" : ""}`}
                        onClick={() => setSelectedGender("male")}
                    >
                        <img src={Men} alt="ذكر" width={40} height={40} />
                        ذكر
                    </button>
                    <button
                        className={`gender-btn ${selectedGender === "female" ? "active" : ""}`}
                        onClick={() => setSelectedGender("female")}
                    >
                        <img src={Woman} alt="أنثى" width={40} height={40} />
                        أنثى
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherRegister;
