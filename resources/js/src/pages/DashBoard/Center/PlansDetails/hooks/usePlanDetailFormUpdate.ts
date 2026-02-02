// src/pages/DashBoard/Center/Plans/hooks/usePlanDetailFormUpdate.ts
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
    status: "pending" | "current" | "current" | "completed";
}

interface FormErrors {
    [key: string]: string;
}

export const usePlanDetailFormUpdate = (detailId: number) => {
    const [formData, setFormData] = useState<FormData>({
        day_number: "",
        new_memorization: "",
        review_memorization: "",
        status: "pending",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [existingDays, setExistingDays] = useState<PlanDetailType[]>([]);

    // Fetch detail data
    useEffect(() => {
        if (detailId) {
            fetchDetail();
            fetchPlanDays();
        }
    }, [detailId]);

    const fetchDetail = useCallback(async () => {
        try {
            setLoadingDetail(true);
            const response = await fetch(`/api/v1/plan-details/${detailId}`, {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const detailData = await response.json();
                setFormData({
                    day_number: detailData.day_number.toString(),
                    new_memorization: detailData.new_memorization || "",
                    review_memorization: detailData.review_memorization || "",
                    status: detailData.status,
                });
            }
        } catch (error) {
            console.error("Failed to fetch plan detail:", error);
            toast.error("فشل في تحميل بيانات اليوم");
        } finally {
            setLoadingDetail(false);
        }
    }, [detailId]);

    const fetchPlanDays = useCallback(async () => {
        try {
            // Get plan ID from detail URL or API
            const response = await fetch(`/api/v1/plan-details/${detailId}`, {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                const detailData = await response.json();
                const planResponse = await fetch(
                    `/api/v1/plans/${detailData.plan_id}/details`,
                    {
                        credentials: "include",
                        headers: { Accept: "application/json" },
                    },
                );
                if (planResponse.ok) {
                    const data = await planResponse.json();
                    setExistingDays(data.data || []);
                }
            }
        } catch (error) {
            console.error("Failed to fetch plan days:", error);
        }
    }, [detailId]);

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
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const submitForm = useCallback(
        async (onSubmit: (formData: FormData) => Promise<void>) => {
            if (!validateForm()) return;

            setIsSubmitting(true);
            try {
                const formDataSubmit = new FormData();
                formDataSubmit.append("_method", "PUT");
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
        loadingDetail,
        existingDays,
    };
};
