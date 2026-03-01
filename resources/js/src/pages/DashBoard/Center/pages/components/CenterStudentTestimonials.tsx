// components/CenterStudentTestimonials.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
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

    const getVisibleCards = () => {
        return window.innerWidth <= 768 ? 1 : 4;
    };

    const maxIndex = Math.max(0, testimonials.length - visibleCards);

    // حساب الـ slide width والـ visible cards
    useEffect(() => {
        const handleResize = () => {
            const newSlideWidth = getSlideWidth();
            const newVisibleCards = getVisibleCards();

            setSlideWidth(newSlideWidth);
            setVisibleCards(newVisibleCards);

            // تصحيح الـ index عند تغيير العرض
            if (
                currentIndex >
                Math.max(0, testimonials.length - newVisibleCards)
            ) {
                setCurrentIndex(
                    Math.max(0, testimonials.length - newVisibleCards),
                );
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [testimonials.length]); // فقط testimonials.length

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    }, [maxIndex]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    const goToSlide = useCallback(
        (index: number) => {
            setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
        },
        [maxIndex],
    );

    const getActiveDotIndex = () => currentIndex;

    // إذا كان في loading أو مفيش طلاب خالص
    if (loading || testimonials.length === 0) {
        return (
            <div className="testimonials">
                <div className="testimonials__mainTitle">
                    <h1>لا يوجد طلاب لهذا المجمع</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="testimonials">
            <div className="testimonials__mainTitle">
                <button>جميع الطلاب</button>
                <h1>طلابنا المتفوقين</h1>
            </div>
            <div className="testimonials__slider-container">
                <div className="testimonials__inner">
                    <div
                        className="testimonials__content"
                        ref={testimonialsRef}
                        style={{
                            transform: `translateX(-${currentIndex * slideWidth}px)`,
                        }}
                    >
                        {testimonials.map((testimonial: Testimonial) => (
                            <div
                                key={testimonial.id}
                                className="testimonials__data"
                            >
                                <div className="testimonials__img">
                                    <img
                                        src={facelessAvatar}
                                        alt={testimonial.name}
                                    />
                                </div>
                                <div className="testimonials__name">
                                    <h2>{testimonial.name}</h2>
                                    <p>{testimonial.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="testimonials__toggleContainer">
                <div className="testimonials__toggleLeft" onClick={prevSlide}>
                    <IoIosArrowBack />
                </div>
                {Array.from(
                    { length: Math.max(1, maxIndex + 1) },
                    (_, index) => (
                        <span
                            key={index}
                            className={`testimonials__toggle ${
                                getActiveDotIndex() === index ? "active" : ""
                            }`}
                            onClick={() => goToSlide(index)}
                        />
                    ),
                )}
                <div className="testimonials__toggleRight" onClick={nextSlide}>
                    <IoIosArrowForward />
                </div>
            </div>
        </div>
    );
};

export default CenterStudentTestimonials;
