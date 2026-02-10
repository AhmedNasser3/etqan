// StaffAttendance.tsx - النسخة النهائية ✅ متوافق مع Hook الجديد
import { useState } from "react";
import toast from "react-hot-toast";
import { FiFileText } from "react-icons/fi";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { PiWhatsappLogoDuotone } from "react-icons/pi";
import { CiCircleCheck, CiWarning, CiCircleRemove } from "react-icons/ci";
import {
    useStaffAttendance,
    StaffAttendance as StaffAttendanceType,
} from "./hooks/useStaffAttendance";

const StaffAttendance: React.FC = () => {
    const {
        staff: filteredStaff,
        stats,
        loading,
        search,
        dateFilter,
        error,
        isEmpty,
        setSearch,
        setDateFilter,
        fetchAttendance,
        markAttendance,
    } = useStaffAttendance();

    const [markingId, setMarkingId] = useState<number | null>(null);

    const getStatusColor = (status: StaffAttendanceType["status"]) => {
        switch (status) {
            case "present":
                return "text-green-600 bg-green-100";
            case "late":
                return "text-yellow-600 bg-yellow-100";
            case "absent":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getStatusIcon = (status: StaffAttendanceType["status"]) => {
        switch (status) {
            case "present":
                return <CiCircleCheck className="inline mr-1 w-4 h-4" />;
            case "late":
                return <CiWarning className="inline mr-1 w-4 h-4" />;
            case "absent":
                return <CiCircleRemove className="inline mr-1 w-4 h-4" />;
            default:
                return <CiCircleRemove className="inline mr-1 w-4 h-4" />;
        }
    };

    const handleMarkAttendance = async (
        staffId: number,
        status: "present" | "late" | "absent",
    ) => {
        setMarkingId(staffId);
        const success = await markAttendance(staffId, status);

        if (success) {
            toast.success(
                status === "present"
                    ? "تم تسجيل الحضور بنجاح ✅"
                    : status === "late"
                      ? "تم تسجيل التأخير بنجاح ⚠️"
                      : "تم تسجيل الغياب بنجاح ❌",
                {
                    duration: 4000,
                    position: "top-right",
                },
            );
            // Refresh بعد نجاح العملية
            setTimeout(() => fetchAttendance(), 1000);
        } else {
            toast.error("فشل في تحديث الحضور! يرجى المحاولة مرة أخرى", {
                duration: 5000,
                position: "top-right",
            });
        }
        setMarkingId(null);
    };

    const handleExportPDF = () => {
        toast.loading("جاري إعداد ملف PDF...", { id: "export-pdf" });
        // ✅ URL صحيح للـ export (هتحتاج Backend endpoint)
        window.open(
            `/api/v1/attendance/export-pdf?date_filter=${dateFilter}`,
            "_blank",
        );
        toast.success("تم فتح ملف PDF!", { id: "export-pdf" });
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "معلم":
                return "bg-green-100 text-green-800";
            case "مشرف تعليمي":
                return "bg-blue-100 text-blue-800";
            case "مدير":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Error State
    if (error) {
        return (
            <div className="teacherMotivate" style={{ padding: "0 15%" }}>
                <div className="flex items-center justify-center py-20">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto text-center">
                        <CiCircleRemove className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-red-800 mb-2">
                            خطأ في تحميل البيانات
                        </h3>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button
                            onClick={fetchAttendance}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="teacherMotivate" style={{ padding: "0 15%" }}>
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-4" />
                    <span className="text-lg text-gray-600 font-medium">
                        جاري تحميل سجلات الحضور...
                    </span>
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
                            حضور الموظفين{" "}
                            <span>{filteredStaff.length} موظف</span>
                        </h1>
                    </div>

                    {/* Header Controls */}
                    <div className="plan__header">
                        <div className="plan__current">
                            <h2>
                                سجل الحضور{" "}
                                {dateFilter === "today"
                                    ? "اليومي"
                                    : dateFilter === "yesterday"
                                      ? "الأمس"
                                      : dateFilter === "week"
                                        ? "الأسبوعي"
                                        : "الشهري"}
                            </h2>
                            <div className="plan__date-range flex gap-3 items-center">
                                <select
                                    value={dateFilter}
                                    onChange={(e) =>
                                        setDateFilter(e.target.value as any)
                                    }
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-all"
                                    disabled={loading}
                                >
                                    <option value="today">اليوم</option>
                                    <option value="yesterday">أمس</option>
                                    <option value="week">هذا الأسبوع</option>
                                    <option value="month">هذا الشهر</option>
                                </select>
                                <input
                                    type="search"
                                    placeholder="البحث بالاسم أو الدور..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 disabled:opacity-50 transition-all"
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleExportPDF}
                                    disabled={
                                        loading || filteredStaff.length === 0
                                    }
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                                    title="تصدير PDF"
                                >
                                    <FiFileText className="w-4 h-4" />
                                    تصدير PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="plan__stats grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="stat-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                            <div className="stat-icon greenColor p-3 rounded-xl bg-green-50">
                                <GrStatusGood className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">
                                    حضور اليوم
                                </h3>
                                <p className="text-3xl font-bold text-green-600">
                                    {stats.present}/{stats.total}
                                </p>
                                <span className="text-sm text-gray-500 font-medium">
                                    {stats.total > 0
                                        ? Math.round(
                                              (stats.present / stats.total) *
                                                  100,
                                          )
                                        : 0}
                                    %
                                </span>
                            </div>
                        </div>
                        <div className="stat-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                            <div className="stat-icon yellowColor p-3 rounded-xl bg-yellow-50">
                                <GrStatusCritical className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">
                                    متأخرين
                                </h3>
                                <p className="text-3xl font-bold text-yellow-600">
                                    {stats.late}
                                </p>
                            </div>
                        </div>
                        <div className="stat-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
                            <div className="stat-icon redColor p-3 rounded-xl bg-red-50">
                                <PiWhatsappLogoDuotone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-1">
                                    غائبين
                                </h3>
                                <p className="text-3xl font-bold text-red-600">
                                    {stats.absent}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Table */}
                    <div className="plan__daily-table overflow-x-auto">
                        <table className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        الصورة
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        الاسم
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        الدور
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        الحالة
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        ملاحظات
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStaff.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-sm">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {item.teacher_name.charAt(
                                                        0,
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {item.teacher_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                                                    item.role,
                                                )}`}
                                            >
                                                {item.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                                                    item.status,
                                                )} flex items-center gap-1`}
                                            >
                                                {getStatusIcon(item.status)}
                                                {item.status === "present"
                                                    ? "حاضر"
                                                    : item.status === "late"
                                                      ? "متأخر"
                                                      : "غائب"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                            <div
                                                className="line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                                                title={item.notes}
                                            >
                                                {item.notes || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-3 rounded-xl border-2 border-green-300 bg-green-50 text-green-600 hover:bg-green-100 hover:border-green-400 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() =>
                                                        handleMarkAttendance(
                                                            item.id,
                                                            "present",
                                                        )
                                                    }
                                                    disabled={
                                                        markingId === item.id ||
                                                        loading
                                                    }
                                                    title="حاضر"
                                                >
                                                    {markingId === item.id ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <CiCircleCheck className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <button
                                                    className="p-3 rounded-xl border-2 border-yellow-300 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:border-yellow-400 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md disabled:opacity-50"
                                                    onClick={() =>
                                                        handleMarkAttendance(
                                                            item.id,
                                                            "late",
                                                        )
                                                    }
                                                    disabled={
                                                        markingId === item.id ||
                                                        loading
                                                    }
                                                    title="متأخر"
                                                >
                                                    <CiWarning className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="p-3 rounded-xl border-2 border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-400 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md disabled:opacity-50"
                                                    onClick={() =>
                                                        handleMarkAttendance(
                                                            item.id,
                                                            "absent",
                                                        )
                                                    }
                                                    disabled={
                                                        markingId === item.id ||
                                                        loading
                                                    }
                                                    title="غائب"
                                                >
                                                    <CiCircleRemove className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {isEmpty && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-20 text-center text-gray-500 bg-gray-50 rounded-b-xl"
                                        >
                                            <div className="max-w-md mx-auto">
                                                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <FiFileText className="w-10 h-10 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                                                    لا توجد سجلات حضور
                                                </h3>
                                                <p className="text-sm">
                                                    {dateFilter === "today"
                                                        ? "لا توجد سجلات حضور لهذا اليوم"
                                                        : dateFilter ===
                                                            "yesterday"
                                                          ? "لا توجد سجلات حضور لليوم السابق"
                                                          : dateFilter ===
                                                              "week"
                                                            ? "لا توجد سجلات حضور لهذا الأسبوع"
                                                            : "لا توجد سجلات حضور لهذا الشهر"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Monthly Progress Bar */}
                    {stats.total > 0 && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    معدل الحضور الشهري
                                </h3>
                                <span className="text-2xl font-bold text-blue-600">
                                    {stats.monthlyAttendanceRate}%
                                </span>
                            </div>
                            <div className="relative pt-1">
                                <div className="flex h-4 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(stats.monthlyAttendanceRate, 100)}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-right font-medium">
                                {stats.monthlyAttendanceRate >= 90
                                    ? "ممتاز! 🎉"
                                    : stats.monthlyAttendanceRate >= 75
                                      ? "جيد 👍"
                                      : stats.monthlyAttendanceRate >= 50
                                        ? "متوسط ⚠️"
                                        : "يحتاج تحسين ❌"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffAttendance;
