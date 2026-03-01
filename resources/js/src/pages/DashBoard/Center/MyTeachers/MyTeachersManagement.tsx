// pages/MyTeachersManagement.tsx
import { useState, useEffect } from "react";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { FaStar } from "react-icons/fa";
import { GoGoal } from "react-icons/go";
import { FiMessageSquare, FiSearch, FiXCircle } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { useMyTeachers } from "./hooks/useMyTeachers";
import { FiEdit3, FiTrash2, FiPlus, FiUpload } from "react-icons/fi";

interface MyTeacherType {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string;
    status: "active" | "pending" | "suspended";
    created_at: string;
}

const MyTeachersManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [mode, setMode] = useState<"active" | "pending">("active");

    const {
        teachers: teacherList,
        totalCount,
        loading,
        error,
        fetchActiveTeachers,
        fetchPendingTeachers,
        toggleTeacherStatus,
        approveTeacher,
        rejectTeacher,
    } = useMyTeachers();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleModeToggle = (m: "active" | "pending") => {
        setMode(m);
        if (m === "active") {
            fetchActiveTeachers();
        } else {
            fetchPendingTeachers();
        }
    };

    useEffect(() => {
        if (mode === "active") {
            fetchActiveTeachers();
        } else {
            fetchPendingTeachers();
        }
    }, [mode, fetchActiveTeachers, fetchPendingTeachers]);

    // ✅ فلترة فورية
    const filteredTeachers = teacherList.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getStatusIcon = (status: MyTeacherType["status"]) => {
        return status === "active" ? (
            <GrStatusGood className={`teacherStudent__status-icon ${status}`} />
        ) : (
            <GrStatusCritical
                className={`teacherStudent__status-icon ${status}`}
            />
        );
    };

    const getStatusText = (status: MyTeacherType["status"]) => {
        return status === "active"
            ? "نشط"
            : status === "pending"
              ? "معلّق"
              : "معلّق";
    };

    const getActionText = (status: MyTeacherType["status"]) => {
        return status === "active" ? "إيقاف الحساب" : "تفعيل الحساب";
    };

    const handleToggleStatus = (id: number) => {
        toggleTeacherStatus(id); // 👈 PUT → /api/v1/teachers/my-teachers/:id + status = active/suspended
    };

    const handleApprove = (id: number) => {
        approveTeacher(id); // 👈 PUT → /api/v1/teachers/my-teachers/:id?status=active
    };

    const handleReject = (id: number) => {
        rejectTeacher(id); // 👈 DELETE → /api/v1/teachers/my-teachers/:id (تعليق)
    };

    const handleDeleteTeacher = (id: number) => {
        // مثال: لو هتستخدم DELETE كامل وليس تعليق فقط
        fetch(`/api/v1/teachers/my-teachers/${id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-TOKEN":
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") || "",
            },
        }).then(async (res) => {
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.message || "فشل في حذف المعلم");
                return;
            }
            alert("تم حذف المعلم بنجاح");
            fetchActiveTeachers(); // أو fetchPendingTeachers() حسب حالتك
        });
    };

    if (loading) {
        return <div className="loading text-center py-12">جاري التحميل...</div>;
    }

    if (error) {
        return (
            <div className="error text-red-600 p-4 bg-red-50 rounded-md">
                خطأ: {error}
            </div>
        );
    }

    return (
        <div className="userProfile__plan" style={{ paddingBottom: "24px" }}>
            <div className="userProfile__planTitle">
                <h1>
                    إدارة معلّميك{" "}
                    <span>{mode === "active" ? "النشطين" : "المعلّقين"}</span>
                </h1>
            </div>

            <div className="plan__header">
                <div className="plan__ai-suggestion">
                    <i>
                        <RiRobot2Fill />
                    </i>
                    راجع المعلمين المتوقفين أو المعلّقين قريباً
                </div>
                <div className="plan__current">
                    <h2>
                        {mode === "active"
                            ? "المعلمين النشطين"
                            : "المعلمين المعلّقين"}
                    </h2>
                    <div className="plan__filters">
                        {/* ✅ Mode Tabs */}
                        <div className="flex space-x-2">
                            <button
                                className={`px-4 py-2 rounded-md text-sm ${
                                    mode === "active"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-700"
                                }`}
                                onClick={() => handleModeToggle("active")}
                            >
                                المعلمين النشطين
                            </button>
                            <button
                                className={`px-4 py-2 rounded-md text-sm ${
                                    mode === "pending"
                                        ? "bg-yellow-500 text-white"
                                        : "bg-gray-200 text-gray-700"
                                }`}
                                onClick={() => handleModeToggle("pending")}
                            >
                                المعل-Men المعلّقين
                            </button>
                        </div>

                        {/* ✅ فلتر البحث */}
                        <div className="date-picker search-input mt-2">
                            <input
                                type="search"
                                placeholder="البحث بالاسم..."
                                value={searchTerm}
                                onChange={handleSearchChange}
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
                            <th>اسم المعلم</th>
                            <th>البريد الإلكتروني</th>
                            <th>الحالة</th>
                            <th>الإجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeachers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center py-8 text-gray-500"
                                >
                                    لا توجد بيانات للمعلمين
                                </td>
                            </tr>
                        ) : (
                            filteredTeachers.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`plan__row ${item.status}`}
                                >
                                    <td className="teacherStudent__img">
                                        <div className="w-12 h-12 rounded-full overflow-hidden">
                                            <img
                                                src={
                                                    item.avatar ||
                                                    "/assets/images/default-avatar.png"
                                                }
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>
                                        <span>
                                            {getStatusText(item.status as any)}
                                        </span>
                                    </td>
                                    <td className="teacherStudent__status">
                                        {/* ✅ تفعيل/إيقاف */}
                                        {(mode === "active" ||
                                            item.status === "suspended") && (
                                            <button
                                                className={`teacherStudent__status-btn ${item.status === "active" ? "active" : "suspended"} p-2 rounded-full border-2 transition-all flex items-center justify-center w-10 h-10 mr-1`}
                                                onClick={() =>
                                                    handleToggleStatus(item.id)
                                                }
                                                title={getActionText(
                                                    item.status as any,
                                                )}
                                            >
                                                {getStatusIcon(
                                                    item.status as any,
                                                )}
                                            </button>
                                        )}

                                        {/* ✅ الموافقة + الرفض للمعلّقين فقط */}
                                        {item.status === "pending" && (
                                            <>
                                                <button
                                                    className="teacherStudent__status-btn approve-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-10 h-10 mr-1 bg-green-50 border-green-300 text-green-600 hover:bg-green-100"
                                                    onClick={() =>
                                                        handleApprove(item.id)
                                                    }
                                                    title="تفعيل المعلم"
                                                >
                                                    <IoCheckmarkCircleOutline />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn reject-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-10 h-10 mr-1 bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100"
                                                    onClick={() =>
                                                        handleReject(item.id)
                                                    }
                                                    title="رفض المعلم"
                                                >
                                                    <FiXCircle />
                                                </button>
                                            </>
                                        )}

                                        {/* ✅ زر مسح / حذف المعلم (يمكن تغيير السلوك حسب الحاجة) */}
                                        <button
                                            className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-10 h-10 mr-1 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                            onClick={() =>
                                                handleDeleteTeacher(item.id)
                                            }
                                            title="حذف المعلم"
                                        >
                                            <FiTrash2 />
                                        </button>

                                        <span className="ml-2">
                                            {getActionText(item.status as any)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ✅ الإحصائيات */}
            <div className="plan__stats">
                <div className="stat-card">
                    <div className="stat-icon redColor">
                        <i>
                            <GoGoal />
                        </i>
                    </div>
                    <div>
                        <h3>عدد المعلمين</h3>
                        <p className="text-2xl font-bold text-red-600">
                            {totalCount}
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
                        <h3>نشط حالياً</h3>
                        <p className="text-2xl font-bold text-yellow-600">
                            {
                                teacherList.filter((t) => t.status === "active")
                                    .length
                            }
                        </p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon greenColor">
                        <i>
                            <FiMessageSquare />
                        </i>
                    </div>
                    <div>
                        <h3>معلّق/موقف</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {
                                teacherList.filter(
                                    (t) => t.status === "suspended",
                                ).length
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* ✅ الـ Progress Bars */}
            <div
                className="inputs__verifyOTPBirth"
                id="userProfile__verifyOTPBirth"
            >
                <div className="userProfile__progressContent">
                    <div className="userProfile__progressTitle">
                        <h1>نسبة النشاط</h1>
                    </div>
                    <p>
                        {teacherList.length > 0
                            ? Math.round(
                                  (teacherList.filter(
                                      (t) => t.status === "active",
                                  ).length /
                                      teacherList.length) *
                                      100,
                              ) + "%"
                            : "0%"}
                    </p>
                    <div className="userProfile__progressBar">
                        <span
                            style={{
                                width: `${
                                    teacherList.length > 0
                                        ? Math.round(
                                              (teacherList.filter(
                                                  (t) => t.status === "active",
                                              ).length /
                                                  teacherList.length) *
                                                  100,
                                          )
                                        : 0
                                }%`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyTeachersManagement;
