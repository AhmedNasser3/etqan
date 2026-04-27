import { useEffect, useRef, useState } from "react";

const HowItWorksSection: React.FC = () => {
    const steps = [
        {
            n: "01",
            title: "أنشئ مجمعك في دقيقتين",
            desc: "سجّل بياناتك الأساسية وخصّص اسم مجمعك وشعاره وألوانه ببضع نقرات.",
        },
        {
            n: "02",
            title: "أضف حلقاتك ومعلميك",
            desc: "أضف الحلقات القرآنية وسجّل بيانات المعلمين والطلاب بسهولة تامة.",
        },
        {
            n: "03",
            title: "تابع وأدر في الوقت الفعلي",
            desc: "تتبّع الحضور والتقدم وأصدر التقارير وادفع الرواتب كل شيء من مكان واحد.",
        },
    ];
    return (
        <section
            id="how-it-works"
            style={{
                padding: "clamp(60px,8vw,100px) 15%",
                background: "var(--n900)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />
            <div
                className="reveal"
                style={{
                    textAlign: "center",
                    marginBottom: "clamp(40px,5vw,64px)",
                }}
            >
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(255,255,255,.06)",
                        border: "1px solid rgba(255,255,255,.12)",
                        color: "var(--g300)",
                        padding: "5px 14px",
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 16,
                    }}
                >
                    آلية العمل
                </div>
                <h2
                    style={{
                        fontFamily: "Tajawal,sans-serif",
                        fontSize: "clamp(1.7rem,3.2vw,2.8rem)",
                        fontWeight: 900,
                        color: "#fff",
                        lineHeight: 1.2,
                        marginBottom: 14,
                    }}
                >
                    ابدأ في ثلاث خطوات{" "}
                    <span style={{ color: "var(--g300)" }}>بسيطة</span>
                </h2>
                <p
                    style={{
                        fontSize: 16,
                        color: "rgba(255,255,255,.5)",
                        lineHeight: 1.9,
                        maxWidth: 580,
                        margin: "0 auto",
                    }}
                >
                    لا تحتاج إلى أي خبرة تقنية — منصة إتقان صُمِّمت لتكون سهلة
                    الاستخدام من اليوم الأول.
                </p>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 0,
                    position: "relative",
                }}
                className="how-steps"
            >
                <div
                    style={{
                        position: "absolute",
                        top: 40,
                        right: "16.66%",
                        left: "16.66%",
                        height: 1,
                        background:
                            "linear-gradient(90deg,var(--g600),var(--br300),var(--g600))",
                        opacity: 0.4,
                    }}
                    className="steps-line"
                />
                {steps.map((s, i) => (
                    <div
                        key={i}
                        className="reveal"
                        style={{
                            position: "relative",
                            zIndex: 1,
                            textAlign: "center",
                            padding: "0 clamp(12px,3vw,24px)",
                        }}
                    >
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,.05)",
                                border: "1px solid rgba(255,255,255,.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: "Tajawal,sans-serif",
                                fontSize: 28,
                                fontWeight: 900,
                                color: "var(--g400)",
                                margin: "0 auto 24px",
                                position: "relative",
                            }}
                        >
                            <span>{s.n}</span>
                        </div>
                        <h3
                            style={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: "#fff",
                                marginBottom: 10,
                            }}
                        >
                            {s.title}
                        </h3>
                        <p
                            style={{
                                fontSize: 13,
                                color: "rgba(255,255,255,.45)",
                                lineHeight: 1.8,
                            }}
                        >
                            {s.desc}
                        </p>
                    </div>
                ))}
            </div>
            <style>{`
        @media(max-width:640px){ .how-steps{grid-template-columns:1fr!important;} .steps-line{display:none!important;} }
      `}</style>
        </section>
    );
};

export default HowItWorksSection;
