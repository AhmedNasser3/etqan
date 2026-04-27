// SpecialRequestsManagement.tsx
import { useState, useCallback } from "react";
import { useToast } from "../../../../../contexts/ToastContext";
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
        search: searchFn,
    } = useSpecialRequests();

    const { notifySuccess, notifyError } = useToast();

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
        if (!window.confirm("هل أنت متأكد من حذف هذا الطلب الخاص؟")) return;

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
                const result = await response.json().catch(() => ({}));
                notifySuccess(result.message || "تم حذف الطلب بنجاح");
                refetch();
            } else {
                const errorData = await response.json().catch(() => ({}));
                notifyError(errorData.message || "حدث خطأ في الحذف");
            }
        } catch (error: any) {
            console.error("DELETE Error:", error);
            notifyError("حدث خطأ في الاتصال");
        }
    };

    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            searchFn(searchQuery.trim());
        } else {
            goToPage(1);
        }
    }, [searchQuery, searchFn, goToPage]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    const hasPrev = currentPage > 1;
    const hasNext = pagination && currentPage < pagination.last_page;

    return (
        <>
            {/* Header مع البحث */}
            <div className="content" id="contentArea">
                <div className="widget">
                    <div className="wh">
                        <div className="wh-l">طلبات الحلقات الخاصة</div>
                        <div className="flx items-center gap-2">
                            <div className="flex-1 relative">
                                <FiSearch
                                    style={{
                                        position: "absolute",
                                        left: 8,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--n400)",
                                        pointerEvents: "none",
                                    }}
                                />
                                <input
                                    className="fi"
                                    placeholder="ابحث بالاسم أو الواتساب..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") handleSearch();
                                    }}
                                    style={{
                                        paddingLeft: 32,
                                        margin: 0,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* الجدول */}
                    <div style={{ overflowX: "auto" }}>
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
                                        <td colSpan={8}>
                                            <div className="empty text-center py-8 text-gray-500">
                                                <p className="text-lg font-semibold mb-2">
                                                    لا توجد طلبات خاصة
                                                </p>
                                                <p>
                                                    لا توجد طلبات لحلقات خاصة في
                                                    الوقت الحالي
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request.id}>
                                            <td className="font-bold">
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
                                            <td className="text-green-600 font-semibold">
                                                {request.daily_memorization}
                                            </td>
                                            <td
                                                className="max-w-xs truncate"
                                                title={safeArray(
                                                    request.memorized_parts,
                                                ).join(", ")}
                                            >
                                                {safeArray(
                                                    request.memorized_parts,
                                                )
                                                    .slice(0, 2)
                                                    .join(", ") +
                                                    (safeArray(
                                                        request.memorized_parts,
                                                    ).length > 2
                                                        ? "..."
                                                        : "") || "-"}
                                            </td>
                                            <td
                                                className="max-w-xs truncate"
                                                title={safeArray(
                                                    request.parts_to_memorize,
                                                ).join(", ")}
                                            >
                                                {safeArray(
                                                    request.parts_to_memorize,
                                                )
                                                    .slice(0, 2)
                                                    .join(", ") +
                                                    (safeArray(
                                                        request.parts_to_memorize,
                                                    ).length > 2
                                                        ? "..."
                                                        : "") || "-"}
                                            </td>
                                            <td className="max-w-xs truncate">
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
                                                <div className="td-actions">
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() =>
                                                            (window.location.href = `/special-requests/${request.id}/edit`)
                                                        }
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button
                                                        className="btn bd bxs"
                                                        onClick={() =>
                                                            handleDelete(
                                                                request.id,
                                                            )
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
                                عرض {requests.length} من {pagination.total} طلب
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
                                    disabled={!hasPrev}
                                >
                                    السابق
                                </button>
                                <span
                                    className="btn bp"
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
                                    disabled={!hasNext}
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

export default SpecialRequestsManagement;
