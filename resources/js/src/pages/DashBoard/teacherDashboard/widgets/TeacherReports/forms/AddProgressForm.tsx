import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface Lesson {
    date: string;
    surah: string;
    content: string;
    review: string;
    student: string;
}

interface AddProgressFormProps {
    gender: "male" | "female";
    onClose: () => void;
    lesson: Lesson;
}

const AddProgressForm: React.FC<AddProgressFormProps> = ({
    gender,
    onClose,
    lesson,
}) => {
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [notes, setNotes] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ rating, notes, lesson });
        onClose();
    };

    return (
        <div className="inputs">
            <div className="inputs__inner">
                <div className="inputs__container">
                    <div className="inputs__name">
                        <label>تقييمك</label>
                        <div
                            style={{
                                display: "flex",
                                gap: "6px",
                                direction: "ltr",
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((star) => {
                                if (hover >= star || rating >= star) {
                                    return (
                                        <FaStar
                                            key={star}
                                            size={24}
                                            color="#ffc107"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                        />
                                    );
                                }
                                return (
                                    <FaRegStar
                                        key={star}
                                        size={24}
                                        color="#ccc"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div className="inputs__verifyOTP">
                        <label>ملاحظات</label>
                        <textarea
                            name="notes"
                            id="notes"
                            rows={3}
                            placeholder="ملاحظات إضافية..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <div className="inputs__submit">
                        <button type="button" onClick={onClose}>
                            إغلاق
                        </button>
                        <button type="submit" onClick={handleSubmit}>
                            ارسال ملاحظتك
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProgressForm;
