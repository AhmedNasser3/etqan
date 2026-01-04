import { useEffect, useRef, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";

const HowItWorksSection: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.3,
                rootMargin: "0px 0px -10% 0px",
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <div className="howtWorks" ref={sectionRef}>
            <div className="howtWorks__inner">
                <div className="howtWorks__container">
                    <div
                        className={`howtWorks__title ${
                            isVisible ? "animate-slideUp" : ""
                        }`}
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible
                                ? "translateY(0)"
                                : "translateY(30px)",
                            transition:
                                "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        }}
                    >
                        <h1>كيف تعمل منصة إتقان؟</h1>
                        <p>
                            تعرف على الخطوات التالية لتتمكن من إنشاء مجمعك الخاص
                            بنفسك.
                        </p>
                    </div>
                    <div className="howtWorks__data">
                        <div
                            className={`howtWorks__content ${
                                isVisible ? "animate-slideUp delay-200" : ""
                            }`}
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible
                                    ? "translateY(0)"
                                    : "translateY(50px)",
                                transition:
                                    "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s",
                            }}
                        >
                            <div className="howtWorks__img">
                                <img
                                    src="https://img.freepik.com/premium-vector/login-concept-illustration_114360-757.jpg"
                                    alt="سجل دخولك"
                                />
                            </div>
                            <h2>1. سجل دخولك</h2>
                            <p>ابدأ رحلتك مع المنصة من خلال تسجيل الدخول</p>
                        </div>
                        <div className="howtWorks__rows_container">
                            <span
                                className={`howtWorks__row ${
                                    isVisible ? "animate-grow" : ""
                                }`}
                                style={{
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible
                                        ? "scaleY(1)"
                                        : "scaleY(0)",
                                    transition:
                                        "all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s",
                                }}
                            ></span>
                            <i
                                className={`arrow-icon ${
                                    isVisible ? "animate-bounceIn" : ""
                                }`}
                                style={{
                                    opacity: isVisible ? 1 : 0,

                                    transition:
                                        "all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.5s",
                                }}
                            >
                                <IoIosArrowForward />
                            </i>
                        </div>
                        <div
                            className={`howtWorks__content ${
                                isVisible ? "animate-slideUp delay-400" : ""
                            }`}
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible
                                    ? "translateY(0)"
                                    : "translateY(50px)",
                                transition:
                                    "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s",
                            }}
                        >
                            <div className="howtWorks__img">
                                <img
                                    src="https://cdni.iconscout.com/illustration/premium/thumb/online-attendance-illustration-svg-download-png-6247870.png"
                                    alt="الحضور اليومي"
                                />
                            </div>
                            <h2>2. الحضور اليومي + التسميع</h2>
                            <p>
                                تابع الطلاب يومياً واختبر تسميعهم في الغرف عن
                                بعد
                            </p>
                        </div>
                        <div className="howtWorks__rows_container">
                            <span
                                className={`howtWorks__row ${
                                    isVisible ? "animate-grow" : ""
                                }`}
                                style={{
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible
                                        ? "scaleY(1)"
                                        : "scaleY(0)",
                                    transition:
                                        "all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.7s",
                                }}
                            ></span>
                            <i
                                className={`arrow-icon ${
                                    isVisible ? "animate-bounceIn" : ""
                                }`}
                                style={{
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible
                                        ? " scale(1)"
                                        : " scale(0)",
                                    transition:
                                        "all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.8s",
                                }}
                            >
                                <i>
                                    <IoIosArrowForward />
                                </i>
                            </i>
                        </div>
                        <div
                            className={`howtWorks__content ${
                                isVisible ? "animate-slideUp delay-600" : ""
                            }`}
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible
                                    ? "translateY(0)"
                                    : "translateY(50px)",
                                transition:
                                    "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s",
                            }}
                        >
                            <div className="howtWorks__img">
                                <img
                                    src="https://static.vecteezy.com/system/resources/thumbnails/036/098/067/small/loyalty-program-concept-man-holding-points-coin-get-bonus-and-cash-back-discount-customer-service-online-shopping-earn-points-refer-a-friend-flat-illustration-on-white-background-vector.jpg"
                                    alt="التقارير والمكافآت"
                                />
                            </div>
                            <h2>3. تقارير + نقاط + مكافآت تلقائية</h2>
                            <p>
                                احصل على تقارير مفصلة ونقاط ومكافآت تلقائية
                                للمتفوقين
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksSection;
