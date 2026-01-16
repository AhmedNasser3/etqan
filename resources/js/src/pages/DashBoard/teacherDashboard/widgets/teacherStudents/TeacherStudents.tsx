import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiTimerDuotone } from "react-icons/pi";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { FiMessageSquare } from "react-icons/fi";
import { useState, useEffect } from "react";
import facelessAvatar from "../../.././../../assets/images/facelessAvatar.png";
import Profile from "../dashboard/profile";

interface Student {
    id: number;
    img: string;
    name: string;
    title: string;
    progress: number;
    status: "active" | "paused";
}

const TeacherStudents: React.FC = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [dateFrom, setDateFrom] = useState(
        sevenDaysAgo.toISOString().split("T")[0]
    );
    const [dateTo, setDateTo] = useState(today.toISOString().split("T")[0]);
    const [studentsData, setStudentsData] = useState<Student[]>([
        {
            id: 1,
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
            name: "محمد أحمد العتيبي",
            title: "طالب حفظ قرآن - الجزء الثلاثون",
            progress: 98,
            status: "active",
        },
        {
            id: 2,
            img: "https://static.vecteezy.com/system/resources/thumbnails/070/221/098/small_2x/confident-saudi-arabian-man-in-traditional-attire-portrait-against-isolated-backdrop-presenting-png.png",
            name: "عبدالله صالح القحطاني",
            title: "طالب تجويد - المرتل",
            progress: 85,
            status: "active",
        },
        {
            id: 3,
            img: facelessAvatar,
            name: "خالد محمد الدوسري",
            title: "حافظ قرآن كريم - المجود",
            progress: 92,
            status: "active",
        },
        {
            id: 4,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            name: "أحمد سعود الشمري",
            title: "طالب تلاوة - السور القصيرة",
            progress: 45,
            status: "paused",
        },
        {
            id: 5,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/974/small/front-view-a-happy-arab-man-in-traditional-white-thobe-and-red-and-white-checkered-ghutra-isolated-on-transparent-background-free-png.png",
            name: "سعيد عبدالرحمن الحربي",
            title: "طالب حفظ - الجزء الخامس",
            progress: 67,
            status: "active",
        },
        {
            id: 6,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            name: "يوسف ناصر الغامدي",
            title: "طالب تجويد - القراءات السبع",
            progress: 78,
            status: "paused",
        },
        {
            id: 7,
            img: "https://static.vecteezy.com/system/resources/thumbnails/072/489/921/small/a-smiling-saudi-arabian-man-in-a-white-thobe-and-ghutra-isolated-on-transparent-background-free-png.png",
            name: "عمر فيصل الزهراني",
            title: "حافظ قرآن - المرتل المتقن",
            progress: 88,
            status: "active",
        },
    ]);
    const [filteredData, setFilteredData] = useState<Student[]>(studentsData);

    const getProgressClass = (progress: number) => {
        if (progress >= 70) return "teacherStudent__progress-badge green";
        if (progress >= 50) return "teacherStudent__progress-badge orange";
        return "teacherStudent__progress-badge red";
    };

    const toggleStudentStatus = (studentId: number) => {
        setStudentsData((prev) =>
            prev.map((student) =>
                student.id === studentId
                    ? {
                          ...student,
                          status:
                              student.status === "active" ? "paused" : "active",
                      }
                    : student
            )
        );
    };

    const getStatusIcon = (status: Student["status"]) => {
        return status === "active" ? (
            <GrStatusGood className={`teacherStudent__status-icon ${status}`} />
        ) : (
            <GrStatusCritical
                className={`teacherStudent__status-icon ${status}`}
            />
        );
    };

    const getStatusText = (status: Student["status"]) => {
        return status === "active" ? "نشط" : "متوقف";
    };

    const getActionText = (status: Student["status"]) => {
        return status === "active" ? "وقف الطالب" : "تنشيط الطالب";
    };

    const fetchStudentsData = () => {
        const filtered = studentsData.filter((item) => true);
        setFilteredData(filtered);
    };

    useEffect(() => {
        fetchStudentsData();
    }, [dateFrom, dateTo]);

    return (
        <>
            <Profile />
            <div
                className="userProfile__plan"
                style={{ paddingBottom: "24px" }}
            >
                <div className="userProfile__planTitle">
                    <h1>
                        جميع طلابك <span>7 طلاب</span>
                    </h1>
                </div>

                <div className="plan__header">
                    <div className="plan__ai-suggestion">
                        <i>
                            <RiRobot2Fill />
                        </i>
                        راجع أحمد سعود غداً
                    </div>
                    <div className="plan__current">
                        <h2>قائمة الطلاب</h2>
                        <div className="plan__date-range">
                            <div className="date-picker to">
                                <input
                                    type="seacrh"
                                    placeholder="البحث بالاسم..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>اسم الطالب</th>
                                <th>مستوى التقدم</th>
                                <th>الحالة</th>
                                <th>الإجراء</th>
                                <th>التواصل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`plan__row completed`}
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
                                    <td>
                                        <span
                                            className={`teacherStudent__progress-badge ${getProgressClass(
                                                item.progress
                                            )}`}
                                        >
                                            {item.progress}%
                                        </span>
                                    </td>
                                    <td>
                                        <span>
                                            {getStatusText(item.status)}
                                        </span>
                                    </td>
                                    <td className="teacherStudent__status">
                                        <button
                                            className={`teacherStudent__status-btn ${item.status} p-2 rounded-full border-2 transition-all flex items-center justify-center w-10 h-10 mr-2`}
                                            onClick={() =>
                                                toggleStudentStatus(item.id)
                                            }
                                        >
                                            {getStatusIcon(item.status)}
                                        </button>
                                        <span>
                                            {getActionText(item.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="teacherStudent__chat">
                                            <FiMessageSquare className="text-xl" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GoGoal />
                            </i>
                        </div>
                        <div>
                            <h3>عدد الطلاب</h3>
                            <p className="text-2xl font-bold text-red-600">7</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon yellowColor">
                            <i>
                                <FaStar />
                            </i>
                        </div>
                        <div>
                            <h3>متوسط التقدم</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                79%
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
                            <h3>متصل حالياً</h3>
                            <p className="text-2xl font-bold text-green-600">
                                3
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    className="inputs__verifyOTPBirth"
                    id="userProfile__verifyOTPBirth"
                >
                    <div
                        className="userProfile__progressContent"
                        id="userProfile__progressContent"
                    >
                        <div className="userProfile__progressTitle">
                            <h1>إجمالي الحفظ</h1>
                        </div>
                        <p>78%</p>
                        <div className="userProfile__progressBar">
                            <span style={{ width: "78%" }}></span>
                        </div>
                    </div>
                    <div
                        className="userProfile__progressContent"
                        id="userProfile__progressContent"
                    >
                        <div className="userProfile__progressTitle">
                            <h1>معدل الحضور</h1>
                        </div>
                        <p>95%</p>
                        <div
                            className="userProfile__progressBar"
                            id="userProfile__progressBar"
                        >
                            <span style={{ width: "95%" }}></span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherStudents;
