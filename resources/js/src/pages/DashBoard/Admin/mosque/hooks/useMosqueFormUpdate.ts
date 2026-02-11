// hooks/useMosqueFormUpdate.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface MosqueFormData {
    mosque_name: string;
    center_id: string;
    supervisor_id: string;
    logo: File | null | string;
    notes: string;
}

interface CenterType {
    id: number;
    name: string;
    subdomain?: string;
    circle_name?: string;
}

interface UserOption {
    id: number;
    name: string;
    email: string;
    center_id?: number;
}

interface FormErrors {
    [key: string]: string;
}

export const useMosqueFormUpdate = (initialData?: any) => {
    const [formData, setFormData] = useState<MosqueFormData>({
        mosque_name: initialData?.name || "",
        center_id: initialData?.circleId?.toString() || "",
        supervisor_id: initialData?.supervisorId?.toString() || "",
        logo: initialData?.logo || null,
        notes: initialData?.notes || "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ مضاف
    const [centersData, setCentersData] = useState<CenterType[]>([]);
    const [usersData, setUsersData] = useState<UserOption[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            console.log("🔍 Fetching user...");
            const response = await fetch("/api/user", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                const responseData = await response.json();
                const actualUser = responseData.user || responseData;
                console.log("✅ ACTUAL USER:", actualUser);
                setUser(actualUser);
            }
        } catch (error) {
            console.error("❌ Failed to fetch user:", error);
        }
    }, []);

    // Auto-set center_id for center owners (فقط لو مفيش initialData)
    useEffect(() => {
        if (user?.center_id && !formData.center_id && !initialData) {
            console.log("🏢 Auto-setting center_id:", user.center_id);
            setFormData((prev) => ({
                ...prev,
                center_id: user.center_id.toString(),
            }));
        }
    }, [user?.center_id, formData.center_id, initialData]);

    useEffect(() => {
        if (user) {
            console.log("🚀 User loaded, fetching centers & teachers...");
            fetchCenters();
            fetchTeachers();
        }
    }, [user]);

    const fetchCenters = useCallback(async () => {
        try {
            console.log("📥 Fetching centers...");
            setLoadingData(true);
            const response = await fetch("/api/v1/centers", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("📊 Centers response:", data);
                let centers: CenterType[] = [];

                const actualUser = user?.user || user;

                if (actualUser?.role?.id === 1 && actualUser.center_id) {
                    const userCenter = data.data?.find(
                        (c: any) => c.id === actualUser.center_id,
                    );
                    if (userCenter) {
                        centers = [userCenter];
                        console.log(
                            "🏢 Center Owner - single center:",
                            userCenter,
                        );
                    }
                } else {
                    centers = data.data || [];
                    console.log("👑 Admin - all centers:", centers.length);
                }

                setCentersData(centers);
            }
        } catch (error) {
            console.error("❌ Failed to fetch centers:", error);
            toast.error("فشل في تحميل المراكز");
            setCentersData([]);
        } finally {
            setLoadingData(false);
        }
    }, [user]);

    const fetchTeachers = useCallback(async () => {
        try {
            console.log("📥 Fetching teachers...");
            const response = await fetch("/api/v1/teachers", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Teachers loaded:", data.data?.length);
                setUsersData(data.data || []);
            }
        } catch (error) {
            console.error("❌ Failed to fetch teachers:", error);
            toast.error("فشل في تحميل المشرفين");
            setUsersData([]);
        }
    }, []);

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
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

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.mosque_name.trim())
            newErrors.mosque_name = "اسم المسجد مطلوب";
        if (!formData.center_id) newErrors.center_id = "المجمع مطلوب";
        if (!formData.supervisor_id) newErrors.supervisor_id = "المشرف مطلوب";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const submitForm = useCallback(
        async (onSubmit: (formDataSubmit: FormData) => Promise<void>) => {
            console.log("🚀 SUBMIT UPDATE FORM - formData:", formData);
            if (!validateForm()) {
                console.log("❌ Validation failed");
                return;
            }

            if (!formData.center_id) {
                toast.error("المجمع غير محدد");
                return;
            }

            if (isSubmitting) return; // ✅ الآن isSubmitting معرّف

            setIsSubmitting(true);
            try {
                const formDataSubmit = new FormData();
                formDataSubmit.append("mosque_name", formData.mosque_name);
                formDataSubmit.append("center_id", formData.center_id);
                formDataSubmit.append("supervisor_id", formData.supervisor_id);
                if (formData.logo instanceof File)
                    formDataSubmit.append("logo", formData.logo as File);
                if (formData.notes)
                    formDataSubmit.append("notes", formData.notes);

                console.log("📤 Sending FormData:", {
                    mosque_name: formData.mosque_name,
                    center_id: formData.center_id,
                    supervisor_id: formData.supervisor_id,
                });

                await onSubmit(formDataSubmit);
            } catch (error) {
                console.error("Submit error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm, isSubmitting], // ✅ مضاف isSubmitting
    );

    return {
        formData,
        errors,
        isSubmitting, // ✅ موجود الآن
        centersData,
        usersData,
        loadingData,
        logoPreview,
        user,
        handleInputChange,
        handleFileChange,
        submitForm,
    };
};
