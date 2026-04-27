import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

interface CircleType {
    id: number;
    name: string;
    center: { id: number; name: string };
    center_id: number;
    mosque?: { id: number; name: string } | null;
    mosque_id?: number | null;
    teacher?: { id: number; name: string } | null;
    teacher_id?: number | null;
    created_at: string;
    updated_at: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number | null;
    to: number | null;
}

function getPortalCenterId(): number | null {
    const id = (window as any).__PORTAL_CENTER_ID__;
    return id ? Number(id) : null;
}

function getPortalMosqueId(): number | null {
    const id = (window as any).__PORTAL_MOSQUE_ID__;
    return id ? Number(id) : null;
}

function buildHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    };
    const centerId = getPortalCenterId();
    if (centerId) headers["X-Center-Id"] = String(centerId);
    return headers;
}

export const useCircles = () => {
    const [circles, setCircles] = useState<CircleType[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchCircles = useCallback(async (pageNum = 1, search = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: pageNum.toString() });
            if (search.trim()) params.append("search", search.trim());

            // لو portal نضيف mosque_id للفلترة
            const mosqueId = getPortalMosqueId();
            if (mosqueId) params.append("mosque_id", String(mosqueId));

            const response = await fetch(`/api/v1/centers/circles?${params}`, {
                credentials: "include",
                headers: buildHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || "حدث خطأ");
                return;
            }

            const data = await response.json();

            setCircles(data.data || []);
            setPagination({
                current_page: data.current_page || 1,
                last_page: data.last_page || 1,
                total: data.total || 0,
                per_page: data.per_page || 15,
                from: data.from || null,
                to: data.to || null,
            });
        } catch {
            toast.error("فشل في الاتصال");
        } finally {
            setLoading(false);
        }
    }, []);

    const searchCircles = useCallback(
        (term: string) => {
            if (searchTimeoutRef.current)
                clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(() => {
                setSearchTerm(term);
                setCurrentPage(1);
                fetchCircles(1, term);
            }, 500);
        },
        [fetchCircles],
    );

    const goToPage = useCallback(
        (pageNum: number) => {
            setCurrentPage(pageNum);
            fetchCircles(pageNum, searchTerm);
        },
        [fetchCircles, searchTerm],
    );

    const refetch = useCallback(() => {
        fetchCircles(currentPage, searchTerm);
    }, [fetchCircles, currentPage, searchTerm]);

    useEffect(() => {
        fetchCircles(1, "");
    }, [fetchCircles]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current)
                clearTimeout(searchTimeoutRef.current);
        };
    }, []);

    return {
        circles,
        loading,
        pagination,
        currentPage,
        searchCircles,
        goToPage,
        refetch,
    };
};
