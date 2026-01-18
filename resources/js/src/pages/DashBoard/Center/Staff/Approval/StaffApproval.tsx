import { useState } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { RiMessage2Line } from "react-icons/ri";
import { FiXCircle } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoMdLink } from "react-icons/io";
import { MdSupervisorAccount } from "react-icons/md";

const StaffApproval: React.FC = () => {
    const [staffs, setStaffs] = useState([
        {
            id: 1,
            name: "أحمد محمد صالح العتيبي",
            email: "ahmed.otaibi@example.com",
            role: "معلم قرآن",
            circle: "حفظ الجزء 30 (العصر)",
            experience: "3 سنوات",
            date: "2026-01-15",
            status: "pending",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            name: "فاطمة عبدالله محمد الزهراني",
            email: "fatima.zahرانی@example.com",
            role: "مشرفة تعليمية",
            circle: "لا يوجد",
            experience: "5 سنوات",
            date: "2026-01-14",
            status: "pending",
            img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
        {
            id: 3,
            name: "عبدالرحمن خالد عبدالعزيز القحطاني",
            email: "abdulrahman.qahtani@example.com",
            role: "مشرف مالي",
            circle: "لا يوجد",
            experience: "2 سنة",
            date: "2026-01-16",
            status: "pending",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const filteredStaffs = staffs.filter(
        (staff) =>
            staff.name.includes(search) ||
            staff.email.includes(search) ||
            staff.role.includes(search) ||
            staff.circle.includes(search),
    );

    const handleApprove = (id: number) => {
        setLoading(true);
        setTimeout(() => {
            setStaffs((prev) =>
                prev.map((s) =>
                    s.id === id ? { ...s, status: "approved" } : s,
                ),
            );
            setLoading(false);
            toast.success("تم اعتماد الموظف بنجاح!");
        }, 1000);
    };

    const handleReject = (id: number) => {
        setStaffs((prev) => prev.filter((s) => s.id !== id));
        toast.error("تم رفض طلب الموظف");
    };

    const handleSendOTP = (id: number) => {
        setLoading(true);
        setTimeout(() => {
            toast.success(`تم إرسال OTP إلى الموظف ${id}`);
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="teacherMotivate">
            <div className="teacherMotivate__inner">
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            اعتماد الموظفين الجدد{" "}
                            <span>{filteredStaffs.length} موظف</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            تحقق من الخبرة والدور قبل الاعتماد النهائي
                        </div>
                        <div className="plan__current">
                            <h2>قائمة الموظفين المعلقين</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو البريد أو الدور أو الحلقة..."
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
                                    <th>الاسم الكامل</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>الدور</th>
                                    <th>الحلقة/القسم</th>
                                    <th>الخبرة</th>
                                    <th>تاريخ التقديم</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaffs.map((item) => (
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
                                                className={`role-badge ${item.role === "معلم قرآن" ? "teacher" : item.role === "مشرفة تعليمية" ? "supervisor" : "financial"}`}
                                            >
                                                {item.role}
                                            </span>
                                        </td>
                                        <td>{item.circle}</td>
                                        <td>{item.experience}</td>
                                        <td>{item.date}</td>
                                        <td>
                                            {item.status === "approved" ? (
                                                <span className="text-green-600 font-medium">
                                                    معتمد
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
                                                        handleSendOTP(item.id)
                                                    }
                                                    disabled={loading}
                                                >
                                                    <i>
                                                        <RiMessage2Line />
                                                    </i>
                                                </button>
                                                <button className="teacherStudent__status-btn link-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100">
                                                    <IoMdLink />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStaffs.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد طلبات موظفين معلقة حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="plan__stats">
                        <div className="stat-card">
                            <div className="stat-icon redColor">
                                <i>
                                    <GrStatusGood />
                                </i>
                            </div>
                            <div>
                                <h3>طلبات اليوم</h3>
                                <p className="text-2xl font-bold text-red-600">
                                    2
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
                                <h3>معلقة</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {filteredStaffs.length}
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
                                    18
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>معدل الاعتماد</h1>
                            </div>
                            <p>88%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "88%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>متوسط وقت المعالجة</h1>
                            </div>
                            <p>1.8 ساعة</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "78%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffApproval;
