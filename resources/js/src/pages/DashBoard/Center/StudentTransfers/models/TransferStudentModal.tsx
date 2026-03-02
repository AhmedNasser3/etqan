// models/TransferStudentModal.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { useTransferFormUpdate } from "../hooks/useTransferFormUpdate";

interface TransferStudentModalProps {
    onClose: () => void;
    onSuccess: () => void;
    bookingId: number;
}

const TransferStudentModal: React.FC<TransferStudentModalProps> = ({
    onClose,
    onSuccess,
    bookingId,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        isLoadingBooking,
        loadingData,
        loadingCircles,
        loadingSchedules,
        handleInputChange,
        submitForm,
        plansData,
        circlesData,
        schedulesData,
        currentBooking,
        selectedSchedule,
    } = useTransferFormUpdate(bookingId);

    // 🔥 تنسيق الوقت العربي (22:00 → 10 مساءً)
    const formatTimeArabic = (time24: string): string => {
        const [hours, minutes] = time24.split(":").map(Number);
        const period = hours >= 12 ? "مساءً" : "صباحًا";
        const hour12 = hours % 12 || 12;
        return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
    };

    const handleSubmit = async (formDataSubmit: FormData) => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(
                `/api/v1/student/transfer/${bookingId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: formDataSubmit,
                },
            );

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(errorMessages[0] || "حدث خطأ في النقل");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            toast.success(result.message || "تم نقل الطالب بنجاح! 🎉");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ في النقل");
        }
    };

    const isLoading = loadingData || isLoadingBooking;

    if (isLoading) {
        return (
            <div className="ParentModel">
                <div className="ParentModel__overlay">
                    <div className="ParentModel__content">
                        <div className="flex items-center justify-center min-h-[400px] p-8">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-lg text-gray-600">
                                    جاري تحميل الخطط المتاحة...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ParentModel">
            <div className="ParentModel__overlay" onClick={onClose}>
                <div
                    className="ParentModel__content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="ParentModel__inner">
                        <div className="ParentModel__header">
                            <button
                                className="ParentModel__close"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>نقل طالب</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>نقل الطالب لخطة + حلقة + موعد جديد</h1>
                                <div className="flex flex-col gap-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <p className="text-sm text-gray-700">
                                        <strong>الطالب الحالي:</strong> حجز #{" "}
                                        {bookingId}
                                    </p>
                                    {currentBooking && (
                                        <>
                                            <p className="text-sm text-gray-700">
                                                <strong>الخطة الحالية:</strong>{" "}
                                                {currentBooking.plan_name}
                                            </p>
                                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                                ⚠️ سيتم حذف جميع الجلسات القديمة
                                                وإنشاء جديدة
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* 🔥 1. الخطة الجديدة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        1. الخطة الجديدة *
                                    </label>
                                    <select
                                        name="new_plan_id"
                                        value={formData.new_plan_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                            errors.new_plan_id
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">
                                            اختر الخطة الجديدة
                                        </option>
                                        {plansData.map((plan) => (
                                            <option
                                                key={plan.id}
                                                value={plan.id.toString()}
                                            >
                                                {plan.plan_name} (
                                                {plan.total_months} شهور)
                                                <span className="text-gray-500 ml-2">
                                                    ({plan.circle_count || 0}{" "}
                                                    حلقة)
                                                </span>
                                            </option>
                                        ))}
                                    </select>
                                    {errors.new_plan_id && (
                                        <p className="mt-1 text-sm text-red-600 animate-pulse">
                                            {errors.new_plan_id}
                                        </p>
                                    )}
                                    {plansData.length === 0 && !loadingData && (
                                        <p className="mt-2 text-sm text-gray-500 italic">
                                            لا توجد خطط متاحة أخرى لهذا المجمع
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 🔥 2. اختيار الحلقة */}
                            {formData.new_plan_id && (
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label className="block text-sm font-medium text-purple-700 mb-2">
                                            2. الحلقة المطلوبة *
                                        </label>
                                        <select
                                            name="new_circle_id"
                                            value={formData.new_circle_id || ""}
                                            onChange={handleInputChange}
                                            disabled={
                                                loadingCircles || isSubmitting
                                            }
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                                                errors.new_circle_id
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <option value="">
                                                {loadingCircles
                                                    ? "جاري تحميل الحلقات..."
                                                    : "اختر الحلقة"}
                                            </option>
                                            {circlesData.map((circle) => (
                                                <option
                                                    key={circle.id}
                                                    value={circle.id.toString()}
                                                >
                                                    {circle.circle_name}
                                                    <span className="text-gray-500 ml-2">
                                                        ({circle.schedule_count}{" "}
                                                        موعد)
                                                    </span>
                                                </option>
                                            ))}
                                        </select>
                                        {errors.new_circle_id && (
                                            <p className="mt-1 text-sm text-red-600 animate-pulse">
                                                {errors.new_circle_id}
                                            </p>
                                        )}
                                        {circlesData.length === 0 &&
                                            !loadingCircles &&
                                            formData.new_plan_id && (
                                                <p className="mt-2 text-sm text-gray-500 italic">
                                                    لا توجد حلقات متاحة لهذه
                                                    الخطة
                                                </p>
                                            )}
                                    </div>
                                </div>
                            )}

                            {/* 🔥 3. اختيار الموعد - مع الوقت العربي */}
                            {formData.new_circle_id && (
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label className="block text-sm font-medium text-indigo-700 mb-2">
                                            3. الموعد المطلوب *
                                        </label>
                                        <select
                                            name="new_schedule_id"
                                            value={
                                                formData.new_schedule_id || ""
                                            }
                                            onChange={handleInputChange}
                                            disabled={
                                                loadingSchedules || isSubmitting
                                            }
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                                                errors.new_schedule_id
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <option value="">
                                                {loadingSchedules
                                                    ? "جاري تحميل المواعيد..."
                                                    : "اختر الموعد"}
                                            </option>
                                            {schedulesData.map((schedule) => {
                                                const startTimeArabic =
                                                    formatTimeArabic(
                                                        schedule.time_range.split(
                                                            " - ",
                                                        )[0],
                                                    );
                                                const endTimeArabic =
                                                    formatTimeArabic(
                                                        schedule.time_range.split(
                                                            " - ",
                                                        )[1],
                                                    );
                                                return (
                                                    <option
                                                        key={schedule.id}
                                                        value={schedule.id.toString()}
                                                    >
                                                        {schedule.circle_name} -{" "}
                                                        <span className="ml-2">
                                                            {startTimeArabic} -{" "}
                                                            {endTimeArabic}
                                                        </span>
                                                        {schedule.remaining_slots !==
                                                            null &&
                                                            schedule.remaining_slots >
                                                                0 && (
                                                                <span className="text-green-600 ml-2">
                                                                    (
                                                                    {
                                                                        schedule.remaining_slots
                                                                    }{" "}
                                                                    باقي)
                                                                </span>
                                                            )}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {errors.new_schedule_id && (
                                            <p className="mt-1 text-sm text-red-600 animate-pulse">
                                                {errors.new_schedule_id}
                                            </p>
                                        )}
                                        {schedulesData.length === 0 &&
                                            !loadingSchedules &&
                                            formData.new_circle_id && (
                                                <p className="mt-2 text-sm text-gray-500 italic">
                                                    لا توجد مواعيد متاحة لهذه
                                                    الحلقة
                                                </p>
                                            )}
                                    </div>
                                </div>
                            )}

                            {/* 🔥 4. Preview الموعد المختار */}
                            {selectedSchedule && (
                                <div className="transfer-preview-box">
                                    <div className="transfer-preview-header">
                                        <div className="transfer-preview-icon">
                                            <span>✅</span>
                                        </div>
                                        <div>
                                            <h3>
                                                الخطة + الحلقة + الموعد المختار
                                            </h3>
                                            <p>
                                                سيتم نقل الطالب لهذا الجدول
                                                بالضبط
                                            </p>
                                        </div>
                                    </div>
                                    <div className="transfer-preview-grid">
                                        <div className="transfer-preview-item">
                                            <span className="transfer-icon">
                                                📋
                                            </span>
                                            <span>
                                                <strong>الخطة:</strong>{" "}
                                                {
                                                    plansData.find(
                                                        (p) =>
                                                            p.id.toString() ===
                                                            formData.new_plan_id,
                                                    )?.plan_name
                                                }
                                            </span>
                                        </div>
                                        <div className="transfer-preview-item">
                                            <span className="transfer-icon">
                                                🕌
                                            </span>
                                            <span>
                                                <strong>الحلقة:</strong>{" "}
                                                {selectedSchedule.circle_name}
                                            </span>
                                        </div>

                                        <div className="transfer-preview-item">
                                            <span className="transfer-icon">
                                                🕒
                                            </span>
                                            <span>
                                                <strong>الوقت:</strong>{" "}
                                                {formatTimeArabic(
                                                    selectedSchedule.time_range.split(
                                                        " - ",
                                                    )[0],
                                                )}{" "}
                                                -{" "}
                                                {formatTimeArabic(
                                                    selectedSchedule.time_range.split(
                                                        " - ",
                                                    )[1],
                                                )}
                                            </span>
                                        </div>
                                        <div className="transfer-preview-item full-width">
                                            <span className="transfer-icon">
                                                👨‍🏫
                                            </span>
                                            <span>
                                                <strong>المعلم:</strong>{" "}
                                                {selectedSchedule.teacher_name}
                                            </span>
                                        </div>
                                        {selectedSchedule.remaining_slots !==
                                            null && (
                                            <div className="transfer-preview-warning full-width">
                                                <span className="transfer-icon">
                                                    ⚠️
                                                </span>
                                                <span>
                                                    الأماكن المتبقية:{" "}
                                                    <strong>
                                                        {
                                                            selectedSchedule.remaining_slots
                                                        }
                                                    </strong>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 🔥 5. زر النقل */}
                            <div className="inputs__verifyOTPBirth">
                                <div
                                    className="inputs__submitBtn"
                                    id="ParentModel__btn"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            submitForm(handleSubmit as any)
                                        }
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            loadingCircles ||
                                            loadingSchedules ||
                                            !formData.new_plan_id ||
                                            !formData.new_circle_id ||
                                            !formData.new_schedule_id ||
                                            plansData.length === 0
                                        }
                                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 group"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-3"></div>
                                                <span className="tracking-wide">
                                                    جاري النقل للجدول الجديد...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2 group-hover:scale-110 transition-transform">
                                                    🚀
                                                </span>
                                                <span className="tracking-wide">
                                                    نقل الطالب للخطة + الحلقة +
                                                    الموعد المختار
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferStudentModal;
