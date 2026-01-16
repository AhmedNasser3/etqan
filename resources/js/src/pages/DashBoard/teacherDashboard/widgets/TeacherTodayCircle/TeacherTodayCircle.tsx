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
} from "./data";

const TeacherTodayCircle: React.FC = () => {
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
                return <GrStatusGood className="text-green-500 text-xl" />;
            case "late":
                return <PiTimerDuotone className="text-yellow-500 text-xl" />;
            case "absent":
                return <GrStatusCritical className="text-red-500 text-xl" />;
            default:
                return <PiTimerDuotone className="text-gray-500 text-xl" />;
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
        <div className="userProfile__plan" style={{ paddingBottom: "24px" }}>
            <div className="userProfile__planTitle">
                <h1>
                    حلقتي اليوم <span>السبت 11 يناير 2026</span>
                </h1>
            </div>

            <div className="plan__header">
                <div className="plan__ai-suggestion">
                    <i>
                        <RiRobot2Fill />
                    </i>
                    ✅ جميع حصص الأمس مكتملة بنجاح
                </div>
                <div className="plan__current"></div>
            </div>

            <div className="plan__daily-table">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>الاسم</th>
                            <th>التاريخ</th>
                            <th>وقت الحصة</th>
                            <th>الحضور</th>
                            <th>التسميع</th>
                            <th>نقاط</th>
                            <th>ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr
                                key={student.id}
                                className={`plan__row completed`}
                            >
                                <td>{index + 1}</td>
                                <td className="font-semibold">
                                    {student.name}
                                </td>
                                <td className="font-medium text-green-600">
                                    {student.sessionDate}
                                </td>
                                <td className="font-medium text-blue-600">
                                    {student.sessionTime}
                                </td>
                                <td>
                                    <span className="flex justify-center">
                                        <span className="p-2 rounded-xl bg-green-100 text-green-700 border-2 border-green-200 w-10 h-10 flex items-center justify-center">
                                            {getAttendanceIcon(
                                                student.attendance
                                            )}
                                        </span>
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            student.recitation === "memorized"
                                                ? "bg-green-100 text-green-800"
                                                : student.recitation ===
                                                  "partial"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : student.recitation ===
                                                  "failed"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {getRecitationStatus(
                                            student.recitation
                                        )}
                                    </span>
                                </td>
                                <td className="font-bold text-xl text-blue-600 text-center">
                                    {student.points}
                                </td>
                                <td className="text-sm">
                                    <span className="block truncate">
                                        {student.notes}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="plan__stats">
                <div className="stat-card">
                    <div className="stat-icon greenColor">
                        <i>
                            <GrStatusGood />
                        </i>
                    </div>
                    <div>
                        <h3>الحصص المكتملة</h3>
                        <p className="text-2xl font-bold text-green-600">3/3</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blueColor">
                        <i>
                            <FaStar />
                        </i>
                    </div>
                    <div>
                        <h3>متوسط النقاط</h3>
                        <p className="text-2xl font-bold text-blue-600">82</p>
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
                        <p className="text-2xl font-bold text-yellow-600">5</p>
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
                            <tr key={session.id} className="plan__row pending">
                                <td>{index + 1}</td>
                                <td className="font-semibold">
                                    {session.date}
                                </td>
                                <td>{session.day}</td>
                                <td className="font-medium text-blue-600">
                                    {session.time}
                                </td>
                                <td className="font-bold text-green-600 text-center">
                                    {session.studentsCount}
                                </td>
                                <td className="text-sm">
                                    <span className="block truncate">
                                        {session.students
                                            .slice(0, 2)
                                            .join("، ")}
                                        {session.students.length > 2 &&
                                            ` +${session.students.length - 2}`}
                                    </span>
                                </td>
                                <td>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
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
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    style={{ zIndex: 9999 }}
                >
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b">
                            <h3 className="text-xl font-bold text-gray-800">
                                تسميع سريع
                                <span className="block text-sm text-gray-600">
                                    {selectedStudent.name}
                                </span>
                            </h3>
                            <button
                                onClick={() => setQuickRecitationModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نتيجة التسميع
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    <option value="memorized">حفظ كامل</option>
                                    <option value="partial">حفظ جزئي</option>
                                    <option value="failed">غير محفوظ</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ملاحظات
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
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

                            <div className="flex gap-3 pt-4">
                                <button
                                    className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-all"
                                    onClick={() => {
                                        addPoints(selectedStudent.id, 25);
                                        setQuickRecitationModal(false);
                                    }}
                                >
                                    حفظ وإضافة 25 نقطة
                                </button>
                                <button
                                    className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all"
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
                <div className="plan__ai-suggestion mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <i className="inline-block mr-2">
                        <RiRobot2Fill />
                    </i>
                    <strong>تقرير AI:</strong> {aiReport}
                </div>
            )}
        </div>
    );
};

export default TeacherTodayCircle;
