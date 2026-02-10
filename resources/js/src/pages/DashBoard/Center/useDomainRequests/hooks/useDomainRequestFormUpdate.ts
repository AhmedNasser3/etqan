import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

interface DomainRequestFormData {
    hosting_name: string;
    requested_domain: string;
    dns1: string;
    dns2: string;
    notes?: string;
}

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

interface UseDomainRequestFormUpdateProps {
    initialRequest?: DomainRequest | null;
}

export const useDomainRequestFormUpdate = ({
    initialRequest,
}: UseDomainRequestFormUpdateProps) => {
    const [formData, setFormData] = useState<DomainRequestFormData>({
        hosting_name: initialRequest?.hosting_name || "",
        requested_domain: initialRequest?.requested_domain || "",
        dns1: initialRequest?.dns1 || "",
        dns2: initialRequest?.dns2 || "",
        notes: initialRequest?.notes || "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load initial data when prop changes
    useEffect(() => {
        if (initialRequest) {
            setFormData({
                hosting_name: initialRequest.hosting_name || "",
                requested_domain: initialRequest.requested_domain || "",
                dns1: initialRequest.dns1 || "",
                dns2: initialRequest.dns2 || "",
                notes: initialRequest.notes || "",
            });
            setErrors({});
        }
    }, [initialRequest]);

    const validateForm = useCallback((data: DomainRequestFormData) => {
        const newErrors: Record<string, string> = {};

        if (!data.hosting_name.trim()) {
            newErrors.hosting_name = "اسم الاستضافة مطلوب";
        }
        if (!data.requested_domain.trim()) {
            newErrors.requested_domain = "الدومين المطلوب مطلوب";
        } else if (
            !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(
                data.requested_domain,
            )
        ) {
            newErrors.requested_domain = "صيغة الدومين غير صحيحة (example.com)";
        }
        if (!data.dns1.trim()) {
            newErrors.dns1 = "DNS الأول مطلوب";
        }
        if (!data.dns2.trim()) {
            newErrors.dns2 = "DNS الثاني مطلوب";
        }

        return newErrors;
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));

            // Clear error when user types
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

    // Same signature as Create hook - submitForm(handelSubmit)
    const submitForm = useCallback(
        async (
            submitHandler: (formDataToSubmit: FormData) => Promise<void>,
        ) => {
            // Client validation first
            const validationErrors = validateForm(formData);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                toast.error("يرجى تصحيح الأخطاء الموجودة");
                return;
            }

            setIsSubmitting(true);
            const formDataToSubmit = new FormData();

            // Laravel needs _method=PUT for FormData PUT requests
            formDataToSubmit.append("_method", "PUT");

            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value && value.trim() !== "") {
                    formDataToSubmit.append(key, value);
                }
            });

            try {
                await submitHandler(formDataToSubmit);
            } catch (error: any) {
                console.error("Submit error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm],
    );

    const resetForm = useCallback(() => {
        if (initialRequest) {
            setFormData({
                hosting_name: initialRequest.hosting_name || "",
                requested_domain: initialRequest.requested_domain || "",
                dns1: initialRequest.dns1 || "",
                dns2: initialRequest.dns2 || "",
                notes: initialRequest.notes || "",
            });
        } else {
            setFormData({
                hosting_name: "",
                requested_domain: "",
                dns1: "",
                dns2: "",
                notes: "",
            });
        }
        setErrors({});
    }, [initialRequest]);

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        resetForm,
    };
};
