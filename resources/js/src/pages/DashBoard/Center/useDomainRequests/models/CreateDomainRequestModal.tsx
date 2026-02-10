// modals/CreateDomainRequestModal.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { useDomainRequestFormCreate } from "../hooks/useDomainRequestFormCreate";

const getCsrfToken = (): string => {
    const cookies = document.cookie.split(";");
    const csrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("XSRF-TOKEN="),
    );
    return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
};

interface CreateDomainRequestModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateDomainRequestModal: React.FC<CreateDomainRequestModalProps> = ({
    onClose,
    onSuccess,
}) => {
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        resetForm,
    } = useDomainRequestFormCreate();

    const handleSubmit = async (formDataSubmit: FormData) => {
        console.log("🎯 MODAL HANDLE SUBMIT START");

        try {
            // ✅ CSRF Cookie أولاً دايماً
            console.log("🍪 Getting CSRF Cookie...");
            await fetch("/sanctum/csrf-cookie", {
                credentials: "include",
            });

            const csrfToken = getCsrfToken();
            console.log(
                "🔐 CSRF Token:",
                csrfToken ? "✅ موجود" : "❌ مش موجود",
            );

            // ✅ URL صحيح مع /api/
            console.log(
                "🌐 POST → /api/v1/idea-domain-requests ← Route موجود في route:list",
            );

            const response = await fetch("/api/v1/idea-domain-requests", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": csrfToken,
                },
                body: formDataSubmit,
            });

            console.log("📡 Status:", response.status, response.statusText);
            console.log("📋 Headers sent:", {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-XSRF-TOKEN": csrfToken ? "PRESENT" : "MISSING",
            });

            if (!response.ok) {
                const responseText = await response.text();
                console.error(
                    "❌ Error response (raw):",
                    responseText.substring(0, 500),
                );

                try {
                    const errorData = JSON.parse(responseText);
                    console.error("❌ Parsed error:", errorData);

                    if (errorData.message) {
                        throw new Error(errorData.message);
                    }
                    if (errorData.errors) {
                        const errorMessages = Object.values(
                            errorData.errors,
                        ).flat();
                        toast.error(errorMessages[0] || "حدث خطأ في الإضافة");
                        return;
                    }
                } catch (parseError) {
                    console.error("❌ Parse failed:", parseError);
                }

                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const result = await response.json();
            console.log("✅ Create response:", result);

            toast.success("تم إرسال طلب الدومين بنجاح! 🎉");
            resetForm();
            onSuccess();
        } catch (error: any) {
            console.error("💥 Create error:", error);
            toast.error(error.message || "حدث خطأ في الإرسال");
            throw error;
        }
    };

    return (
        <div className="ParentModel">
            <div className="ParentModel__overlay" onClick={onClose}>
                <div
                    className="ParentModel__content max-w-2xl mx-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="ParentModel__inner">
                        <div className="ParentModel__header">
                            <button
                                className="ParentModel__close text-gray-500 hover:text-gray-700 transition-colors"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p className="text-blue-600 font-semibold">
                                    🌐 طلب دومين
                                </p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    طلب دومين خاص جديد
                                </h1>
                                <p className="text-gray-600">
                                    املأ البيانات التالية لطلب تغيير الدومين
                                    الخاص بمركزك
                                </p>
                            </div>
                        </div>

                        <div className="ParentModel__container space-y-6">
                            {/* اسم الاستضافة */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم الاستضافة{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="hosting_name"
                                        value={formData.hosting_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black shadow-sm ${
                                            errors.hosting_name
                                                ? "border-red-300 bg-red-50 text-red-900 ring-2 ring-red-200"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="مثال: Hostinger, GoDaddy, Bluehost"
                                        disabled={isSubmitting}
                                    />
                                    {errors.hosting_name && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <span className="w-4 h-4 mr-2">
                                                ⚠️
                                            </span>
                                            {errors.hosting_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* الدومين المطلوب */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الدومين المطلوب{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="requested_domain"
                                        value={formData.requested_domain}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black shadow-sm font-mono ${
                                            errors.requested_domain
                                                ? "border-red-300 bg-red-50 text-red-900 ring-2 ring-red-200"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="example.com"
                                        disabled={isSubmitting}
                                    />
                                    {errors.requested_domain && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <span className="w-4 h-4 mr-2">
                                                ⚠️
                                            </span>
                                            {errors.requested_domain}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* DNS 1 */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        DNS 1{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="dns1"
                                        value={formData.dns1}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black shadow-sm font-mono ${
                                            errors.dns1
                                                ? "border-red-300 bg-red-50 text-red-900 ring-2 ring-red-200"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="ns1.example.com"
                                        disabled={isSubmitting}
                                    />
                                    {errors.dns1 && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <span className="w-4 h-4 mr-2">
                                                ⚠️
                                            </span>
                                            {errors.dns1}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* DNS 2 */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        DNS 2{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="dns2"
                                        value={formData.dns2}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black shadow-sm font-mono ${
                                            errors.dns2
                                                ? "border-red-300 bg-red-50 text-red-900 ring-2 ring-red-200"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="ns2.example.com"
                                        disabled={isSubmitting}
                                    />
                                    {errors.dns2 && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <span className="w-4 h-4 mr-2">
                                                ⚠️
                                            </span>
                                            {errors.dns2}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ملاحظات */}
                            <div className="inputs__verifyOTPBirth">
                                <div className="inputs__email">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ملاحظات (اختياري)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ""}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-black shadow-sm"
                                        placeholder="أي ملاحظات إضافية حول طلب الدومين..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* زر الإرسال */}
                            <div
                                className="inputs__submitBtn"
                                id="ParentModel__btn"
                            >
                                <button
                                    type="button"
                                    onClick={() => submitForm(handleSubmit)}
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center text-lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                            جاري إرسال الطلب...
                                        </>
                                    ) : (
                                        <>
                                            <span className="mr-2">🚀</span>
                                            إرسال طلب الدومين
                                        </>
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

export default CreateDomainRequestModal;
