import { useState } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit2, FiEye, FiCheckSquare, FiUsers } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import StudentsModel from "./models/StudentsModel";
import PerformanceModel from "./models/PerformanceModel";

interface Teacher {
    id: number;
    name: string;
    email: string;
    role: string;
    circle: string;
    performance: string;
    studentsCount: number;
    lastVisit: string;
    status: string;
    img: string;
}

const EducationalSupervisor: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([
        {
            id: 1,
            name: "أحمد محمد صالح العتيبي",
            email: "ahmed.otaibi@example.com",
            role: "معلم قرآن",
            circle: "حفظ الجزء 30 (العصر)",
            performance: "ممتاز 95%",
            studentsCount: 25,
            lastVisit: "2026-01-22",
            status: "نشط",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            name: "فاطمة عبدالله محمد الزهراني",
            email: "fatima.zahrani@example.com",
            role: "مشرفة تعليمية",
            circle: "مراجعة الجزء 15 (الصباح)",
            performance: "جيد جداً 88%",
            studentsCount: 22,
            lastVisit: "2026-01-21",
            status: "نشط",
            img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 3,
            name: "عبدالرحمن خالد عبدالعزيز القحطاني",
            email: "abdulrahman.qahtani@example.com",
            role: "معلم قرآن",
            circle: "حفظ الجزء 30 (الصباح)",
            performance: "جيد 82%",
            studentsCount: 28,
            lastVisit: "2026-01-20",
            status: "يحتاج متابعة",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);

    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("الكل");
    const [filterStatus, setFilterStatus] = useState("الكل");
    const [showStudentsModel, setShowStudentsModel] = useState(false);
    const [showPerformanceModel, setShowPerformanceModel] = useState(false);

    const handleClosePerformanceModel = () => {
        setShowPerformanceModel(false);
        toast("تم إغلاق النموذج");
    };
    const handleOpenPerformanceModel = () => {
        setShowPerformanceModel(true);
        toast("تم فتح النموذج");
    };

    const handleOpenStudentsModel = () => {
        setShowStudentsModel(true);
        toast("تم فتح النموذج");
    };

    const handleCloseStudentsModel = () => {
        setShowStudentsModel(false);
        toast("تم إغلاق النموذج");
    };

    const filteredTeachers = teachers.filter(
        (teacher) =>
            (teacher.name.includes(search) ||
                teacher.email.includes(search) ||
                teacher.circle.includes(search)) &&
            (filterRole === "الكل" || teacher.role === filterRole) &&
            (filterStatus === "الكل" || teacher.status === filterStatus),
    );

    const totalTeachers = teachers.length;
    const highPerformance = teachers.filter(
        (t) => parseInt(t.performance) >= 90,
    ).length;
    const needsFollowup = teachers.filter(
        (t) => t.status === "يحتاج متابعة",
    ).length;

    const handleClassroomVisit = (id: number) => {
        toast.success("تم تسجيل زيارة الفصل بنجاح!");
        setTeachers((prev) =>
            prev.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          lastVisit: new Date().toISOString().split("T")[0],
                      }
                    : t,
            ),
        );
    };

    const handlePerformanceEvaluation = (id: number) => {
        toast.success("تم حفظ تقييم الأداء!");
    };

    const handleViewStudents = (id: number) => {
        toast.success("فتح قائمة طلاب المعلم");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "نشط":
                return "text-green-600 bg-green-100";
            case "يحتاج متابعة":
                return "text-yellow-600 bg-yellow-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getPerformanceColor = (perf: string) => {
        const score = parseInt(perf);
        if (score >= 90) return "text-green-600 bg-green-100";
        if (score >= 80) return "text-blue-600 bg-blue-100";
        return "text-orange-600 bg-orange-100";
    };

    return (
        <div className="teacherMotivate" style={{ padding: "0 15%" }}>
            <div className="teacherMotivate__inner">
                <StudentsModel
                    isOpen={showStudentsModel}
                    onClose={handleCloseStudentsModel}
                />
                <PerformanceModel
                    isOpen={showPerformanceModel}
                    onClose={handleClosePerformanceModel}
                />
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            لوحة المشرف التعليمي{" "}
                            <span>{filteredTeachers.length} معلم</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            متابعة أداء المعلمين + زيارات الفصول + تقييم البرامج
                            التعليمية
                        </div>
                        <div className="plan__current">
                            <h2>إدارة ومتابعة المعلمين والحلقات</h2>
                            <div
                                className="plan__date-range"
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                }}
                            >
                                <select
                                    value={filterRole}
                                    onChange={(e) =>
                                        setFilterRole(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>الكل</option>
                                    <option>معلم قرآن</option>
                                    <option>مشرفة تعليمية</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>الكل</option>
                                    <option>نشط</option>
                                    <option>يحتاج متابعة</option>
                                </select>
                                <input
                                    type="search"
                                    placeholder="البحث بالاسم أو البريد أو الحلقة..."
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
                                    <th>البريد</th>
                                    <th>الدور</th>
                                    <th>الحلقة</th>
                                    <th>الأداء</th>
                                    <th>عدد الطلاب</th>
                                    <th>آخر زيارة</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeachers.map((item) => (
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
                                        <td>{item.email}</td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.role === "معلم قرآن"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {item.role}
                                            </span>
                                        </td>
                                        <td>{item.circle}</td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-bold ${getPerformanceColor(item.performance)}`}
                                            >
                                                {item.performance}
                                            </span>
                                        </td>
                                        <td className="font-bold">
                                            {item.studentsCount}
                                        </td>
                                        <td>{item.lastVisit}</td>
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
                                                    className="teacherStudent__status-btn visit-btn p-2 rounded-full border-2 border-green-300 text-green-600 hover:bg-green-50 w-12 h-12 mr-1"
                                                    onClick={() =>
                                                        handleClassroomVisit(
                                                            item.id,
                                                        )
                                                    }
                                                    title="زيارة فصل"
                                                >
                                                    <IoCheckmarkCircleOutline />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn eval-btn p-2 rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 w-12 h-12 mr-1"
                                                    onClick={
                                                        handleOpenPerformanceModel
                                                    }
                                                    title="تقييم الأداء"
                                                >
                                                    <FiCheckSquare />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn students-btn p-2 rounded-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 w-12 h-12"
                                                    onClick={
                                                        handleOpenStudentsModel
                                                    }
                                                    title="طلاب المعلم"
                                                >
                                                    <FiUsers />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTeachers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد بيانات معلمين لهذا الفلتر
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="plan__stats">
                        <div className="stat-card">
                            <div className="stat-icon greenColor">
                                <i>
                                    <GrStatusCritical />
                                </i>
                            </div>
                            <div>
                                <h3>إجمالي المعلمين</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {totalTeachers}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blueColor">
                                <i>
                                    <GrStatusGood />
                                </i>
                            </div>
                            <div>
                                <h3>أداء ممتاز</h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {highPerformance}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon yellowColor">
                                <i>
                                    <GrStatusCritical />
                                </i>
                            </div>
                            <div>
                                <h3>يحتاج متابعة</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {needsFollowup}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="inputs__verifyOTPBirth">
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>متوسط الأداء</h1>
                            </div>
                            <p>88%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "88%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>معدل الزيارات</h1>
                            </div>
                            <p>95%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "95%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducationalSupervisor;
