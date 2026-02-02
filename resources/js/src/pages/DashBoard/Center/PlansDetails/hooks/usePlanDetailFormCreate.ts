// src/pages/DashBoard/Center/Plans/hooks/usePlanDetailFormCreate.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface PlanDetailType {
    id: number;
    day_number: number;
    new_memorization: string | null;
    review_memorization: string | null;
    status: "pending" | "current" | "completed";
}

interface FormData {
    day_number: string;
    new_memorization: string;
    review_memorization: string;
    status: "pending" | "current" | "completed";
}

interface FormErrors {
    [key: string]: string;
}

export const usePlanDetailFormCreate = (planId: number) => {
    const [formData, setFormData] = useState<FormData>({
        day_number: "",
        new_memorization: "",
        review_memorization: "",
        status: "pending",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingDays, setExistingDays] = useState<PlanDetailType[]>([]);
    const [loadingDays, setLoadingDays] = useState(true);

    // Fetch existing days for this plan
    useEffect(() => {
        fetchExistingDays();
    }, [planId]);

    const fetchExistingDays = useCallback(async () => {
        try {
            setLoadingDays(true);
            const response = await fetch(`/api/v1/plans/${planId}/details`, {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                setExistingDays(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch plan days:", error);
        } finally {
            setLoadingDays(false);
        }
    }, [planId]);

    // Form handlers
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors],
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.day_number || parseInt(formData.day_number) < 1) {
            newErrors.day_number = "رقم اليوم مطلوب ويجب أن يكون أكبر من 0";
        } else if (
            existingDays.some(
                (day) => day.day_number === parseInt(formData.day_number),
            )
        ) {
            newErrors.day_number = "هذا اليوم موجود بالفعل";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, existingDays]);

    const submitForm = useCallback(
        async (onSubmit: (formData: FormData) => Promise<void>) => {
            if (!validateForm()) return;

            setIsSubmitting(true);
            try {
                const formDataSubmit = new FormData();
                formDataSubmit.append("day_number", formData.day_number);
                formDataSubmit.append(
                    "new_memorization",
                    formData.new_memorization,
                );
                formDataSubmit.append(
                    "review_memorization",
                    formData.review_memorization,
                );
                formDataSubmit.append("status", formData.status);

                await onSubmit(formDataSubmit);
            } catch (error) {
                console.error("Submit error:", error);
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
        handleInputChange,
        submitForm,
        existingDays,
        loadingDays,
    };
};
