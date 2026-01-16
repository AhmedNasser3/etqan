import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import AddProgressForm from "./forms/addProgressForm";

interface Lesson {
    date: string;
    surah: string;
    content: string;
    review: string;
    student: string;
    hasNote?: boolean;
    note?: string;
    rating?: number;
}

const recentLessons: Lesson[] = [
    {
        date: "2026-01-06",
        surah: "سورة البقرة",
        content: "حفظ من ايه 24 الي 31",
        review: "مراجعة من ايه 10 الي ايه 24",
        student: "محمد الشامري",
    },
    {
        date: "2026-01-06",
        surah: "سورة البقرة",
        content: "حفظ من ايه 24 الي 31",
        review: "مراجعة من ايه 10 الي ايه 24",
        student: "محمد الشامري",
    },
    {
        date: "2026-01-06",
        surah: "سورة البقرة",
        content: "حفظ من ايه 24 الي 31",
        review: "مراجعة من ايه 10 الي ايه 24",
        student: "محمد الشامري",
    },
    {
        date: "2026-01-06",
        surah: "سورة البقرة",
        content: "حفظ من ايه 24 الي 31",
        review: "مراجعة من ايه 10 الي ايه 24",
        student: "محمد الشامري",
    },
];

const notesLessons: Lesson[] = [
    {
        date: "2026-01-06",
        surah: "سورة البقرة",
        content: "حفظ من ايه 24 الي 31",
        review: "مراجعة من ايه 10 الي ايه 24",
        student: "محمد الشامري",
        hasNote: true,
        note: "الطالب ممتاز ولم يقصر في الحفظ او اي شيئ",
        rating: 5,
    },
    {
        date: "2026-01-06",
        surah: "سورة البقرة",
        content: "حفظ من ايه 24 الي 31",
        review: "مراجعة من ايه 10 الي ايه 24",
        student: "محمد الشامري",
        hasNote: true,
        note: "للاسف تقصير شديد من الطالب",
        rating: 5,
    },
    {
        date: "2026-01-06",
        surah: "سورة البقرة",
        content: "حفظ من ايه 24 الي 31",
        review: "مراجعة من ايه 10 الي ايه 24",
        student: "محمد الشامري",
        hasNote: true,
        note: "الطالب ممتاز ولم يقصر في الحفظ او اي شيئ",
        rating: 5,
    },
    {
        date: "2026-01-06",
        surah: "سورة البقرة",
        content: "حفظ من ايه 24 الي 31",
        review: "مراجعة من ايه 10 الي ايه 24",
        student: "محمد الشامري",
        hasNote: true,
        note: "الطالب ممتاز ولم يقصر في الحفظ او اي شيئ",
        rating: 5,
    },
];

const TeacherReports: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    const handleAddNote = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setShowForm(true);
    };

    const renderStars = (rating: number = 0) => (
        <div className="testimonialsView__ratingStars">
            {Array(5)
                .fill(0)
                .map((_, i) => (
                    <i key={i}>
                        <FaStar />
                    </i>
                ))}
        </div>
    );

    const LessonItem = ({ lesson }: { lesson: Lesson }) => (
        <div className="userProgress__comments">
            <div className="userProgress__title">
                <h1>
                    الحصة بتاريخ: <span>{lesson.date}</span>
                </h1>
            </div>
            <div className="userProgress__data">
                <h4>{lesson.surah}</h4>
                <h2>
                    محتوي الحصة: <span>{lesson.content}</span>
                </h2>
                <h2>{lesson.review}</h2>
            </div>
            {!lesson.hasNote ? (
                <div className="userProgress__comment">
                    <button onClick={() => handleAddNote(lesson)}>
                        اضافة ملاحظة لهذا الطلب؟
                    </button>
                </div>
            ) : (
                <>
                    <div className="userProgress__comment">
                        <h1>تعليق المعلم :-</h1>
                        <h2>{lesson.note}</h2>
                    </div>
                    <h1>تقييم مستوي الطالب لهذه الحصة</h1>
                    <div className="userProgress__rate">
                        {renderStars(lesson.rating)}
                    </div>
                </>
            )}
            <h1>
                الطالب: <span>{lesson.student}</span>
            </h1>
            <div className="userProgress__rate"></div>
        </div>
    );

    return (
        <div className="teacherRoom">
            <div
                className={`userProgress__formContainer ${
                    showForm ? "form-visible" : "form-hidden"
                }`}
            >
                <div className="userProgress__form">
                    <AddProgressForm
                        gender="male"
                        onClose={() => setShowForm(false)}
                        lesson={selectedLesson || recentLessons[0]}
                    />
                </div>
            </div>
            <div className="TeacherRoom__inner">
                <div className="testimonials__mainTitle">
                    <h1>اخر الحصص</h1>
                </div>
                <div
                    className="userProgress__content"
                    style={{ margin: "24px 0" }}
                >
                    {recentLessons.map((lesson, index) => (
                        <LessonItem key={`recent-${index}`} lesson={lesson} />
                    ))}
                </div>
                <div className="testimonials__mainTitle">
                    <h1>سجل الملاحظات</h1>
                </div>
                <div
                    className="userProgress__content"
                    style={{ margin: "24px 0" }}
                >
                    {notesLessons.map((lesson, index) => (
                        <LessonItem key={`notes-${index}`} lesson={lesson} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeacherReports;
