import { useState, useEffect, useCallback, useRef } from "react";

export interface CenterFormData {
    circle_name: string;
    manager_name: string;
    manager_email: string;
    country_code: string;
    manager_phone: string;
    domain?: string;
    circle_link?: string;
    logo?: File | string | null;
    notes?: string;
}

export const useCenterForm = (initialData?: Partial<CenterFormData> | null) => {
    const [formData, setFormData] = useState<CenterFormData>({
        circle_name: "",
        manager_name: "",
        manager_email: "",
        country_code: "966",
        manager_phone: "",
        domain: "",
        circle_link: "",
        logo: null,
        notes: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const logoPreviewUrl = useRef<string | null>(null);

    useEffect(() => {
        if (initialData) {
            const newLogo = (initialData as any).logo || null;
            setFormData({
                circle_name:
                    (initialData as any).circle_name ||
                    (initialData as any).circleName ||
                    "",
                manager_name:
                    (initialData as any).manager_name ||
                    (initialData as any).managerName ||
                    "",
                manager_email:
                    (initialData as any).manager_email ||
                    (initialData as any).managerEmail ||
                    "",
                country_code: (
                    (initialData as any).country_code ||
                    (initialData as any).countryCode ||
                    "966"
                )
                    .toString()
                    .replace("+", ""),
                manager_phone:
                    (initialData as any).manager_phone ||
                    (initialData as any).managerPhone ||
                    "",
                domain: (initialData as any).domain || "",
                circle_link:
                    (initialData as any).circle_link ||
                    (initialData as any).circleLink ||
                    "",
                logo: newLogo,
                notes: (initialData as any).notes || "",
            });

            if (typeof newLogo === "string" && newLogo) {
                logoPreviewUrl.current = `/storage/${newLogo}`;
            }
            setErrors({});
        }
    }, [initialData]);

    const validateForm = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.circle_name.trim())
            newErrors.circle_name = "اسم المجمع مطلوب";
        if (!formData.manager_name.trim())
            newErrors.manager_name = "اسم المدير مطلوب";
        if (!formData.manager_email.trim())
            newErrors.manager_email = "البريد الإلكتروني مطلوب";
        else if (!/\S+@\S+\.\S+/.test(formData.manager_email))
            newErrors.manager_email = "البريد الإلكتروني غير صحيح";
        if (!formData.manager_phone.trim())
            newErrors.manager_phone = "رقم الجوال مطلوب";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
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
            if (file) {
                if (logoPreviewUrl.current) {
                    URL.revokeObjectURL(logoPreviewUrl.current);
                }
                const previewUrl = URL.createObjectURL(file);
                logoPreviewUrl.current = previewUrl;
                setFormData((prev) => ({ ...prev, logo: file }));
            }
        },
        [],
    );

    const submitForm = useCallback(
        async (onSubmit: (data: FormData) => Promise<void>) => {
            if (!validateForm()) {
                return;
            }

            setIsSubmitting(true);

            const formDataToSubmit = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    if (key === "logo" && value instanceof File) {
                        formDataToSubmit.append(key, value);
                    } else if (key !== "logo") {
                        formDataToSubmit.append(key, value.toString());
                    }
                }
            });

            try {
                await onSubmit(formDataToSubmit);
            } catch (error) {
                console.error("Submit failed:", error);
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
            country_code: "966",
            manager_phone: "",
            domain: "",
            circle_link: "",
            logo: null,
            notes: "",
        });
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        handleFileChange,
        submitForm,
        resetForm,
        validateForm,
        logoPreview: logoPreviewUrl.current,
    };
};
