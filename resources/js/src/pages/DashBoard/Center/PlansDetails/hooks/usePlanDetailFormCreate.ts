import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface PlanDetailType {
    id: number;
    day_number: number;
    new_memorization: string | null;
    review_memorization: string | null;
    status: "pending" | "current" | "completed";
}

export interface PlanType {
    id: number;
    plan_name: string;
    center_id: number;
}

interface FormData {
    plan_id: number;
    day_number: string;
    new_memorization: string;
    review_memorization: string;
    status: "pending" | "current" | "completed";
}

interface FormErrors {
    [key: string]: string;
}

export const usePlanDetailFormCreate = () => {
    const [formData, setFormData] = useState<FormData>({
        plan_id: 0,
        day_number: "",
        new_memorization: "",
        review_memorization: "",
        status: "pending",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [availablePlans, setAvailablePlans] = useState<PlanType[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [existingDays, setExistingDays] = useState<PlanDetailType[]>([]);
    const [loadingDays, setLoadingDays] = useState(false);

    //  1- جلب خطط المجمع الخاص بي - إصلاح 404
    useEffect(() => {
        fetchAvailablePlans();
    }, []);

    const fetchAvailablePlans = useCallback(async () => {
        try {
            setLoadingPlans(true);
            console.log("📡 جاري تحميل خطط المجمع...");

            //  إصلاح 404 - استخدم الـ endpoint الصحيح
            const response = await fetch(`/api/v1/plans/my-center`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    //  إزالة Content-Type للـ GET requests
                },
            });

            console.log(
                "📡 Response status:",
                response.status,
                response.statusText,
            );

            if (response.status === 401) {
                console.error("❌ غير مصرح - 401");
                toast.error("⚠️ يرجى تسجيل الدخول مرة أخرى");
                setAvailablePlans([]);
                return;
            }

            if (response.status === 404) {
                console.error("❌ Route غير موجود - 404");
                console.log("🔧 جرب: /api/v1/plans/my-center-plans");
                toast.error("🔧 خطأ في الراوت - تحقق من الـ backend");
                setAvailablePlans([]);
                return;
            }

            if (response.ok) {
                const data = await response.json();
                console.log(" خطط المجمع:", data);
                setAvailablePlans(data.data || data || []);
            } else {
                const errorText = await response.text();
                console.error(
                    "❌ فشل تحميل الخطط:",
                    response.status,
                    errorText,
                );
                toast.error("فشل في تحميل الخطط");
                setAvailablePlans([]);
            }
        } catch (error) {
            console.error("❌ خطأ شبكة تحميل الخطط:", error);
            toast.error("خطأ في الاتصال بالخادم");
            setAvailablePlans([]);
        } finally {
            setLoadingPlans(false);
        }
    }, []);

    //  2- جلب أيام الخطة المختارة
    useEffect(() => {
        if (formData.plan_id > 0) {
            fetchExistingDays(formData.plan_id);
        } else {
            setExistingDays([]);
        }
    }, [formData.plan_id]);

    const fetchExistingDays = useCallback(async (planId: number) => {
        try {
            setLoadingDays(true);
            console.log(`📡 جاري تحميل أيام الخطة ${planId}...`);

            const response = await fetch(`/api/v1/plans/${planId}/details`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(" أيام الخطة:", data);
                setExistingDays(data.data || data || []);
            } else {
                console.error("❌ خطأ تحميل أيام الخطة:", response.status);
                setExistingDays([]);
            }
        } catch (error) {
            console.error("❌ خطأ شبكة أيام الخطة:", error);
            setExistingDays([]);
        } finally {
            setLoadingDays(false);
        }
    }, []);

    //  3- تغيير الـ inputs
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

    //  4- التحقق من صحة النموذج
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.plan_id || formData.plan_id === 0) {
            newErrors.plan_id = "يرجى اختيار خطة";
        }

        if (!formData.day_number || parseInt(formData.day_number) < 1) {
            newErrors.day_number = "رقم اليوم مطلوب ويجب أن يكون أكبر من 0";
        } else if (
            existingDays.some(
                (day) => day.day_number === parseInt(formData.day_number),
            )
        ) {
            newErrors.day_number = "هذا اليوم موجود بالفعل في الخطة المختارة";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, existingDays]);

    //  5- إرسال النموذج
    const submitForm = useCallback(
        async (onSubmit: (formDataSubmit: FormData) => Promise<void>) => {
            console.log("🚀 بدء الإرسال...");
            if (!validateForm()) {
                console.log("❌ فشل التحقق من صحة النموذج");
                return;
            }

            setIsSubmitting(true);
            try {
                const formDataSubmit = new FormData();
                formDataSubmit.append("plan_id", formData.plan_id.toString());
                formDataSubmit.append("day_number", formData.day_number);
                formDataSubmit.append(
                    "new_memorization",
                    formData.new_memorization || "",
                );
                formDataSubmit.append(
                    "review_memorization",
                    formData.review_memorization || "",
                );
                formDataSubmit.append("status", formData.status);

                console.log("📤 البيانات المرسلة:", {
                    plan_id: formData.plan_id,
                    day_number: formData.day_number,
                    new_memorization: formData.new_memorization,
                    review_memorization: formData.review_memorization,
                    status: formData.status,
                });

                await onSubmit(formDataSubmit);
            } catch (error) {
                console.error("❌ خطأ الإرسال:", error);
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
        availablePlans,
        loadingPlans,
        existingDays,
        loadingDays,
        handleInputChange,
        submitForm,
        setFormData,
    };
};
