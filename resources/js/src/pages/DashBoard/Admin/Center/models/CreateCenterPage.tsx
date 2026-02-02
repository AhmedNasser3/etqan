import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { useCenterFormCreate } from "../hooks/useCenterFormCreate";

// ✅ CSRF Token Helper
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

    // ✅ الـ Route الصحيح من ملف routes/api.php بتاعك
    const handleSubmit = async (formDataSubmit: FormData) => {
        try {
            // ✅ CSRF Token أولاً
            if (!document.cookie.includes("XSRF-TOKEN=")) {
                await fetch("/sanctum/csrf-cookie", {
                    credentials: "include",
                });
            }

            console.log(
                "🌐 POST → /api/v1/super/centers/register ← الـ Route الصحيح",
            );

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

            console.log("📡 Status:", response.status);

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                console.error("❌ Error response:", errorData);

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
            console.log("✅ Create response:", result);

            if (result.success) {
                toast.success("تم إضافة المجمع بنجاح!");
                resetForm();
                onSuccess();
            } else {
                toast.error(result.message || "فشل في الإضافة");
            }
        } catch (error: any) {
            console.error("💥 Create error:", error);
            toast.error(error.message || "حدث خطأ في الإضافة");
        }
    };

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
                                <p>مجمع جديد</p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1>إضافة مجمع جديد</h1>
                                <p>
                                    يرجى إدخال بيانات المجمع المعتمد بشكل صحيح
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container">
                            {/* اسم المجمع */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>اسم المجمع *</label>
                                    <input
                                        required
                                        type="text"
                                        name="circle_name"
                                        value={formData.circle_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black ${
                                            errors.circle_name
                                                ? "border-red-300 bg-red-50 text-red-900"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="أدخل اسم المجمع"
                                        disabled={isSubmitting}
                                    />
                                    {errors.circle_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.circle_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* اسم المدير */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>اسم المدير *</label>
                                    <input
                                        required
                                        type="text"
                                        name="manager_name"
                                        value={formData.manager_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black ${
                                            errors.manager_name
                                                ? "border-red-300 bg-red-50 text-red-900"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="أدخل اسم المدير"
                                        disabled={isSubmitting}
                                    />
                                    {errors.manager_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.manager_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* بريد المدير */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>بريد المدير *</label>
                                    <input
                                        required
                                        type="email"
                                        name="manager_email"
                                        value={formData.manager_email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black ${
                                            errors.manager_email
                                                ? "border-red-300 bg-red-50 text-red-900"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="example@email.com"
                                        disabled={isSubmitting}
                                    />
                                    {errors.manager_email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.manager_email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* رقم الجوال */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>رقم الجوال *</label>
                                    <div className="flex">
                                        <select
                                            name="country_code"
                                            value={formData.country_code}
                                            onChange={handleInputChange}
                                            className="w-24 px-3 py-3 border-r-0 border rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium text-base"
                                            disabled={isSubmitting}
                                        >
                                            <option value="966">966+</option>
                                            <option value="20">20+</option>
                                            <option value="971">971+</option>
                                            <option value="966">966+</option>
                                        </select>
                                        <input
                                            name="manager_phone"
                                            value={formData.manager_phone}
                                            onChange={handleInputChange}
                                            className={`flex-1 px-4 py-3 border rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black ${
                                                errors.manager_phone
                                                    ? "border-red-300 bg-red-50 text-red-900"
                                                    : "border-gray-200 hover:border-gray-300 border-l-0"
                                            }`}
                                            placeholder="0551234567"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    {errors.manager_phone && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.manager_phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الدومين */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>الدومين</label>
                                    <input
                                        type="text"
                                        name="domain"
                                        value={formData.domain}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black"
                                        placeholder="test-center"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* رابط المجمع */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>رابط المجمع</label>
                                    <input
                                        type="url"
                                        name="circle_link"
                                        value={formData.circle_link}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black"
                                        placeholder="https://test.yourapp.com"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* شعار المجمع */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>شعار المجمع</label>
                                    <div className="space-y-3">
                                        {logoPreview && (
                                            <div className="text-center">
                                                <img
                                                    src={logoPreview}
                                                    alt="معاينة الصورة الجديدة"
                                                    className="w-24 h-24 object-cover rounded-2xl mx-auto border-2 border-blue-200"
                                                />
                                                <p className="text-sm text-blue-600 mt-1">
                                                    صورة جديدة محملة
                                                </p>
                                            </div>
                                        )}

                                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-all bg-gray-50">
                                            <input
                                                name="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="logo-upload"
                                                disabled={isSubmitting}
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className="cursor-pointer flex flex-col items-center gap-3"
                                            >
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-medium">
                                                    +
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        {formData.logo instanceof
                                                        File
                                                            ? formData.logo.name
                                                            : "اختر صورة جديدة (JPG, PNG)"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        حد أقصى 2 ميجا بايت
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ملاحظات */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label>ملاحظات</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black"
                                        placeholder="أي ملاحظات إضافية..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* زر الإضافة */}
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button
                                    type="button"
                                    onClick={() => submitForm(handleSubmit)}
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            جاري الإضافة...
                                        </>
                                    ) : (
                                        <>إضافة المجمع الجديد</>
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

export default CreateCenterPage;
