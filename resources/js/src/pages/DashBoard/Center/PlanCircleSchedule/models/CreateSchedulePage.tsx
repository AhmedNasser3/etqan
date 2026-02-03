// CreateSchedulePage.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { useAuthUser } from "../../../../../layouts/hooks/useAuthUser";
import { useScheduleFormCreate } from "../hooks/useScheduleFormCreate";

interface CreateSchedulePageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateSchedulePage: React.FC<CreateSchedulePageProps> = ({
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
    } = useScheduleFormCreate();

    // 🔍 Debug Console - تشوف كل حاجة
    useEffect(() => {
        console.log("📊 PAGE DEBUG:", {
            user: user?.center_id,
            plans: plansData.length,
            circles: circlesData.length,
            teachers: teachersData.length,
            loading: loadingData,
            formData,
        });
    }, [user, plansData, circlesData, teachersData, loadingData, formData]);

    const handleSubmit = async (formDataSubmit: FormData) => {
        console.log(
            "🚀 [PAGE SUBMIT] FormData:",
            Object.fromEntries(formDataSubmit),
        );

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch("/api/v1/plans/schedules", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: formDataSubmit,
            });

            console.log("📡 [SUBMIT] Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ [SUBMIT ERROR] Full response:", errorText);

                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.errors) {
                        // Laravel validation errors
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
                    // Non-JSON error
                    toast.error(
                        `خطأ ${response.status}: ${errorText.slice(0, 100)}`,
                    );
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("✅ [SUBMIT SUCCESS] Response:", result);
            toast.success("✅ تم إضافة الموعد بنجاح!");
            onSuccess();
        } catch (error: any) {
            console.error("💥 [SUBMIT FAILED] Error:", error);
            toast.error(error.message || "حدث خطأ غير متوقع");
        }
    };

    const isCenterOwner = user?.role?.id === 1;
    const showSingleCenter = plansData.length === 1 && isCenterOwner;
    const currentPlan = plansData.find(
        (p) => p.id.toString() === formData.plan_id,
    );

    // 🔍 Loading states
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
                                <p>موعد حلقة جديد</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>إضافة موعد حلقة جديد</h1>
                                <p>
                                    يرجى إدخال بيانات الموعد بشكل صحيح
                                    {loadingData && (
                                        <span className="block text-sm text-blue-600 mt-1">
                                            🔄 جاري تحميل البيانات...
                                        </span>
                                    )}
                                    {showSingleCenter && (
                                        <span className="block text-sm text-green-600 mt-1">
                                            ✅ خطتك:{" "}
                                            {plansData[0]?.plan_name ||
                                                plansData[0]?.name}
                                        </span>
                                    )}
                                    {!loadingData && !hasPlans && (
                                        <span className="block text-sm text-orange-600 mt-1">
                                            ⚠️ لا توجد خطط متاحة لمركزك
                                        </span>
                                    )}
                                    {!loadingData &&
                                        hasPlans &&
                                        !hasCircles && (
                                            <span className="block text-sm text-orange-600 mt-1">
                                                ⚠️ لا توجد حلقات متاحة
                                            </span>
                                        )}
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* خطة */}
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

                            {/* حلقة */}
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

                            {/* مدرس */}
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

                            {/* تاريخ */}
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

                            {/* وقت البداية والنهاية */}
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

                            {/* عدد الطلاب */}
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

                            {/* ملاحظات */}
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

                            {/* زر الإرسال */}
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
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري الإضافة...
                                        </>
                                    ) : (
                                        <>إضافة الموعد الجديد</>
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

export default CreateSchedulePage;
