// hooks/useAdminRegister.ts
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface AdminFormData {
    full_name: string;
    email: string;
    phone?: string;
    notes?: string;
    gender: "male" | "female";
}

export const useAdminRegister = () => {
    const [data, setData] = useState<AdminFormData>({
        full_name: "",
        email: "",
        phone: "",
        notes: "",
        gender: "male",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // تغيير المدخلات
    const handleInputChange = useCallback(
        (field: keyof AdminFormData, value: string | number | undefined) => {
            setData((prev) => ({ ...prev, [field]: value }));
            if (error) setError("");
        },
        [error],
    );

    // تسجيل الإداري
    const submitRegister = useCallback(async () => {
        //  مطلوب بس الاسم والإيميل
        if (!data.full_name.trim()) {
            setError("الاسم الكامل مطلوب");
            return;
        }
        if (!data.email.trim()) {
            setError("البريد الإلكتروني مطلوب");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const requestData = { ...data };

            const response = await fetch("/admin/register", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSuccess(true);
                toast.success("تم إرسال طلب التسجيل الإداري بنجاح!");

                // Reset form
                setData({
                    full_name: "",
                    email: "",
                    phone: "",
                    notes: "",
                    gender: "male",
                });
            } else {
                const errorMsg = Array.isArray(result.message)
                    ? Object.values(result.message)[0]?.[0]
                    : result.message || "حدث خطأ في الإرسال";
                setError(errorMsg as string);
            }
        } catch (err: any) {
            setError("فشل في الاتصال بالخادم");
            toast.error("فشل في الإرسال");
        } finally {
            setLoading(false);
        }
    }, [data, error]);

    return {
        data,
        loading,
        success,
        error,
        handleInputChange,
        submitRegister,
    };
};
