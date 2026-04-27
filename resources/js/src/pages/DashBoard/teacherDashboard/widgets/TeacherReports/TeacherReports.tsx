// TeacherReports.tsx - مع تصميم PlansManagement
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
        <div className="stars-container">
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
        <tr>
            <td style={{ fontWeight: 700 }}>
                <div>
                    <div>{lesson.surah}</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--n500)" }}>
                        {lesson.date}
                    </div>
                </div>
            </td>
            <td>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                        محتوى الحصة:
                    </div>
                    <div>{lesson.content}</div>
                    <div style={{ marginTop: "8px" }}>
                        <strong>مراجعة:</strong> {lesson.review}
                    </div>
                </div>
            </td>
            <td>
                <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                    {lesson.student}
                </div>
                {!lesson.hasNote ? (
                    <button
                        className="btn bd bxs"
                        onClick={() => handleAddNote(lesson)}
                    >
                        إضافة ملاحظة
                    </button>
                ) : (
                    <>
                        <div style={{ marginBottom: "12px" }}>
                            <div
                                style={{ fontWeight: 600, marginBottom: "4px" }}
                            >
                                تعليق المعلم:
                            </div>
                            <div>{lesson.note}</div>
                        </div>
                        <div>
                            <div
                                style={{ fontWeight: 600, marginBottom: "4px" }}
                            >
                                التقييم:
                            </div>
                            {renderStars(lesson.rating)}
                        </div>
                    </>
                )}
            </td>
            <td>
                <div className="td-actions">
                    {!lesson.hasNote && (
                        <button
                            className="btn bs bxs"
                            onClick={() => handleAddNote(lesson)}
                        >
                            تعديل
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <>
            {/* المودال */}
            {showForm && (
                <div
                    className="conf-ov on"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 3000,
                        background: "rgba(0,0,0,.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        className="conf-box"
                        style={{ maxWidth: "500px", width: "90%" }}
                    >
                        <div className="conf-ico">
                            <span
                                style={{
                                    width: 22,
                                    height: 22,
                                    display: "inline-flex",
                                }}
                            >
                                ⭐
                            </span>
                        </div>
                        <div className="conf-t" style={{ fontSize: "1.25rem" }}>
                            إضافة ملاحظة
                        </div>
                        <div className="conf-d">أضف تعليقك وتقييمك للحصة</div>
                        <div className="conf-acts">
                            <div className="flx">
                                <AddProgressForm
                                    gender="male"
                                    onClose={() => setShowForm(false)}
                                    lesson={selectedLesson || recentLessons[0]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">تقارير المعلم</div>
                        <div className="flx">
                            <button
                                className="btn bp bsm"
                                onClick={() => setShowForm(true)}
                            >
                                + حصة جديدة
                            </button>
                        </div>
                    </div>

                    <div className="testimonials__mainTitle">
                        <h1>آخر الحصص</h1>
                    </div>
                    <div style={{ overflowX: "auto", marginBottom: "32px" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>السورة</th>
                                    <th>تفاصيل الحصة</th>
                                    <th>الطالب</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLessons.length > 0 ? (
                                    recentLessons.map((lesson, index) => (
                                        <LessonItem
                                            key={`recent-${index}`}
                                            lesson={lesson}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4}>
                                            <div
                                                className="empty"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "40px",
                                                }}
                                            >
                                                <p>لا يوجد حصص بعد</p>
                                                <button className="btn bp bsm">
                                                    إضافة حصة
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="testimonials__mainTitle">
                        <h1>سجل الملاحظات</h1>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>السورة</th>
                                    <th>تفاصيل الحصة</th>
                                    <th>الطالب</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notesLessons.length > 0 ? (
                                    notesLessons.map((lesson, index) => (
                                        <LessonItem
                                            key={`notes-${index}`}
                                            lesson={lesson}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4}>
                                            <div
                                                className="empty"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "40px",
                                                }}
                                            >
                                                <p>لا توجد ملاحظات بعد</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherReports;
