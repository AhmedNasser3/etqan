import Footer from "@/src/layouts/Footer";
import CenterAdd from "./home/CenterAdd";
import Complexes from "./home/Complexes";
import ContactForm from "./home/contactForm";
import Features from "./home/Features";
import FinalCTA from "./home/FinalCTA";
import Home from "./home/Home";
import HowItWorksSection from "./home/HowItWorksSection";
import PlatformShowcase from "./home/PlatformShowcase";
import Security from "./home/Security";
import Stats from "./home/Stats";
import StudentTestimonials from "./home/StudentTestimonials";
import Testimonials from "./home/Testimonials";
import Trusted from "./home/Trusted";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import SHero from "./home/SHero";
import Info from "./home/Info";
import HomeN from "./home/NewTheme/HomeN";
import WhyHome from "./home/NewTheme/WhyHome";
import InfoN from "./home/NewTheme/InfoN";
import StatsN from "./home/NewTheme/StatsN";
import FAQItem from "./home/NewTheme/FAQItem";
import QuranPlan from "./QuranPlan";
import QuranCirclesMock from "./home/NewTheme/QuranCircles";
import { useState, useEffect, useRef } from "react";

const Dashboard: React.FC = () => {
    const reviews = [
        {
            name: "أ. محمد العمري",
            role: "مدير مجمع الفرقان القرآني",
            text: "منصة إتقان غيّرت طريقة إدارة مجمعنا بالكامل. أصبحنا نوفّر أكثر من 6 ساعات يومياً في تسجيل الحضور وإعداد التقارير.",
            grad: "linear-gradient(135deg,#1e8f61,#0f5439)",
            letter: "م",
        },
        {
            name: "أ. فاطمة السعدي",
            role: "مشرفة دار تحفيظ نور الهدى",
            text: "بوابة أولياء الأمور أحدثت فارقاً كبيراً. أصبح الأهالي يتابعون تقدم أبنائهم لحظة بلحظة وتوقفنا عن الرد على مئات الاتصالات اليومية.",
            grad: "linear-gradient(135deg,#a8733f,#8a5a2d)",
            letter: "ف",
        },
        {
            name: "أ. خالد المطيري",
            role: "معلم ومشرف حلقات تحفيظ",
            text: "غرف التسميع الذكية ومساعد الذكاء الاصطناعي جعلا تجربتي كمعلم أكثر احترافية. أستطيع الآن بناء خطة تعليمية لكل طالب في دقائق.",
            grad: "linear-gradient(135deg,#38a879,#15724e)",
            letter: "خ",
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
    /* ─────────────────────────────────────────
       HOOK: scroll reveal
    ───────────────────────────────────────── */
    function useReveal() {
        useEffect(() => {
            const els = document.querySelectorAll(
                ".reveal,.reveal-left,.reveal-right",
            );
            const obs = new IntersectionObserver(
                (entries) => {
                    entries.forEach((e) => {
                        if (e.isIntersecting) {
                            e.target.classList.add("in");
                            obs.unobserve(e.target);
                        }
                    });
                },
                { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
            );
            els.forEach((el) => obs.observe(el));
            return () => obs.disconnect();
        });
    }
    useReveal();

    const globalStyle = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:wght@400;700&display=swap');

:root {
  --g50:#f0faf5;--g100:#d6f0e3;--g200:#a8dfc5;--g300:#6cc49f;
  --g400:#38a879;--g500:#1e8f61;--g600:#15724e;--g700:#0f5439;--g800:#0a3a28;
  --br50:#fdf8f3;--br100:#f5e8d5;--br200:#e8cba8;--br300:#c9996a;--br400:#a8733f;--br500:#8a5a2d;
  --n0:#fff;--n50:#f8fafc;--n100:#f1f5f9;--n200:#e2e8f0;--n300:#cbd5e1;
  --n400:#94a3b8;--n500:#64748b;--n600:#475569;--n700:#334155;--n800:#1e293b;--n900:#0f172a;
  --radius-s:6px;--radius-m:12px;--radius-l:20px;--radius-xl:28px;
  --shadow-s:0 1px 4px rgba(0,0,0,.06);--shadow-m:0 4px 20px rgba(0,0,0,.08);
  --shadow-l:0 12px 48px rgba(0,0,0,.10);--shadow-xl:0 24px 64px rgba(0,0,0,.12);
  --nav-h:72px;--max-w:1280px;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;font-size:16px;}
body{font-family:'Tajawal',sans-serif;background:#fff;color:var(--n800);overflow-x:hidden;direction:rtl;-webkit-font-smoothing:antialiased;}
a{text-decoration:none;color:inherit;}
button{font-family:'Tajawal',sans-serif;cursor:pointer;border:none;outline:none;}
ul{list-style:none;}
img{max-width:100%;display:block;}

/* Scroll reveal */
.reveal{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .65s ease;}
.reveal.in{opacity:1;transform:none;}
.reveal-left{opacity:0;transform:translateX(32px);transition:opacity .65s ease,transform .65s ease;}
.reveal-left.in{opacity:1;transform:none;}
.reveal-right{opacity:0;transform:translateX(-32px);transition:opacity .65s ease,transform .65s ease;}
.reveal-right.in{opacity:1;transform:none;}

/* Pulse dot */
@keyframes pulse{0%,100%{box-shadow:0 0 0 3px var(--g100);}50%{box-shadow:0 0 0 6px rgba(56,168,121,.1);}}
@keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-9px);}}
@keyframes marqueeRtl{from{transform:translateX(0);}to{transform:translateX(-50%);}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}

/* Mobile menu */
.mobile-menu{
  position:fixed;top:var(--nav-h);right:0;left:0;z-index:800;
  background:#fff;border-bottom:1px solid var(--n200);
  padding:20px 24px;display:flex;flex-direction:column;gap:8px;
  box-shadow:var(--shadow-l);
  animation:fadeInUp .2s ease;
}
.mobile-menu a,.mobile-menu button{
  padding:12px 16px;border-radius:var(--radius-m);font-size:15px;font-weight:600;
  color:var(--n700);background:none;border:none;text-align:right;cursor:pointer;
  transition:.15s;
}
.mobile-menu a:hover{background:var(--g50);color:var(--g600);}
.mobile-menu .mm-cta{background:var(--g500);color:#fff;text-align:center;border-radius:var(--radius-m);}
.mobile-menu .mm-cta:hover{background:var(--g600);}
@media (max-width: 768px) {
  body, .main-container { /* غير .main-container بكونتينرك الرئيسي */
    padding: 0 !important;
    margin: 0 !important;
    width: 100vw;
    overflow-x: hidden;
  }
}html, body {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* يخفي التمرير الأفقي */
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* للـ viewport meta tag في HTML head (مهم جداً) */
@supports (-webkit-touch-callout: none) {
  /* للموبايل */
  html, body {
    position: relative;
    left: 0;
  }
}
`;

    const faqQuestions = [
        {
            question: "كيف انشيئ مجمعي؟",
            answer: "بداية خطوتك هي الذهاب الي زر انشاء مجمعك في اعلي الموقع",
        },
        {
            question: "ماذا بعد التسجيل؟",
            answer: `ستحصل على لوحة تحكم تشمل:

- سجل حضور الموظفين والطلاب
- رواتب الموظفين وإعداداتها
- غرف تسميع والحجز
- مساعد AI ذكي 24/7
- تحكم بمواعيد الجداول والخطط
- إدارة المساجد والحلقات
- إدارة الخطط التعلمية
- اعتماد المعلمين والطلاب
- الإدارة المالية الكاملة
- إدارة التحفيزات والجوائز
- سجل الإجراءات والتقارير`,
        },
        {
            question: "كيف أوظف معلمين و أسجل طلاب",
            answer: `بعد التسجيل ينشأ رابط خاص بمجمعك تلقائياً.

**الطريقة:**
1. أرسل الرابط لموظفيك وطلابك
2. يختارون **"موظف"** أو **"طالب"** عند التسجيل
3. يملأون بياناتهم ويتم ارسالهم اليك فوراً

**بسيط وسريع - كل شيء من رابط واحد!**`,
        },
    ];
    return (
        <div className="dashboard" style={{ direction: "rtl" }}>
            <style>{globalStyle}</style>

            <SHero />
            {/* <SHero /> */}
            <div className="dashboard__features">
                <Features />
            </div>
            {/* <div className="dashboard__stats">
                <CenterAdd />
                </div> */}
            <div className="dashboard__stats">
                <WhyHome />
            </div>
            <InfoN />
            {/* <Info /> */}
            <div className="dashboard__stats">
                <StatsN />
            </div>
            {/* <div className="dashboard__stats">
                <Stats />
                </div> */}
            {/* <Home /> */}
            <div className="dashboard__finalCTA">
                <QuranCirclesMock />
            </div>
            {/* <div className="dashboard__complexes">
                <Complexes />
            </div> */}
            <div className="dashboard__howItWorksSection">
                <HowItWorksSection />
            </div>
            {/* <div className="dashboard__stats">
                <PlatformShowcase />
            </div> */}
            {/* <div className="dashboard__studentTestimonials">
                <StudentTestimonials />
            </div> */}
            <div className="dashboard__security">
                <Security />
            </div>
            {/* <div className="dashboard__trusted">
                <Trusted />
            </div> */}
            {/* <div className="dashboard__finalCTA">
                <QuranPlan />
            </div> */}
            <div className="dashboard__finalCTA">
                <FinalCTA />
            </div>

            {/* <div className="dashboard__testimonials">
                <Testimonials />
                </div> */}
            <section
                id="testimonials"
                style={{
                    padding: "clamp(60px,8vw,100px) 15%",
                }}
            >
                <SectionHead
                    label="آراء العملاء"
                    title='ماذا يقول <span style="color:var(--g500)">مستخدمو إتقان</span>'
                    desc="آلاف المجمعات القرآنية حول العالم تثق في منصة إتقان لإدارة حلقاتها."
                />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: 24,
                    }}
                    className="testi-grid"
                >
                    {reviews.map((r, i) => (
                        <div
                            key={i}
                            className="reveal"
                            style={{
                                background: "var(--n0)",
                                border: "1px solid var(--n200)",
                                borderRadius: "var(--radius-xl)",
                                padding: 32,
                                transition: ".25s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow =
                                    "var(--shadow-l)";
                                e.currentTarget.style.borderColor =
                                    "var(--g200)";
                                e.currentTarget.style.transform =
                                    "translateY(-4px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = "";
                                e.currentTarget.style.borderColor =
                                    "var(--n200)";
                                e.currentTarget.style.transform = "";
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    marginBottom: 20,
                                }}
                            >
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "50%",
                                        background: r.grad,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 17,
                                        fontWeight: 800,
                                        color: "#fff",
                                        flexShrink: 0,
                                    }}
                                >
                                    {r.letter}
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 800,
                                            color: "var(--n900)",
                                        }}
                                    >
                                        {r.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "var(--n400)",
                                            marginTop: 2,
                                        }}
                                    >
                                        {r.role}
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    color: "#f59e0b",
                                    fontSize: 13,
                                    letterSpacing: 1,
                                    marginBottom: 14,
                                }}
                            >
                                ★★★★★
                            </div>
                            <div
                                style={{
                                    fontFamily: "Amiri,serif",
                                    fontSize: 36,
                                    color: "var(--g200)",
                                    lineHeight: 1,
                                    marginBottom: 8,
                                }}
                            >
                                "
                            </div>
                            <p
                                style={{
                                    fontSize: 14,
                                    color: "var(--n600)",
                                    lineHeight: 1.9,
                                }}
                            >
                                {r.text}
                            </p>
                        </div>
                    ))}
                </div>
                <style>{`
        @media(max-width:900px){.testi-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:560px){.testi-grid{grid-template-columns:1fr!important;}}
      `}</style>
            </section>
            <div className="dashboard__ContactForm">
                <i>
                    <ContactForm />
                </i>
            </div>
            <div className="dashboard__WhatsApp">
                <i>
                    <PiWhatsappLogoDuotone />
                </i>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;
