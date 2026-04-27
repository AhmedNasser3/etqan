// UserDashboard/plans/models/PlanCards.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    CalendarIcon,
    ClockIcon,
    BuildingOfficeIcon,
    DocumentTextIcon,
    UserIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useStudentPlans } from "./hooks/useStudentPlans";

interface ScheduleItem {
    id: number;
    date: string;
    day_of_week_ar: string;
    start_time: string;
    end_time: string;
    start_time_12h_ar: string;
    end_time_12h_ar: string;
    time_range: string;
    is_available: boolean;
    circle_name: string;
    mosque_name: string;
    teacher_name: string;
    group: string;
    plan_id?: number;
    circle_id?: number;
    teacher_id?: number;
}

interface ScheduleSummary {
    schedule_items: ScheduleItem[];
    total_schedules: number;
}

interface PlanCardProps {
    id: number;
    plan_name: string;
    total_months: number;
    details_count: number;
    available_schedules_count?: number;
    schedule_summary?: ScheduleSummary[];
    center: { name: string };
    details?: any[];
    isExpanded: boolean;
    onToggle: () => void;
    type: "available" | "my-plans";
    onBookSchedule: (
        scheduleId: number,
        planId: number,
        planDetailsId: number,
    ) => Promise<void>;
}

const PlanCard: React.FC<PlanCardProps> = ({
    id,
    plan_name,
    total_months,
    details_count,
    available_schedules_count = 0,
    schedule_summary = [],
    center,
    details = [],
    isExpanded,
    onToggle,
    type,
    onBookSchedule,
}) => {
    const [bookingScheduleId, setBookingScheduleId] = useState<number | null>(
        null,
    );

    const safeSummary =
        Array.isArray(schedule_summary) && schedule_summary.length > 0
            ? schedule_summary[0]
            : { schedule_items: [], total_schedules: 0 };

    const scheduleItems = safeSummary.schedule_items || [];
    const totalSchedules = safeSummary.total_schedules || 0;

    const handleBookSchedule = async (
        scheduleId: number,
        planDetailsId: number,
        e: React.MouseEvent,
    ) => {
        e.stopPropagation();
        if (!scheduleItems.find((item) => item.id === scheduleId)?.is_available)
            return;
        try {
            setBookingScheduleId(scheduleId);
            await onBookSchedule(scheduleId, id, planDetailsId);
        } catch (error: any) {
            console.error(`❌ [PlanCard ${id}] Booking error:`, error);
        } finally {
            setBookingScheduleId(null);
        }
    };

    return (
        <div className="qplan-card-wrap">
            <div
                className={`qplan-card${isExpanded ? " qplan-card--open" : ""}`}
                onClick={onToggle}
            >
                <div className="qplan-card__top">
                    <span className="qplan-card__months">
                        {total_months} شهر
                    </span>
                    <span className="qplan-card__slots">
                        {totalSchedules} موعد
                    </span>
                </div>
                <h3 className="qplan-card__name">{plan_name}</h3>
                <div className="qplan-card__meta">
                    <span className="qplan-card__meta-item">
                        {details_count} يوم دراسي
                    </span>
                    <span className="qplan-card__meta-item">{center.name}</span>
                </div>
                <div className="qplan-card__cta">
                    <span>
                        {type === "available" ? "احجز الآن" : "عرض التفاصيل"}
                    </span>
                    <span className="qplan-card__arrow">
                        {isExpanded ? "▲" : "▼"}
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="qplan-expanded">
                    <div className="qplan-expanded__title">
                        حلقات الخطة المتاحة
                        <span>({totalSchedules} موعد)</span>
                    </div>
                    {scheduleItems.length > 0 ? (
                        <div className="qplan-expanded__grid">
                            {scheduleItems
                                .slice(0, 3)
                                .map((schedule, index) => (
                                    <div
                                        key={`${id}-${schedule.id}-${index}`}
                                        className="qschedule-card"
                                    >
                                        <div className="qschedule-card__mosque">
                                            {schedule.mosque_name}
                                        </div>
                                        <h4 className="qschedule-card__circle">
                                            {schedule.circle_name}
                                        </h4>
                                        <div className="qschedule-card__teacher">
                                            المعلم : {schedule.teacher_name}
                                        </div>
                                        <div className="qschedule-card__time">
                                            {schedule.time_range}
                                        </div>
                                        <div
                                            className={`qschedule-card__status ${schedule.is_available ? "qschedule-card__status--ok" : "qschedule-card__status--full"}`}
                                        >
                                            {schedule.is_available ? (
                                                <>
                                                    <CheckCircleIcon className="w-4 h-4" />{" "}
                                                    متاح
                                                </>
                                            ) : (
                                                <>
                                                    <XCircleIcon className="w-4 h-4" />{" "}
                                                    ممتلئ
                                                </>
                                            )}
                                        </div>
                                        <button
                                            className={`qschedule-card__btn ${schedule.is_available ? (bookingScheduleId === schedule.id ? "qschedule-card__btn--loading" : "qschedule-card__btn--ok") : "qschedule-card__btn--disabled"}`}
                                            onClick={(e) =>
                                                handleBookSchedule(
                                                    schedule.id,
                                                    1,
                                                    e,
                                                )
                                            }
                                            disabled={
                                                !schedule.is_available ||
                                                bookingScheduleId ===
                                                    schedule.id
                                            }
                                        >
                                            {bookingScheduleId ===
                                            schedule.id ? (
                                                <>
                                                    <span className="qschedule-card__spinner" />
                                                    جاري الحجز...
                                                </>
                                            ) : schedule.is_available ? (
                                                "اشتراك الآن"
                                            ) : (
                                                "ممتلئ"
                                            )}
                                        </button>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="qplan-expanded__empty">
                            <InformationCircleIcon className="w-12 h-12" />
                            <p>لا توجد حلقات متاحة</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface PlanCardsProps {
    type?: "available" | "my-plans";
}

const PlanCards: React.FC<PlanCardsProps> = ({ type = "available" }) => {
    const [localExpandedPlans, setLocalExpandedPlans] = useState<Set<number>>(
        new Set(),
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        plans,
        loading,
        error,
        pagination,
        fetchPlans,
        refetch,
        bookSchedule,
    } = useStudentPlans(type, 1);

    const handleBookSchedule = async (
        scheduleId: number,
        planId: number,
        planDetailsId: number,
    ) => {
        try {
            const result = await bookSchedule(
                scheduleId,
                planId,
                planDetailsId,
            );
            if (result.success) {
                alert(result.message);
                await refetch();
            } else {
                alert(`❌ ${result.message}`);
            }
        } catch {
            alert("حدث خطأ في الحجز");
        }
    };

    const togglePlan = useCallback((planId: number) => {
        setLocalExpandedPlans((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(planId)) {
                newSet.delete(planId);
            } else {
                newSet.clear();
                newSet.add(planId);
            }
            return newSet;
        });
    }, []);

    useEffect(() => {
        if (localExpandedPlans.size > 0 && containerRef.current) {
            const expandedPlanId = Array.from(localExpandedPlans)[0];
            requestAnimationFrame(() => {
                const expandedCard = containerRef.current?.querySelector(
                    `[data-plan-id="${expandedPlanId}"]`,
                ) as HTMLElement;
                expandedCard?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            });
        }
    }, [localExpandedPlans]);

    if (loading) {
        return (
            <div className="qplans-loading">
                <div className="qplans-loading__spinner" />
            </div>
        );
    }

    if (error) return <div className="qplans-error" />;

    const hasAnySchedules =
        plans &&
        plans.some(
            (plan: any) =>
                plan.schedule_summary?.length > 0 &&
                plan.schedule_summary[0]?.total_schedules > 0,
        );

    if (!plans || plans.length === 0 || !hasAnySchedules) {
        return (
            <div className="qplans-container" id="plan-cards-container">
                <div className="qplans-empty">
                    <p>لا توجد حلقات متاحة</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="qplans-container"
            id="plan-cards-container"
        >
            <header className="qplans-header">
                <h1 className="qplans-header__title">
                    {type === "available"
                        ? "حلقات متاحة للحجز"
                        : `خططي (${plans.length})`}
                </h1>
            </header>

            <div className="qplans-grid">
                {plans.map((plan: any) => (
                    <div
                        key={plan.id}
                        data-plan-id={plan.id}
                        className="qplans-grid__item"
                    >
                        <PlanCard
                            id={plan.id}
                            plan_name={plan.plan_name}
                            total_months={plan.total_months || 0}
                            details_count={plan.details_count || 0}
                            available_schedules_count={
                                plan.available_schedules_count || 0
                            }
                            schedule_summary={plan.schedule_summary || []}
                            center={plan.center || { name: "غير محدد" }}
                            details={plan.details || []}
                            isExpanded={localExpandedPlans.has(plan.id)}
                            onToggle={() => togglePlan(plan.id)}
                            type={type}
                            onBookSchedule={handleBookSchedule}
                        />
                    </div>
                ))}
            </div>

            {pagination && (
                <div className="qplans-pagination">
                    <button
                        onClick={() => fetchPlans(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="qplans-pagination__btn"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        السابق
                    </button>
                    <span className="qplans-pagination__info">
                        صفحة {pagination.currentPage} من {pagination.lastPage}
                        <span>({pagination.total} خطة)</span>
                    </span>
                    <button
                        onClick={() => fetchPlans(pagination.currentPage + 1)}
                        disabled={
                            pagination.currentPage === pagination.lastPage
                        }
                        className="qplans-pagination__btn"
                    >
                        التالي
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlanCards;
