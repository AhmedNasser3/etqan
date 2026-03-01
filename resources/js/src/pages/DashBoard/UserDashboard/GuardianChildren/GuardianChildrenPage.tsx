// components/GuardianChildrenPage.tsx - ✅ مُصحح نهائي 100% مع مسافات ونسب صحيحة

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGuardianChildren, ChildData } from "./hooks/useGuardianChildren";

const GuardianChildrenPage: React.FC = () => {
    const {
        children,
        loading,
        error,
        hasChildren,
        expandedChildId,
        toggleChildDetails,
        refreshData,
        user,
    } = useGuardianChildren();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "healthy":
                return "healthy";
            case "needs_attention":
                return "needs_attention";
            case "special_needs":
                return "special_needs";
            default:
                return "healthy";
        }
    };

    const calculateAttendanceRate = (child: ChildData) => {
        return child.stats.total_attendance > 0
            ? Math.round(
                  (child.stats.present_days / child.stats.total_attendance) *
                      100,
              )
            : 0;
    };

    // ✅ دالة نهائية مُصححة 100% - النسب دايماً = 100%
    const getAttendanceStatus = (child: ChildData) => {
        const {
            present_days = 0,
            absent_days = 0,
            total_attendance = 0,
            total_plan_details = 0,
        } = child.stats;

        const present = present_days;
        const absent = absent_days;
        const totalDays = Math.max(1, total_attendance || total_plan_details);
        const attendedTotal = present + absent;
        const pending = Math.max(0, totalDays - attendedTotal);

        // حساب النسب الأولية
        let presentRate = Math.round((present / totalDays) * 100);
        let absentRate = Math.round((absent / totalDays) * 100);
        let pendingRate = Math.round((pending / totalDays) * 100);

        // ✅ تصحيح التقريب العشري - ضمان المجموع = 100%
        const currentSum = presentRate + absentRate + pendingRate;
        if (currentSum !== 100) {
            pendingRate += 100 - currentSum;
        }

        return {
            present,
            absent,
            pending,
            totalPlanDetails: totalDays,
            presentRate,
            absentRate,
            pendingRate,
        };
    };

    // ✅ دالة تنسيق الأرقام بمسافات
    const formatNumber = (num: number) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const StatsChart = ({
        attendanceRate,
        totalPoints,
        bookingsCount,
    }: {
        attendanceRate: number;
        totalPoints: number;
        bookingsCount: number;
    }) => (
        <div className="stats-chart">
            <div
                className="attendance-circle"
                style={
                    { "--rate": `${attendanceRate}%` } as React.CSSProperties
                }
            >
                <span>{attendanceRate}%</span>
            </div>
            <div className="chart-labels">
                <div className="chart-label">
                    <div className="label-color attendance"></div>
                    <span>الحضور</span>
                </div>
                <div className="chart-label">
                    <div className="label-color points"></div>
                    <span>النقاط: {formatNumber(totalPoints)}</span>
                </div>
                <div className="chart-label">
                    <div className="label-color bookings"></div>
                    <span>الحجوزات: {formatNumber(bookingsCount)}</span>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="guardian-container">
                <div className="loading-container">
                    <div className="spinner"></div>
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
            </div>
        );
    }

    return (
        <div className="guardian-container">
            {/* Header */}
            <motion.div
                className="header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="title">أبنائك في النظام</h1>
                <p className="subtitle">
                    {hasChildren
                        ? `مرحباً ${user?.name || "ولي الأمر"}، تابع تقدم ${children.length} ابن${children.length > 2 ? "اء" : ""}`
                        : "لم يتم تسجيل أي أبناء في النظام بعد"}
                </p>
                {hasChildren && (
                    <motion.button
                        className="refresh-btn"
                        onClick={refreshData}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        🔄 تحديث البيانات
                    </motion.button>
                )}
            </motion.div>

            {/* Error State */}
            {error && (
                <motion.div
                    className="error-banner"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span>⚠️ {error}</span>
                    <button onClick={refreshData}>إعادة المحاولة</button>
                </motion.div>
            )}

            {/* Children Grid */}
            <div className="children-grid">
                {children.length === 0 ? (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="empty-icon">👨‍👩‍👧‍👦</div>
                        <h3>لا يوجد أبناء مسجلين</h3>
                        <p>لم يتم تسجيل أي أبناء في النظام بعد</p>
                        <motion.button
                            className="contact-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            تواصل مع الإدارة
                        </motion.button>
                    </motion.div>
                ) : (
                    children.map((child) => {
                        const attendanceRate = calculateAttendanceRate(child);
                        const attendanceStatus = getAttendanceStatus(child);
                        const isExpanded = expandedChildId === child.id;

                        return (
                            <>
                                <motion.div
                                    key={`card-${child.id}`}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="child-card"
                                    whileHover={{ y: -4 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                    }}
                                >
                                    <div
                                        className="card-header"
                                        onClick={() =>
                                            toggleChildDetails(child.id)
                                        }
                                    >
                                        <div className="avatar-container">
                                            <div
                                                className="avatar"
                                                style={{
                                                    backgroundImage: `url(${child.user.avatar || "/default-avatar.png"})`,
                                                }}
                                            >
                                                {!child.user.avatar &&
                                                    child.user.name.charAt(0)}
                                            </div>
                                        </div>

                                        <div className="child-info">
                                            <h3 className="child-name">
                                                {child.user.name}
                                            </h3>
                                            <div className="child-meta">
                                                <span className="circle">
                                                    {child.plans[0]
                                                        ?.plan_name ||
                                                        "غير محدد"}
                                                </span>
                                                <span
                                                    className={`status ${getStatusColor(child.student_info.health_status)}`}
                                                >
                                                    {(() => {
                                                        switch (
                                                            child.student_info
                                                                .health_status
                                                        ) {
                                                            case "healthy":
                                                                return "سليم";
                                                            case "needs_attention":
                                                                return "يحتاج متابعة";
                                                            case "special_needs":
                                                                return "احتياجات خاصة";
                                                            default:
                                                                return "غير محدد";
                                                        }
                                                    })()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="stats">
                                            <div className="stat">
                                                <div className="stat-value">
                                                    {attendanceRate}%
                                                </div>
                                                <div className="stat-label">
                                                    حضور
                                                </div>
                                            </div>
                                            <div className="stat">
                                                <div className="stat-value">
                                                    {formatNumber(
                                                        child.stats
                                                            .total_points || 0,
                                                    )}
                                                </div>
                                                <div className="stat-label">
                                                    نقاط
                                                </div>
                                            </div>
                                        </div>

                                        <motion.div
                                            className="expand-icon"
                                            animate={{
                                                rotate: isExpanded ? 180 : 0,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            ▼
                                        </motion.div>
                                    </div>
                                </motion.div>

                                {/* Child Details Modal */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            key={`details-${child.id}`}
                                            initial={{
                                                opacity: 0,
                                                scale: 0.95,
                                            }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="child-details-overlay"
                                            onClick={() =>
                                                toggleChildDetails(child.id)
                                            }
                                        >
                                            <motion.div
                                                className="child-details"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                layout
                                            >
                                                <div className="details-header">
                                                    <button
                                                        className="close-btn"
                                                        onClick={() =>
                                                            toggleChildDetails(
                                                                child.id,
                                                            )
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                    <div className="avatar-large">
                                                        <img
                                                            src={
                                                                child.user
                                                                    .avatar ||
                                                                "/default-avatar.png"
                                                            }
                                                            alt={
                                                                child.user.name
                                                            }
                                                        />
                                                    </div>
                                                    <div className="child-header-info">
                                                        <h2>
                                                            {child.user.name}
                                                        </h2>
                                                        <div className="health-status">
                                                            {(() => {
                                                                switch (
                                                                    child
                                                                        .student_info
                                                                        .health_status
                                                                ) {
                                                                    case "healthy":
                                                                        return "سليم";
                                                                    case "needs_attention":
                                                                        return "يحتاج متابعة";
                                                                    case "special_needs":
                                                                        return "احتياجات خاصة";
                                                                    default:
                                                                        return "غير محدد";
                                                                }
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="details-grid">
                                                    {/* معلومات أساسية */}
                                                    <div className="info-card">
                                                        <h3>
                                                            المعلومات الأساسية
                                                        </h3>
                                                        <div className="info-row">
                                                            <span>
                                                                الرقم القومي:
                                                            </span>
                                                            <span>
                                                                {child
                                                                    .student_info
                                                                    .id_number ||
                                                                    "غير محدد"}
                                                            </span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span>الحلقة:</span>
                                                            <span>
                                                                {child.plans[0]
                                                                    ?.plan_name ||
                                                                    "غير محدد"}
                                                            </span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span>
                                                                وقت الجلسة:
                                                            </span>
                                                            <span>
                                                                {child.plans[0]
                                                                    ?.schedule_info
                                                                    ?.time ||
                                                                    "غير محدد"}
                                                            </span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span>
                                                                ملاحظات:
                                                            </span>
                                                            <span>
                                                                {child
                                                                    .student_info
                                                                    .notes ||
                                                                    "لا توجد"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* إحصائيات شاملة */}
                                                    <div className="stats-card">
                                                        <h3>
                                                            الإحصائيات الشاملة
                                                        </h3>

                                                        <StatsChart
                                                            attendanceRate={
                                                                attendanceRate
                                                            }
                                                            totalPoints={
                                                                child.stats
                                                                    .total_points ||
                                                                0
                                                            }
                                                            bookingsCount={
                                                                child.stats
                                                                    .bookings_count ||
                                                                0
                                                            }
                                                        />

                                                        {/* ✅ جدول الحضور المُصحح مع مسافات */}
                                                        <div className="attendance-table">
                                                            <h4>
                                                                تفاصيل الحضور
                                                            </h4>
                                                            <div className="table-header">
                                                                <span>
                                                                    الحالة
                                                                </span>
                                                                <span>
                                                                    العدد
                                                                </span>
                                                                <span>
                                                                    النسبة
                                                                </span>
                                                            </div>
                                                            <div className="table-row present">
                                                                <span>
                                                                    ✅ حاضر
                                                                </span>
                                                                <span>
                                                                    {formatNumber(
                                                                        attendanceStatus.present,
                                                                    )}
                                                                </span>
                                                                <span>
                                                                    {
                                                                        attendanceStatus.presentRate
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="table-row absent">
                                                                <span>
                                                                    ❌ غائب
                                                                </span>
                                                                <span>
                                                                    {formatNumber(
                                                                        attendanceStatus.absent,
                                                                    )}
                                                                </span>
                                                                <span>
                                                                    {
                                                                        attendanceStatus.absentRate
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="table-row pending">
                                                                <span>
                                                                    ⏳ قيد
                                                                    الانتظار
                                                                </span>
                                                                <span>
                                                                    {formatNumber(
                                                                        attendanceStatus.pending,
                                                                    )}
                                                                </span>
                                                                <span>
                                                                    {
                                                                        attendanceStatus.pendingRate
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="table-total">
                                                                <span>
                                                                    إجمالي
                                                                    الجلسات
                                                                </span>
                                                                <span>
                                                                    {formatNumber(
                                                                        attendanceStatus.totalPlanDetails,
                                                                    )}
                                                                </span>
                                                                <span>
                                                                    100%
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* إحصائيات سريعة */}
                                                        <div className="stats-list">
                                                            <div className="stat-item">
                                                                <span>
                                                                    الحجوزات
                                                                    النشطة
                                                                </span>
                                                                <span>
                                                                    {formatNumber(
                                                                        child
                                                                            .stats
                                                                            .active_bookings ||
                                                                            0,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="stat-item">
                                                                <span>
                                                                    الإنجازات
                                                                </span>
                                                                <span>
                                                                    {formatNumber(
                                                                        child
                                                                            .stats
                                                                            .achievements_count ||
                                                                            0,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="stat-item">
                                                                <span>
                                                                    إجمالي
                                                                    النقاط
                                                                </span>
                                                                <span>
                                                                    {formatNumber(
                                                                        child
                                                                            .stats
                                                                            .total_points ||
                                                                            0,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* خطط الطالب */}
                                                    {child.plans.length > 0 && (
                                                        <div className="plans-card">
                                                            <h3>خطط الطالب</h3>
                                                            <div className="plans-list">
                                                                {child.plans.map(
                                                                    (plan) => (
                                                                        <div
                                                                            key={
                                                                                plan.id
                                                                            }
                                                                            className="plan-item"
                                                                        >
                                                                            <div className="plan-info">
                                                                                <h4>
                                                                                    {
                                                                                        plan.plan_name
                                                                                    }
                                                                                </h4>
                                                                                <div className="plan-meta">
                                                                                    <span>
                                                                                        {(() => {
                                                                                            switch (
                                                                                                plan.status
                                                                                            ) {
                                                                                                case "confirmed":
                                                                                                    return "مؤكد";
                                                                                                case "pending":
                                                                                                    return "قيد الانتظار";
                                                                                                case "cancelled":
                                                                                                    return "ملغي";
                                                                                                default:
                                                                                                    return plan.status;
                                                                                            }
                                                                                        })()}
                                                                                    </span>
                                                                                    <span>
                                                                                        {(() => {
                                                                                            switch (
                                                                                                plan.progress_status
                                                                                            ) {
                                                                                                case "not_started":
                                                                                                    return "لم تبدأ";
                                                                                                case "in_progress":
                                                                                                    return "جاري";
                                                                                                case "completed":
                                                                                                    return "مكتمل";
                                                                                                default:
                                                                                                    return plan.progress_status;
                                                                                            }
                                                                                        })()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="plan-schedule">
                                                                                {plan.schedule_info && (
                                                                                    <>
                                                                                        <span>
                                                                                            {
                                                                                                plan
                                                                                                    .schedule_info
                                                                                                    .date
                                                                                            }
                                                                                        </span>
                                                                                        <span>
                                                                                            {
                                                                                                plan
                                                                                                    .schedule_info
                                                                                                    .time
                                                                                            }
                                                                                        </span>
                                                                                        {plan
                                                                                            .schedule_info
                                                                                            .teacher_name && (
                                                                                            <span>
                                                                                                {
                                                                                                    plan
                                                                                                        .schedule_info
                                                                                                        .teacher_name
                                                                                                }
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                            <div className="plan-progress">
                                                                                <div className="progress-bar">
                                                                                    <div
                                                                                        className="progress-fill"
                                                                                        style={
                                                                                            {
                                                                                                "--width": `${plan.progress_rate || 0}%`,
                                                                                            } as React.CSSProperties
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                                <span>
                                                                                    {plan.progress_rate ||
                                                                                        0}

                                                                                    %
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GuardianChildrenPage;
