// SchedulesManagement.tsx
import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2, FiLink2 } from "react-icons/fi";
import { IoMdAdd, IoMdCopy } from "react-icons/io";
import { usePlanSchedules, ScheduleType } from "./hooks/usePlanSchedules";
import CreateSchedulePage from "./models/CreateSchedulePage";
import UpdateSchedulePage from "./models/UpdateSchedulePage";

const SchedulesManagement: React.FC = () => {
    const {
        schedules = [],
        loading = false,
        pagination,
        currentPage,
        searchSchedules,
        goToPage,
        refetch,
    } = usePlanSchedules();

    const [search, setSearch] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
        null,
    );

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            searchSchedules(value);
        },
        [searchSchedules],
    );

    const handleEdit = useCallback((schedule: ScheduleType) => {
        setSelectedScheduleId(schedule.id);
        setShowUpdateModal(true);
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا الموعد؟")) return;

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(`/api/v1/plans/schedules/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            if (response.ok) {
                toast.success("تم حذف الموعد بنجاح ");
                refetch();
            } else {
                const result = await response.json();
                toast.error(result.message || "فشل في الحذف");
            }
        } catch {
            toast.error("حدث خطأ في الحذف");
        }
    };

    const handleCopyJitsiUrl = useCallback((url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("تم نسخ رابط الغرفة! 📋");
    }, []);

    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedScheduleId(null);
    }, []);

    const handleUpdateSuccess = useCallback(() => {
        toast.success("تم تحديث الموعد بنجاح! ✨");
        refetch();
        handleCloseUpdateModal();
    }, [refetch, handleCloseUpdateModal]);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleCreateSuccess = useCallback(() => {
        toast.success("تم إضافة الموعد بنجاح! 🎉");
        refetch();
        handleCloseCreateModal();
    }, [refetch, handleCloseCreateModal]);

    const handleAddNew = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const stats = useMemo(
        () => ({
            total: pagination?.total || 0,
            available: schedules.filter((s) => s.is_available).length,
            currentPage,
            totalPages: pagination?.last_page || 1,
        }),
        [
            pagination?.total,
            schedules.length,
            currentPage,
            pagination?.last_page,
        ],
    );

    const getTeacherName = useCallback((schedule: ScheduleType) => {
        return schedule.teacher?.name || "غير محدد";
    }, []);

    const getCircleName = useCallback((schedule: ScheduleType) => {
        return schedule.circle?.name || "غير محدد";
    }, []);

    const getAvailabilityStatus = useCallback((schedule: ScheduleType) => {
        if (!schedule.is_available) return "غير متاح";
        if (schedule.max_students === null) return "مفتوح";
        const remaining =
            (schedule.max_students || 0) - schedule.booked_students;
        return `${remaining}/${schedule.max_students}`;
    }, []);

    const renderLogo = useCallback((name: string) => {
        const initials = name
            .split(" ")
            .slice(-2)
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
        return (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white rounded-lg">
                {initials}
            </div>
        );
    }, []);

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < (pagination?.last_page || 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">جاري تحميل المواعيد...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {showUpdateModal && selectedScheduleId && (
                <UpdateSchedulePage
                    scheduleId={selectedScheduleId}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showCreateModal && (
                <CreateSchedulePage
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon purpleColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي المواعيد</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blueColor">
                            <i>
                                <GrStatusCritical />
                            </i>
                        </div>
                        <div>
                            <h3>متاحة حالياً</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.available}
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
                            <h3>محجوزة</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.total - stats.available}
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
                            مواعيد الحلقات للخطط الخاصة بمجمعك
                        </div>
                        <div className="plan__current">
                            <h2>جدول المواعيد</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالخطة أو الحلقة..."
                                        value={search}
                                        onChange={handleSearch}
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    className="teacherStudent__status-btn add-btn p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium ml-3"
                                    onClick={handleAddNew}
                                    disabled={loading}
                                >
                                    <IoMdAdd
                                        size={20}
                                        className="inline mr-2"
                                    />
                                    موعد جديد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>الشعار</th>
                                <th>الخطة</th>
                                <th>الحلقة</th>
                                <th>المدرس</th>
                                <th>التاريخ</th>
                                <th>الوقت</th>
                                <th>المدة</th>
                                <th>الحالة</th>
                                <th>رابط الغرفة</th> {/* ✅ عمود جديد */}
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.length === 0 && !loading ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        لا يوجد مواعيد حالياً
                                    </td>
                                </tr>
                            ) : (
                                schedules.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="plan__row active"
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                {renderLogo(item.circle.name)}
                                            </div>
                                        </td>
                                        <td>{item.plan.plan_name}</td>
                                        <td>{getCircleName(item)}</td>
                                        <td>{getTeacherName(item)}</td>
                                        <td>
                                            {new Date(
                                                item.schedule_date,
                                            ).toLocaleDateString("ar-EG")}
                                        </td>
                                        <td>
                                            {item.start_time} - {item.end_time}
                                        </td>
                                        <td>{item.duration_minutes} د</td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    item.is_available
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {getAvailabilityStatus(item)}
                                            </span>
                                        </td>
                                        <td>
                                            {/* ✅ عمود رابط Jitsi الجديد */}
                                            <div className="flex items-center gap-1">
                                                <a
                                                    href={item.jitsi_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium underline truncate max-w-[120px]"
                                                    title={item.jitsi_url}
                                                >
                                                    غرفة {item.jitsi_room_name}
                                                </a>
                                                <button
                                                    onClick={() =>
                                                        handleCopyJitsiUrl(
                                                            item.jitsi_url,
                                                        )
                                                    }
                                                    className="p-1 hover:bg-gray-100 rounded-full transition-all"
                                                    title="نسخ الرابط"
                                                >
                                                    <IoMdCopy size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                    disabled={loading}
                                                    title="تعديل الموعد"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    disabled={loading}
                                                    title="حذف الموعد"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.last_page > 1 && (
                    <div
                        className="inputs__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        <div className="flex justify-between items-center p-4">
                            <div className="text-sm text-gray-600">
                                عرض {schedules.length} من {pagination.total}
                                موعد • الصفحة <strong>{currentPage}</strong> من
                                <strong>{pagination.last_page}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={!hasPrev || loading}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                >
                                    السابق
                                </button>
                                <span className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold">
                                    {currentPage}
                                </span>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasNext || loading}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className="inputs__verifyOTPBirth"
                    style={{ width: "100%" }}
                >
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>معدل الإشغال</h1>
                        </div>
                        <p>
                            {Math.round(
                                (1 -
                                    stats.available /
                                        Math.max(stats.total, 1)) *
                                    100,
                            )}
                            %
                        </p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{
                                    width: `${Math.min(
                                        (1 -
                                            stats.available /
                                                Math.max(stats.total, 1)) *
                                            100,
                                        100,
                                    )}%`,
                                }}
                            ></span>
                        </div>
                    </div>
                    <div className="userProfile__progressContent">
                        <div className="userProfile__progressTitle">
                            <h1>عدد المواعيد</h1>
                        </div>
                        <p>{schedules.length}</p>
                        <div className="userProfile__progressBar">
                            <span
                                style={{
                                    width: `${Math.min((schedules.length / 50) * 100, 100)}%`,
                                }}
                            ></span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SchedulesManagement;
