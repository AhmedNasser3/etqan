import { useEffect, useState } from "react";
import { BsPatchCheckFill } from "react-icons/bs";
import { motion, useAnimation } from "framer-motion";
import { IoCreateOutline } from "react-icons/io5";
import { TbEaseInOutControlPoints } from "react-icons/tb";
import { MdOutlineManageAccounts } from "react-icons/md";
import { PiStepsFill } from "react-icons/pi";
import { FaMosque } from "react-icons/fa6";

const InfoN: React.FC = () => {
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
    const cards = [
        {
            title: "حضور ذكي بالبصمة والرمز",
            desc: "تتبّع حضور الطلاب والمعلمين باستخدام بصمة الأصابع أو رمز QR مع إرسال تنبيهات فورية لولي الأمر عند الغياب.",
            list: [
                "تنبيهات غياب فورية",
                "تقارير حضور أسبوعية وشهرية",
                "يعمل بدون إنترنت (PWA)",
            ],
            color: "green",
            span: false,
        },
        {
            title: "غرف التسميع الذكية",
            desc: "غرف تسميع مخصصة لكل معلم وطالب مع تسجيل الشاشة وتسجيل الجلسات، وإمكانية مراجعة السماع لاحقاً.",
            color: "green",
            span: false,
        },
        {
            title: "مساعد الذكاء الاصطناعي",
            desc: "مساعد ذكي يساعد المعلم في بناء الخطط التعليمية ويقترح أساليب تدريس مخصصة لكل طالب.",
            color: "brown",
            span: false,
        },
        {
            title: "تقارير PDF و Excel شاملة",
            desc: "تقارير مفصّلة لكل مجمع وطالب — إحصائيات الحفظ والغياب والتقدم — قابلة للتنزيل والطباعة في أي وقت.",
            color: "green",
            span: false,
        },
        {
            title: "إدارة المصروفات والرواتب",
            desc: "متابعة شاملة لمصروفات المجمع وعملية صرف الرواتب الشهرية لكل معلم وموظف تلقائياً.",
            color: "green",
            span: false,
        },
        {
            title: "نظام التحفيز والجوائز",
            desc: "جوائز وشهادات تُمنح تلقائياً للمتفوقين مع إضافة مكافآت مباشرة من المنصة وصفحة إنجاز خاصة.",
            color: "brown",
            span: false,
        },
        {
            title: "التقويم الدراسي الفوري",
            desc: "بمجرد تحديد بداية ونهاية الدورة الدراسية وأيام العمل، يخرج تقويم دراسي كامل فوراً.",
            color: "green",
            span: false,
        },
        {
            title: "الخطة التعليمية للطالب",
            desc: "بناء خطة مخصصة لكل طالب بسهولة — حدّد الهدف اليومي للحفظ بالأسطر وللمراجعة بالأوجه.",
            color: "green",
            span: false,
        },
        {
            title: "متوافق مع جميع الأجهزة",
            desc: "إمكانية استعراض بوابة المعلم والطالب من جميع أنواع الشاشات — كمبيوتر، لوحي، وجوال.",
            color: "brown",
            span: false,
        },
    ];
    const SectionHead = ({ label, title, desc }) => (
        <div
            className="reveal"
            style={{
                textAlign: "center",
                marginBottom: "clamp(40px,5vw,64px)",
            }}
        >
            <div style={{ marginBottom: 16 }}>
                <Pill>{label}</Pill>
            </div>
            <h2
                style={{
                    fontFamily: "Tajawal,sans-serif",
                    fontSize: "clamp(1.7rem,3.2vw,2.8rem)",
                    fontWeight: 900,
                    color: "var(--n900)",
                    lineHeight: 1.2,
                    marginBottom: 14,
                }}
                dangerouslySetInnerHTML={{ __html: title }}
            />
            <p
                style={{
                    fontSize: 16,
                    color: "var(--n500)",
                    lineHeight: 1.9,
                    maxWidth: 580,
                    margin: "0 auto",
                }}
            >
                {desc}
            </p>
        </div>
    );

    return (
        <section
            id="features"
            style={{
                padding: "clamp(60px,8vw,100px) 15%",
                background: "var(--n0)",
            }}
        >
            <SectionHead
                label="مميزات المنصة"
                title='كل ما يحتاجه <span style="color:var(--g500)">مجمعك القرآني</span>'
                desc="أدوات متكاملة صُمِّمت بفهم عميق لاحتياجات الحلقات القرآنية والدور النسائية."
            />
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 24,
                }}
                className="features-grid"
            >
                {cards.map((c, i) => (
                    <article
                        key={i}
                        className="reveal feat-card"
                        style={{
                            padding: 32,
                            borderRadius: "var(--radius-l)",
                            border: "1px solid var(--n200)",
                            background:
                                i === 0
                                    ? "linear-gradient(160deg,var(--g50) 0%,var(--n0) 100%)"
                                    : "var(--n0)",
                            transition: ".25s",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "var(--shadow-l)";
                            e.currentTarget.style.borderColor = "var(--g200)";
                            e.currentTarget.style.transform =
                                "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "";
                            e.currentTarget.style.borderColor = "var(--n200)";
                            e.currentTarget.style.transform = "";
                        }}
                    >
                        <div style={{ marginBottom: 22 }}>
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "var(--radius-m)",
                                    background:
                                        c.color === "green"
                                            ? "var(--g100)"
                                            : "var(--br100)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <svg
                                    width={24}
                                    height={24}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke={
                                        c.color === "green"
                                            ? "var(--g600)"
                                            : "var(--br400)"
                                    }
                                    strokeWidth={2}
                                >
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                        </div>
                        <h3
                            style={{
                                fontSize: 17,
                                fontWeight: 800,
                                color: "var(--n900)",
                                marginBottom: 10,
                            }}
                        >
                            {c.title}
                        </h3>
                        <p
                            style={{
                                fontSize: 14,
                                color: "var(--n500)",
                                lineHeight: 1.85,
                            }}
                        >
                            {c.desc}
                        </p>
                        {c.list && (
                            <ul
                                style={{
                                    marginTop: 16,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                {c.list.map((l, j) => (
                                    <li
                                        key={j}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            fontSize: 13,
                                            color: "var(--n600)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: "50%",
                                                background: "var(--g100)",
                                                flexShrink: 0,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <svg
                                                width={10}
                                                height={10}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="var(--g600)"
                                                strokeWidth={3}
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        {l}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </article>
                ))}
            </div>
            <style>{`
        @media(max-width:900px){ .features-grid{grid-template-columns:repeat(2,1fr)!important;} }
        @media(max-width:560px){ .features-grid{grid-template-columns:1fr!important;} }
      `}</style>
        </section>
    );
};

export default InfoN;
