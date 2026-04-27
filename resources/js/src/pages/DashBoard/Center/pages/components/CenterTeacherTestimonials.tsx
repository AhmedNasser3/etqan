// components/CenterTeacherTestimonials.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useCenterTeachers } from "../hooks/useCenterTeachers";
import facelessAvatar from "../../../../../assets/images/facelessAvatar.png";

interface Testimonial {
    id: number;
    img: string;
    name: string;
    title: string;
}

const CenterTeacherTestimonials: React.FC = () => {
    const { teachers: testimonials, loading, error } = useCenterTeachers();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideWidth, setSlideWidth] = useState(374);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    if (error) {
        return (
            <div className="qtestimonials">
                <div className="qtestimonials__header">
                    <h2
                        className="qtestimonials__title"
                        style={{ color: "var(--qt-danger, #e74c3c)" }}
                    >
                        خطأ في تحميل المعلمين: {error}
                    </h2>
                </div>
            </div>
        );
    }

    const getSlideWidth = useCallback(() => {
        if (window.innerWidth <= 480) return 320;
        if (window.innerWidth <= 768) return 340;
        return 374;
    }, []);

    const visibleCards = useCallback(
        () => (window.innerWidth <= 768 ? 1 : 4),
        [],
    );
    const maxIndex = useCallback(
        () => Math.max(0, testimonials.length - visibleCards()),
        [testimonials.length, visibleCards],
    );

    useEffect(() => {
        const handleResize = () => {
            setSlideWidth(getSlideWidth());
            const mi = maxIndex();
            if (currentIndex > mi) setCurrentIndex(Math.max(0, mi));
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [testimonials.length, getSlideWidth, maxIndex, currentIndex]);

    const nextSlide = useCallback(() => {
        setCurrentIndex((p) => Math.min(p + 1, maxIndex()));
    }, [maxIndex]);

    const prevSlide = useCallback(
        () => setCurrentIndex((p) => Math.max(p - 1, 0)),
        [],
    );

    const goToSlide = useCallback(
        (i: number) => setCurrentIndex(Math.max(0, Math.min(i, maxIndex()))),
        [maxIndex],
    );

    if (loading || testimonials.length === 0) {
        return (
            <div className="qtestimonials">
                <div className="qtestimonials__header">
                    <h2 className="qtestimonials__title">
                        لا يوجد معلمين لهذا المجمع
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="qtestimonials qtestimonials--teachers">
            <div className="qtestimonials__header">
                <span className="qtestimonials__label">معلمونا</span>
                <h2 className="qtestimonials__title">المعلمون الخاصون بنا</h2>
                <button className="qtestimonials__all-btn">
                    جميع المعلمين
                </button>
            </div>

            <div className="qtestimonials__viewport">
                <div
                    className="qtestimonials__track"
                    ref={testimonialsRef}
                    style={{
                        transform: `translateX(-${currentIndex * slideWidth}px)`,
                        transition: "transform 0.3s ease-in-out",
                    }}
                >
                    {testimonials.map((t: Testimonial) => (
                        <div key={t.id} className="qtestimonials__card">
                            <div className="qtestimonials__avatar qtestimonials__avatar--teacher">
                                <img
                                    src={facelessAvatar}
                                    alt={t.name}
                                    loading="lazy"
                                />
                            </div>
                            <div className="qtestimonials__info">
                                <h3>{t.name}</h3>
                                <p>{t.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="qtestimonials__controls">
                <button
                    className="qtestimonials__nav-btn"
                    onClick={nextSlide}
                    disabled={currentIndex === maxIndex()}
                    aria-label="التالي"
                    style={{ opacity: currentIndex === maxIndex() ? 0.4 : 1 }}
                >
                    <IoIosArrowForward />
                </button>
                <div className="qtestimonials__dots">
                    {Array.from(
                        { length: Math.max(1, maxIndex() + 1) },
                        (_, i) => (
                            <button
                                key={i}
                                className={`qtestimonials__dot${currentIndex === i ? " qtestimonials__dot--active" : ""}`}
                                onClick={() => goToSlide(i)}
                                aria-label={`الشريحة ${i + 1}`}
                            />
                        ),
                    )}
                </div>
                <button
                    className="qtestimonials__nav-btn"
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                    aria-label="السابق"
                    style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
                >
                    <IoIosArrowBack />
                </button>
            </div>
        </div>
    );
};

export default CenterTeacherTestimonials;
