import { useState, useEffect, useCallback, useRef } from "react";

interface ScheduleItem {
    id: number;
    date: string;
    day_of_week_ar: string;
    start_time: string;
    end_time: string;
    start_time_12h_ar: string;
    end_time_12h_ar: string;
    time_range: string;
    is_available: boolean;
    circle_name: string;
    mosque_name: string;
    teacher_name: string;
    group: string;
    plan_id?: number;
    circle_id?: number;
    teacher_id?: number;
}

interface ScheduleSummary {
    schedule_items: ScheduleItem[];
    total_schedules: number;
}

interface PlanDetail {
    id: number;
    day_number: number;
    new_memorization: string;
    review_memorization: string;
}

interface Plan {
    id: number;
    plan_name: string;
    center_id: number;
    total_months: number;
    details_count: number;
    available_schedules_count?: number;
    first_available_schedule?: any;
    schedule_summary?: ScheduleSummary[];
    details?: PlanDetail[];
    center: {
        id: number;
        name: string;
    };
}

interface Booking {
    id: number;
    status: "pending" | "confirmed" | "cancelled";
    progress_status: string;
    booked_at: string;
    plan: any;
    schedule: any;
    day_number?: number;
}

export type PlanOrderMode =
    | "normal"
    | "reverse"
    | "from_day"
    | "reverse_from_day";

export interface PlanStartConfig {
    mode: PlanOrderMode;
    startDay?: number;
}

interface UseStudentPlansReturn {
    plans: Plan[];
    loading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
    } | null;
    bookings: Booking[];
    bookingsLoading: boolean;
    bookingsPagination: {
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
    } | null;
    fetchPlans: (
        page?: number,
        type?: "available" | "my-plans",
    ) => Promise<void>;
    refetch: () => Promise<void>;
    bookSchedule: (
        scheduleId: number,
        planId: number,
        planDetailsId: number,
        startConfig: PlanStartConfig,
    ) => Promise<{ success: boolean; message: string; booking?: Booking }>;
    cancelBooking: (
        bookingId: number,
    ) => Promise<{ success: boolean; message: string }>;
    fetchBookings: (page?: number) => Promise<void>;
    fetchPlanDetails: (planId: number) => Promise<PlanDetail[]>;
}

export const useStudentPlans = (
    initialType: "available" | "my-plans" = "available",
    initialPage: number = 1,
): UseStudentPlansReturn => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<{
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
    } | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookingsPagination, setBookingsPagination] = useState<{
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
    } | null>(null);

    // ✅ useRef بدل state عشان مش يسبب re-render
    const currentTypeRef = useRef<"available" | "my-plans">(initialType);
    const currentPageRef = useRef<number>(initialPage);

    const getCSRFHeaders = useCallback(() => {
        const token = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
        return {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": token || "",
            "X-Requested-With": "XMLHttpRequest",
        };
    }, []);

    const refreshCSRFToken = useCallback(async () => {
        try {
            await fetch("/sanctum/csrf-cookie", {
                method: "GET",
                credentials: "include",
            });
        } catch (error) {
            console.error("❌ [CSRF] Refresh failed:", error);
        }
    }, []);

    useEffect(() => {
        refreshCSRFToken();
        const interval = setInterval(refreshCSRFToken, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchPlanDetails = useCallback(
        async (planId: number): Promise<PlanDetail[]> => {
            try {
                const response = await fetch(`/api/v1/plans/${planId}`, {
                    method: "GET",
                    headers: getCSRFHeaders(),
                    credentials: "include",
                });
                if (!response.ok) return [];
                const data = await response.json();
                const details = data.details?.data || data.details || [];
                return details.map((d: any) => ({
                    id: d.id,
                    day_number: d.day_number,
                    new_memorization: d.new_memorization || "",
                    review_memorization: d.review_memorization || "",
                }));
            } catch {
                return [];
            }
        },
        [getCSRFHeaders],
    );

    // ✅ fetchPlans بدون planType في الـ dependencies
    const fetchPlans = useCallback(
        async (
            page: number = 1,
            type: "available" | "my-plans" = initialType,
        ) => {
            setLoading(true);
            setError(null);

            // ✅ حفظ القيم في الـ ref بس مش state
            currentTypeRef.current = type;
            currentPageRef.current = page;

            try {
                const params = new URLSearchParams();
                if (page > 1) params.append("page", page.toString());
                const endpoint = `/api/v1/student/plans/${
                    type === "available" ? "available" : "my-plans"
                }${params.toString() ? `?${params.toString()}` : ""}`;

                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: getCSRFHeaders(),
                    credentials: "include",
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const apiResponse = await response.json();
                const rawPlansData = apiResponse.data || [];

                const processedPlans: Plan[] = rawPlansData.map((plan: any) => {
                    let scheduleItems: ScheduleItem[] = [];
                    if (
                        plan.schedule_summary &&
                        Array.isArray(plan.schedule_summary) &&
                        plan.schedule_summary.length > 0 &&
                        plan.schedule_summary[0]?.schedule_items
                    ) {
                        const summary = plan.schedule_summary[0];
                        scheduleItems = (summary.schedule_items || []).map(
                            (item: any) => ({
                                id: item.id || 0,
                                date: item.date || "",
                                day_of_week_ar: item.day_of_week_ar || "",
                                start_time: item.start_time || "",
                                end_time: item.end_time || "",
                                start_time_12h_ar:
                                    item.start_time_12h_ar ||
                                    item.start_time ||
                                    "",
                                end_time_12h_ar:
                                    item.end_time_12h_ar || item.end_time || "",
                                time_range: item.time_range || "",
                                is_available: Boolean(item.is_available),
                                circle_name: item.circle_name || "حلقة متاحة",
                                mosque_name: item.mosque_name || "خاص بالمجمع",
                                teacher_name: item.teacher_name || "معلم متاح",
                                group: item.group || "",
                                plan_id: item.plan_id,
                                circle_id: item.circle_id,
                                teacher_id: item.teacher_id,
                            }),
                        );
                    }
                    return {
                        ...plan,
                        schedule_summary: [
                            {
                                schedule_items: scheduleItems,
                                total_schedules:
                                    scheduleItems.length ||
                                    plan.available_schedules_count ||
                                    0,
                            },
                        ],
                    };
                });

                setPlans(processedPlans);
                setPagination({
                    currentPage: apiResponse.current_page || 1,
                    lastPage: apiResponse.last_page || 1,
                    total: apiResponse.total || processedPlans.length,
                    perPage: apiResponse.per_page || 12,
                });
            } catch (err: any) {
                setError(
                    err instanceof Error ? err.message : "خطأ في تحميل الخطط",
                );
                setPlans([]);
            } finally {
                setLoading(false);
            }
        },
        [getCSRFHeaders, initialType], // ✅ initialType بس — ثابت مش بيتغير
    );

    const fetchBookings = useCallback(
        async (page: number = 1) => {
            setBookingsLoading(true);
            try {
                const params = new URLSearchParams();
                if (page > 1) params.append("page", page.toString());
                const endpoint = `/api/v1/student/plans/bookings${
                    params.toString() ? `?${params.toString()}` : ""
                }`;
                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: getCSRFHeaders(),
                    credentials: "include",
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const apiResponse = await response.json();
                setBookings(apiResponse.data || []);
                setBookingsPagination({
                    currentPage: apiResponse.current_page || 1,
                    lastPage: apiResponse.last_page || 1,
                    total: apiResponse.total || 0,
                    perPage: apiResponse.per_page || 10,
                });
            } catch {
                setBookings([]);
                setBookingsPagination(null);
            } finally {
                setBookingsLoading(false);
            }
        },
        [getCSRFHeaders],
    );

    // ✅ refetch بيقرأ من الـ ref مش من state
    const refetch = useCallback(() => {
        return fetchPlans(currentPageRef.current, currentTypeRef.current);
    }, [fetchPlans]);

    const bookSchedule = useCallback(
        async (
            scheduleId: number,
            planId: number,
            planDetailsId: number,
            startConfig: PlanStartConfig,
        ): Promise<{
            success: boolean;
            message: string;
            booking?: Booking;
        }> => {
            try {
                await refreshCSRFToken();
                await new Promise((resolve) => setTimeout(resolve, 100));

                let finalPlanDetailsId = planDetailsId;
                try {
                    const planResponse = await fetch(
                        `/api/v1/plans/${planId}`,
                        {
                            method: "GET",
                            headers: getCSRFHeaders(),
                            credentials: "include",
                        },
                    );
                    if (planResponse.ok) {
                        const planData = await planResponse.json();
                        const validDetails =
                            planData.details?.data || planData.details || [];
                        const detailExists = validDetails.find(
                            (d: any) => Number(d.id) === Number(planDetailsId),
                        );
                        if (!detailExists && validDetails.length > 0) {
                            finalPlanDetailsId = Number(validDetails[0].id);
                        }
                    }
                } catch {}

                const response = await fetch(
                    `/api/v1/student/plans/schedules/${scheduleId}/book`,
                    {
                        method: "POST",
                        headers: getCSRFHeaders(),
                        credentials: "include",
                        body: JSON.stringify({
                            plan_id: planId,
                            plan_details_id: finalPlanDetailsId,
                            start_mode: startConfig.mode,
                            start_day: startConfig.startDay ?? null,
                        }),
                    },
                );

                if (!response.ok) {
                    const errorData = await response
                        .json()
                        .catch(() => ({}) as any);
                    if (response.status === 419) {
                        return bookSchedule(
                            scheduleId,
                            planId,
                            finalPlanDetailsId,
                            startConfig,
                        );
                    }
                    return {
                        success: false,
                        message: errorData.message || `خطأ ${response.status}`,
                    };
                }

                const result = await response.json();
                if (result.success !== false) {
                    await Promise.all([refetch(), fetchBookings()]);
                }
                return {
                    success: true,
                    message: result.message || "تم الحجز بنجاح 🎉",
                    booking: result.data,
                };
            } catch (err: any) {
                return {
                    success: false,
                    message:
                        err instanceof Error ? err.message : "خطأ في الحجز",
                };
            }
        },
        [getCSRFHeaders, refetch, fetchBookings, refreshCSRFToken],
    );

    const cancelBooking = useCallback(
        async (
            bookingId: number,
        ): Promise<{ success: boolean; message: string }> => {
            try {
                await refreshCSRFToken();
                const response = await fetch(
                    `/api/v1/student/plans/bookings/${bookingId}`,
                    {
                        method: "DELETE",
                        headers: getCSRFHeaders(),
                        credentials: "include",
                    },
                );
                if (!response.ok) {
                    const errorData = await response
                        .json()
                        .catch(() => ({}) as any);
                    return {
                        success: false,
                        message: errorData.message || `خطأ ${response.status}`,
                    };
                }
                const result = await response.json();
                if (result.success !== false) {
                    await Promise.all([refetch(), fetchBookings()]);
                }
                return {
                    success: true,
                    message: result.message || "تم الإلغاء بنجاح",
                };
            } catch (err: any) {
                return {
                    success: false,
                    message:
                        err instanceof Error ? err.message : "خطأ في الإلغاء",
                };
            }
        },
        [getCSRFHeaders, refetch, fetchBookings, refreshCSRFToken],
    );

    // ✅ مرة واحدة بس عند الـ mount
    useEffect(() => {
        fetchPlans(initialPage, initialType);
    }, []);

    return {
        plans,
        loading,
        error,
        pagination,
        bookings,
        bookingsLoading,
        bookingsPagination,
        fetchPlans,
        refetch,
        bookSchedule,
        cancelBooking,
        fetchBookings,
        fetchPlanDetails,
    };
};
