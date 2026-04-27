// AdminRegister.tsx
import React, { useState } from "react";
import { useAdminRegister } from "../hooks/useAdminRegister";
import Men from "../../../assets/images/facelessAvatar.png";
import Woman from "../../../assets/images/facelessAvatarWoman.png";

const AdminRegister: React.FC = () => {
    const [selectedGender, setSelectedGender] = useState<"male" | "female">(
        "male",
    );

    const { data, loading, success, error, handleInputChange, submitRegister } =
        useAdminRegister();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleInputChange("gender", selectedGender);
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
                                                    {/* الاسم الكامل */}
                                                    <div className="inputs__name">
                                                        <div className="inputs__Firstname">
                                                            <label>
                                                                الاسم الكامل *
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
                                                                placeholder="أحمد محمد علي أحمد"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* البريد الإلكتروني */}
                                                    <div className="inputs__verifyOTPBirth">
                                                        <div className="inputs__email">
                                                            <label>
                                                                البريد
                                                                الإلكتروني *
                                                            </label>
                                                            <input
                                                                required
                                                                type="email"
                                                                name="email"
                                                                value={
                                                                    data.email ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        "email",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="admin@example.com"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* رقم الهاتف - اختياري */}
                                                    <div className="inputs__verifyOTPBirth">
                                                        <div className="inputs__email">
                                                            <label>
                                                                رقم الهاتف
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                name="phone"
                                                                value={
                                                                    data.phone ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        "phone",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="01xxxxxxxxx"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* الملاحظات - اختياري */}
                                                    <div className="inputs__verifyOTP">
                                                        <label>
                                                            ملاحظات/الخبرة
                                                            الإدارية
                                                        </label>
                                                        <textarea
                                                            name="notes"
                                                            rows={3}
                                                            value={
                                                                data.notes || ""
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    "notes",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="خبرتك الإدارية، المؤهلات، المهارات..."
                                                            maxLength={1000}
                                                        />
                                                    </div>

                                                    {/* رسائل الخطأ */}
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

                                                    {/* رسائل النجاح */}
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
                                                            تم إرسال طلب التسجيل
                                                            بنجاح! سيتم مراجعته
                                                            من الإدارة العليا
                                                        </div>
                                                    )}

                                                    {/* زر الإرسال */}
                                                    <div className="inputs__submitBtn">
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                        >
                                                            {loading
                                                                ? "⏳ جاري الإرسال..."
                                                                : "إرسال طلب التسجيل الإداري"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Background Section */}
                        <div className="auth__bg">
                            <div className="auth__bgContainer">
                                <div className="auth__bgData">
                                    <h1>تسجيل إداري</h1>
                                    <p>
                                        بالقرآن نحيا (منصة إتقان لتسهيل حفظ
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

export default AdminRegister;
