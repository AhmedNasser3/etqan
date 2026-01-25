import { useState } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { RiMessage2Line } from "react-icons/ri";
import { FiXCircle } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoMdLink } from "react-icons/io";
import ParentModel from "./modals/ParentModel";

const StudentApproval: React.FC = () => {
    const [students, setStudents] = useState([
        {
            id: 1,
            name: "محمد أحمد محمد علي",
            idNumber: "1234567890",
            age: "10 سنوات",
            circle: "حفظ الجزء 30",
            date: "2026-01-15",
            status: "pending",
            guardianEmail: "",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            name: "عبدالله صالح عبدالرحمن",
            idNumber: "0987654321",
            age: "11 سنة",
            circle: "مراجعة الجزء 15",
            date: "2026-01-14",
            status: "pending",
            guardianEmail: "",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 3,
            name: "فاطمة محمد أحمد السيد",
            idNumber: "1122334455",
            age: "9 سنوات",
            circle: "حفظ الجزء 30",
            date: "2026-01-16",
            status: "pending",
            guardianEmail: "",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [showParentModal, setShowParentModal] = useState(false);

    const filteredStudents = students.filter(
        (student) =>
            student.name.includes(search) ||
            student.idNumber.includes(search) ||
            student.circle.includes(search),
    );

    const handleApprove = (id: number) => {
        setLoading(true);
        setTimeout(() => {
            setStudents((prev) =>
                prev.map((s) =>
                    s.id === id ? { ...s, status: "approved" } : s,
                ),
            );
            setLoading(false);
            toast.success("تم اعتماد الطالب بنجاح!");
        }, 1000);
    };

    const handleReject = (id: number) => {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        toast.error("تم رفض طلب الطالب");
    };

    const handleSendOTP = (name: string) => {
        setLoading(true);
        setTimeout(() => {
            toast.success(`تم إرسال رقم التحقق إلى ولي أمر الطالب ${name}`);
            setLoading(false);
        }, 1000);
    };

    const handleOpenParentModal = () => {
        setShowParentModal(true);
    };

    const handleCloseParentModal = () => {
        setShowParentModal(false);
    };

    return (
        <>
            <ParentModel
                isOpen={showParentModal}
                onClose={handleCloseParentModal}
            />
            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>طلبات اليوم</h3>
                            <p className="text-2xl font-bold text-red-600">3</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon yellowColor">
                            <i>
                                <GrStatusCritical />
                            </i>
                        </div>
                        <div>
                            <h3>معلقة</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                {filteredStudents.length}
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
                            <h3>تم الاعتماد</h3>
                            <p className="text-2xl font-bold text-green-600">
                                24
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            تحقق من بيانات الطلاب قبل الاعتماد النهائي
                        </div>
                        <div className="plan__current">
                            <h2>قائمة الطلاب المعلقين</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو رقم الهوية أو الحلقة..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
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
                                    <th>الاسم الرباعي</th>
                                    <th>رقم الهوية</th>
                                    <th>العمر</th>
                                    <th>الحلقة المطلوبة</th>
                                    <th>تاريخ التقديم</th>
                                    <th>حالة الولي أمر</th>
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
                                        <td>{item.age}</td>
                                        <td>{item.circle}</td>
                                        <td>{item.date}</td>
                                        <td>
                                            {item.guardianEmail ? (
                                                <span className="text-green-600 font-medium">
                                                    مربوط
                                                </span>
                                            ) : (
                                                <span className="text-orange-600 font-medium">
                                                    معلق
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn approve-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1"
                                                    onClick={() =>
                                                        handleApprove(item.id)
                                                    }
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        "..."
                                                    ) : (
                                                        <IoCheckmarkCircleOutline />
                                                    )}
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn reject-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleReject(item.id)
                                                    }
                                                    disabled={loading}
                                                >
                                                    <FiXCircle />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn otp-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleSendOTP(item.name)
                                                    }
                                                    disabled={loading}
                                                >
                                                    <i>
                                                        <RiMessage2Line />
                                                    </i>
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn link-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                                                    onClick={
                                                        handleOpenParentModal
                                                    }
                                                >
                                                    <IoMdLink />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد طلبات معلقة حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>معدل الاعتماد</h1>
                            </div>
                            <p>92%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "92%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>متوسط وقت المعالجة</h1>
                            </div>
                            <p>2.3 ساعة</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "85%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentApproval;
