// StudentAffairs.tsx - النسخة المُصححة بدون refetch
import React, { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical, GrDocumentText } from "react-icons/gr";
import { PiWhatsappLogoDuotone, PiStudent } from "react-icons/pi";
import { FiEdit2 } from "react-icons/fi";
import { useStudentAffairs } from "./hooks/useStudentAffairs";
import StudentAffairsUpdate from "./models/StudentAffairsUpdate";

const StudentAffairs: React.FC = () => {
    const {
        students,
        loading,
        search,
        setSearch,
        filterGrade,
        setFilterGrade,
        filterStatus,
        setFilterStatus,
        stats,
        sendWhatsappReminder,
        printCard,
        // ❌ شيلنا refetch لأنه مش موجود
    } = useStudentAffairs();

    // ✅ States للـ Modal
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        null,
    );

    const filteredStudentsCount = students.length;

    const handleWhatsappReminder = async (id: number, phone: string) => {
        const success = await sendWhatsappReminder(id, phone);
        if (!success) {
            toast.error("فشل في فتح واتساب");
        }
    };

    const handlePrintReport = (id: number) => {
        printCard(id);
    };

    // ✅ فتح Modal التعديل
    const handleEdit = useCallback((studentId: number) => {
        setSelectedStudentId(studentId);
        setShowUpdateModal(true);
    }, []);

    // ✅ إغلاق Modal
    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedStudentId(null);
    }, []);

    // ✅ نجاح التعديل - بدون refetch
    const handleUpdateSuccess = useCallback(() => {
        toast.success("تم تحديث بيانات الطالب بنجاح! ✨");
        handleCloseUpdateModal();
        // ✅ لو عايز تحديث البيانات، ضيف window.location.reload() أو اعمل refetch في الـ hook
    }, [handleCloseUpdateModal]);

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
                <div>جاري تحميل الطلاب...</div>
            </div>
        );
    }

    return (
        <>
            {/* ✅ Modal التعديل */}
            {showUpdateModal && selectedStudentId && (
                <StudentAffairsUpdate
                    studentId={selectedStudentId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {/* باقي الكود زي ما هو بالظبط - بدون أي تغيير */}
            <div className="teacherMotivate" style={{ padding: "0 15%" }}>
                <div className="teacherMotivate__inner">
                    <div
                        className="userProfile__plan"
                        style={{ paddingBottom: "24px", padding: "0" }}
                    >
                        <div className="userProfile__planTitle">
                            <h1>
                                شؤون الطلاب{" "}
                                <span>{filteredStudentsCount} طالب</span>
                            </h1>
                        </div>

                        <div className="plan__header">
                            <div className="plan__ai-suggestion">
                                <i>
                                    <RiRobot2Fill />
                                </i>
                                يمكنك متابعة الحضور والمصروفات وطباعة البطاقات
                                بضغطة واحدة
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
                                        disabled={loading}
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
                                        disabled={loading}
                                    >
                                        <option>الكل</option>
                                        <option>نشط</option>
                                        <option>معلق</option>
                                    </select>
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو الهوية أو ولي الأمر..."
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

                        {/* باقي الجدول والـ stats زي ما هما بالظبط */}
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
                                    {students.map((item) => (
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
                                                    <div>
                                                        {item.guardianName}
                                                    </div>
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
                                            <td className="text-green-600 font-bold">
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
                                                    <button
                                                        className="teacherStudent__status-btn pay-btn p-2 rounded-full border-2 border-green-300 text-green-600 hover:bg-green-50 w-12 h-12 mr-1"
                                                        onClick={() =>
                                                            handleWhatsappReminder(
                                                                item.id,
                                                                item.guardianPhone.replace(
                                                                    /[^0-9]/g,
                                                                    "",
                                                                ),
                                                            )
                                                        }
                                                        title="تذكير واتساب بالمصروفات"
                                                    >
                                                        <PiWhatsappLogoDuotone />
                                                    </button>
                                                    {/* ✅ زر التعديل الجديد */}
                                                    <button
                                                        className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 w-12 h-12 mr-1"
                                                        onClick={() =>
                                                            handleEdit(item.id)
                                                        }
                                                        title="تعديل البيانات"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        className="teacherStudent__status-btn print-btn p-2 rounded-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 w-12 h-12"
                                                        onClick={() =>
                                                            handlePrintReport(
                                                                item.id,
                                                            )
                                                        }
                                                        title="طباعة بطاقة الطالب"
                                                    >
                                                        <GrDocumentText />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
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

                        {/* باقي الـ Stats والـ Progress Bars زي ما هي */}
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
                                        {stats.totalStudents || 0}
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
                                    <h3>الطلاب النشطين</h3>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {stats.activeStudents || 0}
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
                                    <h3>الطلاب المعلقين</h3>
                                    <p className="text-2xl font-bold text-red-600">
                                        {stats.pendingStudents || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="inputs__verifyOTPBirth">
                            <div className="userProfile__progressContent">
                                <div className="userProfile__progressTitle">
                                    <h1>نسبة النشاط</h1>
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
                                    <h1>الطلاب النشطين</h1>
                                </div>
                                <p>
                                    {stats.activeStudents}/{stats.totalStudents}
                                </p>
                                <div className="userProfile__progressBar">
                                    <span
                                        style={{
                                            width: stats.totalStudents
                                                ? `${(stats.activeStudents / stats.totalStudents) * 100}%`
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

export default StudentAffairs;
