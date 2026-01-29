// hooks/useTeacherRegister.ts
import { useState, useCallback } from "react";

interface TeacherRegisterData {
    full_name: string;
    role: string;
    session_time?: string;
    email: string;
    notes: string;
    gender: string;
}

export const useTeacherRegister = () => {
    const [data, setData] = useState<TeacherRegisterData>({
        full_name: "",
        role: "",
        session_time: "",
        email: "",
        notes: "",
        gender: "male",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = useCallback(
        (field: keyof TeacherRegisterData, value: string) => {
            setData((prev) => ({ ...prev, [field]: value }));
            if (error) setError("");
        },
        [error],
    );

    const setGender = useCallback((gender: string) => {
        setData((prev) => ({ ...prev, gender }));
    }, []);

    const submitRegister = useCallback(async () => {
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await fetch("/api/teacher/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSuccess(true);
                alert(
                    `تم التسجيل بنجاح!\nID المستخدم: ${result.user_id}\nكلمة المرور المؤقتة: ${result.temp_password}\nسيتم مراجعة طلبك من الإدارة`,
                );

                // Reset form
                setData({
                    full_name: "",
                    role: "",
                    session_time: "",
                    email: "",
                    notes: "",
                    gender: "male",
                });
            } else {
                // Validation errors
                if (response.status === 422 && result.message) {
                    const errorMessage = Array.isArray(result.message)
                        ? Object.values(result.message)[0][0]
                        : result.message;
                    setError(errorMessage as string);
                } else {
                    setError(result.message || "حدث خطأ في التسجيل");
                }
            }
        } catch (err: any) {
            console.error("Registration Error:", err);
            setError("فشل في الاتصال بالخادم، تأكد من تشغيل Laravel");
        } finally {
            setLoading(false);
        }
    }, [data]);

    return {
        data,
        loading,
        success,
        error,
        handleInputChange,
        setGender,
        submitRegister,
    };
};
