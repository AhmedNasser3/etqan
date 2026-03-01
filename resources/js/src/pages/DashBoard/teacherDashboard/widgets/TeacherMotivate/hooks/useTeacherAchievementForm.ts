// hooks/useTeacherAchievementForm.ts -  مُصحح للمعلم مع Debug
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface UserType {
    id: number;
    name: string;
    email: string;
    phone?: string;
    center_id: number;
}

interface AchievementType {
    id: number;
    user_id: number;
    points: number;
    points_action: "added" | "deducted";
    reason: string;
    achievement_type?: string;
    achievements: Record<string, any>;
    user: UserType;
}

interface FormData {
    id: number;
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

export const useTeacherAchievementForm = (achievementId?: number | null) => {
    const [formData, setFormData] = useState<FormData>({
        id: 0,
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
    const [achievementLoading, setAchievementLoading] = useState(false);

    console.log(
        "🟢 [TEACHER UPDATE HOOK] Render - achievementId:",
        achievementId,
    );

    //  1️⃣ Fetch User أولاً
    useEffect(() => {
        console.log("🚀 [STEP 1] Fetching user...");
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
                const actualUser = responseData.user || responseData;
                console.log(
                    "👤 [fetchUser] User loaded:",
                    actualUser.center_id,
                );
                setUser(actualUser);
            }
        } catch (error) {
            console.error("💥 [fetchUser] Error:", error);
        }
    }, []);

    //  2️⃣ Fetch Achievement data
    useEffect(() => {
        console.log("🔗 [useEffect] achievementId changed:", achievementId);
        if (achievementId && achievementId > 0) {
            fetchAchievement();
        } else {
            setLoadingData(false);
        }
    }, [achievementId]);

    const fetchAchievement = useCallback(async () => {
        if (!achievementId) return;

        console.log("📡 [fetchAchievement]", achievementId);
        try {
            setAchievementLoading(true);
            const response = await fetch(
                `/api/v1/teacher/achievements/${achievementId}`, //  تغيير الـ endpoint
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );

            if (response.ok) {
                const achievement: AchievementType = await response.json();
                console.log(" [fetchAchievement] Data:", achievement);

                setFormData({
                    id: achievement.id,
                    user_id:
                        achievement.user_id?.toString() ||
                        achievement.user?.id?.toString() ||
                        "",
                    points: achievement.points?.toString() || "",
                    points_action: achievement.points_action || "added",
                    reason: achievement.reason || "",
                    achievement_type: achievement.achievement_type || "",
                    achievements: achievement.achievements || {},
                });
                console.log("💾 [fetchAchievement] Form filled!");
            } else {
                toast.error("فشل في تحميل بيانات الإنجاز");
            }
        } catch (error) {
            console.error("💥 [fetchAchievement] Error:", error);
            toast.error("فشل في تحميل بيانات الإنجاز");
        } finally {
            setAchievementLoading(false);
            setLoadingData(false);
        }
    }, [achievementId]);

    //  3️⃣ Fetch Teacher Students  التغيير الأساسي
    useEffect(() => {
        if (user) {
            console.log("▶️ [useEffect] Fetching teacher students...");
            fetchTeacherStudents();
        }
    }, [user]);

    const fetchTeacherStudents = useCallback(async () => {
        console.log("🔄 [fetchTeacherStudents]");
        if (!user) {
            setLoadingData(false);
            return;
        }

        try {
            const response = await fetch("/api/v1/teacher/students", {
                //  endpoint جديد للمعلم
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(
                    " [fetchTeacherStudents] Raw data:",
                    data.data?.length,
                );
                setStudentsData(data.data || []);
            }
        } catch (error) {
            console.error("💥 [fetchTeacherStudents] Error:", error);
            setStudentsData([]);
        } finally {
            setLoadingData(false);
        }
    }, [user]);

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

    return {
        formData,
        errors,
        isSubmitting,
        loadingData: loadingData || achievementLoading,
        studentsData, //  طلاب المعلم
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
