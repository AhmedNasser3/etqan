// models/TeachersAffairsUpdatePlatform.tsx
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useTeachersAffairsUpdatePlatform } from "../hooks/useTeachersAffairsUpdatePlatform";

interface TeachersAffairsUpdatePlatformProps {
    onClose: () => void;
    onSuccess: () => void;
    teacherId: number;
}

const TeachersAffairsUpdatePlatform: React.FC<
    TeachersAffairsUpdatePlatformProps
> = ({ onClose, onSuccess, teacherId }) => {
    const {
        formData,
        errors,
        isSubmitting,
        loadingData,
        fetchError,
        teacherData,
        handleInputChange,
        submitForm,
        loadTeacherData,
    } = useTeachersAffairsUpdatePlatform(teacherId);

    // ✅ تحميل البيانات تلقائياً عند تغيير teacherId
    useEffect(() => {
        if (teacherId > 0) {
            loadTeacherData();
        }
    }, [teacherId, loadTeacherData]);

    // ✅ حفظ البيانات
    const handleSave = async () => {
        const success = await submitForm();
        if (success) {
            onSuccess();
        }
    };

    // ✅ إغلاق المودال مع تأكيد
    const handleClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    // Loading State
    if (loadingData) {
        return (
            <div className="ParentModel">
                <div className="ParentModel__overlay">
                    <div className="ParentModel__content">
                        <div className="ParentModel__inner">
                            <div className="flex justify-center items-center h-64">
                                <div className="navbar">
                                    <div className="navbar__inner">
                                        <div className="navbar__loading">
                                            <div className="loading-spinner">
                                                <div className="spinner-circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (fetchError || (!teacherData && !loadingData)) {
        return (
            <div className="ParentModel">
                <div className="ParentModel__overlay">
                    <div className="ParentModel__content">
                        <div className="ParentModel__inner">
                            <div className="text-center p-8 space-y-4">
                                <div className="text-4xl text-red-500">❌</div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                    خطأ في تحميل بيانات المعلم
                                </h3>
                                <p className="text-gray-600">
                                    {fetchError?.toString() ||
                                        "المعلم غير موجود"}
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main Form
    return (
        <div className="ParentModel">
            <div className="ParentModel__overlay" onClick={handleClose}>
                <div
                    className="ParentModel__content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="ParentModel__inner">
                        {/* Header */}
                        <div className="ParentModel__header">
                            <button
                                className="ParentModel__close"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                title="إغلاق"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Title & Teacher Info */}
                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>تعديل بيانات المعلم - المنصة الكاملة</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل بيانات المعلم</h1>
                                <div className="space-y-1 mt-2">
                                    <p className="text-sm text-gray-700">
                                        البيانات الحالية محملة في الحقول أدناه
                                    </p>
                                    <span className="block text-sm text-green-600 font-medium">
                                        {teacherData?.name || formData.role}-{" "}
                                        {teacherData?.teacher_id || teacherId}
                                    </span>
                                    {teacherData?.center_name && (
                                        <span className="block text-sm text-indigo-600 font-medium">
                                            📍 {teacherData.center_name}
                                        </span>
                                    )}
                                    {teacherData?.center_id &&
                                        !teacherData.center_name && (
                                            <span className="block text-sm text-indigo-500">
                                                🆔 مجمع: {teacherData.center_id}
                                            </span>
                                        )}
                                    {teacherData?.role && (
                                        <span className="block text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                            👨‍🏫 {teacherData.role}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Container */}
                        <div className="ParentModel__container">
                            {/* الوظيفة - مطلوب */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="required">
                                        الوظيفة *
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.role
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={isSubmitting || loadingData}
                                    >
                                        <option value="">اختر الوظيفة</option>
                                        <option value="مدير">مدير</option>
                                        <option value="معلم">معلم</option>
                                        <option value="مشرف">مشرف</option>
                                        <option value="منسق">منسق</option>
                                        <option value="إداري">إداري</option>
                                    </select>
                                    {errors.role && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.role}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* معلومات إضافية - قراءة فقط */}
                            {teacherData && (
                                <>
                                    <div className="inputs__verifyOTPBirth">
                                        <div className="inputs__email">
                                            <label>رقم الهاتف</label>
                                            <input
                                                type="text"
                                                value={teacherData.phone || ""}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="inputs__verifyOTPBirth">
                                        <div className="inputs__email">
                                            <label>البريد الإلكتروني</label>
                                            <input
                                                type="email"
                                                value={teacherData.email || ""}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="inputs__verifyOTPBirth">
                                        <div className="inputs__email">
                                            <label>حالة الحضور</label>
                                            <input
                                                type="text"
                                                value={
                                                    teacherData.attendanceRate ||
                                                    ""
                                                }
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-green-50 text-green-800 font-medium"
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="inputs__verifyOTPBirth">
                                        <div className="inputs__email">
                                            <label>حالة الراتب</label>
                                            <input
                                                type="text"
                                                value={
                                                    teacherData.salaryStatus ||
                                                    ""
                                                }
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-blue-50 text-blue-800 font-medium"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* الملاحظات */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="أي ملاحظات إضافية حول المعلم..."
                                        disabled={isSubmitting || loadingData}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSubmitting || loadingData}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 space-x-reverse"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>جاري الحفظ...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>حفظ التغييرات</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Cancel Button */}
                            {!isSubmitting && (
                                <div className="inputs__submitBtn">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeachersAffairsUpdatePlatform;
