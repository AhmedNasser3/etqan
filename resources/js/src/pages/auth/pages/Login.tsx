import React, { useState } from "react";
import EmailForm from "../components/EmailForm";
import Men from "../../../assets/images/facelessAvatar.png";
import Woman from "../../../assets/images/facelessAvatarWoman.png";

const Login: React.FC = () => {
    const [selectedGender, setSelectedGender] = useState<"male" | "female">(
        "male"
    );

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
                                    <EmailForm gender={selectedGender} />
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
            {/* ✅ اختيار الجنس */}
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

export default Login;
