import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    CalendarIcon,
    ClockIcon,
    BuildingOfficeIcon,
    DocumentTextIcon,
    UserIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    InformationCircleIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
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
    details?: any[]; //  للـ debug
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
    details = [], //  للـ debug
    isExpanded,
    onToggle,
    type,
    onBookSchedule,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [bookingScheduleId, setBookingScheduleId] = useState<number | null>(
        null,
    );

    const safeSummary =
        Array.isArray(schedule_summary) && schedule_summary.length > 0
            ? schedule_summary[0]
            : { schedule_items: [], total_schedules: 0 };

    const scheduleItems = safeSummary.schedule_items || [];
    const totalSchedules = safeSummary.total_schedules || 0;

    //  Debug: شوف الـ details المتاحة
    console.log(
        `🔍 [PlanCard ${id}] Details:`,
        details?.map((d: any) => d.id) || [],
    );

    const handleBookSchedule = async (
        scheduleId: number,
        planDetailsId: number, //  parameter جديد
        e: React.MouseEvent,
    ) => {
        e.stopPropagation();

        if (
            !scheduleItems.find((item) => item.id === scheduleId)?.is_available
        ) {
            return;
        }

        try {
            console.log(`🚀 [PlanCard ${id}] Booking schedule:`, {
                scheduleId,
                planDetailsId,
            });
            setBookingScheduleId(scheduleId);
            await onBookSchedule(scheduleId, id, planDetailsId);
        } catch (error: any) {
            console.error(`❌ [PlanCard ${id}] Booking error:`, error);
        } finally {
            setBookingScheduleId(null);
        }
    };

    return (
        <div className="plan-card-container">
            <div
                className={`plan-card ${isHovered ? "plan-card--hover" : ""}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onToggle}
            >
                <div className="plan-card__header">
                    <div className="plan-card__duration">
                        {total_months} شهر
                    </div>
                    <div className="plan-card__expand-icon">
                        {isExpanded ? (
                            <ChevronUpIcon className="w-6 h-6" />
                        ) : (
                            <ChevronDownIcon className="w-6 h-6" />
                        )}
                    </div>
                    <div className="plan-card__schedules-badge">
                        {totalSchedules} موعد
                    </div>
                </div>

                <div className="plan-card__body">
                    <h3 className="plan-card__title">{plan_name}</h3>
                    <div className="plan-card__details">
                        <span className="plan-card__detail-item">
                            <DocumentTextIcon className="w-5 h-5" />
                            {details_count} يوم دراسي
                        </span>
                        <span className="plan-card__detail-item">
                            <BuildingOfficeIcon className="w-5 h-5" />
                            {center.name}
                        </span>
                    </div>
                </div>

                <div className="plan-card__footer">
                    <span className="plan-card__cta">
                        {type === "available" ? "احجز الآن" : "عرض التفاصيل"}
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="plan-card-expanded">
                    <div className="plan-card-expanded__header">
                        حلقات الخطة المتاحة
                        <span className="plan-card-expanded__count">
                            ({totalSchedules} موعد)
                        </span>
                    </div>

                    {scheduleItems.length > 0 ? (
                        <div className="plan-card-expanded__grid">
                            {scheduleItems
                                .slice(0, 3)
                                .map(
                                    (schedule: ScheduleItem, index: number) => (
                                        <div
                                            key={`${id}-${schedule.id}-${index}`} //  Key محكم
                                            className="schedule-item-card"
                                        >
                                            <div className="schedule-item__mosque">
                                                <BuildingOfficeIcon className="w-4 h-4" />
                                                {schedule.mosque_name}
                                            </div>
                                            <h4 className="schedule-item__circle">
                                                {schedule.circle_name}
                                            </h4>
                                            <div className="schedule-item__teacher">
                                                <UserIcon className="w-5 h-5" />
                                                {schedule.teacher_name}
                                            </div>

                                            <div className="schedule-item__time">
                                                <ClockIcon className="w-4 h-4" />
                                                {schedule.time_range}
                                            </div>

                                            <div
                                                className={`schedule-item__status ${
                                                    schedule.is_available
                                                        ? "available"
                                                        : "full"
                                                }`}
                                            >
                                                {schedule.is_available ? (
                                                    <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                                                ) : (
                                                    <XCircleIcon className="w-5 h-5 inline mr-2" />
                                                )}
                                                {schedule.is_available
                                                    ? "متاح"
                                                    : "ممتلئ"}
                                            </div>

                                            <button
                                                className={`schedule-item__book-btn w-full mt-3 ${
                                                    schedule.is_available
                                                        ? bookingScheduleId ===
                                                          schedule.id
                                                            ? "loading"
                                                            : "available"
                                                        : "disabled"
                                                }`}
                                                onClick={(e) =>
                                                    handleBookSchedule(
                                                        schedule.id,
                                                        1, //  هنا كان المشكلة - كان fixed 1
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
                                                        <div className="loading-spinner-small" />
                                                        جاري الحجز...
                                                    </>
                                                ) : schedule.is_available ? (
                                                    "اشتراك الآن"
                                                ) : (
                                                    "ممتلئ"
                                                )}
                                            </button>
                                        </div>
                                    ),
                                )}
                        </div>
                    ) : (
                        <div className="plan-card-expanded__empty">
                            <div className="empty-icon">
                                <InformationCircleIcon className="w-16 h-16" />
                            </div>
                            <div className="empty-title">
                                لا توجد مواعيد متاحة حالياً
                            </div>
                            <div className="empty-subtitle">
                                العناصر: {scheduleItems.length}
                                <br />
                                إجمالي Backend: {totalSchedules}
                            </div>
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

    //  handleBookSchedule محدث مع الـ planDetailsId الصحيح
    const handleBookSchedule = async (
        scheduleId: number,
        planId: number,
        planDetailsId: number,
    ) => {
        console.log(`🎯 [PlanCards] Booking:`, {
            scheduleId,
            planId,
            planDetailsId,
        });

        try {
            const result = await bookSchedule(
                scheduleId,
                planId,
                planDetailsId,
            );
            if (result.success) {
                alert(` ${result.message}`);
                await refetch();
            } else {
                alert(`❌ ${result.message}`);
            }
        } catch (error: any) {
            console.error("❌ [PlanCards] Booking error:", error);
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
                    inline: "nearest",
                });
            });
        }
    }, [localExpandedPlans]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <div className="navbar">
                    <div className="navbar__inner">
                        <div className="navbar__loading">
                            <div className="loading-spinner">
                                <div className="spinner-circle"></div>
                            </div>
                        </div>
                    </div>
                </div>{" "}
            </div>
        );
    }

    if (error) {
        return <div className="error-container"></div>;
    }

    return (
        <div ref={containerRef} className="plan-cards-container">
            <header className="plan-cards-header">
                <h1 className="plan-cards-title">
                    {type === "available"
                        ? "خطط متاحة للحجز"
                        : `خططي (${plans.length})`}
                </h1>
                {plans[0]?.center && (
                    <div className="plan-cards-center">
                        <BuildingOfficeIcon className="w-5 h-5 inline mr-2" />
                        {plans[0].center.name}
                    </div>
                )}
            </header>

            <div className="plans-grid">
                {plans.map((plan) => (
                    <div
                        key={plan.id} //  Key محكم
                        data-plan-id={plan.id}
                        className="plan-wrapper"
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
                            details={plan.details || []} //  مرر الـ details
                            isExpanded={localExpandedPlans.has(plan.id)}
                            onToggle={() => togglePlan(plan.id)}
                            type={type}
                            onBookSchedule={handleBookSchedule}
                        />
                    </div>
                ))}
            </div>

            {pagination && (
                <div className="pagination-container">
                    <button
                        onClick={() => fetchPlans(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="pagination-btn pagination-prev"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        السابق
                    </button>
                    <span className="pagination-info">
                        صفحة {pagination.currentPage} من {pagination.lastPage}
                        <span className="pagination-total">
                            ({pagination.total} خطة)
                        </span>
                    </span>
                    <button
                        onClick={() => fetchPlans(pagination.currentPage + 1)}
                        disabled={
                            pagination.currentPage === pagination.lastPage
                        }
                        className="pagination-btn pagination-next"
                    >
                        التالي
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlanCards;
