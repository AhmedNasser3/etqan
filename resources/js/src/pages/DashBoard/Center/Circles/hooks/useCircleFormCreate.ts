// src/pages/DashBoard/Center/Circles/hooks/useCircleFormCreate.ts - **رسالة مرة واحدة** ✅
import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

interface CenterType {
    id: number;
    name: string;
}

interface MosqueType {
    id: number;
    name: string;
    center_id: number;
}

interface TeacherType {
    id: number;
    name: string;
    role: string;
    center_id?: number;
}

interface FormData {
    name: string;
    center_id: string;
    mosque_id: string;
    teacher_id: string;
    notes?: string;
}

interface FormErrors {
    [key: string]: string;
}

export const useCircleFormCreate = () => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        center_id: "",
        mosque_id: "",
        teacher_id: "",
        notes: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [centersData, setCentersData] = useState<CenterType[]>([]);
    const [mosquesData, setMosquesData] = useState<MosqueType[]>([]);
    const [teachersData, setTeachersData] = useState<TeacherType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);

    // ✅ Toast ID لمنع التكرار
    const toastRef = useRef<string | null>(null);

    // ✅ Fetch User info أولاً - مصحح!
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
                // ✅ الحل! الـ API بيرجع {success: true, user: {...}}
                const actualUser = responseData.user || responseData;
                console.log("✅ ACTUAL USER:", actualUser);
                console.log("🔍 USER CENTER_ID:", actualUser.center_id);
                setUser(actualUser);
            }
        } catch (error) {
            console.error("❌ Failed to fetch user:", error);
        }
    }, []);

    // ✅ تعيين center_id تلقائياً - dependency مُصحح
    useEffect(() => {
        if (user?.center_id && !formData.center_id) {
            console.log("🏢 Auto-setting center_id:", user.center_id);
            setFormData((prev) => ({
                ...prev,
                center_id: user.center_id.toString(),
            }));
        }
    }, [user?.center_id]);

    // ✅ Fetch Centers حسب الـ role
    useEffect(() => {
        if (user) {
            console.log("🚀 User loaded, fetching centers...");
            fetchCenters();
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

                // ✅ استخدم actual user data
                const actualUser = user?.user || user;

                // ✅ Center Owner → مركزه بس
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
                    // ✅ Admin → كل المراكز
                    centers = data.data || [];
                    console.log("👑 Admin - all centers:", centers.length);
                }

                setCentersData(centers);

                // ✅ تحميل المساجد والمعلمين لمركز اليوزر بس
                if (actualUser?.center_id) {
                    console.log(
                        "🕌👨‍🏫 Fetching mosques & teachers for center:",
                        actualUser.center_id,
                    );
                    fetchCenterMosques();
                    fetchCenterTeachers();
                }
            }
        } catch (error) {
            console.error("❌ Failed to fetch centers:", error);
            toast.error("فشل في تحميل المراكز");
        } finally {
            console.log("✅ Centers loading finished");
            setLoadingData(false);
        }
    }, [user]);

    // ✅ مساجد مركز اليوزر بس
    const fetchCenterMosques = useCallback(async () => {
        if (!user?.center_id) return;
        try {
            console.log("🕌 Fetching mosques for center:", user.center_id);
            const response = await fetch(
                `/api/v1/mosques?center_id=${user.center_id}`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );
            if (response.ok) {
                const data = await response.json();
                console.log("✅ Mosques loaded:", data.data?.length || 0);
                setMosquesData(data.data || []);
            }
        } catch (error) {
            console.error("❌ Failed to fetch center mosques:", error);
        }
    }, [user?.center_id]);

    // ✅ معلمي مركز اليوزر بس
    const fetchCenterTeachers = useCallback(async () => {
        if (!user?.center_id) return;
        try {
            console.log("👨‍🏫 Fetching teachers for center:", user.center_id);
            const response = await fetch(
                `/api/v1/teachers?center_id=${user.center_id}`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );
            if (response.ok) {
                const data = await response.json();
                console.log("✅ Teachers loaded:", data.data?.length || 0);
                setTeachersData(data.data || []);
            }
        } catch (error) {
            console.error("❌ Failed to fetch center teachers:", error);
        }
    }, [user?.center_id]);

    // ✅ Form handlers
    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors],
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) newErrors.name = "اسم الحلقة مطلوب";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const submitForm = useCallback(
        async (onSubmit: (formDataSubmit: FormData) => Promise<void>) => {
            console.log("🚀 SUBMIT FORM - formData:", formData);
            if (!validateForm()) {
                console.log("❌ Validation failed");
                return;
            }

            if (!formData.center_id) {
                toast.error("المجمع غير محدد");
                return;
            }

            // ✅ منع الـ double submit
            if (isSubmitting) return;

            setIsSubmitting(true);
            try {
                const formDataSubmit = new FormData();
                formDataSubmit.append("name", formData.name);
                formDataSubmit.append("center_id", formData.center_id);
                if (formData.mosque_id)
                    formDataSubmit.append("mosque_id", formData.mosque_id);
                if (formData.teacher_id)
                    formDataSubmit.append("teacher_id", formData.teacher_id);
                if (formData.notes)
                    formDataSubmit.append("notes", formData.notes);

                console.log("📤 Sending FormData:", {
                    name: formData.name,
                    center_id: formData.center_id,
                    hasMosque: !!formData.mosque_id,
                    hasTeacher: !!formData.teacher_id,
                });

                await onSubmit(formDataSubmit);
            } catch (error) {
                console.error("Submit error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm, isSubmitting],
    );

    console.log(
        "🎯 FINAL RETURN - user.center_id:",
        user?.center_id,
        "formData.center_id:",
        formData.center_id,
    );

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        centersData,
        mosquesData,
        teachersData,
        loadingData,
        user,
    };
};
