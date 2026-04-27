// Schedules.tsx - مواعيد الخطة بدون Tailwind (CSS Classes + SCSS)
import React, { useState, useEffect } from "react";

//  Props interface
interface ScheduleCardProps {
    id: number;
    planId: number;
    dayName: string;
    date: string;
    timeRange: string;
    circleName: string;
    teacherName?: string;
    maxStudents: number;
    bookedStudents: number;
    onBook: (scheduleId: number) => void;
}

//  Single Schedule Card Component
const ScheduleCard: React.FC<ScheduleCardProps> = ({
    id,
    dayName,
    date,
    timeRange,
    circleName,
    teacherName,
    maxStudents,
    bookedStudents,
    onBook,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const availability = maxStudents - bookedStudents;
    const isFull = availability <= 0;

    const handleMouseEnter = () => !isFull && setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div
            className={`schedule-card ${isHovered ? "schedule-card--hover" : ""} ${isLoaded ? "schedule-card--loaded" : ""} ${isFull ? "schedule-card--full" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => !isFull && onBook(id)}
            role="button"
            tabIndex={0}
        >
            {/* Card Header - Day & Time */}
            <div className="schedule-card__header">
                <div className="schedule-card__day">{dayName}</div>
                <div className="schedule-card__time">{timeRange}</div>
                <div
                    className={`schedule-card__availability ${isFull ? "full" : ""}`}
                >
                    {isFull ? "كامل" : `${availability} متبقي`}
                </div>
            </div>

            {/* Card Body */}
            <div className="schedule-card__body">
                <div className="schedule-card__date">{date}</div>
                <h3 className="schedule-card__circle">{circleName}</h3>
                {teacherName && (
                    <div className="schedule-card__teacher">
                        👨‍🏫 {teacherName}
                    </div>
                )}
            </div>

            {/* Card Footer */}
            <div className="schedule-card__footer">
                <span className={`schedule-card__cta ${isFull ? "full" : ""}`}>
                    {isFull ? "كامل" : "احجز الآن"}
                </span>
                <div
                    className={`schedule-card__icon ${isHovered && !isFull ? "schedule-card__icon--animate" : ""}`}
                >
                    📅
                </div>
            </div>
        </div>
    );
};

//  Mock Schedules Data - واقعية لخطة 12 شهر (جزء شهري)
const mockSchedules = [
    {
        id: 1,
        dayName: "الثلاثاء",
        date: "3 فبراير",
        timeRange: "10:00 - 11:00 ص",
        circleName: "الجزء 30 (العمل)",
        teacherName: "أ. محمد أحمد",
        maxStudents: 8,
        bookedStudents: 3,
    },
    {
        id: 2,
        dayName: "الأربعاء",
        date: "4 فبراير",
        timeRange: "2:00 - 3:00 م",
        circleName: "الجزء 29 (المرسلات)",
        teacherName: "أ. أحمد السيد",
        maxStudents: 10,
        bookedStudents: 10, // كامل
    },
    {
        id: 3,
        dayName: "الجمعة",
        date: "6 فبراير",
        timeRange: "7:00 - 8:00 م",
        circleName: "الجزء 28 (القصص)",
        teacherName: "أ. خالد علي",
        maxStudents: 12,
        bookedStudents: 2,
    },
    {
        id: 4,
        dayName: "السبت",
        date: "7 فبراير",
        timeRange: "9:00 - 10:00 ص",
        circleName: "الجزء 27 (النمل)",
        teacherName: "أ. عمر حسن",
        maxStudents: 8,
        bookedStudents: 1,
    },
    {
        id: 5,
        dayName: "الأحد",
        date: "8 فبراير",
        timeRange: "4:00 - 5:00 م",
        circleName: "الجزء 26 (الشعراء)",
        teacherName: undefined,
        maxStudents: 15,
        bookedStudents: 5,
    },
    {
        id: 6,
        dayName: "الإثنين",
        date: "9 فبراير",
        timeRange: "11:00 - 12:00 م",
        circleName: "الجزء 25 (الفرقان)",
        teacherName: "أ. يوسف محمود",
        maxStudents: 10,
        bookedStudents: 8,
    },
    {
        id: 7,
        dayName: "الثلاثاء",
        date: "10 فبراير",
        timeRange: "6:00 - 7:00 م",
        circleName: "الجزء 24 (النور)",
        teacherName: "أ. إبراهيم صالح",
        maxStudents: 12,
        bookedStudents: 0,
    },
    {
        id: 8,
        dayName: "الأربعاء",
        date: "11 فبراير",
        timeRange: "1:00 - 2:00 م",
        circleName: "الجزء 23 (المؤمنون)",
        teacherName: undefined,
        maxStudents: 8,
        bookedStudents: 6,
    },
    {
        id: 9,
        dayName: "الجمعة",
        date: "13 فبراير",
        timeRange: "8:00 - 9:00 م",
        circleName: "الجزء 22 (الحج)",
        teacherName: "أ. مصطفى عادل",
        maxStudents: 10,
        bookedStudents: 4,
    },
    {
        id: 10,
        dayName: "السبت",
        date: "14 فبراير",
        timeRange: "3:00 - 4:00 م",
        circleName: "الجزء 21 (الأنبياء)",
        teacherName: "أ. حمدي زكي",
        maxStudents: 12,
        bookedStudents: 11,
    },
];

//  Main Schedules Component
const Schedules: React.FC = () => {
    const [selectedSchedule, setSelectedSchedule] = useState<number | null>(
        null,
    );

    const handleBookSchedule = (scheduleId: number) => {
        setSelectedSchedule(scheduleId);
        console.log("تم حجز الموعد:", scheduleId);
        // هنا هتستدعي API الحجز
    };

    return (
        <div className="schedules-container" id="schedules-container">
            <header className="schedules-header">
                <h1 className="schedules-title">مواعيد الخطة المتاحة</h1>
                <p className="schedules-subtitle">اختر موعدًا مناسبًا لحفظك</p>
            </header>

            <div className="schedules-grid">
                {mockSchedules.map((schedule) => (
                    <ScheduleCard
                        key={schedule.id}
                        id={schedule.id}
                        planId={1}
                        dayName={schedule.dayName}
                        date={schedule.date}
                        timeRange={schedule.timeRange}
                        circleName={schedule.circleName}
                        teacherName={schedule.teacherName}
                        maxStudents={schedule.maxStudents}
                        bookedStudents={schedule.bookedStudents}
                        onBook={handleBookSchedule}
                    />
                ))}
            </div>

            {selectedSchedule && (
                <div className="schedules-selected-info">
                    <p> تم حجز الموعد رقم {selectedSchedule} بنجاح!</p>
                </div>
            )}

            {/*  إشعار مهم */}
            <div className="schedules-notice">
                <div className="schedules-notice__icon">ℹ️</div>
                <div className="schedules-notice__content">
                    <strong>يمكنك الاتفاق مع المعلم الخاص بك</strong>
                    <br />
                    على تغيير ميعاد معين لأي يوم يناسبكما
                </div>
            </div>
        </div>
    );
};

export default Schedules;
