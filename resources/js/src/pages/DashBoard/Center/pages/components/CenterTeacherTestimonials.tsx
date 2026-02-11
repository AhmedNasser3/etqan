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

const CenterStudentTestimonials: React.FC = () => {
    const {
        teachers: testimonials, // ✅ تصحيح: teachers بدلاً من studentTestimonials
        loading,
        error,
    } = useCenterTeachers();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideWidth, setSlideWidth] = useState(374);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    if (error) {
        return (
            <div className="testimonials">
                <div className="testimonials__mainTitle">
                    <h1 style={{ color: "red" }}>
                        خطأ في تحميل الطلاب: {error}
                    </h1>
                </div>
            </div>
        );
    }

    const getSlideWidth = useCallback(() => {
        if (window.innerWidth <= 480) return 320;
        if (window.innerWidth <= 768) return 340;
        return 374;
    }, []);

    const visibleCards = useCallback(() => {
        return window.innerWidth <= 768 ? 1 : 4;
    }, []);

    const maxIndex = useCallback(() => {
        return Math.max(0, testimonials.length - visibleCards());
    }, [testimonials.length, visibleCards]);

    useEffect(() => {
        const handleResize = () => {
            const newSlideWidth = getSlideWidth();
            setSlideWidth(newSlideWidth);

            const currentMaxIndex = maxIndex();
            if (currentIndex > currentMaxIndex) {
                setCurrentIndex(Math.max(0, currentMaxIndex));
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [testimonials.length, getSlideWidth, maxIndex, currentIndex]);

    const nextSlide = useCallback(() => {
        const currentMaxIndex = maxIndex();
        setCurrentIndex((prev) => Math.min(prev + 1, currentMaxIndex));
    }, [maxIndex]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    const goToSlide = useCallback(
        (index: number) => {
            const currentMaxIndex = maxIndex();
            setCurrentIndex(Math.max(0, Math.min(index, currentMaxIndex)));
        },
        [maxIndex],
    );

    const getActiveDotIndex = useCallback(() => {
        return currentIndex;
    }, [currentIndex]);

    if (loading || testimonials.length === 0) {
        return (
            <div className="testimonials">
                <div className="testimonials__mainTitle">
                    <h1>جاري تحميل الطلاب المتفوقين...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="testimonials">
            <div className="testimonials__mainTitle">
                <button>جميع الطلاب</button>
                <h1>المعلمين الخاصين بنا</h1>
            </div>
            <div className="testimonials__slider-container">
                <div className="testimonials__inner">
                    <div
                        className="testimonials__content"
                        ref={testimonialsRef}
                        style={{
                            transform: `translateX(-${currentIndex * slideWidth}px)`,
                            transition: "transform 0.3s ease-in-out",
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
                                        loading="lazy"
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
                <div
                    className="testimonials__toggleLeft"
                    onClick={prevSlide}
                    style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
                >
                    <IoIosArrowBack />
                </div>
                {Array.from(
                    { length: Math.max(1, maxIndex() + 1) },
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
                <div
                    className="testimonials__toggleRight"
                    onClick={nextSlide}
                    style={{ opacity: currentIndex === maxIndex() ? 0.5 : 1 }}
                >
                    <IoIosArrowForward />
                </div>
            </div>
        </div>
    );
};

export default CenterStudentTestimonials;
