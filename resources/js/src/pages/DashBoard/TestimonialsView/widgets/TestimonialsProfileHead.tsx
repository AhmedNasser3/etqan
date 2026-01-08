import { FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";

const TestimonialsProfileHead: React.FC = () => {
    return (
        <div className="testimonialsView__header">
            <div className="testimonialsView__img">
                <div className="testimonialsView__data">
                    <div className="testimonialsView__img">
                        <div className="testimonialsView__imgBg">
                            <img
                                hidden
                                className="wave-bg"
                                src="https://png.pngtree.com/thumb_back/fw800/background/20251004/pngtree-elegant-green-islamic-background-with-ornamental-arch-image_19763723.webp"
                                alt=""
                            />
                        </div>

                        <div className="testimonialsView__rating">
                            <div className="testimonialsView__name">
                                <h1>أ/ عبدالله القحطاني</h1>
                            </div>
                            <div className="testimonialsView__ratingStars">
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStarHalfAlt />
                                </i>
                                <i>
                                    <FaRegStar />
                                </i>
                                <i>
                                    <FaRegStar />
                                </i>
                            </div>
                        </div>
                        <img
                            src="https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp"
                            alt="المعلم"
                        />
                    </div>
                </div>
            </div>
            <div className="testimonialsView__content">
                <div className="testimonialsView__text">
                    <div className="testimonialsView__description">
                        <p>
                            <span> حفظ القرآن - معهد التقوي </span>
                            مجمع القرآن الكريم بالشارقة صرح حضاري عالمي يُعنى
                            بخدمة القرآن وعلومه، يضم متاحف قرآنية متخصصة، ومكتبة
                            علمية، وبرامج تعليمية وإجازات بالسند المتصل، في بيئة
                            تجمع بين الأصالة والتقنية الحديثة.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialsProfileHead;
