// src/pages/DashBoard/Center/Plans/hooks/usePlanFormCreate.ts
import { useState, useEffect, useCallback } from "react";
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
                console.log(" ACTUAL USER:", actualUser);
                setUser(actualUser);
            }
        } catch (error) {
            console.error("❌ Failed to fetch user:", error);
        }
    }, []);

    // Auto-set center_id for center owners
    useEffect(() => {
        if (user?.center_id && !formData.center_id) {
            console.log("🏢 Auto-setting center_id:", user.center_id);
            setFormData((prev) => ({
                ...prev,
                center_id: user.center_id.toString(),
            }));
        }
    }, [user?.center_id, formData.center_id]);

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
                        console.log(
                            "🏢 Center Owner - single center:",
                            userCenter,
                        );
                    }
                } else {
                    centers = data.data || [];
                    console.log("👑 Admin - all centers:", centers.length);
                }

                setCentersData(centers);
            }
        } catch (error) {
            console.error("❌ Failed to fetch centers:", error);
            toast.error("فشل في تحميل المراكز");
            setCentersData([]);
        } finally {
            console.log(" Centers loading finished");
            setLoadingData(false);
        }
    }, [user]);

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
            console.log("🚀 SUBMIT FORM - formData:", formData);
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
                formDataSubmit.append("plan_name", formData.plan_name);
                formDataSubmit.append("center_id", formData.center_id);
                formDataSubmit.append("total_months", formData.total_months);
                if (formData.notes)
                    formDataSubmit.append("notes", formData.notes);

                console.log("📤 Sending FormData:", {
                    plan_name: formData.plan_name,
                    center_id: formData.center_id,
                    total_months: formData.total_months,
                });

                await onSubmit(formDataSubmit);
            } catch (error) {
                console.error("Submit error:", error);
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
        handleInputChange,
        submitForm,
        centersData,
        loadingData,
        user,
    };
};
