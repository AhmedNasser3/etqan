// StudentAffairsUpdatePlatform.tsx - نفس تصميم UpdateSalaryRuleModal
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

    // تحميل البيانات تلقائياً عند تغيير studentId
    useEffect(() => {
        if (studentId > 0) {
            loadStudentData();
        }
    }, [studentId, loadStudentData]);

    // حفظ البيانات
    const handleSave = async () => {
        const success = await submitForm();
        if (success) {
            toast.success("تم حفظ التغييرات بنجاح!");
            onSuccess();
        }
    };

    // إغلاق المودال مع تأكيد
    const handleClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    // Error State
    if (fetchError || (!studentData && !loadingData)) {
        return (
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">خطأ في تحميل بيانات الطالب</span>
                        <button className="mx" onClick={handleClose}>
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
                        <p
                            style={{
                                textAlign: "center",
                                color: "var(--red-600)",
                                padding: "20px",
                            }}
                        >
                            {fetchError?.message || "الطالب غير موجود"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Main Form
    return (
        <>
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">تعديل بيانات الطالب</span>
                        <button
                            className="mx"
                            onClick={handleClose}
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
                        {/* معلومات الطالب الحالية */}
                        <div
                            style={{
                                marginBottom: 20,
                                padding: "16px",
                                backgroundColor: "#f8fafc",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "var(--n700)",
                                    marginBottom: 4,
                                }}
                            >
                                البيانات الحالية:{" "}
                                {studentData?.name || formData.id_number} -{" "}
                                {studentData?.idNumber || formData.id_number}
                            </p>
                            {studentData?.center_name && (
                                <p
                                    style={{
                                        fontSize: "11px",
                                        color: "#3730a3",
                                        fontWeight: 500,
                                    }}
                                >
                                    📍 {studentData.center_name}
                                </p>
                            )}
                        </div>

                        {/* رقم الهوية */}
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
                                رقم الهوية *
                            </label>
                            <input
                                required
                                type="text"
                                name="id_number"
                                value={formData.id_number || ""}
                                onChange={handleInputChange}
                                className={`fi2 ${
                                    errors.id_number
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                                placeholder="أدخل رقم الهوية"
                                disabled={isSubmitting}
                            />
                            {errors.id_number && (
                                <p
                                    style={{
                                        fontSize: "10.5px",
                                        color: "var(--red-600)",
                                        margin: "2px 0 0 0",
                                    }}
                                >
                                    {errors.id_number}
                                </p>
                            )}
                        </div>

                        {/* الصف */}
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
                                الصف *
                            </label>
                            <select
                                required
                                name="grade_level"
                                value={formData.grade_level || ""}
                                onChange={handleInputChange}
                                className={`fi2 ${
                                    errors.grade_level
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                                disabled={isSubmitting}
                            >
                                <option value="">اختر الصف</option>
                                {grades.map((grade) => (
                                    <option key={grade} value={grade}>
                                        {grade}
                                    </option>
                                ))}
                            </select>
                            {errors.grade_level && (
                                <p
                                    style={{
                                        fontSize: "10.5px",
                                        color: "var(--red-600)",
                                        margin: "2px 0 0 0",
                                    }}
                                >
                                    {errors.grade_level}
                                </p>
                            )}
                        </div>

                        {/* الحلقة */}
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
                                الحلقة
                            </label>
                            <input
                                type="text"
                                name="circle"
                                value={formData.circle || ""}
                                onChange={handleInputChange}
                                className="fi2 border-gray-200 hover:border-gray-300"
                                placeholder="مثال: الحلقة الأولى"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* الحالة */}
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
                                الحالة
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="fi2 border-gray-200 hover:border-gray-300"
                                disabled={isSubmitting}
                            >
                                <option value="نشط">نشط</option>
                                <option value="معلق">معلق</option>
                                <option value="موقوف">موقوف</option>
                            </select>
                        </div>

                        {/* الحالة الصحية */}
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
                                الحالة الصحية
                            </label>
                            <input
                                type="text"
                                name="health_status"
                                value={formData.health_status || ""}
                                onChange={handleInputChange}
                                className="fi2 border-gray-200 hover:border-gray-300"
                                placeholder="سليم / مريض / إعاقة..."
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* مستوى القراءة */}
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
                                مستوى القراءة
                            </label>
                            <input
                                type="text"
                                name="reading_level"
                                value={formData.reading_level || ""}
                                onChange={handleInputChange}
                                className="fi2 border-gray-200 hover:border-gray-300"
                                placeholder="جزء ثالث / نص جزء..."
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* وقت الحلقة */}
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
                                وقت الحلقة
                            </label>
                            <input
                                type="text"
                                name="session_time"
                                value={formData.session_time || ""}
                                onChange={handleInputChange}
                                className="fi2 border-gray-200 hover:border-gray-300"
                                placeholder="عصر / مغرب / ليل"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* الملاحظات */}
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
                                ملاحظات
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes || ""}
                                onChange={handleInputChange}
                                rows={3}
                                className="fi2 resize-vertical border-gray-200 hover:border-gray-300"
                                placeholder="أي ملاحظات إضافية حول الطالب..."
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div
                        className="mf"
                        style={{
                            padding: "20px 20px 16px 20px",
                            borderTop: "1px solid #e5e7eb",
                            marginTop: "auto",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                className="btn bs"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                إلغاء
                            </button>
                            <button
                                className="btn bp"
                                onClick={handleSave}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "جاري الحفظ..."
                                    : "حفظ التغييرات"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentAffairsUpdatePlatform;
