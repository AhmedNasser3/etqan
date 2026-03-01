// hooks/useStaffAttendance.ts - نهائي  CSRF Token مُصحح
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export interface StaffAttendance {
    id: number;
    teacher_id: number;
    teacher_name: string;
    role: string;
    circle_name?: string;
    status: "present" | "late" | "absent";
    notes: string;
    date: string;
    delay_minutes: number;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    absent: number;
    monthlyAttendanceRate: number;
    avgDelay: number;
}

interface UseStaffAttendanceReturn {
    staff: StaffAttendance[];
    stats: Stats;
    loading: boolean;
    search: string;
    dateFilter: "today" | "yesterday" | "week" | "month";
    error: string | null;
    isEmpty: boolean;
    setSearch: (search: string) => void;
    setDateFilter: (filter: "today" | "yesterday" | "week" | "month") => void;
    fetchAttendance: () => Promise<void>;
    markAttendance: (
        id: number,
        status: "present" | "late" | "absent",
    ) => Promise<boolean>;
}

//  CSRF Token Helper
const getCsrfToken = (): string => {
    if (typeof document === "undefined") return "";

    return (
        document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN"))
            ?.split("=")[1] || ""
    );
};

const initializeCsrf = async (): Promise<void> => {
    console.log("🔐 Initializing CSRF...");
    try {
        const response = await fetch("/sanctum/csrf-cookie", {
            credentials: "include",
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
        });
        console.log(" CSRF Status:", response.status);
    } catch (error) {
        console.error("❌ CSRF Error:", error);
    }
};

export const useStaffAttendance = (): UseStaffAttendanceReturn => {
    const [staff, setStaff] = useState<StaffAttendance[]>([]);
    const [filteredStaff, setFilteredStaff] = useState<StaffAttendance[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        monthlyAttendanceRate: 0,
        avgDelay: 0,
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState<
        "today" | "yesterday" | "week" | "month"
    >("today");
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initializeAuth = useCallback(async () => {
        if (!isInitialized) {
            await initializeCsrf();
            setIsInitialized(true);
            console.log(" Auth initialized");
        }
    }, [isInitialized]);

    const fetchAttendance = useCallback(async () => {
        console.log("📊 Fetching:", dateFilter);
        setLoading(true);
        setStaff([]);
        setError(null);

        try {
            if (!isInitialized) await initializeCsrf();

            const response = await fetch(
                `/api/v1/attendance/staff-list?date_filter=${dateFilter}`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            console.log("🌐 Status:", response.status);

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({}) as any);
                const errorMsg = errorData.message || `HTTP ${response.status}`;
                throw new Error(errorMsg);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType?.includes("application/json")) {
                throw new Error("Server returned HTML");
            }

            const data = await response.json();
            console.log(" Data:", data);

            const attendanceData: StaffAttendance[] = Array.isArray(data)
                ? data
                : data?.data || [];

            const safeStaff = attendanceData.filter(
                (item): item is StaffAttendance => {
                    return (
                        item &&
                        typeof item === "object" &&
                        "id" in item &&
                        typeof (item as any).id === "number" &&
                        (item as any).id > 0 &&
                        ["present", "late", "absent"].includes(
                            (item as any).status || "",
                        )
                    );
                },
            );

            setStaff(safeStaff);

            setStats({
                total: data.stats?.total ?? safeStaff.length ?? 0,
                present: data.stats?.present ?? 0,
                late: data.stats?.late ?? 0,
                absent: data.stats?.absent ?? 0,
                monthlyAttendanceRate: data.stats?.monthly_rate ?? 0,
                avgDelay: data.stats?.avg_delay ?? data.stats?.avgDelay ?? 0,
            });

            console.log(" Loaded:", safeStaff.length, "records");
        } catch (err: any) {
            console.error("❌ Error:", err);
            const msg = err.message || "فشل في تحميل الحضور";
            setError(msg);
            toast.error(msg);

            setStaff([]);
            setStats({
                total: 0,
                present: 0,
                late: 0,
                absent: 0,
                monthlyAttendanceRate: 0,
                avgDelay: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [dateFilter, isInitialized]);

    // 🔥 MARK ATTENDANCE - CSRF مُصحح 100%
    const markAttendance = useCallback(
        async (
            attendanceId: number,
            status: "present" | "late" | "absent",
        ): Promise<boolean> => {
            try {
                console.log("✏️ Marking:", attendanceId, status);

                //  1. Refresh CSRF token قبل PUT
                await initializeCsrf();

                //  2. خد XSRF-TOKEN من cookies و decode
                const xsrfToken = getCsrfToken();
                console.log("🔑 CSRF Token:", xsrfToken ? "Found" : "Missing");

                const response = await fetch(
                    `/api/v1/attendance/staff/${attendanceId}/mark`,
                    {
                        method: "PUT",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            // 🔥 X-XSRF-TOKEN header - الحل الأساسي للـ CSRF
                            "X-XSRF-TOKEN": xsrfToken
                                ? decodeURIComponent(xsrfToken)
                                : "",
                        },
                        body: JSON.stringify({
                            status,
                            notes:
                                status === "present"
                                    ? "حضور يدوي"
                                    : "غياب يدوي",
                        }),
                    },
                );

                console.log("🌐 Mark Status:", response.status);

                if (!response.ok) {
                    const errorData = await response
                        .json()
                        .catch(() => ({}) as any);
                    console.error("❌ Server Error:", errorData);
                    throw new Error(
                        errorData.message || `HTTP ${response.status}`,
                    );
                }

                // Optimistic update
                setStaff((prev) =>
                    prev.map((item) =>
                        item.id === attendanceId
                            ? {
                                  ...item,
                                  status,
                                  notes:
                                      status === "present"
                                          ? "حضور يدوي"
                                          : "غياب يدوي",
                              }
                            : item,
                    ),
                );

                toast.success("تم تحديث الحضور بنجاح ");
                return true;
            } catch (err: any) {
                console.error("❌ Mark Error:", err);
                toast.error(err.message || "فشل في التحديث");
                return false;
            }
        },
        [],
    );

    // Filter staff
    useEffect(() => {
        const filtered = staff.filter(
            (employee) =>
                employee.teacher_name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                employee.role.toLowerCase().includes(search.toLowerCase()) ||
                employee.circle_name
                    ?.toLowerCase()
                    .includes(search.toLowerCase()),
        );
        setFilteredStaff(filtered);
        console.log("📋 Filtered:", filtered.length);
    }, [staff, search]);

    // Initial load
    useEffect(() => {
        initializeAuth().then(fetchAttendance);
    }, []);

    // Date filter change
    useEffect(() => {
        if (isInitialized) {
            fetchAttendance();
        }
    }, [dateFilter, isInitialized, fetchAttendance]);

    const isEmpty = useMemo(
        () => staff.length === 0 && !loading,
        [staff.length, loading],
    );

    return {
        staff: filteredStaff,
        stats,
        loading,
        search,
        dateFilter,
        error,
        isEmpty,
        setSearch,
        setDateFilter,
        fetchAttendance,
        markAttendance,
    };
};
