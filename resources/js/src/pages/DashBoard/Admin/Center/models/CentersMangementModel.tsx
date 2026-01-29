import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useCenterForm, CenterFormData } from "../hooks/useCenterForm";

interface CentersMangementModelProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    initialData?: Partial<CenterFormData> | null;
    loading?: boolean;
    centerId?: number | null;
}

const CentersMangementModel: React.FC<CentersMangementModelProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading = false,
    centerId,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        handleFileChange,
        submitForm,
    } = useCenterForm(initialData);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("🔥 BUTTON CLICKED! 🎉");
        console.log("Form data:", formData);
        console.log("Center ID:", centerId);
        await submitForm(onSubmit);
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
                                <p>2026-01-28 | الأربعاء</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>
                                    {centerId
                                        ? "تعديل إعدادات المجمع"
                                        : "إعدادات المجمع الجديد"}
                                </h1>
                                <p>املأ البيانات الأساسية للمجمع والمدير</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div
                                className="ParentModel__container"
                                style={{ padding: "24px" }}
                            >
                                <div className="inputs">
                                    <div className="inputs__inner">
                                        <div className="inputs__container">
                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="circle_name">
                                                    اسم المجمع *
                                                </label>
                                                <input
                                                    autoComplete="off"
                                                    required
                                                    type="text"
                                                    name="circle_name"
                                                    id="circle_name"
                                                    placeholder="مجمع الإمام الشافعي"
                                                    value={formData.circle_name}
                                                    onChange={handleInputChange}
                                                    className={
                                                        errors.circle_name
                                                            ? "error"
                                                            : ""
                                                    }
                                                />
                                                {errors.circle_name && (
                                                    <span className="error-message">
                                                        {errors.circle_name}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="manager_name">
                                                    اسم المدير *
                                                </label>
                                                <input
                                                    autoComplete="off"
                                                    required
                                                    type="text"
                                                    name="manager_name"
                                                    id="manager_name"
                                                    placeholder="محمد أحمد محمد علي"
                                                    value={
                                                        formData.manager_name
                                                    }
                                                    onChange={handleInputChange}
                                                    className={
                                                        errors.manager_name
                                                            ? "error"
                                                            : ""
                                                    }
                                                />
                                                {errors.manager_name && (
                                                    <span className="error-message">
                                                        {errors.manager_name}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="manager_email">
                                                    بريد المدير *
                                                </label>
                                                <input
                                                    autoComplete="off"
                                                    required
                                                    type="email"
                                                    name="manager_email"
                                                    id="manager_email"
                                                    placeholder="manager@shaafi.com"
                                                    value={
                                                        formData.manager_email
                                                    }
                                                    onChange={handleInputChange}
                                                    className={
                                                        errors.manager_email
                                                            ? "error"
                                                            : ""
                                                    }
                                                />
                                                {errors.manager_email && (
                                                    <span className="error-message">
                                                        {errors.manager_email}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="inputs__verifyOTPBirth">
                                                <div className="inputs__verifyOTP">
                                                    <label htmlFor="country_code">
                                                        كود الدولة
                                                    </label>
                                                    <select
                                                        name="country_code"
                                                        id="country_code"
                                                        value={
                                                            formData.country_code
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    >
                                                        <option value="966">
                                                            966+
                                                        </option>
                                                        <option value="20">
                                                            20+
                                                        </option>
                                                        <option value="971">
                                                            971+
                                                        </option>
                                                    </select>
                                                </div>
                                                <div className="inputs__verifyOTP">
                                                    <label htmlFor="manager_phone">
                                                        رقم الجوال *
                                                    </label>
                                                    <input
                                                        autoComplete="off"
                                                        required
                                                        type="tel"
                                                        name="manager_phone"
                                                        id="manager_phone"
                                                        placeholder="50 123 4567"
                                                        className={`inputs__phone-input ${errors.manager_phone ? "error" : ""}`}
                                                        value={
                                                            formData.manager_phone
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                    {errors.manager_phone && (
                                                        <span className="error-message">
                                                            {
                                                                errors.manager_phone
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="hosting_provider">
                                                    اسم الاستضافة الخاصة بك *
                                                </label>
                                                <input
                                                    autoComplete="off"
                                                    required
                                                    type="text"
                                                    name="hosting_provider"
                                                    id="hosting_provider"
                                                    placeholder="مثال: Hetzner, AWS, GoDaddy"
                                                    value={
                                                        formData.hosting_provider
                                                    }
                                                    onChange={handleInputChange}
                                                    className={
                                                        errors.hosting_provider
                                                            ? "error"
                                                            : ""
                                                    }
                                                />
                                                {errors.hosting_provider && (
                                                    <span className="error-message">
                                                        {
                                                            errors.hosting_provider
                                                        }
                                                    </span>
                                                )}
                                            </div>

                                            <div className="inputs__domain-section">
                                                <h3
                                                    style={{
                                                        margin: "20px 0 10px 0",
                                                        color: "#666",
                                                        fontSize: "16px",
                                                    }}
                                                >
                                                    ربط الدومين (اختياري)
                                                </h3>
                                                <div className="inputs__verifyOTP">
                                                    <label htmlFor="domain">
                                                        اربط دومينك الخاص
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="domain"
                                                        id="domain"
                                                        placeholder="shaafi-circle.com"
                                                        value={
                                                            formData.domain ||
                                                            ""
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="circle_link">
                                                    رابط الموقع الحالي
                                                </label>
                                                <input
                                                    type="url"
                                                    name="circle_link"
                                                    id="circle_link"
                                                    placeholder="https://shaafi-circle.com"
                                                    value={
                                                        formData.circle_link ||
                                                        ""
                                                    }
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="logo">
                                                    شعار المجمع (اختياري)
                                                </label>
                                                <input
                                                    type="file"
                                                    name="logo"
                                                    id="logo"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                                {formData.logo &&
                                                    typeof formData.logo ===
                                                        "string" && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            الصورة الحالية:{" "}
                                                            {formData.logo}
                                                        </p>
                                                    )}
                                            </div>

                                            <div className="inputs__verifyOTP">
                                                <label htmlFor="notes">
                                                    ملاحظات إضافية
                                                </label>
                                                <textarea
                                                    name="notes"
                                                    id="notes"
                                                    rows={3}
                                                    placeholder="ملاحظات حول النقل أو الربط..."
                                                    value={formData.notes || ""}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="inputs__submitBtn">
                                                <button
                                                    type="submit"
                                                    disabled={
                                                        isSubmitting || loading
                                                    }
                                                    style={{
                                                        opacity:
                                                            isSubmitting ||
                                                            loading
                                                                ? 0.7
                                                                : 1,
                                                        cursor:
                                                            isSubmitting ||
                                                            loading
                                                                ? "not-allowed"
                                                                : "pointer",
                                                    }}
                                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all text-lg"
                                                >
                                                    {isSubmitting || loading
                                                        ? "جاري الحفظ..."
                                                        : centerId
                                                          ? "تحديث إعدادات المجمع"
                                                          : "حفظ إعدادات المجمع"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CentersMangementModel;
