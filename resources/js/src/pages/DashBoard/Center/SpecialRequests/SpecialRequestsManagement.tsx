import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { FiEdit3, FiTrash2, FiSearch } from "react-icons/fi";
import {
    useSpecialRequests,
    SpecialRequestType,
} from "./hooks/useSpecialRequests";

const SpecialRequestsManagement: React.FC = () => {
    const {
        requests,
        loading,
        pagination,
        currentPage,
        goToPage,
        refetch,
        isEmpty,
        stats,
        search,
    } = useSpecialRequests();

    const [searchQuery, setSearchQuery] = useState("");

    const formatPhone = (phone: string) => {
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
    };

    const safeArray = (arr: any): string[] => {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.filter((item): item is string => typeof item === "string");
    };

    const safeSchedule = (schedule: any): Record<string, any> => {
        if (!schedule || typeof schedule !== "object") return {};
        return schedule;
    };

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا الطلب الخاص؟")) return;

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(`/api/v1/special-requests/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            if (response.ok) {
                toast.success("تم حذف الطلب بنجاح ✅");
                refetch();
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || "حدث خطأ في الحذف");
            }
        } catch (error) {
            console.error("DELETE Error:", error);
            toast.error("حدث خطأ في الاتصال");
        }
    };

    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            search(searchQuery.trim());
        } else {
            goToPage(1);
        }
    }, [searchQuery, search, goToPage]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">
                        <div className="navbar">
                            <div className="navbar__inner">
                                <div className="navbar__loading">
                                    <div className="loading-spinner">
                                        <div className="spinner-circle"></div>
                                    </div>
                                </div>
                            </div>
                        </div>{" "}
                    </p>
                </div>
            </div>
        );
    }

    const hasPrev = currentPage > 1;
    const hasNext = pagination && currentPage < pagination!.last_page;

    return (
        <div className="userProfile__plan" style={{ padding: "0 15%" }}>
            {/* الإحصائيات */}
            <div className="plan__stats">
                <div className="stat-card">
                    <div className="stat-icon purpleColor">
                        <i>📋</i>
                    </div>
                    <div>
                        <h3>إجمالي الطلبات</h3>
                        <p className="text-2xl font-bold text-purple-600">
                            {stats.total}
                        </p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blueColor">
                        <i>👤</i>
                    </div>
                    <div>
                        <h3>متوسط العمر</h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {stats.avgAge} سنة
                        </p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon greenColor">
                        <i>📖</i>
                    </div>
                    <div>
                        <h3>وجهين يومياً</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {stats.memorizationTypes["وجهين"] || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Header مع البحث */}
            <div
                className="userProfile__plan"
                style={{ paddingBottom: "24px", padding: "0" }}
            >
                <div className="plan__header">
                    <div className="plan__ai-suggestion">
                        <i>🎯</i>طلبات الحلقات الخاصة من الطلاب
                    </div>
                    <div className="plan__current flex items-center gap-4">
                        <h2>طلبات الحلقات</h2>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ابحث بالاسم أو الواتساب..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && handleSearch()
                                    }
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* الجدول */}
            <div className="plan__daily-table">
                <table>
                    <thead>
                        <tr>
                            <th>رقم الواتساب</th>
                            <th>الاسم</th>
                            <th>العمر</th>
                            <th>الحفظ اليومي</th>
                            <th>الأجزاء المحفوظة</th>
                            <th>المراد حفظه</th>
                            <th>المواعيد</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isEmpty ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="text-center py-8 text-gray-500"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                            🙋‍♂️
                                        </div>
                                        <div>
                                            <p className="text-xl font-semibold mb-2">
                                                لا توجد طلبات خاصة
                                            </p>
                                            <p className="text-gray-400">
                                                لا توجد طلبات لحلقات خاصة في
                                                الوقت الحالي
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            requests.map((request) => (
                                <tr
                                    key={request.id}
                                    className="plan__row active"
                                >
                                    <td className="font-bold text-xl">
                                        <a
                                            href={`https://wa.me/2${request.whatsapp_number}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:underline"
                                        >
                                            {formatPhone(
                                                request.whatsapp_number,
                                            )}
                                        </a>
                                    </td>
                                    <td>{request.name}</td>
                                    <td>{request.age ?? "-"}</td>
                                    <td className="font-semibold text-green-600">
                                        {request.daily_memorization}
                                    </td>
                                    <td
                                        className="max-w-xs"
                                        title={safeArray(
                                            request.memorized_parts,
                                        ).join(", ")}
                                    >
                                        {safeArray(request.memorized_parts)
                                            .length > 0
                                            ? safeArray(request.memorized_parts)
                                                  .slice(0, 2)
                                                  .join(", ") +
                                              (safeArray(
                                                  request.memorized_parts,
                                              ).length > 2
                                                  ? "..."
                                                  : "")
                                            : "-"}
                                    </td>
                                    <td
                                        className="max-w-xs"
                                        title={safeArray(
                                            request.parts_to_memorize,
                                        ).join(", ")}
                                    >
                                        {safeArray(request.parts_to_memorize)
                                            .length > 0
                                            ? safeArray(
                                                  request.parts_to_memorize,
                                              )
                                                  .slice(0, 2)
                                                  .join(", ") +
                                              (safeArray(
                                                  request.parts_to_memorize,
                                              ).length > 2
                                                  ? "..."
                                                  : "")
                                            : "-"}
                                    </td>
                                    <td className="max-w-xs">
                                        {Object.keys(
                                            safeSchedule(
                                                request.available_schedule,
                                            ),
                                        ).length > 0
                                            ? Object.entries(
                                                  safeSchedule(
                                                      request.available_schedule,
                                                  ),
                                              )
                                                  .slice(0, 2)
                                                  .map(
                                                      ([day, time]) =>
                                                          `${day}: ${time}`,
                                                  )
                                                  .join(", ") + "..."
                                            : "-"}
                                    </td>
                                    <td>
                                        <div className="teacherStudent__btns">
                                            <button
                                                className="teacherStudent__status-btn edit-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 mr-1 bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100"
                                                onClick={() => {
                                                    window.location.href = `/special-requests/${request.id}/edit`;
                                                }}
                                                title="تعديل الطلب"
                                            >
                                                <FiEdit3 />
                                            </button>
                                            <button
                                                className="teacherStudent__status-btn delete-btn p-2 rounded-full border-2 transition-all flex items-center justify-center w-12 h-12 bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                                                onClick={() =>
                                                    handleDelete(request.id)
                                                }
                                                title="حذف الطلب"
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
                            عرض {requests.length} من {pagination.total} طلب •
                            الصفحة <strong>{currentPage}</strong> من{" "}
                            <strong>{pagination.last_page}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={!hasPrev}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                السابق
                            </button>
                            <span className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold">
                                {currentPage}
                            </span>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={!hasNext}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpecialRequestsManagement;
