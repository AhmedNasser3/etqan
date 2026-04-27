import { useEffect, useState } from "react";
import { BsPatchCheckFill } from "react-icons/bs";
import { motion, useAnimation } from "framer-motion";

const SHero: React.FC = () => {
    const [counter, setCounter] = useState(0);
    const controls = useAnimation();

    useEffect(() => {
        controls.start("visible");
    }, [controls]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        const startCounter = () => {
            interval = setInterval(() => {
                setCounter((prev) => {
                    if (prev >= 318) {
                        clearInterval(interval!);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 30);
        };

        const timeout = setTimeout(startCounter, 1000);
        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    };

    return (
        <>
            <main id="main">
                <section
                    style={{
                        position: "relative",
                        overflow: "hidden",
                        paddingTop:
                            "calc(var(--nav-h) + clamp(60px,8vw,100px))",
                        paddingBottom: "clamp(60px,8vw,100px)",
                        background: "var(--n0)",
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        padding: "0 17%",
                        justifyContent: "center",
                    }}
                >
                    {/* BG */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            overflow: "hidden",
                        }}
                        aria-hidden="true"
                    >
                        <div
                            style={{
                                position: "absolute",
                                width: "clamp(300px,55vw,700px)",
                                height: "clamp(300px,55vw,700px)",
                                top: "-15%",
                                left: "-10%",
                                borderRadius: "50%",
                                background:
                                    "radial-gradient(circle,var(--g100) 0%,transparent 70%)",
                                opacity: 0.7,
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                width: "clamp(200px,40vw,500px)",
                                height: "clamp(200px,40vw,500px)",
                                bottom: "-10%",
                                right: "-5%",
                                borderRadius: "50%",
                                background:
                                    "radial-gradient(circle,var(--br100) 0%,transparent 70%)",
                                opacity: 0.5,
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                backgroundImage:
                                    "linear-gradient(rgba(30,143,97,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(30,143,97,.04) 1px,transparent 1px)",
                                backgroundSize: "52px 52px",
                            }}
                        />
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr clamp(280px,38vw,480px)",
                            gap: "clamp(40px,6vw,80px)",
                            alignItems: "center",
                            position: "relative",
                            zIndex: 1,
                        }}
                        className="hero-grid"
                    >
                        {/* Text */}
                        <div>
                            <div style={{ marginBottom: 24 }}>
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 10,
                                        background: "var(--g50)",
                                        border: "1px solid var(--g200)",
                                        padding: "6px 16px",
                                        borderRadius: 100,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: "var(--g700)",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: "50%",
                                            background: "var(--g400)",
                                            animation:
                                                "pulse 2.5s ease infinite",
                                        }}
                                    />
                                    الخيار المثالي للحلقات والدور النسائية
                                </div>
                            </div>
                            <h1
                                style={{
                                    fontFamily: "Tajawal,sans-serif",
                                    fontSize: "clamp(2.2rem,4.2vw,3.8rem)",
                                    fontWeight: 900,
                                    lineHeight: 1.15,
                                    color: "var(--n900)",
                                    marginBottom: 24,
                                    letterSpacing: "-.5px",
                                }}
                            >
                                نظام{" "}
                                <span
                                    style={{
                                        background:
                                            "linear-gradient(135deg,var(--g500),var(--g700))",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    إتقان
                                </span>
                                <br />
                                لخدمة الجهات
                                <br />
                                <span
                                    style={{
                                        background:
                                            "linear-gradient(135deg,var(--br300),var(--br500))",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    القرآنية
                                </span>
                            </h1>
                            <p
                                style={{
                                    fontSize: "clamp(15px,1.5vw,17px)",
                                    color: "var(--n500)",
                                    lineHeight: 1.9,
                                    marginBottom: 36,
                                    maxWidth: 540,
                                }}
                            >
                                منصة إتقان تُعنى بتقديم حلول رقمية مبتكرة لإدارة
                                شؤون الحلقات القرآنية والدور النسائية — من تسجيل
                                الطلاب وتدوين إنجازاتهم إلى التقارير الدقيقة
                                لولي الأمر والمشرف في مكان واحد.
                            </p>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 14,
                                    flexWrap: "wrap",
                                    marginBottom: 52,
                                }}
                            >
                                <a
                                    href="/center-register"
                                    style={{
                                        padding: "16px 36px",
                                        fontSize: "clamp(14px,1.5vw,16px)",
                                        fontWeight: 700,
                                        background: "var(--g500)",
                                        color: "#fff",
                                        borderRadius: "var(--radius-l)",
                                        boxShadow:
                                            "0 4px 18px rgba(30,143,97,.30)",
                                        transition: "all .22s",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            "var(--g600)";
                                        e.currentTarget.style.transform =
                                            "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "var(--g500)";
                                        e.currentTarget.style.transform = "";
                                    }}
                                >
                                    أنشئ مجمعك الآن
                                </a>
                                <a
                                    href="#features"
                                    style={{
                                        padding: "16px 36px",
                                        fontSize: "clamp(14px,1.5vw,16px)",
                                        fontWeight: 700,
                                        background: "var(--n0)",
                                        color: "var(--n700)",
                                        border: "1.5px solid var(--n200)",
                                        borderRadius: "var(--radius-l)",
                                        boxShadow: "var(--shadow-s)",
                                        transition: "all .22s",
                                        display: "inline-flex",
                                        alignItems: "center",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor =
                                            "var(--g300)";
                                        e.currentTarget.style.color =
                                            "var(--g600)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor =
                                            "var(--n200)";
                                        e.currentTarget.style.color =
                                            "var(--n700)";
                                    }}
                                >
                                    استكشف المميزات
                                </a>
                            </div>
                            {/* Stats */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "clamp(16px,3vw,32px)",
                                    flexWrap: "wrap",
                                }}
                            >
                                {[
                                    ["15,623+", "طالب مسجَّل"],
                                    ["847+", "مسجد وحلقة"],
                                    ["97%", "رضا الجهات المستفيدة"],
                                ].map(([num, label], i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "clamp(16px,3vw,32px)",
                                        }}
                                    >
                                        {i > 0 && (
                                            <div
                                                style={{
                                                    width: 1,
                                                    height: 36,
                                                    background: "var(--n200)",
                                                }}
                                            />
                                        )}
                                        <div>
                                            <div
                                                style={{
                                                    fontFamily:
                                                        "Tajawal,sans-serif",
                                                    fontSize:
                                                        "clamp(18px,2.5vw,24px)",
                                                    fontWeight: 900,
                                                    color: "var(--n900)",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {num}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "var(--n400)",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {label}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dashboard Card */}
                        <div
                            style={{ position: "relative" }}
                            className="hero-visual"
                        >
                            <div
                                style={{
                                    animation: "floatY 4s ease-in-out infinite",
                                    position: "absolute",
                                    top: -24,
                                    left: -52,
                                    background: "var(--n0)",
                                    border: "1px solid var(--n200)",
                                    borderRadius: "var(--radius-l)",
                                    padding: "12px 16px",
                                    boxShadow: "var(--shadow-l)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    whiteSpace: "nowrap",
                                    zIndex: 2,
                                }}
                            >
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 9,
                                        background: "var(--g100)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
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
                                        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <strong
                                        style={{
                                            display: "block",
                                            fontSize: 13,
                                            fontWeight: 800,
                                            color: "var(--n800)",
                                        }}
                                    >
                                        سارة أحمد
                                    </strong>
                                    <span
                                        style={{
                                            fontSize: 10,
                                            color: "var(--n400)",
                                        }}
                                    >
                                        أتمّت الجزء الثالث
                                    </span>
                                </div>
                            </div>

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
                                            "linear-gradient(135deg,var(--g600),var(--g800))",
                                        padding: "20px 24px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            background: "rgba(255,255,255,.15)",
                                            borderRadius: 9,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <svg
                                            width={18}
                                            height={18}
                                            viewBox="0 0 24 24"
                                            fill="#fff"
                                        >
                                            <path d="M12 2a9 9 0 0 1 9 9c0 4.5-3 8.7-6.3 11.3a4.2 4.2 0 0 1-5.4 0C6 19.7 3 15.5 3 11a9 9 0 0 1 9-9z" />
                                        </svg>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                fontWeight: 800,
                                                color: "#fff",
                                            }}
                                        >
                                            حلقة الإمام البخاري
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "rgba(255,255,255,.6)",
                                            }}
                                        >
                                            لوحة الإشراف
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            background: "rgba(255,255,255,.15)",
                                            border: "1px solid rgba(255,255,255,.2)",
                                            color: "#fff",
                                            padding: "4px 12px",
                                            borderRadius: 100,
                                            fontSize: 11,
                                            fontWeight: 700,
                                        }}
                                    >
                                        مباشر
                                    </div>
                                </div>
                                <div style={{ padding: 20 }}>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "repeat(3,1fr)",
                                            gap: 10,
                                            marginBottom: 18,
                                        }}
                                    >
                                        {[
                                            ["247", "طالب"],
                                            ["12", "معلّم"],
                                            ["189", "حافظ"],
                                        ].map(([n, l]) => (
                                            <div
                                                key={l}
                                                style={{
                                                    background: "var(--g50)",
                                                    border: "1px solid var(--g100)",
                                                    borderRadius:
                                                        "var(--radius-m)",
                                                    padding: "14px 10px",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontFamily:
                                                            "Tajawal,sans-serif",
                                                        fontSize: 20,
                                                        fontWeight: 900,
                                                        color: "var(--g600)",
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
                                            marginBottom: 10,
                                        }}
                                    >
                                        جلسات اليوم
                                    </div>
                                    {[
                                        {
                                            name: "المجموعة الأولى — تحفيظ",
                                            time: "08:00",
                                            chip: "جارية",
                                            dotColor: "var(--g400)",
                                            chipStyle: {
                                                background:
                                                    "rgba(30,143,97,.12)",
                                                color: "var(--g600)",
                                            },
                                        },
                                        {
                                            name: "المجموعة الثانية — مراجعة",
                                            time: "10:30",
                                            chip: "قادمة",
                                            dotColor: "var(--br300)",
                                            chipStyle: {
                                                background:
                                                    "rgba(168,115,63,.12)",
                                                color: "var(--br400)",
                                            },
                                        },
                                        {
                                            name: "الدور النسائي — عصراً",
                                            time: "16:00",
                                            chip: "مجدولة",
                                            dotColor: "var(--n300)",
                                            chipStyle: {
                                                background: "var(--n100)",
                                                color: "var(--n500)",
                                            },
                                        },
                                    ].map((s, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                padding: "10px 12px",
                                                borderRadius: "var(--radius-m)",
                                                border: "1px solid var(--n100)",
                                                background: "var(--n50)",
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
                                                e.currentTarget.style.background =
                                                    "var(--n50)";
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    background: s.dotColor,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    color: "var(--n700)",
                                                    flex: 1,
                                                }}
                                            >
                                                {s.name}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    color: "var(--n400)",
                                                }}
                                            >
                                                {s.time}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    padding: "2px 8px",
                                                    borderRadius: 100,
                                                    ...s.chipStyle,
                                                }}
                                            >
                                                {s.chip}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div
                                style={{
                                    animation:
                                        "floatY 4s ease-in-out -2.2s infinite",
                                    position: "absolute",
                                    bottom: 40,
                                    left: -56,
                                    background: "var(--n0)",
                                    border: "1px solid var(--n200)",
                                    borderRadius: "var(--radius-l)",
                                    padding: "12px 16px",
                                    boxShadow: "var(--shadow-l)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    whiteSpace: "nowrap",
                                    zIndex: 2,
                                }}
                            >
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 9,
                                        background: "var(--g100)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
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
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                        <polyline points="17 6 23 6 23 12" />
                                    </svg>
                                </div>
                                <div>
                                    <strong
                                        style={{
                                            display: "block",
                                            fontSize: 13,
                                            fontWeight: 800,
                                            color: "var(--n800)",
                                        }}
                                    >
                                        نسبة الحضور
                                    </strong>
                                    <span
                                        style={{
                                            fontSize: 10,
                                            color: "var(--n400)",
                                        }}
                                    >
                                        ارتفعت 94% هذا الأسبوع
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <style>{`
        @media(max-width:900px){ .hero-grid{ grid-template-columns:1fr!important; } .hero-visual{display:none!important;} }
      `}</style>
                </section>
            </main>
        </>
    );
};

export default SHero;
