// modals/CreateAchievementModal.tsx
import React from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAchievementFormCreate } from "../hooks/useAchievementFormCreate";

interface CreateAchievementModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateAchievementModal: React.FC<CreateAchievementModalProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        loadingData,
        usersData,
        achievementKey,
        achievementValue,
        handleInputChange,
        addAchievement,
        removeAchievement,
        setAchievementKey,
        setAchievementValue,
        submitForm,
        user,
    } = useAchievementFormCreate();

    const handleSubmit = async (formDataSubmit: any) => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch("/api/v1/achievements", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    user_id: parseInt(formDataSubmit.user_id),
                    points: parseInt(formDataSubmit.points),
                    points_action: formDataSubmit.points_action,
                    reason: formDataSubmit.reason,
                    achievement_type:
                        formDataSubmit.achievement_type || undefined,
                    achievements: formDataSubmit.achievements,
                }),
            });

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                console.error("Error response:", errorData);

                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(errorMessages[0] || "حدث خطأ في الإضافة");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("Create response:", result);
            toast.success("تم إضافة الإنجاز بنجاح!");
            onSuccess();
        } catch (error: any) {
            console.error("Create error:", error);
            toast.error(error.message || "حدث خطأ في الإضافة");
        }
    };

    const handleClose = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onClose();
    };

    return (
        <div className="ParentModel">
            <div className="ParentModel__overlay" onClick={handleClose}>
                <div
                    className="ParentModel__content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="ParentModel__inner">
                        <div className="ParentModel__header">
                            <button
                                className="ParentModel__close"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>إنجاز جديد</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>إضافة إنجاز جديد</h1>
                                <p>
                                    يرجى إدخال بيانات الإنجاز بشكل صحيح
                                    {loadingData && (
                                        <span className="block text-sm text-blue-600 mt-1">
                                            جاري تحميل الطلاب...
                                        </span>
                                    )}
                                    {user?.center_id && (
                                        <span className="block text-sm text-green-600 mt-1">
                                            مجمعك:{" "}
                                            {user.center?.name ||
                                                `ID: ${user.center_id}`}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* الطالب */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الطالب *</label>
                                    <select
                                        required
                                        name="user_id"
                                        value={formData.user_id}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.user_id || loadingData
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={isSubmitting || loadingData}
                                    >
                                        <option value="">
                                            {loadingData
                                                ? "جاري التحميل..."
                                                : usersData.length === 0
                                                  ? "لا يوجد طلاب"
                                                  : "اختر الطالب"}
                                        </option>
                                        {usersData.map((userItem) => (
                                            <option
                                                key={userItem.id}
                                                value={userItem.id}
                                            >
                                                {userItem.name} -{" "}
                                                {userItem.email}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.user_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* النقاط + النوع */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>النقاط *</label>
                                        <input
                                            required
                                            type="number"
                                            name="points"
                                            value={formData.points}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                                errors.points
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            placeholder="50"
                                            min="-1000"
                                            max="1000"
                                            disabled={isSubmitting}
                                        />
                                        {errors.points && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.points}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="inputs__verifyOTPBirth">
                                    <div className="inputs__email">
                                        <label>نوع العملية *</label>
                                        <select
                                            required
                                            name="points_action"
                                            value={formData.points_action}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            disabled={isSubmitting}
                                        >
                                            <option value="added">إضافة</option>
                                            <option value="deducted">
                                                خصم
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* السبب */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>السبب *</label>
                                    <textarea
                                        required
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical ${
                                            errors.reason
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="سبب إضافة/خصم النقاط..."
                                        disabled={isSubmitting}
                                    />
                                    {errors.reason && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.reason}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* نوع الإنجاز */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>نوع الإنجاز (اختياري)</label>
                                    <input
                                        type="text"
                                        name="achievement_type"
                                        value={formData.achievement_type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="طالب الشهر، حضور ممتاز..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* الإنجازات الديناميكية */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>إنجازات إضافية</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                                        <input
                                            type="text"
                                            value={achievementKey}
                                            onChange={(e) =>
                                                setAchievementKey(
                                                    e.target.value,
                                                )
                                            }
                                            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            placeholder="مفتاح (طالب_الشهر)"
                                            disabled={isSubmitting}
                                        />
                                        <input
                                            type="text"
                                            value={achievementValue}
                                            onChange={(e) =>
                                                setAchievementValue(
                                                    e.target.value,
                                                )
                                            }
                                            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                            placeholder="القيمة (فبراير 2026)"
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            onClick={addAchievement}
                                            className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-all disabled:opacity-50"
                                            disabled={
                                                !achievementKey.trim() ||
                                                !achievementValue.trim() ||
                                                isSubmitting
                                            }
                                        >
                                            إضافة
                                        </button>
                                    </div>

                                    {Object.keys(formData.achievements).length >
                                        0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                الإنجازات المضافة:
                                            </p>
                                            {Object.entries(
                                                formData.achievements,
                                            ).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="flex items-center justify-between p-3 bg-blue-50 border rounded-xl"
                                                >
                                                    <span className="text-sm">
                                                        <strong>{key}:</strong>{" "}
                                                        {String(value)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeAchievement(
                                                                key,
                                                            )
                                                        }
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded"
                                                        disabled={isSubmitting}
                                                    >
                                                        حذف
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                    disabled={isSubmitting || loadingData}
                                    className="w-full"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري الإضافة...
                                        </>
                                    ) : (
                                        <>إضافة الإنجاز الجديد</>
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

export default CreateAchievementModal;
