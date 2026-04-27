import { useState, useCallback, useEffect } from "react";
import { RiRobot2Fill, RiSparklingFill } from "react-icons/ri";
import { FiCopy, FiCheck } from "react-icons/fi";
import { BsBookHalf, BsStars, BsLightning } from "react-icons/bs";
import toast from "react-hot-toast";

const SURAHS = [
    { number: 1,   name: "الفاتحة",    verses: 7,   pages: 1  },
    { number: 2,   name: "البقرة",     verses: 286, pages: 48 },
    { number: 3,   name: "آل عمران",  verses: 200, pages: 20 },
    { number: 4,   name: "النساء",     verses: 176, pages: 23 },
    { number: 5,   name: "المائدة",    verses: 120, pages: 16 },
    { number: 6,   name: "الأنعام",    verses: 165, pages: 20 },
    { number: 7,   name: "الأعراف",    verses: 206, pages: 24 },
    { number: 8,   name: "الأنفال",    verses: 75,  pages: 9  },
    { number: 9,   name: "التوبة",     verses: 129, pages: 16 },
    { number: 10,  name: "يونس",       verses: 109, pages: 11 },
    { number: 11,  name: "هود",        verses: 123, pages: 10 },
    { number: 12,  name: "يوسف",       verses: 111, pages: 12 },
    { number: 13,  name: "الرعد",      verses: 43,  pages: 7  },
    { number: 14,  name: "إبراهيم",    verses: 52,  pages: 7  },
    { number: 15,  name: "الحجر",      verses: 99,  pages: 6  },
    { number: 16,  name: "النحل",      verses: 128, pages: 11 },
    { number: 17,  name: "الإسراء",    verses: 111, pages: 12 },
    { number: 18,  name: "الكهف",      verses: 110, pages: 12 },
    { number: 19,  name: "مريم",       verses: 98,  pages: 8  },
    { number: 20,  name: "طه",         verses: 135, pages: 8  },
    { number: 21,  name: "الأنبياء",   verses: 112, pages: 8  },
    { number: 22,  name: "الحج",       verses: 78,  pages: 10 },
    { number: 23,  name: "المؤمنون",   verses: 118, pages: 7  },
    { number: 24,  name: "النور",      verses: 64,  pages: 9  },
    { number: 25,  name: "الفرقان",    verses: 77,  pages: 7  },
    { number: 26,  name: "الشعراء",    verses: 227, pages: 9  },
    { number: 27,  name: "النمل",      verses: 93,  pages: 8  },
    { number: 28,  name: "القصص",      verses: 88,  pages: 9  },
    { number: 29,  name: "العنكبوت",   verses: 69,  pages: 7  },
    { number: 30,  name: "الروم",      verses: 60,  pages: 6  },
    { number: 31,  name: "لقمان",      verses: 34,  pages: 4  },
    { number: 32,  name: "السجدة",     verses: 30,  pages: 3  },
    { number: 33,  name: "الأحزاب",    verses: 73,  pages: 9  },
    { number: 34,  name: "سبأ",        verses: 54,  pages: 6  },
    { number: 35,  name: "فاطر",       verses: 45,  pages: 5  },
    { number: 36,  name: "يس",         verses: 83,  pages: 4  },
    { number: 37,  name: "الصافات",    verses: 182, pages: 5  },
    { number: 38,  name: "ص",          verses: 88,  pages: 5  },
    { number: 39,  name: "الزمر",      verses: 75,  pages: 8  },
    { number: 40,  name: "غافر",       verses: 85,  pages: 9  },
    { number: 41,  name: "فصلت",       verses: 54,  pages: 8  },
    { number: 42,  name: "الشورى",     verses: 53,  pages: 7  },
    { number: 43,  name: "الزخرف",     verses: 89,  pages: 7  },
    { number: 44,  name: "الدخان",     verses: 59,  pages: 3  },
    { number: 45,  name: "الجاثية",    verses: 37,  pages: 4  },
    { number: 46,  name: "الأحقاف",    verses: 35,  pages: 4  },
    { number: 47,  name: "محمد",       verses: 38,  pages: 4  },
    { number: 48,  name: "الفتح",      verses: 29,  pages: 4  },
    { number: 49,  name: "الحجرات",    verses: 18,  pages: 2  },
    { number: 50,  name: "ق",          verses: 45,  pages: 3  },
    { number: 51,  name: "الذاريات",   verses: 60,  pages: 3  },
    { number: 52,  name: "الطور",      verses: 49,  pages: 2  },
    { number: 53,  name: "النجم",      verses: 62,  pages: 3  },
    { number: 54,  name: "القمر",      verses: 55,  pages: 3  },
    { number: 55,  name: "الرحمن",     verses: 78,  pages: 3  },
    { number: 56,  name: "الواقعة",    verses: 96,  pages: 3  },
    { number: 57,  name: "الحديد",     verses: 29,  pages: 5  },
    { number: 58,  name: "المجادلة",   verses: 22,  pages: 3  },
    { number: 59,  name: "الحشر",      verses: 24,  pages: 3  },
    { number: 60,  name: "الممتحنة",   verses: 13,  pages: 3  },
    { number: 61,  name: "الصف",       verses: 14,  pages: 2  },
    { number: 62,  name: "الجمعة",     verses: 11,  pages: 2  },
    { number: 63,  name: "المنافقون",  verses: 11,  pages: 2  },
    { number: 64,  name: "التغابن",    verses: 18,  pages: 2  },
    { number: 65,  name: "الطلاق",     verses: 12,  pages: 2  },
    { number: 66,  name: "التحريم",    verses: 12,  pages: 2  },
    { number: 67,  name: "الملك",      verses: 30,  pages: 2  },
    { number: 68,  name: "القلم",      verses: 52,  pages: 2  },
    { number: 69,  name: "الحاقة",     verses: 52,  pages: 2  },
    { number: 70,  name: "المعارج",    verses: 44,  pages: 2  },
    { number: 71,  name: "نوح",        verses: 28,  pages: 2  },
    { number: 72,  name: "الجن",       verses: 28,  pages: 2  },
    { number: 73,  name: "المزمل",     verses: 20,  pages: 1  },
    { number: 74,  name: "المدثر",     verses: 56,  pages: 2  },
    { number: 75,  name: "القيامة",    verses: 40,  pages: 2  },
    { number: 76,  name: "الإنسان",    verses: 31,  pages: 2  },
    { number: 77,  name: "المرسلات",   verses: 50,  pages: 2  },
    { number: 78,  name: "النبأ",      verses: 40,  pages: 1  },
    { number: 79,  name: "النازعات",   verses: 46,  pages: 1  },
    { number: 80,  name: "عبس",        verses: 42,  pages: 1  },
    { number: 81,  name: "التكوير",    verses: 29,  pages: 1  },
    { number: 82,  name: "الانفطار",   verses: 19,  pages: 1  },
    { number: 83,  name: "المطففين",   verses: 36,  pages: 1  },
    { number: 84,  name: "الانشقاق",   verses: 25,  pages: 1  },
    { number: 85,  name: "البروج",     verses: 22,  pages: 1  },
    { number: 86,  name: "الطارق",     verses: 17,  pages: 1  },
    { number: 87,  name: "الأعلى",     verses: 19,  pages: 1  },
    { number: 88,  name: "الغاشية",    verses: 26,  pages: 1  },
    { number: 89,  name: "الفجر",      verses: 30,  pages: 1  },
    { number: 90,  name: "البلد",      verses: 20,  pages: 1  },
    { number: 91,  name: "الشمس",      verses: 15,  pages: 1  },
    { number: 92,  name: "الليل",      verses: 21,  pages: 1  },
    { number: 93,  name: "الضحى",      verses: 11,  pages: 1  },
    { number: 94,  name: "الشرح",      verses: 8,   pages: 1  },
    { number: 95,  name: "التين",      verses: 8,   pages: 1  },
    { number: 96,  name: "العلق",      verses: 19,  pages: 1  },
    { number: 97,  name: "القدر",      verses: 5,   pages: 1  },
    { number: 98,  name: "البينة",     verses: 8,   pages: 1  },
    { number: 99,  name: "الزلزلة",    verses: 8,   pages: 1  },
    { number: 100, name: "العاديات",   verses: 11,  pages: 1  },
    { number: 101, name: "القارعة",    verses: 11,  pages: 1  },
    { number: 102, name: "التكاثر",    verses: 8,   pages: 1  },
    { number: 103, name: "العصر",      verses: 3,   pages: 1  },
    { number: 104, name: "الهمزة",     verses: 9,   pages: 1  },
    { number: 105, name: "الفيل",      verses: 5,   pages: 1  },
    { number: 106, name: "قريش",       verses: 4,   pages: 1  },
    { number: 107, name: "الماعون",    verses: 7,   pages: 1  },
    { number: 108, name: "الكوثر",     verses: 3,   pages: 1  },
    { number: 109, name: "الكافرون",   verses: 6,   pages: 1  },
    { number: 110, name: "النصر",      verses: 3,   pages: 1  },
    { number: 111, name: "المسد",      verses: 5,   pages: 1  },
    { number: 112, name: "الإخلاص",    verses: 4,   pages: 1  },
    { number: 113, name: "الفلق",      verses: 5,   pages: 1  },
    { number: 114, name: "الناس",      verses: 6,   pages: 1  },
];

const PAGE_OPTIONS = [
    { value: 0.5, label: "نصف صفحة",    emoji: "🌱", difficulty: "سهل جداً"   },
    { value: 1,   label: "صفحة واحدة",  emoji: "📖", difficulty: "متوسط"      },
    { value: 2,   label: "صفحتان",      emoji: "🔥", difficulty: "متقدم"      },
    { value: 3,   label: "ثلاث صفحات",  emoji: "⚡", difficulty: "مكثف"       },
    { value: 5,   label: "خمس صفحات",   emoji: "🚀", difficulty: "مكثف جداً"  },
];

// ── الاتصال بـ Laravel backend (الذي يتكلم مع Ollama) ────────
async function generatePlanWithAI(
    surah: { number: number; name: string; pages: number; verses: number },
    pagesPerDay: number,
    includeReview: boolean,
) {
    const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

    const response = await fetch("/api/v1/platform-plans/ai-generate", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type":     "application/json",
            Accept:             "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN":     csrfToken,
        },
        body: JSON.stringify({
            surah_number:      surah.number,
            pages_per_day:     pagesPerDay,
            include_review:    includeReview,
            save_to_platform:  false,
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as any).message || "فشل الاتصال بالخادم");
    }

    const data = await response.json();
    return { plan: data.plan, engine: data.ai_engine };
}

// ── فحص حالة سيرفر AI ────────────────────────────────────────
async function checkAIHealth(): Promise<"ok" | "offline"> {
    try {
        const res = await fetch("/api/v1/platform-plans/ai-health", { credentials: "include" });
        return res.ok ? "ok" : "offline";
    } catch {
        return "offline";
    }
}

// ══════════════════════════════════════════════════════════════
//  المكوّن الرئيسي
// ══════════════════════════════════════════════════════════════
export default function AIPlanGenerator({
    onPlanGenerated,
}: {
    onPlanGenerated?: (data: any) => void;
}) {
    const [step, setStep]                     = useState(1);
    const [selectedSurah, setSelectedSurah]   = useState<(typeof SURAHS)[0] | null>(null);
    const [pagesPerDay, setPagesPerDay]        = useState(1);
    const [includeReview, setIncludeReview]    = useState(true);
    const [searchQuery, setSearchQuery]        = useState("");
    const [generatedPlan, setGeneratedPlan]    = useState<any>(null);
    const [aiEngine, setAiEngine]              = useState<string | null>(null);
    const [loading, setLoading]                = useState(false);
    const [error, setError]                    = useState<string | null>(null);
    const [copiedDay, setCopiedDay]            = useState<number | null>(null);
    const [aiStatus, setAiStatus]             = useState<"ok" | "offline" | "checking">("checking");

    // فحص سيرفر AI عند التحميل
    useEffect(() => {
        checkAIHealth().then(setAiStatus);
    }, []);

    const filteredSurahs = SURAHS.filter(
        (s) => s.name.includes(searchQuery) || String(s.number).includes(searchQuery),
    );

    const estimatedDays = selectedSurah ? Math.ceil(selectedSurah.pages / pagesPerDay) : 0;

    const handleGenerate = useCallback(async () => {
        if (!selectedSurah) return;
        setLoading(true);
        setError(null);
        setGeneratedPlan(null);
        try {
            const { plan, engine } = await generatePlanWithAI(selectedSurah, pagesPerDay, includeReview);
            setGeneratedPlan(plan);
            setAiEngine(engine);
            setStep(3);
        } catch (e: any) {
            setError(e.message || "حدث خطأ في توليد الخطة. تأكد من تشغيل: python ai_service.py");
        } finally {
            setLoading(false);
        }
    }, [selectedSurah, pagesPerDay, includeReview]);

    const handleCopyDay = (day: any, idx: number) => {
        const text = `اليوم ${day.day}: ${day.new_memorization}${
            day.review_memorization ? " | مراجعة: " + day.review_memorization : ""
        }`;
        navigator.clipboard.writeText(text);
        setCopiedDay(idx);
        setTimeout(() => setCopiedDay(null), 1500);
    };

    const handleSavePlan = () => {
        if (onPlanGenerated && generatedPlan) {
            onPlanGenerated({ surah: selectedSurah, plan: generatedPlan, pagesPerDay });
            toast.success("✅ تم حفظ الخطة وإرسالها للمنصة!");
        }
    };

    // ── مؤشر حالة AI ─────────────────────────────────────────
    const AIStatusBadge = () => (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: aiStatus === "ok" ? "rgba(52,211,153,0.1)" : aiStatus === "offline" ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${aiStatus === "ok" ? "rgba(52,211,153,0.3)" : aiStatus === "offline" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
            padding: "4px 12px", borderRadius: 20, fontSize: 11,
            color: aiStatus === "ok" ? "#34d399" : aiStatus === "offline" ? "#fca5a5" : "#94a3b8",
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
            {aiStatus === "ok" ? "Ollama — مجاني 100%" : aiStatus === "offline" ? "سيرفر AI غير متصل" : "جاري الفحص..."}
        </div>
    );

    return (
        <div dir="rtl" style={{
            fontFamily: "'Cairo', 'Amiri', sans-serif",
            background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
            minHeight: "100vh", color: "#fff", padding: "24px 16px",
        }}>
            {/* ── Header ── */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 12,
                        background: "rgba(255,255,255,0.08)", padding: "10px 24px",
                        borderRadius: 50, border: "1px solid rgba(255,255,255,0.15)",
                    }}>
                        <RiRobot2Fill size={22} color="#a78bfa" />
                        <span style={{ fontSize: 14, color: "#c4b5fd", letterSpacing: 1 }}>
                            مولّد خطط الحفظ الذكي
                        </span>
                        <BsStars size={18} color="#fbbf24" />
                    </div>
                    <AIStatusBadge />
                </div>

                <h1 style={{
                    fontSize: 28, fontWeight: 800,
                    background: "linear-gradient(90deg, #a78bfa, #60a5fa, #34d399)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0,
                }}>
                    منصة إتقان - خطط القرآن الكريم
                </h1>
                <p style={{ color: "#94a3b8", marginTop: 8, fontSize: 14 }}>
                    604 صفحة · 114 سورة · مُولَّد بـ Ollama — مفتوح المصدر
                </p>

                {/* Steps */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                    {["اختر السورة", "إعدادات الخطة", "الخطة الذكية"].map((s, i) => (
                        <div key={i} onClick={() => step > i + 1 && setStep(i + 1)} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "6px 14px", borderRadius: 20,
                            background: step === i + 1 ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${step === i + 1 ? "#a78bfa" : "rgba(255,255,255,0.1)"}`,
                            fontSize: 12, color: step === i + 1 ? "#c4b5fd" : "#64748b",
                            cursor: step > i + 1 ? "pointer" : "default", transition: "all 0.3s",
                        }}>
                            <span style={{
                                width: 20, height: 20, borderRadius: "50%",
                                background: step > i + 1 ? "#34d399" : step === i + 1 ? "#a78bfa" : "#334155",
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 700, color: "#fff",
                            }}>
                                {step > i + 1 ? "✓" : i + 1}
                            </span>
                            {s}
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════ STEP 1 ══════════════ */}
            {step === 1 && (
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                    <div style={{
                        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center",
                        gap: 10, marginBottom: 16,
                    }}>
                        <span style={{ fontSize: 18 }}>🔍</span>
                        <input
                            placeholder="ابحث عن سورة... (مثال: البقرة أو 2)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 15, flex: 1, textAlign: "right" }}
                        />
                    </div>

                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                        gap: 8, maxHeight: 450, overflowY: "auto", paddingLeft: 4,
                    }}>
                        {filteredSurahs.map((surah) => (
                            <div key={surah.number} onClick={() => { setSelectedSurah(surah); setStep(2); }}
                                style={{
                                    background: selectedSurah?.number === surah.number
                                        ? "linear-gradient(135deg, rgba(167,139,250,0.3), rgba(96,165,250,0.2))"
                                        : "rgba(255,255,255,0.05)",
                                    border: `1px solid ${selectedSurah?.number === surah.number ? "#a78bfa" : "rgba(255,255,255,0.08)"}`,
                                    borderRadius: 12, padding: "12px 10px", cursor: "pointer",
                                    textAlign: "center", transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(167,139,250,0.15)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = selectedSurah?.number === surah.number
                                    ? "linear-gradient(135deg, rgba(167,139,250,0.3), rgba(96,165,250,0.2))"
                                    : "rgba(255,255,255,0.05)")}
                            >
                                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>{surah.number}</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{surah.name}</div>
                                <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 10, color: "#7dd3fc", background: "rgba(96,165,250,0.15)", padding: "2px 6px", borderRadius: 10 }}>
                                        📖 {surah.pages}ص
                                    </span>
                                    <span style={{ fontSize: 10, color: "#86efac", background: "rgba(52,211,153,0.15)", padding: "2px 6px", borderRadius: 10 }}>
                                        🔢 {surah.verses}آية
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════════════ STEP 2 ══════════════ */}
            {step === 2 && selectedSurah && (
                <div style={{ maxWidth: 580, margin: "0 auto" }}>
                    <div style={{
                        background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(96,165,250,0.1))",
                        border: "1px solid rgba(167,139,250,0.3)", borderRadius: 16, padding: 20,
                        marginBottom: 20, textAlign: "center",
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📿</div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#c4b5fd", margin: "0 0 8px" }}>
                            سورة {selectedSurah.name}
                        </h2>
                        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                            <span style={{ color: "#7dd3fc", fontSize: 14 }}>📖 {selectedSurah.pages} صفحة</span>
                            <span style={{ color: "#86efac", fontSize: 14 }}>🔢 {selectedSurah.verses} آية</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16, color: "#94a3b8", marginBottom: 12, fontWeight: 600 }}>
                            ⚡ كم صفحة تريد حفظها يومياً؟
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {PAGE_OPTIONS.map((opt) => (
                                <div key={opt.value} onClick={() => setPagesPerDay(opt.value)} style={{
                                    background: pagesPerDay === opt.value
                                        ? "linear-gradient(135deg, rgba(167,139,250,0.25), rgba(96,165,250,0.15))"
                                        : "rgba(255,255,255,0.04)",
                                    border: `2px solid ${pagesPerDay === opt.value ? "#a78bfa" : "rgba(255,255,255,0.08)"}`,
                                    borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    transition: "all 0.2s",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{opt.label}</div>
                                            <div style={{ fontSize: 11, color: "#64748b" }}>{opt.difficulty}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontSize: 11, color: "#94a3b8", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 10 }}>
                                            {Math.ceil(selectedSurah.pages / opt.value)} يوم
                                        </div>
                                    </div>
                                    {pagesPerDay === opt.value && <span style={{ fontSize: 18, marginLeft: 8 }}>✅</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Toggle المراجعة */}
                    <div style={{
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12, padding: "14px 16px", display: "flex",
                        justifyContent: "space-between", alignItems: "center", marginBottom: 24,
                    }}>
                        <div>
                            <div style={{ fontWeight: 700, color: "#e2e8f0" }}>📝 تضمين المراجعة اليومية</div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>مراجعة ما تم حفظه في الأيام السابقة</div>
                        </div>
                        <div onClick={() => setIncludeReview(!includeReview)} style={{
                            width: 48, height: 26, borderRadius: 13,
                            background: includeReview ? "#a78bfa" : "#334155",
                            cursor: "pointer", position: "relative", transition: "all 0.3s",
                        }}>
                            <div style={{
                                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                                position: "absolute", top: 3,
                                right: includeReview ? 3 : "auto", left: includeReview ? "auto" : 3,
                                transition: "all 0.3s",
                            }} />
                        </div>
                    </div>

                    {/* تنبيه لو سيرفر AI offline */}
                    {aiStatus === "offline" && (
                        <div style={{
                            marginBottom: 16, padding: 12, borderRadius: 10,
                            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                            color: "#fca5a5", fontSize: 12, textAlign: "center",
                        }}>
                            ⚠️ سيرفر AI غير متصل — شغّل:{" "}
                            <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4 }}>
                                python ai_service.py
                            </code>
                        </div>
                    )}

                    <div style={{
                        background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
                        borderRadius: 12, padding: 14, marginBottom: 20, textAlign: "center",
                    }}>
                        <div style={{ color: "#34d399", fontSize: 13 }}>
                            ✨ ستحفظ سورة <strong>{selectedSurah.name}</strong> في{" "}
                            <strong>{estimatedDays} يوم</strong> ({Math.ceil(estimatedDays / 7)} أسبوع تقريباً)
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => setStep(1)} style={{
                            flex: 1, padding: "12px 0", borderRadius: 12,
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "#94a3b8", cursor: "pointer", fontSize: 14,
                        }}>
                            ← تغيير السورة
                        </button>
                        <button onClick={handleGenerate} disabled={loading} style={{
                            flex: 2, padding: "12px 0", borderRadius: 12,
                            background: loading ? "rgba(167,139,250,0.3)" : "linear-gradient(135deg, #7c3aed, #2563eb)",
                            border: "none", color: "#fff",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: 15, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
                        }}>
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 16, height: 16, borderRadius: "50%",
                                        border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                                        animation: "spin 0.8s linear infinite",
                                    }} />
                                    الذكاء يولّد خطتك...
                                </>
                            ) : (
                                <>
                                    <RiRobot2Fill size={18} />
                                    ولّد خطتي بـ Ollama
                                    <BsLightning size={16} />
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div style={{
                            marginTop: 12, padding: 12, borderRadius: 10,
                            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                            color: "#fca5a5", fontSize: 13, textAlign: "center",
                        }}>
                            ❌ {error}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════ STEP 3 ══════════════ */}
            {step === 3 && generatedPlan && (
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                    <div style={{
                        background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(167,139,250,0.1))",
                        border: "1px solid rgba(52,211,153,0.3)", borderRadius: 16, padding: 20, marginBottom: 20,
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                                    <div style={{
                                        display: "inline-flex", alignItems: "center", gap: 6,
                                        background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)",
                                        padding: "4px 12px", borderRadius: 20,
                                    }}>
                                        <RiSparklingFill size={14} color="#34d399" />
                                        <span style={{ fontSize: 11, color: "#34d399" }}>مُولَّد بالذكاء الاصطناعي</span>
                                    </div>
                                    {aiEngine && (
                                        <div style={{
                                            display: "inline-flex", alignItems: "center", gap: 6,
                                            background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)",
                                            padding: "4px 12px", borderRadius: 20,
                                        }}>
                                            <span style={{ fontSize: 11, color: "#7dd3fc" }}>🔓 {aiEngine} — مجاني</span>
                                        </div>
                                    )}
                                </div>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", margin: "0 0 6px" }}>
                                    {generatedPlan.title}
                                </h2>
                                <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>{generatedPlan.summary}</p>
                            </div>
                            <div style={{
                                textAlign: "center", background: "rgba(167,139,250,0.15)",
                                padding: "10px 16px", borderRadius: 12, border: "1px solid rgba(167,139,250,0.25)",
                            }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa" }}>{generatedPlan.total_days}</div>
                                <div style={{ fontSize: 11, color: "#64748b" }}>يوم</div>
                            </div>
                        </div>
                        {generatedPlan.advice && (
                            <div style={{
                                marginTop: 14, padding: "10px 14px", borderRadius: 10,
                                background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
                                fontSize: 13, color: "#fde68a",
                            }}>
                                💡 <strong>نصيحة:</strong> {generatedPlan.advice}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                        <button onClick={() => { setStep(2); setGeneratedPlan(null); }} style={{
                            padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8",
                            cursor: "pointer", fontSize: 13,
                        }}>
                            🔄 إعادة التوليد
                        </button>
                        <button onClick={handleSavePlan} style={{
                            padding: "10px 20px", borderRadius: 10,
                            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                            border: "none", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
                            display: "flex", alignItems: "center", gap: 6,
                        }}>
                            <BsBookHalf size={14} />
                            حفظ في المنصة
                        </button>
                    </div>

                    {/* جدول الأيام */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
                        <div style={{
                            background: "rgba(255,255,255,0.05)", padding: "12px 16px",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            display: "grid", gridTemplateColumns: "60px 1fr 1fr 80px",
                            gap: 8, fontSize: 11, color: "#64748b", fontWeight: 700,
                        }}>
                            <span>اليوم</span>
                            <span>الحفظ الجديد</span>
                            <span>المراجعة</span>
                            <span style={{ textAlign: "center" }}>نسخ</span>
                        </div>
                        <div style={{ maxHeight: 420, overflowY: "auto" }}>
                            {(generatedPlan.days || []).map((day: any, idx: number) => (
                                <div key={idx} style={{
                                    display: "grid", gridTemplateColumns: "60px 1fr 1fr 80px",
                                    gap: 8, padding: "12px 16px",
                                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                                    alignItems: "center", transition: "background 0.2s",
                                }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%",
                                        background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 12, fontWeight: 700, color: "#a78bfa",
                                    }}>
                                        {day.day}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>
                                            {day.new_memorization}
                                        </div>
                                        {day.notes && (
                                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                                                💡 {day.notes}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#7dd3fc" }}>
                                        {day.review_memorization || "—"}
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <button onClick={() => handleCopyDay(day, idx)} style={{
                                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                                            color: copiedDay === idx ? "#34d399" : "#64748b", transition: "all 0.2s",
                                        }}>
                                            {copiedDay === idx ? <FiCheck size={13} /> : <FiCopy size={13} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
                ::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.3); border-radius: 2px; }
            `}</style>
        </div>
    );
}
