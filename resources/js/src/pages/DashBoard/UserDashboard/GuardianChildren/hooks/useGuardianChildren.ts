// hooks/useGuardianChildren.ts -  مُصحح كامل مع البيانات الصحيحة

import { useState, useEffect, useCallback } from "react";

export interface RecentAttendance {
    date: string;
    status: string;
    note: string | null;
    rating: number | null;
    schedule_date?: string;
    schedule_time?: string;
}

export interface ChildPlan {
    id: number;
    plan_name: string;
    status: string;
    progress_status: string;
    current_day: number;
    completed_days: number;
    total_days: number;
    progress_rate: number;
    schedule_info: {
        date?: string | null;
        time?: string | null;
        teacher_name?: string | null;
    };
}

export interface RecentAchievement {
    points: number;
    reason: string | null;
    date: string;
    type?: string | null;
}

export interface ChildData {
    id: number;
    user: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        birth_date: string | null;
        gender: string | null;
        avatar: string | null;
    };
    student_info: {
        id_number: string;
        grade_level: string;
        circle: string;
        health_status: string;
        reading_level: string | null;
        session_time: string | null;
        notes: string | null;
    };
    stats: {
        bookings_count: number;
        active_bookings: number;
        achievements_count: number;
        total_points: number;
        present_days: number;
        absent_days: number;
        total_attendance: number;
        total_plan_details: number;
        completed_plan_details: number;
        pending_plan_details: number;
        attendance_rate: number;
        avg_rating: number | null;
        plan_completion_rate: number;
    };
    plans: ChildPlan[];
    recent_attendance: RecentAttendance[];
    recent_achievements: RecentAchievement[];
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    role_id: number;
}

export const useGuardianChildren = () => {
    const [children, setChildren] = useState<ChildData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [csrfToken, setCsrfToken] = useState<string>("");
    const [expandedChildId, setExpandedChildId] = useState<number | null>(null);

    //  جلب CSRF Token محسن
    const fetchCsrfToken = useCallback(async (): Promise<string> => {
        try {
            // جرب من الكوكيز أولاً
            const name = "XSRF-TOKEN=";
            const decodedCookie = decodeURIComponent(document.cookie || "");
            const ca = decodedCookie.split(";");

            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trimStart();
                if (c.indexOf(name) === 0) {
                    const token = c.substring(name.length);
                    setCsrfToken(token);
                    return token;
                }
            }

            // لو مفيش كوكيز، جيب من الـ API
            const response = await fetch("/sanctum/csrf-cookie", {
                credentials: "include",
                method: "GET",
            });

            if (response.ok) {
                await new Promise((r) => setTimeout(r, 100));
                return await fetchCsrfToken(); // Retry
            }
            return "";
        } catch {
            return "";
        }
    }, []);

    //  API Request محسن مع Error Handling كامل
    const apiRequest = useCallback(
        async (
            url: string,
            options: RequestInit = {},
        ): Promise<ApiResponse<any>> => {
            const token = await fetchCsrfToken();

            const config: RequestInit = {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    ...(token && { "X-XSRF-TOKEN": token }),
                    ...options.headers,
                },
                ...options,
            };

            const response = await fetch(`/api${url}`, config);

            if (!response.ok) {
                if (response.status === 401) throw new Error("غير مسجل دخول");
                if (response.status === 419)
                    throw new Error("انتهت صلاحية الجلسة");

                try {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || `خطأ ${response.status}`,
                    );
                } catch {
                    throw new Error(`خطأ ${response.status}`);
                }
            }

            return response.json();
        },
        [fetchCsrfToken],
    );

    //  جلب بيانات الأبناء مع التحقق من البنية الصحيحة
    const fetchChildren = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = (await apiRequest("/v1/guardian/children", {
                method: "GET",
            })) as ApiResponse<ChildData[]>;

            if (response.success && Array.isArray(response.data)) {
                //  التأكد من البيانات قبل حفظها
                const validChildren = response.data.filter(
                    (child) =>
                        child.user && child.stats && Array.isArray(child.plans),
                );
                setChildren(validChildren);

                if (validChildren.length === 0 && response.data.length > 0) {
                    setError("خطأ في تنسيق البيانات");
                }
            } else {
                setError(response.message || "فشل في جلب البيانات");
            }
        } catch (err: any) {
            setError(err.message || "حدث خطأ في جلب البيانات");
            console.error("Fetch children error:", err);
        } finally {
            setLoading(false);
        }
    }, [apiRequest]);

    //  جلب بيانات المستخدم
    const fetchCurrentUser = useCallback(async () => {
        try {
            const response = await apiRequest("/user", { method: "GET" });
            if (response.data) {
                setUser(response.data);
            }
        } catch (err) {
            console.warn("Failed to fetch user:", err);
        }
    }, [apiRequest]);

    //  تحميل البيانات عند بداية الصفحة
    useEffect(() => {
        fetchCsrfToken();
        fetchCurrentUser();
        fetchChildren();
    }, []);

    //  تبديل تفاصيل الطفل محسن
    const toggleChildDetails = useCallback(
        (childId: number) => {
            if (expandedChildId === childId) {
                setExpandedChildId(null);
            } else {
                setExpandedChildId(childId);
            }
        },
        [expandedChildId],
    );

    //  إعادة تحميل البيانات
    const refreshData = useCallback(() => {
        fetchChildren();
    }, [fetchChildren]);

    return {
        // البيانات الأساسية
        children,
        childrenCount: children.length,
        loading,
        error,
        user,
        expandedChildId,

        // الدوال
        fetchChildren,
        toggleChildDetails,
        refreshData,
        hasChildren: children.length > 0,
    };
};
