// DomainRequestsAdminManagement.tsx - نفس تصميم الجدول الجديد content/widget/wh/table
import { useState, useCallback, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";
import {
    useAdminDomainRequests,
    AdminDomainRequest,
} from "./hooks/useAdminDomainRequests";

const DomainRequestsAdminManagement: React.FC = () => {
    const { requests, loading, deleteRequest, refetch, error } =
        useAdminDomainRequests();

    const [search, setSearch] = useState("");

    // Auto refetch عند تحميل الصفحة
    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleDelete = useCallback(
        async (request: AdminDomainRequest) => {
            if (
                !confirm(
                    `هل أنت متأكد من حذف طلب الدومين "${request.requested_domain}" لمركز ${request.center?.name || "غير محدد"}؟`,
                )
            ) {
                return;
            }

            try {
                await deleteRequest(request.id);
                toast.success("تم حذف الطلب بنجاح ");
                await refetch();
            } catch (error: any) {
                toast.error(error.message || "فشل في حذف الطلب");
            }
        },
        [deleteRequest, refetch],
    );

    // Search محسن مع debounce effect
    const filteredRequests = useMemo(
        () =>
            requests.filter(
                (request) =>
                    request.requested_domain
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                    request.hosting_name
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                    (request.center?.name || "")
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                    request.dns1.toLowerCase().includes(search.toLowerCase()) ||
                    request.dns2.toLowerCase().includes(search.toLowerCase()),
            ),
        [requests, search],
    );

    // Stats محسنة
    const stats = useMemo(
        () => ({
            total: requests.length,
            pending: requests.length, // كلها قيد المراجعة
        }),
        [requests],
    );

    // Loading state
    if (loading) {
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

    // Error state
    if (error) {
        return (
            <div className="content">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">خطأ في تحميل البيانات</div>
                        <div className="flx">
                            <button
                                className="btn bp"
                                onClick={refetch}
                                style={{ padding: "8px 16px" }}
                            >
                                إعادة المحاولة
                            </button>
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
                        إدارة طلبات الدومين
                        <span className="filter-form text-sm text-gray-600 ml-2">
                            ({filteredRequests.length})
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
                                placeholder="البحث بالمركز أو الدومين أو اسم الاستضافة أو DNS..."
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
                                <th>اسم المركز</th>
                                <th>اسم الاستضافة</th>
                                <th>الدومين المطلوب</th>
                                <th>DNS 1</th>
                                <th>DNS 2</th>
                                <th>تاريخ الطلب</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        {search
                                            ? "لا توجد طلبات مطابقة للبحث 🔍"
                                            : "لا توجد طلبات دومين حالياً 📭"}
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((item) => (
                                    <tr key={item.id}>
                                        {/* اسم المركز */}
                                        <td>
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                                                {item.center?.name ||
                                                    "غير محدد"}
                                            </span>
                                        </td>

                                        {/* اسم الاستضافة */}
                                        <td className="font-medium">
                                            {item.hosting_name}
                                        </td>

                                        {/* الدومين المطلوب */}
                                        <td>
                                            <span className="font-mono text-sm font-semibold bg-blue-50 px-3 py-1 rounded-full text-blue-800">
                                                {item.requested_domain}
                                            </span>
                                        </td>

                                        {/* DNS 1 */}
                                        <td>
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                {item.dns1}
                                            </span>
                                        </td>

                                        {/* DNS 2 */}
                                        <td>
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                {item.dns2}
                                            </span>
                                        </td>

                                        {/* تاريخ الطلب */}
                                        <td className="text-sm text-gray-600">
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleDateString("ar-EG")}
                                        </td>

                                        {/* الإجراءات */}
                                        <td>
                                            <div className="td-actions">
                                                <button
                                                    className="btn bd bxs"
                                                    onClick={() =>
                                                        handleDelete(item)
                                                    }
                                                    title="حذف الطلب"
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
            </div>
        </div>
    );
};

export default DomainRequestsAdminManagement;
