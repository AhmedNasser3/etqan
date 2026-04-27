// TeachersAffairsPlatform.tsx - نفس تصميم جدول CentersManagement & StudentAffairsPlatform
import React, { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone, PiUserCircle } from "react-icons/pi";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
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

    // States للـ Modal
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
        null,
    );

    // فلترة المعلمين
    const filteredTeachers = useMemo(() => {
        return teachers.filter((teacher) => {
            const matchesSearch =
                !search ||
                teacher.name.toLowerCase().includes(search.toLowerCase()) ||
                teacher.phone_formatted
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                teacher.email.toLowerCase().includes(search.toLowerCase());

            const matchesRole =
                !filterRole ||
                filterRole === "الكل" ||
                teacher.role === filterRole;

            const matchesStatus =
                !filterStatus ||
                filterStatus === "الكل" ||
                teacher.status === filterStatus;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [teachers, search, filterRole, filterStatus]);

    const filteredTeachersCount = filteredTeachers.length;

    const handleWhatsappReminder = async (id: number, phone: string) => {
        const success = await sendWhatsappReminder(id, phone);
        if (!success) {
            toast.error("فشل في فتح واتساب");
        }
    };

    const handlePrintCard = (id: number) => {
        printCard(id);
    };

    // فتح Modal التعديل
    const handleEdit = useCallback((teacherId: number) => {
        setSelectedTeacherId(teacherId);
        setShowUpdateModal(true);
    }, []);

    // إغلاق Modal
    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedTeacherId(null);
    }, []);

    // نجاح التعديل
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

    return (
        <>
            {/* Modal التعديل للمنصة */}
            {showUpdateModal && selectedTeacherId && (
                <TeachersAffairsUpdatePlatform
                    teacherId={selectedTeacherId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {/* ✅ نفس التصميم: content / widget / wh / table */}
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">
                            شؤون المعلمين - المنصة الكاملة
                            <span className="filter-form text-sm text-gray-600 ml-2">
                                ({filteredTeachersCount})
                            </span>
                        </div>
                        <div className="flx">
                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                    minWidth: "400px",
                                }}
                            >
                                <select
                                    value={filterRole}
                                    onChange={(e) =>
                                        setFilterRole(e.target.value)
                                    }
                                    className="fi"
                                    style={{ minWidth: "120px" }}
                                >
                                    <option value="">الكل</option>
                                    <option value="مدير">مدير</option>
                                    <option value="معلم">معلم</option>
                                    <option value="مشرف">مشرف</option>
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                    className="fi"
                                    style={{ minWidth: "120px" }}
                                >
                                    <option value="">الكل</option>
                                    <option value="نشط">نشط</option>
                                    <option value="معلق">معلق</option>
                                </select>
                                <input
                                    type="search"
                                    className="fi"
                                    placeholder="البحث بالاسم أو الهاتف أو الإيميل..."
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
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            جاري تحميل المعلمين...
                                        </td>
                                    </tr>
                                ) : filteredTeachers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد بيانات معلمين لهذا الفلتر
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeachers.map((item) => (
                                        <tr key={item.id}>
                                            {/* المجمع */}
                                            <td>
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
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

                                            {/* رقم المعلم */}
                                            <td>
                                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                    #{item.teacherId}
                                                </span>
                                            </td>

                                            {/* العمر */}
                                            <td className="text-sm">
                                                {item.age}
                                            </td>

                                            {/* الوظيفة */}
                                            <td>
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                                    {item.role}
                                                </span>
                                            </td>

                                            {/* الهاتف */}
                                            <td>
                                                <div className="text-sm">
                                                    <div>
                                                        {item.phone_formatted}
                                                    </div>
                                                    <a
                                                        href={`mailto:${item.email}`}
                                                        className="text-blue-600 text-xs hover:underline block mt-1"
                                                    >
                                                        {item.email}
                                                    </a>
                                                </div>
                                            </td>

                                            {/* الحضور */}
                                            <td>
                                                <span className="text-green-600 font-bold text-sm">
                                                    {item.attendanceRate}%
                                                </span>
                                            </td>

                                            {/* الراتب */}
                                            <td>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-bold ${getSalaryStatusColor(
                                                        item.salaryStatus,
                                                    )}`}
                                                >
                                                    {item.salaryStatus}
                                                </span>
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
                                                        title="تعديل بيانات المعلم"
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    "هل أنت متأكد من حذف هذا المعلم؟",
                                                                )
                                                            ) {
                                                                toast.error(
                                                                    "عذراً، خاصية الحذف غير متاحة حالياً",
                                                                );
                                                            }
                                                        }}
                                                        title="حذف المعلم"
                                                    >
                                                        حذف
                                                    </button>
                                                    <button
                                                        className="btn bp bxs"
                                                        onClick={() =>
                                                            handleWhatsappReminder(
                                                                item.id,
                                                                item.phone_formatted,
                                                            )
                                                        }
                                                        title="إرسال تذكير واتساب"
                                                    >
                                                        واتساب
                                                    </button>
                                                    <button
                                                        className="btn bg bxs"
                                                        onClick={() =>
                                                            handlePrintCard(
                                                                item.id,
                                                            )
                                                        }
                                                        title="طباعة البطاقة"
                                                    >
                                                        طباعة
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

export default TeachersAffairsPlatform;
