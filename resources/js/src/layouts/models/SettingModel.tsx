import { useState } from "react";
import { FiX } from "react-icons/fi";

interface SettingModelProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingModel: React.FC<SettingModelProps> = ({ isOpen, onClose }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onClose();
    };

    if (!isOpen) return null;

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
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p>2026-01-20 | الثلاثاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>تعديل حسابك</h1>
                                <p>يمكن تعديل حسابك بالكامل من هنا</p>
                            </div>
                        </div>
                        <div
                            className="ParentModel__container"
                            style={{ padding: "24px" }}
                        >
                            <div className="inputs">
                                <div className="inputs__inner">
                                    <div className="inputs__container">
                                        <div className="inputs__name">
                                            <div className="inputs__Lastname">
                                                <label>
                                                    اللقب/الاسم الثاني
                                                </label>
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
                                                    placeholder="... أحمد"
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
                                                >
                                                    <option value="">
                                                        اختر المرحلة
                                                    </option>
                                                    <option value="elementary">
                                                        ابتدائي
                                                    </option>
                                                    <option value="middle">
                                                        متوسط
                                                    </option>
                                                    <option value="high">
                                                        ثانوي
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label>الحلقة المناسبة</label>
                                                <select
                                                    name="circle"
                                                    id="circle"
                                                >
                                                    <option value="">
                                                        اختر الحلقة
                                                    </option>
                                                    <option value="circle-1">
                                                        حلقة المبتدئين 1
                                                    </option>
                                                    <option value="circle-2">
                                                        حلقة المبتدئين 2
                                                    </option>
                                                    <option value="circle-3">
                                                        حلقة المتقدمين
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="inputs__verifyOTP">
                                            <label>
                                                مستوى القراءة/الحفظ (اختياري)
                                            </label>
                                            <input
                                                type="text"
                                                name="reading_level"
                                                id="reading_level"
                                                placeholder="مثال: جُزء عم + 5 أجزاء حفظ"
                                            />
                                        </div>
                                        <div className="inputs__verifyOTPBirth">
                                            <div className="inputs__verifyOTP">
                                                <label>
                                                    وقت الحلقة (اختياري)
                                                </label>
                                                <select
                                                    name="session_time"
                                                    id="session_time"
                                                >
                                                    <option value="">
                                                        اختر الوقت
                                                    </option>
                                                    <option value="asr">
                                                        العصر
                                                    </option>
                                                    <option value="maghrib">
                                                        المغرب
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label>الحالة الصحية</label>
                                                <select
                                                    name="health_status"
                                                    id="health_status"
                                                    required
                                                >
                                                    <option value="">
                                                        اختر الحالة
                                                    </option>
                                                    <option value="healthy">
                                                        سليم
                                                    </option>
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
                                                <label>
                                                    بريد ولي الأمر الإلكتروني *
                                                </label>
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
                                                    <div className="inputs__verifyOTPBirth">
                                                        <select
                                                            name="guardian_country_code"
                                                            id="guardian_country_code"
                                                        >
                                                            <option value="966">
                                                                966+
                                                            </option>
                                                            <option value="20">
                                                                20+
                                                            </option>
                                                            <option value="966">
                                                                971+
                                                            </option>
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
                                        </div>
                                        <div className="inputs__verifyOTP">
                                            <label>جوال الطالب (اختياري)</label>
                                            <div className="inputs__phone-container">
                                                <div className="inputs__verifyOTPBirth">
                                                    <select
                                                        name="student_country_code"
                                                        id="student_country_code"
                                                    >
                                                        <option value="966">
                                                            966+
                                                        </option>
                                                        <option value="20">
                                                            20+
                                                        </option>
                                                        <option value="966">
                                                            971+
                                                        </option>
                                                    </select>
                                                    <input
                                                        type="tel"
                                                        name="student_phone"
                                                        id="student_phone"
                                                        placeholder="50 987 6543"
                                                        className="inputs__phone-input"
                                                    />
                                                </div>
                                            </div>
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
                                        <div className="inputs__submitBtn">
                                            <button type="submit">
                                                تعديل الحساب
                                            </button>
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
};

export default SettingModel;
