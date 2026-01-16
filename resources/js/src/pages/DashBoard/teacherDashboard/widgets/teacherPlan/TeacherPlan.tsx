import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiTimerDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { useState } from "react";
import {
    studentsData,
    upcomingSessionsData,
    Student,
    UpcomingSession,
} from "./data.ts";
import Profile from "../dashboard/profile.js";

const TeacherPlan: React.FC = () => {
    const [students, setStudents] = useState<Student[]>(studentsData);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(
        null
    );
    const [quickRecitationModal, setQuickRecitationModal] = useState(false);
    const [aiReport, setAiReport] = useState("");
    const upcomingSessions: UpcomingSession[] = upcomingSessionsData;

    const getAttendanceIcon = (status: string) => {
        switch (status) {
            case "present":
                return (
                    <GrStatusGood className="teacherPlan__attendance-icon--present" />
                );
            case "late":
                return (
                    <PiTimerDuotone className="teacherPlan__attendance-icon--late" />
                );
            case "absent":
                return (
                    <GrStatusCritical className="teacherPlan__attendance-icon--absent" />
                );
            default:
                return (
                    <PiTimerDuotone className="teacherPlan__attendance-icon--pending" />
                );
        }
    };

    const getRecitationStatus = (status: string) => {
        switch (status) {
            case "memorized":
                return "حفظ كامل";
            case "partial":
                return "حفظ جزئي";
            case "failed":
                return "غير محفوظ";
            case "pending":
                return "قيد الانتظار";
            default:
                return "غير محدد";
        }
    };

    const getRecitationClass = (status: string) => {
        switch (status) {
            case "memorized":
                return "teacherPlan__recitation memorized";
            case "partial":
                return "teacherPlan__recitation partial";
            case "failed":
                return "teacherPlan__recitation failed";
            default:
                return "teacherPlan__recitation pending";
        }
    };

    const updateStudentAttendance = (
        studentId: number,
        status: Student["attendance"]
    ) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === studentId
                    ? { ...student, attendance: status }
                    : student
            )
        );
    };

    const updateStudentRecitation = (
        studentId: number,
        status: Student["recitation"],
        notes?: string
    ) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === studentId
                    ? {
                          ...student,
                          recitation: status,
                          notes: notes || student.notes,
                      }
                    : student
            )
        );
    };

    const addPoints = (studentId: number, points: number) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === studentId
                    ? { ...student, points: student.points + points }
                    : student
            )
        );
    };

    const generateAIReport = () => {
        const presentCount = students.filter(
            (s) => s.attendance === "present"
        ).length;
        const totalPoints = students.reduce((sum, s) => sum + s.points, 0);
        setAiReport(
            `✅ جميع حصص 8/1 مكتملة بنجاح (${presentCount}/6 حضور). إجمالي النقاط: ${totalPoints}. أحسنت! الطلاب جاهزين للغد. راجع يوسف على الجزء الجزئي غداً.`
        );
    };

    return (
        <>
            <Profile />
            <div
                className="userProfile__plan"
                style={{ paddingBottom: "24px" }}
            >
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>الحصص المكتملة</h3>
                            <p className="teacherPlan__stat-number">3/3</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon yellowColor">
                            <i>
                                <PiTimerDuotone />
                            </i>
                        </div>
                        <div>
                            <h3>الحصص القادمة</h3>
                            <p className="teacherPlan__stat-number">5</p>
                        </div>
                    </div>
                </div>

                <div className="testimonials__mainTitle">
                    <h1>حلقاتك القادمة</h1>
                </div>
                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>التاريخ</th>
                                <th>اليوم</th>
                                <th>وقت الحصة</th>
                                <th>عدد الطلاب</th>
                                <th>الأسماء</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingSessions.map((session, index) => (
                                <tr
                                    key={session.id}
                                    className="plan__row pending"
                                >
                                    <td>{index + 1}</td>
                                    <td className="teacherPlan__session-date">
                                        {session.date}
                                    </td>
                                    <td>{session.day}</td>
                                    <td className="teacherPlan__session-time">
                                        {session.time}
                                    </td>
                                    <td className="teacherPlan__students-count">
                                        {session.studentsCount}
                                    </td>
                                    <td className="teacherPlan__students-names">
                                        <span>
                                            {session.students
                                                .slice(0, 2)
                                                .join("، ")}
                                            {session.students.length > 2 &&
                                                ` +${
                                                    session.students.length - 2
                                                }`}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="teacherPlan__status-upcoming">
                                            قادمة
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {quickRecitationModal && selectedStudent && (
                    <div
                        className="teacherPlan__modal-overlay"
                        style={{ zIndex: 9999 }}
                    >
                        <div className="teacherPlan__modal">
                            <div className="teacherPlan__modal-header">
                                <h3>
                                    تسميع سريع
                                    <span>{selectedStudent.name}</span>
                                </h3>
                                <button
                                    onClick={() =>
                                        setQuickRecitationModal(false)
                                    }
                                    className="teacherPlan__modal-close"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="teacherPlan__modal-content">
                                <div>
                                    <label className="teacherPlan__modal-label">
                                        نتيجة التسميع
                                    </label>
                                    <select
                                        className="teacherPlan__modal-select"
                                        onChange={(e) => {
                                            const status = e.target
                                                .value as Student["recitation"];
                                            updateStudentRecitation(
                                                selectedStudent.id,
                                                status
                                            );
                                        }}
                                    >
                                        <option value="pending">
                                            قيد الانتظار
                                        </option>
                                        <option value="memorized">
                                            حفظ كامل
                                        </option>
                                        <option value="partial">
                                            حفظ جزئي
                                        </option>
                                        <option value="failed">
                                            غير محفوظ
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="teacherPlan__modal-label">
                                        ملاحظات
                                    </label>
                                    <textarea
                                        className="teacherPlan__modal-textarea"
                                        rows={3}
                                        defaultValue={selectedStudent.notes}
                                        onBlur={(e) =>
                                            updateStudentRecitation(
                                                selectedStudent.id,
                                                selectedStudent.recitation,
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="teacherPlan__modal-actions">
                                    <button
                                        className="teacherPlan__modal-save-btn"
                                        onClick={() => {
                                            addPoints(selectedStudent.id, 25);
                                            setQuickRecitationModal(false);
                                        }}
                                    >
                                        حفظ وإضافة 25 نقطة
                                    </button>
                                    <button
                                        className="teacherPlan__modal-cancel-btn"
                                        onClick={() =>
                                            setQuickRecitationModal(false)
                                        }
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {aiReport && (
                    <div className="plan__ai-suggestion teacherPlan__ai-report">
                        <i>
                            <RiRobot2Fill />
                        </i>
                        <strong>تقرير AI:</strong> {aiReport}
                    </div>
                )}
            </div>
        </>
    );
};

export default TeacherPlan;
