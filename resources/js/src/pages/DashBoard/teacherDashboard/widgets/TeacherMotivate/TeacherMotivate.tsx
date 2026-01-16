import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { FiMessageSquare } from "react-icons/fi";
import { useState } from "react";
import { useStudentsData, Student } from "./studentsData";
import { getProgressClass, getStatusText } from "./rewardUtils";
import Profile from "../dashboard/profile";

const TeacherMotivate: React.FC = () => {
    const { studentsData, setStudentsData, filteredData } = useStudentsData();

    const [editingStudent, setEditingStudent] = useState<number | null>(null);
    const [rewardInput, setRewardInput] = useState("");

    const handleRewardClick = (studentId: number) => {
        if (editingStudent === studentId) {
            setEditingStudent(null);
            setRewardInput("");
            return;
        }
        setEditingStudent(studentId);
        setRewardInput("");
    };

    const handleRewardChange = (studentId: number, inputValue: string) => {
        const changeValue = parseInt(inputValue) || 0;
        setRewardInput(inputValue);
        setStudentsData((prev) =>
            prev.map((student) =>
                student.id === studentId
                    ? { ...student, reward: student.reward + changeValue }
                    : student
            )
        );
    };

    return (
        <div className="teacherMotivate">
            <div className="teacherMotivate__inner">
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
                            محمد أحمد العتيبي يستحق مكافأة
                        </div>
                        <div className="plan__current">
                            <h2>قائمة الطلاب</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
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
                                    <th>المكافأة</th>
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
                                                className={`teacherStudent__status-btn reward-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-10 h-10 mr-2 ${
                                                    editingStudent === item.id
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleRewardClick(item.id)
                                                }
                                            >
                                                مكافأة
                                            </button>
                                            {editingStudent === item.id && (
                                                <div className="reward-input-container">
                                                    <div className="date-picker to">
                                                        <input
                                                            type="number"
                                                            value={rewardInput}
                                                            onChange={(e) => {
                                                                handleRewardChange(
                                                                    item.id,
                                                                    e.target
                                                                        .value
                                                                );
                                                            }}
                                                            className="reward-input"
                                                            placeholder="القيمة"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {item.reward !== 0 && (
                                                <span
                                                    className={`reward-value ${
                                                        item.reward > 0
                                                            ? "positive"
                                                            : "negative"
                                                    }`}
                                                >
                                                    {item.reward > 0
                                                        ? `+${item.reward}`
                                                        : item.reward}
                                                </span>
                                            )}
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
                                <p className="text-2xl font-bold text-red-600">
                                    7
                                </p>
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
            </div>
        </div>
    );
};

export default TeacherMotivate;
