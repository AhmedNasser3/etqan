import { useState, useRef, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import facelessAvatar from "../../../assets/images/facelessYoung.png";

interface Testimonial {
    id: number;
    img: string;
    name: string;
    title: string;
}

const StudentTestimonials: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideWidth, setSlideWidth] = useState(374);
    const [isMobile, setIsMobile] = useState(false);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    const testimonials: Testimonial[] = [
        {
            id: 1,
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
            name: "محمد أحمد العتيبي",
            title: "طالب حفظ قرآن - الجزء الثلاثون",
        },
        {
            id: 2,
            img: "https://static.vecteezy.com/system/resources/thumbnails/070/221/098/small_2x/confident-saudi-arabian-man-in-traditional-attire-portrait-against-isolated-backdrop-presenting-png.png",
            name: "عبدالله صالح القحطاني",
            title: "طالب تجويد - المرتل",
        },
        {
            id: 3,
            img: facelessAvatar,
            name: "خالد محمد الدوسري",
            title: "حافظ قرآن كريم - المجود",
        },
        {
            id: 4,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            name: "أحمد سعود الشمري",
            title: "طالب تلاوة - السور القصيرة",
        },
        {
            id: 5,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/974/small/front-view-a-happy-arab-man-in-traditional-white-thobe-and-red-and-white-checkered-ghutra-isolated-on-transparent-background-free-png.png",
            name: "سعيد عبدالرحمن الحربي",
            title: "طالب حفظ - الجزء الخامس",
        },
        {
            id: 6,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            name: "يوسف ناصر الغامدي",
            title: "طالب تجويد - القراءات السبع",
        },
        {
            id: 7,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            name: "عمر فيصل الزهراني",
            title: "حافظ قرآن - المرتل المتقن",
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

export default StudentTestimonials;
