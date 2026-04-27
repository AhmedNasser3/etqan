// PendingCentersApproval.tsx - نفس تصميم الجدول الجديد content/widget/wh/table
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    usePendingCenters,
    useConfirmCenter,
    useRejectCenter,
    useDeleteCenter,
} from "./hooks/usePendingCenters";
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

    // تصفية متوافقة مع الهيكل الجديد
    const filteredCenters = centers.filter(
        (center) =>
            center.name?.toLowerCase().includes(search.toLowerCase()) ||
            center.user_name?.toLowerCase().includes(search.toLowerCase()) ||
            center.email?.toLowerCase().includes(search.toLowerCase()) ||
            center.subdomain?.toLowerCase().includes(search.toLowerCase()) ||
            center.phone?.toLowerCase().includes(search.toLowerCase()) ||
            center.user_email?.toLowerCase().includes(search.toLowerCase()),
    );

    // إخفاء أخطاء الـ hooks
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
            <div
                className="content"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "400px",
                }}
            >
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
        );
    }

    return (
        <div className="content" id="contentArea">
            <div className="widget">
                {/* Header */}
                <div className="wh">
                    <div className="wh-l">
                        المجامع المعلقة للاعتماد
                        <span className="filter-form text-sm text-gray-600 ml-2">
                            ({filteredCenters.length})
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
                            <input
                                type="search"
                                className="fi"
                                placeholder="البحث بالاسم أو البريد أو النطاق..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                className="btn bp"
                                onClick={refetch}
                                style={{
                                    padding: "8px 16px",
                                    minWidth: "100px",
                                }}
                                disabled={centersLoading}
                            >
                                تحديث
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
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
                            {filteredCenters.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        <div className="space-y-2">
                                            <p>لا توجد طلبات معلقة حالياً</p>
                                            <p className="text-sm text-gray-400">
                                                {centers.length > 0
                                                    ? `تم العثور على ${centers.length} مجمع لكن لا يوجد معلقين`
                                                    : "لا توجد بيانات مجمعات"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCenters.map((item) => (
                                    <tr key={item.id}>
                                        {/* الشعار */}
                                        <td>
                                            <div className="w-12 h-12 rounded-full overflow-hidden mx-auto">
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

                                        {/* اسم المجمع */}
                                        <td className="font-semibold">
                                            {item.name || "غير محدد"}
                                        </td>

                                        {/* اسم المدير */}
                                        <td>{item.user_name || "غير محدد"}</td>

                                        {/* البريد الإلكتروني */}
                                        <td className="text-gray-600 text-sm">
                                            {item.email || "-"}
                                        </td>

                                        {/* رقم الجوال */}
                                        <td className="text-gray-600 text-sm">
                                            {item.phone || "-"}
                                        </td>

                                        {/* النطاق */}
                                        <td>
                                            <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                {item.subdomain || "-"}
                                            </span>
                                        </td>

                                        {/* تاريخ التسجيل */}
                                        <td className="text-sm text-gray-500">
                                            {item.created_at
                                                ? new Date(
                                                      item.created_at,
                                                  ).toLocaleDateString("ar-EG")
                                                : "-"}
                                        </td>

                                        {/* الحالة */}
                                        <td>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                                                معلق
                                            </span>
                                        </td>

                                        {/* الإجراءات */}
                                        <td>
                                            <div className="td-actions">
                                                <button
                                                    className="btn bp bxs"
                                                    onClick={() =>
                                                        handleApprove(item.id)
                                                    }
                                                    disabled={
                                                        confirmLoading ||
                                                        centersLoading
                                                    }
                                                >
                                                    {confirmLoading
                                                        ? "جاري..."
                                                        : "اعتماد"}
                                                </button>
                                                <button
                                                    className="btn bd bxs"
                                                    onClick={() =>
                                                        handleReject(item.id)
                                                    }
                                                    disabled={
                                                        rejectLoading ||
                                                        centersLoading
                                                    }
                                                >
                                                    رفض
                                                </button>
                                                <button
                                                    className="btn br bxs"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    disabled={
                                                        deleteLoading ||
                                                        centersLoading
                                                    }
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Stats Cards */}
            </div>
        </div>
    );
};

export default PendingCentersApproval;
