import { useState, useCallback, useEffect } from "react";

export interface StudentBookingType {
    id: number;
    student_name: string;
    student_phone: string;
    student_email: string;
    plan_name: string;
    plan_months: number;
    center_name: string;
    day_number: string;
    circle_name: string;
    teacher_name: string;
    schedule_date: string;
    time_range: string;
    duration_minutes: number;
    booked_at: string;
    capacity_status: string;
    can_confirm: boolean;
    remaining_slots: number | null;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface UseStudentBookingsReturn {
    bookings: StudentBookingType[];
    loading: boolean;
    pagination: Pagination | null;
    currentPage: number;
    searchBookings: (search: string) => void;
    goToPage: (page: number) => void;
    confirmBooking: (
        bookingId: number,
    ) => Promise<{ success: boolean; message: string }>;
    refetch: () => void;
}

export const useStudentBookings = (): UseStudentBookingsReturn => {
    const [bookings, setBookings] = useState<StudentBookingType[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState("");

    const getCSRFHeaders = useCallback((): Record<string, string> => {
        const token =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": token,
        };
    }, []);

    const fetchBookings = useCallback(
        async (page: number = 1, search: string = ""): Promise<void> => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    ...(search && { search }),
                });

                // ✅ الـ URL الجديد مع v1/plans
                const response = await fetch(
                    `/api/v1/plans/student-bookings?${params.toString() || ""}`,
                    {
                        method: "GET",
                        credentials: "include", // ✅ مهم للـ session cookies مع web middleware
                        headers: getCSRFHeaders(),
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || `HTTP ${response.status}`,
                    );
                }

                const data = await response.json();

                // ✅ Type assertion للتأكد من البيانات
                const typedBookings: StudentBookingType[] = data.data || [];
                setBookings(typedBookings);

                setPagination({
                    current_page: data.current_page || 1,
                    last_page: data.last_page || 1,
                    per_page: data.per_page || 15,
                    total: data.total || 0,
                });

                setCurrentPage(data.current_page || 1);
            } catch (error) {
                console.error("Error fetching student bookings:", error);
                setBookings([]);
                setPagination(null);
            } finally {
                setLoading(false);
            }
        },
        [getCSRFHeaders],
    );

    const searchBookings = useCallback(
        (search: string): void => {
            setSearchValue(search);
            fetchBookings(1, search);
        },
        [fetchBookings],
    );

    const goToPage = useCallback(
        (page: number): void => {
            fetchBookings(page, searchValue);
        },
        [fetchBookings, searchValue],
    );

    const confirmBooking = useCallback(
        async (
            bookingId: number,
        ): Promise<{ success: boolean; message: string }> => {
            try {
                // ✅ الـ URL الجديد مع v1/plans
                const response = await fetch(
                    `/api/v1/plans/student-bookings/${bookingId}/confirm`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: getCSRFHeaders(),
                    },
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "فشل في قبول الطالب");
                }

                return result;
            } catch (error: any) {
                console.error("Error confirming booking:", error);
                throw new Error(error.message || "حدث خطأ في قبول الطالب");
            }
        },
        [getCSRFHeaders],
    );

    const refetch = useCallback((): void => {
        fetchBookings(currentPage, searchValue);
    }, [fetchBookings, currentPage, searchValue]);

    // ✅ تحميل البيانات عند بداية الـ component
    useEffect(() => {
        fetchBookings(1, "");
    }, []);

    return {
        bookings,
        loading,
        pagination,
        currentPage,
        searchBookings,
        goToPage,
        confirmBooking,
        refetch,
    };
};
