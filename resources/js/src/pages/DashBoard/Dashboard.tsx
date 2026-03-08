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

const Dashboard: React.FC = () => {
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
        <div className="dashboard">
            <HomeN />
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
            <div className="dashboard__complexes">
                <Complexes />
            </div>
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
            <div className="contactForm" style={{ margin: "24px 0" }}>
                <div className="testimonials__mainTitle">
                    <h1>اسألة شائعة</h1>
                </div>
                {faqQuestions.map((faq, index) => (
                    <FAQItem
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                    />
                ))}{" "}
            </div>
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
