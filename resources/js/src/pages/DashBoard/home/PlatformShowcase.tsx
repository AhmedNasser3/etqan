// PlatformShowcase.tsx - صور بدل الأيقونز
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import {
    PiStudentDuotone,
    PiChalkboardTeacherDuotone,
    PiBookOpenDuotone,
    PiGlobeDuotone,
    PiPhoneCallDuotone,
} from "react-icons/pi";
import { GrPlan } from "react-icons/gr";
import img1 from "../../../assets/images/الخطط.png";
import img2 from "../../../assets/images/ادارة معلمين وطلاب.png";
import img3 from "../../../assets/images/جدولة.png";
import img4 from "../../../assets/images/تفاصيل الخطط.png";
const slides = [
    {
        id: 1,
        title: "انشاء الخطط لطلابك",
        description: "إدارة كاملة للطلاب والمعلمين والحصص بكل سهولة",
        image: img1, // ✅ ضع صورة لوحة التحكم
    },
    {
        id: 2,
        title: "ادارة لموظفينك وطلابك",
        description: "ادر الموظفين والطلاب بكل سهولة",
        image: img2, // ✅ ضع صورة الدروس
    },
    {
        id: 3,
        title: "جدولة ذكية",
        description: "تنظيم الحصص والأوقات تلقائياً مع تذكيرات",
        image: img3, // ✅ ضع صورة الجدولة
    },
    {
        id: 4,
        title: "فصل الخطة علي حسب رغبتك",
        description: "ادارة للخطة متقدمة تساعدك علي تخطي اي مرحلة بسهولة",
        image: img4, // ✅ ضع صورة التطبيق
    },
];

const PlatformShowcase: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }, []);

    return (
        <div className="platformShowcase">
            <div className="PlatformShowcase__inner">
                <div className="PlatformShowcase__content">
                    <motion.div
                        className="showcase-header"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="showcase-title">
                            لقطات من لوحة المجمعات
                        </h2>
                        <p>اكتشف مميزات المنصة من خلال العروض المباشرة</p>
                    </motion.div>

                    {/* Main Slider */}
                    <div className="slider-container">
                        <div className="slider-wrapper">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    className="slide-image"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="image-placeholder">
                                        <img
                                            src={slides[currentSlide].image}
                                            alt={slides[currentSlide].title}
                                            className="slide-image-main"
                                        />
                                        <div className="image-overlay">
                                            <h3>
                                                {slides[currentSlide].title}
                                            </h3>
                                            <p>
                                                {
                                                    slides[currentSlide]
                                                        .description
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Slide Indicators */}
                            <div className="slide-indicators">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`indicator ${currentSlide === index ? "active" : ""}`}
                                        onClick={() => setCurrentSlide(index)}
                                        aria-label={`الانتقال للشريحة ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                className="nav-arrow prev"
                                onClick={prevSlide}
                            >
                                ‹
                            </button>
                            <button
                                className="nav-arrow next"
                                onClick={nextSlide}
                            >
                                ›
                            </button>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="thumbnails">
                        {slides.map((slide, index) => (
                            <motion.div
                                key={slide.id}
                                className={`thumbnail ${currentSlide === index ? "active" : ""}`}
                                onClick={() => setCurrentSlide(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="thumbnail-image"
                                />
                                <span>{slide.title}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformShowcase;
