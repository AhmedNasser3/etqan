import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface PlanType {
    id: number;
    name?: string;
    plan_name: string;
    center_id: number;
}

interface CircleType {
    id: number;
    name: string;
}

interface TeacherType {
    id: number;
    name: string;
}

interface FormData {
    plan_id: string;
    circle_id: string;
    teacher_id: string;
    schedule_date: string;
    start_time: string;
    end_time: string;
    max_students: string;
    notes?: string;
    duration_minutes?: string;
}

interface FormErrors {
    [key: string]: string;
}

export const useScheduleFormCreate = () => {
    const [formData, setFormData] = useState<FormData>({
        plan_id: "",
        circle_id: "",
        teacher_id: "",
        schedule_date: new Date().toISOString().split("T")[0],
        start_time: "",
        end_time: "",
        max_students: "",
        notes: "",
        duration_minutes: "60",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [plansData, setPlansData] = useState<PlanType[]>([]);
    const [circlesData, setCirclesData] = useState<CircleType[]>([]);
    const [teachersData, setTeachersData] = useState<TeacherType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [user, setUser] = useState<any>(null);

    // 🔍 STEP 1: Fetch User - إصلاح كامل للـ parsing
    useEffect(() => {
        console.log("🔍 [HOOK STEP 1] Fetching user...");
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/user", {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });
                console.log("📊 [STEP 1] User response:", response.status);

                if (response.ok) {
                    const userData = await response.json();
                    console.log("🔍 [STEP 1 RAW] FULL userData:", userData); // ✅ كامل

                    // ✅ جرب كل الاحتمالات للـ center_id
                    let centerId = null;
                    if (userData.center_id) centerId = userData.center_id;
                    else if (userData.user?.center_id)
                        centerId = userData.user.center_id;
                    else if (userData.data?.center_id)
                        centerId = userData.data.center_id;
                    else if (userData.centers?.[0]?.id)
                        centerId = userData.centers[0].id;
                    else if (userData.center?.id) centerId = userData.center.id;

                    console.log("🎯 [STEP 1] Found center_id:", centerId);

                    const fixedUser = {
                        ...userData,
                        center_id: centerId,
                        raw_data: userData, // ✅ احتفظ بالأصلي
                    };

                    setUser(fixedUser);
                    console.log(
                        "✅ [STEP 1 SUCCESS] User set with center_id:",
                        centerId,
                    );
                } else {
                    console.error(
                        "❌ [STEP 1 FAILED] User fetch failed:",
                        response.status,
                    );
                    setLoadingData(false);
                }
            } catch (error) {
                console.error("❌ [STEP 1 ERROR] Failed to fetch user:", error);
                setLoadingData(false);
            }
        };
        fetchUser();
    }, []);

    // 🔍 STEP 2: Fetch Plans - مباشرة بعد user
    const fetchPlans = useCallback(async () => {
        console.log(
            "🔍 [HOOK STEP 2] Fetching plans → /api/v1/schedule-create/plans",
        );
        try {
            setLoadingData(true);
            const response = await fetch("/api/v1/schedule-create/plans", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            console.log("📡 [STEP 2] Response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("📋 [STEP 2 RAW] Response:", data);

                // ✅ Parse كل الاحتمالات
                let plans: PlanType[] = [];
                if (Array.isArray(data)) plans = data;
                else if (Array.isArray(data.data)) plans = data.data;
                else if (Array.isArray(data.plans)) plans = data.plans;

                // ✅ Fix field names
                plans = plans.map((plan) => ({
                    id: plan.id,
                    plan_name:
                        plan.plan_name || plan.name || plan.title || "غير محدد",
                    name: plan.plan_name || plan.name || plan.title,
                    center_id: plan.center_id || user?.center_id,
                }));

                console.log(
                    "✅ [STEP 2 SUCCESS] Plans loaded:",
                    plans.length,
                    plans,
                );
                setPlansData(plans);
            } else {
                const errorText = await response.text();
                console.error(
                    "❌ [STEP 2 FAILED] HTTP",
                    response.status,
                    errorText,
                );
                toast.error("فشل في تحميل الخطط");
            }
        } catch (error) {
            console.error("❌ [STEP 2 ERROR] Plans fetch failed:", error);
            toast.error("فشل في تحميل الخطط");
        } finally {
            setLoadingData(false);
        }
    }, [user]);

    // ✅ Trigger plans بعد user
    useEffect(() => {
        if (user?.center_id) {
            console.log("🚀 [TRIGGER] User ready → fetching plans");
            fetchPlans();
        } else if (user && !user.center_id) {
            console.log(
                "⚠️ [WARNING] User loaded but no center_id → try direct fetch",
            );
            fetchPlans(); // ✅ جرب حتى لو مفيش center_id
        }
    }, [user, fetchPlans]);

    // 🔍 STEP 3: Fetch Circles
    const fetchCircles = useCallback(async () => {
        console.log("🔍 [HOOK STEP 3] Fetching circles...");
        try {
            const response = await fetch("/api/v1/schedule-create/circles", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            console.log("📡 [STEP 3] Status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("📋 [STEP 3 RAW]:", data);

                const circles: CircleType[] = Array.isArray(data)
                    ? data
                    : data.data || [];
                console.log("✅ [STEP 3 SUCCESS] Circles:", circles.length);
                setCirclesData(circles);
            }
        } catch (error) {
            console.error("❌ [STEP 3 ERROR] Circles failed:", error);
        }
    }, []);

    // 🔍 STEP 4: Fetch Teachers
    const fetchTeachers = useCallback(async () => {
        console.log("🔍 [HOOK STEP 4] Fetching teachers...");
        try {
            const response = await fetch("/api/v1/schedule-create/teachers", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            console.log("📡 [STEP 4] Status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("📋 [STEP 4 RAW]:", data);

                const teachers: TeacherType[] = Array.isArray(data)
                    ? data
                    : data.data || [];
                console.log("✅ [STEP 4 SUCCESS] Teachers:", teachers.length);
                setTeachersData(teachers);
            }
        } catch (error) {
            console.error("❌ [STEP 4 ERROR] Teachers failed:", error);
        }
    }, []);

    // ✅ Fetch circles & teachers after ANY data loads
    useEffect(() => {
        if (!loadingData && (plansData.length > 0 || user)) {
            console.log("🚀 [STEP 5] Data ready → circles + teachers");
            fetchCircles();
            fetchTeachers();
        }
    }, [loadingData, plansData.length, user, fetchCircles, fetchTeachers]);

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;
            console.log("✏️ Input:", name, "=", value);
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name as keyof FormErrors]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors],
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.plan_id) newErrors.plan_id = "الخطة مطلوبة";
        if (!formData.circle_id) newErrors.circle_id = "الحلقة مطلوبة";
        if (!formData.schedule_date)
            newErrors.schedule_date = "تاريخ الموعد مطلوب";
        if (!formData.start_time) newErrors.start_time = "وقت البداية مطلوب";
        if (!formData.end_time) newErrors.end_time = "وقت النهاية مطلوب";

        if (formData.start_time && formData.end_time) {
            const start = new Date(`2000-01-01T${formData.start_time}:00`);
            const end = new Date(`2000-01-01T${formData.end_time}:00`);
            if (end <= start) {
                newErrors.end_time = "وقت النهاية يجب أن يكون بعد وقت البداية";
            }
        }

        console.log("🔍 Validation:", newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const submitForm = useCallback(
        async (onSubmit: (formDataSubmit: FormData) => Promise<void>) => {
            console.log("🚀 [STEP 6] Submit started");

            if (!validateForm()) {
                console.log("❌ [STEP 6] Validation failed");
                return;
            }

            setIsSubmitting(true);
            try {
                const formDataSubmit = new FormData();
                formDataSubmit.append("plan_id", formData.plan_id);
                formDataSubmit.append("circle_id", formData.circle_id);
                if (formData.teacher_id)
                    formDataSubmit.append("teacher_id", formData.teacher_id);
                formDataSubmit.append("schedule_date", formData.schedule_date);
                formDataSubmit.append("start_time", formData.start_time);
                formDataSubmit.append("end_time", formData.end_time);
                formDataSubmit.append(
                    "duration_minutes",
                    formData.duration_minutes || "60",
                );
                if (formData.max_students)
                    formDataSubmit.append(
                        "max_students",
                        formData.max_students,
                    );
                if (formData.notes)
                    formDataSubmit.append("notes", formData.notes);

                console.log(
                    "📤 [STEP 6] FormData:",
                    Object.fromEntries(formDataSubmit),
                );
                await onSubmit(formDataSubmit);
            } catch (error) {
                console.error("❌ [STEP 6 ERROR]:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm],
    );

    // ✅ Debug كل render
    console.log("📊 FINAL STATE:", {
        userCenterId: user?.center_id,
        plansCount: plansData.length,
        circlesCount: circlesData.length,
        teachersCount: teachersData.length,
        loadingData,
    });

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        submitForm,
        plansData,
        circlesData,
        teachersData,
        loadingData,
        user,
    };
};
