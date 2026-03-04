import { useState, useEffect } from "react";
import {
    usePendingCenters,
    useConfirmCenter,
    useRejectCenter,
    useDeleteCenter,
} from "./hooks/usePendingCenters";
import toast, { Toaster } from "react-hot-toast";
import { RiRobot2Fill } from "react-icons/ri";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { FiXCircle } from "react-icons/fi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

const PendingCentersApproval: React.FC = () => {
    const {
        centers,
        loading: centersLoading,
        total,
        refetch,
    } = usePendingCenters();
    const {
        confirmCenter,
        loading: confirmLoading,
        error: confirmError,
    } = useConfirmCenter();
    const {
        rejectCenter,
        loading: rejectLoading,
        error: rejectError,
    } = useRejectCenter();
    const {
        deleteCenter,
        loading: deleteLoading,
        error: deleteError,
    } = useDeleteCenter();

    const [search, setSearch] = useState("");

    // ✅ تصفية متوافقة مع الهيكل الجديد
    const filteredCenters = centers.filter(
        (center) =>
            center.name?.toLowerCase().includes(search.toLowerCase()) ||
            center.user_name?.toLowerCase().includes(search.toLowerCase()) ||
            center.email?.toLowerCase().includes(search.toLowerCase()) ||
            center.subdomain?.toLowerCase().includes(search.toLowerCase()) ||
            center.phone?.toLowerCase().includes(search.toLowerCase()) ||
            center.user_email?.toLowerCase().includes(search.toLowerCase()),
    );

    // ✅ إخفاء أخطاء الـ hooks
    useEffect(() => {
        if (confirmError) {
            toast.error(`❌ خطأ في التفعيل: ${confirmError}`);
        }
        if (rejectError) {
            toast.error(`❌ خطأ في الرفض: ${rejectError}`);
        }
        if (deleteError) {
            toast.error(`❌ خطأ في الحذف: ${deleteError}`);
        }
    }, [confirmError, rejectError, deleteError]);

    useEffect(() => {
        refetch();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            const response = await confirmCenter(id);
            if (response.success) {
                toast.success(response.message || "تم اعتماد المجمع بنجاح!");
                refetch();
            }
        } catch (error: any) {
            toast.error(
                `❌ خطأ في اعتماد المجمع: ${error.message || "خطأ غير معروف"}`,
            );
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("هل أنت متأكد من رفض طلب هذا المجمع؟")) return;

        try {
            const response = await rejectCenter(id);
            if (response.success) {
                toast.success(response.message || "تم رفض طلب المجمع بنجاح");
                refetch();
            }
        } catch (error: any) {
            toast.error(
                `❌ خطأ في رفض المجمع: ${error.message || "خطأ غير معروف"}`,
            );
        }
    };

    const handleDelete = async (id: number) => {
        if (
            !confirm(
                "هل أنت متأكد من حذف هذا المجمع نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!",
            )
        )
            return;

        try {
            const response = await deleteCenter(id);
            if (response.success) {
                toast.success(response.message || "تم حذف المجمع نهائياً");
                refetch();
            }
        } catch (error: any) {
            toast.error(
                `❌ خطأ في حذف المجمع: ${error.message || "خطأ غير معروف"}`,
            );
        }
    };

    if (centersLoading) {
        return (
            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">
                        جاري تحميل المجامع...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/* ✅ إحصائيات محدثة */}
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon redColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي المجمعات</h3>
                            <p className="text-2xl font-bold text-red-600">
                                {total || centers.length}
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
                                {filteredCenters.length}
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
                            <h3>مطلوبة</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {centers.length}
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
                            تحقق من بيانات المجمعات قبل الاعتماد النهائي
                        </div>
                        <div className="plan__current">
                            <h2>قائمة المجمعات المعلقة</h2>
                            <div className="plan__date-range">
                                <div className="date-picker to">
                                    <input
                                        type="search"
                                        placeholder="البحث بالاسم أو البريد أو النطاق..."
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
                                    <th>الشعار</th>
                                    <th>اسم المجمع</th>
                                    <th>اسم المدير</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>رقم الجوال</th>
                                    <th>النطاق</th>
                                    <th>تاريخ التسجيل</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCenters.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="plan__row pending"
                                    >
                                        {/* ✅ شعار محدث */}
                                        <td className="teacherStudent__img">
                                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                                {item.logo ? (
                                                    <img
                                                        src={item.logo}
                                                        alt={
                                                            item.name ||
                                                            "شعار المجمع"
                                                        }
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                "https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=C";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-bold text-xl">
                                                            {item.name?.charAt(
                                                                0,
                                                            ) || "م"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* ✅ البيانات محدثة */}
                                        <td>
                                            <span className="font-medium">
                                                {item.name || "غير محدد"}
                                            </span>
                                        </td>
                                        <td>{item.user_name || "غير محدد"}</td>
                                        <td>
                                            <span className="text-gray-600">
                                                {item.email || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-gray-600">
                                                {item.phone || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-blue-600 font-mono text-sm">
                                                {item.subdomain || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-gray-500 text-sm">
                                                {item.created_at || "-"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                معلق
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
                                                        centersLoading
                                                    }
                                                    title="اعتماد المجمع"
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
                                                        centersLoading
                                                    }
                                                    title="رفض المجمع"
                                                >
                                                    <FiXCircle />
                                                </button>
                                                <button
                                                    className="teacherStudent__status-btn link-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    disabled={
                                                        deleteLoading ||
                                                        centersLoading
                                                    }
                                                    title="حذف المجمع نهائياً"
                                                >
                                                    <MdDelete />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCenters.length === 0 &&
                                    !centersLoading && (
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
                                                        {centers.length > 0
                                                            ? `تم العثور على ${centers.length} مجمع لكن لا يوجد معلقين`
                                                            : "لا توجد بيانات مجمعات"}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ إحصائيات محدثة */}
                    <div
                        className="inputs__verifyOTPBirth"
                        id="userProfile__verifyOTPBirth"
                    >
                        <div className="userProfile__progressContent">
                            <div className="userProfile__progressTitle">
                                <h1>معدل المعالجة</h1>
                            </div>
                            <p>
                                {centers.length > 0
                                    ? `${Math.round((filteredCenters.length / centers.length) * 100)}%`
                                    : "0%"}
                            </p>
                            <div className="userProfile__progressBar">
                                <span
                                    style={{
                                        width: `${Math.min(
                                            Math.round(
                                                (filteredCenters.length /
                                                    Math.max(
                                                        centers.length,
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
                                <h1>عدد الطلبات</h1>
                            </div>
                            <p>{total || centers.length}</p>
                            <div className="userProfile__progressBar">
                                <span style={{ width: "100%" }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PendingCentersApproval;
