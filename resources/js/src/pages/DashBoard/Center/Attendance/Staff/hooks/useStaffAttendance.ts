// hooks/useStaffAttendance.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export interface StaffAttendance {
    id: number;
    teacher_id: number;
    teacher_name: string;
    role: string;
    center_name: string;
    status: "present" | "late" | "absent";
    notes: string;
    date: string;
    checkin_time: string;
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
    setSearch: (s: string) => void;
    setDateFilter: (f: "today" | "yesterday" | "week" | "month") => void;
    fetchAttendance: () => Promise<void>;
    markAttendance: (
        id: number,
        status: "present" | "late" | "absent",
        reason?: string,
        delayMinutes?: number,
    ) => Promise<boolean>;
}

// ── CSRF ──────────────────────────────────────────────────────────────────────
const getCsrfToken = (): string => {
    if (typeof document === "undefined") return "";
    return (
        document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN"))
            ?.split("=")[1] ?? ""
    );
};

const initializeCsrf = async (): Promise<void> => {
    try {
        await fetch("/sanctum/csrf-cookie", {
            credentials: "include",
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
        });
    } catch (e) {
        console.error("CSRF Error:", e);
    }
};

// ── Hook ──────────────────────────────────────────────────────────────────────
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

    // ── fetch ─────────────────────────────────────────────────────────────────
    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        setStaff([]);
        setError(null);

        try {
            if (!isInitialized) {
                await initializeCsrf();
                setIsInitialized(true);
            }

            const res = await fetch(
                `/api/v1/attendance/staff-list?date_filter=${dateFilter}`,
                {
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message ?? `HTTP ${res.status}`);
            }

            const ct = res.headers.get("content-type");
            if (!ct?.includes("application/json")) {
                throw new Error("الخادم لم يُرجع JSON");
            }

            const data = await res.json();

            const raw: any[] = Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                  ? data
                  : [];

            const safe: StaffAttendance[] = raw
                .filter((i) => i && typeof i === "object" && i.id > 0)
                .map((i) => ({
                    id: i.id,
                    teacher_id: i.teacher_id ?? 0,
                    teacher_name: i.teacher_name ?? i.name ?? "غير معروف",
                    role: i.role ?? "موظف",
                    center_name: i.center_name ?? i.circle_name ?? "-",
                    status: ["present", "late", "absent"].includes(i.status)
                        ? i.status
                        : "absent",
                    notes: i.notes ?? "-",
                    date: i.date ?? "",
                    checkin_time: i.checkin_time ?? "",
                    delay_minutes: i.delay_minutes ?? 0,
                }));

            setStaff(safe);
            setStats({
                total: data.stats?.total ?? safe.length,
                present: data.stats?.present ?? 0,
                late: data.stats?.late ?? 0,
                absent: data.stats?.absent ?? 0,
                monthlyAttendanceRate: data.stats?.monthly_rate ?? 0,
                avgDelay: data.stats?.avg_delay ?? 0,
            });
        } catch (err: any) {
            const msg = err.message ?? "فشل في تحميل الحضور";
            setError(msg);
            toast.error(msg);
            setStaff([]);
        } finally {
            setLoading(false);
        }
    }, [dateFilter, isInitialized]);

    // ── markAttendance ────────────────────────────────────────────────────────
    const markAttendance = useCallback(
        async (
            attendanceId: number,
            status: "present" | "late" | "absent",
            reason?: string,
            delayMinutes?: number,
        ): Promise<boolean> => {
            try {
                await initializeCsrf();
                const xsrf = getCsrfToken();

                // بناء الملاحظة مع السبب لو متأخر
                const notes =
                    status === "present"
                        ? "حضور يدوي"
                        : status === "late"
                          ? `تأخير يدوي${reason ? ` - السبب: ${reason}` : ""}`
                          : "غياب يدوي";

                const res = await fetch(
                    `/api/v1/attendance/staff/${attendanceId}/mark`,
                    {
                        method: "PUT",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            "X-XSRF-TOKEN": xsrf
                                ? decodeURIComponent(xsrf)
                                : "",
                        },
                        body: JSON.stringify({
                            status,
                            notes,
                            // ✅ بعّت delay_minutes لو متأخر
                            ...(status === "late" && delayMinutes
                                ? { delay_minutes: delayMinutes }
                                : {}),
                        }),
                    },
                );

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message ?? `HTTP ${res.status}`);
                }

                // Optimistic update
                setStaff((prev) =>
                    prev.map((item) =>
                        item.id === attendanceId
                            ? {
                                  ...item,
                                  status,
                                  notes,
                                  delay_minutes:
                                      status === "late"
                                          ? (delayMinutes ?? item.delay_minutes)
                                          : 0,
                              }
                            : item,
                    ),
                );

                return true;
            } catch (err: any) {
                toast.error(err.message ?? "فشل في التحديث");
                return false;
            }
        },
        [],
    );

    // ── فلترة محلية ───────────────────────────────────────────────────────────
    useEffect(() => {
        const q = search.toLowerCase();
        setFilteredStaff(
            !q
                ? staff
                : staff.filter(
                      (e) =>
                          e.teacher_name.toLowerCase().includes(q) ||
                          e.role.toLowerCase().includes(q) ||
                          e.center_name.toLowerCase().includes(q),
                  ),
        );
    }, [staff, search]);

    // ── initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        initializeCsrf().then(() => {
            setIsInitialized(true);
            fetchAttendance();
        });
    }, []);

    // ── date filter change ────────────────────────────────────────────────────
    useEffect(() => {
        if (isInitialized) fetchAttendance();
    }, [dateFilter]);

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
