import { FaWhatsapp, FaInstagram, FaArrowRight } from "react-icons/fa";

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__top">
                    <div className="footer__logo">
                        <h3>إتقان</h3>
                    </div>
                    <div className="footer__links">
                        <a href="#about" className="footer__link">
                            عن المنصة
                        </a>
                        <a href="#contact" className="footer__link">
                            تواصل
                        </a>
                        <a href="#privacy" className="footer__link">
                            خصوصية
                        </a>
                    </div>
                </div>
                <div className="footer__bottom">
                    <div className="footer__social">
                        <a href="#" className="footer__social-link">
                            <FaWhatsapp />
                        </a>
                        <a href="#" className="footer__social-link">
                            <FaInstagram />
                        </a>
                    </div>
                    <div className="footer__cta">
                        <a href="#register" className="footer__cta-btn">
                            تسجيل مجمعات
                            <FaArrowRight />
                        </a>
                    </div>
                    <div className="footer__copyright">
                        <p>© 2026 إتقان</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
