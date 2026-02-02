// src/pages/DashBoard/Center/Plans/hooks/usePlanFormCreate.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

interface CenterType {
    id: number;
    name: string;
}

interface FormData {
    plan_name: string;
    center_id: string;
    total_months: string;
    notes?: string;
}

interface FormErrors {
    [key: string]: string;
}

export const usePlanFormCreate = () => {
    const [formData, setFormData] = useState<FormData>({
        plan_name: "",
        center_id: "",
        total_months: "",
        notes: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [centersData, setCentersData] = useState<CenterType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Fetch User info أولاً
    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch("/api/user", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    }, []);

    // Fetch Centers حسب الـ role
    useEffect(() => {
        if (user) {
            fetchCenters();
        }
    }, [user]);

    const fetchCenters = useCallback(async () => {
        try {
            setLoadingData(true);
            const response = await fetch("/api/v1/centers", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                let centers: CenterType[] = [];

                // Center Owner → مركزه بس
                if (user?.role?.id === 1 && user.center_id) {
                    const userCenter = data.data?.find(
                        (c: any) => c.id === user.center_id,
                    );
                    if (userCenter) {
                        centers = [userCenter];
                    }
                } else {
                    // Admin → كل المراكز
                    centers = data.data || [];
                }

                setCentersData(centers);
            }
        } catch (error) {
            console.error("Failed to fetch centers:", error);
            toast.error("فشل في تحميل المراكز");
        } finally {
            setLoadingData(false);
        }
    }, [user]);

    // Form handlers
    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
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

        if (!formData.plan_name.trim()) newErrors.plan_name = "اسم الخطة مطلوب";
        if (!formData.center_id) newErrors.center_id = "المجمع مطلوب";
        if (!formData.total_months || parseInt(formData.total_months) < 1) {
            newErrors.total_months = "مدة الخطة يجب أن تكون أكبر من 0";
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
                formDataSubmit.append("plan_name", formData.plan_name);
                formDataSubmit.append("center_id", formData.center_id);
                formDataSubmit.append("total_months", formData.total_months);
                if (formData.notes)
                    formDataSubmit.append("notes", formData.notes);

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
        centersData,
        loadingData,
        user,
    };
};
