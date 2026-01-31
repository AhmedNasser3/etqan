import { useState } from "react";
import { useParams } from "react-router-dom";

export const useStudentEnrollment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { centerSlug } = useParams<{ centerSlug?: string }>();

    const registerStudent = async (data: any) => {
        const response = await fetch("/student/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        return result;
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const data: any = {};
            formData.forEach((value, key) => {
                data[key] = value === "" ? null : value;
            });

            if (
                centerSlug &&
                centerSlug !== "register" &&
                centerSlug !== "student"
            ) {
                data.center_slug = centerSlug;
            }

            const response = await registerStudent(data);

            if (response.success) {
                setSuccess(true);
                setError(null);
                return { success: true, data: response.data };
            }
        } catch (err: any) {
            const errorMessage =
                err.message || err?.message || "حدث خطأ في التسجيل";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setError(null);
        setSuccess(false);
        setIsLoading(false);
    };

    return {
        handleSubmit,
        isLoading,
        error,
        success,
        setError,
        resetForm,
    };
};
