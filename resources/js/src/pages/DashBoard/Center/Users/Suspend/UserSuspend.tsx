import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit2, FiEye, FiTrash2, FiShield } from "react-icons/fi";
import { IoPauseCircleOutline, IoPlayCircleOutline } from "react-icons/io5";
import { IoWarningOutline } from "react-icons/io5";
import { GrStatusGood } from "react-icons/gr";
import UserSuspendModel from "./models/UserSuspendModel";
import HistoryModel from "./models/HistoryModel";

const UserSuspend: React.FC = () => {
    const [users, setUsers] = useState([
        {
            id: 1,
            name: "أحمد محمد صالح",
            email: "ahmed@example.com",
            role: "معلم",
            circle: "حفظ الجزء 30",
            status: "suspended",
            suspendedAt: "2026-01-15 10:30",
            reason: "انتهاك سياسة الحضور",
            lastLogin: "2026-01-14",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 2,
            name: "فاطمة أحمد علي",
            email: "fatima@example.com",
            role: "طالب",
            circle: "حفظ الجزء 30",
            status: "active",
            suspendedAt: "",
            reason: "",
            lastLogin: "2026-01-16",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 3,
            name: "عبدالله صالح",
            email: "abdullah@example.com",
            role: "ولي أمر",
            circle: "محمد أحمد (طالب)",
            status: "suspended",
            suspendedAt: "2026-01-12 14:20",
            reason: "إرسال رسائل غير لائقة",
            lastLogin: "2026-01-11",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
        {
            id: 4,
            name: "سارة خالد",
            email: "sarah@example.com",
            role: "مشرفة تعليمية",
            circle: "جميع الحلقات",
            status: "active",
            suspendedAt: "",
            reason: "",
            lastLogin: "2026-01-16",
            img: "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png",
        },
    ]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [showUserSuspendModel, setShowUserSuspendModel] = useState(false);
    const [showHistoryModel, setShowHistoryModel] = useState(false);
    const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

    const handleOpenUserSuspendModel = () => {
        setShowUserSuspendModel(true);
    };
    const handleOpenHistoryModel = () => {
        setShowHistoryModel(true);
    };

    const handleCloseUserSuspendModel = () => {
        setShowUserSuspendModel(false);
    };
    const handleCloseHistoryModel = () => {
        setShowHistoryModel(false);
    };
    const filteredUsers = users.filter(
        (user) =>
            user.name.includes(search) ||
            user.email.includes(search) ||
            user.role.includes(search) ||
            user.status.includes(search),
    );

    const toggleSuspend = (id: number) => {
        setLoadingUserId(id);
        const user = users.find((u) => u.id === id);
        const isActivating = user?.status === "active";

        setTimeout(() => {
            setUsers((prev) =>
                prev.map((user) => {
                    if (user.id === id) {
                        const newStatus =
                            user.status === "active" ? "suspended" : "active";
                        return {
                            ...user,
                            status: newStatus,
                            suspendedAt:
                                newStatus === "suspended"
                                    ? new Date().toLocaleString("ar-EG")
                                    : "",
                        };
                    }
                    return user;
                }),
            );
            setLoadingUserId(null);
            if (isActivating) {
                toast.error("تم إيقاف الحساب بنجاح");
            } else {
                toast.success("تم تفعيل الحساب بنجاح");
            }
        }, 1000);
    };

    const handleDelete = (id: number) => {
        setLoadingUserId(id);
        setTimeout(() => {
            setUsers((prev) => prev.filter((user) => user.id !== id));
            setLoadingUserId(null);
            toast.error("تم حذف الحساب بنجاح");
        }, 1000);
    };

    const getStatusColor = (status: string) => {
        return status === "active"
            ? "text-green-600 bg-green-100"
            : "text-red-600 bg-red-100";
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "معلم":
                return "bg-green-100 text-green-800";
            case "مشرفة تعليمية":
                return "bg-blue-100 text-blue-800";
            case "طالب":
                return "bg-purple-100 text-purple-800";
            case "ولي أمر":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="teacherMotivate" style={{ padding: "0 15%" }}>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="teacherMotivate__inner">
                <UserSuspendModel
                    isOpen={showUserSuspendModel}
                    onClose={handleCloseUserSuspendModel}
                />
                <HistoryModel
                    isOpen={showHistoryModel}
                    onClose={handleCloseHistoryModel}
                />
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            إيقاف/تفعيل الحسابات{" "}
                            <span>{filteredUsers.length} حساب</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            الحسابات المعلقة لأكثر من 30 يوم سيتم حذفها تلقائياً
                        </div>
                        <div className="plan__current">
                            <h2>إدارة حالة الحسابات</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو البريد أو الدور..."
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
                                    <th>البريد الإلكتروني</th>
                                    <th>الدور</th>
                                    <th>الحلقة/المرتبط</th>
                                    <th>الحالة</th>
                                    <th>تاريخ الإيقاف</th>
                                    <th>سبب الإيقاف</th>
                                    <th>آخر دخول</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((item) => (
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
                                        <td className="font-mono text-sm">
                                            {item.email}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(item.role)}`}
                                            >
                                                {item.role}
                                            </span>
                                        </td>
                                        <td className="max-w-xs">
                                            {item.circle}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(item.status)}`}
                                            >
                                                {item.status === "active" ? (
                                                    <>
                                                        <GrStatusGood />
                                                        مفعل
                                                    </>
                                                ) : (
                                                    <>
                                                        <IoWarningOutline />
                                                        موقوف
                                                    </>
                                                )}
                                            </span>
                                        </td>

                                        <td className="text-xs">
                                            {item.suspendedAt || "-"}
                                        </td>
                                        <td
                                            className="max-w-xs text-xs"
                                            title={item.reason}
                                        >
                                            {item.reason || "-"}
                                        </td>
                                        <td className="text-xs">
                                            {item.lastLogin}
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn suspend-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1"
                                                    style={{
                                                        borderColor:
                                                            item.status ===
                                                            "active"
                                                                ? "#ef4444"
                                                                : "#10b981",
                                                        color:
                                                            item.status ===
                                                            "active"
                                                                ? "#ef4444"
                                                                : "#10b981",
                                                    }}
                                                    onClick={() =>
                                                        toggleSuspend(item.id)
                                                    }
                                                    disabled={
                                                        loadingUserId ===
                                                        item.id
                                                    }
                                                >
                                                    {loadingUserId ===
                                                    item.id ? (
                                                        "..."
                                                    ) : item.status ===
                                                      "active" ? (
                                                        <IoPauseCircleOutline />
                                                    ) : (
                                                        <IoPlayCircleOutline />
                                                    )}
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn reason-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100"
                                                    title="سبب الإيقاف"
                                                    onClick={
                                                        handleOpenUserSuspendModel
                                                    }
                                                >
                                                    <FiShield />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn view-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    title="عرض السجل"
                                                    onClick={
                                                        handleOpenHistoryModel
                                                    }
                                                >
                                                    <FiEye />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    disabled={
                                                        loadingUserId ===
                                                        item.id
                                                    }
                                                    title="حذف نهائي"
                                                >
                                                    {loadingUserId ===
                                                        item.id &&
                                                    item.id ===
                                                        loadingUserId ? (
                                                        "..."
                                                    ) : (
                                                        <FiTrash2 />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد حسابات حالياً
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
                                <h3>حسابات مفعلة</h3>
                                <p className="text-2xl font-bold text-red-600">
                                    {
                                        users.filter(
                                            (u) => u.status === "active",
                                        ).length
                                    }
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
                                <h3>حسابات موقوفة</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {
                                        users.filter(
                                            (u) => u.status === "suspended",
                                        ).length
                                    }
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
                                <h3>آخر مراجعة</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    اليوم
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        {" "}
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>نسبة الحسابات النشطة</h1>
                            </div>
                            <p>
                                {Math.round(
                                    (users.filter((u) => u.status === "active")
                                        .length /
                                        users.length) *
                                        100,
                                )}
                                %
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${Math.round((users.filter((u) => u.status === "active").length / users.length) * 100)}%`,
                                    }}
                                ></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>متوسط مدة الإيقاف</h1>
                            </div>
                            <p>4 أيام</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "40%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSuspend;
