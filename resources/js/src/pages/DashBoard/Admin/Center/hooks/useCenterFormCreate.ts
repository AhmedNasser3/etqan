// hooks/useCenterFormCreate.ts
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

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
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && file.size <= 2 * 1024 * 1024) {
                setFormData((prev) => ({ ...prev, logo: file }));
                const preview = URL.createObjectURL(file);
                setLogoPreview(preview);
                if (errors.logo) setErrors((prev) => ({ ...prev, logo: "" }));
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
            Object.entries(formData).forEach(([key, value]) => {
                if (value instanceof File) {
                    formDataToSubmit.append(key, value);
                } else if (value) {
                    formDataToSubmit.append(key, value);
                }
            });
            formDataToSubmit.append("is_active", "1");

            try {
                await submitHandler(formDataToSubmit);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm],
    );

    return {
        formData,
        errors,
        isSubmitting,
        logoPreview,
        handleInputChange,
        handleFileChange,
        submitForm,
    };
};
