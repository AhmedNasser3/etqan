// hooks/useStudentAffairsUpdatePlatform.ts -  بدون React Query
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface FormData {
    id_number: string;
    grade_level: string;
    circle: string;
    status: string;
    health_status: string;
    reading_level: string;
    session_time: string;
    notes: string;
}

interface StudentData {
    id: number;
    id_number: string;
    grade_level: string;
    circle: string;
    status: string;
    health_status: string;
    reading_level: string;
    session_time: string;
    notes: string;
    name: string;
    center_name?: string;
    center_id?: string;
}

export const useStudentAffairsUpdatePlatform = (studentId: number) => {
    const [formData, setFormData] = useState<FormData>({
        id_number: "",
        grade_level: "",
        circle: "",
        status: "نشط",
        health_status: "",
        reading_level: "",
        session_time: "",
        notes: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentData, setStudentData] = useState<StudentData | null>(null);

    //  جلب بيانات الطالب
    const fetchStudentData = useCallback(async () => {
        if (!studentId) return;

        try {
            setLoadingData(true);
            const res = await fetch(
                `/api/v1/student-affairs-platform/${studentId}`,
            );
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `خطأ ${res.status}`);
            }
            const data = await res.json();
            setStudentData(data.data);
            return data.data;
        } catch (error) {
            toast.error((error as Error).message || "فشل في جلب بيانات الطالب");
            setStudentData(null);
        } finally {
            setLoadingData(false);
        }
    }, [studentId]);

    //  تحميل البيانات عند تغيير studentId
    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);

    //  تحديث النموذج
    useEffect(() => {
        if (studentData) {
            setFormData({
                id_number: studentData.id_number || "",
                grade_level: studentData.grade_level || "",
                circle: studentData.circle || "",
                status: studentData.status || "نشط",
                health_status: studentData.health_status || "",
                reading_level: studentData.reading_level || "",
                session_time: studentData.session_time || "",
                notes: studentData.notes || "",
            });
            setErrors({});
        }
    }, [studentData]);

    const grades = ["أول", "ثاني", "ثالث", "رابع", "خامس"];

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value as any }));
            if (errors[name as keyof FormData]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name as keyof FormData];
                    return newErrors;
                });
            }
        },
        [errors],
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.id_number.trim()) {
            newErrors.id_number = "رقم الهوية مطلوب";
        }
        if (!formData.grade_level.trim()) {
            newErrors.grade_level = "الصف مطلوب";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("يرجى تصحيح الأخطاء الموجودة");
            return false;
        }
        return true;
    }, [formData]);

    const submitForm = useCallback(async (): Promise<boolean> => {
        if (!validateForm()) return false;
        if (!studentId) return false;

        try {
            setIsSubmitting(true);
            const res = await fetch(
                `/api/v1/student-affairs-platform/${studentId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                },
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "فشل في التحديث");
            }

            toast.success("تم التحديث بنجاح!");
            await fetchStudentData(); // إعادة تحميل
            return true;
        } catch (error) {
            toast.error((error as Error).message || "حدث خطأ");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm, studentId, fetchStudentData]);

    const loadStudentData = useCallback(() => {
        fetchStudentData();
    }, [fetchStudentData]);

    return {
        formData,
        errors,
        isSubmitting,
        loadingData,
        studentData,
        grades,
        handleInputChange,
        submitForm,
        loadStudentData,
    };
};
