// hooks/useTeacherAchievementFormCreate.ts -  مُصحح للمعلم مع Debug كامل
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface UserType {
    id: number;
    name: string;
    email: string;
    phone?: string;
    center_id: number;
}

interface FormData {
    user_id: string;
    points: string;
    points_action: "added" | "deducted";
    reason: string;
    achievement_type: string;
    achievements: Record<string, any>;
}

interface FormErrors {
    [key: string]: string;
}

export const useTeacherAchievementFormCreate = () => {
    const [formData, setFormData] = useState<FormData>({
        user_id: "",
        points: "",
        points_action: "added",
        reason: "",
        achievement_type: "",
        achievements: {},
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentsData, setStudentsData] = useState<UserType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [achievementKey, setAchievementKey] = useState("");
    const [achievementValue, setAchievementValue] = useState("");

    console.log(
        "🟢 [TEACHER CREATE HOOK] Render - loading:",
        loadingData,
        "students:",
        studentsData.length,
        "user:",
        user?.id,
    );

    //  1️⃣ Fetch User info أولاً
    useEffect(() => {
        console.log("🚀 [STEP 1] Mounting - fetchUser()");
        fetchUser();
    }, []);

    const fetchUser = useCallback(async () => {
        console.log("🔍 [fetchUser] /api/user...");
        try {
            const response = await fetch("/api/user", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log("📦 [fetchUser] Raw:", responseData);

                //  إصلاح: User nested في success.user
                const actualUser = responseData.user || responseData;
                console.log("👤 [fetchUser] Set user:", actualUser.id);
                setUser(actualUser);
            }
        } catch (error) {
            console.error("💥 [fetchUser] Error:", error);
        }
    }, []);

    //  2️⃣ Fetch Teacher Students - endpoint جديد  التغيير الأساسي
    const fetchTeacherStudents = useCallback(async () => {
        console.log("🔄 [fetchTeacherStudents] user.id:", user?.id);

        if (!user) {
            console.log("⏹️ No user - skipping");
            setLoadingData(false);
            return;
        }

        try {
            setLoadingData(true);
            console.log("📡 [fetchTeacherStudents] /api/v1/teacher/students");

            const response = await fetch(`/api/v1/teacher/students`, {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            console.log("📡 Status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(
                " [fetchTeacherStudents] Students:",
                data.data?.length || 0,
            );

            setStudentsData(data.data || []);
        } catch (error) {
            console.error("💥 [fetchTeacherStudents] Error:", error);
            toast.error("فشل في جلب طلاب المعلم");
            setStudentsData([]);
        } finally {
            console.log("🏁 [fetchTeacherStudents] loadingData = false");
            setLoadingData(false);
        }
    }, [user]);

    //  3️⃣ تشغيل fetchTeacherStudents لما user يتغير
    useEffect(() => {
        console.log("🔗 [useEffect] user.id:", user?.id, "has user:", !!user);
        if (user) {
            console.log("▶️ Triggering fetchTeacherStudents");
            fetchTeacherStudents();
        }
    }, [user, fetchTeacherStudents]); //  dependency صحيح

    //  باقي الـ functions زي ما هي
    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name as keyof FormErrors]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors],
    );

    const addAchievement = useCallback(() => {
        if (achievementKey.trim() && achievementValue.trim()) {
            setFormData((prev) => ({
                ...prev,
                achievements: {
                    ...prev.achievements,
                    [achievementKey.trim()]: achievementValue.trim(),
                },
            }));
            setAchievementKey("");
            setAchievementValue("");
        }
    }, [achievementKey, achievementValue]);

    const removeAchievement = useCallback(
        (key: string) => {
            const newAchievements = { ...formData.achievements };
            delete newAchievements[key];
            setFormData((prev) => ({
                ...prev,
                achievements: newAchievements,
            }));
        },
        [formData.achievements],
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.user_id.trim()) newErrors.user_id = "الطالب مطلوب";
        if (!formData.points.trim()) newErrors.points = "النقاط مطلوبة";
        if (!formData.reason.trim()) newErrors.reason = "السبب مطلوب";
        if (
            parseInt(formData.points) < -1000 ||
            parseInt(formData.points) > 1000
        ) {
            newErrors.points = "النقاط يجب أن تكون بين -1000 و 1000";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const submitForm = useCallback(
        async (onSubmit: (formData: FormData) => Promise<void>) => {
            if (!validateForm()) return;

            setIsSubmitting(true);
            try {
                await onSubmit(formData);
            } catch (error) {
                console.error("Submit error:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm],
    );

    console.log(
        "🔄 [TEACHER CREATE] RETURN - loading:",
        loadingData,
        "students:",
        studentsData.length,
    );

    return {
        formData,
        errors,
        isSubmitting,
        loadingData,
        studentsData, //  طلاب المعلم بس
        user,
        achievementKey,
        achievementValue,
        handleInputChange,
        addAchievement,
        removeAchievement,
        setAchievementKey,
        setAchievementValue,
        submitForm,
    };
};
