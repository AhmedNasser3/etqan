// HistoryModel.tsx - مصحح مع نفس ديزاين PayrollModel + Classes موحدة
import { useState } from "react";

interface HistoryModelProps {
    isOpen: boolean;
    onClose: () => void;
}

const HistoryModel: React.FC<HistoryModelProps> = ({ isOpen, onClose }) => {
    const ICO: Record<string, JSX.Element> = {
        x: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
    };

    const historyItems = [
        {
            date: "2026-03-28",
            day: "السبت",
            action: "وقف",
            color: "var(--red)",
            reason: "انتهاك شروط وسياسة منصة إتقان",
        },
        {
            date: "2026-03-25",
            day: "الأربعاء",
            action: "تفعيل",
            color: "var(--green)",
            reason: "استكمال التحقيق",
        },
        {
            date: "2026-03-20",
            day: "الجمعة",
            action: "وقف",
            color: "var(--red)",
            reason: "انتهاك شروط وسياسة منصة إتقان",
        },
        {
            date: "2026-03-15",
            day: "الأحد",
            action: "تفعيل",
            color: "var(--green)",
            reason: "استكمال التحقيق",
        },
        {
            date: "2026-03-10",
            day: "الثلاثاء",
            action: "وقف",
            color: "var(--red)",
            reason: "انتهاك شروط وسياسة منصة إتقان",
        },
    ];

    const handleCloseModal = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="ov on">
            <div className="modal">
                <div className="mh">
                    <span className="mh-t">سجل العمليات</span>
                    <button className="mx" onClick={handleCloseModal}>
                        <span
                            style={{
                                width: 12,
                                height: 12,
                                display: "inline-flex",
                            }}
                        >
                            {ICO.x}
                        </span>
                    </button>
                </div>

                <div
                    className="mb"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                    {historyItems.map((item, index) => (
                        <div
                            key={index}
                            className="history-item"
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                                padding: "12px 0",
                                borderBottom: "1px solid var(--n200)",
                            }}
                        >
                            {/* Date/Time */}
                            <div
                                style={{
                                    minWidth: "80px",
                                    textAlign: "center",
                                    fontSize: "12px",
                                    color: "var(--n600)",
                                }}
                            >
                                <div>{item.date}</div>
                                <div>{item.day}</div>
                            </div>

                            {/* Action Badge */}
                            <div
                                style={{
                                    flex: 1,
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    backgroundColor: item.color + "10",
                                    border: `1px solid ${item.color}20`,
                                    color: item.color,
                                    fontWeight: 700,
                                    fontSize: "14px",
                                }}
                            >
                                {item.action}
                            </div>

                            {/* Reason */}
                            <div
                                style={{
                                    flex: 2,
                                    fontSize: "13px",
                                    color: "var(--n700)",
                                    lineHeight: "1.5",
                                }}
                            >
                                تم {item.action.toLowerCase()} الموظف بسبب:{" "}
                                <br />
                                <span
                                    style={{
                                        fontWeight: 500,
                                        color: "var(--n900)",
                                    }}
                                >
                                    {item.reason}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mf">
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end",
                            marginTop: "20px",
                        }}
                    >
                        <button
                            type="button"
                            className="btn bp"
                            onClick={handleCloseModal}
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryModel;
