import React, { useState } from "react";
import EmailForm from "../components/EmailForm";
import Men from "../../../assets/images/facelessAvatar.png";
import Woman from "../../../assets/images/facelessAvatarWoman.png";

interface StudentEnrollmentProps {
    gender: "male" | "female";
}

const TeacherRegister: React.FC<StudentEnrollmentProps> = ({ gender }) => {
    const [selectedGender, setSelectedGender] = useState<"male" | "female">(
        "male"
    );
    const [selectedRole, setSelectedRole] = useState<string>("");

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRole(e.target.value);
    };

    return (
        <div className="auth">
            <div className="auth__inner">
                <div className="auth__container">
                    <div className="auth__content">
                        <div className="auth__form">
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
                                                            name="first_name"
                                                            id="first_name"
                                                            placeholder={`... ${
                                                                selectedGender ===
                                                                "male"
                                                                    ? "أحمد"
                                                                    : "فاطمة"
                                                            }`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="inputs__verifyOTPBirth">
                                                    <div className="inputs__verifyOTP">
                                                        <label>
                                                            الدور المطلوب
                                                        </label>
                                                        <select
                                                            name="grade_level"
                                                            id="grade_level"
                                                            onChange={
                                                                handleRoleChange
                                                            }
                                                            value={selectedRole}
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

                                                {selectedRole === "teacher" && (
                                                    <div className="inputs__verifyOTPBirth">
                                                        <div className="inputs__verifyOTP">
                                                            <label>
                                                                الحلقات المتاحة
                                                            </label>
                                                            <select
                                                                name="session_time"
                                                                id="session_time"
                                                            >
                                                                <option value="">
                                                                    اختر الوقت
                                                                </option>
                                                                <option value="asr">
                                                                    حلقة العصر
                                                                    (5 أماكن
                                                                    شاغرة)
                                                                </option>
                                                                <option value="maghrib">
                                                                    حلقة المغرب
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
                                                            بريدك الإلكتروني *
                                                        </label>
                                                        <input
                                                            required
                                                            type="email"
                                                            name="guardian_email"
                                                            id="guardian_email"
                                                            placeholder="parent@example.com"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="inputs__verifyOTP">
                                                    <label>ملاحظات/خبرات</label>
                                                    <textarea
                                                        name="notes"
                                                        id="notes"
                                                        rows={3}
                                                        placeholder="ملاحظات إضافية..."
                                                    />
                                                </div>
                                                <div className="inputs__submitBtn">
                                                    <button type="submit">
                                                        إرسال طلب التسجيل
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
                        </div>
                        <div className="auth__bg">
                            <div className="auth__bgContainer">
                                <div className="auth__bgData">
                                    <h1>تسجيل دخول</h1>
                                    <p>
                                        بالقرأن نحيا (منصة اتقان لتسهيل حفظ
                                        القرأن)
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
            <div className="gender-selector">
                <div className="gender-buttons">
                    <button
                        className={`gender-btn ${
                            selectedGender === "male" ? "active" : ""
                        }`}
                        onClick={() => setSelectedGender("male")}
                    >
                        <img src={Men} alt="ذكر" width={40} height={40} />
                        ذكر
                    </button>
                    <button
                        className={`gender-btn ${
                            selectedGender === "female" ? "active" : ""
                        }`}
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
