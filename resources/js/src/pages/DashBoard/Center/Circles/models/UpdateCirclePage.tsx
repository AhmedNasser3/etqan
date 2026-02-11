import { useEffect } from "react";
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
        isLoadingCircle,
        handleInputChange,
        submitForm,
        centersData,
        mosquesData,
        teachersData,
        loadingData,
        user,
        circleData,
    } = useCircleFormUpdate(circleId);

    const handleSubmit = async (formDataSubmit: FormData) => {
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(
                `/api/v1/centers/circles/${circleId}`,
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
                    toast.error(errorMessages[0] || "حدث خطأ في التعديل");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            toast.success("تم تعديل الحلقة بنجاح! ✅");
            onSuccess();
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error(error.message || "حدث خطأ في التعديل");
        }
    };

    const currentCenter = centersData.find(
        (c) => c.id.toString() === formData.center_id,
    );
    const isCenterOwner = user?.role?.id === 1;
    const showSingleCenter = centersData.length === 1 && isCenterOwner;

    const isLoading = loadingData || isLoadingCircle;

    if (isLoading) {
        return (
            <div className="ParentModel">
                <div className="ParentModel__overlay">
                    <div className="ParentModel__content">
                        <div className="flex items-center justify-center min-h-[400px] p-8">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-lg text-gray-600">
                                    جاري تحميل بيانات الحلقة...
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
                                <p>تعديل حلقة</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل الحلقة</h1>
                                <p className="flex items-center gap-2 flex-wrap">
                                    البيانات الحالية محملة في الحقول أدناه
                                    {showSingleCenter && (
                                        <span className="font-semibold text-green-600">
                                            مجمعك: {centersData[0]?.name}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
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
                                        disabled={isSubmitting}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المجمع:</label>
                                    <input
                                        type="text"
                                        value={
                                            currentCenter?.name ||
                                            user?.center?.name ||
                                            "جاري التحميل..."
                                        }
                                        className="w-full px-4 py-3 border border-green-200 bg-green-50 rounded-xl text-green-800 font-medium"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المسجد (اختياري)</label>
                                    <select
                                        name="mosque_id"
                                        value={formData.mosque_id || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.mosque_id
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">
                                            اختر المسجد (اختياري)
                                        </option>
                                        {mosquesData.length === 0 ? (
                                            <option disabled>
                                                لا توجد مساجد
                                            </option>
                                        ) : (
                                            mosquesData.map((mosque) => (
                                                <option
                                                    key={mosque.id}
                                                    value={mosque.id.toString()}
                                                >
                                                    {mosque.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {errors.mosque_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.mosque_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>المعلم (اختياري)</label>
                                    <select
                                        name="teacher_id"
                                        value={formData.teacher_id || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.teacher_id
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">
                                            اختر المعلم (اختياري)
                                        </option>
                                        {teachersData.length === 0 ? (
                                            <option disabled>
                                                لا يوجد معلمين
                                            </option>
                                        ) : (
                                            teachersData.map((teacher) => (
                                                <option
                                                    key={teacher.id}
                                                    value={teacher.id.toString()}
                                                >
                                                    {teacher.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {errors.teacher_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.teacher_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="أي ملاحظات إضافية..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

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
