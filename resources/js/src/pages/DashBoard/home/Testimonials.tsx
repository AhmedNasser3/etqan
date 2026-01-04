import { useState, useRef, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

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
            img: "https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp",
            rating: 4.5,
            name: "الشيخ محمد البريدي",
            title: "قارئ القرآن الكريم - إمام مسجد الرحمة",
        },
        {
            id: 2,
            img: "https://static.vecteezy.com/system/resources/thumbnails/070/221/098/small_2x/confident-saudi-arabian-man-in-traditional-attire-portrait-against-isolated-backdrop-presenting-png.png",
            rating: 4,
            name: "د/ أحمد السعدي",
            title: "أستاذ الفقه الإسلامي - جامعة الإمام",
        },
        {
            id: 3,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/974/small/front-view-a-happy-arab-man-in-traditional-white-thobe-and-red-and-white-checkered-ghutra-isolated-on-transparent-background-free-png.png",
            rating: 5,
            name: "أ/ عبدالله القحطاني",
            title: "داعية وخطيب - مركز الدعوة والإرشاد",
        },
        {
            id: 4,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            rating: 3,
            name: "ش/ سالم العتيبي",
            title: "معلم حفظ القرآن - معهد التقوى",
        },
        {
            id: 6,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/974/small/front-view-a-happy-arab-man-in-traditional-white-thobe-and-red-and-white-checkered-ghutra-isolated-on-transparent-background-free-png.png",
            rating: 5,
            name: "أ/ عبدالله القحطاني",
            title: "داعية وخطيب - مركز الدعوة والإرشاد",
        },
        {
            id: 7,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            rating: 3,
            name: "ش/ سالم العتيبي",
            title: "معلم حفظ القرآن - معهد التقوى",
        },
        {
            id: 8,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
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
                            <div
                                key={testimonial.id}
                                className="testimonials__data"
                            >
                                <div className="testimonials__img">
                                    <img src={testimonial.img} alt="" />
                                </div>
                                <div className="testimonials__rating">
                                    {renderStars(testimonial.rating).map(
                                        (Star, index) => (
                                            <i key={index}>{Star}</i>
                                        )
                                    )}
                                </div>
                                <div className="testimonials__name">
                                    <h2>
                                        <span>
                                            {testimonial.name.startsWith(
                                                "أ/"
                                            ) ||
                                            testimonial.name.startsWith("د/") ||
                                            testimonial.name.startsWith("ش/")
                                                ? ""
                                                : "أ/"}
                                        </span>
                                        {testimonial.name}
                                    </h2>
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
