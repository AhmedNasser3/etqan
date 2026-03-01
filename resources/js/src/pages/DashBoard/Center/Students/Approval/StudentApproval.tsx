import { useState, useRef, useEffect } from "react";
import { usePendingStudents } from "./hooks/usePendingStudents";
import {
    useConfirmStudent,
    useRejectStudent,
} from "./hooks/usePendingStudents";
import toast from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { RiMessage2Line } from "react-icons/ri";
import { FiXCircle } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoMdLink } from "react-icons/io";
import { FiDatabase } from "react-icons/fi";
import ParentModel from "./modals/ParentModel";

declare global {
    interface Window {
        XLSX: any;
    }
}

const StudentApproval: React.FC = () => {
    const {
        students,
        loading: studentsLoading,
        refetch,
    } = usePendingStudents();
    const { confirmStudent, loading: confirmLoading } = useConfirmStudent();
    const { rejectStudent, loading: rejectLoading } = useRejectStudent();

    const [search, setSearch] = useState("");
    const [showParentModal, setShowParentModal] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    //  Fixed filtering - handle missing nested properties safely
    const filteredStudents = students.filter(
        (student: any) =>
            student.name?.toLowerCase().includes(search.toLowerCase()) ||
            student.id_number?.toLowerCase().includes(search.toLowerCase()) ||
            student.grade_level?.toLowerCase().includes(search.toLowerCase()) ||
            student.circle?.toLowerCase().includes(search.toLowerCase()) ||
            student.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            student.guardian?.name
                ?.toLowerCase()
                .includes(search.toLowerCase()),
    );

    useEffect(() => {
        refetch();
    }, []);

    //  Debug button handler
    const handleDebug = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/v1/centers/pending-students-debug",
            );
            const data = await response.json();
            setDebugInfo(data);
            toast.success("تم جلب معلومات التشخيص");
        } catch (error) {
            toast.error("خطأ في جلب بيانات التشخيص");
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await confirmStudent(id);
            toast.success(" تم اعتماد الطالب بنجاح!");
            refetch();
        } catch (error: any) {
            toast.error(
                ` خطأ في اعتماد الطالب: ${error.message || "خطأ غير معروف"}`,
            );
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("هل أنت متأكد من رفض طلب هذا الطالب؟")) return;

        try {
            await rejectStudent(id);
            toast.success(" تم رفض طلب الطالب بنجاح");
            refetch();
        } catch (error: any) {
            toast.error(
                `❌ خطأ في رفض الطالب: ${error.message || "خطأ غير معروف"}`,
            );
        }
    };

    const handleSendOTP = (name: string) => {
        toast(`📱 تم إرسال رمز التحقق إلى ${name}`, {
            duration: 4000,
            position: "top-right",
        });
    };

    const handleOpenParentModal = (student: any) => {
        setSelectedStudent(student);
        setShowParentModal(true);
    };

    const handleCloseParentModal = () => {
        setShowParentModal(false);
        setSelectedStudent(null);
    };

    if (studentsLoading) {
        return (
            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="navbar">
                        <div className="navbar__inner">
                            <div className="navbar__loading">
                                <div className="loading-spinner">
                                    <div className="spinner-circle"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <ParentModel
                isOpen={showParentModal}
                onClose={handleCloseParentModal}
                student={selectedStudent}
            />
            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/*  Debug Section */}
                {debugInfo && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <h3 className="font-bold text-yellow-800 mb-2">
                            🔍 معلومات التشخيص:
                        </h3>
                        <pre className="text-xs bg-yellow-100 p-3 rounded text-yellow-900 overflow-auto max-h-40">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                        <button
                            onClick={() => setDebugInfo(null)}
                            className="mt-2 text-xs text-yellow-700 underline"
                        >
                            إخفاء التشخيص
                        </button>
                    </div>
                )}

                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي الطلاب</h3>
                            <p className="text-2xl font-bold text-red-600">
                                {students.length}
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
                                {filteredStudents.length}
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
                            <h3>من المجمعات</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {
                                    students.filter((s: any) => s.center?.name)
                                        .length
                                }
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
                            تحقق من بيانات الطلاب قبل الاعتماد النهائي
                        </div>
                        <div className="plan__current">
                            <h2>قائمة الطلاب المعلقين</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو رقم الهوية أو الحلقة..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
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
                                    <th>الاسم الرباعي</th>
                                    <th>رقم الهوية</th>
                                    <th>الصف</th>
                                    <th>الحلقة</th>
                                    <th>المجمع</th>
                                    <th>تاريخ التقديم</th>
                                    <th>حالة الولي أمر</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((item: any) => (
                                    <tr
                                        key={item.id}
                                        className={`plan__row ${item.user?.status === "pending" ? "pending" : ""}`}
                                    >
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                                <img
                                                    src={
                                                        item.user?.avatar ||
                                                        item.avatar ||
                                                        "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png"
                                                    }
                                                    alt={
                                                        item.name ||
                                                        item.user?.name
                                                    }
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "https://static.vecteezy.com/system/resources/thumbnails/063/407/852/small/happy-smiling-arab-man-isolated-on-transparent-background-png.png";
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            {item.name ||
                                                item.user?.name ||
                                                "غير محدد"}
                                        </td>
                                        <td>{item.id_number || "-"}</td>
                                        <td>{item.grade_level || "-"}</td>
                                        <td>{item.circle || "-"}</td>
                                        <td>{item.center?.name || "-"}</td>
                                        <td>
                                            {item.created_at
                                                ? new Date(
                                                      item.created_at,
                                                  ).toLocaleDateString("ar-EG")
                                                : new Date().toLocaleDateString(
                                                      "ar-EG",
                                                  )}
                                        </td>
                                        <td>
                                            <span className="text-green-600 font-medium">
                                                {item.guardian?.name ||
                                                    "غير محدد"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="teacherStudent__btns">
                                                <button
                                                    className="teacherStudent__status-btn approve-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 hover:bg-green-50"
                                                    onClick={() =>
                                                        handleApprove(item.id)
                                                    }
                                                    disabled={
                                                        confirmLoading ||
                                                        studentsLoading
                                                    }
                                                    title="اعتماد الطالب"
                                                >
                                                    {confirmLoading ? (
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <IoCheckmarkCircleOutline />
                                                    )}
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn reject-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                    onClick={() =>
                                                        handleReject(item.id)
                                                    }
                                                    disabled={
                                                        rejectLoading ||
                                                        studentsLoading
                                                    }
                                                    title="رفض الطالب"
                                                >
                                                    <FiXCircle />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn otp-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                    onClick={() =>
                                                        handleSendOTP(
                                                            item.guardian
                                                                ?.name ||
                                                                item.name ||
                                                                "",
                                                        )
                                                    }
                                                    disabled={studentsLoading}
                                                    title="إرسال OTP"
                                                >
                                                    <i>
                                                        <RiMessage2Line />
                                                    </i>
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn link-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                                                    onClick={() =>
                                                        handleOpenParentModal(
                                                            item,
                                                        )
                                                    }
                                                    title="بيانات ولي الأمر"
                                                >
                                                    <IoMdLink />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 &&
                                    !studentsLoading && (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="text-center py-12 text-gray-500"
                                            >
                                                <div className="space-y-2">
                                                    <p>
                                                        لا توجد طلبات معلقة
                                                        حالياً
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {students.length > 0
                                                            ? `تم العثور على ${students.length} طالب لكن لا يوجد معلقين`
                                                            : "لا توجد بيانات طلاب"}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>

                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>معدل الاعتماد</h1>
                            </div>
                            <p>
                                {Math.round(
                                    (students.filter((s: any) => s.status === 1)
                                        .length /
                                        Math.max(students.length, 1)) *
                                        100,
                                )}
                                %
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${Math.min(
                                            Math.round(
                                                (students.filter(
                                                    (s: any) => s.status === 1,
                                                ).length /
                                                    Math.max(
                                                        students.length,
                                                        1,
                                                    )) *
                                                    100,
                                            ),
                                            100,
                                        )}%`,
                                    }}
                                ></span>
                            </div>
                        </div>
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>متوسط وقت المعالجة</h1>
                            </div>
                            <p>
                                {students.length > 0
                                    ? `${Math.round(students.length / 10)} ساعة`
                                    : "0 ساعة"}
                            </p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "85%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentApproval;
