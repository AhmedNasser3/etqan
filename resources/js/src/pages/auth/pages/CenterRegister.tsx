import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useCenterRegister } from "../hooks/useCenterRegister";

const CenterRegister = () => {
    const [countryCode, setCountryCode] = useState<string>("+966");
    const {
        form,
        errors,
        loading,
        setForm,
        setAvatar,
        handleSubmit,
        resetForm,
    } = useCenterRegister();
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0]);
        }
    };

    useEffect(() => {
        if (errors.general) {
            toast.error(errors.general, {
                duration: 5000,
                position: "top-right",
                style: {
                    direction: "rtl",
                    fontFamily: "Cairo, sans-serif",
                },
            });
        }
    }, [errors.general]);

    return (
        <div
            className="auth"
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
            <Toaster />
            <div className="auth__inner">
                <div className="auth__container">
                    <div
                        className="auth__content"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            width: "1500px",
                        }}
                    >
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
                                                    <div className="inputs__Lastname">
                                                        <label>
                                                            اسم المجمع *
                                                        </label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={form.name}
                                                            onChange={(e) =>
                                                                setForm({
                                                                    ...form,
                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                            placeholder="مجمع الإتقان النسائي"
                                                            className={
                                                                errors.name
                                                                    ? "error"
                                                                    : ""
                                                            }
                                                        />
                                                        {errors.name && (
                                                            <span className="error-message">
                                                                {errors.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="inputs__Firstname">
                                                        <label>
                                                            Subdomain *
                                                        </label>
                                                        <div className="flex">
                                                            <input
                                                                required
                                                                type="text"
                                                                value={
                                                                    form.subdomain
                                                                }
                                                                onChange={(e) =>
                                                                    setForm({
                                                                        ...form,
                                                                        subdomain:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                }
                                                                placeholder="center1"
                                                                className={`flex-1 ${errors.subdomain ? "error" : ""}`}
                                                            />
                                                            <span className="bg-gray-100 px-4 py-3 border rounded-r-lg border-l-0">
                                                                .
                                                                {window.location.host
                                                                    .split(".")
                                                                    .slice(-2)
                                                                    .join(".")}
                                                            </span>
                                                        </div>
                                                        {errors.subdomain && (
                                                            <span className="error-message">
                                                                {
                                                                    errors.subdomain
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="inputs__verifyOTPBirth">
                                                    <div className="inputs__verifyOTP">
                                                        <label>
                                                            بريد مدير المجمع *
                                                        </label>
                                                        <input
                                                            required
                                                            type="email"
                                                            value={
                                                                form.admin_email
                                                            }
                                                            onChange={(e) =>
                                                                setForm({
                                                                    ...form,
                                                                    admin_email:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            placeholder="admin@center1.com"
                                                            className={
                                                                errors.admin_email
                                                                    ? "error"
                                                                    : ""
                                                            }
                                                        />
                                                        {errors.admin_email && (
                                                            <span className="error-message">
                                                                {
                                                                    errors.admin_email
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="inputs__verifyOTP">
                                                        <label>
                                                            اسم مدير المجمع *
                                                        </label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={
                                                                form.admin_name
                                                            }
                                                            onChange={(e) =>
                                                                setForm({
                                                                    ...form,
                                                                    admin_name:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            placeholder="أحمد محمد"
                                                            className={
                                                                errors.admin_name
                                                                    ? "error"
                                                                    : ""
                                                            }
                                                        />
                                                        {errors.admin_name && (
                                                            <span className="error-message">
                                                                {
                                                                    errors.admin_name
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="inputs__verifyOTPBirth">
                                                    <div className="inputs__verifyOTP">
                                                        <label>
                                                            رقم الجوال *
                                                        </label>
                                                        <div className="inputs__phone-container">
                                                            <select
                                                                name="country_code"
                                                                value={
                                                                    countryCode
                                                                }
                                                                onChange={(e) =>
                                                                    setCountryCode(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            >
                                                                <option value="+20">
                                                                    20+
                                                                </option>
                                                                <option value="+966">
                                                                    966+
                                                                </option>
                                                                <option value="+971">
                                                                    971+
                                                                </option>
                                                            </select>
                                                            <input
                                                                required
                                                                type="tel"
                                                                value={
                                                                    form.phone
                                                                }
                                                                onChange={(e) =>
                                                                    setForm({
                                                                        ...form,
                                                                        phone: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                }
                                                                placeholder="01234567890"
                                                                className={`inputs__phone-input ${errors.phone ? "error" : ""}`}
                                                            />
                                                        </div>
                                                        {errors.phone && (
                                                            <span className="error-message">
                                                                {errors.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="inputs__verifyOTP">
                                                    <label>
                                                        شعار المجمع (اختياري)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />
                                                    {form.avatar && (
                                                        <span className="file-preview">
                                                            تم اختيار:{" "}
                                                            {form.avatar.name}
                                                        </span>
                                                    )}
                                                    {errors.avatar && (
                                                        <span className="error-message">
                                                            {errors.avatar}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="inputs__submitBtn">
                                                    <button
                                                        type="button"
                                                        onClick={handleSubmit}
                                                        disabled={loading}
                                                    >
                                                        {loading
                                                            ? "جاري الإرسال..."
                                                            : "إرسال طلب إنشاء المجمع"}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CenterRegister;
