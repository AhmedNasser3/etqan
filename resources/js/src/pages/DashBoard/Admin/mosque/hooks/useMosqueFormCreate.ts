import { useState, useCallback, useEffect } from "react";
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

// ✅ CSRF Token Helper
const getCsrfToken = (): string => {
    const cookies = document.cookie.split(";");
    const csrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("XSRF-TOKEN="),
    );
    return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
};

// ✅ API Fetch Helper مع Auth كامل
const apiFetch = async (url: string, options: RequestInit = {}) => {
    // 1️⃣ CSRF Token أولاً
    if (!document.cookie.includes("XSRF-TOKEN=")) {
        await fetch("/sanctum/csrf-cookie", {
            credentials: "include",
            headers: { Accept: "application/json" },
        });
    }

    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-XSRF-TOKEN": getCsrfToken(),
            ...(options.headers as any),
        },
    });

    console.log(`🌐 ${url} → Status: ${response.status}`);

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${response.status}:`, errorText.substring(0, 200));
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
};

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

    // ✅ loadData محدث مع apiFetch
    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            console.log("📥 Loading centers & teachers...");

            // ✅ Centers
            const centersRes = await apiFetch("/api/v1/super/centers");
            setCenters(centersRes.data || []);

            // ✅ Teachers/Supervisors
            const teachersRes = await apiFetch("/api/v1/teachers");
            setUsers(teachersRes.data || []);

            console.log("✅ Centers:", centersRes.data?.length);
            console.log("✅ Teachers:", teachersRes.data?.length);
        } catch (error: any) {
            console.error("خطأ في تحميل البيانات:", error);
            toast.error("خطأ في تحميل البيانات");
            setCenters([]);
            setUsers([]);
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

    // ✅ Auto load data on mount
    useEffect(() => {
        loadData();
    }, [loadData]);

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
