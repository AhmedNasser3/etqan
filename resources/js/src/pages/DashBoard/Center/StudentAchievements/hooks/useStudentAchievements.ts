// hooks/useStudentAchievements.ts
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

export const useStudentAchievements = () => {
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
                    `/api/v1/achievements?${params.toString()}`,
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
                console.log("✅ Achievements loaded:", data);

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

    const deleteAchievement = useCallback(
        async (id: number) => {
            try {
                const csrfToken =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") || "";

                const response = await fetch(`/api/v1/achievements/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                });

                if (response.ok) {
                    toast.success("تم حذف الإنجاز بنجاح ✅");
                    refetch();
                    return true;
                } else {
                    const result = await response.json();
                    toast.error(result.message || "فشل في الحذف");
                    return false;
                }
            } catch {
                toast.error("حدث خطأ في الحذف");
                return false;
            }
        },
        [refetch],
    );

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
        deleteAchievement,
    };
};
