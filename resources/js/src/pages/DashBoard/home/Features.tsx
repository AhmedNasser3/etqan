import { motion } from "framer-motion";
import { FaBook, FaChartLine, FaGift, FaRobot } from "react-icons/fa";
import { BsCameraReelsFill } from "react-icons/bs";

const etqanFeatures = [
    {
        Icon: FaBook,
        title: "حضور ذكي",
        desc: "تتبع الحضور بالبصمة/QR مع تنبيهات فورية",
    },
    {
        Icon: BsCameraReelsFill,
        title: "غرف تسميع",
        desc: "تسميع عن بعد مع تسجيل الجلسات",
    },
    {
        Icon: FaChartLine,
        title: "تقارير شاملة",
        desc: "PDF/Excel مع إحصائيات الحفظ والغياب",
    },
    {
        Icon: FaGift,
        title: "نظام تحفيز",
        desc: "جوائز وشهادات تلقائية للمتفوقين",
    },
    {
        Icon: FaRobot,
        title: "مساعد AI",
        desc: "تلخيص الجلسات واقتراحات تعليمية",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 50,
        scale: 0.8,
        rotateX: -20,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const Features: React.FC = () => {
    return (
        <motion.div
            className="features"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="features__inner">
                {etqanFeatures.map((feature, index) => (
                    <motion.div
                        className="features__content"
                        variants={itemVariants}
                        key={index}
                    >
                        <div className="features__icons">
                            <motion.i
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: index * 0.01,
                                    type: "spring",
                                    stiffness: 300,
                                }}
                                whileHover={{ rotate: "15deg", scale: 1.1 }}
                            >
                                <feature.Icon />
                            </motion.i>
                        </div>

                        <div className="features__title">
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 + 0.2 }}
                            >
                                {feature.title}
                            </motion.h3>
                        </div>
                        <div className="features__description">
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 + 0.3 }}
                            >
                                {feature.desc}
                            </motion.p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Features;
