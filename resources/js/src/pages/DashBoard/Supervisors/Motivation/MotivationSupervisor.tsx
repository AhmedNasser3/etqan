import { useState } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill, RiStarFill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone, PiGift } from "react-icons/pi";
import { FiEdit2, FiAward, FiTrendingUp } from "react-icons/fi";
import { IoCheckmarkCircleOutline, IoTrophyOutline } from "react-icons/io5";
import PerformanceChartsModal from "./model/PerformanceChartsModal";

interface Student {
    id: number;
    name: string;
    grade: string;
    circle: string;
    points: number;
    achievements: string;
    level: string;
    teacher: string;
    status: string;
    img: string;
}

const MotivationSupervisor: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([
        {
            id: 1,
            name: "محمد أحمد محمد علي",
            grade: "الأول الابتدائي",
            circle: "حفظ الجزء 30",
            points: 285,
            achievements: "نجم الشهر ×3، أفضل حفظ",
            level: "ذهبي",
            teacher: "أحمد العتيبي",
            status: "متميز",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            name: "فاطمة محمد أحمد السيد",
            grade: "الأول الابتدائي",
            circle: "حفظ الجزء 30",
            points: 210,
            achievements: "نجم الشهر ×2",
            level: "فضي",
            teacher: "أحمد العتيبي",
            status: "ممتاز",
            img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 3,
            name: "عبدالله صالح عبدالرحمن",
            grade: "الثاني الابتدائي",
            circle: "مراجعة الجزء 15",
            points: 145,
            achievements: "نجم الشهر ×1",
            level: "برونزي",
            teacher: "فاطمة الزهراني",
            status: "جيد",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);

    const [search, setSearch] = useState("");
    const [filterLevel, setFilterLevel] = useState("الكل");
    const [filterStatus, setFilterStatus] = useState("الكل");
    const [showPerformanceChartsModal, setShowPerformanceChartsModal] =
        useState(false);

    const handleClosePerformanceChartsModal = () => {
        setShowPerformanceChartsModal(false);
        toast("تم إغلاق النموذج");
    };
    const handleOpenPerformanceChartsModal = () => {
        setShowPerformanceChartsModal(true);
        toast("تم فتح النموذج");
    };
    const filteredStudents = students.filter(
        (student) =>
            (student.name.includes(search) ||
                student.circle.includes(search) ||
                student.teacher.includes(search)) &&
            (filterLevel === "الكل" || student.level === filterLevel) &&
            (filterStatus === "الكل" || student.status === filterStatus),
    );

    const totalPoints = students.reduce((sum, s) => sum + s.points, 0);
    const goldenStudents = students.filter((s) => s.level === "ذهبي").length;
    const motivatedStudents = students.filter(
        (s) => s.status === "متميز",
    ).length;

    const addPoints = (id: number, points: number) => {
        setStudents((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, points: s.points + points } : s,
            ),
        );
        toast.success(`تم إضافة ${points} نقطة تحفيزية!`);
    };

    const awardCertificate = (id: number) => {
        toast.success("تم إصدار شهادة التقدير PDF!");
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case "ذهبي":
                return "text-yellow-500 bg-yellow-100";
            case "فضي":
                return "text-gray-400 bg-gray-100";
            case "برونزي":
                return "text-orange-500 bg-orange-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "متميز":
                return "text-emerald-600 bg-emerald-100";
            case "ممتاز":
                return "text-blue-600 bg-blue-100";
            case "جيد":
                return "text-indigo-600 bg-indigo-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <div className="teacherMotivate" style={{ padding: "0 15%" }}>
            <div className="teacherMotivate__inner">
                <PerformanceChartsModal
                    isOpen={showPerformanceChartsModal}
                    onClose={handleClosePerformanceChartsModal}
                />
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            لوحة مشرف التحفيز{" "}
                            <span>{filteredStudents.length} طالب</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            نظام نقاط التحفيز + الجوائز + الشهادات + متابعة
                            الأداء
                        </div>
                        <div className="plan__current">
                            <h2>نظام التحفيز والمكافآت</h2>
                            <div
                                className="plan__date-range"
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                }}
                            >
                                <select
                                    value={filterLevel}
                                    onChange={(e) =>
                                        setFilterLevel(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>الكل</option>
                                    <option>ذهبي</option>
                                    <option>فضي</option>
                                    <option>برونزي</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>الكل</option>
                                    <option>متميز</option>
                                    <option>ممتاز</option>
                                    <option>جيد</option>
                                </select>
                                <input
                                    type="search"
                                    placeholder="البحث بالاسم أو الحلقة أو المعلم..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="p-2 border rounded flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="plan__daily-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>الصورة</th>
                                    <th>الاسم</th>
                                    <th>الصف</th>
                                    <th>الحلقة</th>
                                    <th>النقاط</th>
                                    <th>الإنجازات</th>
                                    <th>المستوى</th>
                                    <th>المعلم</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`plan__row ${item.status}`}
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                                <img
                                                    src={item.img}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{item.grade}</td>
                                        <td>{item.circle}</td>
                                        <td className="font-bold text-lg text-purple-600">
                                            {item.points}
                                        </td>
                                        <td className="text-sm max-w-xs">
                                            {item.achievements}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getLevelColor(item.level)}`}
                                            >
                                                {item.level === "ذهبي" && (
                                                    <RiStarFill />
                                                )}
                                                {item.level}
                                            </span>
                                        </td>
                                        <td>{item.teacher}</td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn points-btn p-2 rounded-full border-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50 w-12 h-12 mr-1"
                                                    onClick={() =>
                                                        addPoints(item.id, 50)
                                                    }
                                                    title="إضافة 50 نقطة"
                                                >
                                                    +50
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn award-btn p-2 rounded-full border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50 w-12 h-12 mr-1"
                                                    onClick={() =>
                                                        awardCertificate(
                                                            item.id,
                                                        )
                                                    }
                                                    title="شهادة تقدير"
                                                >
                                                    <IoTrophyOutline />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn trend-btn p-2 rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 w-12 h-12"
                                                    title="تفاصيل الأداء"
                                                    onClick={
                                                        handleOpenPerformanceChartsModal
                                                    }
                                                >
                                                    <FiTrendingUp />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد بيانات طلاب لهذا الفلتر
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="plan__stats">
                        <div className="stat-card">
                            <div className="stat-icon purpleColor">
                                <i>
                                    <RiStarFill />
                                </i>
                            </div>
                            <div>
                                <h3>إجمالي النقاط</h3>
                                <p className="text-2xl font-bold text-purple-600">
                                    {totalPoints.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon goldColor">
                                <i>
                                    <PiGift />
                                </i>
                            </div>
                            <div>
                                <h3>ذهبي</h3>
                                <p className="text-2xl font-bold text-yellow-500">
                                    {goldenStudents}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon greenColor">
                                <i>
                                    <PiWhatsappLogoDuotone />
                                </i>
                            </div>
                            <div>
                                <h3>متميزون</h3>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {motivatedStudents}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="inputs__verifyOTPBirth">
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>معدل النقاط</h1>
                            </div>
                            <p>
                                {Math.round(totalPoints / students.length)} نقطة
                            </p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "92%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>نسبة المتميزين</h1>
                            </div>
                            <p>
                                {Math.round(
                                    (motivatedStudents / students.length) * 100,
                                )}
                                %
                            </p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "85%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MotivationSupervisor;
