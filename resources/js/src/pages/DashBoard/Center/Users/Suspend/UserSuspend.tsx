import { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEye, FiTrash2, FiShield } from "react-icons/fi";
import { IoPauseCircleOutline, IoPlayCircleOutline } from "react-icons/io5";
import { IoWarningOutline } from "react-icons/io5";
import { GrStatusGood } from "react-icons/gr";
import UserSuspendModel from "./models/UserSuspendModel";
import HistoryModel from "./models/HistoryModel";
import { useSuspendedTeachers } from "./hooks/useSuspendedTeachers";

const UserSuspend: React.FC = () => {
    // ✅ Hook كامل مع actionLoading
    const {
        teachers: users,
        loading: isLoading,
        actionLoading,
        toggleSuspend,
        deleteTeacher,
        setSearch,
    } = useSuspendedTeachers();

    const [search, setSearchLocal] = useState("");
    const [showUserSuspendModel, setShowUserSuspendModel] = useState(false);
    const [showHistoryModel, setShowHistoryModel] = useState(false);

    // ✅ فلترة محلية + server search
    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.teacher.role.toLowerCase().includes(search.toLowerCase()) ||
            user.status.toLowerCase().includes(search.toLowerCase()),
    );

    // ✅ Error handling
    useEffect(() => {
        if (actionLoading) {
            const loadingIds = Object.keys(actionLoading).filter(
                (id) => actionLoading[id as any],
            );
            if (loadingIds.length > 0) {
                toast.loading("جاري التنفيذ...");
            }
        }
    }, [actionLoading]);

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

    // ✅ تحويل teacher role إلى عربي
    const getTeacherRoleTitle = (role: string): string => {
        switch (role) {
            case "teacher":
                return "معلم قرآن";
            case "supervisor":
                return "مشرف تعليمي";
            case "motivator":
                return "محفز";
            case "student_affairs":
                return "شؤون الطلاب";
            case "financial":
                return "مشرف مالي";
            default:
                return "موظف";
        }
    };

    // ✅ لون الدور
    const getRoleColor = (role: string) => {
        switch (role) {
            case "teacher":
                return "bg-green-100 text-green-800";
            case "supervisor":
                return "bg-blue-100 text-blue-800";
            case "financial":
                return "bg-orange-100 text-orange-800";
            case "motivator":
                return "bg-purple-100 text-purple-800";
            case "student_affairs":
                return "bg-indigo-100 text-indigo-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // ✅ معلومات الحلقة
    const getCircleInfo = (user: any) => {
        return (
            user.teacher?.notes ||
            (user.teacher?.session_time === "asr"
                ? "حلقة العصر"
                : "حلقة المغرب") ||
            "غير محدد"
        );
    };

    // ✅ Loading screen
    if (isLoading) {
        return (
            <div className="teacherMotivate" style={{ padding: "0 15%" }}>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-lg text-gray-700">
                        جاري تحميل الموظفين...
                    </span>
                </div>
            </div>
        );
    }

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
                            إيقاف/تفعيل الموظفين{" "}
                            <span>{filteredUsers.length} موظف</span>
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
                            <h2>إدارة حالة الموظفين</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو البريد أو الدور..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearchLocal(e.target.value);
                                            setSearch(e.target.value);
                                        }}
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
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">
                                                    {item.name.charAt(0)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{item.name}</td>
                                        <td className="font-mono text-sm">
                                            {item.email}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(item.teacher.role)}`}
                                            >
                                                {getTeacherRoleTitle(
                                                    item.teacher.role,
                                                )}
                                            </span>
                                        </td>
                                        <td className="max-w-xs">
                                            {getCircleInfo(item)}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                                                    item.status === "active"
                                                        ? "text-green-600 bg-green-100"
                                                        : "text-red-600 bg-red-100"
                                                }`}
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
                                        <td className="text-xs text-gray-600">
                                            {item.updated_at
                                                ? new Date(
                                                      item.updated_at,
                                                  ).toLocaleDateString("ar-EG")
                                                : "-"}
                                        </td>
                                        <td
                                            className="max-w-xs text-xs text-gray-600"
                                            title="غير محدد"
                                        >
                                            غير محدد
                                        </td>
                                        <td className="text-xs text-gray-600">
                                            {item.last_login || "-"}
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                {/* ✅ Toggle Suspend مع actionLoading */}
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
                                                        !!actionLoading[item.id]
                                                    }
                                                    title={
                                                        item.status === "active"
                                                            ? "إيقاف الموظف"
                                                            : "تفعيل الموظف"
                                                    }
                                                >
                                                    {actionLoading[item.id] ? (
                                                        <span className="text-xs">
                                                            ...
                                                        </span>
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

                                                {/* ✅ Delete مع actionLoading */}
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        deleteTeacher(item.id)
                                                    }
                                                    disabled={
                                                        !!actionLoading[item.id]
                                                    }
                                                    title="حذف نهائي"
                                                >
                                                    {actionLoading[item.id] ? (
                                                        <span className="text-xs">
                                                            ...
                                                        </span>
                                                    ) : (
                                                        <FiTrash2 />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && !isLoading && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد موظفين حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ Stats */}
                    <div className="plan__stats">
                        <div className="stat-card">
                            <div className="stat-icon redColor">
                                <i>
                                    <GrStatusGood />
                                </i>
                            </div>
                            <div>
                                <h3>موظفين مفعلين</h3>
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
                                <h3>موظفين موقوفين</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {
                                        users.filter(
                                            (u) => u.status === "inactive",
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

                    {/* ✅ Progress Bars */}
                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>نسبة الموظفين النشطة</h1>
                            </div>
                            <p>
                                {users.length > 0
                                    ? Math.round(
                                          (users.filter(
                                              (u) => u.status === "active",
                                          ).length /
                                              users.length) *
                                              100,
                                      )
                                    : 0}
                                %
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${
                                            users.length > 0
                                                ? Math.round(
                                                      (users.filter(
                                                          (u) =>
                                                              u.status ===
                                                              "active",
                                                      ).length /
                                                          users.length) *
                                                          100,
                                                  )
                                                : 0
                                        }%`,
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
