import React, { FormEvent } from "react";
import { useStudentEnrollment } from "../hooks/useStudentEnrollment";

interface StudentEnrollmentProps {
    gender: "male" | "female";
    centerSlug?: string | null;
}

const StudentEnrollment: React.FC<StudentEnrollmentProps> = ({
    gender,
    centerSlug,
}) => {
    const { handleSubmit, isLoading, error, success, resetForm } =
        useStudentEnrollment();

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await handleSubmit(formData);
    };

    return (
        <div className="inputs">
            {centerSlug && (
                <div
                    className="center-info"
                    style={{
                        marginBottom: "20px",
                        padding: "15px",
                        background: "#e3f2fd",
                        borderRadius: "8px",
                        textAlign: "center",
                    }}
                >
                    <h3>
                        📍 تسجيل في مجمع: <strong>{centerSlug}</strong>
                    </h3>
                </div>
            )}

            <div className="inputs__inner">
                <form onSubmit={onSubmit} className="inputs__container">
                    <div className="inputs__name">
                        <div className="inputs__Lastname">
                            <label>اللقب/الاسم الثاني</label>
                            <input
                                required
                                type="text"
                                name="family_name"
                                id="family_name"
                                placeholder="... التميمي"
                            />
                        </div>
                        <div className="inputs__Firstname">
                            <label>الاسم الأول</label>
                            <input
                                required
                                type="text"
                                name="first_name"
                                id="first_name"
                                placeholder={
                                    gender === "male" ? "... أحمد" : "... فاطمة"
                                }
                            />
                        </div>
                    </div>

                    <div className="inputs__verifyOTPBirth">
                        <div className="inputs__verifyOTP">
                            <label>رقم الهوية</label>
                            <input
                                required
                                type="text"
                                name="id_number"
                                id="id_number"
                                placeholder="1234567890"
                                maxLength={10}
                            />
                        </div>
                        <div className="inputs__verifyOTP">
                            <label>تاريخ الميلاد</label>
                            <input
                                required
                                type="date"
                                name="birth_date"
                                id="birth_date"
                            />
                        </div>
                    </div>

                    <div className="inputs__verifyOTPBirth">
                        <div className="inputs__verifyOTP">
                            <label>المرحلة الدراسية</label>
                            <select
                                name="grade_level"
                                id="grade_level"
                                required
                            >
                                <option value="">اختر المرحلة</option>
                                <option value="elementary">ابتدائي</option>
                                <option value="middle">متوسط</option>
                                <option value="high">ثانوي</option>
                            </select>
                        </div>
                    </div>

                    <div className="inputs__verifyOTP">
                        <label>مستوى القراءة/الحفظ (اختياري)</label>
                        <input
                            type="text"
                            name="reading_level"
                            id="reading_level"
                            placeholder="مثال: جُزء عم + 5 أجزاء حفظ"
                        />
                    </div>

                    <div className="inputs__verifyOTPBirth">
                        <div className="inputs__verifyOTP">
                            <label>وقت الحلقة (اختياري)</label>
                            <select name="session_time" id="session_time">
                                <option value="">اختر الوقت</option>
                                <option value="asr">العصر</option>
                                <option value="maghrib">المغرب</option>
                            </select>
                        </div>
                        <div className="inputs__verifyOTP">
                            <label>الحالة الصحية</label>
                            <select
                                name="health_status"
                                id="health_status"
                                required
                            >
                                <option value="">اختر الحالة</option>
                                <option value="healthy">سليم</option>
                                <option value="needs_attention">
                                    يحتاج متابعة
                                </option>
                                <option value="special_needs">
                                    احتياجات خاصة
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="inputs__verifyOTPBirth">
                        <div className="inputs__email">
                            <label>بريد ولي الأمر الإلكتروني *</label>
                            <input
                                required
                                type="email"
                                name="guardian_email"
                                id="guardian_email"
                                placeholder="parent@example.com"
                            />
                        </div>
                        <div className="inputs__verifyOTP">
                            <label>جوال ولي الأمر *</label>
                            <div className="inputs__phone-container">
                                <select
                                    name="guardian_country_code"
                                    id="guardian_country_code"
                                    required
                                >
                                    <option value="966">966+</option>
                                    <option value="20">20+</option>
                                    <option value="971">971+</option>
                                </select>
                                <input
                                    required
                                    type="tel"
                                    name="guardian_phone"
                                    id="guardian_phone"
                                    placeholder="50 123 4567"
                                    className="inputs__phone-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="inputs__verifyOTP">
                        <label>بريد الطالب الإلكتروني (اختياري)</label>
                        <input
                            type="email"
                            name="student_email"
                            id="student_email"
                            placeholder="ahmed@example.com"
                        />
                    </div>

                    <div className="inputs__verifyOTP">
                        <label>ملاحظات</label>
                        <textarea
                            name="notes"
                            id="notes"
                            rows={3}
                            placeholder="ملاحظات إضافية..."
                        />
                    </div>

                    <input type="hidden" name="gender" value={gender} />

                    {error && (
                        <div
                            className="error-message"
                            style={{
                                color: "#dc3545",
                                margin: "15px 0",
                                padding: "12px 16px",
                                background: "#f8d7da",
                                borderRadius: "8px",
                                border: "1px solid #f5c6cb",
                            }}
                        >
                            ❌ {error}
                        </div>
                    )}

                    {success && (
                        <div
                            className="success-message"
                            style={{
                                color: "#155724",
                                margin: "15px 0",
                                padding: "12px 16px",
                                background: "#d4edda",
                                borderRadius: "8px",
                                border: "1px solid #c3e6cb",
                            }}
                        >
                            تم التسجيل بنجاح! سيتم مراجعة الطلب قريباً.
                        </div>
                    )}

                    <div className="inputs__submitBtn">
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                opacity: isLoading ? 0.7 : 1,
                                cursor: isLoading ? "not-allowed" : "pointer",
                            }}
                        >
                            {isLoading
                                ? "⏳ جاري التسجيل..."
                                : "📤 إرسال طلب التسجيل"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentEnrollment;
