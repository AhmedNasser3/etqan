// UserProgress.tsx - مُصححة نهائياً
import { RiRobot2Fill } from "react-icons/ri";
import { FaStar } from "react-icons/fa";
import { useStudentProgress } from "./hooks/useStudentProgress";
import Medals from "../widgets/medals";

const UserProgress: React.FC = () => {
    const { data, loading, error } = useStudentProgress();

    if (loading)
        return (
            <div className="text-center py-8 text-gray-500">
                جاري التحميل...
            </div>
        );
    if (error)
        return (
            <div className="text-red-500 text-center py-8 p-4 bg-red-50 rounded-lg">
                {error}
            </div>
        );

    const overallProgress = data?.overall_progress || 0;
    const lessons = data?.lessons || [];

    return (
        <div className="userProgress">
            <div className="userProfile__doupleSide">
                <Medals />
                <div className="userProfile__progress">
                    <div className="userProfile__progressContainer">
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>مستوي تقدم الطالب</h1>
                            </div>
                            <p>{overallProgress}%</p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${overallProgress}%`,
                                        transition: "width 0.5s ease-in-out",
                                    }}
                                ></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="userProgress__inner">
                <div className="testimonials__mainTitle">
                    <h1>التقدم الخاص بك</h1>
                </div>

                <div className="suserProgress__container">
                    <div className="userProgress__case">
                        {lessons.slice(0, 13).map((lesson) => (
                            <div
                                key={lesson.id}
                                className="userProfile__planTitle"
                            >
                                <h1>{lesson.surah_name}</h1>
                            </div>
                        ))}
                    </div>

                    <div className="testimonials__mainTitle">
                        <h1>ملاحظات المعلمين</h1>
                    </div>

                    {/* ✅ إصلاح input warning - استخدم defaultValue + readOnly */}
                    <div className="userProfile__plan" id="userProfile__plan">
                        <div className="plan__header">
                            <div className="plan__ai-suggestion">
                                <i>
                                    <RiRobot2Fill />
                                </i>
                                راجع آية ٤٨ مرة تانية
                            </div>
                            <div className="plan__current">
                                <div className="plan__date-range">
                                    <div className="date-picker to">
                                        <label>إلى</label>
                                        <input
                                            type="date"
                                            defaultValue=""
                                            readOnly
                                        />
                                    </div>
                                    <div className="date-picker from">
                                        <label>من</label>
                                        <input
                                            type="date"
                                            defaultValue=""
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="userProgress__content">
                        {lessons.map((lesson: any) => {
                            // ✅ Rating = 3 → 3 نجوم ذهبي + 2 رمادي
                            const filledStars = Math.floor(
                                Number(lesson.rating) || 0,
                            );
                            const emptyStars = 5 - filledStars;

                            console.log(
                                `درس ${lesson.id}: rating=${lesson.rating}, filledStars=${filledStars}`,
                            );

                            return (
                                <div
                                    key={lesson.id}
                                    className="userProgress__comments"
                                >
                                    <div className="userProgress__title">
                                        <h1>
                                            الحصة بتاريخ:{" "}
                                            <span>
                                                {lesson.attendance_date}
                                            </span>
                                        </h1>
                                    </div>
                                    <div className="userProgress__data">
                                        <h4>{lesson.surah_name}</h4>
                                        {lesson.new_memorization && (
                                            <h2>
                                                محتوي الحصة:{" "}
                                                <span>
                                                    {lesson.new_memorization}
                                                </span>
                                            </h2>
                                        )}
                                        {lesson.review_memorization && (
                                            <h2>
                                                مراجعة{" "}
                                                {lesson.review_memorization}
                                            </h2>
                                        )}
                                    </div>
                                    <div className="userProgress__comment">
                                        <h1>تعليق المعلم :-</h1>
                                        <h2>{lesson.note}</h2>
                                    </div>
                                    <h1>تقييم مستوي الطالب لهذه الحصة</h1>
                                    <div className="userProgress__rate">
                                        <div
                                            className="testimonialsView__ratingStars"
                                            dir="ltr"
                                        >
                                            {/* ✅ نجوم ملونة (filled) */}
                                            {Array(filledStars)
                                                .fill(0)
                                                .map((_, i) => (
                                                    <i
                                                        key={`filled-${lesson.id}-${i}`}
                                                        className="text-yellow-400 text-xl"
                                                    >
                                                        <FaStar />
                                                    </i>
                                                ))}

                                            {/* ✅ نجوم رمادي (empty) */}
                                            {Array(emptyStars)
                                                .fill(0)
                                                .map((_, i) => (
                                                    <i
                                                        key={`empty-${lesson.id}-${i}`}
                                                        className="text-gray-300 text-xl"
                                                    >
                                                        <FaStar />
                                                    </i>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProgress;
