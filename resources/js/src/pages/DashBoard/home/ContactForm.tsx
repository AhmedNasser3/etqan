const ContactForm: React.FC = () => {
    return (
        <div className="contactForm">
            <div
                className="testimonials__mainTitle"
                style={{ margin: "24px 0" }}
            >
                <h1>تواصل معنا</h1>
            </div>
            <div className="contactForm__container">
                <div className="contactForm__field">
                    <label>اسم الطالب</label>
                    <input type="text" placeholder="أدخل اسم الطالب" />
                </div>

                <div className="contactForm__field">
                    <label>الإيميل</label>
                    <input
                        type="email"
                        placeholder="الإيميل (الوالد أو الطالب)"
                    />
                </div>

                <div className="contactForm__field">
                    <label>رقم الجوال</label>
                    <input
                        type="tel"
                        placeholder="رقم جوال ولي الأمر أو الطالب"
                    />
                </div>

                <div className="contactForm__field">
                    <label>السؤال</label>
                    <textarea placeholder="اكتب سؤالك هنا..."></textarea>
                </div>

                <button className="contactForm__submit">إرسال</button>
            </div>
        </div>
    );
};

export default ContactForm;
