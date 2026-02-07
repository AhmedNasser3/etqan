import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood } from "react-icons/gr";
import {
    useStudentBookings,
    StudentBookingType,
} from "./hooks/useStudentBookings";

const StudentBookingsManagement: React.FC = () => {
    const {
        bookings = [],
        loading,
        pagination,
        currentPage,
        searchBookings,
        goToPage,
        confirmBooking,
        refetch,
    } = useStudentBookings();

    const [search, setSearch] = useState("");

    // ✅ البحث
    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            searchBookings(value);
        },
        [searchBookings],
    );

    // ✅ قبول الطالب
    const handleConfirm = async (booking: StudentBookingType) => {
        if (!booking.can_confirm) {
            toast.error("عدد الطلاب مكتمل في هذه الحلقة");
            return;
        }

        const studentName = booking.student_name;
        const planName = booking.plan_name;

        if (
            !confirm(
                `هل تريد قبول الطالب "${studentName}" في الخطة "${planName}"؟`,
            )
        ) {
            return;
        }

        try {
            const result = await confirmBooking(booking.id);
            if (result.success) {
                toast.success(result.message);
                refetch();
            } else {
                toast.error(result.message || "فشل في قبول الطالب");
            }
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ في قبول الطالب");
        }
    };

    // ✅ الإحصائيات
    const stats = useMemo(
        () => ({
            total: pagination?.total || 0,
            pending: bookings.length,
            currentPage,
            totalPages: pagination?.last_page || 1,
        }),
        [pagination, bookings.length, currentPage],
    );

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < (pagination?.last_page || 1);

    // ✅ شعار الطالب من الحروف الأولى
    const renderStudentLogo = useCallback((name: string) => {
        const initials = name
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
        return (
            <div className="w-full h-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white rounded-lg shadow-sm">
                {initials}
            </div>
        );
    }, []);

    // ✅ حالة السعة
    const getCapacityStatus = useCallback((booking: StudentBookingType) => {
        if (booking.remaining_slots === null) return "غير محدود";
        return `${booking.remaining_slots} متاح`;
    }, []);

    if (loading && bookings.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg">
                        جاري تحميل طلبات الطلاب...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/* ✅ الإحصائيات */}
                <div className="plan__stats mb-8">
                    <div className="stat-card">
                        <div className="stat-icon purpleColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>طلبات قيد الانتظار</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blueColor">
                            <i className="ri-time-line"></i>
                        </div>
                        <div>
                            <h3>في الصفحة الحالية</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.pending}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ✅ الهيدر */}
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            طلبات الطلاب للانضمام للخطط والحلقات • قيد الانتظار
                            فقط
                        </div>
                        <div className="plan__current">
                            <h2>إدارة طلبات الطلاب</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالطالب أو الخطة..."
                                        value={search}
                                        onChange={handleSearch}
                                        disabled={loading}
                                        className="w-full max-w-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ الجدول */}
                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>الشعار</th>
                                <th>الطالب</th>
                                <th>الهاتف</th>
                                <th>الخطة</th>
                                <th>الحلقة</th>
                                <th>المدرس</th>
                                <th>التاريخ</th>
                                <th>الوقت</th>
                                <th>السعة</th>
                                <th>تاريخ الطلب</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 && !loading ? (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="text-center py-12 text-gray-500"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <i className="ri-inbox-line text-2xl text-gray-400"></i>
                                            </div>
                                            <p className="text-lg">
                                                لا يوجد طلبات قيد الانتظار
                                                حالياً
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                سيتم عرض طلبات الطلاب الجديدة
                                                هنا تلقائياً
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="plan__row active hover:bg-gray-50 transition-colors"
                                    >
                                        {/* ✅ شعار الطالب */}
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                {renderStudentLogo(
                                                    booking.student_name,
                                                )}
                                            </div>
                                        </td>

                                        {/* ✅ بيانات الطالب */}
                                        <td className="font-medium">
                                            {booking.student_name}
                                        </td>
                                        <td className="text-gray-600">
                                            {booking.student_phone}
                                        </td>

                                        {/* ✅ الخطة */}
                                        <td>
                                            <div>
                                                <div className="font-semibold text-sm">
                                                    {booking.plan_name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ({booking.plan_months} شهر)
                                                </div>
                                            </div>
                                        </td>

                                        {/* ✅ الحلقة والمدرس */}
                                        <td className="font-medium">
                                            {booking.circle_name}
                                        </td>
                                        <td className="text-gray-600">
                                            {booking.teacher_name}
                                        </td>

                                        {/* ✅ التاريخ والوقت */}
                                        <td className="text-sm">
                                            {new Date(
                                                booking.schedule_date,
                                            ).toLocaleDateString("ar-EG")}
                                        </td>
                                        <td className="text-sm font-mono">
                                            {booking.time_range}
                                        </td>

                                        {/* ✅ حالة السعة */}
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    booking.can_confirm
                                                        ? "bg-green-100 text-green-800 border border-green-200"
                                                        : "bg-red-100 text-red-800 border border-red-200"
                                                }`}
                                            >
                                                {getCapacityStatus(booking)}
                                            </span>
                                        </td>

                                        {/* ✅ تاريخ الطلب */}
                                        <td className="text-sm text-gray-500">
                                            {new Date(
                                                booking.booked_at,
                                            ).toLocaleDateString("ar-EG")}
                                        </td>

                                        {/* ✅ زر القبول */}
                                        <td>
                                            <button
                                                className={`teacherStudent__status-btn p-3 rounded-xl border-2 font-semibold transition-all w-full max-w-[140px] ${
                                                    booking.can_confirm
                                                        ? "bg-green-50 border-green-400 text-green-700 hover:bg-green-100 hover:border-green-500 hover:shadow-md shadow-sm"
                                                        : "bg-gray-50 border-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                                                }`}
                                                onClick={() =>
                                                    handleConfirm(booking)
                                                }
                                                disabled={
                                                    !booking.can_confirm ||
                                                    loading
                                                }
                                                title={
                                                    booking.can_confirm
                                                        ? "قبول الطالب في الخطة"
                                                        : "العدد مكتمل - لا يمكن القبول"
                                                }
                                            >
                                                {booking.can_confirm
                                                    ? "قبول الطالب"
                                                    : "العدد مكتمل"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ✅ Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div
                        className="inputs__verifyOTPBirth"
                        style={{ width: "100%", marginTop: "2rem" }}
                    >
                        <div className="flex justify-between items-center p-6 bg-gray-50 rounded-xl">
                            <div className="text-sm text-gray-600">
                                عرض <strong>{bookings.length}</strong> من{" "}
                                <strong>{pagination.total}</strong> طلب • الصفحة{" "}
                                <strong>{currentPage}</strong> من{" "}
                                <strong>{pagination.last_page}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={!hasPrev || loading}
                                    className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    السابق
                                </button>
                                <span className="px-6 py-2 bg-purple-500 text-white rounded-lg font-bold min-w-[50px] text-center">
                                    {currentPage}
                                </span>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasNext || loading}
                                    className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ Progress Bars */}
                {bookings.length > 0 && (
                    <div
                        className="inputs__verifyOTPBirth mt-8"
                        style={{ width: "100%" }}
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h3>معدل الطلبات المعالجة</h3>
                            </div>
                            <p>0% (جميع الطلبات قيد الانتظار)</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "0%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h3>عدد الطلبات</h3>
                            </div>
                            <p>{stats.total}</p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${Math.min((stats.total / 100) * 100, 100)}%`,
                                    }}
                                ></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default StudentBookingsManagement;
