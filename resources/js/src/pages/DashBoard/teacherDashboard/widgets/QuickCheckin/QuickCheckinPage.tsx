// pages/QuickCheckinPage.tsx
import React from "react";
import { useQuickCheckin } from "./hooks/useQuickCheckin";

const QuickCheckinPage: React.FC = () => {
    const {
        isTodayChecked,
        isLoading,
        isDisabled,
        message,
        checkinTime,
        todayStatus,
        error,
        quickCheckin,
    } = useQuickCheckin();

    return (
        <div className="quick-checkin-page">
            <div className="checkin-card">
                {/* Header */}
                <div className="checkin-header">
                    <div className="header-icon">📍</div>
                    <h1 className="page-title">تسجيل الحضور</h1>
                    <p className="page-subtitle">
                        اضغط الزر لتسجيل حضورك اليوم
                    </p>
                </div>

                {/* Main Content */}
                <div className="checkin-content">
                    {/* Main Button */}
                    <button
                        className={`
                            main-checkin-btn
                            ${isLoading ? "btn-loading" : ""}
                            ${isTodayChecked ? "btn-success" : ""}
                            ${error ? "btn-error" : ""}
                            ${isDisabled ? "btn-disabled" : ""}
                        `}
                        onClick={quickCheckin}
                        disabled={isLoading || isDisabled}
                    >
                        <span className="btn-content">
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    <span>جاري التسجيل...</span>
                                </>
                            ) : isTodayChecked ? (
                                <>
                                    ✅ تم الحضور اليوم
                                    {checkinTime && (
                                        <div className="checkin-time">
                                            {checkinTime}
                                        </div>
                                    )}
                                </>
                            ) : (
                                "اضغط للحضور الآن 📍"
                            )}
                        </span>
                    </button>

                    {/* Status Message */}
                    {message && !error && (
                        <div
                            className={`status-message ${isTodayChecked ? "status-success" : "status-info"}`}
                        >
                            {message}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && <div className="error-message">⚠️ {error}</div>}
                </div>

                {/* Footer */}
                <div className="checkin-footer">
                    <button
                        className="refresh-btn"
                        onClick={() => window.location.reload()}
                    >
                        🔄 تحديث الحالة
                    </button>
                    {todayStatus && (
                        <div className="status-info">
                            الحالة:{" "}
                            <span className="status-value">{todayStatus}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickCheckinPage;
