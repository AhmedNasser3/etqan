import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

export interface MeetingType {
    id: number;
    teacher: { id: number; name: string };
    student: { id: number; name: string };
    center: { id: number; name: string };
    meeting_code: string;
    jitsi_meeting_url: string;
    meeting_date: string;
    meeting_start_time: string;
    meeting_end_time?: string;
    teacher_joined: boolean;
    student_joined: boolean;
    notes?: string;
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

export const useMeetings = () => {
    const [meetings, setMeetings] = useState<MeetingType[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // ✅ الحل النهائي - TypeScript 100% صحيح
    const searchTimeoutRef = useRef<number | null>(null);

    // ✅ Helper to get CSRF token
    const getCsrfToken = useCallback((): string => {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || ""
        );
    }, []);

    const fetchMeetings = useCallback(
        async (
            pageNum: number = 1,
            search: string = "",
            teacherId?: number,
            studentId?: number,
            centerId?: number,
        ) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: pageNum.toString(),
                });
                if (search.trim()) params.append("search", search.trim());
                if (teacherId)
                    params.append("teacher_id", teacherId.toString());
                if (studentId)
                    params.append("student_id", studentId.toString());
                if (centerId) params.append("center_id", centerId.toString());

                const response = await fetch(
                    `/api/v1/meetings?${params.toString()}`,
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
                    setMeetings([]);
                    setPagination(null);
                    return;
                }

                const data = await response.json();
                console.log("✅ Meetings loaded:", data);

                setMeetings(Array.isArray(data.data) ? data.data : []);
                setPagination({
                    current_page: data.current_page || 1,
                    last_page: data.last_page || 1,
                    total: data.total || 0,
                    per_page: data.per_page || 15,
                    from: data.from || null,
                    to: data.to || null,
                });
                setCurrentPage(data.current_page || 1);
            } catch (error) {
                console.error("❌ Error:", error);
                toast.error("فشل في الاتصال");
                setMeetings([]);
                setPagination(null);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const createMeeting = useCallback(
        async (meetingData: Partial<MeetingType>) => {
            setLoading(true);
            try {
                const response = await fetch("/api/v1/meetings", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": getCsrfToken(),
                    },
                    body: JSON.stringify(meetingData),
                });

                const result = await response.json();
                if (response.ok) {
                    toast.success("تم إنشاء الميتينج بنجاح! ✅");
                    return result;
                } else {
                    toast.error(result.message || "فشل في إنشاء الميتينج");
                    return null;
                }
            } catch (error) {
                console.error("Create meeting error:", error);
                toast.error("حدث خطأ في الإنشاء");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [getCsrfToken],
    );

    const updateJoinStatus = useCallback(
        async (
            id: number,
            status: { teacher_joined?: boolean; student_joined?: boolean },
        ) => {
            try {
                const response = await fetch(`/api/v1/meetings/${id}/join`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": getCsrfToken(),
                    },
                    body: JSON.stringify(status),
                });

                const result = await response.json();
                if (!response.ok) {
                    toast.error(result.message || "فشل في التحديث");
                    return false;
                }
                toast.success("تم تحديث الحالة بنجاح");
                return true;
            } catch (error) {
                console.error("Update status error:", error);
                toast.error("حدث خطأ في التحديث");
                return false;
            }
        },
        [getCsrfToken],
    );

    const deleteMeeting = useCallback(
        async (id: number) => {
            try {
                const response = await fetch(`/api/v1/meetings/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": getCsrfToken(),
                    },
                });

                const result = await response.json();
                if (response.ok) {
                    toast.success("تم حذف الميتينج بنجاح! ✅");
                    return true;
                } else {
                    toast.error(result.message || "فشل في الحذف");
                    return false;
                }
            } catch (error) {
                console.error("Delete meeting error:", error);
                toast.error("حدث خطأ في الحذف");
                return false;
            }
        },
        [getCsrfToken],
    );

    const generateMeetingCode = useCallback(
        (teacherId: number, studentId: number): string => {
            const random = Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();
            return `halaqa-teacher-${teacherId}-student-${studentId}-${random}`;
        },
        [],
    );

    const searchMeetings = useCallback(
        (term: string) => {
            // ✅ Clear previous timeout
            if (searchTimeoutRef.current !== null) {
                clearTimeout(searchTimeoutRef.current);
            }

            // ✅ Set new timeout - number type
            searchTimeoutRef.current = window.setTimeout(() => {
                setSearchTerm(term);
                setCurrentPage(1);
                fetchMeetings(1, term);
            }, 500);
        },
        [fetchMeetings],
    );

    const goToPage = useCallback(
        (pageNum: number) => {
            setCurrentPage(pageNum);
            fetchMeetings(pageNum, searchTerm);
        },
        [fetchMeetings, searchTerm],
    );

    const refetch = useCallback(() => {
        fetchMeetings(currentPage, searchTerm);
    }, [fetchMeetings, currentPage, searchTerm]);

    // ✅ Initial load - بس مرة واحدة
    useEffect(() => {
        fetchMeetings(1, "");
    }, [fetchMeetings]);

    // ✅ Cleanup timeout
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current !== null) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return {
        meetings,
        loading,
        pagination,
        currentPage,
        searchMeetings,
        goToPage,
        refetch,
        createMeeting,
        updateJoinStatus,
        deleteMeeting,
        generateMeetingCode,
    };
};
