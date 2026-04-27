// StudentTransferManagement.tsx
import { useState, useCallback } from "react";
import { useToast } from "../../../../../contexts/ToastContext";
import { FiEdit3 } from "react-icons/fi";
import { useStudentTransfers, BookingType } from "./hooks/useStudentTransfers";
import TransferStudentModal from "./models/TransferStudentModal";

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

    const { notifySuccess, notifyError } = useToast();

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
        notifySuccess("تم نقل الطالب بنجاح! ✨");
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
            <div
                className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold text-white rounded-lg"
                style={{ minWidth: 48, minHeight: 48 }}
            >
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
                    <p className="text-gray-600">جاري التحميل...</p>
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

            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">نقل الطلاب بين الخطط</div>
                        <div className="flx">
                            <div className="flex-1 relative">
                                <input
                                    className="fi"
                                    placeholder="البحث بالطالب أو الخطة..."
                                    value={search}
                                    onChange={handleSearch}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* الإحصائيات */}

                    <div style={{ overflowX: "auto" }}>
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
                                {transfers.length === 0 ? (
                                    <tr>
                                        <td colSpan={10}>
                                            <div className="empty text-center py-8 text-gray-500">
                                                لا يوجد حجوزات مؤكدة للنقل
                                                حالياً
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transfers.map((item) => (
                                        <tr key={item.id}>
                                            <td
                                                className="teacherStudent__img"
                                                style={{ width: 60 }}
                                            >
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
                                            <td>
                                                {item.current_sessions_count}
                                            </td>
                                            <td>
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bp bxs"
                                                        onClick={() =>
                                                            handleTransferClick(
                                                                item.id,
                                                            )
                                                        }
                                                        disabled={loading}
                                                    >
                                                        نقل
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div
                            className="inputs__verifyOTPBirth"
                            style={{
                                marginTop: 12,
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 8,
                                fontSize: 12,
                            }}
                        >
                            <div className="text-gray-600">
                                عرض {transfers.length} من {pagination.total} حجز
                                • الصفحة <strong>{currentPage}</strong> من{" "}
                                <strong>{pagination.last_page}</strong>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 6,
                                }}
                            >
                                <button
                                    className="btn bs bxs"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={!hasPrev || loading}
                                >
                                    السابق
                                </button>
                                <span
                                    className="btn bp bxs"
                                    style={{
                                        padding: "4px 12px",
                                        fontWeight: 700,
                                    }}
                                >
                                    {currentPage}
                                </span>
                                <button
                                    className="btn bp bxs"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={!hasNext || loading}
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentTransferManagement;
