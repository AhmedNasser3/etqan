import { useState } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical, GrDocumentText } from "react-icons/gr";
import { PiWhatsappLogoDuotone, PiStudent } from "react-icons/pi";
import { FiEdit2, FiDownload, FiFilter, FiSearch } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

interface Student {
    id: number;
    name: string;
    idNumber: string;
    age: string;
    grade: string;
    circle: string;
    guardianName: string;
    guardianPhone: string;
    attendanceRate: string;
    balance: string;
    status: string;
    img: string;
}

const StudentAffairs: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([
        {
            id: 1,
            name: "محمد أحمد محمد علي",
            idNumber: "1234567890",
            age: "10 سنوات",
            grade: "الأول الابتدائي",
            circle: "حفظ الجزء 30",
            guardianName: "أحمد محمد علي",
            guardianPhone: "966932094321",
            attendanceRate: "98%",
            balance: "ر.150",
            status: "نشط",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            name: "فاطمة محمد أحمد السيد",
            idNumber: "1122334455",
            age: "9 سنوات",
            grade: "الأول الابتدائي",
            circle: "حفظ الجزء 30",
            guardianName: "محمد أحمد السيد",
            guardianPhone: "966501234567",
            attendanceRate: "95%",
            balance: "ر.0",
            status: "نشط",
            img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 3,
            name: "عبدالله صالح عبدالرحمن",
            idNumber: "0987654321",
            age: "11 سنة",
            grade: "الثاني الابتدائي",
            circle: "مراجعة الجزء 15",
            guardianName: "صالح عبدالرحمن",
            guardianPhone: "966598765432",
            attendanceRate: "92%",
            balance: "ر.450",
            status: "متأخر مالياً",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);

    const [search, setSearch] = useState("");
    const [filterGrade, setFilterGrade] = useState("الكل");
    const [filterStatus, setFilterStatus] = useState("الكل");

    const filteredStudents = students.filter(
        (student) =>
            (student.name.includes(search) ||
                student.idNumber.includes(search) ||
                student.guardianName.includes(search)) &&
            (filterGrade === "الكل" || student.grade === filterGrade) &&
            (filterStatus === "الكل" || student.status === filterStatus),
    );

    const totalStudents = students.length;
    const totalBalance = students.reduce(
        (sum, s) => sum + parseInt(s.balance.replace("ر.", "")),
        0,
    );
    const activeStudents = students.filter((s) => s.status === "نشط").length;

    const handlePayBalance = (id: number) => {
        toast.success("تم تسديد المصروفات بنجاح!");
        setStudents((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, balance: "ر.0", status: "نشط" } : s,
            ),
        );
    };

    const handlePrintReport = () => {
        toast.success("تم طباعة بطاقة الطالب PDF");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "نشط":
                return "text-green-600 bg-green-100";
            case "متأخر مالياً":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <div className="teacherMotivate" style={{ padding: "0 15%" }}>
            <div className="teacherMotivate__inner">
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            شؤون الطلاب{" "}
                            <span>{filteredStudents.length} طالب</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            يمكنك متابعة الحضور والمصروفات وطباعة البطاقات بضغطة
                            واحدة
                        </div>
                        <div className="plan__current">
                            <h2>إدارة بيانات الطلاب وأولياء الأمور</h2>
                            <div
                                className="plan__date-range"
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                }}
                            >
                                <select
                                    value={filterGrade}
                                    onChange={(e) =>
                                        setFilterGrade(e.target.value)
                                    }
                                    className="p-2 border rounded"
                                >
                                    <option>الكل</option>
                                    <option>الأول الابتدائي</option>
                                    <option>الثاني الابتدائي</option>
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
                                    <option>متأخر مالياً</option>
                                </select>
                                <input
                                    type="search"
                                    placeholder="البحث بالاسم أو الهوية أو ولي الأمر..."
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
                                    <th>رقم الهوية</th>
                                    <th>الصف</th>
                                    <th>الحلقة</th>
                                    <th>ولي الأمر</th>
                                    <th>الحضور</th>
                                    <th>المصروفات</th>
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
                                        <td>{item.idNumber}</td>
                                        <td>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                {item.grade}
                                            </span>
                                        </td>
                                        <td>{item.circle}</td>
                                        <td>
                                            <div className="text-sm">
                                                <div>{item.guardianName}</div>
                                                <div className="text-blue-600">
                                                    {item.guardianPhone}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-green-600 font-bold">
                                                {item.attendanceRate}
                                            </span>
                                        </td>
                                        <td
                                            className={
                                                parseInt(
                                                    item.balance.replace(
                                                        "ر.",
                                                        "",
                                                    ),
                                                ) > 0
                                                    ? "text-red-600 font-bold"
                                                    : "text-green-600 font-bold"
                                            }
                                        >
                                            {item.balance}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                {parseInt(
                                                    item.balance.replace(
                                                        "ر.",
                                                        "",
                                                    ),
                                                ) > 0 && (
                                                    <button
                                                        className="teacherStudent__status-btn pay-btn p-2 rounded-full border-2 border-green-300 text-green-600 hover:bg-green-50 w-12 h-12 mr-1"
                                                        onClick={() =>
                                                            handlePayBalance(
                                                                item.id,
                                                            )
                                                        }
                                                        title="تسديد المصروفات"
                                                    >
                                                        <PiWhatsappLogoDuotone />
                                                    </button>
                                                )}
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 w-12 h-12 mr-1"
                                                    title="تعديل البيانات"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn print-btn p-2 rounded-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 w-12 h-12"
                                                    onClick={handlePrintReport}
                                                    title="طباعة بطاقة الطالب"
                                                >
                                                    <GrDocumentText />
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
                            <div className="stat-icon greenColor">
                                <i>
                                    <PiStudent />
                                </i>
                            </div>
                            <div>
                                <h3>إجمالي الطلاب</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {totalStudents}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon yellowColor">
                                <i>
                                    <GrStatusGood />
                                </i>
                            </div>
                            <div>
                                <h3>نسبة الحضور</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    95%
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon redColor">
                                <i>
                                    <GrStatusCritical />
                                </i>
                            </div>
                            <div>
                                <h3>المجموع المستحق</h3>
                                <p className="text-2xl font-bold text-red-600">
                                    ر.{totalBalance.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="inputs__verifyOTPBirth">
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>نسبة التسديد</h1>
                            </div>
                            <p>
                                {Math.round(
                                    ((totalStudents -
                                        students.filter(
                                            (s) =>
                                                parseInt(
                                                    s.balance.replace("ر.", ""),
                                                ) > 0,
                                        ).length) /
                                        totalStudents) *
                                        100,
                                )}
                                %
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width:
                                            Math.round(
                                                ((totalStudents -
                                                    students.filter(
                                                        (s) =>
                                                            parseInt(
                                                                s.balance.replace(
                                                                    "ر.",
                                                                    "",
                                                                ),
                                                            ) > 0,
                                                    ).length) /
                                                    totalStudents) *
                                                    100,
                                            ) + "%",
                                    }}
                                ></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>الطلاب النشطين</h1>
                            </div>
                            <p>
                                {activeStudents}/{totalStudents}
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width:
                                            (activeStudents / totalStudents) *
                                                100 +
                                            "%",
                                    }}
                                ></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAffairs;
