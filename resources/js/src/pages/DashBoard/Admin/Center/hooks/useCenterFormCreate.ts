import { useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";

//  CSRF Token Helper
const getCsrfToken = (): string => {
    const cookies = document.cookie.split(";");
    const csrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("XSRF-TOKEN="),
    );
    return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
};

interface CenterFormData {
    circle_name: string;
    manager_name: string;
    manager_email: string;
    manager_phone: string;
    country_code: string;
    domain: string;
    circle_link: string;
    logo: File | null;
    notes: string;
}

export const useCenterFormCreate = () => {
    const [formData, setFormData] = useState<CenterFormData>({
        circle_name: "",
        manager_name: "",
        manager_email: "",
        manager_phone: "",
        country_code: "966",
        domain: "",
        circle_link: "",
        logo: null,
        notes: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const logoPreviewUrl = useRef<string | null>(null);

    const validateForm = useCallback((data: CenterFormData) => {
        const newErrors: Record<string, string> = {};

        if (!data.circle_name.trim())
            newErrors.circle_name = "اسم المجمع مطلوب";
        if (!data.manager_name.trim())
            newErrors.manager_name = "اسم المدير مطلوب";
        if (!data.manager_email.trim())
            newErrors.manager_email = "البريد الإلكتروني مطلوب";
        else if (!/\S+@\S+\.\S+/.test(data.manager_email))
            newErrors.manager_email = "البريد الإلكتروني غير صحيح";
        if (!data.manager_phone.trim())
            newErrors.manager_phone = "رقم الجوال مطلوب";

        return newErrors;
    }, []);

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));

            if (errors[name as keyof CenterFormData]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name as keyof CenterFormData];
                    return newErrors;
                });
            }
        },
        [errors],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && file.size <= 2 * 1024 * 1024) {
                // 2MB
                // Cleanup previous preview
                if (logoPreviewUrl.current) {
                    URL.revokeObjectURL(logoPreviewUrl.current);
                }

                const preview = URL.createObjectURL(file);
                logoPreviewUrl.current = preview;
                setFormData((prev) => ({ ...prev, logo: file }));

                if (errors.logo) {
                    setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.logo;
                        return newErrors;
                    });
                }
                toast.success("تم تحميل الصورة بنجاح");
            } else {
                toast.error("الملف كبير جداً (الحد الأقصى 2 ميجا بايت)");
            }
        },
        [errors],
    );

    const submitForm = useCallback(
        async (submitHandler: (formData: FormData) => Promise<void>) => {
            const validationErrors = validateForm(formData);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                toast.error("يرجى تصحيح الأخطاء الموجودة");
                return;
            }

            setIsSubmitting(true);
            const formDataToSubmit = new FormData();

            //  بناء FormData بشكل صحيح
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    if (value instanceof File) {
                        formDataToSubmit.append(key, value);
                    } else {
                        formDataToSubmit.append(key, value.toString());
                    }
                }
            });

            //  is_active = 1 افتراضياً للإنشاء الجديد
            formDataToSubmit.append("is_active", "1");

            console.log(
                "📤 Creating center with FormData keys:",
                Array.from(formDataToSubmit.keys()),
            );

            try {
                await submitHandler(formDataToSubmit);
            } catch (error: any) {
                console.error("Submit error:", error);
                toast.error(error.message || "حدث خطأ في الإرسال");
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm],
    );

    const resetForm = useCallback(() => {
        if (logoPreviewUrl.current) {
            URL.revokeObjectURL(logoPreviewUrl.current);
            logoPreviewUrl.current = null;
        }
        setFormData({
            circle_name: "",
            manager_name: "",
            manager_email: "",
            manager_phone: "",
            country_code: "966",
            domain: "",
            circle_link: "",
            logo: null,
            notes: "",
        });
        setErrors({});
        setLogoPreview(null);
        toast.success("تم إعادة تعيين النموذج");
    }, []);

    return {
        formData,
        errors,
        isSubmitting,
        logoPreview: logoPreviewUrl.current,
        handleInputChange,
        handleFileChange,
        submitForm,
        resetForm,
    };
};
