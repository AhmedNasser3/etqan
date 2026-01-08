import { useState, useRef, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import facelessAvatar from "../../../../assets/images/facelessYoung.png";

interface Testimonial {
    id: number;
    img: string;
    rating: number;
    name: string;
    title: string;
}
const TestimonialsProfileReviews: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideWidth, setSlideWidth] = useState(374);
    const [isMobile, setIsMobile] = useState(false);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    const testimonials: Testimonial[] = [
        {
            id: 1,
            img: "https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp",
            rating: 4.5,
            name: "أحمد علي",
            title: "التجربة ممتازة، الشرح واضح والخدمة ساعدتني أطور مستواي في وقت قصير.",
        },
        {
            id: 2,
            img: "https://static.vecteezy.com/system/resources/thumbnails/070/221/098/small_2x/confident-saudi-arabian-man-in-traditional-attire-portrait-against-isolated-backdrop-presenting-png.png",
            rating: 4,
            name: "محمد حسن",
            title: "منصة مرتبة، المتابعة مستمرة والأسلوب في التدريس مشجع جدًا.",
        },
        {
            id: 3,
            img: facelessAvatar,
            rating: 5,
            name: "سارة خالد",
            title: "أفضل تجربة تعليمية خضتها، تنظيم عالي واهتمام حقيقي بالطلاب.",
        },
        {
            id: 4,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            rating: 3.5,
            name: "خالد إبراهيم",
            title: "المحتوى جيد جدًا، وأتمنى إضافة مزيد من الأنشطة والتطبيقات العملية.",
        },
        {
            id: 5,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/974/small/front-view-a-happy-arab-man-in-traditional-white-thobe-and-red-and-white-checkered-ghutra-isolated-on-transparent-background-free-png.png",
            rating: 5,
            name: "ندى يوسف",
            title: "المدرسين متعاونين والشرح مبسط، أنصح أي طالب بالاشتراك في المنصة.",
        },
        {
            id: 6,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            rating: 4,
            name: "عبدالله محمود",
            title: "منصة قوية، ساعدتني أراجع وأثبت المعلومات بطريقة سهلة وممتعة.",
        },
        {
            id: 7,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            rating: 4.5,
            name: "ليان عمر",
            title: "الدروس مرتبة والتقييمات المستمرة حفزتني أن أستمر بدون انقطاع.",
        },
        {
            id: 8,
            img: facelessAvatar,
            rating: 3,
            name: "يوسف سامي",
            title: "التجربة جيدة عمومًا، وأتوقع تحسين الواجهة لتكون أسرع وأسهل.",
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
                <h1>آراء الطلاب</h1>
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
                                    <div className="testimonials__name">
                                        <h2>
                                            <span>
                                                {testimonial.name.startsWith(
                                                    "أ/"
                                                ) ||
                                                testimonial.name.startsWith(
                                                    "د/"
                                                ) ||
                                                testimonial.name.startsWith(
                                                    "ش/"
                                                )
                                                    ? ""
                                                    : "أ/"}
                                            </span>
                                            {testimonial.name}
                                        </h2>
                                        <p>{testimonial.title}</p>
                                        <div className="testimonials__rating">
                                            {renderStars(
                                                testimonial.rating
                                            ).map((Star, index) => (
                                                <i key={index}>{Star}</i>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="testimonials__rating">
                                        <p>2026/01/05</p>
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

export default TestimonialsProfileReviews;
