// hooks/useStudentAchievements.ts
import { useState, useCallback, useEffect } from "react";
import axios from "axios";

export interface StudentRow {
    id: number;
    name: string;
    email: string;
    phone?: string;
    total_points: number;
    added_points: number;
    deducted_points: number;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export const useStudentAchievements = () => {
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");

    const fetchStudents = useCallback(async (page = 1, q = "") => {
        setLoading(true);
        try {
            const res = await axios.get("/api/achievements", {
                params: { page, per_page: 20, search: q },
            });
            setStudents(res.data.data);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                per_page: res.data.per_page,
                total: res.data.total,
            });
            setCurrentPage(res.data.current_page);
        } catch {
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents(1, search);
    }, [search]);

    const goToPage = (page: number) => {
        if (page < 1 || (pagination && page > pagination.last_page)) return;
        fetchStudents(page, search);
    };

    // إضافة/خصم لطالب واحد
    const addPoints = async (payload: {
        user_id: number;
        points: number;
        points_action: "added" | "deducted";
        reason: string;
    }) => {
        const res = await axios.post("/api/achievements", payload);
        // تحديث النقاط محلياً
        setStudents((prev) =>
            prev.map((s) =>
                s.id === payload.user_id
                    ? { ...s, total_points: res.data.total_points }
                    : s,
            ),
        );
        return res.data;
    };

    // إضافة/خصم لعدة طلاب
    const addPointsBulk = async (payload: {
        user_ids: number[];
        points: number;
        points_action: "added" | "deducted";
        reason: string;
    }) => {
        const res = await axios.post("/api/achievements/bulk", payload);
        // refetch عشان نحدّث النقاط الجديدة للكل
        fetchStudents(currentPage, search);
        return res.data;
    };

    const refetch = () => fetchStudents(currentPage, search);

    return {
        students,
        loading,
        pagination,
        currentPage,
        search,
        setSearch,
        goToPage,
        refetch,
        addPoints,
        addPointsBulk,
    };
};
