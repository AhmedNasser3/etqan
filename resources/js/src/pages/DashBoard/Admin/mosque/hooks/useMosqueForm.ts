// hooks/useMosqueForm.ts
import { useState, useEffect, useCallback, useRef } from "react";

export interface MosqueFormData {
    mosque_name: string;
    center_id: string;
    supervisor_id: string;
    notes?: string;
    logo?: File | string | null;
}

export interface CenterOption {
    id: number;
    name: string;
    subdomain: string;
}

export interface UserOption {
    id: number;
    name: string;
    email: string;
}

export const useMosqueForm = (initialData?: Partial<MosqueFormData> | null) => {
    const [formData, setFormData] = useState<MosqueFormData>({
        mosque_name: "",
        center_id: "",
        supervisor_id: "",
        notes: "",
        logo: null,
    });
    const [centers, setCenters] = useState<CenterOption[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const logoPreviewUrl = useRef<string | null>(null);

    // Fetch centers and users
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await fetch("/api/super/mosques");
                const result = await response.json();

                if (result.success) {
                    setCenters(result.centers || []);
                    setUsers(result.users || []);
                }
            } catch (error) {
                console.error("Failed to fetch options:", error);
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, []);

    useEffect(() => {
        if (initialData) {
            const newLogo = (initialData as any).logo || null;
            setFormData({
                mosque_name: (initialData as any).name || "",
                center_id: (initialData as any).circleId?.toString() || "",
                supervisor_id:
                    (initialData as any).supervisorId?.toString() || "",
                notes: (initialData as any).notes || "",
                logo: newLogo,
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

        if (!formData.mosque_name.trim())
            newErrors.mosque_name = "اسم المسجد مطلوب";
        if (!formData.center_id) newErrors.center_id = "المجمع مطلوب";
        if (!formData.supervisor_id) newErrors.supervisor_id = "المشرف مطلوب";

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

            if (errors[name as keyof MosqueFormData]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name as keyof MosqueFormData];
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
            mosque_name: "",
            center_id: "",
            supervisor_id: "",
            notes: "",
            logo: null,
        });
        setErrors({});
    }, []);

    return {
        formData,
        centers,
        users,
        loadingOptions,
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
