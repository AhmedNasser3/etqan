// hooks/useDomainRequestFormCreate.ts - Debug Mode 🚨
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

const getCsrfToken = (): string => {
    const cookies = document.cookie.split(";");
    const csrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("XSRF-TOKEN="),
    );
    const token = csrfCookie
        ? decodeURIComponent(csrfCookie.split("=")[1])
        : "";

    console.log("🔐 CSRF Debug:", {
        allCookies: document.cookie,
        hasCsrfCookie: !!csrfCookie,
        csrfToken: token ? `${token.substring(0, 20)}...` : "NO TOKEN",
        cookieCount: cookies.length,
    });

    return token;
};

interface DomainRequestFormData {
    hosting_name: string;
    requested_domain: string;
    dns1: string;
    dns2: string;
    notes?: string;
}

export const useDomainRequestFormCreate = () => {
    const [formData, setFormData] = useState<DomainRequestFormData>({
        hosting_name: "",
        requested_domain: "",
        dns1: "",
        dns2: "",
        notes: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = useCallback((data: DomainRequestFormData) => {
        const newErrors: Record<string, string> = {};

        if (!data.hosting_name.trim())
            newErrors.hosting_name = "اسم الاستضافة مطلوب";
        if (!data.requested_domain.trim())
            newErrors.requested_domain = "الدومين المطلوب مطلوب";
        else if (
            !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(
                data.requested_domain,
            )
        )
            newErrors.requested_domain = "صيغة الدومين غير صحيحة";
        if (!data.dns1.trim()) newErrors.dns1 = "DNS الأول مطلوب";
        if (!data.dns2.trim()) newErrors.dns2 = "DNS الثاني مطلوب";

        console.log(" Validation Debug:", {
            errors: newErrors,
            isValid: Object.keys(newErrors).length === 0,
        });
        return newErrors;
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));

            if (errors[name as keyof DomainRequestFormData]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name as keyof DomainRequestFormData];
                    return newErrors;
                });
            }
        },
        [errors],
    );

    const submitForm = useCallback(
        async (
            submitHandler: (formDataToSubmit: FormData) => Promise<void>,
        ) => {
            console.log("🚀 SUBMIT START - Full Debug Mode");

            //  Validation
            const validationErrors = validateForm(formData);
            if (Object.keys(validationErrors).length > 0) {
                console.log("❌ VALIDATION FAILED:", validationErrors);
                setErrors(validationErrors);
                toast.error("يرجى تصحيح الأخطاء الموجودة");
                return;
            }

            console.log(" VALIDATION PASSED - FormData:", formData);

            setIsSubmitting(true);
            const formDataToSubmit = new FormData();

            //  Build FormData
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    formDataToSubmit.append(key, value.toString());
                }
            });

            console.log("📤 FormData Debug:", {
                keys: Array.from(formDataToSubmit.keys()),
                values: Array.from(formDataToSubmit.values()),
                totalEntries: formDataToSubmit.entries().next().done
                    ? 0
                    : "multiple",
            });

            //  CSRF Debug قبل الإرسال
            const csrfToken = getCsrfToken();
            console.log("🔐 FINAL CSRF CHECK:", {
                csrfTokenExists: !!csrfToken,
            });

            try {
                console.log("🌐 CALLING SUBMIT HANDLER...");
                await submitHandler(formDataToSubmit);
                console.log(" SUBMIT HANDLER SUCCESS!");
                toast.success("تم إرسال طلب الدومين بنجاح!");
                resetForm();
            } catch (error: any) {
                console.error("💥 FULL ERROR DEBUG:", {
                    message: error.message,
                    status: error.status,
                    statusText: error.statusText,
                    responseURL: error.url || "unknown",
                    stack: error.stack,
                    fullError: error,
                });

                //  Debug الـ response text
                if (error.responseText) {
                    console.log(
                        "📄 RAW RESPONSE:",
                        error.responseText.substring(0, 500),
                    );
                }

                toast.error(error.message || "حدث خطأ في الإرسال");
            } finally {
                setIsSubmitting(false);
                console.log("🏁 SUBMIT FINISHED");
            }
        },
        [formData, validateForm],
    );

    const resetForm = useCallback(() => {
        setFormData({
            hosting_name: "",
            requested_domain: "",
            dns1: "",
            dns2: "",
            notes: "",
        });
        setErrors({});
        console.log("🔄 Form Reset");
    }, []);

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        resetForm,
    };
};
