const HomeN: React.FC = () => {
    return (
        <div className="HomeN">
            <div className="HomeN__container">
                <div className="HomeN__content">
                    <div className="HomeN__title">
                        <h1>إتقان</h1>
                        <h3>نظام إتقان لخدمة الجهات القرآنية</h3>
                        <h4>الخيار المثالي للحلقات والدور النسائية</h4>
                        <p>
                            منصة إتقان تُعنى بتقديم حلول رقمية مبتكرة لإدارة
                            الشؤون التعليمية وسط الحلقات القرآنية، حيث نقدم لكم
                            الوسيلة المثالية لتدوين إنجازات الطالب، ونمنحكم
                            تقارير دقيقة وواضحة للطالب وولي الأمر والمشرف.
                        </p>
                    </div>
                    <div className="HomeN__btns">
                        <button>إشترك الآن</button>
                        <button id="HomeN__btns">
                            تواصل معنا <i className="icon-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeN;
