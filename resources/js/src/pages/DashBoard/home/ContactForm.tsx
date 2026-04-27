import { color } from "framer-motion";
import React, { useState, FormEvent } from "react";

interface FormData {
    name: string;
    academy: string;
    email: string;
    phone: string;
    message: string;
}
const Pill = ({ children }) => (
    <div
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--g50)",
            border: "1px solid var(--g200)",
            color: "var(--g600)",
            padding: "5px 14px",
            borderRadius: 100,
            fontSize: 12,
            fontWeight: 700,
        }}
    >
        <span
            style={{
                width: 16,
                height: 2,
                background: "var(--g400)",
                borderRadius: 2,
                display: "block",
            }}
        />
        {children}
    </div>
);

const ContactForm: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);

        // هنا API call أو أي منطق

        // Reset الصحيح لـ React
        setFormData({ name: "", email: "" });

        setTimeout(() => setSubmitted(false), 4000);
    };

    if (submitted) {
        return (
            <section
                className="contact-sec"
                id="contact"
                style={{ minHeight: "500px" }}
            >
                <div className="container">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "4rem 2rem",
                            background: "var(--g50)",
                            borderRadius: "16px",
                        }}
                    >
                        <svg
                            width="64"
                            height="64"
                            fill="#10b981"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <h2 style={{ color: "var(--g700)", margin: "1rem 0" }}>
                            ✅ تم إرسال طلبك بنجاح!
                        </h2>
                        <p style={{ color: "var(--n500)", fontSize: "18px" }}>
                            سنتواصل معك خلال 24 ساعة لإعداد مجمعك
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            id="contact"
            style={{
                padding: "clamp(60px,8vw,100px) 15%",
                background: "var(--n50)",
                borderTop: "1px solid var(--n200)",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "clamp(40px,6vw,80px)",
                    alignItems: "start",
                }}
                className="contact-grid"
            >
                <div className="reveal-right">
                    <Pill>تواصل معنا</Pill>
                    <h2
                        style={{
                            fontFamily: "Tajawal,sans-serif",
                            fontSize: "clamp(1.7rem,3vw,2.5rem)",
                            fontWeight: 900,
                            color: "var(--n900)",
                            lineHeight: 1.2,
                            marginBottom: 14,
                            marginTop: 20,
                        }}
                    >
                        هل أنت جاهز لبدء رحلتك مع{" "}
                        <span style={{ color: "var(--g500)" }}>إتقان</span>؟
                    </h2>
                    <p
                        style={{
                            fontSize: 15,
                            color: "var(--n500)",
                            lineHeight: 1.9,
                            marginBottom: 32,
                        }}
                    >
                        سجّل مجمعك الآن واحصل على استشارة مجانية مع فريق إتقان.
                        سنتواصل معك خلال 24 ساعة.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        {[
                            {
                                icon: (
                                    <svg
                                        width={20}
                                        height={20}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="var(--g600)"
                                        strokeWidth={2}
                                    >
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12 19.79 19.79 0 0 1 1.15 3.38 2 2 0 0 1 3.12 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
                                    </svg>
                                ),
                                label: "للاتصال بنا",
                                value: "+966 50 000 0000",
                            },
                            {
                                icon: (
                                    <svg
                                        width={20}
                                        height={20}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="var(--g600)"
                                        strokeWidth={2}
                                    >
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                ),
                                label: "البريد الإلكتروني",
                                value: "support@itqan.app",
                            },
                            {
                                icon: (
                                    <svg
                                        width={20}
                                        height={20}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="var(--g600)"
                                        strokeWidth={2}
                                    >
                                        <circle cx={12} cy={12} r={10} />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                ),
                                label: "ساعات الدعم",
                                value: "8 صباحاً — 10 مساءً",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                    padding: "16px 20px",
                                    background: "var(--n0)",
                                    border: "1px solid var(--n200)",
                                    borderRadius: "var(--radius-m)",
                                }}
                            >
                                <div
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 10,
                                        background: "var(--g100)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "var(--n400)",
                                            textTransform: "uppercase",
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: "var(--n800)",
                                            marginTop: 2,
                                        }}
                                    >
                                        {item.value}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="reveal-left">
                    <div
                        style={{
                            background: "var(--n0)",
                            border: "1px solid var(--n200)",
                            borderRadius: "var(--radius-xl)",
                            padding: "clamp(24px,3vw,36px)",
                            boxShadow: "var(--shadow-m)",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: "var(--n900)",
                                marginBottom: 24,
                            }}
                        >
                            سجّل مجمعك الآن
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 14,
                                }}
                                className="form-row"
                            >
                                {[
                                    ["الاسم الكامل", "اسم مدير المجمع", "name"],
                                    ["اسم المجمع", "مجمع", "academy"],
                                ].map(([label, ph, name]) => (
                                    <div
                                        key={name}
                                        style={{ marginBottom: 18 }}
                                    >
                                        <label
                                            style={{
                                                display: "block",
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: "var(--n700)",
                                                marginBottom: 7,
                                            }}
                                        >
                                            {label}{" "}
                                            <span style={{ color: "#ef4444" }}>
                                                *
                                            </span>
                                        </label>
                                        <input
                                            required
                                            placeholder={ph}
                                            style={{
                                                width: "100%",
                                                padding: "12px 16px",
                                                background: "var(--n0)",
                                                border: "1.5px solid var(--n200)",
                                                borderRadius: "var(--radius-m)",
                                                fontFamily:
                                                    "Tajawal,sans-serif",
                                                fontSize: 14,
                                                color: "var(--n800)",
                                                outline: "none",
                                                direction: "rtl",
                                                transition: ".2s",
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor =
                                                    "var(--g400)";
                                                e.target.style.boxShadow =
                                                    "0 0 0 3px rgba(56,168,121,.12)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor =
                                                    "var(--n200)";
                                                e.target.style.boxShadow = "";
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {[
                                [
                                    "البريد الإلكتروني",
                                    "email",
                                    "your@email.com",
                                ],
                                ["رقم الجوال", "tel", "+966 5X XXX XXXX"],
                            ].map(([label, type, ph]) => (
                                <div key={label} style={{ marginBottom: 18 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "var(--n700)",
                                            marginBottom: 7,
                                        }}
                                    >
                                        {label}{" "}
                                        <span style={{ color: "#ef4444" }}>
                                            *
                                        </span>
                                    </label>
                                    <input
                                        required
                                        type={type}
                                        placeholder={ph}
                                        style={{
                                            width: "100%",
                                            padding: "12px 16px",
                                            background: "var(--n0)",
                                            border: "1.5px solid var(--n200)",
                                            borderRadius: "var(--radius-m)",
                                            fontFamily: "Tajawal,sans-serif",
                                            fontSize: 14,
                                            color: "var(--n800)",
                                            outline: "none",
                                            direction: "rtl",
                                            transition: ".2s",
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor =
                                                "var(--g400)";
                                            e.target.style.boxShadow =
                                                "0 0 0 3px rgba(56,168,121,.12)";
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor =
                                                "var(--n200)";
                                            e.target.style.boxShadow = "";
                                        }}
                                    />
                                </div>
                            ))}
                            <div style={{ marginBottom: 18 }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: "var(--n700)",
                                        marginBottom: 7,
                                    }}
                                >
                                    سؤالك أو احتياجك
                                </label>
                                <textarea
                                    placeholder="أخبرنا عن مجمعك وعدد طلابك واحتياجاتك..."
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        background: "var(--n0)",
                                        border: "1.5px solid var(--n200)",
                                        borderRadius: "var(--radius-m)",
                                        fontFamily: "Tajawal,sans-serif",
                                        fontSize: 14,
                                        color: "var(--n800)",
                                        outline: "none",
                                        direction: "rtl",
                                        resize: "vertical",
                                        minHeight: 110,
                                        transition: ".2s",
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor =
                                            "var(--g400)";
                                        e.target.style.boxShadow =
                                            "0 0 0 3px rgba(56,168,121,.12)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor =
                                            "var(--n200)";
                                        e.target.style.boxShadow = "";
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    padding: "13px 0",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    background: submitted
                                        ? "var(--g700)"
                                        : "var(--g500)",
                                    color: "#fff",
                                    borderRadius: "var(--radius-m)",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    transition: "all .22s",
                                    boxShadow: "0 4px 18px rgba(30,143,97,.30)",
                                }}
                            >
                                {submitted
                                    ? "✓ تم الإرسال — سنتواصل معك قريباً"
                                    : "إرسال وتسجيل المجمع"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <style>{`
        @media(max-width:768px){.contact-grid{grid-template-columns:1fr!important;} .form-row{grid-template-columns:1fr!important;}}
      `}</style>
        </section>
    );
};

export default ContactForm;
