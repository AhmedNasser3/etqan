import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3 } from "react-icons/fi";
import { useStudentTransfers } from "./hooks/useStudentTransfers";
import TransferStudentModal from "./models/TransferStudentModal";

interface BookingType {
    id: number;
    student_name: string;
    student_phone: string;
    current_plan_name: string;
    current_plan_months: number;
    center_name: string;
    circle_name: string;
    schedule_date: string;
    time_range: string;
    current_sessions_count: number;
    status: string;
    transferred_at: string;
}

const StudentTransferManagement: React.FC = () => {
    const {
        transfers,
        loading,
        pagination,
        currentPage,
        searchTransfers,
        goToPage,
        refetch,
    } = useStudentTransfers();

    const [search, setSearch] = useState("");
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
        null,
    );

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            searchTransfers(value);
        },
        [searchTransfers],
    );

    const handleTransferClick = useCallback((bookingId: number) => {
        setSelectedBookingId(bookingId);
        setShowTransferModal(true);
    }, []);

    const handleCloseTransferModal = useCallback(() => {
        setShowTransferModal(false);
        setSelectedBookingId(null);
    }, []);

    const handleTransferSuccess = useCallback(() => {
        toast.success("تم نقل الطالب بنجاح! ✨");
        refetch();
        handleCloseTransferModal();
    }, [refetch, handleCloseTransferModal]);

    const stats = {
        total: pagination?.total || 0,
        currentPage,
        totalPages: pagination?.last_page || 1,
    };

    const renderStudentLogo = (name: string) => {
        const initials = name
            .split(" ")
            .slice(-2)
            .map((n) => n[0])
            .join("")
            .slice(0, 2);
        return (
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold text-white rounded-lg">
                {initials}
            </div>
        );
    };

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < (pagination?.last_page || 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            {showTransferModal && selectedBookingId && (
                <TransferStudentModal
                    bookingId={selectedBookingId}
                    onClose={handleCloseTransferModal}
                    onSuccess={handleTransferSuccess}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي الحجوزات المؤكدة</h3>
                            <p className="text-2xl font-bold text-red-600">
                                {stats.total}
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
                            <h3>جاهزة للنقل</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {transfers.length}
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
                            يمكنك نقل الطلاب بين الخطط والحلقات بسهولة
                        </div>
                        <div className="plan__current">
                            <h2>نقل الطلاب بين الخطط</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالطالب أو الخطة..."
                                        value={search}
                                        onChange={handleSearch}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>الشعار</th>
                                <th>اسم الطالب</th>
                                <th>الهاتف</th>
                                <th>الخطة الحالية</th>
                                <th>المجمع</th>
                                <th>الحلقة</th>
                                <th>التاريخ</th>
                                <th>الوقت</th>
                                <th>عدد الجلسات</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map((item) => (
                                <tr key={item.id} className="plan__row active">
                                    <td className="teacherStudent__img">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                                            {renderStudentLogo(
                                                item.student_name,
                                            )}
                                        </div>
                                    </td>
                                    <td>{item.student_name}</td>
                                    <td>{item.student_phone}</td>
                                    <td>
                                        {item.current_plan_name} (
                                        {item.current_plan_months} شهور)
                                    </td>
                                    <td>{item.center_name}</td>
                                    <td>{item.circle_name}</td>
                                    <td>{item.schedule_date}</td>
                                    <td>{item.time_range}</td>
                                    <td>{item.current_sessions_count}</td>
                                    <td>
                                        <div className="teacherStudent__btns">
                                            <button
                                                className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100"
                                                onClick={() =>
                                                    handleTransferClick(item.id)
                                                }
                                                disabled={loading}
                                                title="نقل الطالب لخطة أخرى"
                                            >
                                                <FiEdit3 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {transfers.length === 0 && !loading && (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        لا يوجد حجوزات مؤكدة للنقل حالياً
                                    </td>
                                </tr>
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
                                عرض {transfers.length} من {pagination.total} حجز
                                • الصفحة <strong>{currentPage}</strong> من{" "}
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
                                <span className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold">
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
            </div>
        </>
    );
};

export default StudentTransferManagement;
