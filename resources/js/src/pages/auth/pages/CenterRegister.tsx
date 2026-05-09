import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { useCenterRegister } from "../hooks/useCenterRegister";
import FAQItem from "../../DashBoard/home/NewTheme/FAQItem";
import CentersSection from "../components/CentersSection";
import logo from "../../../assets/images/logo.png";

const CenterRegister: React.FC = () => {
    const [countryCode, setCountryCode] = useState<string>("+966");
    const { form, errors, loading, setForm, setAvatar, handleSubmit } =
        useCenterRegister();
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setAvatar(e.target.files[0]);
    };

    useEffect(() => {
        if (errors.general) {
            toast.error(errors.general, {
                duration: 5000,
                position: "top-right",
                style: { direction: "rtl", fontFamily: "Cairo, sans-serif" },
            });
        }
    }, [errors.general]);

    const faqQuestions = [
        {
            question: "ما هو (رابط مجمعك)",
            answer: "هو الرابط الخاص بمجمعك مثال: www.etqan.com/seraj, www.etqan.com/game3",
        },
    ];

    return (
        <div className="auth">
            <Toaster />
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
                                    <div className="auth-bg-deco" />
                                    <div className="auth-root-register-form auth-card">
                                        <div className="brand-row">
                                            <img
                                                style={{ width: "60px" }}
                                                src={logo}
                                                alt="لوجو"
                                            />
                                        </div>
                                        <div className="auth-heading">
                                            <h1>طلب تسجيل مجمع</h1>
                                            <p>
                                                أكمل البيانات التالية وسيتم
                                                مراجعة طلبك من قِبل الإدارة
                                            </p>
                                        </div>

                                        <div className="form-stack">
                                            <div className="form-row-2col">
                                                <div className="field-wrap">
                                                    <label className="field-label">
                                                        اسم المجمع *
                                                    </label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={form.name}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                name: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="مجمع إتقان النسائي"
                                                        className={`fi2${errors.name ? " fi2--err" : ""}`}
                                                    />
                                                    {errors.name && (
                                                        <div className="field-err-msg">
                                                            {errors.name}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="field-wrap">
                                                    <label className="field-label">
                                                        رابط مجمعك *
                                                    </label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={form.subdomain}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                subdomain:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="game3, etqan, seraj"
                                                        className={`fi2${errors.subdomain ? " fi2--err" : ""}`}
                                                    />
                                                    {errors.subdomain && (
                                                        <div className="field-err-msg">
                                                            {errors.subdomain}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="form-row-2col">
                                                <div className="field-wrap">
                                                    <label className="field-label">
                                                        بريد مدير المجمع *
                                                    </label>
                                                    <input
                                                        required
                                                        type="email"
                                                        value={form.admin_email}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                admin_email:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="admin@center1.com"
                                                        className={`fi2${errors.admin_email ? " fi2--err" : ""}`}
                                                    />
                                                    {errors.admin_email && (
                                                        <div className="field-err-msg">
                                                            {errors.admin_email}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="field-wrap">
                                                    <label className="field-label">
                                                        اسم مدير المجمع *
                                                    </label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={form.admin_name}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                admin_name:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="أحمد محمد"
                                                        className={`fi2${errors.admin_name ? " fi2--err" : ""}`}
                                                    />
                                                    {errors.admin_name && (
                                                        <div className="field-err-msg">
                                                            {errors.admin_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="field-wrap">
                                                <label className="field-label">
                                                    رقم الجوال *
                                                </label>
                                                <div className="field-phone-row">
                                                    <select
                                                        name="country_code"
                                                        value={countryCode}
                                                        onChange={(e) =>
                                                            setCountryCode(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="field-phone-code"
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
                                                        value={form.phone}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                phone: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="01234567890"
                                                        className={`fi2 field-phone-input${errors.phone ? " fi2--err" : ""}`}
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <div className="field-err-msg">
                                                        {errors.phone}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="field-wrap">
                                                <label className="field-label">
                                                    شعار المجمع{" "}
                                                    <span className="opt-tag">
                                                        اختياري
                                                    </span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="fi2"
                                                    onChange={handleFileChange}
                                                />
                                                {form.avatar && (
                                                    <div className="field-hint">
                                                        تم اختيار:{" "}
                                                        {form.avatar.name}
                                                    </div>
                                                )}
                                                {errors.avatar && (
                                                    <div className="field-err-msg">
                                                        {errors.avatar}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="field-wrap">
                                                <button
                                                    type="button"
                                                    className="btn-primary"
                                                    onClick={handleSubmit}
                                                    disabled={loading}
                                                >
                                                    {loading
                                                        ? "جاري الإرسال..."
                                                        : "إرسال طلب إنشاء المجمع"}
                                                </button>
                                            </div>

                                            <div className="switch-row">
                                                <a href="/login">
                                                    <span className="link-btn">
                                                        لديك حساب بالفعل؟
                                                    </span>
                                                </a>
                                            </div>

                                            <div style={{ margin: "24px 0" }}>
                                                {faqQuestions.map((faq, i) => (
                                                    <FAQItem
                                                        key={i}
                                                        question={faq.question}
                                                        answer={faq.answer}
                                                    />
                                                ))}
                                            </div>

                                            {/* ── قائمة المجمعات الموجودة ── */}
                                            <CentersSection
                                                currentSlug={null}
                                            />
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

export default CenterRegister;
