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
    name: string | null;
    user?: { name: string } | null;
    role: string;
    center_id?: number;
}

interface FormData {
    id?: number;
    name: string;
    center_id: string;
    mosque_id: string;
    teacher_id: string;
    notes?: string;
}

interface FormErrors {
    [key: string]: string;
}

interface CircleData {
    id: number;
    name: string;
    center_id: number;
    mosque_id?: number;
    teacher_id?: number;
    notes?: string;
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
    const [centersData, setCentersData] = useState<CenterType[]>([]);
    const [mosquesData, setMosquesData] = useState<MosqueType[]>([]);
    const [teachersData, setTeachersData] = useState<TeacherType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);

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
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    }, []);

    const loadCircleData = useCallback(async () => {
        try {
            setLoadingData(true);
            const response = await fetch(
                `/api/v1/centers/circles/${circleId}`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );

            if (response.ok) {
                const circleData: CircleData = await response.json();
                setFormData({
                    id: circleData.id,
                    name: circleData.name || "",
                    center_id: circleData.center_id.toString(),
                    mosque_id: circleData.mosque_id?.toString() || "",
                    teacher_id: circleData.teacher_id?.toString() || "",
                    notes: circleData.notes || "",
                });
            }
        } catch (error) {
            console.error("Failed to fetch circle data:", error);
            toast.error("فشل في تحميل بيانات الحلقة");
        } finally {
            setLoadingData(false);
        }
    }, [circleId]);

    useEffect(() => {
        if (user) {
            fetchCenters();
        }
    }, [user]);

    const fetchCenters = useCallback(async () => {
        try {
            setLoadingData(true);
            const response = await fetch("/api/v1/centers", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const data = await response.json();
                let centers: CenterType[] = [];

                if (user?.role?.id === 1 && user.center_id) {
                    const userCenter = data.data?.find(
                        (c: any) => c.id === user.center_id,
                    );
                    if (userCenter) {
                        centers = [userCenter];
                    }
                } else {
                    centers = data.data || [];
                }

                setCentersData(centers);

                if (centers.length > 0) {
                    fetchMosques();
                }
            }
        } catch (error) {
            console.error("Failed to fetch centers:", error);
            toast.error("فشل في تحميل المراكز");
        } finally {
            setLoadingData(false);
        }
    }, [user]);

    const fetchMosques = useCallback(async () => {
        try {
            const response = await fetch("/api/v1/mosques", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                const data = await response.json();
                setMosquesData(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch mosques:", error);
        }
    }, []);

    const fetchTeachers = useCallback(async () => {
        try {
            const response = await fetch("/api/v1/teachers", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                const data = await response.json();
                setTeachersData(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
        }
    }, []);

    const getCurrentCenterMosques = useCallback(
        (centerId?: string): MosqueType[] => {
            if (!centerId) return [];
            return mosquesData.filter(
                (mosque) => mosque.center_id.toString() === centerId,
            );
        },
        [mosquesData],
    );

    const getCurrentCenterTeachers = useCallback(
        (centerId?: string): TeacherType[] => {
            if (!centerId) return [];
            return teachersData.filter(
                (teacher) => teacher.center_id?.toString() === centerId,
            );
        },
        [teachersData],
    );

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

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
        if (!formData.center_id) newErrors.center_id = "المجمع مطلوب";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const submitForm = useCallback(
        async (onSubmit: (formData: FormData) => Promise<void>) => {
            if (!validateForm()) return;

            setIsSubmitting(true);
            try {
                const formDataSubmit = new FormData();
                formDataSubmit.append("name", formData.name);
                formDataSubmit.append("center_id", formData.center_id);
                formDataSubmit.append("_method", "PUT");
                if (formData.mosque_id)
                    formDataSubmit.append("mosque_id", formData.mosque_id);
                if (formData.teacher_id)
                    formDataSubmit.append("teacher_id", formData.teacher_id);
                if (formData.notes)
                    formDataSubmit.append("notes", formData.notes);

                await onSubmit(formDataSubmit);
            } catch (error) {
                console.error("Submit error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm],
    );

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        centersData,
        loadingData,
        getCurrentCenterMosques,
        getCurrentCenterTeachers,
        user,
        loadCircleData,
    };
};
