// hooks/useSalaryRuleFormUpdate.ts - نفس هيكل Create Hook بالضبط
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface SalaryRuleType {
    id: number;
    role: string;
    base_salary: number;
    working_days: number;
    daily_rate?: number;
    notes?: string;
}

export interface FormData {
    role: string;
    base_salary: string;
    working_days: string;
    daily_rate: string;
    notes: string;
}

interface FormErrors {
    [key: string]: string;
}

export const useSalaryRuleFormUpdate = (salaryRuleId: number) => {
    const [formData, setFormData] = useState<FormData>({
        role: "",
        base_salary: "",
        working_days: "",
        daily_rate: "",
        notes: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [existingRules, setExistingRules] = useState<SalaryRuleType[]>([]);

    // Fetch salary rule data & existing rules
    useEffect(() => {
        if (salaryRuleId) {
            fetchSalaryRule();
            fetchExistingRules();
        }
    }, [salaryRuleId]);

    const fetchSalaryRule = useCallback(async () => {
        try {
            setLoadingDetail(true);
            const response = await fetch(
                `/api/v1/teacher-salaries/${salaryRuleId}`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );

            if (response.ok) {
                const salaryRuleData = await response.json();
                setFormData({
                    role: salaryRuleData.role,
                    base_salary: salaryRuleData.base_salary.toString(),
                    working_days: salaryRuleData.working_days.toString(),
                    daily_rate: salaryRuleData.daily_rate?.toString() || "",
                    notes: salaryRuleData.notes || "",
                });
            }
        } catch (error) {
            console.error("فشل في تحميل بيانات قاعدة الراتب:", error);
            toast.error("فشل في تحميل بيانات قاعدة الراتب");
        } finally {
            setLoadingDetail(false);
        }
    }, [salaryRuleId]);

    const fetchExistingRules = useCallback(async () => {
        try {
            const response = await fetch("/api/v1/teacher-salaries", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                const rules = await response.json();
                setExistingRules(rules.data || rules);
            }
        } catch (error) {
            console.error("فشل في تحميل القواعد الأخرى:", error);
        }
    }, []);

    // حساب الراتب اليومي
    const calculateDailyRate = useCallback(
        (baseSalary: string, workingDays: string) => {
            const base = parseFloat(baseSalary);
            const days = parseInt(workingDays);

            if (base > 0 && days > 0) {
                const dailyRate = (base / days).toFixed(2);
                setFormData((prev) => ({ ...prev, daily_rate: dailyRate }));
            }
        },
        [],
    );

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;

            setFormData((prev) => {
                const newData = { ...prev, [name]: value };

                // حساب الراتب اليومي
                if (name === "base_salary" || name === "working_days") {
                    calculateDailyRate(
                        newData.base_salary,
                        newData.working_days,
                    );
                }

                return newData;
            });

            // مسح الخطأ
            if (errors[name as keyof FormErrors]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name as keyof FormErrors];
                    return newErrors;
                });
            }
        },
        [errors, calculateDailyRate],
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.role) {
            newErrors.role = "الرجاء اختيار الدور";
        }

        const baseSalary = parseFloat(formData.base_salary);
        if (!formData.base_salary || baseSalary <= 0) {
            newErrors.base_salary = "الراتب الأساسي مطلوب وقيمة موجبة";
        }

        const workingDays = parseInt(formData.working_days);
        if (!formData.working_days || workingDays < 1 || workingDays > 31) {
            newErrors.working_days = "أيام العمل يجب أن تكون بين 1 و 31";
        }

        // فحص تكرار الدور (باستثناء القاعدة الحالية)
        if (
            existingRules.some(
                (rule) =>
                    rule.role === formData.role && rule.id !== salaryRuleId,
            )
        ) {
            newErrors.role = "يوجد بالفعل قاعدة راتب أخرى لهذا الدور";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, existingRules, salaryRuleId]);

    const submitForm = useCallback(async (): Promise<boolean> => {
        if (!validateForm()) return false;

        setIsSubmitting(true);
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const formDataSubmit = new FormData();
            formDataSubmit.append("_method", "PUT");
            formDataSubmit.append("role", formData.role);
            formDataSubmit.append("base_salary", formData.base_salary);
            formDataSubmit.append("working_days", formData.working_days);

            if (formData.daily_rate) {
                formDataSubmit.append("daily_rate", formData.daily_rate);
            }
            if (formData.notes) {
                formDataSubmit.append("notes", formData.notes);
            }

            const response = await fetch(
                `/api/v1/teacher-salaries/${salaryRuleId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: formDataSubmit,
                },
            );

            console.log("📤 Response status:", response.status);

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                console.error("❌ Error response:", errorData);

                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(errorMessages[0] || "حدث خطأ في التحديث");
                    return false;
                }
                if (response.status === 401) {
                    toast.error("⚠️ يرجى تسجيل الدخول مرة أخرى");
                    return false;
                }
                if (response.status === 422) {
                    toast.error("يوجد قاعدة راتب مسجلة لهذا الدور بالفعل");
                    return false;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("✅ Update salary rule success:", result);
            toast.success("تم تحديث قاعدة الراتب بنجاح!");
            return true;
        } catch (error: any) {
            console.error("❌ Update salary rule error:", error);
            toast.error(error.message || "حدث خطأ في التحديث");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm, salaryRuleId]);

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        loadingDetail,
        existingRules,
    };
};
