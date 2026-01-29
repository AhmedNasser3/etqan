import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface MosqueFormData {
    mosque_name: string;
    center_id: string;
    supervisor_id: string;
    logo: File | null;
    notes: string;
}

interface CenterOption {
    id: number;
    name: string;
    subdomain?: string;
}

interface UserOption {
    id: number;
    name: string;
    email: string;
}

export const useMosqueFormCreate = () => {
    const [formData, setFormData] = useState<MosqueFormData>({
        mosque_name: "",
        center_id: "",
        supervisor_id: "",
        logo: null,
        notes: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [centers, setCenters] = useState<CenterOption[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);

    const validateForm = useCallback((data: MosqueFormData) => {
        const newErrors: Record<string, string> = {};

        if (!data.mosque_name.trim())
            newErrors.mosque_name = "اسم المسجد مطلوب";
        if (!data.center_id) newErrors.center_id = "المجمع مطلوب";
        if (!data.supervisor_id) newErrors.supervisor_id = "المشرف مطلوب";

        return newErrors;
    }, []);

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name as keyof MosqueFormData]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && file.size <= 2 * 1024 * 1024) {
                setFormData((prev) => ({ ...prev, logo: file }));
                const preview = URL.createObjectURL(file);
                setLogoPreview(preview);
                if (errors.logo) setErrors((prev) => ({ ...prev, logo: "" }));
            } else {
                toast.error("الملف كبير جداً (الحد الأقصى 2 ميجا بايت)");
            }
        },
        [errors],
    );

    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            const mosquesRes = await fetch("/api/super/mosques");

            if (!mosquesRes.ok) {
                throw new Error(`HTTP ${mosquesRes.status}`);
            }

            const result = await mosquesRes.json();

            if (result.success) {
                setUsers(result.users || []);
                setCenters(result.centers || []);
            }
        } catch (error) {
            console.error("خطأ في تحميل البيانات:", error);
        } finally {
            setLoadingData(false);
        }
    }, []);

    const submitForm = useCallback(
        async (submitHandler: (formData: FormData) => Promise<void>) => {
            const validationErrors = validateForm(formData);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                toast.error("يرجى تصحيح الأخطاء الموجودة");
                return;
            }

            setIsSubmitting(true);
            const formDataToSubmit = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value instanceof File) {
                    formDataToSubmit.append(key, value);
                } else if (value) {
                    formDataToSubmit.append(key, value);
                }
            });

            try {
                await submitHandler(formDataToSubmit);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm, errors],
    );

    return {
        formData,
        errors,
        isSubmitting,
        loadingData,
        logoPreview,
        centers,
        users,
        loadData,
        handleInputChange,
        handleFileChange,
        submitForm,
    };
};
