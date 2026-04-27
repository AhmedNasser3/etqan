import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface Certificate {
    id: number;
    center_id: number;
    user_id: number;
    certificate_image: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
    };
    student: {
        id_number: string;
        grade_level: string;
        circle: string;
    } | null;
}

interface Student {
    id: number;
    user_id: number;
    id_number: string;
    grade_level: string;
    circle: string;
    user_name: string;
}

interface Pagination {
    total: number;
    last_page: number;
    current_page: number;
}

export const useCertificates = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const getCsrfToken = useCallback((): string => {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || ""
        );
    }, []);

    const fetchCertificates = useCallback(
        async (page: number = 1) => {
            setLoading(true);
            try {
                const csrfToken = getCsrfToken();
                const response = await fetch(`/api/certificates?page=${page}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                });

                const result = await response.json();
                if (result.success) {
                    setCertificates(result.certificates);
                    setStudents(result.students);
                    setPagination({
                        total:
                            result.pagination?.total ||
                            result.certificates.length,
                        last_page: result.pagination?.last_page || 1,
                        current_page: result.pagination?.current_page || 1,
                    });
                    setCurrentPage(page);
                }
            } catch (error) {
                toast.error("حدث خطأ في جلب الشهادات");
            } finally {
                setLoading(false);
            }
        },
        [getCsrfToken],
    );

    const refetch = useCallback(() => {
        fetchCertificates(currentPage);
    }, [fetchCertificates, currentPage]);

    const goToPage = useCallback(
        (page: number) => {
            fetchCertificates(page);
        },
        [fetchCertificates],
    );

    useEffect(() => {
        fetchCertificates();
    }, []);

    return {
        certificates,
        students,
        loading,
        pagination,
        currentPage,
        refetch,
        goToPage,
    };
};
