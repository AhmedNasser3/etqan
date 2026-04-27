// StudentAffairsPlatform.tsx - نفس تصميم CentersManagement
import React, { useState, useCallback, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone, PiStudent } from "react-icons/pi";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useStudentAffairsPlatform } from "./hooks/useStudentAffairsPlatform";
import StudentAffairsUpdatePlatform from "./models/StudentAffairsUpdatePlatform";

const StudentAffairsPlatform: React.FC = () => {
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
    } = useStudentAffairsPlatform();

    // States للـ Modal
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        null,
    );

    // تفعيل الفلاترة
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch =
                !search ||
                student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.idNumber.toLowerCase().includes(search.toLowerCase()) ||
                student.guardianName
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                !filterStatus ||
                filterStatus === "الكل" ||
                filterStatus === "" ||
                student.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [students, search, filterStatus]);

    const filteredStudentsCount = filteredStudents.length;

    // إعادة تحميل البيانات عند تغيير الفلاتر
    useEffect(() => {
        // البيانات تتحدث تلقائياً من الـ hook
    }, [search, filterStatus]);

    const handleWhatsappReminder = async (id: number, phone: string) => {
        const success = await sendWhatsappReminder(id, phone);
        if (!success) {
            toast.error("فشل في فتح واتساب");
        }
    };

    const handlePrintReport = (id: number) => {
        printCard(id);
    };

    // فتح Modal التعديل
    const handleEdit = useCallback((studentId: number) => {
        setSelectedStudentId(studentId);
        setShowUpdateModal(true);
    }, []);

    // إغلاق Modal
    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedStudentId(null);
    }, []);

    // نجاح التعديل
    const handleUpdateSuccess = useCallback(() => {
        toast.success("تم تحديث بيانات الطالب بنجاح! ✨");
        handleCloseUpdateModal();
    }, [handleCloseUpdateModal]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "نشط":
                return "text-green-600 bg-green-100";
            case "متأخر مالياً":
                return "text-red-600 bg-red-100";
            case "معلق":
                return "text-yellow-600 bg-yellow-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const statsSummary = {
        total: students.length,
        active: students.filter((s) => s.status === "نشط").length,
        pending: students.filter((s) => s.status === "معلق").length,
    };

    return (
        <>
            {/* Modal التعديل للمنصة */}
            {showUpdateModal && selectedStudentId && (
                <StudentAffairsUpdatePlatform
                    studentId={selectedStudentId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {/* ✅ نفس التصميم: content / widget / wh / table */}
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">
                            إدارة بيانات الطلاب وأولياء الأمور - المنصة
                            <span className="filter-form text-sm text-gray-600 ml-2">
                                ({filteredStudentsCount})
                            </span>
                        </div>
                        <div className="flx">
                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                }}
                            >
                                <select
                                    value={filterStatus || ""}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="fi"
                                    style={{ minWidth: "120px" }}
                                >
                                    <option value="">الكل</option>
                                    <option value="نشط">نشط</option>
                                    <option value="معلق">معلق</option>
                                    <option value="متأخر مالياً">
                                        متأخر مالياً
                                    </option>
                                </select>
                                <input
                                    type="search"
                                    className="fi"
                                    placeholder="البحث بالاسم أو الهوية أو ولي الأمر..."
                                    value={search || ""}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>المجمع</th>
                                    <th>الصورة</th>
                                    <th>الاسم</th>
                                    <th>رقم الهوية</th>
                                    <th>ولي الأمر</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            جاري تحميل الطلاب...
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد بيانات طلاب لهذا الفلتر
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((item) => (
                                        <tr key={item.id}>
                                            {/* المجمع */}
                                            <td>
                                                <span className="font-semibold text-indigo-800">
                                                    {item.center_name}
                                                </span>
                                            </td>

                                            {/* الصورة */}
                                            <td>
                                                <div className="w-12 h-12 rounded-full overflow-hidden mx-auto">
                                                    <img
                                                        style={{
                                                            width: "36px",
                                                            borderRadius:
                                                                "100px",
                                                        }}
                                                        src={item.img}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                "/default-avatar.png";
                                                        }}
                                                    />
                                                </div>
                                            </td>

                                            {/* الاسم */}
                                            <td className="font-semibold">
                                                {item.name}
                                            </td>

                                            {/* رقم الهوية */}
                                            <td className="font-mono text-sm">
                                                {item.idNumber}
                                            </td>

                                            {/* ولي الأمر */}
                                            <td>
                                                <div className="text-sm">
                                                    <div>
                                                        {item.guardianName}
                                                    </div>
                                                    <a
                                                        href={`tel:${item.guardianPhone.replace(/\s+/g, "")}`}
                                                        className="flex items-center gap-1 text-green-600 hover:underline text-xs mt-1"
                                                    >
                                                        <PiWhatsappLogoDuotone
                                                            size={14}
                                                        />
                                                        {item.guardianPhone}
                                                    </a>
                                                </div>
                                            </td>

                                            {/* الحالة */}
                                            <td>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                                        item.status,
                                                    )}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            {/* الإجراءات */}
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bs bxs"
                                                        onClick={() =>
                                                            handleEdit(item.id)
                                                        }
                                                        title="تعديل بيانات الطالب"
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    "هل أنت متأكد من حذف هذا الطالب؟",
                                                                )
                                                            ) {
                                                                toast.error(
                                                                    "عذراً، خاصية الحذف غير متاحة حالياً",
                                                                );
                                                            }
                                                        }}
                                                        title="حذف الطالب"
                                                    >
                                                        حذف
                                                    </button>
                                                    <button
                                                        className="btn bp bxs"
                                                        onClick={() =>
                                                            handleWhatsappReminder(
                                                                item.id,
                                                                item.guardianPhone,
                                                            )
                                                        }
                                                        title="إرسال تذكير واتساب"
                                                    >
                                                        واتساب
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentAffairsPlatform;
