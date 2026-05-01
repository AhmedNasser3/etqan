import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import type { PlanStartConfig, PlanOrderMode } from "./hooks/useStudentPlans";

interface PlanDetail {
    id: number;
    day_number: number;
    new_memorization: string;
    review_memorization: string;
}

interface PlanStartConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (config: PlanStartConfig) => void;
    planDetails: PlanDetail[];
    planName: string;
    isLoading?: boolean;
}

const MODES: {
    key: PlanOrderMode;
    label: string;
    desc: string;
    icon: string;
}[] = [
    {
        key: "normal",
        label: "من البداية بالترتيب",
        desc: "تبدأ من اليوم الأول في الخطة وتمشي للأخير",
        icon: "▶",
    },
    {
        key: "from_day",
        label: "من يوم معين للأخير",
        desc: "تختار يوم معين تبدأ منه وتكمل للنهاية",
        icon: "⏩",
    },
    {
        key: "reverse",
        label: "بالمعكوس من الأخير",
        desc: "تبدأ من آخر يوم في الخطة وتمشي للأول",
        icon: "◀",
    },
    {
        key: "reverse_from_day",
        label: "بالمعكوس من يوم معين",
        desc: "تختار يوم وتمشي بالمعكوس منه للأول",
        icon: "⏪",
    },
];

const PlanStartConfigModal: React.FC<PlanStartConfigModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    planDetails,
    planName,
    isLoading = false,
}) => {
    const [selectedMode, setSelectedMode] = useState<PlanOrderMode>("normal");
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [previewDays, setPreviewDays] = useState<PlanDetail[]>([]);

    const needsDaySelect =
        selectedMode === "from_day" || selectedMode === "reverse_from_day";

    // ✅ حساب معاينة الترتيب
    useEffect(() => {
        if (!planDetails.length) return;

        let ordered: PlanDetail[] = [];
        const sorted = [...planDetails].sort(
            (a, b) => a.day_number - b.day_number,
        );
        const startIdx = sorted.findIndex((d) => d.day_number >= selectedDay);
        const safeIdx = startIdx === -1 ? 0 : startIdx;

        switch (selectedMode) {
            case "normal":
                ordered = sorted;
                break;
            case "reverse":
                ordered = [...sorted].reverse();
                break;
            case "from_day":
                ordered = sorted.slice(safeIdx);
                break;
            case "reverse_from_day":
                ordered = sorted.slice(0, safeIdx + 1).reverse();
                break;
        }
        setPreviewDays(ordered.slice(0, 4));
    }, [selectedMode, selectedDay, planDetails]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm({
            mode: selectedMode,
            startDay: needsDaySelect ? selectedDay : undefined,
        });
    };

    const getModeLabel = () => {
        const m = MODES.find((m) => m.key === selectedMode);
        return m?.label || "";
    };

    return (
        <div
            className="psm-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="psm-modal" dir="rtl">
                {/* Header */}
                <div className="psm-header">
                    <div>
                        <h2 className="psm-title">اختر طريقة البداية</h2>
                        <p className="psm-subtitle">{planName}</p>
                    </div>
                    <button className="psm-close" onClick={onClose}>
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Modes Grid */}
                <div className="psm-modes">
                    {MODES.map((mode) => (
                        <button
                            key={mode.key}
                            className={`psm-mode-btn ${selectedMode === mode.key ? "psm-mode-btn--active" : ""}`}
                            onClick={() => setSelectedMode(mode.key)}
                        >
                            <span className="psm-mode-icon">{mode.icon}</span>
                            <span className="psm-mode-label">{mode.label}</span>
                            <span className="psm-mode-desc">{mode.desc}</span>
                            {selectedMode === mode.key && (
                                <span className="psm-mode-check">✓</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Day Selector — يظهر فقط لو الـ mode محتاج يوم */}
                {needsDaySelect && planDetails.length > 0 && (
                    <div className="psm-day-selector">
                        <label className="psm-day-label">
                            {selectedMode === "from_day"
                                ? "ابدأ من اليوم:"
                                : "ابدأ بالمعكوس من اليوم:"}
                        </label>
                        <div className="psm-day-scroll">
                            {[...planDetails]
                                .sort((a, b) => a.day_number - b.day_number)
                                .map((detail) => (
                                    <button
                                        key={detail.id}
                                        className={`psm-day-chip ${selectedDay === detail.day_number ? "psm-day-chip--active" : ""}`}
                                        onClick={() =>
                                            setSelectedDay(detail.day_number)
                                        }
                                    >
                                        <span className="psm-day-chip__num">
                                            يوم {detail.day_number}
                                        </span>
                                        {detail.new_memorization && (
                                            <span className="psm-day-chip__text">
                                                {detail.new_memorization.substring(
                                                    0,
                                                    20,
                                                )}
                                                {detail.new_memorization
                                                    .length > 20
                                                    ? "..."
                                                    : ""}
                                            </span>
                                        )}
                                    </button>
                                ))}
                        </div>
                    </div>
                )}

                {/* Preview */}
                {previewDays.length > 0 && (
                    <div className="psm-preview">
                        <div className="psm-preview__title">
                            معاينة الترتيب — {getModeLabel()}
                            {needsDaySelect ? ` (من يوم ${selectedDay})` : ""}
                        </div>
                        <div className="psm-preview__days">
                            {previewDays.map((day, idx) => (
                                <div key={day.id} className="psm-preview__day">
                                    <span className="psm-preview__seq">
                                        جلسة {idx + 1}
                                    </span>
                                    <span className="psm-preview__daynum">
                                        يوم {day.day_number}
                                    </span>
                                    {day.new_memorization && (
                                        <span className="psm-preview__content">
                                            حفظ:{" "}
                                            {day.new_memorization.substring(
                                                0,
                                                30,
                                            )}
                                            {day.new_memorization.length > 30
                                                ? "..."
                                                : ""}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {planDetails.length > 4 && (
                                <div className="psm-preview__more">
                                    + {planDetails.length - 4} أيام أخرى...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="psm-footer">
                    <button className="psm-btn-cancel" onClick={onClose}>
                        إلغاء
                    </button>
                    <button
                        className="psm-btn-confirm"
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="psm-spinner" />
                                جاري الحجز...
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-5 h-5" />
                                تأكيد الحجز
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanStartConfigModal;
