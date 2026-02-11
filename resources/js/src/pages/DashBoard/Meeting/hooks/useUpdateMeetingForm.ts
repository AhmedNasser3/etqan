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
}

export interface PlanDetailType {
    id: number;
    day_number: number;
}

interface FormData {
    id: number;
    teacher_id: number;
    student_id: number;
    center_id: number;
    plan_circle_schedule_id: number;
    student_plan_detail_id: number;
    meeting_date: string;
    meeting_start_time: string;
    notes: string;
    meeting_code: string;
    jitsi_meeting_url: string;
}

interface FormErrors {
    [key: string]: string;
}

export interface MeetingType {
    id: number;
    teacher: UserType;
    student: UserType;
    center: CenterType;
    plan_circle_schedule_id: number;
    student_plan_detail_id: number;
    meeting_date: string;
    meeting_start_time: string;
    meeting_end_time?: string;
    notes?: string;
    meeting_code: string;
    jitsi_meeting_url: string;
    teacher_joined: boolean;
    student_joined: boolean;
}

export const useUpdateMeetingForm = (meeting: MeetingType | null) => {
    const [formData, setFormData] = useState<FormData>({
        id: 0,
        teacher_id: 0,
        student_id: 0,
        center_id: 0,
        plan_circle_schedule_id: 0,
        student_plan_detail_id: 0,
        meeting_date: "",
        meeting_start_time: "",
        notes: "",
        meeting_code: "",
        jitsi_meeting_url: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Initialize form with meeting data
    useEffect(() => {
        if (meeting) {
            setFormData({
                id: meeting.id,
                teacher_id: meeting.teacher.id,
                student_id: meeting.student.id,
                center_id: meeting.center.id,
                plan_circle_schedule_id: meeting.plan_circle_schedule_id,
                student_plan_detail_id: meeting.student_plan_detail_id,
                meeting_date: meeting.meeting_date,
                meeting_start_time: meeting.meeting_start_time,
                notes: meeting.notes || "",
                meeting_code: meeting.meeting_code,
                jitsi_meeting_url: meeting.jitsi_meeting_url,
            });
        }
    }, [meeting]);

    // Load initial data
    useEffect(() => {
        fetchTeachers();
        fetchStudents();
        fetchCenters();
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

    // Load schedules based on center
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

    // Load plan details
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
        if (!validateForm()) return false;

        setIsSubmitting(true);
        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "";

            const response = await fetch(`/api/v1/meetings/${formData.id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    ...formData,
                    _method: "PUT", // Laravel PUT workaround
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || "فشل في تحديث الميتينج");
                return false;
            }

            toast.success("تم تحديث الميتينج بنجاح!");
            return true;
        } catch (error) {
            toast.error("حدث خطأ في التحديث");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm]);

    return {
        formData,
        errors,
        isSubmitting,
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
        setFormData,
    };
};
