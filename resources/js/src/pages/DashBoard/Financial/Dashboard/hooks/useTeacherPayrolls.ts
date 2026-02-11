import { useState, useEffect, useCallback, useMemo } from "react";

export interface PayrollItem {
    id: number;
    teacher_id?: number;
    user_id?: number;
    teacher: {
        id: number;
        name: string;
        role: string;
        img?: string;
    };
    user: {
        id: number;
        name: string;
        status?: string;
    };
    base_salary: string;
    attendance_days: number;
    deductions: string;
    total_due: string;
    status: "pending" | "paid";
    month_year: string;
    created_at?: string;
    period_start?: string;
}

export interface PayrollStats {
    total_payroll?: number;
    total_pending?: number;
    total_paid?: number;
    pending_count?: number;
    paid_count?: number;
    current_month?: string;
}

export interface UseTeacherPayrollsReturn {
    payrolls: PayrollItem[];
    rawPayrolls: PayrollItem[];
    stats: PayrollStats | null;
    loading: boolean;
    search: string;
    setSearch: (value: string) => void;
    filterStatus: "all" | "pending" | "pending_old" | "paid";
    setFilterStatus: (
        value: "all" | "pending" | "pending_old" | "paid",
    ) => void;
    refetch: () => void;
    markPaid: (id: number) => Promise<boolean>;
}

export const useTeacherPayrolls = (): UseTeacherPayrollsReturn => {
    const [payrolls, setPayrolls] = useState<PayrollItem[]>([]);
    const [stats, setStats] = useState<PayrollStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearchInternal] = useState("");
    const [filterStatus, setFilterStatusInternal] = useState<
        "all" | "pending" | "pending_old" | "paid"
    >("all");

    const getHeaders = useCallback(() => {
        const token =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";
        return {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
            ...(token && { "X-CSRF-TOKEN": token }),
        } as Record<string, string>;
    }, []);

    // 🔥 دالة لحساب الأيام من period_start
    const daysSincePeriodStart = useCallback(
        (periodStart: string | undefined): number => {
            if (!periodStart) return 999;
            const periodDate = new Date(periodStart);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - periodDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        },
        [],
    );

    const fetchActiveTeachers = useCallback(async () => {
        try {
            const response = await fetch("/api/v1/teachers?status=active", {
                method: "GET",
                credentials: "include",
                headers: getHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                const teachers = Array.isArray(data.data)
                    ? data.data
                    : data.data?.data || [];
                console.log("📚 المدرسين النشطين:", teachers.length);
                return teachers;
            }
        } catch (error) {
            console.error("❌ خطأ في جلب المدرسين:", error);
        }
        return [];
    }, [getHeaders]);

    // 🔥 نظام التدوير المُصحح 100% - ينشئ جديد بعد 30 يوم
    const smartPayrollRotation = useCallback(async () => {
        console.log(
            "🎯 **نظام التدوير المُصحح - ينشئ بعد 30 يوم من period_start**",
        );

        const activeTeachers = await fetchActiveTeachers();
        let totalCreated = 0;
        let totalChecked = 0;
        const currentMonth = new Date().toISOString().slice(0, 7);

        for (const teacher of activeTeachers) {
            totalChecked++;

            const correctTeacherId = teacher.teacher?.id;
            const userId = teacher.id;

            console.log(
                `\n🔄 [${totalChecked}/${activeTeachers.length}] ${teacher.name}`,
            );
            console.log(
                `👤 user_id: ${userId} ✅ | ✅ teacher_id: ${correctTeacherId}`,
            );

            if (!correctTeacherId) {
                console.error(`❌ مفيش teacher.teacher.id لـ ${teacher.name}`);
                continue;
            }

            try {
                const payrollResponse = await fetch(
                    `/api/v1/teacher/payrolls?teacher_id=${correctTeacherId}`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: getHeaders(),
                    },
                );

                let teacherPayrolls: any[] = [];
                if (payrollResponse.ok) {
                    const data = await payrollResponse.json();
                    teacherPayrolls = Array.isArray(data.data)
                        ? data.data
                        : data.data?.data || [];
                }

                console.log(
                    `   📊 ${teacher.name}: ${teacherPayrolls.length} سجل`,
                );

                // 🔥 1. ابحث عن جدول الشهر الحالي
                const currentMonthPayroll = teacherPayrolls.find(
                    (p) => p.month_year === currentMonth,
                );

                // 🔥 2. لو مش موجود → ينشئ جديد
                if (!currentMonthPayroll) {
                    console.log(
                        `   🆕 ${teacher.name}: مفيش جدول للشهر ${currentMonth}`,
                    );

                    const payrollData = {
                        teacher_id: correctTeacherId,
                        user_id: userId,
                        attendance_days: 22,
                        deductions: "200",
                        status: "pending",
                        month_year: currentMonth,
                    };

                    const createResponse = await fetch(
                        "/api/v1/teacher/payrolls",
                        {
                            method: "POST",
                            credentials: "include",
                            headers: getHeaders(),
                            body: JSON.stringify(payrollData),
                        },
                    );

                    if (createResponse.ok) {
                        totalCreated++;
                        console.log(
                            `   🎉 ${teacher.name}: ✅ جدول جديد لـ ${currentMonth}`,
                        );
                    } else {
                        const status = createResponse.status;
                        console.log(
                            `   ⚠️ ${teacher.name}: ${status} (موجود أو خطأ)`,
                        );
                        // 🔥 409 = طبيعي (موجود)
                    }
                    await new Promise((r) => setTimeout(r, 500));
                    continue;
                }

                // 🔥 3. لو موجود → تحقق من period_start + 30 يوم
                const daysFromPeriod = daysSincePeriodStart(
                    currentMonthPayroll.period_start,
                );
                console.log(
                    `   📅 period_start: ${currentMonthPayroll.period_start?.slice(0, 10)} → ${daysFromPeriod} يوم`,
                );

                // 🔥 4. لو أكتر من 30 يوم → ينشئ جديد للشهر التالي
                if (daysFromPeriod >= 30) {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    const nextMonthStr = nextMonth.toISOString().slice(0, 7);

                    console.log(
                        `   🆕 ${teacher.name}: period_start قديم → شهر جديد ${nextMonthStr}`,
                    );

                    const payrollData = {
                        teacher_id: correctTeacherId,
                        user_id: userId,
                        attendance_days: 22,
                        deductions: "200",
                        status: "pending",
                        month_year: nextMonthStr,
                    };

                    const createResponse = await fetch(
                        "/api/v1/teacher/payrolls",
                        {
                            method: "POST",
                            credentials: "include",
                            headers: getHeaders(),
                            body: JSON.stringify(payrollData),
                        },
                    );

                    if (createResponse.ok) {
                        totalCreated++;
                        console.log(
                            `   🎉 ${teacher.name}: ✅ جدول جديد لـ ${nextMonthStr}`,
                        );
                    } else {
                        console.log(
                            `   ⚠️ ${teacher.name}: فشل إنشاء ${nextMonthStr}`,
                        );
                    }
                    await new Promise((r) => setTimeout(r, 500));
                } else {
                    console.log(
                        `   ✅ ${teacher.name}: مش محتاج (${daysFromPeriod} < 30 يوم)`,
                    );
                }
            } catch (error) {
                console.error(`💥 خطأ مع ${teacher.name}:`, error);
            }
        }

        console.log(`\n🎉 **التقرير النهائي**`);
        console.log(
            `📊 تم فحص: ${totalChecked} | ✅ تم إنشاء: ${totalCreated}`,
        );
        return totalCreated;
    }, [fetchActiveTeachers, getHeaders, daysSincePeriodStart]);

    const fetchPayrolls = useCallback(
        async (searchVal?: string, statusVal?: string) => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchVal) params.append("search", searchVal);
                if (statusVal && statusVal !== "all")
                    params.append("status", statusVal);

                const response = await fetch(
                    `/api/v1/teacher/payrolls?${params}`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: getHeaders(),
                    },
                );

                if (!response.ok) throw new Error("فشل في جلب الجداول");

                const data = await response.json();
                const payrollData = Array.isArray(data.data)
                    ? data.data
                    : data.data?.data || [];
                console.log(`📋 تم جلب ${payrollData.length} جدول رواتب`);

                setPayrolls(payrollData as PayrollItem[]);
                setStats(data.stats || null);
            } catch (error) {
                console.error("❌ Fetch payrolls error:", error);
                setPayrolls([]);
                setStats(null);
            } finally {
                setLoading(false);
            }
        },
        [getHeaders],
    );

    const markPaid = useCallback(
        async (id: number): Promise<boolean> => {
            try {
                setPayrolls((prev) =>
                    prev.map((p) =>
                        p.id === id ? { ...p, status: "paid" as const } : p,
                    ),
                );
                const response = await fetch(
                    `/api/v1/teacher/payrolls/${id}/paid`,
                    {
                        method: "PATCH",
                        credentials: "include",
                        headers: getHeaders(),
                    },
                );
                if (!response.ok) {
                    await fetchPayrolls(search, filterStatus);
                    return false;
                }
                return true;
            } catch {
                await fetchPayrolls(search, filterStatus);
                return false;
            }
        },
        [getHeaders, search, filterStatus, fetchPayrolls],
    );

    useEffect(() => {
        const init = async () => {
            console.log("🚀 **بدء التحميل مع النظام المُصحح...**");
            const createdCount = await smartPayrollRotation();
            console.log(`✅ تم إنشاء ${createdCount} جدول تلقائياً`);
            setTimeout(() => fetchPayrolls(search, filterStatus), 2000);
        };
        init();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(
            () => fetchPayrolls(search, filterStatus),
            300,
        );
        return () => clearTimeout(timeout);
    }, [search, filterStatus, fetchPayrolls]);

    const filteredPayrolls = useMemo(() => {
        return payrolls.filter((payroll) => {
            const matchesSearch =
                !search ||
                payroll.user.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                payroll.teacher.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                payroll.teacher.role
                    .toLowerCase()
                    .includes(search.toLowerCase());

            let matchesStatus = filterStatus === "all";
            if (filterStatus === "pending") {
                matchesStatus = payroll.status === "pending";
            } else if (filterStatus === "pending_old") {
                matchesStatus =
                    payroll.status === "pending" &&
                    payroll.period_start &&
                    daysSincePeriodStart(payroll.period_start) >= 30;
            } else if (filterStatus === "paid") {
                matchesStatus = payroll.status === "paid";
            }

            return matchesSearch && matchesStatus;
        });
    }, [payrolls, search, filterStatus, daysSincePeriodStart]);

    const computedStats = useMemo(() => {
        const totalPayroll = filteredPayrolls.reduce(
            (sum, p) => sum + parseFloat(p.total_due || "0"),
            0,
        );
        const totalPending = filteredPayrolls
            .filter((p) => p.status === "pending")
            .reduce((sum, p) => sum + parseFloat(p.total_due || "0"), 0);
        return {
            total_payroll: totalPayroll,
            total_pending: totalPending,
            total_paid: totalPayroll - totalPending,
            pending_count: filteredPayrolls.filter(
                (p) => p.status === "pending",
            ).length,
            paid_count: filteredPayrolls.filter((p) => p.status === "paid")
                .length,
            current_month: new Date().toISOString().slice(0, 7),
        };
    }, [filteredPayrolls]);

    return {
        payrolls: filteredPayrolls,
        rawPayrolls: payrolls,
        stats: computedStats,
        loading,
        search,
        setSearch: setSearchInternal,
        filterStatus,
        setFilterStatus: setFilterStatusInternal,
        refetch: () => fetchPayrolls(search, filterStatus),
        markPaid,
    };
};
