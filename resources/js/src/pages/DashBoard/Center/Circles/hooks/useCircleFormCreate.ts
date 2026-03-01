// src/pages/DashBoard/Center/Circles/hooks/useCircleFormCreate.ts
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

//  Teacher من جدول users مع teacher.user_id
interface TeacherType {
    id: number; // teacher.id
    user_id: number; // teacher.user_id
    name: string; // users.name
    role: string; // users.role
    center_id: number; // users.center_id
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
    const abortControllerRef = useRef<AbortController | null>(null);

    //  CSRF Token helper
    const getCsrfToken = useCallback((): string => {
        const metaToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
        if (metaToken) return metaToken;

        const csrfMeta = document
            .querySelector('meta[name="csrf"]')
            ?.getAttribute("content");
        if (csrfMeta) return csrfMeta;

        const csrfCookie = document.cookie
            .split(";")
            .find((row) => row.startsWith("XSRF-TOKEN"))
            ?.split("=")[1];
        return csrfCookie ? decodeURIComponent(csrfCookie) : "";
    }, []);

    //  Fetch User
    const fetchUser = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            console.log("🔍 Fetching user...");
            const response = await fetch("/api/user", {
                signal: abortControllerRef.current.signal,
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
            });

            if (response.ok) {
                const responseData = await response.json();
                const actualUser = responseData.user || responseData;
                console.log(" User loaded:", actualUser);
                setUser(actualUser);
            }
        } catch (error: any) {
            if (error.name !== "AbortError") {
                console.error("❌ Failed to fetch user:", error);
            }
        }
    }, [getCsrfToken]);

    //  Initial user fetch
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    //  Auto-set center_id
    useEffect(() => {
        if (user?.center_id && !formData.center_id) {
            console.log("🏢 Auto-setting center_id:", user.center_id);
            setFormData((prev) => ({
                ...prev,
                center_id: user.center_id.toString(),
            }));
        }
    }, [user?.center_id]);

    //  Fetch all data when user loads
    useEffect(() => {
        if (user?.center_id) {
            console.log("🚀 User center loaded, fetching data...");
            fetchAllCenterData(user.center_id);
        }
    }, [user?.center_id]);

    //  Fetch all center data مرة واحدة
    const fetchAllCenterData = useCallback(
        async (centerId: number) => {
            setLoadingData(true);

            // Parallel fetches
            const [mosquesPromise, teachersPromise] = await Promise.allSettled([
                fetchCenterMosques(centerId),
                fetchCenterTeachers(centerId), //  معلمين من users مع teacher.user_id
            ]);

            // Centers
            await fetchCenters();

            setLoadingData(false);
        },
        [getCsrfToken],
    );

    const fetchCenters = useCallback(async () => {
        try {
            console.log("📥 Fetching centers...");
            const response = await fetch("/api/v1/centers", {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("📊 Centers response:", data);

                let centers: CenterType[] = [];
                const actualUser = user;

                //  Center Owner → مركزه بس
                if (actualUser?.role?.id === 1 && actualUser.center_id) {
                    const userCenter = data.data?.find(
                        (c: any) => c.id === actualUser.center_id,
                    );
                    if (userCenter) {
                        centers = [userCenter];
                    }
                } else {
                    // Admin → كل المراكز
                    centers = data.data || [];
                }

                setCentersData(centers);
            }
        } catch (error: any) {
            console.error("❌ Failed to fetch centers:", error);
            toast.error("فشل في تحميل المراكز");
        }
    }, [user, getCsrfToken]);

    //  مساجد مجمع اليوزر
    const fetchCenterMosques = useCallback(
        async (centerId: number) => {
            try {
                console.log("🕌 Fetching mosques for center:", centerId);
                const response = await fetch(
                    `/api/v1/centers/${centerId}/mosques`,
                    {
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            "X-CSRF-TOKEN": getCsrfToken(),
                        },
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    console.log(" Mosques loaded:", data.data?.length || 0);
                    setMosquesData(Array.isArray(data.data) ? data.data : []);
                } else {
                    console.log("❌ No mosques for center:", centerId);
                    setMosquesData([]);
                }
            } catch (error) {
                console.error("❌ Failed to fetch mosques:", error);
                setMosquesData([]);
            }
        },
        [getCsrfToken],
    );

    //  معلمين مجمع اليوزر من users مع teacher.user_id
    const fetchCenterTeachers = useCallback(
        async (centerId: number) => {
            try {
                console.log("👨‍🏫 Fetching teachers for center:", centerId);
                //  endpoint جديد للمعلمين من users مع teacher.user_id
                const response = await fetch(
                    `/api/v1/centers/${centerId}/teachers`,
                    {
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            "X-CSRF-TOKEN": getCsrfToken(),
                        },
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    console.log(" Teachers loaded:", data.data?.length || 0);

                    //  فلترة المعلمين اللي ليهم teacher.user_id
                    const teachers = (
                        Array.isArray(data.data) ? data.data : []
                    ).filter(
                        (teacher: any) =>
                            teacher.user_id && teacher.center_id === centerId,
                    );

                    setTeachersData(teachers as TeacherType[]);
                } else {
                    console.log("❌ No teachers for center:", centerId);
                    setTeachersData([]);
                }
            } catch (error) {
                console.error("❌ Failed to fetch teachers:", error);
                setTeachersData([]);
            }
        },
        [getCsrfToken],
    );

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
    }, [formData.name]);

    const submitForm = useCallback(
        async (onSubmit: (formDataSubmit: FormData) => Promise<void>) => {
            console.log("🚀 SUBMIT - formData:", formData);
            if (!validateForm()) return;

            if (!formData.center_id) {
                toast.error("المجمع غير محدد");
                return;
            }

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
                if (formData.notes?.trim())
                    formDataSubmit.append("notes", formData.notes.trim());

                await onSubmit(formDataSubmit);
            } catch (error) {
                console.error("Submit error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, isSubmitting, validateForm],
    );

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        centersData,
        mosquesData, //  مساجد المجمع بس
        teachersData, //  معلمين المجمع بس مع teacher.user_id
        loadingData,
        user,
    };
};
