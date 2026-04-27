// CreateCenterPage.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { useCenterFormCreate } from "../hooks/useCenterFormCreate";

const getCsrfToken = (): string => {
    const cookies = document.cookie.split(";");
    const csrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("XSRF-TOKEN="),
    );
    return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
};

interface CreateCenterPageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateCenterPage: React.FC<CreateCenterPageProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        handleFileChange,
        submitForm,
        logoPreview,
        resetForm,
    } = useCenterFormCreate();

    const handleSubmit = async (formDataSubmit: FormData) => {
        try {
            if (!document.cookie.includes("XSRF-TOKEN=")) {
                await fetch("/sanctum/csrf-cookie", {
                    credentials: "include",
                });
            }

            const response = await fetch("/api/v1/super/centers/register", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": getCsrfToken(),
                },
                body: formDataSubmit,
            });

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(errorMessages[0] || "حدث خطأ في الإضافة");
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                toast.success("تم إضافة المجمع بنجاح!");
                resetForm();
                onSuccess();
            } else {
                toast.error(result.message || "فشل في الإضافة");
            }
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ في الإضافة");
        }
    };

    return (
        <>
            <div className="ov on">
                <div className="modal">
                    <div className="mh">
                        <span className="mh-t">مجمع جديد</span>
                        <button
                            className="mx"
                            onClick={onClose}
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
                        {/* اسم المجمع */}
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
                                اسم المجمع *
                            </label>
                            <input
                                required
                                type="text"
                                name="circle_name"
                                value={formData.circle_name}
                                onChange={handleInputChange}
                                className={`fi2 ${
                                    errors.circle_name
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                                placeholder="أدخل اسم المجمع"
                                disabled={isSubmitting}
                            />
                            {errors.circle_name && (
                                <p
                                    style={{
                                        fontSize: "10.5px",
                                        color: "var(--red-600)",
                                        margin: "2px 0 0 0",
                                    }}
                                >
                                    {errors.circle_name}
                                </p>
                            )}
                        </div>

                        {/* اسم المدير */}
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
                                اسم المدير *
                            </label>
                            <input
                                required
                                type="text"
                                name="manager_name"
                                value={formData.manager_name}
                                onChange={handleInputChange}
                                className={`fi2 ${
                                    errors.manager_name
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                                placeholder="أدخل اسم المدير"
                                disabled={isSubmitting}
                            />
                            {errors.manager_name && (
                                <p
                                    style={{
                                        fontSize: "10.5px",
                                        color: "var(--red-600)",
                                        margin: "2px 0 0 0",
                                    }}
                                >
                                    {errors.manager_name}
                                </p>
                            )}
                        </div>

                        {/* بريد المدير */}
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
                                بريد المدير *
                            </label>
                            <input
                                required
                                type="email"
                                name="manager_email"
                                value={formData.manager_email}
                                onChange={handleInputChange}
                                className={`fi2 ${
                                    errors.manager_email
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                                placeholder="example@email.com"
                                disabled={isSubmitting}
                            />
                            {errors.manager_email && (
                                <p
                                    style={{
                                        fontSize: "10.5px",
                                        color: "var(--red-600)",
                                        margin: "2px 0 0 0",
                                    }}
                                >
                                    {errors.manager_email}
                                </p>
                            )}
                        </div>

                        {/* رقم الجوال */}
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
                                رقم الجوال *
                            </label>
                            <div style={{ display: "flex" }}>
                                <select
                                    name="country_code"
                                    value={formData.country_code}
                                    onChange={handleInputChange}
                                    className="fi2" // مُعدّل لـ CSS عام بنفس أسلوب modal
                                    style={{
                                        width: 70,
                                        borderRight: "none",
                                        borderRadius: "0.5rem 0 0 0.5rem",
                                        marginRight: -1,
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <option value="966">966+</option>
                                    <option value="20">20+</option>
                                    <option value="971">971+</option>
                                </select>
                                <input
                                    name="manager_phone"
                                    value={formData.manager_phone}
                                    onChange={handleInputChange}
                                    className={`fi2 ${
                                        errors.manager_phone
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                    style={{
                                        borderTopLeftRadius: 0,
                                        borderBottomLeftRadius: 0,
                                        borderLeft: "none",
                                    }}
                                    placeholder="0551234567"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.manager_phone && (
                                <p
                                    style={{
                                        fontSize: "10.5px",
                                        color: "var(--red-600)",
                                        margin: "2px 0 0 0",
                                    }}
                                >
                                    {errors.manager_phone}
                                </p>
                            )}
                        </div>

                        {/* الدومين */}
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
                                الدومين
                            </label>
                            <input
                                type="text"
                                name="domain"
                                value={formData.domain}
                                onChange={handleInputChange}
                                className="fi2 border-gray-200 hover:border-gray-300"
                                placeholder="test-center"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* رابط المجمع */}
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
                                رابط المجمع
                            </label>
                            <input
                                type="url"
                                name="circle_link"
                                value={formData.circle_link}
                                onChange={handleInputChange}
                                className="fi2 border-gray-200 hover:border-gray-300"
                                placeholder="https://test.yourapp.com"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* شعار المجمع */}
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
                                شعار المجمع
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 12,
                                }}
                            >
                                {logoPreview && (
                                    <div
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 12,
                                            overflow: "hidden",
                                            border: "2px solid #bfdbfe",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            backgroundColor: "#f0f9ff",
                                        }}
                                    >
                                        <img
                                            src={logoPreview}
                                            alt="معاينة الصورة الجديدة"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>
                                )}
                                <div
                                    style={{
                                        flex: 1,
                                        border: "2px dashed #cbd5e1",
                                        borderRadius: "0.75rem",
                                        padding: "12px",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        backgroundColor: "#f8fafc",
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    <input
                                        name="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="logo-upload-center"
                                        disabled={isSubmitting}
                                    />
                                    <label
                                        htmlFor="logo-upload-center"
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: 6,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 16,
                                                background:
                                                    "linear-gradient(135deg, #3b82f6, #2563eb)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#fff",
                                                fontWeight: 600,
                                            }}
                                        >
                                            +
                                        </span>
                                        <p
                                            style={{
                                                fontSize: "0.75rem",
                                                margin: 0,
                                                lineHeight: 1.2,
                                                color: "var(--n700)",
                                            }}
                                        >
                                            {formData.logo instanceof File
                                                ? formData.logo.name
                                                : "اختر صورة جديدة (JPG, PNG)"}
                                        </p>
                                        <span
                                            style={{
                                                fontSize: "0.65rem",
                                                color: "var(--n500)",
                                            }}
                                        >
                                            حد أقصى 2 ميجا بايت
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ملاحظات */}
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
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="fi2 resize-vertical border-gray-200 hover:border-gray-300"
                                placeholder="أي ملاحظات إضافية..."
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
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                إلغاء
                            </button>
                            <button
                                className="btn bp"
                                onClick={() => submitForm(handleSubmit)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "جاري الإضافة..."
                                    : "إضافة المجمع الجديد"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateCenterPage;
