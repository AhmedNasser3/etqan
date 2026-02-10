// DomainRequestsManagement.tsx
import { useState, useCallback, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { FiEdit3, FiTrash2, FiPlus } from "react-icons/fi";
import { useDomainRequests, DomainRequest } from "./hooks/useDomainRequests";
import CreateDomainRequestModal from "./models/CreateDomainRequestModal";
import UpdateDomainRequestModal from "./models/UpdateDomainRequestModal";

const DomainRequestsManagement: React.FC = () => {
    const { requests, loading, deleteRequest, refetch, error } =
        useDomainRequests();

    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedRequest, setSelectedRequest] =
        useState<DomainRequest | null>(null);

    // ✅ Auto refetch عند تحميل الصفحة
    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleDelete = useCallback(
        async (request: DomainRequest) => {
            if (
                !confirm(
                    `هل أنت متأكد من إلغاء طلب الدومين "${request.requested_domain}"؟`,
                )
            ) {
                return;
            }

            try {
                await deleteRequest(request.id);
                toast.success("تم إلغاء الطلب بنجاح ✅");
                await refetch();
            } catch (error: any) {
                toast.error(error.message || "فشل في إلغاء الطلب");
            }
        },
        [deleteRequest, refetch],
    );

    const handleEdit = useCallback((request: DomainRequest) => {
        setSelectedRequest(request);
        setShowUpdateModal(true);
    }, []);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleCloseUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
        setSelectedRequest(null);
    }, []);

    const handleCreateSuccess = useCallback(async () => {
        toast.success("تم إرسال طلب الدومين بنجاح! 🎉");
        await refetch();
        handleCloseCreateModal();
    }, [refetch, handleCloseCreateModal]);

    const handleUpdateSuccess = useCallback(async () => {
        toast.success("تم تحديث طلب الدومين بنجاح! ✨");
        await refetch();
        handleCloseUpdateModal();
    }, [refetch, handleCloseUpdateModal]);

    // ✅ Search محسن مع debounce effect
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
                    request.dns1.toLowerCase().includes(search.toLowerCase()) ||
                    request.dns2.toLowerCase().includes(search.toLowerCase()),
            ),
        [requests, search],
    );

    // ✅ Stats محسنة
    const stats = useMemo(
        () => ({
            total: requests.length,
            pending: requests.filter(
                (r) => new Date(r.updated_at) > new Date(r.created_at),
            ).length,
        }),
        [requests],
    );

    // ✅ Loading state محسن
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">جاري تحميل طلبات الدومين...</p>
                </div>
            </div>
        );
    }

    // ✅ Error state محسن
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="text-center p-8 bg-red-50 border-2 border-red-200 rounded-2xl max-w-md mx-auto">
                    <div className="text-4xl text-red-600 mb-6">❌</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {error}
                    </h3>
                    <button
                        onClick={refetch}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg"
                    >
                        🔄 إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Modals */}
            {showCreateModal && (
                <CreateDomainRequestModal
                    onClose={handleCloseCreateModal}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {showUpdateModal && selectedRequest && (
                <UpdateDomainRequestModal
                    initialRequest={selectedRequest}
                    requestId={selectedRequest.id}
                    onClose={handleCloseUpdateModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/* Stats Cards */}
                <div className="plan__stats mb-8">
                    <div className="stat-card">
                        <div className="stat-icon blueColor">
                            <i>📧</i>
                        </div>
                        <div>
                            <h3>إجمالي الطلبات</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon yellowColor">
                            <i>⏳</i>
                        </div>
                        <div>
                            <h3>قيد المراجعة</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                {stats.pending}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Header & Search & Add Button */}
                <div
                    className="userProfile__plan mb-8"
                    style={{ padding: "0" }}
                >
                    <div className="plan__header">
                        <div className="plan__ai-suggestion">
                            <i>🌐</i>
                            طلبات تغيير الدومين الخاص بمركزك
                        </div>
                        <div className="plan__current">
                            <h2>قائمة الطلبات</h2>
                            <div className="plan__date-range flex items-center gap-3">
                                <div className="date-picker to flex-1">
                                    <input
                                        type="search"
                                        placeholder="البحث بالدومين أو اسم الاستضافة أو DNS..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <button
                                    className="teacherStudent__status-btn add-btn p-3 rounded-xl border-2 bg-green-50 border-green-300 text-green-600 hover:bg-green-100 font-medium flex items-center whitespace-nowrap shadow-sm"
                                    onClick={() => setShowCreateModal(true)}
                                    disabled={loading}
                                >
                                    <FiPlus size={20} className="mr-2" />
                                    طلب دومين جديد
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="plan__daily-table">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    اسم الاستضافة
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الدومين المطلوب
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    DNS 1
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    DNS 2
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    تاريخ الطلب
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-gray-500 bg-gray-50"
                                    >
                                        {search
                                            ? "لا توجد طلبات مطابقة للبحث 🔍"
                                            : "لا توجد طلبات دومين حالياً 🚀 ابدأ بإضافة طلب جديد!"}
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.hosting_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-semibold bg-blue-50 px-3 py-1 rounded-full text-blue-800">
                                                {item.requested_domain}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <span className="font-mono text-xs">
                                                {item.dns1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <span className="font-mono text-xs">
                                                {item.dns2}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleDateString("ar-EG")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-4 py-2 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                قيد المراجعة
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                                            <div className="flex gap-2">
                                                <button
                                                    className="p-2 rounded-full border-2 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center w-11 h-11 shadow-sm hover:shadow-md"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                    title="تعديل الطلب"
                                                    disabled={loading}
                                                >
                                                    <FiEdit3 size={18} />
                                                </button>
                                                <button
                                                    className="p-2 rounded-full border-2 bg-red-50 border-red-300 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center w-11 h-11 shadow-sm hover:shadow-md"
                                                    onClick={() =>
                                                        handleDelete(item)
                                                    }
                                                    title="إلغاء الطلب"
                                                    disabled={loading}
                                                >
                                                    <FiTrash2 size={18} />
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
        </>
    );
};

export default DomainRequestsManagement;
