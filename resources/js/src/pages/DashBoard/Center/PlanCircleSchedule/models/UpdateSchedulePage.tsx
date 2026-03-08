// UpdateSchedulePage.tsx - كامل بكل التفاصيل مع Jitsi support
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX, FiRefreshCw } from "react-icons/fi";
import { useScheduleFormUpdate } from "../hooks/useScheduleFormUpdate";
import { FormData as FormDataType } from "../hooks/useScheduleFormUpdate";

interface UpdateSchedulePageProps {
    scheduleId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateSchedulePage: React.FC<UpdateSchedulePageProps> = ({
    scheduleId,
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        plansData,
        circlesData,
        teachersData,
        loadingData,
        user,
        currentSchedule,
        regenerateJitsiRoom, //  جديد
        jitsiRoomName, //  جديد
    } = useScheduleFormUpdate({ scheduleId });

    // 🔍 Debug Console مع Jitsi
    useEffect(() => {
        console.log("📊 [UPDATE PAGE] DEBUG مع Jitsi:", {
            scheduleId,
            user: user?.center_id,
            plans: plansData.length,
            circles: circlesData.length,
            teachers: teachersData.length,
            loading: loadingData,
            currentSchedule: currentSchedule?.id,
            jitsiRoom: jitsiRoomName,
            formData,
        });
    }, [
        scheduleId,
        user,
        plansData,
        circlesData,
        teachersData,
        loadingData,
        currentSchedule,
        formData,
        jitsiRoomName,
    ]);

    const handleSubmit = async (formDataSubmit: FormDataType) => {
        console.log(
            "🚀 [UPDATE PAGE SUBMIT] FormData مع Jitsi:",
            Object.fromEntries(formDataSubmit),
        );

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(
                `/api/v1/plans/schedules/${scheduleId}`,
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

            console.log("📡 [UPDATE SUBMIT] Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ [UPDATE ERROR] Full response:", errorText);

                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.errors) {
                        const errorMessages = Object.values(
                            errorData.errors,
                        ).flat();
                        toast.error(errorMessages[0] || "خطأ في البيانات");
                        return;
                    }
                    if (errorData.message) {
                        toast.error(errorData.message);
                        return;
                    }
                } catch (e) {
                    toast.error(
                        `خطأ ${response.status}: ${errorText.slice(0, 100)}`,
                    );
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log(" [UPDATE SUCCESS] Response مع Jitsi:", result);
            toast.success(" تم تحديث الموعد بنجاح!");
            onSuccess();
        } catch (error: any) {
            console.error("💥 [UPDATE FAILED] Error:", error);
            toast.error(error.message || "حدث خطأ غير متوقع");
        }
    };

    const isCenterOwner = user?.role?.id === 1;
    const showSingleCenter = plansData.length === 1 && isCenterOwner;
    const currentPlan = plansData.find(
        (p) => p.id.toString() === formData.plan_id,
    );

    const hasPlans = plansData.length > 0;
    const hasCircles = circlesData.length > 0;
    const hasTeachers = teachersData.length > 0;

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
                                <p>تعديل موعد حلقة</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تحديث موعد الحلقة</h1>
                                <p>
                                    يرجى تعديل بيانات الموعد حسب الحاجة
                                    {loadingData && (
                                        <span className="block text-sm text-blue-600 mt-1">
                                            جاري تحميل بيانات الموعد...
                                        </span>
                                    )}
                                    {currentSchedule && (
                                        <span className="block text-sm text-green-600 mt-1">
                                            الموعد الحالي:{" "}
                                            {currentSchedule.plan?.plan_name ||
                                                "غير محدد"}
                                        </span>
                                    )}
                                    {!loadingData && !hasPlans && (
                                        <span className="block text-sm text-orange-600 mt-1">
                                            ⚠️ لا توجد خطط متاحة لمركزك
                                        </span>
                                    )}
                                    {jitsiRoomName && (
                                        <span className="block text-sm text-purple-600 mt-1">
                                            غرفة Jitsi الحالية:{" "}
                                            <strong>{jitsiRoomName}</strong>
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/*  1. الخطة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الخطة *</label>
                                    <select
                                        required
                                        name="plan_id"
                                        value={formData.plan_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.plan_id ||
                                            loadingData ||
                                            !hasPlans
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            showSingleCenter
                                        }
                                    >
                                        <option value="">
                                            {loadingData
                                                ? "⏳ جاري التحميل..."
                                                : !hasPlans
                                                  ? "🚫 لا توجد خطط"
                                                  : showSingleCenter
                                                    ? plansData[0].plan_name ||
                                                      plansData[0].name
                                                    : "اختر الخطة"}
                                        </option>
                                        {plansData.map((plan) => (
                                            <option
                                                key={plan.id}
                                                value={plan.id}
                                            >
                                                {plan.plan_name || plan.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.plan_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.plan_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/*  2. الحلقة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الحلقة *</label>
                                    <select
                                        required
                                        name="circle_id"
                                        value={formData.circle_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.circle_id ||
                                            loadingData ||
                                            !hasCircles
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            !hasPlans
                                        }
                                    >
                                        <option value="">
                                            {loadingData
                                                ? "⏳ جاري التحميل..."
                                                : !hasCircles
                                                  ? "🚫 لا توجد حلقات"
                                                  : "اختر الحلقة"}
                                        </option>
                                        {circlesData.map((circle) => (
                                            <option
                                                key={circle.id}
                                                value={circle.id}
                                            >
                                                {circle.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.circle_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.circle_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/*  3. المدرس (اختياري) */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المدرس (اختياري)</label>
                                    <select
                                        name="teacher_id"
                                        value={formData.teacher_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            !hasPlans
                                        }
                                    >
                                        <option value="">بدون مدرس</option>
                                        {teachersData.map((teacher) => (
                                            <option
                                                key={teacher.id}
                                                value={teacher.id}
                                            >
                                                {teacher.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/*  4. تاريخ الموعد */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>تاريخ الموعد *</label>
                                    <input
                                        required
                                        type="date"
                                        name="schedule_date"
                                        value={formData.schedule_date}
                                        onChange={handleInputChange}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.schedule_date
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            !hasPlans
                                        }
                                    />
                                    {errors.schedule_date && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.schedule_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/*  5. وقت البداية والنهاية */}
                            <div
                                className="inputs__verifyOTPBirth"
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "1rem",
                                }}
                            >
                                <div className="inputs__email">
                                    <label>وقت البداية *</label>
                                    <input
                                        required
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.start_time
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            !hasPlans
                                        }
                                    />
                                    {errors.start_time && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.start_time}
                                        </p>
                                    )}
                                </div>
                                <div className="inputs__email">
                                    <label>وقت النهاية *</label>
                                    <input
                                        required
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.end_time
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            !hasPlans
                                        }
                                    />
                                    {errors.end_time && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.end_time}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/*  6. العدد الأقصى للطلاب */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>العدد الأقصى للطلاب (اختياري)</label>
                                    <input
                                        type="number"
                                        name="max_students"
                                        value={formData.max_students}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="50"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="اتركه فارغ لعدد غير محدود"
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            !hasPlans
                                        }
                                    />
                                </div>
                            </div>

                            {/*  7. الملاحظات */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات (اختياري)</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="مثال: موعد مكثف - 10 طلاب كحد أقصى"
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            !hasPlans
                                        }
                                    />
                                </div>
                            </div>

                            {/* 🔥 8. خانة Jitsi Room - الجديدة  */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>غرفة Jitsi Meet</label>
                                    <div className="flex gap-2 mb-2">
                                        {/* عرض الرابط الحالي */}
                                        {jitsiRoomName && (
                                            <a
                                                href={`https://meet.jit.si/${jitsiRoomName}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-purple-50 border border-purple-200 text-purple-800 px-4 py-2 rounded-xl text-sm hover:bg-purple-100 transition-all flex items-center justify-between"
                                            >
                                                <span>
                                                    🔗 انقر للانضمام للغرفة
                                                </span>
                                                <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                                                    {jitsiRoomName}
                                                </span>
                                            </a>
                                        )}
                                        {/* زر إعادة التوليد */}
                                        <button
                                            type="button"
                                            onClick={regenerateJitsiRoom}
                                            disabled={
                                                isSubmitting || loadingData
                                            }
                                            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 transition-all whitespace-nowrap"
                                            title="إنشاء غرفة Jitsi جديدة"
                                        >
                                            <FiRefreshCw
                                                size={16}
                                                className="animate-spin"
                                            />
                                            رابط جديد
                                        </button>
                                    </div>
                                    {/* Input التعديل اليدوي */}
                                    <input
                                        type="text"
                                        name="jitsi_room_name"
                                        value={formData.jitsi_room_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-purple-50 hover:border-purple-300"
                                        placeholder="abc123xyz - سيتم استخدامها في https://meet.jit.si/[اسم الغرفة]"
                                        disabled={isSubmitting || loadingData}
                                    />
                                    <p className="mt-1 text-xs text-purple-600">
                                        يمكنك تعديل اسم الغرفة يدوياً أو إنشاء
                                        رابط جديد بالضغط على الزر
                                    </p>
                                </div>
                            </div>

                            {/*  9. زر الإرسال */}
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button
                                    type="button"
                                    onClick={() => submitForm(handleSubmit)}
                                    disabled={
                                        isSubmitting ||
                                        loadingData ||
                                        !hasPlans ||
                                        !formData.plan_id ||
                                        !formData.circle_id
                                    }
                                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري التحديث...
                                        </>
                                    ) : (
                                        <>تحديث الموعد 🎥</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateSchedulePage;
