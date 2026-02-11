import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export interface UserType {
    id: number;
    name: string;
}

export interface CenterType {
    id: number;
    name: string;
}

export interface ScheduleType {
    id: number;
    schedule_date: string;
    start_time: string;
    teacher_id: number;
}

export interface PlanDetailType {
    id: number;
    day_number: number;
}

interface FormData {
    teacher_id: number;
    student_id: number;
    center_id: number;
    plan_circle_schedule_id: number;
    student_plan_detail_id: number;
    meeting_date: string;
    meeting_start_time: string;
    notes: string;
}

interface FormErrors {
    [key: string]: string;
}

export const useCreateMeetingForm = () => {
    const [formData, setFormData] = useState<FormData>({
        teacher_id: 0,
        student_id: 0,
        center_id: 0,
        plan_circle_schedule_id: 0,
        student_plan_detail_id: 0,
        meeting_date: "",
        meeting_start_time: "",
        notes: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [meetingCode, setMeetingCode] = useState("");

    // Lists
    const [teachers, setTeachers] = useState<UserType[]>([]);
    const [students, setStudents] = useState<UserType[]>([]);
    const [centers, setCenters] = useState<CenterType[]>([]);
    const [schedules, setSchedules] = useState<ScheduleType[]>([]);
    const [planDetails, setPlanDetails] = useState<PlanDetailType[]>([]);

    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingCenters, setLoadingCenters] = useState(true);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [loadingPlanDetails, setLoadingPlanDetails] = useState(false);

    // جلب المعلمين
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = useCallback(async () => {
        try {
            setLoadingTeachers(true);
            const response = await fetch("/api/v1/users?role=teacher", {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTeachers(data.data || []);
            }
        } catch (error) {
            toast.error("فشل تحميل المعلمين");
        } finally {
            setLoadingTeachers(false);
        }
    }, []);

    // جلب الطلاب
    const fetchStudents = useCallback(async () => {
        try {
            setLoadingStudents(true);
            const response = await fetch("/api/v1/users?role=student", {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStudents(data.data || []);
            }
        } catch (error) {
            toast.error("فشل تحميل الطلاب");
        } finally {
            setLoadingStudents(false);
        }
    }, []);

    // جلب المراكز
    const fetchCenters = useCallback(async () => {
        try {
            setLoadingCenters(true);
            const response = await fetch("/api/v1/centers", {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCenters(data.data || []);
            }
        } catch (error) {
            toast.error("فشل تحميل المراكز");
        } finally {
            setLoadingCenters(false);
        }
    }, []);

    // جلب جداول الحصص بناءً على المركز
    useEffect(() => {
        if (formData.center_id > 0) {
            fetchSchedules(formData.center_id);
        }
    }, [formData.center_id]);

    const fetchSchedules = useCallback(async (centerId: number) => {
        try {
            setLoadingSchedules(true);
            const response = await fetch(
                `/api/v1/plan-circle-schedules?center_id=${centerId}&is_available=true`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                setSchedules(data.data || []);
            }
        } catch (error) {
            toast.error("فشل تحميل جداول الحصص");
        } finally {
            setLoadingSchedules(false);
        }
    }, []);

    // جلب تفاصيل خطة الطالب
    useEffect(() => {
        if (formData.student_id > 0 && formData.plan_circle_schedule_id > 0) {
            fetchPlanDetails();
        }
    }, [formData.student_id, formData.plan_circle_schedule_id]);

    const fetchPlanDetails = useCallback(async () => {
        try {
            setLoadingPlanDetails(true);
            const response = await fetch(
                `/api/v1/student-plan-details?student_id=${formData.student_id}&plan_circle_schedule_id=${formData.plan_circle_schedule_id}`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                setPlanDetails(data.data || []);
            }
        } catch (error) {
            toast.error("فشل تحميل تفاصيل الخطة");
        } finally {
            setLoadingPlanDetails(false);
        }
    }, [formData.student_id, formData.plan_circle_schedule_id]);

    const handleInputChange = useCallback(
        (
            e: React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: parseInt(value) || value,
            }));
            if (errors[name as keyof FormErrors]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors],
    );

    const generateMeetingCode = useCallback(
        (teacherId: number, studentId: number): string => {
            const random = Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();
            return `halaqa-teacher-${teacherId}-student-${studentId}-${random}`;
        },
        [],
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (formData.teacher_id === 0)
            newErrors.teacher_id = "يرجى اختيار معلم";
        if (formData.student_id === 0)
            newErrors.student_id = "يرجى اختيار طالب";
        if (formData.center_id === 0) newErrors.center_id = "يرجى اختيار مركز";
        if (formData.plan_circle_schedule_id === 0)
            newErrors.plan_circle_schedule_id = "يرجى اختيار جدول الحصة";
        if (formData.student_plan_detail_id === 0)
            newErrors.student_plan_detail_id = "يرجى اختيار تفاصيل الخطة";
        if (!formData.meeting_date)
            newErrors.meeting_date = "يرجى اختيار تاريخ الميتينج";
        if (!formData.meeting_start_time)
            newErrors.meeting_start_time = "يرجى اختيار وقت البداية";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const submitForm = useCallback(async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";
            const code = generateMeetingCode(
                formData.teacher_id,
                formData.student_id,
            );

            const response = await fetch("/api/v1/meetings", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    ...formData,
                    meeting_code: code,
                    jitsi_meeting_url: `https://meet.jit.si/${code}`,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || "فشل في إنشاء الميتينج");
                return false;
            }

            toast.success("تم إنشاء الميتينج بنجاح!");
            return true;
        } catch (error) {
            toast.error("حدث خطأ في الإنشاء");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, generateMeetingCode, validateForm]);

    return {
        formData,
        errors,
        isSubmitting,
        meetingCode,
        teachers,
        students,
        centers,
        schedules,
        planDetails,
        loadingTeachers,
        loadingStudents,
        loadingCenters,
        loadingSchedules,
        loadingPlanDetails,
        handleInputChange,
        submitForm,
        generateMeetingCode,
        fetchTeachers,
        fetchStudents,
        fetchCenters,
        setFormData,
    };
};
