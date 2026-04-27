import React, { useEffect, useRef, useState } from "react";
import { BsPatchCheckFill } from "react-icons/bs";
import { motion } from "framer-motion";
import img1 from "../../../../assets/images/Untitled-1.png";
import { IoCreateOutline } from "react-icons/io5";
import { TbEaseInOutControlPoints } from "react-icons/tb";
import { MdOutlineManageAccounts } from "react-icons/md";
import { PiStepsFill } from "react-icons/pi";
import { FaMosque } from "react-icons/fa6";
import { MdConfirmationNumber } from "react-icons/md";
import { FaHeartCirclePlus } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";

interface Counters {
    students: number;
    episodes: number;
    progress: number;
}

const StatsN: React.FC = () => {
    const [counters, setCounters] = useState<Counters>({
        students: 0,
        episodes: 0,
        progress: 0,
    });

    const statsRef = useRef<HTMLDivElement>(null);
    const [hasAnimated, setHasAnimated] = useState<boolean>(false);

    const animateCounter = (
        start: number,
        end: number,
        duration: number,
        setter: (value: number) => void,
    ) => {
        const startTime = Date.now();
        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // smooth easing
            const current = Math.floor(start + (end - start) * easeProgress);

            setter(current);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        step();
    };

    const startAnimation = () => {
        if (hasAnimated) return;

        // أرقام واقعية
        animateCounter(0, 15623, 2000, (value) =>
            setCounters((prev) => ({ ...prev, students: value })),
        );

        animateCounter(0, 847, 2000, (value) =>
            setCounters((prev) => ({ ...prev, episodes: value })),
        );

        animateCounter(0, 97, 2000, (value) =>
            setCounters((prev) => ({ ...prev, progress: value })),
        );

        setHasAnimated(true);
    };

    const formatNumber = (num: number, isPercent?: boolean): string => {
        return isPercent ? `${num}%` : num.toLocaleString();
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        startAnimation();
                    }
                });
            },
            { threshold: 0.3 },
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    return (
        <section
            id="reports"
            style={{
                padding: "clamp(60px,8vw,100px) 15%",
                background: "var(--g50)",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "clamp(40px,6vw,80px)",
                    alignItems: "center",
                }}
                className="showcase-grid"
            >
                <div className="reveal-right">
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "var(--g100)",
                            border: "1px solid var(--g200)",
                            color: "var(--g700)",
                            padding: "5px 14px",
                            borderRadius: 100,
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 20,
                        }}
                    >
                        نظام التقارير الذكية
                    </div>
                    <h2
                        style={{
                            fontFamily: "Tajawal,sans-serif",
                            fontSize: "clamp(1.6rem,2.8vw,2.5rem)",
                            fontWeight: 900,
                            color: "var(--n900)",
                            lineHeight: 1.25,
                            marginBottom: 16,
                        }}
                    >
                        تقارير تُنجز
                        <br />
                        <span style={{ color: "var(--g500)" }}>
                            ما كان يستغرق ساعات
                        </span>
                        <br />
                        في ثوانٍ
                    </h2>
                    <p
                        style={{
                            fontSize: 15,
                            color: "var(--n500)",
                            lineHeight: 1.9,
                            marginBottom: 28,
                        }}
                    >
                        حساب تلقائي للرواتب والحضور وإنجازات الحلقات كلها في
                        شاشة واحدة. شاهد تقاريرك في أي وقت أو حمّلها بصيغة PDF و
                        Excel.
                    </p>
                    {[
                        {
                            title: "تقارير الطالب الفردية",
                            desc: "تقرير مفصّل لكل طالب يشمل المحفوظات، الغياب، المراجعات، والتقدم الشهري.",
                        },
                        {
                            title: "تقارير المعلمين والهيئة",
                            desc: "أداء كل معلم، ساعات العمل، الرواتب المستحقة، والمكافآت المضافة.",
                        },
                        {
                            title: "تقرير المجمع الكامل",
                            desc: "نظرة شاملة على المجمع بأكمله: الحلقات، المصروفات، معدلات الحفظ.",
                        },
                    ].map((f, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 14,
                                padding: "14px 18px",
                                background: "var(--n0)",
                                border: "1px solid var(--n200)",
                                borderRadius: "var(--radius-m)",
                                marginBottom: 14,
                                transition: ".2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor =
                                    "var(--g300)";
                                e.currentTarget.style.boxShadow =
                                    "var(--shadow-s)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor =
                                    "var(--n200)";
                                e.currentTarget.style.boxShadow = "";
                            }}
                        >
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 9,
                                    background: "var(--g100)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <svg
                                    width={18}
                                    height={18}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--g600)"
                                    strokeWidth={2}
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: "var(--n800)",
                                        marginBottom: 3,
                                    }}
                                >
                                    {f.title}
                                </div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: "var(--n500)",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {f.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                    <a
                        href="#contact"
                        style={{
                            padding: "13px 28px",
                            fontSize: 14,
                            fontWeight: 700,
                            background: "var(--g500)",
                            color: "#fff",
                            borderRadius: "var(--radius-m)",
                            boxShadow: "0 4px 18px rgba(30,143,97,.30)",
                            transition: "all .22s",
                            display: "inline-flex",
                            alignItems: "center",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--g600)";
                            e.currentTarget.style.transform =
                                "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--g500)";
                            e.currentTarget.style.transform = "";
                        }}
                    >
                        سجّل مجمعك وجرّب التقارير
                    </a>
                </div>

                <div className="reveal-left">
                    <div
                        style={{
                            background: "var(--n0)",
                            borderRadius: "var(--radius-xl)",
                            border: "1px solid var(--n200)",
                            boxShadow: "var(--shadow-xl)",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg,var(--n800),var(--n900))",
                                padding: "16px 22px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#fff",
                                }}
                            >
                                تقرير الحلقة — مارس 2025
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                                {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                                    <span
                                        key={c}
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            background: c,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: 20 }}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3,1fr)",
                                    gap: 10,
                                    marginBottom: 20,
                                }}
                            >
                                {[
                                    [
                                        "94%",
                                        "معدل الحضور",
                                        "var(--g50)",
                                        "var(--g100)",
                                        "var(--g600)",
                                    ],
                                    [
                                        "23",
                                        "أجزاء محفوظة",
                                        "var(--br50)",
                                        "var(--br100)",
                                        "var(--br400)",
                                    ],
                                    [
                                        "7",
                                        "حفّاظ جدد",
                                        "var(--g50)",
                                        "var(--g100)",
                                        "var(--g600)",
                                    ],
                                ].map(([n, l, bg, border, color]) => (
                                    <div
                                        key={l}
                                        style={{
                                            background: bg,
                                            border: `1px solid ${border}`,
                                            borderRadius: "var(--radius-m)",
                                            padding: 14,
                                            textAlign: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontFamily:
                                                    "Tajawal,sans-serif",
                                                fontSize: 22,
                                                fontWeight: 900,
                                                color,
                                            }}
                                        >
                                            {n}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: "var(--n400)",
                                                marginTop: 2,
                                            }}
                                        >
                                            {l}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "var(--n400)",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    marginBottom: 12,
                                }}
                            >
                                أعلى الطلاب تقدماً
                            </div>
                            {[
                                {
                                    name: "سارة أحمد",
                                    detail: "الجزء 18 · البقرة",
                                    pct: 87,
                                    grad: "linear-gradient(135deg,var(--g400),var(--g700))",
                                    letter: "س",
                                },
                                {
                                    name: "عبدالرحمن خالد",
                                    detail: "الجزء 15 · آل عمران",
                                    pct: 74,
                                    grad: "linear-gradient(135deg,var(--br300),var(--br500))",
                                    letter: "ع",
                                },
                                {
                                    name: "نور الهدى",
                                    detail: "الجزء 12 · النساء",
                                    pct: 61,
                                    grad: "linear-gradient(135deg,var(--g300),var(--g600))",
                                    letter: "ن",
                                },
                            ].map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "12px 14px",
                                        borderRadius: "var(--radius-m)",
                                        border: "1px solid var(--n100)",
                                        marginBottom: 8,
                                        transition: ".2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor =
                                            "var(--g200)";
                                        e.currentTarget.style.background =
                                            "var(--g50)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor =
                                            "var(--n100)";
                                        e.currentTarget.style.background = "";
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "50%",
                                            background: r.grad,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 13,
                                            fontWeight: 800,
                                            color: "#fff",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {r.letter}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: "var(--n800)",
                                            }}
                                        >
                                            {r.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "var(--n400)",
                                                marginTop: 2,
                                            }}
                                        >
                                            {r.detail}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 80,
                                                height: 5,
                                                background: "var(--n100)",
                                                borderRadius: 100,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${r.pct}%`,
                                                    height: "100%",
                                                    borderRadius: 100,
                                                    background:
                                                        "linear-gradient(90deg,var(--g300),var(--g500))",
                                                }}
                                            />
                                        </div>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: "var(--n600)",
                                            }}
                                        >
                                            {r.pct}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    marginTop: 16,
                                }}
                            >
                                {[
                                    ["تنزيل PDF", "var(--g500)", "#fff"],
                                    ["تنزيل Excel", "var(--n0)", "var(--n700)"],
                                ].map(([label, bg, color]) => (
                                    <button
                                        key={label}
                                        style={{
                                            flex: 1,
                                            padding: "9px 0",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            background: bg,
                                            color,
                                            border:
                                                bg === "var(--n0)"
                                                    ? "1.5px solid var(--n200)"
                                                    : "none",
                                            borderRadius: "var(--radius-m)",
                                            cursor: "pointer",
                                            transition: ".2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.opacity =
                                                ".85";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.opacity = "1";
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`@media(max-width:768px){.showcase-grid{grid-template-columns:1fr!important;}}`}</style>
        </section>
    );
};

export default StatsN;
