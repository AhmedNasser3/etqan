// hooks/useReportsApi.ts
import { useState, useCallback, useEffect } from "react";
import axios from "axios";

interface ApiReport {
    title: string;
    type: string;
    period: string;
    issue_date: string;
    status: string;
    size: string;
    preview: string;
    center_id?: number;
}

export const useReportsApi = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initCsrf = useCallback(async () => {
        try {
            await axios.get("/sanctum/csrf-cookie");
            const token = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");
            if (token) {
                axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
                axios.defaults.headers.common["X-Requested-With"] =
                    "XMLHttpRequest";
                axios.defaults.withCredentials = true;
            }
        } catch (err) {
            console.error("❌ CSRF init failed:", err);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await initCsrf();
            const response = await axios.get("/api/v1/reports");
            const apiData = response.data.data || {};
            const formattedReports: any[] = [];

            // الحضور
            if (apiData.attendance_reports?.length) {
                apiData.attendance_reports.forEach(
                    (r: ApiReport, index: number) => {
                        formattedReports.push({
                            id: index + 1,
                            title: r.title,
                            type: r.type,
                            date: r.issue_date,
                            period: r.period,
                            status: r.status,
                            fileSize: r.size,
                            previewData: r.preview,
                            img: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop&crop=face`,
                            category: "attendance",
                        });
                    },
                );
            }

            // الرواتب
            if (apiData.payroll_reports?.length) {
                apiData.payroll_reports.forEach(
                    (r: ApiReport, index: number) => {
                        formattedReports.push({
                            id: formattedReports.length + 1,
                            title: r.title,
                            type: r.type,
                            date: r.issue_date,
                            period: r.period,
                            status: r.status,
                            fileSize: r.size,
                            previewData: r.preview,
                            img: `https://images.unsplash.com/photo-1516589178581-6cd7838b8f13?w=150&h=150&fit=crop&crop=face`,
                            category: "payroll",
                        });
                    },
                );
            }

            // الإنجازات
            if (apiData.achievement_reports?.length) {
                apiData.achievement_reports.forEach(
                    (r: ApiReport, index: number) => {
                        formattedReports.push({
                            id: formattedReports.length + 1,
                            title: r.title,
                            type: r.type,
                            date: r.issue_date,
                            period: r.period,
                            status: r.status,
                            fileSize: r.size,
                            previewData: r.preview,
                            img: `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face`,
                            category: "achievements",
                        });
                    },
                );
            }

            setReports(formattedReports);
        } catch (err: any) {
            console.error("❌ Reports error:", err);
            setError(err.response?.data?.message || "فشل تحميل التقارير");
        } finally {
            setLoading(false);
        }
    }, [initCsrf]);

    return { reports, loading, error, fetchReports };
};
