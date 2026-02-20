import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { RiMessage2Line } from "react-icons/ri";
import { FiXCircle } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoMdLink } from "react-icons/io";
import PayrollModel from "./modals/PayrollModel";
import { useTeachers } from "./hooks/useTeachers";

const StaffApproval: React.FC = () => {
    const {
        teachers: staffs = [],
        loading: isLoading,
        error,
        fetchPendingTeachers,
        approveTeacher,
        rejectTeacher,
    } = useTeachers({ status: "pending" });

    const [search, setSearch] = useState("");
    const [showPayrollModal, setShowPayrollModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);

    // ✅ Per-staff loading بدون global loading
    const [approvingIds, setApprovingIds] = useState<Set<number>>(new Set());
    const [rejectingIds, setRejectingIds] = useState<Set<number>>(new Set());

    // ✅ فلترة فورية بدون تأخير
    const filteredStaffs = staffs.filter(
        (staff) =>
            (staff?.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (staff?.email || "").toLowerCase().includes(search.toLowerCase()) ||
            (staff?.teacher?.role || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (staff?.teacher?.notes || "")
                .toLowerCase()
                .includes(search.toLowerCase()),
    );

    useEffect(() => {
        fetchPendingTeachers();
    }, [fetchPendingTeachers]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // ✅ Approve - نظيف وبسيط
    const handleApprove = async (id: number) => {
        setApprovingIds((prev) => new Set([...prev, id]));
        try {
            await approveTeacher(id);
            toast.success("✅ تم تفعيل المعلم بنجاح!");
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || "❌ فشل في تفعيل المعلم",
            );
        } finally {
            setApprovingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    // ✅ Reject - نظيف وبسيط
    const handleReject = async (id: number) => {
        setRejectingIds((prev) => new Set([...prev, id]));
        try {
            await rejectTeacher(id);
            toast.success("✅ تم رفض طلب المعلم بنجاح!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "❌ فشل في رفض المعلم");
        } finally {
            setRejectingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const handleSendOTP = (name: string) => {
        toast.success(`تم إرسال OTP إلى ${name}`);
    };

    const handleLinkPayroll = (staff: any) => {
        setSelectedStaff(staff);
        setShowPayrollModal(true);
    };

    // ✅ البحث فوري بدون debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    if (isLoading) {
        return (
            <div className="teacherMotivate" style={{ padding: "0 15%" }}>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل المعلمين...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="teacherMotivate" style={{ padding: "0 15%" }}>
            <div className="teacherMotivate__inner">
                <div
                    className="userProfile__plan"
                    style={{ paddingBottom: "24px", padding: "0" }}
                >
                    <div className="userProfile__planTitle">
                        <h1>
                            اعتماد المعلمين الجدد{" "}
                            <span>{filteredStaffs.length} معلم</span>
                        </h1>
                    </div>

                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>
                                <RiRobot2Fill />
                            </i>
                            تحقق من الخبرة والدور قبل الاعتماد النهائي
                        </div>
                        <div className="plan__current">
                            <h2>قائمة المعلمين المعلقين</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو البريد أو الدور أو الحلقة..."
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="plan__daily-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>الصورة</th>
                                    <th>الاسم الكامل</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>الدور</th>
                                    <th>الحلقة/القسم</th>
                                    <th>تاريخ التقديم</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaffs.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`plan__row ${item.status}`}
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-700">
                                                    {(item.name || "?").charAt(
                                                        0,
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{item.name || "غير محدد"}</td>
                                        <td>{item.email || "---"}</td>
                                        <td>
                                            <span
                                                className={`role-badge ${
                                                    item.teacher?.role ===
                                                    "teacher"
                                                        ? "teacher"
                                                        : item.teacher?.role ===
                                                            "supervisor"
                                                          ? "supervisor"
                                                          : item.teacher
                                                                  ?.role ===
                                                              "motivator"
                                                            ? "motivator"
                                                            : item.teacher
                                                                    ?.role ===
                                                                "student_affairs"
                                                              ? "student_affairs"
                                                              : "financial"
                                                }`}
                                            >
                                                {item.teacher?.role ===
                                                "teacher"
                                                    ? "معلم قرآن"
                                                    : item.teacher?.role ===
                                                        "supervisor"
                                                      ? "مشرف تعليمي"
                                                      : item.teacher?.role ===
                                                          "motivator"
                                                        ? "مشرف تحفيز"
                                                        : item.teacher?.role ===
                                                            "student_affairs"
                                                          ? "شؤون الطلاب"
                                                          : "مشرف مالي"}
                                            </span>
                                        </td>
                                        <td>
                                            {item.teacher?.notes || "لا يوجد"}
                                        </td>
                                        <td>
                                            {
                                                (item.created_at || "").split(
                                                    "T",
                                                )[0]
                                            }
                                        </td>
                                        <td>
                                            <span
                                                className={`font-medium ${
                                                    item.status === "active"
                                                        ? "text-green-600"
                                                        : "text-orange-600"
                                                }`}
                                            >
                                                {item.status === "active"
                                                    ? "✅ معتمد"
                                                    : "⏳ معلق"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                {/* ✅ Approve Button */}
                                                <button
                                                    className="teacherStudent__status-btn approve-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1"
                                                    onClick={() =>
                                                        handleApprove(item.id)
                                                    }
                                                    disabled={approvingIds.has(
                                                        item.id,
                                                    )}
                                                    title="تفعيل المعلم"
                                                >
                                                    {approvingIds.has(
                                                        item.id,
                                                    ) ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <IoCheckmarkCircleOutline />
                                                    )}
                                                </button>

                                                {/* ✅ Reject Button */}
                                                <button
                                                    className="teacherStudent__status-btn reject-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleReject(item.id)
                                                    }
                                                    disabled={rejectingIds.has(
                                                        item.id,
                                                    )}
                                                    title="رفض المعلم"
                                                >
                                                    {rejectingIds.has(
                                                        item.id,
                                                    ) ? (
                                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <FiXCircle />
                                                    )}
                                                </button>

                                                {/* ✅ OTP Button */}
                                                <button
                                                    className="teacherStudent__status-btn otp-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleSendOTP(
                                                            item.name ||
                                                                "المعلم",
                                                        )
                                                    }
                                                    title="إرسال OTP"
                                                >
                                                    <RiMessage2Line />
                                                </button>

                                                {/* ✅ Payroll Link Button */}
                                                <button
                                                    className="teacherStudent__status-btn link-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                                                    onClick={() =>
                                                        handleLinkPayroll(item)
                                                    }
                                                    title="ربط الرواتب"
                                                >
                                                    <IoMdLink />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStaffs.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            لا توجد طلبات معلمين معلقة حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ Stats Cards */}
                    <div className="plan__stats">
                        <div className="stat-card">
                            <div className="stat-icon redColor">
                                <i>
                                    <GrStatusGood />
                                </i>
                            </div>
                            <div>
                                <h3>طلبات اليوم</h3>
                                <p className="text-2xl font-bold text-red-600">
                                    2
                                </p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon yellowColor">
                                <i>
                                    <GrStatusCritical />
                                </i>
                            </div>
                            <div>
                                <h3>معلقة</h3>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {filteredStaffs.length}
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
                                <h3>تم التفعيل</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    18
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Progress Bars */}
                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>معدل التفعيل</h1>
                            </div>
                            <p>88%</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "88%" }}></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>متوسط وقت المعالجة</h1>
                            </div>
                            <p>1.8 ساعة</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "78%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PayrollModel
                isOpen={showPayrollModal}
                onClose={() => setShowPayrollModal(false)}
                staffName={selectedStaff?.name}
            />
        </div>
    );
};

export default StaffApproval;
