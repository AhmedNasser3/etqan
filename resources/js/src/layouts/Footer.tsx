import {
    FaWhatsapp,
    FaInstagram,
    FaTelegram,
    FaPhone,
    FaEnvelope,
    FaClock,
    FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
    return (
        <footer className="footer" dir="rtl">
            {/* الخلفية المتدرجة + تأثير الموجة */}
            <div className="footer__wave"></div>

            <div className="footer__container">
                {/* القسم الأول - اللوجو والوصف */}
                <div className="footer__section footer__brand">
                    <div className="footer__logo">
                        <h2 className="footer__logo-text">
                            إتقان
                            <span className="footer__logo-glow">✨</span>
                        </h2>
                    </div>
                    <p className="footer__description">
                        منصة تعليمية متطورة لحفظ القرآن الكريم بأسلوب حديث يجمع
                        بين التقنية والتراث
                    </p>
                    <div className="footer__social">
                        <a
                            href="#whatsapp"
                            className="footer__social-link whatsapp"
                            aria-label="واتساب"
                        >
                            <FaWhatsapp />
                        </a>
                        <a
                            href="#instagram"
                            className="footer__social-link instagram"
                            aria-label="إنستجرام"
                        >
                            <FaInstagram />
                        </a>
                        <a
                            href="#telegram"
                            className="footer__social-link telegram"
                            aria-label="تليجرام"
                        >
                            <FaTelegram />
                        </a>
                    </div>
                </div>

                {/* القسم الثاني - الروابط السريعة */}
                <div className="footer__section">
                    <h3 className="footer__title">الروابط السريعة</h3>
                    <ul className="footer__links">
                        <li>
                            <Link to="/" className="footer__link">
                                الرئيسية
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="footer__link">
                                الحلقات
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="footer__link">
                                المعلمين
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="footer__link">
                                المجامع
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* القسم الثالث - الخدمات */}
                <div className="footer__section">
                    <h3 className="footer__title">الخدمات</h3>
                    <ul className="footer__links">
                        <li>
                            <Link
                                to="/center-register"
                                className="footer__link"
                            >
                                إنشاء مجمع
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* القسم الرابع - الدعم */}
                <div className="footer__section">
                    <h3 className="footer__title">الدعم الفني</h3>
                    <div className="footer__contact">
                        <div className="footer__contact-item">
                            <FaPhone className="footer__contact-icon" />
                            <div>
                                <span className="footer__contact-label">
                                    هاتف
                                </span>
                                <a
                                    href="tel:+966123456789"
                                    className="footer__contact-link"
                                >
                                    +966 123 456 789
                                </a>
                            </div>
                        </div>
                        <div className="footer__contact-item">
                            <FaEnvelope className="footer__contact-icon" />
                            <div>
                                <span className="footer__contact-label">
                                    بريد إلكتروني
                                </span>
                                <a
                                    href="mailto:support@siraj.com"
                                    className="footer__contact-link"
                                >
                                    support@siraj.com
                                </a>
                            </div>
                        </div>
                        <div className="footer__contact-item">
                            <FaClock className="footer__contact-icon" />
                            <div>
                                <span className="footer__contact-label">
                                    الدوام
                                </span>
                                <span className="footer__contact-text">
                                    8ص - 10م
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA المتطور */}
            <div className="footer__cta-section">
                <div className="footer__cta-container">
                    <div className="footer__cta-content">
                        <h3>ابدأ رحلتك مع إتقان الآن</h3>
                        <Link to="/center-register" className="footer__cta-btn">
                            سجل مجمعك التعليمي الان
                            <FaArrowRight className="footer__cta-icon" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* شريط الحقوق السفلي */}
            <div className="footer__bottom">
                <div className="footer__bottom-container">
                    <p className="footer__copyright">
                        © ٢٠٢٦ إتقان - جميع الحقوق محفوظة |
                        <Link to="/privacy" className="footer__bottom-link">
                            سياسة الخصوصية
                        </Link>{" "}
                        |
                        <Link to="/terms" className="footer__bottom-link">
                            شروط الاستخدام
                        </Link>
                    </p>
                    <div className="footer__gradient-line"></div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
