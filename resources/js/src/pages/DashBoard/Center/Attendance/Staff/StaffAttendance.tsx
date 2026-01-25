// resources/js/Pages/Admin/Center/Attendance/Staff/StaffAttendance.tsx
import { useState } from "react";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit2, FiFileText } from "react-icons/fi";
import { FiXCircle } from "react-icons/fi";
import { IoMdLink } from "react-icons/io";
import AttendanceModel from "./modals/AttendanceModel";
import { CiCircleCheck } from "react-icons/ci";
import { CiWarning } from "react-icons/ci";
import { CiCircleRemove } from "react-icons/ci";

interface StaffAttendance {
    id: number;
    name: string;
    role: string;
    circle: string;
    arrival: string;
    departure: string;
    expected: string;
    delay: string;
    status: "present" | "late" | "absent";
    hours: string;
    notes: string;
    img: string;
}

const StaffAttendance: React.FC = () => {
    const [staff, setStaff] = useState<StaffAttendance[]>([
        {
            id: 1,
            name: "أحمد محمد صالح",
            role: "معلم",
            circle: "حفظ الجزء 30",
            arrival: "08:12 ص",
            departure: "04:30 م",
            expected: "08:00-16:00",
            delay: "0 دقيقة",
            status: "present",
            hours: "7.5 ساعة",
            notes: "",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            name: "صالح عبدالله محمد",
            role: "مشرف تعليمي",
            circle: "جميع الحلقات",
            arrival: "09:15 ص",
            departure: "04:15 م",
            expected: "08:00-16:00",
            delay: "15 دقيقة",
            status: "late",
            hours: "6.0 ساعة",
            notes: "تأخر بسبب الزحمة",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 3,
            name: "فاطمة أحمد علي",
            role: "مشرفة مالية",
            circle: "-",
            arrival: "",
            departure: "",
            expected: "09:00-17:00",
            delay: "غائب",
            status: "absent",
            hours: "0 ساعة",
            notes: "إجازة مرضية",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 4,
            name: "عبدالرحمن خالد",
            role: "معلم",
            circle: "مراجعة الجزء 15",
            arrival: "07:45 ص",
            departure: "04:45 م",
            expected: "08:00-16:00",
            delay: "مبكر 15 دقيقة",
            status: "present",
            hours: "8.0 ساعة",
            notes: "",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);

    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("today");
    const [loading, setLoading] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffAttendance | null>(
        null,
    );

    const filteredStaff = staff.filter(
        (employee) =>
            employee.name.includes(search) ||
            employee.role.includes(search) ||
            employee.circle.includes(search),
    );

    const getStatusColor = (status: StaffAttendance["status"]) => {
        switch (status) {
            case "present":
                return "text-green-600 bg-green-100";
            case "late":
                return "text-yellow-600 bg-yellow-100";
            case "absent":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const handleEdit = (item: StaffAttendance) => {
        setSelectedStaff(item);
        setShowAttendanceModal(true);
    };

    const handleExportPDF = () => {
        alert("تصدير تقرير PDF...");
    };

    const handleCloseModal = () => {
        setShowAttendanceModal(false);
        setSelectedStaff(null);
    };

    return (
        <>
            <AttendanceModel
                isOpen={showAttendanceModal}
                onClose={handleCloseModal}
                staffName={selectedStaff?.name || ""}
            />
            <div className="teacherMotivate" style={{ padding: "0 15%" }}>
                <div className="teacherMotivate__inner">
                    <div
                        className="userProfile__plan"
                        style={{ paddingBottom: "24px", padding: "0" }}
                    >
                        <div className="userProfile__planTitle">
                            <h1>
                                حضور الموظفين{" "}
                                <span>{filteredStaff.length} موظف</span>
                            </h1>
                        </div>

                        <div className="plan__header">
                            <div className="plan__ai-suggestion">
                                <i>
                                    <RiRobot2Fill />
                                </i>
                                الموظف صالح متأخر 3 أيام متتالية - اقتراح إنذار
                            </div>
                            <div className="plan__current">
                                <h2>سجل الحضور اليومي</h2>
                                <div className="plan__date-range">
                                    <div className="date-picker to">
                                        <select
                                            value={dateFilter}
                                            onChange={(e) =>
                                                setDateFilter(e.target.value)
                                            }
                                            className="mr-2 p-2 border rounded"
                                        >
                                            <option value="today">اليوم</option>
                                            <option value="yesterday">
                                                أمس
                                            </option>
                                            <option value="week">
                                                هذا الأسبوع
                                            </option>
                                            <option value="month">
                                                هذا الشهر
                                            </option>
                                        </select>
                                        <input
                                            type="search"
                                            placeholder="البحث بالاسم أو الدور أو الحلقة..."
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
                                        <th>الاسم</th>
                                        <th>الدور</th>
                                        <th>الحلقة</th>
                                        <th>وقت الوصول</th>
                                        <th>وقت المغادرة</th>
                                        <th>الدوام المتوقع</th>
                                        <th>التأخير</th>
                                        <th>الحالة</th>
                                        <th>الساعات</th>
                                        <th>ملاحظات</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map((item) => (
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
                                            <td>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        item.role === "معلم"
                                                            ? "bg-green-100 text-green-800"
                                                            : item.role ===
                                                                "مشرف تعليمي"
                                                              ? "bg-blue-100 text-blue-800"
                                                              : "bg-purple-100 text-purple-800"
                                                    }`}
                                                >
                                                    {item.role}
                                                </span>
                                            </td>
                                            <td>{item.circle}</td>
                                            <td
                                                className={
                                                    item.status === "present"
                                                        ? "text-green-600 font-medium"
                                                        : ""
                                                }
                                            >
                                                {item.arrival || "-"}
                                            </td>
                                            <td>{item.departure || "-"}</td>
                                            <td className="text-xs">
                                                {item.expected}
                                            </td>
                                            <td
                                                className={
                                                    item.status === "late"
                                                        ? "text-yellow-600 font-medium"
                                                        : ""
                                                }
                                            >
                                                {item.delay}
                                            </td>
                                            <td>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                                                >
                                                    {item.status ===
                                                    "present" ? (
                                                        <>
                                                            <CiCircleCheck />
                                                            حاضر
                                                        </>
                                                    ) : item.status ===
                                                      "late" ? (
                                                        <>
                                                            <CiWarning />
                                                            متأخر
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CiCircleRemove />
                                                            غائب
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="font-medium">
                                                {item.hours}
                                            </td>
                                            <td className="text-xs max-w-24 truncate">
                                                {item.notes || "-"}
                                            </td>
                                            <td>
                                                <div className="teacherStudent__btns">
                                                    <button
                                                        className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100"
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                        disabled={loading}
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        className="teacherStudent__status-btn pdf-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                        onClick={
                                                            handleExportPDF
                                                        }
                                                    >
                                                        <FiFileText />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStaff.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={12}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                لا توجد سجلات حضور لهذا التاريخ
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
                                    <h3>حضور اليوم</h3>
                                    <p className="text-2xl font-bold text-red-600">
                                        93%
                                    </p>
                                    <span className="text-sm text-gray-500">
                                        14/15 موظف
                                    </span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon yellowColor">
                                    <i>
                                        <GrStatusCritical />
                                    </i>
                                </div>
                                <div>
                                    <h3>متأخرين</h3>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        2
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
                                    <h3>غائبين</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        1
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="inputs__verifyOTPBirth"
                            id="userProfile__verifyOTPBirth"
                            style={{ width: "100%" }}
                        >
                            <div className="userProfile__progressContent">
                                <div className="userProfile__progressTitle">
                                    <h1>معدل الحضور الشهري</h1>
                                </div>
                                <p>95%</p>
                                <div className="userProfile__progressBar">
                                    <span style={{ width: "95%" }}></span>
                                </div>
                            </div>
                            <div className="userProfile__progressContent">
                                <div className="userProfile__progressTitle">
                                    <h1>متوسط التأخير</h1>
                                </div>
                                <p>8 دقائق</p>
                                <div className="userProfile__progressBar">
                                    <span style={{ width: "65%" }}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StaffAttendance;
