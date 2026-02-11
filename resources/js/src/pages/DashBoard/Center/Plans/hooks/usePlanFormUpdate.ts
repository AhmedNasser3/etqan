// src/pages/DashBoard/Center/Plans/hooks/usePlanFormUpdate.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface CenterType {
    id: number;
    name: string;
}

interface PlanType {
    id: number;
    plan_name: string;
    center_id: number;
    total_months: number;
    notes?: string;
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

export const usePlanFormUpdate = (planId: number) => {
    const [formData, setFormData] = useState<FormData>({
        plan_name: "",
        center_id: "",
        total_months: "",
        notes: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPlan, setIsLoadingPlan] = useState(true);
    const [centersData, setCentersData] = useState<CenterType[]>([]);
    const [mosquesData, setMosquesData] = useState<any[]>([]);
    const [teachersData, setTeachersData] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [planData, setPlanData] = useState<PlanType | null>(null);

    useEffect(() => {
        if (planId) {
            loadPlanData();
        }
    }, [planId]);

    const loadPlanData = useCallback(async () => {
        try {
            console.log("🔍 Loading plan data for ID:", planId);
            const response = await fetch(`/api/v1/plans/${planId}`, {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            console.log("Plan response status:", response.status);

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                console.error("Plan API error:", response.status, errorData);
                toast.error("فشل في تحميل الخطة");
                return;
            }

            const plan = await response.json();
            console.log("✅ Plan loaded:", plan);
            setPlanData(plan);

            setFormData({
                plan_name: plan.plan_name || "",
                center_id: plan.center_id?.toString() || "",
                total_months: plan.total_months?.toString() || "",
                notes: plan.notes || "",
            });
        } catch (error) {
            console.error("❌ Load plan data error:", error);
            toast.error("فشل في تحميل الخطة");
        } finally {
            setIsLoadingPlan(false);
        }
    }, [planId]);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            console.log("🔍 Fetching user...");
            const response = await fetch("/api/user", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                const responseData = await response.json();
                const actualUser = responseData.user || responseData;
                console.log("✅ ACTUAL USER:", actualUser);
                setUser(actualUser);
            }
        } catch (error) {
            console.error("❌ Failed to fetch user:", error);
        }
    }, []);

    useEffect(() => {
        if (user) {
            console.log("🚀 User loaded, fetching centers...");
            fetchCenters();
        }
    }, [user]);

    const fetchCenters = useCallback(async () => {
        try {
            console.log("📥 Fetching centers...");
            setLoadingData(true);
            const response = await fetch("/api/v1/centers", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("📊 Centers response:", data);
                let centers: CenterType[] = [];

                const actualUser = user?.user || user;

                if (actualUser?.role?.id === 1 && actualUser.center_id) {
                    const userCenter = data.data?.find(
                        (c: any) => c.id === actualUser.center_id,
                    );
                    if (userCenter) {
                        centers = [userCenter];
                    }
                } else {
                    centers = data.data || [];
                }

                setCentersData(centers);

                if (planData?.center_id) {
                    console.log(
                        "🕌👨‍🏫 Fetching center data for center:",
                        planData.center_id,
                    );
                }
            }
        } catch (error) {
            console.error("❌ Failed to fetch centers:", error);
            toast.error("فشل في تحميل المراكز");
        } finally {
            setLoadingData(false);
        }
    }, [user, planData?.center_id]);

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
        async (onSubmit: (formDataSubmit: FormData) => Promise<void>) => {
            console.log("🚀 UPDATE FORM - formData:", formData);
            if (!validateForm()) {
                console.log("❌ Validation failed");
                return;
            }

            if (!formData.center_id) {
                toast.error("المجمع غير محدد");
                return;
            }

            if (isSubmitting) return;

            setIsSubmitting(true);
            try {
                const formDataSubmit = new FormData();
                formDataSubmit.append("_method", "PUT");
                formDataSubmit.append("plan_name", formData.plan_name);
                formDataSubmit.append("center_id", formData.center_id);
                formDataSubmit.append("total_months", formData.total_months);
                if (formData.notes)
                    formDataSubmit.append("notes", formData.notes);

                console.log("📤 Sending UPDATE FormData:", {
                    plan_name: formData.plan_name,
                    center_id: formData.center_id,
                    total_months: formData.total_months,
                });

                await onSubmit(formDataSubmit);
            } catch (error) {
                console.error("Update error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm, isSubmitting],
    );

    return {
        formData,
        errors,
        isSubmitting,
        isLoadingPlan,
        handleInputChange,
        submitForm,
        centersData,
        loadingData,
        user,
        planData,
    };
};
