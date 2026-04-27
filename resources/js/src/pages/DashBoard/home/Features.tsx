// home/Features.tsx
import React from "react";

const Features: React.FC = () => {
    const items = [
        "حضور ذكي بالبصمة وQR",
        "تقارير PDF و Excel تلقائية",
        "إدارة مجمعات متعددة",
        "غرف تسميع ذكية",
        "مساعد ذكاء اصطناعي",
        "بوابة أولياء الأمور",
    ];

    return (
        <div className="quran-marquee">
            <div className="quran-marquee__track">
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="quran-marquee__item">
                        <span
                            className="quran-marquee__dot"
                            aria-hidden="true"
                        />
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default Features;
