import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { useMeetings, MeetingType } from "./hooks/useMeetings";
import CreateMeetingModal from "./models/CreateMeetingModal";
import UpdateMeetingModal from "./models/UpdateMeetingModal";
import DeleteModal from "./components/DeleteModal";

const MeetingsManagement: React.FC = () => {
    const {
        meetings = [],
        loading,
        pagination,
        currentPage,
        searchMeetings,
        goToPage,
        refetch,
        deleteMeeting,
        generateMeetingCode,
    } = useMeetings();

    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<MeetingType | null>(
        null,
    );

    // ✅ Delete Modal State مع loading
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteMeetingId, setDeleteMeetingId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            searchMeetings(value);
        },
        [searchMeetings],
    );

    // ✅ handleDeleteConfirm محدث للـ DeleteModal الجديد
    const handleDeleteConfirm = async () => {
        if (!deleteMeetingId) return;

        setDeleteLoading(true);
        try {
            const success = await deleteMeeting(deleteMeetingId);
            if (success) {
                setShowDeleteModal(false);
                setDeleteMeetingId(null);
                refetch();
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDelete = useCallback((id: number) => {
        setDeleteMeetingId(id);
        setShowDeleteModal(true);
    }, []);

    const handleEdit = useCallback((meeting: MeetingType) => {
        setSelectedMeeting(meeting);
        setShowUpdateModal(true);
    }, []);

    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedMeeting(null);
    }, []);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleAddNew = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleGenerateCode = useCallback(
        (teacherId: number, studentId: number) => {
            return generateMeetingCode(teacherId, studentId);
        },
        [generateMeetingCode],
    );

    const stats = useMemo(
        () => ({
            total: pagination?.total || 0,
            active: meetings.filter(
                (m) => !m.teacher_joined || !m.student_joined,
            ).length,
            teacherJoined: meetings.filter((m) => m.teacher_joined).length,
            currentPage,
            totalPages: pagination?.last_page || 1,
        }),
        [
            pagination?.total,
            meetings.length,
            currentPage,
            pagination?.last_page,
            meetings,
        ],
    );

    const formatTime = useCallback((time: string) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }, []);

    const renderTeacherAvatar = useCallback((name: string) => {
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

    const renderStudentAvatar = useCallback((name: string) => {
        const initials = name
            .split(" ")
            .slice(-2)
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
        return (
            <div className="w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-xs font-bold text-white rounded-lg">
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
                    <p className="text-gray-600">جاري تحميل الميتينجز...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ✅ DeleteModal الجديد */}
            <DeleteModal
                show={showDeleteModal}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذا الميتينج؟ هذا الإجراء لا يمكن التراجع عنه."
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteMeetingId(null);
                    setDeleteLoading(false);
                }}
                onConfirm={handleDeleteConfirm}
                confirmText="حذف الميتينج"
                cancelText="إلغاء"
                loading={deleteLoading}
            />

            {/* Create Modal */}
            {showCreateModal && (
                <CreateMeetingModal
                    onClose={handleCloseCreateModal}
                    onSuccess={refetch}
                    generateCode={handleGenerateCode}
                />
            )}

            {/* Update Modal */}
            {showUpdateModal && selectedMeeting && (
                <UpdateMeetingModal
                    meeting={selectedMeeting}
                    onClose={handleCloseUpdateModal}
                    onSuccess={refetch}
                    generateCode={handleGenerateCode}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/* Stats Cards */}
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon purpleColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي الميتينجز</h3>
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
                            <h3>قيد الانتظار</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.active}
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
                            <h3>انضم المعلم</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.teacherJoined}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            كل ميتينج له رابط فريد بين المعلم والطالب
                        </div>
                        <div className="plan__current">
                            <h2>الميتينجز بين المعلم والطالب</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالمعلم أو الطالب..."
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
                                    ميتينج جديد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="plan__daily-table">
                    <table>
                        <thead>
                            <tr>
                                <th>المعلم</th>
                                <th>الطالب</th>
                                <th>المجمع</th>
                                <th>التاريخ</th>
                                <th>الوقت</th>
                                <th>رابط الميتينج</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meetings.length === 0 && !loading ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        لا يوجد ميتينجز حالياً
                                    </td>
                                </tr>
                            ) : (
                                meetings.map((meeting) => (
                                    <tr
                                        key={meeting.id}
                                        className="plan__row active"
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                {renderTeacherAvatar(
                                                    meeting.teacher.name,
                                                )}
                                            </div>
                                        </td>
                                        <td>{meeting.student.name}</td>
                                        <td>{meeting.center.name}</td>
                                        <td>
                                            {new Date(
                                                meeting.meeting_date,
                                            ).toLocaleDateString("ar-EG")}
                                        </td>
                                        <td>
                                            {formatTime(
                                                meeting.meeting_start_time,
                                            )}
                                            {meeting.meeting_end_time &&
                                                ` - ${formatTime(meeting.meeting_end_time)}`}
                                        </td>
                                        <td>
                                            <a
                                                href={meeting.jitsi_meeting_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm truncate max-w-[200px] block"
                                                title={meeting.meeting_code}
                                            >
                                                {meeting.meeting_code}
                                            </a>
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${
                                                        meeting.teacher_joined
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {meeting.teacher_joined
                                                        ? "معلم"
                                                        : "انتظار"}
                                                </span>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${
                                                        meeting.student_joined
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                                >
                                                    {meeting.student_joined
                                                        ? "طالب"
                                                        : "انتظار"}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleEdit(meeting)
                                                    }
                                                    disabled={loading}
                                                    title="تعديل الميتينج"
                                                >
                                                    <FiEdit3 />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleDelete(meeting.id)
                                                    }
                                                    disabled={loading}
                                                    title="حذف الميتينج"
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

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div
                        className="inputs__verifyOTPBirth"
                        style={{ width: "100%" }}
                    >
                        <div className="flex justify-between items-center p-4">
                            <div className="text-sm text-gray-600">
                                عرض {meetings.length} من {pagination.total}{" "}
                                ميتينج • الصفحة <strong>{currentPage}</strong>{" "}
                                من <strong>{pagination.last_page}</strong>
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
            </div>
        </>
    );
};

export default MeetingsManagement;
