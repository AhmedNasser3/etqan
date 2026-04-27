import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PiStudentDuotone } from "react-icons/pi";
import { PiChalkboardTeacherDuotone } from "react-icons/pi";
import { GrPlan } from "react-icons/gr";
import { PiBookOpenDuotone } from "react-icons/pi";

const QuranCirclesMock: React.FC = () => {
    const circles = [
        {
            name: "حلقة الإمام البخاري",
            desc: "حلقة تحفيظ متميزة للقرآن الكريم مع أفضل المدرسين وأحدث المناهج",
            stats: [
                ["247", "طالب"],
                ["12", "معلّم"],
                ["189", "حافظ"],
                ["7", "قراءات"],
            ],
        },
        {
            name: "دار تحفيظ نور الهدى",
            desc: "دار نسائية متخصصة في تحفيظ القرآن الكريم بأسلوب تعليمي حديث",
            stats: [
                ["183", "طالبة"],
                ["9", "معلمة"],
                ["142", "حافظة"],
                ["5", "قراءات"],
            ],
        },
        {
            name: "مجمع الفرقان القرآني",
            desc: "مجمع شامل للتحفيظ وعلوم القرآن للأطفال والكبار في بيئة مثالية",
            stats: [
                ["312", "طالب"],
                ["16", "معلّم"],
                ["231", "حافظ"],
                ["8", "قراءات"],
            ],
        },
        {
            name: "حلقات منصة إتقان المتقدمة",
            desc: "حلقات إلكترونية عبر الإنترنت مع نخبة من المعلمين المتخصصين في التجويد",
            stats: [
                ["524", "طالب"],
                ["22", "معلّم"],
                ["388", "حافظ"],
                ["10", "قراءات"],
            ],
        },
    ];
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
            id="circles"
            style={{
                padding: "clamp(60px,8vw,100px) 15%",
                background: "var(--n0)",
            }}
        >
            <SectionHead
                label="جميع حلقات التحفيظ"
                title='حلقات تحفيظ القرآن<br><span style="color:var(--g500)">المُدارة بإتقان</span>'
                desc="أنشئ مجمعك وأضف حلقاتك بنقرة واحدة. كل حلقة لها لوحة تحكم مستقلة مع إمكانية الإشراف الكامل من مكان واحد."
            />
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2,1fr)",
                    gap: 24,
                }}
                className="circles-grid"
            >
                {circles.map((c, i) => (
                    <article
                        key={i}
                        className="reveal"
                        style={{
                            background: "var(--n0)",
                            border: "1px solid var(--n200)",
                            borderRadius: "var(--radius-xl)",
                            overflow: "hidden",
                            transition: ".25s",
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
                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg,var(--g50),var(--br50))",
                                padding: 28,
                                borderBottom: "1px solid var(--n200)",
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 16,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: "var(--radius-m)",
                                        background:
                                            "linear-gradient(135deg,var(--g400),var(--g700))",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow:
                                            "0 6px 18px rgba(30,143,97,.25)",
                                        flexShrink: 0,
                                    }}
                                >
                                    <svg
                                        width={26}
                                        height={26}
                                        viewBox="0 0 24 24"
                                        fill="#fff"
                                    >
                                        <path d="M12 2a9 9 0 0 1 9 9c0 4.5-3 8.7-6.3 11.3a4.2 4.2 0 0 1-5.4 0C6 19.7 3 15.5 3 11a9 9 0 0 1 9-9z" />
                                    </svg>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 17,
                                            fontWeight: 800,
                                            color: "var(--n900)",
                                            marginBottom: 4,
                                        }}
                                    >
                                        {c.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: "var(--n500)",
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {c.desc}
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    background: "var(--g100)",
                                    border: "1px solid var(--g200)",
                                    color: "var(--g700)",
                                    padding: "4px 12px",
                                    borderRadius: 100,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}
                            >
                                نشطة
                            </div>
                        </div>
                        <div
                            style={{
                                padding: "20px 28px",
                                display: "grid",
                                gridTemplateColumns: "repeat(4,1fr)",
                                gap: 12,
                            }}
                        >
                            {c.stats.map(([num, label]) => (
                                <div
                                    key={label}
                                    style={{ textAlign: "center" }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "Tajawal,sans-serif",
                                            fontSize: 20,
                                            fontWeight: 900,
                                            color: "var(--g600)",
                                        }}
                                    >
                                        {num}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "var(--n400)",
                                            marginTop: 3,
                                        }}
                                    >
                                        {label}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            style={{
                                padding: "14px 28px",
                                borderTop: "1px solid var(--n100)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <a
                                href="#contact"
                                style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "var(--g600)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    transition: ".2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "var(--g700)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "var(--g600)";
                                }}
                            >
                                استعرض الحلقة
                                <svg
                                    width={14}
                                    height={14}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    style={{ transform: "scaleX(-1)" }}
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </a>
                        </div>
                    </article>
                ))}
            </div>
            <style>{`@media(max-width:640px){.circles-grid{grid-template-columns:1fr!important;}}`}</style>
        </section>
    );
};

export default QuranCirclesMock;
