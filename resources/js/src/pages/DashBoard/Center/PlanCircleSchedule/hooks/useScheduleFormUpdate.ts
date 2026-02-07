// hooks/useScheduleFormUpdate.ts - الكامل المُصحح
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

interface ScheduleType {
    id: number;
    plan_id: number;
    circle_id: number;
    teacher_id?: number;
    schedule_date: string;
    start_time: string;
    end_time: string;
    max_students?: number;
    notes?: string;
    duration_minutes: number;
    plan?: { plan_name: string; name?: string };
    circle?: { name: string };
    teacher?: { name: string };
}

interface FormData {
    id: string;
    plan_id: string;
    circle_id: string;
    teacher_id: string;
    schedule_date: string;
    start_time: string;
    end_time: string;
    max_students: string;
    notes: string;
    duration_minutes: string;
}

interface FormErrors {
    [key: string]: string;
}

interface UseScheduleFormUpdateProps {
    scheduleId: number;
}

export const useScheduleFormUpdate = ({
    scheduleId,
}: UseScheduleFormUpdateProps) => {
    const [formData, setFormData] = useState<FormData>({
        id: scheduleId.toString(),
        plan_id: "",
        circle_id: "",
        teacher_id: "",
        schedule_date: "",
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
    const [loadingSchedule, setLoadingSchedule] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [currentSchedule, setCurrentSchedule] = useState<ScheduleType | null>(
        null,
    );

    // 🔍 STEP 1: Fetch User ✅
    useEffect(() => {
        console.log("🔍 [UPDATE HOOK STEP 1] Fetching user...");
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/user", {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });
                console.log("📊 [STEP 1] User response:", response.status);

                if (response.ok) {
                    const userData = await response.json();
                    console.log("🔍 [STEP 1 RAW] FULL userData:", userData);

                    let centerId = null;
                    if (userData.center_id) centerId = userData.center_id;
                    else if (userData.user?.center_id)
                        centerId = userData.user.center_id;
                    else if (userData.data?.center_id)
                        centerId = userData.data.center_id;

                    console.log("🎯 [STEP 1] Found center_id:", centerId);

                    const fixedUser = {
                        ...userData,
                        center_id: centerId,
                        raw_data: userData,
                    };

                    setUser(fixedUser);
                    console.log(
                        "✅ [STEP 1 SUCCESS] User set with center_id:",
                        centerId,
                    );
                }
            } catch (error) {
                console.error("❌ [STEP 1 ERROR] Failed to fetch user:", error);
            }
        };
        fetchUser();
    }, []);

    // 🔍 STEP 2: Fetch Current Schedule - ✅ إصلاح pagination
    const fetchCurrentSchedule = useCallback(async () => {
        console.log("🔍 [UPDATE HOOK STEP 2] Fetching schedule:", scheduleId);
        try {
            setLoadingSchedule(true);
            const response = await fetch(
                `/api/v1/plans/schedules/${scheduleId}`,
                {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                },
            );
            console.log("📡 [STEP 2] Schedule response:", response.status);

            if (response.ok) {
                const responseData = await response.json();
                console.log("📋 [STEP 2 RAW] FULL response:", responseData);

                // ✅ Parse pagination أو single object
                let schedule: ScheduleType | null = null;

                if (
                    responseData.data &&
                    Array.isArray(responseData.data) &&
                    responseData.data[0]
                ) {
                    // Pagination response: {data: [{id: 1, ...}]}
                    schedule = responseData.data[0];
                    console.log(
                        "✅ [STEP 2] Schedule from pagination data[0]:",
                        schedule,
                    );
                } else if (responseData.id) {
                    // Single object response
                    schedule = responseData;
                    console.log(
                        "✅ [STEP 2] Single schedule object:",
                        schedule,
                    );
                } else {
                    console.error(
                        "❌ [STEP 2] Invalid schedule format:",
                        responseData,
                    );
                    toast.error("تنسيق بيانات الموعد غير صحيح");
                    return null;
                }

                setCurrentSchedule(schedule);
                return schedule;
            } else {
                const errorText = await response.text();
                console.error(
                    "❌ [STEP 2 FAILED] Schedule not found:",
                    response.status,
                    errorText,
                );
                toast.error("الموعد غير موجود");
                return null;
            }
        } catch (error) {
            console.error("❌ [STEP 2 ERROR] Failed to fetch schedule:", error);
            toast.error("فشل في تحميل بيانات الموعد");
            return null;
        } finally {
            setLoadingSchedule(false);
        }
    }, [scheduleId]);

    // 🔍 STEP 3: Fetch Plans ✅
    const fetchPlans = useCallback(async () => {
        console.log("🔍 [UPDATE HOOK STEP 3] Fetching plans...");
        try {
            setLoadingData(true);
            const response = await fetch("/api/v1/schedule-create/plans", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            console.log("📡 [STEP 3] Plans response:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("📋 [STEP 3 RAW] Plans:", data);

                let plans: PlanType[] = [];
                if (Array.isArray(data)) plans = data;
                else if (Array.isArray(data.data)) plans = data.data;

                plans = plans.map((plan) => ({
                    id: plan.id,
                    plan_name:
                        plan.plan_name || plan.name || plan.title || "غير محدد",
                    name: plan.plan_name || plan.name || plan.title,
                    center_id: plan.center_id || user?.center_id,
                }));

                console.log("✅ [STEP 3 SUCCESS] Plans loaded:", plans.length);
                setPlansData(plans);
            } else {
                toast.error("فشل في تحميل الخطط");
            }
        } catch (error) {
            console.error("❌ [STEP 3 ERROR] Plans fetch failed:", error);
            toast.error("فشل في تحميل الخطط");
        } finally {
            setLoadingData(false);
        }
    }, [user?.center_id]); // ✅ إصلاح dependency

    // 🔍 STEP 4: Fetch Circles ✅
    const fetchCircles = useCallback(async () => {
        console.log("🔍 [UPDATE HOOK STEP 4] Fetching circles...");
        try {
            const response = await fetch("/api/v1/schedule-create/circles", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            if (response.ok) {
                const data = await response.json();
                const circles: CircleType[] = Array.isArray(data)
                    ? data
                    : data.data || [];
                console.log("✅ [STEP 4 SUCCESS] Circles:", circles.length);
                setCirclesData(circles);
            }
        } catch (error) {
            console.error("❌ [STEP 4 ERROR] Circles failed:", error);
        }
    }, []);

    // 🔍 STEP 5: Fetch Teachers ✅
    const fetchTeachers = useCallback(async () => {
        console.log("🔍 [UPDATE HOOK STEP 5] Fetching teachers...");
        try {
            const response = await fetch("/api/v1/schedule-create/teachers", {
                credentials: "include",
                headers: { Accept: "application/json" },
            });
            console.log("📡 [STEP 5] Teachers response:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("📋 [STEP 5 RAW] Teachers:", data);

                const teachers: TeacherType[] = Array.isArray(data)
                    ? data
                    : data.data || [];
                console.log("✅ [STEP 5 SUCCESS] Teachers:", teachers.length);
                setTeachersData(teachers);
            } else {
                console.error("❌ [STEP 5] Teachers failed:", response.status);
            }
        } catch (error) {
            console.error("❌ [STEP 5 ERROR] Teachers failed:", error);
        }
    }, []);

    // ✅ Load sequence ✅
    useEffect(() => {
        if (user?.center_id) {
            console.log("🚀 [UPDATE SEQUENCE] User ready → fetch plans");
            fetchPlans();
        }
    }, [user, fetchPlans]);

    useEffect(() => {
        if (!loadingData && plansData.length > 0) {
            console.log(
                "🚀 [UPDATE SEQUENCE] Plans ready → circles + teachers + schedule",
            );
            fetchCircles();
            fetchTeachers();
            fetchCurrentSchedule();
        }
    }, [
        loadingData,
        plansData.length,
        fetchCircles,
        fetchTeachers,
        fetchCurrentSchedule,
    ]);

    // ✅ Fill form with current schedule data ✅
    useEffect(() => {
        if (currentSchedule && plansData.length > 0 && circlesData.length > 0) {
            console.log(
                "🎨 [UPDATE HOOK] Filling form with schedule data:",
                currentSchedule,
            );

            // ✅ تأكد من وجود البيانات قبل الـ fill
            const safeScheduleData = {
                id: currentSchedule.id?.toString() || formData.id,
                plan_id: currentSchedule.plan_id?.toString() || "",
                circle_id: currentSchedule.circle_id?.toString() || "",
                teacher_id: currentSchedule.teacher_id?.toString() || "",
                schedule_date: currentSchedule.schedule_date || "",
                start_time: currentSchedule.start_time || "",
                end_time: currentSchedule.end_time || "",
                max_students: currentSchedule.max_students?.toString() || "",
                notes: currentSchedule.notes || "",
                duration_minutes:
                    currentSchedule.duration_minutes?.toString() || "60",
            };

            setFormData(safeScheduleData);
            console.log("✅ [FILL FORM] Safe data applied:", safeScheduleData);
        }
    }, [currentSchedule, plansData.length, circlesData.length]);

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;
            console.log("✏️ [UPDATE] Input:", name, "=", value);
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

        console.log("🔍 [UPDATE] Validation:", newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const submitForm = useCallback(
        async (onSubmit: (formDataSubmit: FormData) => Promise<void>) => {
            console.log("🚀 [UPDATE HOOK STEP 6] Update started");

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
                formDataSubmit.append("_method", "PUT"); // ✅ Laravel PUT spoofing
                formDataSubmit.append("schedule_date", formData.schedule_date);
                formDataSubmit.append("start_time", formData.start_time);
                formDataSubmit.append("end_time", formData.end_time);
                formDataSubmit.append(
                    "duration_minutes",
                    formData.duration_minutes,
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
                    Object.fromEntries(formDataSubmit.entries()),
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

    console.log("📊 [UPDATE HOOK] FINAL STATE:", {
        scheduleId,
        userCenterId: user?.center_id,
        plansCount: plansData.length,
        circlesCount: circlesData.length,
        teachersCount: teachersData.length,
        loadingData,
        loadingSchedule,
        formFilled: !!currentSchedule,
        formDataKeys: Object.keys(formData),
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
        loadingData: loadingData || loadingSchedule,
        user,
        currentSchedule,
    };
};
