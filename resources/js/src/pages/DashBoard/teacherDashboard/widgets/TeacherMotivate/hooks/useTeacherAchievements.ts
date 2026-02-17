// hooks/useTeacherAchievements.ts
import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

export interface AchievementType {
    id: number;
    points: number;
    points_action: string;
    total_points: number;
    achievements: Record<string, any>;
    reason: string;
    achievement_type: string;
    created_at_formatted: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        center_id: number;
    };
}

interface Pagination {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export const useTeacherAchievements = () => {
    const [achievements, setAchievements] = useState<AchievementType[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const searchTimeoutRef = useRef<number | null>(null);

    const fetchAchievements = useCallback(
        async (pageNum: number = 1, search: string = "") => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: pageNum.toString(),
                });
                if (search.trim()) {
                    params.append("search", search.trim());
                }

                const response = await fetch(
                    `/api/v1/teacher/achievements?${params.toString()}`,
                    {
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    toast.error(errorData.message || "حدث خطأ");
                    setAchievements([]);
                    setPagination(null);
                    return;
                }

                const data = await response.json();
                console.log("✅ Teacher Achievements loaded:", data);

                setAchievements(Array.isArray(data.data) ? data.data : []);
                setPagination({
                    current_page: data.current_page || 1,
                    last_page: data.last_page || 1,
                    total: data.total || 0,
                    per_page: data.per_page || 15,
                });
                setCurrentPage(data.current_page || 1);
            } catch (error) {
                console.error("❌ Error:", error);
                toast.error("فشل في الاتصال");
                setAchievements([]);
                setPagination(null);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const searchAchievements = useCallback(
        (term: string) => {
            if (searchTimeoutRef.current !== null) {
                window.clearTimeout(searchTimeoutRef.current);
            }

            searchTimeoutRef.current = window.setTimeout(() => {
                setSearchTerm(term);
                setCurrentPage(1);
                fetchAchievements(1, term);
            }, 500);
        },
        [fetchAchievements],
    );

    const goToPage = useCallback(
        (pageNum: number) => {
            setCurrentPage(pageNum);
            fetchAchievements(pageNum, searchTerm);
        },
        [fetchAchievements, searchTerm],
    );

    const refetch = useCallback(() => {
        fetchAchievements(currentPage, searchTerm);
    }, [fetchAchievements, currentPage, searchTerm]);

    const createAchievement = useCallback(
        async (achievementData: {
            user_id: number;
            points: number;
            points_action: "added" | "deducted";
            reason: string;
            achievements?: Record<string, any>;
            achievement_type?: string;
        }) => {
            try {
                const csrfToken =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") || "";

                const response = await fetch(`/api/v1/teacher/achievements`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify(achievementData),
                });

                if (response.ok) {
                    const result = await response.json();
                    toast.success("تم إضافة الإنجاز بنجاح ✅");
                    refetch();
                    return result.data;
                } else {
                    const result = await response.json();
                    toast.error(result.message || "فشل في إضافة الإنجاز");
                    return null;
                }
            } catch {
                toast.error("حدث خطأ في إضافة الإنجاز");
                return null;
            }
        },
        [refetch],
    );

    const fetchTeacherStudents = useCallback(async () => {
        try {
            const response = await fetch(`/api/v1/teacher/students`, {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            if (!response.ok) {
                throw new Error("فشل في جلب الطلاب");
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error("❌ Error fetching students:", error);
            toast.error("فشل في جلب الطلاب");
            return [];
        }
    }, []);

    const fetchStudentPoints = useCallback(async (studentId: number) => {
        try {
            const response = await fetch(
                `/api/v1/teacher/students/${studentId}/points`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            if (!response.ok) {
                throw new Error("فشل في جلب نقاط الطالب");
            }

            return await response.json();
        } catch (error) {
            console.error("❌ Error fetching student points:", error);
            return null;
        }
    }, []);

    useEffect(() => {
        fetchAchievements(1, "");
    }, [fetchAchievements]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current !== null) {
                window.clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return {
        achievements,
        loading,
        pagination,
        currentPage,
        searchAchievements,
        goToPage,
        refetch,
        createAchievement,
        fetchTeacherStudents,
        fetchStudentPoints,
    };
};
