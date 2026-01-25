// hooks/useCenterRegister.ts
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
        data.append("name", form.name);
        data.append("subdomain", form.subdomain);
        data.append("admin_email", form.admin_email);
        data.append("admin_name", form.admin_name);
        data.append("phone", form.phone);
        if (form.avatar) data.append("avatar", form.avatar);

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

            navigate("/");
        } catch (error: any) {
            const serverErrors = error.response?.data?.errors || {};
            setErrors({
                ...serverErrors,
                ...(error.response?.data?.message && {
                    general: error.response.data.message,
                }),
            });
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
