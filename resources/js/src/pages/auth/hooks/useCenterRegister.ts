import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface CenterRegisterForm {
    name: string;
    subdomain: string;
    admin_email: string;
    admin_name: string;
    phone: string;
    avatar?: File | null;
}

interface UseCenterRegisterReturn {
    form: CenterRegisterForm;
    loading: boolean;
    errors: Record<string, string>;
    setForm: (form: CenterRegisterForm) => void;
    setAvatar: (file: File | null) => void;
    handleSubmit: () => Promise<void>;
    resetForm: () => void;
}

export const useCenterRegister = (): UseCenterRegisterReturn => {
    const [form, setForm] = useState<CenterRegisterForm>({
        name: "",
        subdomain: "",
        admin_email: "",
        admin_name: "",
        phone: "",
        avatar: null,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true);
        setErrors({});

        const data = new FormData();

        // ✅ تطابق الحقول مع Backend
        data.append("circle_name", form.name);
        data.append("domain", form.subdomain);
        data.append("manager_email", form.admin_email);
        data.append("manager_name", form.admin_name);
        data.append("manager_phone", form.phone);
        data.append("country_code", "+966"); // ✅ إضافة country_code

        if (form.avatar) {
            data.append("logo", form.avatar); // ✅ تغيير من avatar إلى logo
        }

        try {
            const response = await axios.post(
                "/api/super/centers/register",
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            if (response.data.success) {
                // ✅ عرض رسالة نجاح
                alert(
                    `✅ ${response.data.message}\n\nرابط تسجيل الدخول: ${response.data.login_url}\nكلمة المرور المؤقتة: ${response.data.temp_password}`,
                );

                // ✅ التوجيه للصفحة الرئيسية
                navigate("/");
            }
        } catch (error: any) {
            console.error("Registration Error:", error);

            // ✅ معالجة الأخطاء بشكل صحيح
            if (error.response?.data?.errors) {
                // Laravel validation errors
                const backendErrors: Record<string, string> = {};
                const validationErrors = error.response.data.errors;

                // ✅ تحويل أسماء الحقول من Backend إلى Frontend
                Object.keys(validationErrors).forEach((key) => {
                    const errorMessage = Array.isArray(validationErrors[key])
                        ? validationErrors[key][0]
                        : validationErrors[key];

                    // Map backend field names to frontend field names
                    const fieldMapping: Record<string, string> = {
                        circle_name: "name",
                        manager_name: "admin_name",
                        manager_email: "admin_email",
                        manager_phone: "phone",
                        domain: "subdomain",
                        logo: "avatar",
                    };

                    const frontendKey = fieldMapping[key] || key;
                    backendErrors[frontendKey] = errorMessage;
                });

                setErrors(backendErrors);
            } else if (error.response?.data?.message) {
                // General error message
                setErrors({
                    general: error.response.data.message,
                });
            } else {
                // Network or unknown error
                setErrors({
                    general:
                        "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const setAvatar = (file: File | null) => {
        setForm({ ...form, avatar: file });
    };

    const resetForm = () => {
        setForm({
            name: "",
            subdomain: "",
            admin_email: "",
            admin_name: "",
            phone: "",
            avatar: null,
        });
        setErrors({});
    };

    return {
        form,
        loading,
        errors,
        setForm,
        setAvatar,
        handleSubmit,
        resetForm,
    };
};
