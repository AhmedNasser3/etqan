import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { useCircleFormUpdate } from "../hooks/useCircleFormUpdate";

interface UpdateCirclePageProps {
    onClose: () => void;
    onSuccess: () => void;
    circleId: number;
}

const UpdateCirclePage: React.FC<UpdateCirclePageProps> = ({
    onClose,
    onSuccess,
    circleId,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        centersData,
        loadingData,
        getCurrentCenterMosques,
        getCurrentCenterTeachers,
        user,
        loadCircleData,
    } = useCircleFormUpdate(circleId);

    useEffect(() => {
        loadCircleData(); // يحمل بيانات الحلقة الأصلية تلقائياً
    }, [loadCircleData]);

    const handleSubmit = async (formDataSubmit: FormData) => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(
                `/api/v1/centers/circles/${circleId}`,
                {
                    method: "POST", // أو "PUT" حسب API
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
                console.error("Update error response:", errorData);

                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(errorMessages[0] || "حدث خطأ في التعديل");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("Update response:", result);

            toast.success("تم تعديل الحلقة بنجاح! ✅");
            onSuccess();
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error(error.message || "حدث خطأ في التعديل");
        }
    };

    const currentMosques = getCurrentCenterMosques(formData.center_id);
    const currentTeachers = getCurrentCenterTeachers(formData.center_id);
    const currentCenter = centersData.find(
        (c) => c.id.toString() === formData.center_id,
    );
    const isCenterOwner = user?.role?.id === 1;
    const showSingleCenter = centersData.length === 1 && isCenterOwner;

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
                                <p>تعديل حلقة</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل الحلقة</h1>
                                <p>
                                    البيانات الحالية محملة في الحقول أدناه
                                    {loadingData && (
                                        <span className="block text-sm text-blue-600 mt-1">
                                            جاري تحميل البيانات...
                                        </span>
                                    )}
                                    {showSingleCenter && (
                                        <span className="block text-sm text-green-600 mt-1">
                                            مجمعك: {centersData[0]?.name}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* اسم الحلقة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>اسم الحلقة *</label>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.name
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="اسم الحلقة الحالي"
                                        disabled={isSubmitting || loadingData}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* المجمع */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المجمع التابع له *</label>
                                    <select
                                        required
                                        name="center_id"
                                        value={
                                            formData.center_id?.toString() || ""
                                        }
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.center_id || loadingData
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
                                                ? "جاري التحميل..."
                                                : centersData.length === 0
                                                  ? "لا توجد مجمعات"
                                                  : showSingleCenter
                                                    ? centersData[0].name
                                                    : "المجمع الحالي"}
                                        </option>
                                        {centersData.map((center) => (
                                            <option
                                                key={center.id}
                                                value={center.id.toString()}
                                            >
                                                {center.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.center_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.center_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* المسجد */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المسجد (اختياري)</label>
                                    <select
                                        name="mosque_id"
                                        value={
                                            formData.mosque_id?.toString() || ""
                                        }
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.mosque_id ||
                                            loadingData ||
                                            !currentCenter
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            !currentCenter
                                        }
                                    >
                                        <option value="">
                                            {loadingData
                                                ? "جاري التحميل..."
                                                : !currentCenter
                                                  ? "اختر المجمع أولاً"
                                                  : currentMosques.length === 0
                                                    ? "لا توجد مساجد"
                                                    : formData.mosque_id
                                                      ? "المسجد الحالي"
                                                      : "اختر المسجد (اختياري)"}
                                        </option>
                                        {currentMosques.map((mosque) => (
                                            <option
                                                key={mosque.id}
                                                value={mosque.id.toString()}
                                            >
                                                {mosque.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.mosque_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.mosque_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* المعلم */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المعلم (اختياري)</label>
                                    <select
                                        name="teacher_id"
                                        value={
                                            formData.teacher_id?.toString() ||
                                            ""
                                        }
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.teacher_id ||
                                            loadingData ||
                                            !currentCenter
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={
                                            isSubmitting ||
                                            loadingData ||
                                            !currentCenter
                                        }
                                    >
                                        <option value="">
                                            {loadingData
                                                ? "جاري التحميل..."
                                                : !currentCenter
                                                  ? "اختر المجمع أولاً"
                                                  : currentTeachers.length === 0
                                                    ? "لا يوجد معلمين"
                                                    : formData.teacher_id
                                                      ? "المعلم الحالي"
                                                      : "اختر المعلم (اختياري)"}
                                        </option>
                                        {currentTeachers.map((teacher) => (
                                            <option
                                                key={teacher.id}
                                                value={teacher.id.toString()}
                                            >
                                                {teacher.user?.name ||
                                                    teacher.name}{" "}
                                                - {teacher.role}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.teacher_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.teacher_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الملاحظات */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="الملاحظات الحالية..."
                                        disabled={isSubmitting || loadingData}
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
                                    onClick={() =>
                                        submitForm(handleSubmit as any)
                                    }
                                    disabled={isSubmitting || loadingData}
                                    className="w-full"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري التعديل...
                                        </>
                                    ) : (
                                        <>تعديل الحلقة</>
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

export default UpdateCirclePage;
