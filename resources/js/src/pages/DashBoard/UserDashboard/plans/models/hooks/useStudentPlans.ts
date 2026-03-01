import { useState, useEffect, useCallback } from "react";

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

interface Plan {
    id: number;
    plan_name: string;
    center_id: number;
    total_months: number;
    details_count: number;
    available_schedules_count?: number;
    first_available_schedule?: any;
    schedule_summary?: ScheduleSummary[];
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
    ) => Promise<{ success: boolean; message: string; booking?: Booking }>;
    cancelBooking: (
        bookingId: number,
    ) => Promise<{ success: boolean; message: string }>;
    fetchBookings: (page?: number) => Promise<void>;
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
    const [planType, setPlanType] = useState<"available" | "my-plans">(
        initialType,
    );

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookingsPagination, setBookingsPagination] = useState<{
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
    } | null>(null);

    //  CSRF Headers مُحسّنة مع fallback + refresh
    const getCSRFHeaders = useCallback(() => {
        const token = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
        console.log("🔍 [CSRF] Token found:", !!token);
        return {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-TOKEN": token || "",
            "X-Requested-With": "XMLHttpRequest",
        };
    }, []);

    //  CSRF Token Refresh
    const refreshCSRFToken = useCallback(async () => {
        console.log("🔄 [CSRF] Refreshing token...");
        try {
            await fetch("/sanctum/csrf-cookie", {
                method: "GET",
                credentials: "include",
            });
        } catch (error) {
            console.error("❌ [CSRF] Refresh failed:", error);
        }
    }, []);

    //  Initialize CSRF
    useEffect(() => {
        console.log("🔍 [CSRF] Initializing for web middleware...");
        refreshCSRFToken();
        const interval = setInterval(refreshCSRFToken, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [refreshCSRFToken]);

    const fetchPlans = useCallback(
        async (page: number = 1, type: "available" | "my-plans" = planType) => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (page > 1) params.append("page", page.toString());

                const endpoint = `/api/v1/student/plans/${type === "available" ? "available" : "my-plans"}${params.toString() ? `?${params.toString()}` : ""}`;

                console.log("📡 [fetchPlans]", endpoint);

                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: getCSRFHeaders(),
                    credentials: "include",
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(
                        "❌ [fetchPlans]",
                        response.status,
                        errorText.substring(0, 200),
                    );
                    throw new Error(`HTTP ${response.status}`);
                }

                const apiResponse = await response.json();
                const rawPlansData =
                    type === "available"
                        ? apiResponse.data
                        : apiResponse.data || [];

                const processedPlans: Plan[] = (rawPlansData || []).map(
                    (plan: any) => {
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
                                        item.end_time_12h_ar ||
                                        item.end_time ||
                                        "",
                                    time_range: item.time_range || "",
                                    is_available: Boolean(item.is_available),
                                    circle_name:
                                        item.circle_name || "حلقة متاحة",
                                    mosque_name:
                                        item.mosque_name || "خاص بالمجمع",
                                    teacher_name:
                                        item.teacher_name || "معلم متاح",
                                    group: item.group || "",
                                    plan_id: item.plan_id,
                                    circle_id: item.circle_id,
                                    teacher_id: item.teacher_id,
                                }),
                            );
                        }

                        const summary: ScheduleSummary = {
                            schedule_items: scheduleItems,
                            total_schedules:
                                scheduleItems.length ||
                                plan.available_schedules_count ||
                                0,
                        };

                        return {
                            ...plan,
                            schedule_summary: [summary],
                        };
                    },
                );

                const paginationData =
                    type === "available"
                        ? {
                              currentPage: apiResponse.current_page || 1,
                              lastPage: apiResponse.last_page || 1,
                              total: apiResponse.total || processedPlans.length,
                              perPage: apiResponse.per_page || 12,
                          }
                        : {
                              currentPage: apiResponse.current_page || 1,
                              lastPage: apiResponse.last_page || 1,
                              total: apiResponse.total || processedPlans.length,
                              perPage: apiResponse.per_page || 10,
                          };

                setPlans(processedPlans);
                setPagination(paginationData);
                setPlanType(type);
            } catch (err: any) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "خطأ في تحميل خطط الطالب";
                setError(errorMessage);
                setPlans([]);
            } finally {
                setLoading(false);
            }
        },
        [getCSRFHeaders, planType],
    );

    const fetchBookings = useCallback(
        async (page: number = 1) => {
            setBookingsLoading(true);

            try {
                const params = new URLSearchParams();
                if (page > 1) params.append("page", page.toString());

                const endpoint = `/api/v1/student/plans/bookings${params.toString() ? `?${params.toString()}` : ""}`;

                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: getCSRFHeaders(),
                    credentials: "include",
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(
                        `HTTP ${response.status}: ${errorText.substring(0, 100)}`,
                    );
                }

                const apiResponse = await response.json();
                setBookings(apiResponse.data || []);

                const paginationData = {
                    currentPage: apiResponse.current_page || 1,
                    lastPage: apiResponse.last_page || 1,
                    total: apiResponse.total || 0,
                    perPage: apiResponse.per_page || 10,
                };

                setBookingsPagination(paginationData);
            } catch (err: any) {
                console.error("خطأ في جلب الحجوزات:", err);
                setBookings([]);
                setBookingsPagination(null);
            } finally {
                setBookingsLoading(false);
            }
        },
        [getCSRFHeaders],
    );

    const refetch = useCallback(() => {
        return fetchPlans(pagination?.currentPage || 1, planType);
    }, [fetchPlans, pagination?.currentPage, planType]);

    //  bookSchedule مع **Auto-fix ذكي** للـ planDetailsId
    const bookSchedule = useCallback(
        async (
            scheduleId: number,
            planId: number,
            planDetailsId: number,
        ): Promise<{
            success: boolean;
            message: string;
            booking?: Booking;
        }> => {
            try {
                console.log("📤 [bookSchedule] Starting:", {
                    scheduleId,
                    planId,
                    planDetailsId,
                });

                //  1. Refresh CSRF
                await refreshCSRFToken();
                await new Promise((resolve) => setTimeout(resolve, 100));

                //  2. **التحقق الذكي من planDetailsId + Auto-fix**
                let finalPlanDetailsId = planDetailsId;
                console.log(
                    "🔍 [VALIDATION] Checking plan details for planId:",
                    planId,
                );

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
                        console.log(
                            "🔍 [VALIDATION] Available details:",
                            planData.details?.data?.map((d: any) => d.id) ||
                                planData.details?.map((d: any) => d.id) ||
                                [],
                        );

                        const validDetails =
                            planData.details?.data || planData.details || [];

                        //  تحقق إذا كان الـ ID موجود
                        const detailExists = validDetails.find(
                            (d: any) => Number(d.id) === Number(planDetailsId),
                        );

                        if (!detailExists && validDetails.length > 0) {
                            //  Auto-fix: استخدم أول detail متاح
                            finalPlanDetailsId = Number(validDetails[0].id);
                            console.log(
                                "🔧 [AUTO-FIX] Changed planDetailsId from",
                                planDetailsId,
                                "→",
                                finalPlanDetailsId,
                                "(first available detail)",
                            );
                        } else if (detailExists) {
                            console.log(
                                " [VALIDATION] planDetailsId صحيح:",
                                planDetailsId,
                            );
                            finalPlanDetailsId = Number(planDetailsId);
                        }
                    } else {
                        console.warn(
                            "⚠️ [VALIDATION] Cannot fetch plan details, using provided ID:",
                            planDetailsId,
                        );
                    }
                } catch (validationError) {
                    console.warn(
                        "⚠️ [VALIDATION] Plan details check failed, using:",
                        planDetailsId,
                    );
                }

                //  3. الـ Booking الفعلي بالـ ID النهائي
                console.log(
                    "🚀 [FINAL] Booking with planDetailsId:",
                    finalPlanDetailsId,
                );

                const response = await fetch(
                    `/api/v1/student/plans/schedules/${scheduleId}/book`,
                    {
                        method: "POST",
                        headers: getCSRFHeaders(),
                        credentials: "include",
                        body: JSON.stringify({
                            plan_id: planId,
                            plan_details_id: finalPlanDetailsId, //  الـ ID المُصحح
                        }),
                    },
                );

                if (!response.ok) {
                    const errorData = await response
                        .json()
                        .catch(() => ({}) as any);
                    console.error(
                        "❌ [bookSchedule] HTTP",
                        response.status,
                        errorData,
                    );

                    if (response.status === 419) {
                        console.log("🔄 [419] Retrying...");
                        return bookSchedule(
                            scheduleId,
                            planId,
                            finalPlanDetailsId,
                        );
                    }

                    return {
                        success: false,
                        message: errorData.message || `خطأ ${response.status}`,
                    };
                }

                const result = await response.json();
                console.log(" [bookSchedule] SUCCESS:", result);

                if (result.success !== false) {
                    await Promise.all([refetch(), fetchBookings()]);
                }

                return {
                    success: true,
                    message: result.message || "تم الحجز بنجاح 🎉",
                    booking: result.data,
                };
            } catch (err: any) {
                console.error("❌ [bookSchedule] Error:", err);
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
                console.log("📤 [cancelBooking] Starting:", bookingId);
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
                    console.error(
                        "❌ [cancelBooking] HTTP",
                        response.status,
                        errorData,
                    );
                    return {
                        success: false,
                        message: errorData.message || `خطأ ${response.status}`,
                    };
                }

                const result = await response.json();
                console.log(" [cancelBooking] SUCCESS:", result);

                if (result.success !== false) {
                    await Promise.all([refetch(), fetchBookings()]);
                }

                return {
                    success: true,
                    message: result.message || "تم الإلغاء بنجاح ",
                };
            } catch (err: any) {
                console.error("❌ [cancelBooking] Error:", err);
                return {
                    success: false,
                    message:
                        err instanceof Error ? err.message : "خطأ في الإلغاء",
                };
            }
        },
        [getCSRFHeaders, refetch, fetchBookings, refreshCSRFToken],
    );

    useEffect(() => {
        fetchPlans(initialPage, initialType);
    }, [fetchPlans, initialPage, initialType]);

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
    };
};
