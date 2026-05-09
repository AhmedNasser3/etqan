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

    // FIELD COMPONENTS
    function FG({
        label,
        req,
        opt,
        hint,
        error,
        children,
    }: {
        label: string;
        req?: boolean;
        opt?: boolean;
        hint?: string;
        error?: string;
        children: React.ReactNode;
    }) {
        return (
            <div className="field-wrap">
                <label className="field-label">
                    {label}
                    {req && <span className="req"> *</span>}
                    {opt && <span className="opt-tag">اختياري</span>}
                </label>
                {children}
                {hint && <div className="field-hint">{hint}</div>}
                {error && <div className="field-err-msg">{error}</div>}
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="form-stack">
            {/* CENTER INFO */}
            {centerSlug && (
                <div className="section-div">
                    <span>📍 تسجيل في مجمع: {centerSlug}</span>
                </div>
            )}

            {/* NAME ROW */}
            <div className="row-2">
                <FG label="الاسم الأول" req>
                    <input
                        required
                        type="text"
                        name="first_name"
                        id="first_name"
                        placeholder={
                            gender === "male" ? "... أحمد" : "... فاطمة"
                        }
                        className="bare-field"
                    />
                </FG>
                <FG label="اللقب / الاسم الثاني" req>
                    <input
                        required
                        type="text"
                        name="family_name"
                        id="family_name"
                        placeholder="... التميمي"
                        className="bare-field"
                    />
                </FG>
            </div>

            {/* ID & BIRTH ROW */}
            <div className="row-2">
                <FG label="رقم الهوية" req>
                    <input
                        required
                        type="text"
                        name="id_number"
                        id="id_number"
                        placeholder="1234567890"
                        maxLength={10}
                        className="bare-field"
                        dir="ltr"
                    />
                </FG>
                <FG label="تاريخ الميلاد" req>
                    <input
                        required
                        type="date"
                        name="birth_date"
                        id="birth_date"
                        className="bare-field"
                        dir="ltr"
                    />
                </FG>
            </div>

            {/* GRADE ROW */}
            <FG label="المرحلة الدراسية" req>
                <select
                    name="grade_level"
                    id="grade_level"
                    required
                    className="bare-field"
                >
                    <option value="">اختر المرحلة</option>
                    <option value="elementary">ابتدائي</option>
                    <option value="middle">متوسط</option>
                    <option value="high">ثانوي</option>
                </select>
            </FG>

            {/* READING LEVEL */}
            <FG label="مستوى القراءة / الحفظ" opt>
                <input
                    type="text"
                    name="reading_level"
                    id="reading_level"
                    placeholder="مثال: جُزء عم + 5 أجزاء حفظ"
                    className="bare-field"
                />
            </FG>

            {/* SESSION TIME & HEALTH ROW */}
            <div className="row-2">
                <FG label="وقت الحلقة" opt>
                    <select
                        name="session_time"
                        id="session_time"
                        className="bare-field"
                    >
                        <option value="">اختر الوقت</option>
                        <option value="asr">العصر</option>
                        <option value="maghrib">المغرب</option>
                    </select>
                </FG>
                <FG label="الحالة الصحية" req>
                    <select
                        name="health_status"
                        id="health_status"
                        required
                        className="bare-field"
                    >
                        <option value="">اختر الحالة</option>
                        <option value="healthy">سليم</option>
                        <option value="needs_attention">يحتاج متابعة</option>
                        <option value="special_needs">احتياجات خاصة</option>
                    </select>
                </FG>
            </div>

            {/* DIVIDER */}
            <div className="section-div">
                <span>بيانات التواصل</span>
            </div>

            {/* GUARDIAN EMAIL & PHONE ROW */}
            <div className="row-2">
                <FG
                    label="بريد ولي الأمر الإلكتروني"
                    req
                    hint="سيُرسل رمز التحقق على هذا البريد"
                >
                    <div className={`input-box${error ? " err" : ""}`}>
                        <span>✉️</span>
                        <input
                            required
                            type="email"
                            name="guardian_email"
                            id="guardian_email"
                            placeholder="parent@example.com"
                            className="bare-input"
                            dir="ltr"
                        />
                    </div>
                </FG>
                <FG label="جوال ولي الأمر" req>
                    <div
                        className={`input-box${error ? " err" : ""}`}
                        dir="ltr"
                    >
                        <select
                            name="guardian_country_code"
                            id="guardian_country_code"
                            required
                            className="phone-flag"
                        >
                            <option value="966">🇸🇦 +966</option>
                            <option value="20">🇪🇬 +20</option>
                            <option value="971">🇦🇪 +971</option>
                        </select>
                        <input
                            required
                            type="tel"
                            name="guardian_phone"
                            id="guardian_phone"
                            placeholder="50 123 4567"
                            className="bare-input"
                        />
                    </div>
                </FG>
            </div>

            {/* STUDENT EMAIL */}
            <FG label="بريد الطالب الإلكتروني" opt>
                <div className="input-box">
                    <span>✉️</span>
                    <input
                        type="email"
                        name="student_email"
                        id="student_email"
                        placeholder="ahmed@example.com"
                        className="bare-input"
                        dir="ltr"
                    />
                </div>
            </FG>

            {/* NOTES */}
            <FG label="ملاحظات" opt>
                <textarea
                    name="notes"
                    id="notes"
                    rows={3}
                    placeholder="ملاحظات إضافية..."
                    className="bare-field textarea-field"
                />
            </FG>

            {/* HIDDEN GENDER */}
            <input type="hidden" name="gender" value={gender} />

            {/* ERROR */}
            {error && (
                <div className="field-wrap">
                    <div className="field-err-msg">❌ {error}</div>
                </div>
            )}

            {/* SUCCESS */}
            {success && (
                <div className="field-wrap">
                    <div className="field-hint">
                        ✅ تم التسجيل بنجاح! سيتم مراجعة الطلب قريباً.
                    </div>
                </div>
            )}

            {/* SUBMIT */}
            <button
                type="submit"
                className="btn-primary submit-big"
                disabled={isLoading}
            >
                {isLoading ? "⏳ جاري التسجيل..." : "📤 إرسال طلب التسجيل"}
            </button>
        </form>
    );
};

export default StudentEnrollment;
