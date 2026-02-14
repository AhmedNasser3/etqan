// hooks/useStudentProgress.ts
import { useState, useEffect } from "react";

interface LessonNote {
    id: number;
    attendance_date: string;
    note: string;
    rating: number;
    surah_name: string;
    new_memorization: string | null;
    review_memorization: string | null;
}

interface ProgressData {
    success: boolean;
    overall_progress: number;
    lessons: LessonNote[];
}

export const useStudentProgress = () => {
    const [data, setData] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log("🚀 بداية جلب بيانات التقدم...");

                // ✅ 1. جيب CSRF Cookie الأول
                console.log("🔐 جاري جلب CSRF Cookie...");
                await fetch("/sanctum/csrf-cookie", {
                    method: "GET",
                    credentials: "include",
                });
                console.log("✅ CSRF Cookie جاهز");

                // ✅ 2. جيب الـ CSRF Token من meta tag أو cookie
                const metaToken = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content");
                const csrfToken =
                    metaToken ||
                    getCookie("XSRF-TOKEN") ||
                    getCookie("csrf-token");

                console.log("🔑 CSRF Token:", !!csrfToken);

                // ✅ 3. جيب الـ session/user data
                const sessionResponse = await fetch("/api/user", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
                    },
                });

                const sessionData = await sessionResponse.json();
                const userId = sessionData.id || sessionData.user?.id;

                console.log("👤 User ID من الـ session:", userId);

                if (!userId) {
                    throw new Error("غير مسجل دخول");
                }

                // ✅ 4. جيب بيانات التقدم
                console.log("📊 جاري جلب بيانات التقدم...");
                const response = await fetch("/api/v1/user/progress", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
                    },
                });

                console.log("📡 Response status:", response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("❌ Response body:", errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const result = await response.json();
                console.log("✅ Result:", result);

                if (result.success) {
                    setData(result);
                } else {
                    setError(result.message || "خطأ في جلب البيانات");
                }
            } catch (err: any) {
                console.error("❌ Progress fetch error:", err);
                setError(err.message || "حدث خطأ في جلب بيانات التقدم");
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    // ✅ Helper function لجلب الـ cookies
    const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(";").shift() || null;
        }
        return null;
    };

    return { data, loading, error };
};
