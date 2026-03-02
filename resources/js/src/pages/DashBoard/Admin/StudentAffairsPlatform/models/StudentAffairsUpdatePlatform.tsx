// pages/StudentAffairsUpdatePlatform.tsx - ✅ مُصحح كامل مع اسم المجمع
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useStudentAffairsUpdatePlatform } from "../hooks/useStudentAffairsUpdatePlatform";

interface StudentAffairsUpdatePlatformProps {
    onClose: () => void;
    onSuccess: () => void;
    studentId: number;
}

const StudentAffairsUpdatePlatform: React.FC<
    StudentAffairsUpdatePlatformProps
> = ({ onClose, onSuccess, studentId }) => {
    const {
        formData,
        errors,
        isSubmitting,
        loadingData,
        fetchError,
        studentData,
        grades,
        handleInputChange,
        submitForm,
        loadStudentData,
    } = useStudentAffairsUpdatePlatform(studentId);

    // ✅ تحميل البيانات تلقائياً عند تغيير studentId
    useEffect(() => {
        if (studentId > 0) {
            loadStudentData();
        }
    }, [studentId, loadStudentData]);

    // ✅ حفظ البيانات
    const handleSave = async () => {
        const success = await submitForm();
        if (success) {
            toast.success("تم حفظ التغييرات بنجاح!");
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
    if (fetchError || (!studentData && !loadingData)) {
        return (
            <div className="ParentModel">
                <div className="ParentModel__overlay">
                    <div className="ParentModel__content">
                        <div className="ParentModel__inner">
                            <div className="text-center p-8 space-y-4">
                                <div className="text-4xl text-red-500">❌</div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                    خطأ في تحميل بيانات الطالب
                                </h3>
                                <p className="text-gray-600">
                                    {fetchError?.message || "الطالب غير موجود"}
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

                        {/* Title & Student Info */}
                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>تعديل بيانات الطالب - المنصة الكاملة</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل بيانات الطالب</h1>
                                <div className="space-y-1 mt-2">
                                    <p className="text-sm text-gray-700">
                                        البيانات الحالية محملة في الحقول أدناه
                                    </p>
                                    <span className="block text-sm text-green-600 font-medium">
                                        {studentData?.name ||
                                            formData.id_number}
                                        -{" "}
                                        {studentData?.idNumber ||
                                            formData.id_number}
                                    </span>
                                    {studentData?.center_name && (
                                        <span className="block text-sm text-indigo-600 font-medium">
                                            📍 {studentData.center_name}
                                        </span>
                                    )}
                                    {studentData?.center_id &&
                                        !studentData.center_name && (
                                            <span className="block text-sm text-indigo-500">
                                                🆔 مجمع: {studentData.center_id}
                                            </span>
                                        )}
                                </div>
                            </div>
                        </div>

                        {/* Form Container */}
                        <div className="ParentModel__container">
                            {/* رقم الهوية */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="required">
                                        رقم الهوية *
                                    </label>
                                    <input
                                        type="text"
                                        name="id_number"
                                        value={formData.id_number || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.id_number
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="أدخل رقم الهوية"
                                        disabled={isSubmitting || loadingData}
                                    />
                                    {errors.id_number && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.id_number}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الصف */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="required">الصف *</label>
                                    <select
                                        name="grade_level"
                                        value={formData.grade_level || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.grade_level
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        disabled={isSubmitting || loadingData}
                                    >
                                        <option value="">اختر الصف</option>
                                        {grades.map((grade) => (
                                            <option key={grade} value={grade}>
                                                {grade}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.grade_level && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.grade_level}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الحلقة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الحلقة</label>
                                    <input
                                        type="text"
                                        name="circle"
                                        value={formData.circle || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="مثال: الحلقة الأولى"
                                        disabled={isSubmitting || loadingData}
                                    />
                                </div>
                            </div>

                            {/* الحالة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الحالة</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        disabled={isSubmitting || loadingData}
                                    >
                                        <option value="نشط">نشط</option>
                                        <option value="معلق">معلق</option>
                                        <option value="موقوف">موقوف</option>
                                    </select>
                                </div>
                            </div>

                            {/* الحالة الصحية */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الحالة الصحية</label>
                                    <input
                                        type="text"
                                        name="health_status"
                                        value={formData.health_status || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="سليم / مريض / إعاقة..."
                                        disabled={isSubmitting || loadingData}
                                    />
                                </div>
                            </div>

                            {/* مستوى القراءة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>مستوى القراءة</label>
                                    <input
                                        type="text"
                                        name="reading_level"
                                        value={formData.reading_level || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="جزء ثالث / نص جزء..."
                                        disabled={isSubmitting || loadingData}
                                    />
                                </div>
                            </div>

                            {/* وقت الحصة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>وقت الحصة</label>
                                    <input
                                        type="text"
                                        name="session_time"
                                        value={formData.session_time || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="عصر / مغرب / ليل"
                                        disabled={isSubmitting || loadingData}
                                    />
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
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="أي ملاحظات إضافية حول الطالب..."
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

export default StudentAffairsUpdatePlatform;
