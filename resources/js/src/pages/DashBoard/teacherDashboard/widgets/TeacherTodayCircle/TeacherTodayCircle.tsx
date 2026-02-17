import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiTimerDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { useState, useEffect } from "react";
import {
    useTeacherSchedules,
    PlanSchedule,
    TeacherStats,
} from "./hooks/useTeacherSchedules";
import axios from "axios";
import toast from "react-hot-toast";

// ✅ Mock Students data لحفظ الوظائف الموجودة
interface Student {
    id: number;
    name: string;
    sessionDate: string;
    sessionTime: string;
    attendance: "present" | "late" | "absent" | "pending";
    recitation: "memorized" | "partial" | "failed" | "pending";
    points: number;
    notes: string;
}

const mockStudents: Student[] = [
    {
        id: 1,
        name: "أحمد محمد",
        sessionDate: "2026-02-15",
        sessionTime: "10:00 - 11:00",
        attendance: "present",
        recitation: "memorized",
        points: 25,
        notes: "حفظ ممتاز",
    },
    {
        id: 2,
        name: "يوسف علي",
        sessionDate: "2026-02-15",
        sessionTime: "10:00 - 11:00",
        attendance: "present",
        recitation: "partial",
        points: 15,
        notes: "يحتاج مراجعة",
    },
];

const TeacherTodayCircle: React.FC = () => {
    const [students, setStudents] = useState<Student[]>(mockStudents);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(
        null,
    );
    const [quickRecitationModal, setQuickRecitationModal] = useState(false);
    const [aiReport, setAiReport] = useState("");

    // ✅ جلب بيانات الخطط الحقيقية
    const { schedules, stats, loading } = useTeacherSchedules();

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
        status: Student["attendance"],
    ) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === studentId
                    ? { ...student, attendance: status }
                    : student,
            ),
        );
    };

    const updateStudentRecitation = (
        studentId: number,
        status: Student["recitation"],
        notes?: string,
    ) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === studentId
                    ? {
                          ...student,
                          recitation: status,
                          notes: notes || student.notes,
                      }
                    : student,
            ),
        );
    };

    const addPoints = async (studentId: number, points: number) => {
        try {
            // ✅ حفظ النقاط في API
            await axios.post("/api/v1/teacher/achievements", {
                user_id: studentId,
                points,
                points_action: "added",
                reason: "تسميع اليوم",
                achievement_type: "recitation",
            });

            setStudents((prev) =>
                prev.map((student) =>
                    student.id === studentId
                        ? { ...student, points: student.points + points }
                        : student,
                ),
            );
            toast.success("تم إضافة النقاط بنجاح!");
        } catch (error: any) {
            toast.error(
                "فشل في إضافة النقاط: " + error.response?.data?.message,
            );
        }
    };

    const generateAIReport = (stats?: TeacherStats) => {
        const presentCount = students.filter(
            (s) => s.attendance === "present",
        ).length;
        const totalPoints = students.reduce((sum, s) => sum + s.points, 0);

        const report = `✅ جميع حصص اليوم مكتملة بنجاح (${presentCount}/${students.length} حضور).
    إجمالي النقاط: ${totalPoints}.
    ${stats ? `الحصص القادمة: ${stats.future_schedules}` : ""} أحسنت! الطلاب جاهزين للغد.`;

        setAiReport(report);
    };

    // ✅ تحديث التقرير عند تحميل الإحصائيات
    useEffect(() => {
        if (stats) {
            generateAIReport(stats);
        }
    }, [stats]);

    const todaySchedule = schedules.find(
        (s) =>
            new Date(s.schedule_date).toDateString() ===
            new Date().toDateString(),
    );

    const getArabicDayName = (dayOfWeek: string) => {
        const days = {
            sunday: "الأحد",
            monday: "الإثنين",
            tuesday: "الثلاثاء",
            wednesday: "الأربعاء",
            thursday: "الخميس",
            friday: "الجمعة",
            saturday: "السبت",
        };
        return days[dayOfWeek as keyof typeof days] || dayOfWeek;
    };

    if (loading) {
        return (
            <div className="userProfile__plan flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>جاري تحميل خططك...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="userProfile__plan" style={{ paddingBottom: "24px" }}>
            <div className="userProfile__planTitle">
                <h1>
                    حلقتي اليوم{" "}
                    <span>
                        {todaySchedule
                            ? `${getArabicDayName(todaySchedule.day_of_week)} ${new Date(todaySchedule.schedule_date).toLocaleDateString("ar-EG")}`
                            : `${getArabicDayName("sunday")} ${new Date().toLocaleDateString("ar-EG")}`}
                    </span>
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

            {/* ✅ جدول الطلاب (يبقى زي ما هو) */}
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
                                onClick={() => {
                                    setSelectedStudent(student);
                                    setQuickRecitationModal(true);
                                }}
                            >
                                <td>{index + 1}</td>
                                <td className="font-semibold cursor-pointer">
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
                                                student.attendance,
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
                                            student.recitation,
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

            {/* ✅ إحصائيات حقيقية من API */}
            <div className="plan__stats">
                <div className="stat-card">
                    <div className="stat-icon greenColor">
                        <i>
                            <GrStatusGood />
                        </i>
                    </div>
                    <div>
                        <h3>الحصص المكتملة</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {stats
                                ? `${stats.available_schedules}/${stats?.total_schedules || 0}`
                                : "0/0"}
                        </p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blueColor">
                        <i>
                            <FaStar />
                        </i>
                    </div>
                    <div>
                        <h3>متوسط الحجوزات</h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {stats
                                ? Math.round(
                                      ((stats.total_schedules -
                                          stats.full_schedules) /
                                          (stats.total_schedules || 1)) *
                                          100,
                                  )
                                : 0}
                            %
                        </p>
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
                        <p className="text-2xl font-bold text-yellow-600">
                            {stats?.future_schedules || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* ✅ جدول الحلقات القادمة من API */}
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
                            <th>الخطة / الحلقة</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.slice(0, 5).map((schedule, index) => (
                            <tr key={schedule.id} className="plan__row pending">
                                <td>{index + 1}</td>
                                <td className="font-semibold">
                                    {new Date(
                                        schedule.schedule_date,
                                    ).toLocaleDateString("ar-EG")}
                                </td>
                                <td>
                                    {getArabicDayName(schedule.day_of_week)}
                                </td>
                                <td className="font-medium text-blue-600">
                                    {schedule.start_time} - {schedule.end_time}
                                </td>
                                <td className="font-bold text-green-600 text-center">
                                    {schedule.booked_students}/
                                    {schedule.max_students}
                                </td>
                                <td className="text-sm">
                                    <span className="block truncate">
                                        {schedule.plan_name} /{" "}
                                        {schedule.circle_name}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            schedule.is_available
                                                ? "bg-yellow-100 text-yellow-800"
                                                : schedule.remaining_slots > 0
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {schedule.is_available
                                            ? "متاحة"
                                            : schedule.remaining_slots > 0
                                              ? "قادمة"
                                              : "ممتلئة"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ✅ نفس Modal الخاص بالتسميع */}
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
                                            status,
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
                                            e.target.value,
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
