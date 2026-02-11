import { useState, useRef, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import facelessAvatar from "../../../assets/images/facelessAvatar.png";
import { a } from "framer-motion/dist/types.d-DagZKalS";

interface Testimonial {
    id: number;
    img: string;
    rating: number;
    name: string;
    title: string;
}

const Testimonials: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideWidth, setSlideWidth] = useState(374);
    const [isMobile, setIsMobile] = useState(false);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    const testimonials: Testimonial[] = [
        {
            id: 1,
            img: facelessAvatar,
            rating: 4.5,
            name: "الشيخ محمد البريدي",
            title: "قارئ القرآن الكريم - إمام مسجد الرحمة",
        },
        {
            id: 2,
            img: facelessAvatar,
            rating: 4,
            name: "د/ أحمد السعدي",
            title: "أستاذ الفقه الإسلامي - جامعة الإمام",
        },
        {
            id: 3,
            img: facelessAvatar,
            rating: 5,
            name: "أ/ عبدالله القحطاني",
            title: "داعية وخطيب - مركز الدعوة والإرشاد",
        },
        {
            id: 4,
            img: facelessAvatar,
            rating: 3,
            name: "ش/ سالم العتيبي",
            title: "معلم حفظ القرآن - معهد التقوى",
        },
        {
            id: 6,
            img: facelessAvatar,
            rating: 5,
            name: "أ/ عبدالله القحطاني",
            title: "داعية وخطيب - مركز الدعوة والإرشاد",
        },
        {
            id: 7,
            img: facelessAvatar,
            rating: 3,
            name: "ش/ سالم العتيبي",
            title: "معلم حفظ القرآن - معهد التقوى",
        },
        {
            id: 8,
            img: facelessAvatar,
            rating: 3,
            name: "ش/ سالم العتيبي",
            title: "معلم حفظ القرآن - معهد التقوى",
        },
    ];

    const getSlideWidth = () => {
        if (window.innerWidth <= 480) return 320;
        if (window.innerWidth <= 768) return 340;
        return 374;
    };

    const visibleCards = window.innerWidth <= 768 ? 1 : 4;
    const maxIndex = testimonials.length - visibleCards;

    useEffect(() => {
        const handleResize = () => {
            const newSlideWidth = getSlideWidth();
            const newIsMobile = window.innerWidth <= 768;

            setSlideWidth(newSlideWidth);
            setIsMobile(newIsMobile);

            if (currentIndex > maxIndex) {
                setCurrentIndex(Math.max(0, maxIndex));
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    };

    const getActiveDotIndex = () => currentIndex;

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FaStar key={i} />);
            } else if (i === fullStars && hasHalf) {
                stars.push(<FaStarHalfAlt key={i} />);
            } else {
                stars.push(<FaRegStar key={i} />);
            }
        }
        return stars;
    };

    return (
        <div className="testimonials">
            <div className="testimonials__mainTitle">
                <button>جميع المعلمين</button>
                <h1>آراء المعلمين</h1>
            </div>
            <div className="testimonials__slider-container">
                <div className="testimonials__inner">
                    <div
                        className="testimonials__content"
                        ref={testimonialsRef}
                        style={{
                            transform: `translateX(-${
                                currentIndex * slideWidth
                            }px)`,
                        }}
                    >
                        {testimonials.map((testimonial) => (
                            <a href="/teacher-view">
                                <div
                                    key={testimonial.id}
                                    className="testimonials__data"
                                >
                                    <div className="testimonials__img">
                                        <div className="testimonials__imgBg">
                                            <img
                                                className="wave-bg"
                                                src="https://png.pngtree.com/thumb_back/fw800/background/20251004/pngtree-elegant-green-islamic-background-with-ornamental-arch-image_19763723.webp"
                                                alt=""
                                            />
                                        </div>
                                        <img
                                            src={testimonial.img}
                                            alt={testimonial.name}
                                        />
                                    </div>

                                    <div className="testimonials__rating">
                                        {renderStars(testimonial.rating).map(
                                            (Star, index) => (
                                                <i key={index}>{Star}</i>
                                            ),
                                        )}
                                    </div>
                                    <div className="testimonials__name">
                                        <h2>
                                            <span>
                                                {testimonial.name.startsWith(
                                                    "أ/",
                                                ) ||
                                                testimonial.name.startsWith(
                                                    "د/",
                                                ) ||
                                                testimonial.name.startsWith(
                                                    "ش/",
                                                )
                                                    ? ""
                                                    : "أ/"}
                                            </span>
                                            {testimonial.name}
                                        </h2>
                                        <p>{testimonial.title}</p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <div className="testimonials__toggleContainer">
                <div className="testimonials__toggleLeft" onClick={prevSlide}>
                    <IoIosArrowBack />
                </div>
                {Array.from({ length: maxIndex + 1 }, (_, index) => (
                    <span
                        key={index}
                        className={`testimonials__toggle ${
                            getActiveDotIndex() === index ? "active" : ""
                        }`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
                <div className="testimonials__toggleRight" onClick={nextSlide}>
                    <IoIosArrowForward />
                </div>
            </div>
        </div>
    );
};

export default Testimonials;
