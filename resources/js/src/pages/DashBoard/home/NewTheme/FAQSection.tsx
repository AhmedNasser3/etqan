import React from "react";
import FAQItem from "./FAQItem";

const FAQSection: React.FC = () => {
    const faqData = [
        {
            question: "ما هي مميزات المنصة الجديدة؟",
            answer: "توفر المنصة واجهة سهلة الاستخدام، دعم متعدد اللغات، ونظام إدارة متقدم يشمل تتبع الحضور والرواتب تلقائياً.",
        },
        {
            question: "كيف يمكنني إضافة معلم جديد؟",
            answer: "يمكنك الذهاب إلى قسم المعلمين، النقر على زر إضافة معلم جديد، وملء البيانات المطلوبة مثل الاسم والرقم القومي ورقم الهاتف.",
        },
        {
            question: "هل يدعم النظام الدفع الإلكتروني؟",
            answer: "نعم، يدعم النظام الدفع الإلكتروني من خلال فودافون كاش، إنستاباي، والبطاقات الائتمانية المحلية والدولية.",
        },
        {
            question: "ما هي متطلبات النظام؟",
            answer: "يتطلب النظام متصفح حديث (Chrome 90+، Firefox 88+، Safari 14+) واتصال إنترنت بسرعة 5 ميجابت/ثانية على الأقل.",
        },
    ];

    return (
        <section className="faq-section">
            <div className="container">
                <h2 className="section-title">الأسئلة المتكررة</h2>
                <div className="faq-list">
                    {faqData.map((item, index) => (
                        <FAQItem
                            key={index}
                            question={item.question}
                            answer={item.answer}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
