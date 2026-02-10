// src/hooks/useCircleFormUpdate.ts
import { useState, useEffect, useCallback } from "react";
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

interface CircleData {
    id: number;
    name: string;
    center_id: number;
    mosque_id?: number;
    teacher_id?: number;
    notes?: string;
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

export const useCircleFormUpdate = (circleId: number) => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        center_id: "",
        mosque_id: "",
        teacher_id: "",
        notes: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCircle, setIsLoadingCircle] = useState(true);
    const [centersData, setCentersData] = useState<CenterType[]>([]);
    const [mosquesData, setMosquesData] = useState<MosqueType[]>([]);
    const [teachersData, setTeachersData] = useState<TeacherType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [circleData, setCircleData] = useState<CircleData | null>(null);

    useEffect(() => {
        if (circleId) {
            loadCircleData();
        }
    }, [circleId]);

    const loadCircleData = useCallback(async () => {
        try {
            console.log("🔍 Loading circle data for ID:", circleId);
            const response = await fetch(
                `/api/v1/centers/circles/${circleId}`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );

            console.log("Circle response status:", response.status);

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => response.text());
                console.error("Circle API error:", response.status, errorData);
                toast.error("فشل في تحميل الحلقة");
                return;
            }

            const circle = await response.json();
            console.log("✅ Circle loaded:", circle);
            setCircleData(circle);

            setFormData({
                name: circle.name || "",
                center_id: circle.center_id?.toString() || "",
                mosque_id: circle.mosque_id?.toString() || "",
                teacher_id: circle.teacher_id?.toString() || "",
                notes: circle.notes || "",
            });
        } catch (error) {
            console.error("❌ Load circle data error:", error);
            toast.error("فشل في تحميل الحلقة");
        } finally {
            setIsLoadingCircle(false);
        }
    }, [circleId]);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch("/api/user", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                const responseData = await response.json();
                const actualUser = responseData.user || responseData;
                setUser(actualUser);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchCenters();
        }
    }, [user]);

    const fetchCenters = useCallback(async () => {
        try {
            setLoadingData(true);
            const response = await fetch(
                "/api/v1/centers/circles/get-centers",
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );

            if (response.ok) {
                const data = await response.json();
                let centers: CenterType[] = [];

                const actualUser = user?.user || user;

                if (actualUser?.role?.id === 1 && actualUser.center_id) {
                    const userCenter = data.data?.find(
                        (c: any) => c.id === actualUser.center_id,
                    );
                    if (userCenter) {
                        centers = [userCenter];
                    }
                } else {
                    centers = data.data || [];
                }

                setCentersData(centers);

                if (circleData?.center_id) {
                    fetchCenterMosques(circleData.center_id);
                    fetchCenterTeachers(circleData.center_id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch centers:", error);
            toast.error("فشل في تحميل المراكز");
        } finally {
            setLoadingData(false);
        }
    }, [user, circleData?.center_id]);

    const fetchCenterMosques = useCallback(async (centerId: number) => {
        try {
            const response = await fetch(
                `/api/v1/centers/${centerId}/mosques`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );
            if (response.ok) {
                const data = await response.json();
                setMosquesData(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch center mosques:", error);
        }
    }, []);

    const fetchCenterTeachers = useCallback(async (centerId: number) => {
        try {
            const response = await fetch(
                `/api/v1/centers/${centerId}/teachers`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );
            if (response.ok) {
                const data = await response.json();
                setTeachersData(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch center teachers:", error);
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
            if (!validateForm()) {
                return;
            }

            if (!formData.center_id) {
                toast.error("المجمع غير محدد");
                return;
            }

            if (isSubmitting) return;

            setIsSubmitting(true);
            try {
                const formDataSubmit = new FormData();
                formDataSubmit.append("_method", "PUT");
                formDataSubmit.append("name", formData.name);
                formDataSubmit.append("center_id", formData.center_id);
                if (formData.mosque_id)
                    formDataSubmit.append("mosque_id", formData.mosque_id);
                if (formData.teacher_id)
                    formDataSubmit.append("teacher_id", formData.teacher_id);
                if (formData.notes)
                    formDataSubmit.append("notes", formData.notes);

                await onSubmit(formDataSubmit);
            } catch (error) {
                console.error("Update error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm, isSubmitting],
    );

    return {
        formData,
        errors,
        isSubmitting,
        isLoadingCircle,
        handleInputChange,
        submitForm,
        centersData,
        mosquesData,
        teachersData,
        loadingData,
        user,
        circleData,
    };
};
