// components/FeaturedPlansCards.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    BuildingOfficeIcon,
    DocumentTextIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "react-router-dom";

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
    const handleRegisterClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (centerSlug) window.location.href = `/register/${centerSlug}`;
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
                    <span className="qplan-card__meta-item">{center_name}</span>
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
                        خطط مميزة متاحة
                        <span>({totalSchedules} موعد)</span>
                    </div>
                    <div className="qplan-expanded__empty">
                        <p className="qplan-expanded__empty-title">
                            ابدأ رحلتك التعليمية
                        </p>
                        <p className="qplan-expanded__empty-sub">
                            اضغط على الزر أسفل للتسجيل في المركز
                            <br />
                            متاح في {center_name}
                        </p>
                        <button
                            className="qplan-expanded__register-btn"
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
                });
            });
        }
    }, [localExpandedPlans]);

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
                        : `خططي (${dummyPlans.length})`}
                </h1>
                <div className="qplans-header__center">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    {centerName}
                </div>
            </header>
            <div className="qplans-grid">
                {dummyPlans.map((plan) => (
                    <div
                        key={plan.id}
                        data-plan-id={plan.id}
                        className="qplans-grid__item"
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
