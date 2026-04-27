// models/TeachersAffairsUpdatePlatform.tsx - نفس تصميم StudentAffairsUpdatePlatform & UpdateSalaryRuleModal
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

    // تحميل البيانات تلقائياً عند تغيير teacherId
    useEffect(() => {
        if (teacherId > 0) {
            loadTeacherData();
        }
    }, [teacherId, loadTeacherData]);

    // حفظ البيانات
    const handleSave = async () => {
        const success = await submitForm();
        if (success) {
            toast.success("تم حفظ التغييرات بنجاح!");
            onSuccess();
        }
    };

    // إغلاق المودال
    const handleClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    // Main Form
    return (
        <>
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">تعديل بيانات المعلم</span>
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
                        {/* معلومات المعلم الحالية */}
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
                                {teacherData?.name || formData.role} -{" "}
                                {teacherData?.teacher_id || teacherId}
                            </p>
                            {teacherData?.center_name && (
                                <p
                                    style={{
                                        fontSize: "11px",
                                        color: "#3730a3",
                                        fontWeight: 500,
                                    }}
                                >
                                    📍 {teacherData.center_name}
                                </p>
                            )}
                            {teacherData?.role && (
                                <p
                                    style={{
                                        fontSize: "11px",
                                        color: "#7c3aed",
                                        fontWeight: 500,
                                    }}
                                >
                                    👨‍🏫 الوظيفة: {teacherData.role}
                                </p>
                            )}
                        </div>

                        {/* الوظيفة */}
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
                                الوظيفة *
                            </label>
                            <select
                                required
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className={`fi2 ${
                                    errors.role
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                                disabled={isSubmitting}
                            >
                                <option value="">اختر الوظيفة</option>
                                <option value="مدير">مدير</option>
                                <option value="معلم">معلم</option>
                                <option value="مشرف">مشرف</option>
                                <option value="منسق">منسق</option>
                                <option value="إداري">إداري</option>
                            </select>
                            {errors.role && (
                                <p
                                    style={{
                                        fontSize: "10.5px",
                                        color: "var(--red-600)",
                                        margin: "2px 0 0 0",
                                    }}
                                >
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        {/* معلومات إضافية - قراءة فقط */}
                        {teacherData && (
                            <>
                                {/* رقم الهاتف */}
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
                                        رقم الهاتف
                                    </label>
                                    <input
                                        type="text"
                                        value={teacherData.phone || ""}
                                        className="fi2 bg-gray-50 cursor-not-allowed border-gray-200"
                                        disabled
                                    />
                                </div>

                                {/* البريد الإلكتروني */}
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
                                        البريد الإلكتروني
                                    </label>
                                    <input
                                        type="email"
                                        value={teacherData.email || ""}
                                        className="fi2 bg-gray-50 cursor-not-allowed border-gray-200"
                                        disabled
                                    />
                                </div>

                                {/* حالة الحضور */}
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
                                        حالة الحضور
                                    </label>
                                    <input
                                        type="text"
                                        value={teacherData.attendanceRate || ""}
                                        className="fi2 bg-green-50 text-green-800 font-medium border-green-200"
                                        disabled
                                    />
                                </div>

                                {/* حالة الراتب */}
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
                                        حالة الراتب
                                    </label>
                                    <input
                                        type="text"
                                        value={teacherData.salaryStatus || ""}
                                        className="fi2 bg-blue-50 text-blue-800 font-medium border-blue-200"
                                        disabled
                                    />
                                </div>
                            </>
                        )}

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
                                placeholder="أي ملاحظات إضافية حول المعلم..."
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

export default TeachersAffairsUpdatePlatform;
