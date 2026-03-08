// WhyHome.tsx - قسم "لماذا إتقان" كامل مع Multi-Tenant
import { motion } from "framer-motion";
import {
    MdPhoneIphone,
    MdLink,
    MdCalendarToday,
    MdSupport,
    MdAnalytics,
    MdSavings,
    MdLiveTv,
} from "react-icons/md";
import { FiCode } from "react-icons/fi";
import { GrPlan } from "react-icons/gr";
import {
    PiChalkboardTeacherDuotone,
    PiStudentDuotone,
    PiBookOpenDuotone,
    PiBrain,
    PiMicrophoneStage,
    PiChartLineUp,
    PiWallet,
    PiClock,
} from "react-icons/pi";
import { useState } from "react";

const WhyHome: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    const features = [
        {
            icon: PiBrain,
            title: "AI مساعد ذكي بالـ ",
            description:
                "مساعد ذكي يساعد المعلم في بناء الخطط التعليمية ويقترح أساليب تدريس مخصصة لكل طالب حسب مستواه واحتياجاته",
        },
        {
            icon: PiMicrophoneStage,
            title: "غرف التسميع الذكية",
            description:
                "غرف تسميع مخصصة لكل معلم وطالب مع تسجيل الشاشة، فتح الكاميرا، مشاركة الشاشة، ومراجعة الجلسات لاحقاً",
        },
        {
            icon: PiChartLineUp,
            title: "تقارير شاملة",
            description:
                "تقارير مفصلة لكل مجمع وطالب مع صفحة خاصة لولي الأمر لمتابعة تقدم ابنه/بِنْتُه اليومي والأسبوعي والشهري",
        },
        {
            icon: PiWallet,
            title: "إدارة المصروفات",
            description:
                "متابعة شاملة لمصروفات المجمع وعملية صرف المرتبات الشهرية لكل معلم وموظف تلقائياً (مشرف عام، مالي، طلاب، تحفيزي)",
        },
        {
            icon: PiClock,
            title: "تحضير المعلمين",
            description:
                "جدولة تحضير المعلمين مع تسجيل الحضور اليومي وإضافة مكافآت وتحفيزات للطلاب المتفوقين مباشرة من المنصة",
        },
        {
            icon: MdPhoneIphone,
            title: "المرونة",
            description:
                "إمكانية استعراض بوابة المعلم والطالب من خلال جميع أنواع الشاشات جهاز كمبيوتر – أجهزة لوحية – جوالات",
        },
        {
            icon: FiCode,
            title: "التطوير",
            description:
                "إضافات وتحسين مستمر لضمان تحقيق الأثر من استخدام المنصة على الميدان",
        },
        {
            icon: MdLink,
            title: "سجل الطالب",
            description:
                "رابط إلكتروني خاص بالطالب بدون اسم مستخدم أو كلمة مرور يستعرض من خلاله إنجازه اليومي بشكل واضح",
        },
        {
            icon: GrPlan,
            title: "الخطة التعليمية",
            description:
                "بناء خطة لكل طالب بسهولة بالغة فقط المطلوب تحديد الهدف اليومي للحفظ بالأسطر وللمراجعة بالأوجه",
        },
        {
            icon: MdCalendarToday,
            title: "تقويم دراسي",
            description:
                "بمجرد تحديد مشرف الحلقة لبداية ونهاية الدورة الدراسية وتحديد أيام العمل يخرج تقويم دراسي فوري",
        },
        {
            icon: MdPhoneIphone,
            title: "سهولة الاستخدام",
            description:
                "تدرج منطقي في العمليات ووضوح تام للإجراءات ويمكن استيعاب عمل المنصة وطريقتها في وقت قليل",
        },
        {
            icon: MdSupport,
            title: "التدريب",
            description:
                "للمشرف وللمعلمين على استخدام المنصة والمتابعة المستمرة في الأيام الأولى لضمان تحقيق أعلى استفادة ممكنة",
        },
    ];

    return (
        <div className="why-itqan" style={{ padding: "0 15%" }}>
            {/* من نحن Section */}
            <div className="about-section">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="section-title-add"
                >
                    لماذا إتقان
                </motion.h2>

                {/* Multi-Tenant Cards */}
                <div className="about-grid">
                    {/* Features Grid */}
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="about-card platform"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="card-icon">
                                <feature.icon size={40} />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                    <motion.div
                        className="about-card platform"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="card-icon">
                            <PiBookOpenDuotone size={40} />
                        </div>
                        <h3>ما هي إتقان</h3>
                        <p>
                            منصة متكاملة لإدارة الحلقات القرآنية النسائية - كل
                            حلقة لها إدارة مستقلة، تصميم منفصل، وتقارير خاصة
                            بها.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default WhyHome;
