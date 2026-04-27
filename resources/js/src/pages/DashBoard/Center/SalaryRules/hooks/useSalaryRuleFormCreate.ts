// hooks/useSalaryRuleFormCreate.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { CurrencyCode } from "../SalaryRulesManagement";

export interface FormData {
    role: string;
    currency: CurrencyCode;
    base_salary: string;
    working_days: string;
    daily_rate: string;
    notes: string;
}

interface SalaryRule {
    id: number;
    role: string;
    currency?: CurrencyCode;
    base_salary: number;
    working_days: number;
    daily_rate?: number;
    notes?: string;
}

interface FormErrors {
    role?: string;
    base_salary?: string;
    working_days?: string;
}

export const useSalaryRuleFormCreate = () => {
    const [formData, setFormData] = useState<FormData>({
        role: "",
        currency: "SAR",
        base_salary: "",
        working_days: "",
        daily_rate: "",
        notes: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingRules, setExistingRules] = useState<SalaryRule[]>([]);
    const [loadingRules, setLoadingRules] = useState(true);

    useEffect(() => {
        fetchExistingRules();
    }, []);

    const fetchExistingRules = useCallback(async () => {
        try {
            setLoadingRules(true);
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch("/api/v1/teacher-salaries", {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            if (response.ok) {
                const rulesResponse = await response.json();
                setExistingRules(rulesResponse.data || rulesResponse || []);
            }
        } catch (error) {
            console.error("خطأ في تحميل القواعد:", error);
        } finally {
            setLoadingRules(false);
        }
    }, []);

    const validateForm = useCallback((data: FormData): FormErrors => {
        const newErrors: FormErrors = {};

        if (!data.role.trim()) {
            newErrors.role = "الرجاء اختيار الدور";
        }

        const baseSalary = parseFloat(data.base_salary);
        if (!data.base_salary || baseSalary <= 0 || isNaN(baseSalary)) {
            newErrors.base_salary = "الراتب الأساسي مطلوب وقيمة موجبة";
        }

        const workingDays = parseInt(data.working_days);
        if (
            !data.working_days ||
            workingDays < 1 ||
            workingDays > 31 ||
            isNaN(workingDays)
        ) {
            newErrors.working_days = "أيام العمل يجب أن تكون بين 1 و 31";
        }

        return newErrors;
    }, []);

    const calculateDailyRate = useCallback(
        (baseSalary: string, workingDays: string) => {
            const base = parseFloat(baseSalary);
            const days = parseInt(workingDays);

            if (base > 0 && days > 0 && !isNaN(base) && !isNaN(days)) {
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

                if (name === "base_salary" || name === "working_days") {
                    calculateDailyRate(
                        newData.base_salary,
                        newData.working_days,
                    );
                }

                return newData;
            });

            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof FormErrors];
                return newErrors;
            });
        },
        [calculateDailyRate],
    );

    const submitForm = useCallback(async () => {
        const validationErrors = validateForm(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("يرجى تصحيح الأخطاء الموجودة");
            return false;
        }

        const roleExists = existingRules.some(
            (rule) => rule.role === formData.role,
        );
        if (roleExists) {
            setErrors({ role: "يوجد بالفعل قاعدة راتب لهذا الدور" });
            toast.error("يوجد بالفعل قاعدة راتب لهذا الدور في مجمعك");
            return false;
        }

        setIsSubmitting(true);

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const submitData = {
                role: formData.role,
                currency: formData.currency,
                base_salary: parseFloat(formData.base_salary),
                working_days: parseInt(formData.working_days),
                ...(formData.daily_rate && {
                    daily_rate: parseFloat(formData.daily_rate),
                }),
                ...(formData.notes.trim() && { notes: formData.notes }),
            };

            console.log("📤 إرسال البيانات:", submitData);

            const response = await fetch(`/api/v1/teacher-salaries`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                console.error("❌ Error response:", errorData);

                if (typeof errorData === "object" && errorData.errors) {
                    const errorMessages = Object.values(
                        errorData.errors,
                    ).flat();
                    toast.error(
                        (errorMessages[0] as string) || "حدث خطأ في الإضافة",
                    );
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
            console.log("✅ إضافة قاعدة الراتب نجحت:", result);
            toast.success("تم إضافة قاعدة الراتب بنجاح!");
            return true;
        } catch (error: any) {
            console.error("❌ خطأ في الإضافة:", error);
            toast.error(error.message || "حدث خطأ في الإضافة");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, existingRules, validateForm]);

    return {
        formData,
        errors,
        isSubmitting,
        existingRules,
        loadingRules,
        handleInputChange,
        submitForm,
    };
};
