// hooks/useTeacherRegister.ts
import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";

interface TeacherRegisterData {
    full_name: string;
    role: string;
    session_time?: string;
    email: string;
    notes: string;
    gender: string;
}

export const useTeacherRegister = () => {
    const { centerSlug } = useParams();

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
            const requestData = {
                ...data,
                center_slug: centerSlug || null,
            };

            // ✅ URL صحيح مع centerSlug
            const url = centerSlug
                ? `/api/v1/centers/${centerSlug}/teacher/register`
                : `/api/v1/teacher/register`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSuccess(true);
                alert(
                    `تم التسجيل بنجاح في ${centerSlug || "النظام العام"}!\nID: ${result.user_id}\nكلمة المرور: ${result.temp_password}`,
                );
                setData({
                    full_name: "",
                    role: "",
                    session_time: "",
                    email: "",
                    notes: "",
                    gender: "male",
                });
            } else {
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
            setError("فشل في الاتصال بالخادم");
        } finally {
            setLoading(false);
        }
    }, [data, centerSlug]);

    return {
        data,
        loading,
        success,
        error,
        centerSlug,
        handleInputChange,
        setGender,
        submitRegister,
    };
};
