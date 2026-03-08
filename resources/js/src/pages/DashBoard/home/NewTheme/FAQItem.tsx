import React, { useState } from "react";

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleAnswer = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`faq-item ${isOpen ? "active" : ""}`}>
            <button className="faq-question" onClick={toggleAnswer}>
                <div className="faq-arrow" />
                <span className="question-text">{question}</span>
            </button>
            <div className="faq-answer">
                {/* class جديد للتنسيق */}
                <div className="answer-content formatted-text">{answer}</div>
            </div>
        </div>
    );
};

export default FAQItem;
