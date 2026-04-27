// StudentBookingsManagement.tsx - مصحح مع نفس ديزاين StaffApproval + موحد 100%
import React, { useState, useCallback, useMemo } from "react";
import { ICO } from "../../icons";
import { useToast } from "../../.../../../../../contexts/ToastContext";
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

    const { notifySuccess, notifyError } = useToast();
    const [search, setSearch] = useState("");

    // البحث
    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            searchBookings(value);
        },
        [searchBookings],
    );

    // قبول الطالب
    const handleConfirm = async (booking: StudentBookingType) => {
        if (!booking.can_confirm) {
            notifyError("عدد الطلاب مكتمل في هذه الحلقة");
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
                notifySuccess(result.message);
                refetch();
            } else {
                notifyError(result.message || "فشل في قبول الطالب");
            }
        } catch (error: any) {
            notifyError(error.message || "حدث خطأ في قبول الطالب");
        }
    };

    // الإحصائيات
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

    // شعار الطالب من الحروف الأولى
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

    // حالة السعة
    const getCapacityStatus = useCallback((booking: StudentBookingType) => {
        if (booking.remaining_slots === null) return "غير محدود";
        return `${booking.remaining_slots} متاح`;
    }, []);

    return (
        <div className="content" id="contentArea">
            <div className="widget">
                <div className="wh">
                    <div className="wh-l">
                        إدارة طلبات الطلاب ({bookings.length} طلب)
                    </div>
                    <div className="flx">
                        <input
                            className="fi"
                            placeholder="البحث بالطالب أو الخطة..."
                            value={search}
                            onChange={handleSearch}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
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
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={11}>
                                        <div className="empty">
                                            <p>
                                                لا يوجد طلبات قيد الانتظار
                                                حالياً
                                            </p>
                                            <small>
                                                سيتم عرض طلبات الطلاب الجديدة
                                                هنا تلقائياً
                                            </small>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        {/* شعار الطالب */}
                                        <td>
                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                {renderStudentLogo(
                                                    booking.student_name,
                                                )}
                                            </div>
                                        </td>

                                        {/* بيانات الطالب */}
                                        <td style={{ fontWeight: 600 }}>
                                            {booking.student_name}
                                        </td>
                                        <td
                                            style={{
                                                fontSize: "13px",
                                                color: "var(--n600)",
                                            }}
                                        >
                                            {booking.student_phone}
                                        </td>

                                        {/* الخطة */}
                                        <td>
                                            <div style={{ fontSize: "13px" }}>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        marginBottom: "2px",
                                                    }}
                                                >
                                                    {booking.plan_name}
                                                </div>
                                                <div
                                                    style={{
                                                        color: "var(--n500)",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    ({booking.plan_months} شهر)
                                                </div>
                                            </div>
                                        </td>

                                        {/* الحلقة والمدرس */}
                                        <td style={{ fontWeight: 500 }}>
                                            {booking.circle_name}
                                        </td>
                                        <td
                                            style={{
                                                fontSize: "13px",
                                                color: "var(--n600)",
                                            }}
                                        >
                                            {booking.teacher_name}
                                        </td>

                                        {/* التاريخ والوقت */}
                                        <td style={{ fontSize: "13px" }}>
                                            {new Date(
                                                booking.schedule_date,
                                            ).toLocaleDateString("ar-EG")}
                                        </td>
                                        <td style={{ fontSize: "12px" }}>
                                            <span
                                                style={{
                                                    padding: "4px 12px",
                                                    background: "#eff6ff",
                                                    color: "#1e40af",
                                                    borderRadius: "20px",
                                                    fontSize: "11px",
                                                    fontWeight: 500,
                                                    border: "1px solid #dbeafe",
                                                }}
                                            >
                                                {(() => {
                                                    const times =
                                                        booking.time_range
                                                            .split(" - ")
                                                            .map((t) => {
                                                                const [, time] =
                                                                    t.split(
                                                                        " ",
                                                                    );
                                                                const [h, m] =
                                                                    time.split(
                                                                        ":",
                                                                    );
                                                                const hour12 =
                                                                    parseInt(
                                                                        h,
                                                                    ) % 12 ||
                                                                    12;
                                                                return `${hour12}:${m.padStart(2, "0")} ${parseInt(h) >= 12 ? "م" : "ص"}`;
                                                            });
                                                    return times.join(" - ");
                                                })()}
                                            </span>
                                        </td>

                                        {/* حالة السعة */}
                                        <td>
                                            <span
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "20px",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    border: "1px solid",
                                                    background:
                                                        booking.can_confirm
                                                            ? "#dcfce7"
                                                            : "#fee2e2",
                                                    color: booking.can_confirm
                                                        ? "#166534"
                                                        : "#991b1b",
                                                    borderColor:
                                                        booking.can_confirm
                                                            ? "#bbf7d0"
                                                            : "#fecaca",
                                                }}
                                            >
                                                {getCapacityStatus(booking)}
                                            </span>
                                        </td>

                                        {/* تاريخ الطلب */}
                                        <td
                                            style={{
                                                fontSize: "12px",
                                                color: "var(--n500)",
                                            }}
                                        >
                                            {new Date(
                                                booking.booked_at,
                                            ).toLocaleDateString("ar-EG")}
                                        </td>

                                        {/* زر القبول */}
                                        <td>
                                            <button
                                                className={`btn bxs w-full ${
                                                    booking.can_confirm
                                                        ? "bp green"
                                                        : "bd gray loading"
                                                }`}
                                                onClick={() =>
                                                    handleConfirm(booking)
                                                }
                                                disabled={
                                                    !booking.can_confirm ||
                                                    loading
                                                }
                                                style={{
                                                    minHeight: "40px",
                                                    fontSize: "13px",
                                                }}
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

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="pagination">
                        <div className="flex justify-between items-center p-4 bg-n100 rounded-lg mt-4">
                            <div
                                className="text-sm"
                                style={{ color: "var(--n600)" }}
                            >
                                عرض <strong>{bookings.length}</strong> من{" "}
                                <strong>{pagination.total}</strong> طلب • الصفحة{" "}
                                <strong>{currentPage}</strong> من{" "}
                                <strong>{pagination.last_page}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="btn bs"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={!hasPrev || loading}
                                >
                                    السابق
                                </button>
                                <span className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold min-w-[50px] text-center">
                                    {currentPage}
                                </span>
                                <button
                                    className="btn bs"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasNext || loading}
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentBookingsManagement;
