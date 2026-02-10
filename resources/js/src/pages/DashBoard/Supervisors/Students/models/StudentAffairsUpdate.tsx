// pages/student-affairs-update.tsx - ✅ مُصحح كامل
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useStudentAffairsUpdate } from "../hooks/useStudentAffairsUpdate";

interface StudentAffairsUpdateProps {
    onClose: () => void;
    onSuccess: () => void;
    studentId: number;
}

const StudentAffairsUpdate: React.FC<StudentAffairsUpdateProps> = ({
    onClose,
    onSuccess,
    studentId,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        loadingData,
        studentData,
        grades,
        handleInputChange,
        submitForm, // ✅ استخدم submitForm من الـ hook
        loadStudentData,
    } = useStudentAffairsUpdate(studentId);

    // ✅ تحميل البيانات تلقائياً (مش محتاج useEffect)
    useEffect(() => {
        loadStudentData();
    }, [studentId, loadStudentData]);

    // ✅ استخدم submitForm من الـ hook مباشرة
    const handleSave = async () => {
        const success = await submitForm();
        if (success) {
            onSuccess(); // ✅ إغلاق الـ Modal بعد النجاح
        }
    };

    if (loadingData) {
        return (
            <div className="ParentModel">
                <div className="ParentModel__overlay">
                    <div className="ParentModel__content">
                        <div className="ParentModel__inner">
                            <div className="flex justify-center items-center h-64">
                                جاري تحميل بيانات الطالب...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!studentData && !loadingData) {
        return (
            <div className="ParentModel">
                <div className="ParentModel__overlay">
                    <div className="ParentModel__content">
                        <div className="ParentModel__inner">
                            <div className="text-center p-8">
                                الطالب غير موجود
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
                                <p>تعديل بيانات الطالب</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل بيانات الطالب</h1>
                                <p>
                                    البيانات الحالية محملة في الحقول أدناه
                                    {loadingData && (
                                        <span className="block text-sm text-blue-600 mt-1">
                                            جاري تحميل البيانات...
                                        </span>
                                    )}
                                    <span className="block text-sm text-green-600 mt-1">
                                        {studentData?.name ||
                                            formData.id_number}{" "}
                                        -{" "}
                                        {studentData?.idNumber ||
                                            formData.id_number}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* رقم الهوية */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>رقم الهوية *</label>
                                    <input
                                        required
                                        type="text"
                                        name="id_number"
                                        value={formData.id_number || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.id_number
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="رقم الهوية الحالي"
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
                                    <label>الصف *</label>
                                    <select
                                        required
                                        name="grade_level"
                                        value={formData.grade_level || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.grade_level || loadingData
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
                                    <label>الحلقة *</label>
                                    <input
                                        required
                                        type="text"
                                        name="circle"
                                        value={formData.circle || ""}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                            errors.circle
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="الحلقة الحالية"
                                        disabled={isSubmitting || loadingData}
                                    />
                                    {errors.circle && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.circle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الحالة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الحالة</label>
                                    <select
                                        name="status"
                                        value={formData.status || "نشط"}
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
                                        placeholder="سليم / مريض..."
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
                                        placeholder="نص جزء ثالث..."
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
                                        placeholder="عصر / مغرب..."
                                        disabled={isSubmitting || loadingData}
                                    />
                                </div>
                            </div>

                            {/* نسبة الحضور */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>نسبة الحضور %</label>
                                    <input
                                        type="number"
                                        name="attendance_rate"
                                        value={formData.attendance_rate || ""}
                                        onChange={handleInputChange}
                                        min={0}
                                        max={100}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="95"
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
                                        placeholder="أي ملاحظات إضافية..."
                                        disabled={isSubmitting || loadingData}
                                    />
                                </div>
                            </div>

                            {/* زر الإرسال - ✅ مُصحح */}
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button
                                    type="button"
                                    onClick={handleSave} // ✅ استخدم handleSave الجديد
                                    disabled={isSubmitting || loadingData}
                                    className="w-full"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                                            جاري حفظ التغييرات...
                                        </>
                                    ) : (
                                        <>حفظ التغييرات</>
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

export default StudentAffairsUpdate;
