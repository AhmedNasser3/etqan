// hooks/useTeachersAffairsUpdatePlatform.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface TeacherFormData {
    role: string;
    notes: string;
}

interface FormErrors {
    role?: string;
    notes?: string;
}

export const useTeachersAffairsUpdatePlatform = (teacherId: number) => {
    const [formData, setFormData] = useState<TeacherFormData>({
        role: "",
        notes: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [teacherData, setTeacherData] = useState<any>(null);

    // جلب بيانات المعلم
    const loadTeacherData = useCallback(async () => {
        if (!teacherId || teacherId <= 0) return;

        try {
            setLoadingData(true);
            setFetchError(null);

            const response = await fetch(
                `/api/v1/teachers-affairs-platform/${teacherId}`,
            );
            if (!response.ok) {
                throw new Error("المعلم غير موجود");
            }

            const data = await response.json();
            if (data.success && data.data) {
                const teacher = data.data;
                setTeacherData(teacher);
                setFormData({
                    role: teacher.role || "",
                    notes: teacher.notes || "",
                });
            }
        } catch (error: any) {
            setFetchError(error.message || "خطأ في تحميل البيانات");
            toast.error("فشل في تحميل بيانات المعلم");
        } finally {
            setLoadingData(false);
        }
    }, [teacherId]);

    // تغيير الحقول
    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));

            // إزالة الخطأ عند الكتابة
            if (errors[name as keyof FormErrors]) {
                setErrors((prev) => ({ ...prev, [name]: undefined }));
            }
        },
        [errors],
    );

    // التحقق من الصحة
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.role || formData.role.trim() === "") {
            newErrors.role = "الوظيفة مطلوبة";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("يرجى تصحيح الأخطاء الموجودة");
            return false;
        }

        return true;
    }, [formData.role]);

    // إرسال النموذج
    const submitForm = useCallback(async (): Promise<boolean> => {
        if (!validateForm()) return false;

        setIsSubmitting(true);
        try {
            const response = await fetch(
                `/api/v1/teachers-affairs-platform/${teacherId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(formData),
                },
            );

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success("تم تحديث بيانات المعلم بنجاح!");
                return true;
            } else {
                toast.error(result.message || "فشل في تحديث البيانات");
                return false;
            }
        } catch (error: any) {
            console.error("خطأ في التحديث:", error);
            toast.error("حدث خطأ في الاتصال بالخادم");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [teacherId, formData, validateForm]);

    // تحميل البيانات عند بدء التشغيل
    useEffect(() => {
        loadTeacherData();
    }, [loadTeacherData]);

    return {
        formData,
        errors,
        isSubmitting,
        loadingData,
        fetchError,
        teacherData,
        handleInputChange,
        submitForm,
        loadTeacherData,
    };
};
