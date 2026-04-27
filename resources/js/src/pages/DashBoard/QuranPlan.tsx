// QuranPlan.tsx - الكامل والمحدث
import React, { useState } from "react";
import "./QuranPlan.scss";

interface Surah {
    id: number;
    name: string;
    ayat: number;
    pages: number;
}

interface PlanResult {
    totalAyat: number;
    totalPages: number;
    totalDays: number;
    months: number;
    weeks: number;
    dailyTarget: number;
    dailyReview: number;
    mode: "khattam" | "surah";
    surahs: Surah[];
    suggestions: number[];
}

const QuranPlan: React.FC = () => {
    const [mode, setMode] = useState<"khattam" | "surah">("khattam");
    const [targetMonths, setTargetMonths] = useState(6);
    const [surahInput, setSurahInput] = useState("");
    const [result, setResult] = useState<PlanResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // إصلاح بيانات السور - إضافة pages للكل
    const quranData: Surah[] = [
        { id: 1, name: "الفاتحة", ayat: 7, pages: 2 },
        { id: 2, name: "البقرة", ayat: 286, pages: 48 },
        { id: 3, name: "آل عمران", ayat: 200, pages: 27 },
        { id: 4, name: "النساء", ayat: 176, pages: 23 },
        { id: 5, name: "المائدة", ayat: 120, pages: 13 },
        { id: 6, name: "الأنعام", ayat: 165, pages: 20 },
        { id: 7, name: "الأعراف", ayat: 206, pages: 24 },
        { id: 8, name: "الأنفال", ayat: 75, pages: 10 },
        { id: 9, name: "التوبة", ayat: 129, pages: 16 },
        { id: 10, name: "يونس", ayat: 109, pages: 12 },
        { id: 18, name: "الكهف", ayat: 110, pages: 12 },
        { id: 36, name: "يس", ayat: 83, pages: 10 },
        { id: 55, name: "الرحمن", ayat: 78, pages: 5 },
        { id: 78, name: "النبأ", ayat: 40, pages: 4 },
        { id: 112, name: "الإخلاص", ayat: 4, pages: 1 },
        { id: 113, name: "الفلق", ayat: 5, pages: 1 },
        { id: 114, name: "الناس", ayat: 6, pages: 1 },
    ];

    const FULL_QURAN: Surah = {
        id: 0,
        name: "ختم القرآن الكريم",
        ayat: 6236,
        pages: 604,
    };

    const findSurahs = (input: string): Surah[] => {
        if (!input.trim()) return [];

        const parts = input
            .trim()
            .split(/[\s,\n]+/)
            .filter(Boolean);
        const found: Surah[] = [];

        parts.forEach((part) => {
            let surah = quranData.find((s) =>
                s.name.toLowerCase().includes(part.toLowerCase()),
            );

            if (surah) {
                found.push(surah);
                return;
            }

            const id = parseInt(part);
            if (!isNaN(id)) {
                surah = quranData.find((s) => s.id === id);
                if (surah) found.push(surah);
            }
        });

        return found;
    };

    const generateSuggestions = (totalPages: number): number[] => {
        const base = Math.ceil(totalPages / (targetMonths * 30));
        return [
            0.5, // نصف وجه
            base,
            Math.ceil(base * 1.2),
            Math.ceil(base * 1.5),
        ];
    };

    const calculateKhattamPlan = () => {
        const totalDays = targetMonths * 30;
        const suggestions = generateSuggestions(FULL_QURAN.pages);

        setResult({
            mode: "khattam",
            surahs: [FULL_QURAN],
            totalAyat: FULL_QURAN.ayat,
            totalPages: FULL_QURAN.pages,
            totalDays,
            months: targetMonths,
            weeks: Math.ceil(totalDays / 7),
            dailyTarget: suggestions[1],
            dailyReview: suggestions[1] / 2,
            suggestions,
        });
    };

    const calculateSurahPlan = () => {
        const surahs = findSurahs(surahInput);
        if (surahs.length === 0) {
            setError(
                "لم يتم العثور على السور. جرب: الفاتحة، البقرة، الكهف، 18",
            );
            return;
        }

        const totalPages = surahs.reduce((sum, s) => sum + s.pages, 0);
        const totalAyat = surahs.reduce((sum, s) => sum + s.ayat, 0);
        const suggestions = generateSuggestions(totalPages);

        setResult({
            mode: "surah",
            surahs,
            totalAyat,
            totalPages,
            totalDays: Math.ceil(totalPages / suggestions[1]),
            months: Math.ceil(totalPages / suggestions[1] / 30),
            weeks: Math.ceil(totalPages / suggestions[1] / 7),
            dailyTarget: suggestions[1],
            dailyReview: suggestions[1] / 2,
            suggestions,
        });
    };

    const calculatePlan = () => {
        if (mode === "surah" && !surahInput.trim()) {
            setError("أدخل اسم السورة");
            return;
        }
        if (targetMonths < 1 || targetMonths > 24) {
            setError("الشهور بين 1 و24");
            return;
        }

        setError("");
        setLoading(true);

        setTimeout(() => {
            mode === "khattam" ? calculateKhattamPlan() : calculateSurahPlan();
            setLoading(false);
        }, 800);
    };

    const selectDailyTarget = (target: number) => {
        if (!result) return;

        const totalDays = Math.ceil(result.totalPages / target);
        const months = Math.ceil(totalDays / 30);
        const weeks = Math.ceil(totalDays / 7);

        setResult({
            ...result,
            dailyTarget: target,
            dailyReview: target / 2,
            totalDays,
            months,
            weeks,
        });
    };

    return (
        <div className="quran-plan">
            <div className="plan-container">
                <h1 className="plan-title">📖 خطة حفظ القرآن الذكية</h1>

                {/* Mode Selector */}
                <div className="mode-selector">
                    <button
                        className={`mode-btn ${mode === "khattam" ? "active" : ""}`}
                        onClick={() => {
                            setMode("khattam");
                            setSurahInput("");
                            setError("");
                        }}
                    >
                        🎯 ختم القرآن
                    </button>
                    <button
                        className={`mode-btn ${mode === "surah" ? "active" : ""}`}
                        onClick={() => {
                            setMode("surah");
                            setTargetMonths(6);
                            setError("");
                        }}
                    >
                        📚 سور محددة
                    </button>
                </div>

                {/* Input Section */}
                <div className="input-section">
                    {mode === "khattam" ? (
                        <div className="khattam-input">
                            <label>عايز تختم في كام شهر؟</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    className="months-input"
                                    min="1"
                                    max="24"
                                    value={targetMonths}
                                    onChange={(e) =>
                                        setTargetMonths(Number(e.target.value))
                                    }
                                />
                                <span>شهر</span>
                            </div>
                        </div>
                    ) : (
                        <div className="surah-input-group">
                            <input
                                type="text"
                                className="surah-input"
                                placeholder="الفاتحة، البقرة، الكهف، 18 36"
                                value={surahInput}
                                onChange={(e) => setSurahInput(e.target.value)}
                            />
                            <small>
                                اكتب أسماء السور أو أرقامها مفصولة بمسافة أو
                                فاصلة
                            </small>
                        </div>
                    )}

                    <button
                        className="calculate-btn"
                        onClick={calculatePlan}
                        disabled={loading}
                    >
                        {loading ? "⏳ جاري الحساب..." : "احسب الخطة الذكية"}
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        <span>❌ {error}</span>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="result-container">
                        <div className="info-section">
                            <div className="total-stats">
                                <div className="stat">
                                    <span className="stat-number">
                                        {result.totalPages.toLocaleString()}
                                    </span>
                                    <span>صفحة كلية</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">
                                        {result.totalDays}
                                    </span>
                                    <span>أيام</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">
                                        {result.months}
                                    </span>
                                    <span>شهور</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">
                                        {result.totalAyat.toLocaleString()}
                                    </span>
                                    <span>آية</span>
                                </div>
                            </div>

                            {result.mode === "surah" &&
                                result.surahs.length > 0 && (
                                    <div className="surahs-preview">
                                        <h4>السور المختارة:</h4>
                                        <div className="surahs-list">
                                            {result.surahs.map((s) => (
                                                <div
                                                    key={s.id}
                                                    className="surah-item"
                                                >
                                                    <strong>{s.name}</strong>
                                                    <span>
                                                        {s.pages} صفحة •{" "}
                                                        {s.ayat} آية
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Suggestions */}
                        <div className="suggestions-section">
                            <h4>🎯 اختر هدفك اليومي (صفحة):</h4>
                            <div className="suggestions-grid">
                                {result.suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className={`suggestion-btn ${Math.abs(result.dailyTarget - suggestion) < 0.1 ? "active" : ""}`}
                                        onClick={() =>
                                            selectDailyTarget(suggestion)
                                        }
                                    >
                                        {suggestion === 0.5
                                            ? "نصف صفحة"
                                            : `${suggestion} صفحة`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Final Plan */}
                        <div className="final-plan">
                            <div className="plan-header">
                                <h3> خطتك اليومية النهائية</h3>
                            </div>
                            <div className="daily-target-display">
                                <div className="target-main">
                                    <span className="target-number">
                                        {result.dailyTarget} صفحة
                                    </span>
                                    <span className="target-label">
                                        حفظ يومي
                                    </span>
                                </div>
                                <div className="review-target">
                                    +{" "}
                                    <span className="review-number">
                                        {result.dailyReview} صفحة
                                    </span>{" "}
                                    مراجعة
                                </div>
                            </div>
                            <div className="plan-details">
                                <div className="detail-item">
                                    <span>⏰ الوقت المطلوب:</span>
                                    <strong>45-60 دقيقة يومياً</strong>
                                </div>
                                <div className="detail-item">
                                    <span>💡 طريقة الحفظ:</span>
                                    <strong>كرر كل صفحة 7-10 مرات</strong>
                                </div>
                                <div className="detail-item">
                                    <span>📖 المراجعة:</span>
                                    <strong>
                                        ابدأ من اليوم الثاني + راجع يومياً
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuranPlan;
