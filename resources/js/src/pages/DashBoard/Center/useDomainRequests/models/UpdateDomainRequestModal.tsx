// modals/UpdateDomainRequestModal.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { useDomainRequestFormUpdate } from "../hooks/useDomainRequestFormUpdate";

const getCsrfToken = (): string => {
    const cookies = document.cookie.split(";");
    const csrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("XSRF-TOKEN="),
    );
    return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
};

interface DomainRequest {
    id: number;
    center_id: number;
    hosting_name: string;
    requested_domain: string;
    dns1: string;
    dns2: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface UpdateDomainRequestModalProps {
    initialRequest: DomainRequest;
    requestId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateDomainRequestModal: React.FC<UpdateDomainRequestModalProps> = ({
    initialRequest,
    requestId,
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
    } = useDomainRequestFormUpdate({ initialRequest });

    const handleSubmit = async (formDataSubmit: FormData) => {
        console.log("🎯 UPDATE MODAL HANDLE SUBMIT START");
        console.log("📋 Updating request ID:", requestId);

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

            // ✅ POST + _method=PUT بدل PUT مباشرة (FormData مش بيشتغل مع PUT)
            console.log(
                "🌐 POST → /api/v1/idea-domain-requests/",
                requestId,
                "← مع _method=PUT في FormData",
            );

            const response = await fetch(
                `/api/v1/idea-domain-requests/${requestId}`,
                {
                    method: "POST", // ✅ التعديل الوحيد هنا!
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-XSRF-TOKEN": csrfToken,
                    },
                    body: formDataSubmit, // ✅ FormData فيه _method=PUT من الـ Hook
                },
            );

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
                        toast.error(errorMessages[0] || "حدث خطأ في التحديث");
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
            console.log("✅ Update response:", result);

            toast.success("تم تحديث طلب الدومين بنجاح! ✨");
            resetForm();
            onSuccess();
            onClose(); // ✅ إضافة إغلاق الـ Modal
        } catch (error: any) {
            console.error("💥 Update error:", error);
            toast.error(error.message || "حدث خطأ في التحديث");
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
                                className="ParentModel__close text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="ParentModel__main">
                            <div className="ParentModel__date">
                                <p className="text-green-600 font-semibold">
                                    ✏️ تعديل طلب دومين
                                </p>
                            </div>
                            <div className="ParentModel__innerTitle">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    تعديل طلب الدومين #{initialRequest.id}
                                </h1>
                                <p className="text-gray-600">
                                    قم بتعديل بيانات طلب الدومين المطلوب لمركزك
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
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-black shadow-sm ${
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
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-black shadow-sm font-mono ${
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
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-black shadow-sm font-mono ${
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
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-black shadow-sm font-mono ${
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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-vertical focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-black shadow-sm"
                                        placeholder="أي ملاحظات إضافية حول طلب الدومين..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* أزرار الإجراءات */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-lg"
                                >
                                    ❌ إلغاء
                                </button>
                                <button
                                    type="button"
                                    onClick={() => submitForm(handleSubmit)}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center text-lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                            جاري التحديث...
                                        </>
                                    ) : (
                                        <>
                                            <span className="mr-2">✨</span>
                                            تحديث الطلب
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

export default UpdateDomainRequestModal;
