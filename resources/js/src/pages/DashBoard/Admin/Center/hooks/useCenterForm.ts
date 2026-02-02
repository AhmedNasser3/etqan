import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

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

// ✅ CSRF Token Helper
const getCsrfToken = (): string => {
    const cookies = document.cookie.split(";");
    const csrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("XSRF-TOKEN="),
    );
    return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
};

// ✅ API Fetch Helper
const apiFetch = async (url: string, options: RequestInit = {}) => {
    // CSRF Token أولاً
    if (!document.cookie.includes("XSRF-TOKEN=")) {
        await fetch("/sanctum/csrf-cookie", {
            credentials: "include",
            headers: { Accept: "application/json" },
        });
    }

    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-XSRF-TOKEN": getCsrfToken(),
            ...(options.headers as any),
        },
    });

    console.log(`🌐 ${url} → Status: ${response.status}`);

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${response.status}:`, errorText.substring(0, 200));
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
};

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
    const [loadingCountries, setLoadingCountries] = useState(false);
    const logoPreviewUrl = useRef<string | null>(null);

    // ✅ تحميل قائمة الدول (اختياري)
    useEffect(() => {
        const loadCountries = async () => {
            try {
                setLoadingCountries(true);
                // يمكنك استخدام API خارجي أو قائمة محلية
                console.log("✅ Countries loaded (static list)");
            } catch (error) {
                console.error("Failed to load countries:", error);
            } finally {
                setLoadingCountries(false);
            }
        };
        loadCountries();
    }, []);

    useEffect(() => {
        if (initialData) {
            const newLogo = (initialData as any).logo || null;
            setFormData({
                circle_name:
                    (initialData as any).circle_name ||
                    (initialData as any).circleName ||
                    (initialData as any).name ||
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
                logoPreviewUrl.current = newLogo.startsWith("http")
                    ? newLogo
                    : `/storage/${newLogo}`;
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
                toast.success("تم تحميل الصورة بنجاح");
            }
        },
        [],
    );

    // ✅ submitForm مع FormData headers صح
    const submitForm = useCallback(
        async (onSubmit: (data: FormData) => Promise<void>) => {
            if (!validateForm()) {
                toast.error("يرجى تصحيح الأخطاء الموجودة");
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
            } catch (error: any) {
                console.error("Submit failed:", error);
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
            country_code: "966",
            manager_phone: "",
            domain: "",
            circle_link: "",
            logo: null,
            notes: "",
        });
        setErrors({});
        toast.success("تم إعادة تعيين النموذج");
    }, []);

    return {
        formData,
        errors,
        isSubmitting,
        loadingCountries,
        handleInputChange,
        handleFileChange,
        submitForm,
        resetForm,
        validateForm,
        logoPreview: logoPreviewUrl.current,
    };
};
