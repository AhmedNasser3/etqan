// TeachersAffairsPlatform.tsx - صفحة شؤون المعلمين للمنصة الكاملة
import React, { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical, GrDocumentText } from "react-icons/gr";
import { PiWhatsappLogoDuotone, PiUserCircle } from "react-icons/pi";
import { FiEdit2, FiPrinter } from "react-icons/fi";
import { useTeachersAffairsPlatform } from "./hooks/useTeachersAffairsPlatform";
import TeachersAffairsUpdatePlatform from "./models/TeachersAffairsUpdatePlatform";

const TeachersAffairsPlatform: React.FC = () => {
    const {
        teachers,
        loading,
        search,
        setSearch,
        filterRole,
        setFilterRole,
        filterStatus,
        setFilterStatus,
        stats,
        sendWhatsappReminder,
        printCard,
    } = useTeachersAffairsPlatform();

    // ✅ States للـ Modal
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
        null,
    );

    const filteredTeachersCount = teachers.length;

    const handleWhatsappReminder = async (id: number, phone: string) => {
        const success = await sendWhatsappReminder(id, phone);
        if (!success) {
            toast.error("فشل في فتح واتساب");
        }
    };

    const handlePrintCard = (id: number) => {
        printCard(id);
    };

    // ✅ فتح Modal التعديل
    const handleEdit = useCallback((teacherId: number) => {
        setSelectedTeacherId(teacherId);
        setShowUpdateModal(true);
    }, []);

    // ✅ إغلاق Modal
    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedTeacherId(null);
    }, []);

    // ✅ نجاح التعديل
    const handleUpdateSuccess = useCallback(() => {
        toast.success("تم تحديث بيانات المعلم بنجاح! ✨");
        handleCloseUpdateModal();
    }, [handleCloseUpdateModal]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "نشط":
                return "text-green-600 bg-green-100";
            case "معلق":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getSalaryStatusColor = (status: string) => {
        switch (status) {
            case "مدفوع":
                return "text-green-600 bg-green-100";
            case "مستحق":
                return "text-orange-600 bg-orange-100";
            case "جزئي":
                return "text-yellow-600 bg-yellow-100";
            case "معلق":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    if (loading) {
        return (
            <div
                className="teacherMotivate"
                style={{
                    padding: "0 15%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "400px",
                }}
            >
                <div className="navbar">
                    <div className="navbar__inner">
                        <div className="navbar__loading">
                            <div className="loading-spinner">
                                <div className="spinner-circle"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ✅ Modal التعديل للمنصة */}
            {showUpdateModal && selectedTeacherId && (
                <TeachersAffairsUpdatePlatform
                    teacherId={selectedTeacherId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            <div className="teacherMotivate" style={{ padding: "0 15%" }}>
                <div className="teacherMotivate__inner">
                    <div
                        className="userProfile__plan"
                        style={{ paddingBottom: "24px", padding: "0" }}
                    >
                        <div className="userProfile__planTitle">
                            <h1>
                                شؤون المعلمين - المنصة الكاملة{" "}
                                <span>{filteredTeachersCount} معلم</span>
                            </h1>
                        </div>

                        <div className="plan__header">
                            <div className="plan__ai-suggestion">
                                <i>
                                    <RiRobot2Fill />
                                </i>
                                إدارة جميع المعلمين في جميع المجامع بضغطة واحدة
                            </div>
                            <div className="plan__current">
                                <h2>إدارة بيانات المعلمين والرواتب - المنصة</h2>
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
                                        disabled={loading}
                                    >
                                        <option>الكل</option>
                                        {/* هتحتاج تجيب الـ roles من الـ API */}
                                        <option>مدير</option>
                                        <option>معلم</option>
                                        <option>مشرف</option>
                                    </select>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) =>
                                            setFilterStatus(e.target.value)
                                        }
                                        className="p-2 border rounded"
                                        disabled={loading}
                                    >
                                        <option>الكل</option>
                                        <option>نشط</option>
                                        <option>معلق</option>
                                    </select>
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو الهاتف أو الإيميل..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="p-2 border rounded flex-1"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="plan__daily-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>المجمع</th>
                                        <th>الصورة</th>
                                        <th>الاسم</th>
                                        <th>رقم المعلم</th>
                                        <th>العمر</th>
                                        <th>الوظيفة</th>
                                        <th>الهاتف</th>
                                        <th>الحضور</th>
                                        <th>الراتب</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`plan__row ${item.status}`}
                                        >
                                            <td>
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                                    {item.center_name}
                                                </span>
                                            </td>
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
                                                <span className="font-mono text-sm">
                                                    #{item.teacherId}
                                                </span>
                                            </td>
                                            <td>{item.age}</td>
                                            <td>
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                    {item.role}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="text-sm">
                                                    <div>
                                                        {item.phone_formatted}
                                                    </div>
                                                    <div className="text-blue-600 text-xs">
                                                        {item.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-green-600 font-bold">
                                                    {item.attendanceRate}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-bold ${getSalaryStatusColor(
                                                        item.salaryStatus,
                                                    )}`}
                                                >
                                                    {item.salaryStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                                        item.status,
                                                    )}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="teacherStudent__btns">
                                                    <button
                                                        className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 w-12 h-12"
                                                        onClick={() =>
                                                            handleEdit(item.id)
                                                        }
                                                        title="تعديل البيانات"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {teachers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={11}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                لا توجد بيانات معلمين لهذا
                                                الفلتر
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ✅ الـ Stats الخاصة بالمعلمين */}
                        <div className="plan__stats">
                            <div className="stat-card">
                                <div className="stat-icon greenColor">
                                    <i>
                                        <PiUserCircle />
                                    </i>
                                </div>
                                <div>
                                    <h3>إجمالي المعلمين في المنصة</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {stats.totalTeachers || 0}
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
                                    <h3>المعلمين النشطين</h3>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {stats.activeTeachers || 0}
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
                                    <h3>المعلمين المعلقين</h3>
                                    <p className="text-2xl font-bold text-red-600">
                                        {stats.pendingTeachers || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="inputs__verifyOTPBirth">
                            <div className="userProfile__progressContent">
                                <div className="userProfile__progressTitle">
                                    <h1>نسبة دفع الرواتب في المنصة</h1>
                                </div>
                                <p>{stats.paymentRate || 0}%</p>
                                <div className="userProfile__progressBar">
                                    <span
                                        style={{
                                            width: `${stats.paymentRate || 0}%`,
                                        }}
                                    ></span>
                                </div>
                            </div>
                            <div className="userProfile__progressContent">
                                <div className="userProfile__progressTitle">
                                    <h1>المعلمين النشطين</h1>
                                </div>
                                <p>
                                    {stats.activeTeachers}/{stats.totalTeachers}
                                </p>
                                <div className="userProfile__progressBar">
                                    <span
                                        style={{
                                            width: stats.totalTeachers
                                                ? `${(stats.activeTeachers / stats.totalTeachers) * 100}%`
                                                : "0%",
                                        }}
                                    ></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeachersAffairsPlatform;
