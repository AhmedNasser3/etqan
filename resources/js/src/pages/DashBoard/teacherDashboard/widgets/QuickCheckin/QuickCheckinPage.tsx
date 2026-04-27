// pages/QuickCheckinPage.tsx - نسخة كاملة محدَّثة

import React, { useState } from "react";
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
        requiresReason,
        delayMinutes,
        workStartTime,
        quickCheckin,
        resetError,
    } = useQuickCheckin();

    const [lateReason, setLateReason] = useState("");
    const [showModal, setShowModal] = useState(false);

    // عندما يتأكد أن في تأخير، افتح الـ modal
    React.useEffect(() => {
        if (requiresReason) setShowModal(true);
    }, [requiresReason]);

    const handleCheckin = () => quickCheckin();

    const handleSubmitLateReason = () => {
        if (!lateReason.trim()) return;
        setShowModal(false);
        quickCheckin(lateReason);
    };

    return (
        <div className="content" id="contentArea">
            <div
                className="widget"
                style={{ maxWidth: "480px", margin: "0 auto" }}
            >
                {/* الهيدر */}
                <div className="wh">
                    <div className="wh-l">تسجيل الحضور السريع</div>
                    <button
                        className="btn bs bsm"
                        onClick={() => window.location.reload()}
                        style={{ fontSize: "0.875rem" }}
                    >
                        تحديث
                    </button>
                </div>

                {/* الكارد الرئيسي */}
                <div style={cardStyle}>
                    {/* أيقونة */}
                    <div style={iconCircleStyle}>📍</div>

                    <div
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "var(--n900)",
                            marginBottom: "8px",
                        }}
                    >
                        تسجيل حضورك اليوم
                    </div>
                    <div
                        style={{
                            color: "var(--n500)",
                            fontSize: "1rem",
                            marginBottom: "32px",
                            lineHeight: "1.5",
                        }}
                    >
                        اضغط على الزر أدناه لتسجيل حضورك بسرعة وسهولة
                    </div>

                    {/* الزر الرئيسي */}
                    <div style={{ marginBottom: "28px" }}>
                        <button
                            className={`btn bp bsm${isLoading || isDisabled ? " bd" : ""}`}
                            disabled={isLoading || isDisabled}
                            onClick={handleCheckin}
                            style={mainBtnStyle}
                        >
                            {isLoading ? (
                                <>
                                    <div style={spinnerStyle} /> جاري التسجيل...
                                </>
                            ) : isTodayChecked ? (
                                <>✅ تم الحضور اليوم</>
                            ) : (
                                <>📍 اضغط للحضور الآن</>
                            )}
                        </button>
                    </div>

                    {/* وقت التسجيل */}
                    {isTodayChecked && checkinTime && (
                        <div style={greenBadgeStyle}>
                            🕒 تم التسجيل في: <strong>{checkinTime}</strong>
                        </div>
                    )}

                    {/* حالة اليوم */}
                    {todayStatus && (
                        <div
                            style={{
                                ...statusBoxStyle,
                                borderColor: isTodayChecked
                                    ? "var(--g200)"
                                    : "var(--y200)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "1.125rem",
                                    fontWeight: 600,
                                }}
                            >
                                الحالة اليوم
                            </div>
                            <div>{todayStatus}</div>
                        </div>
                    )}

                    {/* رسائل النجاح */}
                    {message && !error && !isLoading && (
                        <div style={successMsgStyle}>{message}</div>
                    )}

                    {/* رسائل الخطأ (غير متأخر) */}
                    {error && !requiresReason && (
                        <div style={errorMsgStyle}>⚠️ {error}</div>
                    )}
                </div>
            </div>

            {/* Modal سبب التأخير */}
            {showModal && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ fontSize: "2rem", marginBottom: "12px" }}>
                            ⏰
                        </div>
                        <div
                            style={{
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                marginBottom: "8px",
                                color: "var(--n900)",
                            }}
                        >
                            أنت متأخر {delayMinutes} دقيقة
                        </div>
                        {workStartTime && (
                            <div
                                style={{
                                    color: "var(--n500)",
                                    marginBottom: "20px",
                                    fontSize: "0.9rem",
                                }}
                            >
                                موعد العمل: {workStartTime}
                            </div>
                        )}
                        <div
                            style={{
                                textAlign: "right",
                                marginBottom: "8px",
                                fontWeight: 600,
                                color: "var(--n700)",
                            }}
                        >
                            سبب التأخير *
                        </div>
                        <textarea
                            value={lateReason}
                            onChange={(e) => setLateReason(e.target.value)}
                            placeholder="اكتب سبب التأخير هنا..."
                            rows={3}
                            style={textareaStyle}
                        />
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                className="btn bp bsm"
                                disabled={!lateReason.trim() || isLoading}
                                onClick={handleSubmitLateReason}
                                style={{
                                    flex: 1,
                                    height: "48px",
                                    fontWeight: 600,
                                }}
                            >
                                {isLoading ? "جاري التسجيل..." : "تسجيل الحضور"}
                            </button>
                            <button
                                className="btn bs bsm"
                                onClick={() => {
                                    setShowModal(false);
                                    resetError();
                                }}
                                style={{ flex: 1, height: "48px" }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

// ---- styles ----
const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    padding: "32px",
    textAlign: "center",
    border: "1px solid var(--n200)",
};
const iconCircleStyle: React.CSSProperties = {
    width: "72px",
    height: "72px",
    margin: "0 auto 20px",
    background: "var(--g100)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
};
const mainBtnStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "320px",
    height: "64px",
    fontSize: "1.125rem",
    fontWeight: 600,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    margin: "0 auto",
};
const spinnerStyle: React.CSSProperties = {
    width: "24px",
    height: "24px",
    border: "3px solid var(--g200)",
    borderTop: "3px solid var(--g700)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
};
const greenBadgeStyle: React.CSSProperties = {
    background: "var(--g50)",
    color: "var(--g700)",
    padding: "12px 24px",
    borderRadius: "10px",
    fontWeight: 500,
    fontSize: "1rem",
    marginBottom: "20px",
};
const statusBoxStyle: React.CSSProperties = {
    background: "var(--n50)",
    border: "2px solid",
    padding: "16px 24px",
    borderRadius: "12px",
    marginBottom: "24px",
    textAlign: "center",
};
const successMsgStyle: React.CSSProperties = {
    background: "var(--g100)",
    color: "var(--g700)",
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "999px",
    marginBottom: "20px",
    fontSize: "0.9rem",
};
const errorMsgStyle: React.CSSProperties = {
    background: "#fee2e2",
    color: "#ef4444",
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "999px",
    marginBottom: "20px",
    fontSize: "0.9rem",
};
const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
};
const modalStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};
const textareaStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid var(--n200)",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "1rem",
    resize: "vertical",
    outline: "none",
    direction: "rtl",
    fontFamily: "inherit",
};

export default QuickCheckinPage;
