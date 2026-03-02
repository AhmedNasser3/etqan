// hooks/useTransferFormUpdate.ts
import { useState, useEffect, useCallback } from "react";

interface ScheduleType {
    id: number;
    circle_id: number;
    circle_name: string;
    schedule_date: string;
    time_range: string;
    teacher_name: string;
    capacity_status: string;
    remaining_slots: number | null;
    duration_minutes: number;
}

interface CircleType {
    id: number;
    circle_name: string;
    schedule_count: number;
}

interface PlanType {
    id: number;
    plan_name: string;
    total_months: number;
    center_name: string;
    circle_count: number;
}

interface FormDataType {
    new_plan_id: string;
    new_circle_id: string;
    new_schedule_id: string;
}

interface ErrorsType {
    new_plan_id?: string;
    new_circle_id?: string;
    new_schedule_id?: string;
}

export const useTransferFormUpdate = (bookingId: number) => {
    const [formData, setFormData] = useState<FormDataType>({
        new_plan_id: "",
        new_circle_id: "",
        new_schedule_id: "",
    });
    const [errors, setErrors] = useState<ErrorsType>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingBooking, setIsLoadingBooking] = useState(true);

    // البيانات الأساسية - 3 مراحل
    const [plansData, setPlansData] = useState<PlanType[]>([]);
    const [circlesData, setCirclesData] = useState<CircleType[]>([]);
    const [schedulesData, setSchedulesData] = useState<ScheduleType[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [loadingCircles, setLoadingCircles] = useState(false);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<any>(null);
    const [selectedSchedule, setSelectedSchedule] =
        useState<ScheduleType | null>(null);

    // 🔥 1. جلب الخطط
    const fetchPlansData = useCallback(async () => {
        setLoadingData(true);
        setIsLoadingBooking(true);

        try {
            const response = await fetch(
                `/api/v1/student/transfer/${bookingId}/plans`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            const result = await response.json();

            if (response.ok && result.success) {
                setCurrentBooking(result.current_plan);
                setPlansData(result.available_plans || []);
            }
        } catch (error) {
            setPlansData([]);
        } finally {
            setLoadingData(false);
            setIsLoadingBooking(false);
        }
    }, [bookingId]);

    // 🔥 2. جلب الحلقات للخطة المختارة
    const fetchCirclesData = useCallback(async (planId: string) => {
        if (!planId) {
            setCirclesData([]);
            setSchedulesData([]);
            setSelectedSchedule(null);
            setFormData((prev) => ({
                ...prev,
                new_circle_id: "",
                new_schedule_id: "",
            }));
            return;
        }

        setLoadingCircles(true);
        try {
            const response = await fetch(
                `/api/v1/student/transfer/plans/${planId}/circles`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            const result = await response.json();

            if (response.ok && result.success) {
                setCirclesData(result.circles || []);
            }
        } catch (error) {
            setCirclesData([]);
        } finally {
            setLoadingCircles(false);
        }
    }, []);

    // 🔥 3. جلب المواعيد للحلقة المختارة + الخطة
    const fetchSchedulesData = useCallback(
        async (circleId: string, planId: string) => {
            if (!circleId || !planId) {
                setSchedulesData([]);
                setSelectedSchedule(null);
                setFormData((prev) => ({ ...prev, new_schedule_id: "" }));
                return;
            }

            setLoadingSchedules(true);
            try {
                const response = await fetch(
                    `/api/v1/student/transfer/circles/${circleId}/schedules?plan_id=${planId}`,
                    {
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    },
                );

                const result = await response.json();

                if (response.ok && result.success) {
                    setSchedulesData(result.schedules || []);
                }
            } catch (error) {
                setSchedulesData([]);
            } finally {
                setLoadingSchedules(false);
            }
        },
        [],
    );

    // 🔥 تحديث الموعد المختار
    const updateSelectedSchedule = useCallback(
        (scheduleId: string) => {
            const selected = schedulesData.find(
                (s) => s.id.toString() === scheduleId,
            );
            setSelectedSchedule(selected || null);
        },
        [schedulesData],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const { name, value } = e.target;

            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => ({ ...prev, [name]: undefined }));

            // 🔥 1. لو غير الخطة → جلب حلقات جديدة + مسح المواعيد
            if (name === "new_plan_id") {
                fetchCirclesData(value);
                if (!value) {
                    setCirclesData([]);
                    setSchedulesData([]);
                    setSelectedSchedule(null);
                }
            }

            // 🔥 2. لو غير الحلقة → جلب مواعيد جديدة (مع plan_id)
            if (name === "new_circle_id") {
                const currentPlanId = formData.new_plan_id;
                fetchSchedulesData(value, currentPlanId);
                if (!value) {
                    setSchedulesData([]);
                    setSelectedSchedule(null);
                }
            }

            // 🔥 3. لو غير الموعد → تحديث الـ Preview
            if (name === "new_schedule_id") {
                updateSelectedSchedule(value);
            }
        },
        [
            fetchCirclesData,
            fetchSchedulesData,
            updateSelectedSchedule,
            formData.new_plan_id,
        ],
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: ErrorsType = {};

        if (!formData.new_plan_id) {
            newErrors.new_plan_id = "يجب اختيار خطة جديدة";
        }
        if (formData.new_plan_id && !formData.new_circle_id) {
            newErrors.new_circle_id = "يجب اختيار حلقة";
        }
        if (formData.new_circle_id && !formData.new_schedule_id) {
            newErrors.new_schedule_id = "يجب اختيار موعد";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const submitForm = useCallback(
        async (handleSubmit: (formData: FormData) => Promise<void>) => {
            if (!validateForm()) return;

            setIsSubmitting(true);
            const submitData = new FormData();
            submitData.append("new_plan_id", formData.new_plan_id);
            submitData.append("new_schedule_id", formData.new_schedule_id);

            try {
                await handleSubmit(submitData);
            } catch (error) {
                // Handle error silently
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm],
    );

    // 🔥 جلب الخطط عند تحميل الكومبوننت
    useEffect(() => {
        fetchPlansData();
    }, [fetchPlansData]);

    return {
        formData,
        errors,
        isSubmitting,
        isLoadingBooking,
        loadingData,
        loadingCircles,
        loadingSchedules,
        handleInputChange,
        submitForm,
        plansData,
        circlesData,
        schedulesData,
        currentBooking,
        selectedSchedule,
    };
};
