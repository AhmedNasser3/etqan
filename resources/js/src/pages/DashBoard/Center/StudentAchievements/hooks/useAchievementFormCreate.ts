// hooks/useAchievementFormCreate.ts - ✅ إصلاح نهائي
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

export const useAchievementFormCreate = () => {
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
    const [usersData, setUsersData] = useState<UserType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [achievementKey, setAchievementKey] = useState("");
    const [achievementValue, setAchievementValue] = useState("");

    console.log(
        "🟢 [HOOK] Render - loading:",
        loadingData,
        "users:",
        usersData.length,
        "user:",
        user?.id,
    );

    // ✅ 1️⃣ Fetch User info أولاً
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

                // ✅ إصلاح: User nested في success.user
                const actualUser = responseData.user || responseData;
                console.log("👤 [fetchUser] Set user:", actualUser.center_id);
                setUser(actualUser);
            }
        } catch (error) {
            console.error("💥 [fetchUser] Error:", error);
        }
    }, []);

    // ✅ 2️⃣ Fetch Students - dependency محسن
    const fetchCenterStudents = useCallback(async () => {
        console.log("🔄 [fetchStudents] user.center_id:", user?.center_id);

        if (!user?.center_id) {
            console.log("⏹️ No center_id - user:", user);
            setLoadingData(false);
            return;
        }

        try {
            setLoadingData(true);
            console.log("📡 [fetchStudents] /api/v1/users/students");

            const response = await fetch(`/api/v1/users/students`, {
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
            console.log("✅ Students:", data.data?.length || 0);

            setUsersData(data.data || []);
        } catch (error) {
            console.error("💥 fetchStudents:", error);
            setUsersData([]);
        } finally {
            console.log("🏁 [fetchStudents] loadingData = false");
            setLoadingData(false);
        }
    }, [user?.center_id]); // ✅ Dependency صحيح

    // ✅ 3️⃣ تشغيل fetchCenterStudents لما user يتغير
    useEffect(() => {
        console.log(
            "🔗 [useEffect] user.id:",
            user?.id,
            "center_id:",
            user?.center_id,
        );
        if (user?.center_id) {
            console.log("▶️ Triggering fetchCenterStudents");
            fetchCenterStudents();
        }
    }, [user]); // ✅ user كامل مش user?.center_id

    // باقي الـ functions...
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
        "🔄 RETURN - loading:",
        loadingData,
        "users:",
        usersData.length,
    );

    return {
        formData,
        errors,
        isSubmitting,
        loadingData,
        usersData,
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
