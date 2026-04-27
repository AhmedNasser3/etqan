// components/CenterStudentTestimonials.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useCenterData } from "../hooks/useCenterData";
import facelessAvatar from "../../../../../assets/images/facelessYoung.png";

interface Testimonial {
    id: number;
    img: string;
    name: string;
    title: string;
}

const CenterStudentTestimonials: React.FC = () => {
    const { testimonials, loading } = useCenterData();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideWidth, setSlideWidth] = useState(374);
    const [visibleCards, setVisibleCards] = useState(4);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    const getSlideWidth = () => {
        if (window.innerWidth <= 480) return 320;
        if (window.innerWidth <= 768) return 340;
        return 374;
    };

    const getVisibleCards = () => (window.innerWidth <= 768 ? 1 : 4);

    const maxIndex = Math.max(0, testimonials.length - visibleCards);

    useEffect(() => {
        const handleResize = () => {
            const newSlideWidth = getSlideWidth();
            const newVisibleCards = getVisibleCards();
            setSlideWidth(newSlideWidth);
            setVisibleCards(newVisibleCards);
            if (
                currentIndex >
                Math.max(0, testimonials.length - newVisibleCards)
            )
                setCurrentIndex(
                    Math.max(0, testimonials.length - newVisibleCards),
                );
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [testimonials.length]);

    const nextSlide = useCallback(
        () => setCurrentIndex((p) => Math.min(p + 1, maxIndex)),
        [maxIndex],
    );
    const prevSlide = useCallback(
        () => setCurrentIndex((p) => Math.max(p - 1, 0)),
        [],
    );
    const goToSlide = useCallback(
        (i: number) => setCurrentIndex(Math.max(0, Math.min(i, maxIndex))),
        [maxIndex],
    );

    if (loading || testimonials.length === 0) {
        return (
            <div className="qtestimonials">
                <div className="qtestimonials__header">
                    <h2 className="qtestimonials__title">
                        لا يوجد طلاب لهذا المجمع
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="qtestimonials">
            <div className="qtestimonials__header">
                <span className="qtestimonials__label">طلابنا</span>
                <h2 className="qtestimonials__title">الطلاب المتفوقون</h2>
                <button className="qtestimonials__all-btn">جميع الطلاب</button>
            </div>

            <div className="qtestimonials__viewport">
                <div
                    className="qtestimonials__track"
                    ref={testimonialsRef}
                    style={{
                        transform: `translateX(-${currentIndex * slideWidth}px)`,
                    }}
                >
                    {testimonials.map((t: Testimonial) => (
                        <div key={t.id} className="qtestimonials__card">
                            <div className="qtestimonials__avatar">
                                <img src={facelessAvatar} alt={t.name} />
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
                    disabled={currentIndex === maxIndex}
                    aria-label="التالي"
                >
                    <IoIosArrowForward />
                </button>
                <div className="qtestimonials__dots">
                    {Array.from(
                        { length: Math.max(1, maxIndex + 1) },
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
                >
                    <IoIosArrowBack />
                </button>
            </div>
        </div>
    );
};

export default CenterStudentTestimonials;
