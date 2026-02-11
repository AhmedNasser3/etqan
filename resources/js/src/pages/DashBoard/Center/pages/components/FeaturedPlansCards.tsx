// components/FeaturedPlansCards.tsx - النسخة المُصححة
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    BuildingOfficeIcon,
    DocumentTextIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "react-router-dom";

// ✅ Props بسيطة - مش معقدة
interface SimplePlanCardProps {
    id: number;
    plan_name: string;
    total_months: number;
    details_count: number;
    center_name: string;
    totalSchedules: number;
    isExpanded: boolean;
    onToggle: () => void;
    type: "available" | "my-plans";
    centerSlug?: string;
}

const PlanCard: React.FC<SimplePlanCardProps> = ({
    id,
    plan_name,
    total_months,
    details_count,
    center_name,
    totalSchedules,
    isExpanded,
    onToggle,
    type,
    centerSlug,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleRegisterClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (centerSlug) {
            window.location.href = `/register/${centerSlug}`;
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
                            {center_name}
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
                        خطط مميزة متاحة
                        <span className="plan-card-expanded__count">
                            ({totalSchedules} موعد)
                        </span>
                    </div>
                    <div className="plan-card-expanded__empty">
                        <div className="empty-icon">
                            <InformationCircleIcon className="w-16 h-16" />
                        </div>
                        <div className="empty-title">ابدأ رحلتك التعليمية</div>
                        <div className="empty-subtitle">
                            اضغط على الزر أسفل للتسجيل في المركز
                            <br />
                            متاح في {center_name}
                        </div>
                        <button
                            className="plan-card-expanded__cta"
                            onClick={handleRegisterClick}
                        >
                            ابدأ التسجيل الآن
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface FeaturedPlansCardsProps {
    type?: "available" | "my-plans";
}

const FeaturedPlansCards: React.FC<FeaturedPlansCardsProps> = ({
    type = "available",
}) => {
    const [localExpandedPlans, setLocalExpandedPlans] = useState<Set<number>>(
        new Set(),
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const { centerSlug } = useParams<{ centerSlug: string }>();

    const centerName = centerSlug
        ? `${centerSlug.charAt(0).toUpperCase() + centerSlug.slice(1)}`
        : "المركز التعليمي";

    // ✅ خطط بسيطة - بدون complex interfaces
    const dummyPlans = [
        {
            id: 1,
            plan_name: "خطة الحفظ الشهري",
            total_months: 1,
            details_count: 25,
            totalSchedules: 12,
        },
        {
            id: 2,
            plan_name: "خطة التجويد المتوسطة",
            total_months: 2,
            details_count: 45,
            totalSchedules: 8,
        },
        {
            id: 3,
            plan_name: "برنامج المراجعة الكامل",
            total_months: 3,
            details_count: 75,
            totalSchedules: 15,
        },
    ];

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

    return (
        <div ref={containerRef} className="plan-cards-container">
            <header className="plan-cards-header">
                <h1 className="plan-cards-title">
                    {type === "available"
                        ? "خطط متاحة للحجز"
                        : `خططي (${dummyPlans.length})`}
                </h1>
                <div className="plan-cards-center">
                    <BuildingOfficeIcon className="w-5 h-5 inline mr-2" />
                    {centerName}
                </div>
            </header>

            <div className="plans-grid">
                {dummyPlans.map((plan) => (
                    <div
                        key={plan.id}
                        data-plan-id={plan.id}
                        className="plan-wrapper"
                    >
                        <PlanCard
                            id={plan.id}
                            plan_name={plan.plan_name}
                            total_months={plan.total_months}
                            details_count={plan.details_count}
                            center_name={centerName}
                            totalSchedules={plan.totalSchedules}
                            isExpanded={localExpandedPlans.has(plan.id)}
                            onToggle={() => togglePlan(plan.id)}
                            type={type}
                            centerSlug={centerSlug}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedPlansCards;
