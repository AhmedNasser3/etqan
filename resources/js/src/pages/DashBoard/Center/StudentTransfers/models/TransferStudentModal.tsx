// models/TransferStudentModal.tsx
import { useEffect } from "react";
import { useToast } from "../../../../../../contexts/ToastContext";
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

    const { notifySuccess, notifyError } = useToast();

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
                    notifyError(errorMessages[0] || "حدث خطأ في النقل");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            notifySuccess(result.message || "تم نقل الطالب بنجاح! 🎉");
            onSuccess();
        } catch (error: any) {
            notifyError(error.message || "حدث خطأ في النقل");
        }
    };

    const isLoading = loadingData || isLoadingBooking;

    if (isLoading) {
        return (
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">
                            جاري تحميل الخطط المتاحة...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">نقل طالب</span>
                        <button
                            className="mx"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            <span
                                style={{
                                    width: 12,
                                    height: 12,
                                    display: "inline-flex",
                                }}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    <div className="mb">
                        {/* 💡 وصف.booking الحالي */}
                        <div style={{ padding: "0 10px", marginBottom: 12 }}>
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "var(--n600)",
                                    marginBottom: 4,
                                }}
                            >
                                حجز # {bookingId}
                            </p>
                            {currentBooking && (
                                <div
                                    style={{
                                        fontSize: "11px",
                                        backgroundColor: "var(--blue-50)",
                                        borderColor: "var(--blue-200)",
                                        borderRadius: 8,
                                        padding: "8px 10px",
                                        border: "1px solid",
                                        color: "var(--n700)",
                                    }}
                                >
                                    <p
                                        style={{
                                            margin: "2px 0",
                                        }}
                                    >
                                        <strong>الخطة الحالية:</strong>{" "}
                                        {currentBooking.plan_name}
                                    </p>
                                    <span
                                        style={{
                                            fontSize: "10.5px",
                                            backgroundColor:
                                                "var(--orange-100)",
                                            color: "var(--orange-800)",
                                            padding: "2px 6px",
                                            borderRadius: 12,
                                        }}
                                    >
                                        ⚠️ سيتم حذف جميع الجلسات القديمة وإنشاء
                                        جديدة
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 1. الخطة الجديدة */}
                        <div style={{ marginBottom: 13 }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "10.5px",
                                    fontWeight: 700,
                                    color: "var(--n700)",
                                    marginBottom: 4,
                                }}
                            >
                                1. الخطة الجديدة *
                            </label>
                            <select
                                name="new_plan_id"
                                value={formData.new_plan_id}
                                onChange={handleInputChange}
                                className={`fi2 ${
                                    errors.new_plan_id
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                                disabled={isSubmitting}
                            >
                                <option value="">اختر الخطة الجديدة</option>
                                {plansData.map((plan) => (
                                    <option
                                        key={plan.id}
                                        value={plan.id.toString()}
                                    >
                                        {plan.plan_name} ({plan.total_months}{" "}
                                        شهور)
                                        <span
                                            style={{
                                                fontSize: "9.5px",
                                                color: "var(--n500)",
                                            }}
                                        >
                                            {" "}
                                            ({plan.circle_count || 0} حلقة)
                                        </span>
                                    </option>
                                ))}
                            </select>
                            {errors.new_plan_id && (
                                <p
                                    style={{
                                        fontSize: "10.5px",
                                        color: "var(--red-600)",
                                        margin: "2px 0 0 0",
                                    }}
                                >
                                    {errors.new_plan_id}
                                </p>
                            )}
                            {plansData.length === 0 && !loadingData && (
                                <p
                                    style={{
                                        fontSize: "9.5px",
                                        color: "var(--n500)",
                                        margin: "2px 0 0 0",
                                        fontStyle: "italic",
                                    }}
                                >
                                    لا توجد خطط متاحة أخرى لهذا المجمع
                                </p>
                            )}
                        </div>

                        {/* 2. اختيار الحلقة */}
                        {formData.new_plan_id && (
                            <div style={{ marginBottom: 13 }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "10.5px",
                                        fontWeight: 700,
                                        color: "var(--n700)",
                                        marginBottom: 4,
                                    }}
                                >
                                    2. الحلقة المطلوبة *
                                </label>
                                <select
                                    name="new_circle_id"
                                    value={formData.new_circle_id || ""}
                                    onChange={handleInputChange}
                                    disabled={loadingCircles || isSubmitting}
                                    className={`fi2 ${
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
                                            <span
                                                style={{
                                                    fontSize: "9.5px",
                                                    color: "var(--n500)",
                                                }}
                                            >
                                                {" "}
                                                ({circle.schedule_count} موعد)
                                            </span>
                                        </option>
                                    ))}
                                </select>
                                {errors.new_circle_id && (
                                    <p
                                        style={{
                                            fontSize: "10.5px",
                                            color: "var(--red-600)",
                                            margin: "2px 0 0 0",
                                        }}
                                    >
                                        {errors.new_circle_id}
                                    </p>
                                )}
                                {circlesData.length === 0 &&
                                    !loadingCircles &&
                                    formData.new_plan_id && (
                                        <p
                                            style={{
                                                fontSize: "9.5px",
                                                color: "var(--n500)",
                                                margin: "2px 0 0 0",
                                                fontStyle: "italic",
                                            }}
                                        >
                                            لا توجد حلقات متاحة لهذه الخطة
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* 3. اختيار الموعد */}
                        {formData.new_circle_id && (
                            <div style={{ marginBottom: 13 }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "10.5px",
                                        fontWeight: 700,
                                        color: "var(--n700)",
                                        marginBottom: 4,
                                    }}
                                >
                                    3. الموعد المطلوب *
                                </label>
                                <select
                                    name="new_schedule_id"
                                    value={formData.new_schedule_id || ""}
                                    onChange={handleInputChange}
                                    disabled={loadingSchedules || isSubmitting}
                                    className={`fi2 ${
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
                                        const endTimeArabic = formatTimeArabic(
                                            schedule.time_range.split(" - ")[1],
                                        );
                                        return (
                                            <option
                                                key={schedule.id}
                                                value={schedule.id.toString()}
                                            >
                                                {schedule.circle_name} -{" "}
                                                <span
                                                    style={{
                                                        fontSize: "10px",
                                                    }}
                                                >
                                                    {startTimeArabic} -{" "}
                                                    {endTimeArabic}
                                                </span>
                                                {schedule.remaining_slots !==
                                                    null &&
                                                    schedule.remaining_slots >
                                                        0 && (
                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    "10px",
                                                                color: "var(--green-600)",
                                                            }}
                                                        >
                                                            {" "}
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
                                    <p
                                        style={{
                                            fontSize: "10.5px",
                                            color: "var(--red-600)",
                                            margin: "2px 0 0 0",
                                        }}
                                    >
                                        {errors.new_schedule_id}
                                    </p>
                                )}
                                {schedulesData.length === 0 &&
                                    !loadingSchedules &&
                                    formData.new_circle_id && (
                                        <p
                                            style={{
                                                fontSize: "9.5px",
                                                color: "var(--n500)",
                                                margin: "2px 0 0 0",
                                                fontStyle: "italic",
                                            }}
                                        >
                                            لا توجد مواعيد متاحة لهذه الحلقة
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* 4. Preview الموعد المختار */}
                        {selectedSchedule && (
                            <div
                                style={{
                                    border: "1px solid var(--blue-200)",
                                    borderRadius: 8,
                                    padding: 10,
                                    margin: "10px 0",
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: "12px",
                                        color: "var(--blue-700)",
                                        margin: "0 0 6px 0",
                                    }}
                                >
                                    الخطة + الحلقة + الموعد المختار
                                </h3>
                                <p
                                    style={{
                                        fontSize: "10.5px",
                                        color: "var(--n600)",
                                        margin: "0 0 8px 0",
                                    }}
                                >
                                    سيتم نقل الطالب لهذا الجدول بالضبط
                                </p>
                                <div
                                    style={{
                                        fontSize: "10px",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    <div style={{ margin: "2px 0" }}>
                                        <span style={{ marginRight: 4 }}>
                                            📋
                                        </span>
                                        <strong>الخطة:</strong>{" "}
                                        {plansData.find(
                                            (p) =>
                                                p.id.toString() ===
                                                formData.new_plan_id,
                                        )?.plan_name || "-"}
                                    </div>
                                    <div style={{ margin: "2px 0" }}>
                                        <span style={{ marginRight: 4 }}>
                                            🕌
                                        </span>
                                        <strong>الحلقة:</strong>{" "}
                                        {selectedSchedule.circle_name}
                                    </div>
                                    <div style={{ margin: "2px 0" }}>
                                        <span style={{ marginRight: 4 }}>
                                            🕒
                                        </span>
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
                                    </div>
                                    <div style={{ margin: "2px 0" }}>
                                        <span style={{ marginRight: 4 }}>
                                            👨‍🏫
                                        </span>
                                        <strong>المعلم:</strong>{" "}
                                        {selectedSchedule.teacher_name}
                                    </div>
                                    {selectedSchedule.remaining_slots !==
                                        null && (
                                        <div style={{ margin: "2px 0" }}>
                                            <span style={{ marginRight: 4 }}>
                                                ⚠️
                                            </span>
                                            <strong>الأماكن المتبقية: </strong>
                                            {selectedSchedule.remaining_slots}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mf">
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                justifyContent: "flex-end",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                className="btn bs"
                                onClick={onClose}
                                disabled={isSubmitting || loadingData}
                            >
                                إلغاء
                            </button>
                            <button
                                className="btn bp"
                                onClick={() =>
                                    submitForm((formDataInner) =>
                                        handleSubmit(
                                            new FormData(
                                                formDataInner.current,
                                            ) as any,
                                        ),
                                    )
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
                            >
                                {isSubmitting ? "جاري النقل..." : "نقل الطالب"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransferStudentModal;
