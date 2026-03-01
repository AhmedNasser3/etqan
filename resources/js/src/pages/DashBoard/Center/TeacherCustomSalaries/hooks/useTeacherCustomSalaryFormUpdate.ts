import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface FormData {
    teacher_id: number;
    custom_base_salary: string;
    notes: string;
}

export interface TeacherOption {
    id: number;
    name: string;
    role: string;
}

export const useTeacherCustomSalaryFormUpdate = (salaryId: number) => {
    const [formData, setFormData] = useState<FormData>({
        teacher_id: 0,
        custom_base_salary: "",
        notes: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(true);

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

    // جلب بيانات الراتب المخصص
    const fetchSalaryDetail = useCallback(async () => {
        setLoadingDetail(true);
        try {
            const response = await fetch(
                `/api/v1/teacher/custom-salaries/${salaryId}`,
                {
                    credentials: "include",
                    headers: getHeaders(),
                },
            );

            if (response.ok) {
                const data = await response.json();
                setFormData({
                    teacher_id: data.data.teacher_id,
                    custom_base_salary: data.data.custom_base_salary.toString(),
                    notes: data.data.notes || "",
                });
            }
        } catch (error) {
            console.error("❌ خطأ في جلب بيانات الراتب:", error);
            toast.error("فشل في تحميل بيانات الراتب");
        } finally {
            setLoadingDetail(false);
        }
    }, [salaryId, getHeaders]);

    // جلب المعلمين
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

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "teacher_id" ? Number(value) : value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const validateForm = (): Record<string, string> => {
        const newErrors: Record<string, string> = {};

        if (!formData.teacher_id || formData.teacher_id === 0) {
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

        setIsSubmitting(true);
        try {
            const response = await fetch(
                `/api/v1/teacher/custom-salaries/${salaryId}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        custom_base_salary: Number(formData.custom_base_salary),
                        notes: formData.notes || null,
                    }),
                },
            );

            const data = await response.json();

            if (response.ok) {
                toast.success("تم تحديث الراتب المخصص بنجاح ✅");
                return true;
            } else {
                toast.error(data.message || "حدث خطأ في التحديث");
                return false;
            }
        } catch (error) {
            console.error("💥 خطأ في التحديث:", error);
            toast.error("حدث خطأ في الاتصال");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchSalaryDetail();
        fetchTeachers();
    }, [salaryId, fetchSalaryDetail, fetchTeachers]);

    return {
        formData,
        errors,
        isSubmitting,
        loadingDetail,
        teachers,
        loadingTeachers,
        handleInputChange,
        submitForm,
    };
};
