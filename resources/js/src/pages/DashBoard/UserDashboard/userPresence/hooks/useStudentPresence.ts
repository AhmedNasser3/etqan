// hooks/useStudentPresence.ts - مع created_at صحيح
import { useState, useEffect } from "react";

interface PresenceRecord {
    id: number;
    attendance_date: string; // ✅ من sa.created_at
    surah_name: string;
    new_memorization: string | null;
    review_memorization: string | null;
    status: "حاضر" | "غائب" | "لم يتم تسجيل";
    note: string | null;
    recorded_at: string; // ✅ وقت التسجيل الفعلي
}

interface PresenceStats {
    total: number;
    present: number;
    absent: number;
    attendance_rate: number;
}

interface PresenceData {
    success: boolean;
    presence_records: PresenceRecord[];
    stats: PresenceStats;
}

export const useStudentPresence = () => {
    const [data, setData] = useState<PresenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPresence = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log("📋 بداية جلب بيانات الحضور والغياب...");

                // ✅ 1. CSRF Cookie
                await fetch("/sanctum/csrf-cookie", {
                    method: "GET",
                    credentials: "include",
                });
                console.log("✅ CSRF Cookie جاهز");

                // ✅ 2. CSRF Token
                const metaToken = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content");
                const getCookie = (name: string): string | null => {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2)
                        return parts.pop()?.split(";").shift() || null;
                    return null;
                };
                const csrfToken =
                    metaToken ||
                    getCookie("XSRF-TOKEN") ||
                    getCookie("csrf-token");

                console.log("🔑 CSRF Token:", !!csrfToken);

                // ✅ 3. جلب بيانات الحضور
                const response = await fetch("/api/v1/user/presence", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
                    },
                });

                console.log("📡 Presence Response status:", response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("❌ Response body:", errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const result = await response.json();
                console.log("✅ Presence Result:", result);

                // ✅ Debug للتواريخ
                if (result.success && result.presence_records) {
                    result.presence_records.forEach(
                        (record: any, index: number) => {
                            console.log(`درس ${index + 1}:`, {
                                id: record.id,
                                attendance_date: record.attendance_date, // created_at
                                recorded_at: record.recorded_at, // وقت التسجيل
                                status: record.status,
                            });
                        },
                    );
                }

                if (result.success) {
                    setData(result);
                } else {
                    setError(result.message || "خطأ في جلب بيانات الحضور");
                }
            } catch (err: any) {
                console.error("❌ Presence fetch error:", err);
                setError(err.message || "حدث خطأ في جلب بيانات الحضور");
            } finally {
                setLoading(false);
            }
        };

        fetchPresence();
    }, []);

    return { data, loading, error };
};
