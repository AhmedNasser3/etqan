// PlatformShowcase.tsx - سلايدر صور مع تحريك بالإصبع بدون thumbnails
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import img1 from "../../../assets/images/gadawel.png";
import img2 from "../../../assets/images/gadawel_2.png";
import img3 from "../../../assets/images/gadawel_3.png";
import img4 from "../../../assets/images/gadawel.png";

const slides = [
    {
        id: 1,
        image: img1,
    },
    {
        id: 2,
        image: img2,
    },
    {
        id: 3,
        image: img3,
    },
    {
        id: 4,
        image: img4,
    },
];

const PlatformShowcase: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);
    const startX = useRef(0);
    const currentX = useRef(0);
    const isDragging = useRef(false);

    // Auto progress
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Update progress
    useEffect(() => {
        setProgress(((currentSlide + 1) / slides.length) * 100);
    }, [currentSlide]);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }, []);

    // Touch/Mouse events للتحريك بالإصبع
    const handleStart = useCallback((clientX: number) => {
        startX.current = clientX;
        currentX.current = clientX;
        isDragging.current = true;
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd);
        document.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        document.addEventListener("touchend", handleEnd);
    }, []);

    const handleMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;
        currentX.current = e.clientX;
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging.current || !e.touches.length) return;
        e.preventDefault();
        currentX.current = e.touches[0].clientX;
    }, []);

    const handleEnd = useCallback(() => {
        if (!isDragging.current) return;

        const diff = startX.current - currentX.current;
        const threshold = 50; // عتبة الحركة

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }

        isDragging.current = false;
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleEnd);
    }, [nextSlide, prevSlide, handleMove, handleTouchMove]);

    return (
        <div className="platformShowcase">
            <div className="PlatformShowcase__inner">
                <div className="PlatformShowcase__content">
                    <motion.div
                        className="showcase-header"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h2 className="showcase-title">
                            لقطات من لوحة المجمعات
                        </h2>
                        <p>
                            اكتشف مميزات المنصة من خلال العروض المباشرة والصور
                            الواضحة
                        </p>
                    </motion.div>

                    {/* Main Slider */}
                    <div className="slider-container">
                        <div
                            ref={sliderRef}
                            className="slider-wrapper"
                            onMouseDown={(e) => handleStart(e.clientX)}
                            onTouchStart={(e) =>
                                handleStart(e.touches[0].clientX)
                            }
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    className="slide-image"
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <img
                                        src={slides[currentSlide].image}
                                        alt={slides[currentSlide].title}
                                        loading="lazy"
                                    />
                                    <div className="image-overlay">
                                        <h3>{slides[currentSlide].title}</h3>
                                        <p>
                                            {slides[currentSlide].description}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Progress Bar */}
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
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
                </div>
            </div>
        </div>
    );
};

export default PlatformShowcase;
