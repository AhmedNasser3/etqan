import { useState, useRef, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import facelessAvatar from "../../../../assets/images/facelessYoung.png";
import TestimonialsProfileHead from "./widgets/TestimonialsProfileHead";
import TestimonialsProfileReviews from "./widgets/TestimonialsProfileReviews";
import TestimonialsProfileComplexes from "./widgets/TestimonialsProfileComplexes";

interface TestimonialsProfile {
    id: number;
    img: string;
    name: string;
    title: string;
}

const TestimonialsProfile: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideWidth, setSlideWidth] = useState(374);
    const [isMobile, setIsMobile] = useState(false);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    const testimonials: TestimonialsProfile[] = [
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
        <div className="testimonialsView">
            <div className="testimonialsView__inner">
                <TestimonialsProfileHead />
                <div className="testimonialsView__body">
                    <div className="testimonialsView__data">
                        <div className="testimonialsView__structure">
                            <div className="testimonialsView__certificate">
                                <div className="testimonials__mainTitle">
                                    <h1>شهادات المعلم</h1>
                                </div>
                                <div className="testimonialsView__certificateContainer">
                                    <div className="testimonialsView__certificatDetails">
                                        <div className="testimonialsView__certificateImg">
                                            <img
                                                src="https://mir-s3-cdn-cf.behance.net/project_modules/hd/b49ae443516815.57f2a3ae629e0.jpg"
                                                alt=""
                                            />
                                        </div>
                                        <div className="testimonialsView__certificateTitle">
                                            <h1>شهادة ختم القرأن</h1>
                                            <div className="testimonialsView__certificateDescription">
                                                <p>
                                                    شهادة تختيم وحفظ القرأن
                                                    كاملا من موثقة من مجمع
                                                    التوحيد بيدين
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="testimonialsView__certificatDetails">
                                        <div className="testimonialsView__certificateImg">
                                            <img
                                                src="https://noords.net/wp-content/uploads/2021/06/%D8%A3%D8%AD%D9%85%D8%AF-%D9%86%D8%B9%D8%B3%D8%A7%D9%86%D9%8A-scaled.jpg"
                                                alt=""
                                            />
                                        </div>
                                        <div className="testimonialsView__certificateTitle">
                                            <h1>شهادة ختم القرأن</h1>
                                            <div className="testimonialsView__certificateDescription">
                                                <p>
                                                    شهادة تختيم وحفظ القرأن
                                                    كاملا من موثقة من مجمع
                                                    التوحيد بيدين
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="testimonialsView__certificatDetails">
                                        <div className="testimonialsView__certificateImg">
                                            <img
                                                src="https://khamsat.hsoubcdn.com/images/services/3709485/698916228a7e2a1eb23803024a7fa671.jpg"
                                                alt=""
                                            />
                                        </div>
                                        <div className="testimonialsView__certificateTitle">
                                            <h1>شهادة ختم القرأن</h1>
                                            <div className="testimonialsView__certificateDescription">
                                                <p>
                                                    شهادة تختيم وحفظ القرأن
                                                    كاملا من موثقة من مجمع
                                                    التوحيد بيدين
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="testimonialsView__certificatDetails">
                                        <div className="testimonialsView__certificateImg">
                                            <img
                                                src="https://api.osoulworld.com/media/psd_image/ALFORQAN.JPG"
                                                alt=""
                                            />
                                        </div>
                                        <div className="testimonialsView__certificateTitle">
                                            <h1>شهادة ختم القرأن</h1>
                                            <div className="testimonialsView__certificateDescription">
                                                <p>
                                                    شهادة تختيم وحفظ القرأن
                                                    كاملا من موثقة من مجمع
                                                    التوحيد بيدين
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="testimonialsView__students">
                                <div className="testimonialsView__studentsContainer">
                                    <div className="testimonials">
                                        <div className="testimonials__mainTitle">
                                            <h1>طلاب المعلم</h1>
                                        </div>
                                        <div className="testimonials__slider-container">
                                            <div className="testimonials__inner">
                                                <div
                                                    className="testimonials__content"
                                                    ref={testimonialsRef}
                                                    style={{
                                                        transform: `translateX(-${
                                                            currentIndex *
                                                            slideWidth
                                                        }px)`,
                                                    }}
                                                >
                                                    {testimonials.map(
                                                        (testimonial) => (
                                                            <div
                                                                key={
                                                                    testimonial.id
                                                                }
                                                                className="testimonials__data"
                                                            >
                                                                <div className="testimonials__img">
                                                                    <img
                                                                        src={
                                                                            testimonial.img
                                                                        }
                                                                        alt=""
                                                                    />
                                                                </div>
                                                                <div className="testimonials__name">
                                                                    <h2>
                                                                        {
                                                                            testimonial.name
                                                                        }
                                                                    </h2>
                                                                    <p>
                                                                        {
                                                                            testimonial.title
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="testimonials__toggleContainer">
                                            <div
                                                className="testimonials__toggleLeft"
                                                onClick={prevSlide}
                                            >
                                                <IoIosArrowBack />
                                            </div>
                                            {Array.from(
                                                { length: maxIndex + 1 },
                                                (_, index) => (
                                                    <span
                                                        key={index}
                                                        className={`testimonials__toggle ${
                                                            getActiveDotIndex() ===
                                                            index
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            goToSlide(index)
                                                        }
                                                    />
                                                )
                                            )}
                                            <div
                                                className="testimonials__toggleRight"
                                                onClick={nextSlide}
                                            >
                                                <IoIosArrowForward />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <TestimonialsProfileComplexes />
                            <div className="testimonialsView__reviews">
                                <TestimonialsProfileReviews />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialsProfile;
