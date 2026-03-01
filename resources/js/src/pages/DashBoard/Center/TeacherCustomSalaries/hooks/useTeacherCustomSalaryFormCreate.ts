import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface FormData {
    teacher_id: number | "";
    custom_base_salary: string;
    notes: string;
}

export interface TeacherOption {
    id: number;
    name: string;
    role: string;
}

export const useTeacherCustomSalaryFormCreate = () => {
    const [formData, setFormData] = useState<FormData>({
        teacher_id: "",
        custom_base_salary: "",
        notes: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingSalary, setExistingSalary] = useState(false);
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [loadingRules, setLoadingRules] = useState(false);

    const getHeaders = useCallback(() => {
        const token =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";
        return {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
            ...(token && { "X-CSRF-TOKEN": token }),
        };
    }, []);

    // جلب المعلمين من مركزك
    const fetchTeachers = useCallback(async () => {
        setLoadingTeachers(true);
        try {
            const response = await fetch("/api/v1/teachers?status=active", {
                method: "GET",
                credentials: "include",
                headers: getHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                const teacherData = Array.isArray(data.data)
                    ? data.data
                    : data.data?.data || [];
                setTeachers(
                    teacherData.map((t: any) => ({
                        id: t.teacher?.id || t.id,
                        name: t.name || t.user?.name || "غير محدد",
                        role: t.role || t.teacher?.role || "teacher",
                    })),
                );
            }
        } catch (error) {
            console.error("❌ خطأ في جلب المعلمين:", error);
        } finally {
            setLoadingTeachers(false);
        }
    }, [getHeaders]);

    // فحص وجود راتب مخصص نشط للمعلم
    const checkExistingSalary = useCallback(
        async (teacherId: number) => {
            if (!teacherId) {
                setExistingSalary(false);
                return;
            }

            setLoadingRules(true);
            try {
                const response = await fetch(
                    `/api/v1/teacher/custom-salaries/teacher/${teacherId}`,
                    {
                        credentials: "include",
                        headers: getHeaders(),
                    },
                );

                const data = await response.json();
                setExistingSalary(!!data.has_custom_salary);
            } catch (error) {
                console.error("❌ خطأ في فحص الراتب المخصص:", error);
                setExistingSalary(false);
            } finally {
                setLoadingRules(false);
            }
        },
        [getHeaders],
    );

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "teacher_id"
                    ? value === ""
                        ? ""
                        : Number(value)
                    : value,
        }));

        // فحص الراتب المخصص عند تغيير المعلم
        if (name === "teacher_id" && value) {
            checkExistingSalary(Number(value));
        }

        // مسح الأخطاء
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const validateForm = (): Record<string, string> => {
        const newErrors: Record<string, string> = {};

        if (!formData.teacher_id || formData.teacher_id === "") {
            newErrors.teacher_id = "يرجى اختيار معلم";
        }

        const salary = Number(formData.custom_base_salary);
        if (!formData.custom_base_salary || salary < 1000) {
            newErrors.custom_base_salary =
                "الراتب المخصص يجب أن يكون 1000 ريال أو أكثر";
        }

        return newErrors;
    };

    const submitForm = async (): Promise<boolean> => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("يرجى تصحيح الأخطاء الموجودة");
            return false;
        }

        if (existingSalary) {
            toast.error("يوجد بالفعل راتب مخصص نشط لهذا المعلم");
            return false;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/v1/teacher/custom-salaries", {
                method: "POST",
                credentials: "include",
                headers: getHeaders(),
                body: JSON.stringify({
                    teacher_id: formData.teacher_id,
                    custom_base_salary: Number(formData.custom_base_salary),
                    notes: formData.notes || null,
                    is_active: true,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("تم إنشاء الراتب المخصص بنجاح ✅");
                setFormData({
                    teacher_id: "",
                    custom_base_salary: "",
                    notes: "",
                });
                return true;
            } else {
                toast.error(data.message || "حدث خطأ في الإنشاء");
                return false;
            }
        } catch (error) {
            console.error("💥 خطأ في الإرسال:", error);
            toast.error("حدث خطأ في الاتصال");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    return {
        formData,
        errors,
        isSubmitting,
        existingSalary,
        loadingTeachers,
        teachers,
        loadingRules,
        handleInputChange,
        submitForm,
    };
};
