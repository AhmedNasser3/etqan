// CenterAdd.tsx - مع قسم "من نحن" كامل + توضيح Multi-Tenant
import { motion } from "framer-motion";
import { PiStudentDuotone } from "react-icons/pi";
import { PiChalkboardTeacherDuotone } from "react-icons/pi";
import { GrPlan } from "react-icons/gr";
import { PiBookOpenDuotone } from "react-icons/pi";
import { useState } from "react";

const CenterAdd: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="centerAdd">
            <div className="CenterAdd__inner">
                <div className="CenterAdd__content">
                    <motion.div
                        className="CenterAdd_data"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="CenterAdd__box">
                            {/* من نحن Section */}
                            <div className="about-section">
                                <motion.h2
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                    className="section-title"
                                >
                                    من نحن؟
                                </motion.h2>

                                <div className="about-grid">
                                    <motion.div
                                        className="about-card platform"
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.6,
                                            delay: 0.8,
                                        }}
                                    >
                                        <div className="card-icon">
                                            <PiBookOpenDuotone />
                                        </div>
                                        <h3>ما هي إتقان</h3>
                                        <p>
                                            منصة متكاملة لإنشاء مجمعات قرآنية
                                            مستقلة - كل مجمع له دومين خاص، تصميم
                                            منفصل، وإدارة كاملة.
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        className="about-card why"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            duration: 0.6,
                                            delay: 1.0,
                                        }}
                                    >
                                        <div className="card-icon">
                                            <PiChalkboardTeacherDuotone />
                                        </div>
                                        <h3>لماذا إتقان</h3>
                                        <p>
                                            أقوى منصة لتعليم القرآن عالمياً تدير
                                            آلاف المجمعات بتقنية Multi-Tenant
                                            متقدمة مع أداء فائق السرعة.
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        className="about-card what"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.6,
                                            delay: 1.2,
                                        }}
                                    >
                                        <div className="card-icon">
                                            <PiStudentDuotone />
                                        </div>
                                        <h3>ماذا نقدم؟</h3>
                                        <p>
                                            مجمعات قرآنية كاملة مع دروس،
                                            اختبارات، حضور، جدولة، وتطبيق
                                            موبايل.
                                        </p>
                                    </motion.div>
                                </div>
                            </div>
                            {/* Hero Section */}
                            <div className="centerAdd__hero">
                                <div className="centerAdd__title">
                                    <motion.h1
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            duration: 0.6,
                                            delay: 0.2,
                                        }}
                                    >
                                        ابدأ رحلتك القرآنية الآن
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 0.4,
                                        }}
                                    >
                                        أنشئ مجمعك القرآني الخاص واحصل على أحدث
                                        الأدوات والتقنيات لتعليم القرآن بكفاءة
                                        عالية وتجربة متميزة للطلاب والمعلمين.
                                    </motion.p>
                                </div>

                                <div
                                    className="centerAdd__btn"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <motion.a
                                        href="/center-register"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <motion.button
                                            animate={
                                                isHovered
                                                    ? { scale: [1, 1.05, 1] }
                                                    : {}
                                            }
                                            transition={{ duration: 0.3 }}
                                        >
                                            أنشئ مجمعك الآن
                                        </motion.button>
                                    </motion.a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CenterAdd;
