// UserProgress.tsx
import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { RiRobot2Fill } from "react-icons/ri";
import Medals from "../widgets/medals";

// ── Types ─────────────────────────────────────────────────────────────────
interface LessonNote {
    id: number;
    attendance_date: string;
    note: string | null;
    rating: number;
    surah_name: string;
    new_memorization: string | null;
    review_memorization: string | null;
}

interface ProgressData {
    success: boolean;
    overall_progress: number;
    lessons: LessonNote[];
}

// ── Hook ──────────────────────────────────────────────────────────────────
const useStudentProgress = () => {
    const [data, setData] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true);
                setError(null);

                await fetch("/sanctum/csrf-cookie", {
                    method: "GET",
                    credentials: "include",
                });

                const metaToken = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content");
                const getCookie = (name: string): string | null => {
                    const parts = `; ${document.cookie}`.split(`; ${name}=`);
                    return parts.length === 2
                        ? parts.pop()?.split(";").shift() || null
                        : null;
                };
                const csrfToken =
                    metaToken ||
                    getCookie("XSRF-TOKEN") ||
                    getCookie("csrf-token");

                const sessionRes = await fetch("/api/user", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
                    },
                });
                const sessionData = await sessionRes.json();
                const userId = sessionData.id || sessionData.user?.id;
                if (!userId) throw new Error("غير مسجل دخول");

                const res = await fetch("/api/v1/user/progress", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
                    },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const result: ProgressData = await res.json();
                if (result.success) setData(result);
                else setError("خطأ في جلب البيانات");
            } catch (err: any) {
                setError(err.message || "حدث خطأ في جلب بيانات التقدم");
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    return { data, loading, error };
};

// ── Helpers ───────────────────────────────────────────────────────────────
const avgRating = (lessons: LessonNote[]) => {
    if (!lessons.length) return 0;
    const sum = lessons.reduce((a, l) => a + (Number(l.rating) || 0), 0);
    return sum / lessons.length;
};

const statusFromProgress = (pct: number) => {
    if (pct >= 80)
        return { label: "ممتاز 🌟", color: "#059669", bg: "#d1fae5" };
    if (pct >= 60)
        return { label: "جيد جداً ✨", color: "#0369a1", bg: "#dbeafe" };
    if (pct >= 40) return { label: "جيد 👍", color: "#7c3aed", bg: "#ede9fe" };
    return { label: "يحتاج جهد 💪", color: "#b45309", bg: "#fef3c7" };
};

// ── Sub-components ────────────────────────────────────────────────────────
const PBar = ({
    pct,
    h = 6,
    color = "var(--g500)",
}: {
    pct: number;
    h?: number;
    color?: string;
}) => (
    <div
        style={{
            height: h,
            background: "var(--n100)",
            borderRadius: 100,
            overflow: "hidden",
        }}
    >
        <div
            style={{
                height: "100%",
                width: `${Math.min(pct, 100)}%`,
                background: color,
                borderRadius: 100,
                transition: "width .8s cubic-bezier(.16,1,.3,1)",
            }}
        />
    </div>
);

const WG = ({
    children,
    style,
}: {
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => (
    <div className="widget" style={style}>
        {children}
    </div>
);

const WH = ({ t, right }: { t: string; right?: React.ReactNode }) => (
    <div className="wh">
        <span className="wh-t">{t}</span>
        {right}
    </div>
);

const StarRow = ({ rating }: { rating: number }) => {
    const filled = Math.round(Number(rating) || 0);
    return (
        <div style={{ display: "flex", gap: 2 }}>
            {Array(5)
                .fill(0)
                .map((_, i) => (
                    <FaStar
                        key={i}
                        style={{
                            fontSize: 13,
                            color: i < filled ? "#f59e0b" : "#e2e8f0",
                        }}
                    />
                ))}
        </div>
    );
};

const Skeleton = ({
    h = 16,
    r = 8,
    w = "100%",
}: {
    h?: number;
    r?: number;
    w?: string;
}) => (
    <div
        style={{
            height: h,
            borderRadius: r,
            width: w,
            background:
                "linear-gradient(90deg,#f0f0ef 25%,#e4e4e3 50%,#f0f0ef 75%)",
            backgroundSize: "200% 100%",
            animation: "up-shimmer 1.4s infinite",
        }}
    />
);

const Empty = ({ icon, title }: { icon: string; title: string }) => (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 20px",
            color: "var(--n400)",
        }}
    >
        <span style={{ fontSize: 40, marginBottom: 10 }}>{icon}</span>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
    </div>
);

// ── Status chip ────────────────────────────────────────────────────────────
const Chip = ({
    label,
    color,
    bg,
}: {
    label: string;
    color: string;
    bg: string;
}) => (
    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: bg,
            color,
        }}
    >
        {label}
    </span>
);

// ── Main ──────────────────────────────────────────────────────────────────
const UserProgress: React.FC = () => {
    const { data, loading, error } = useStudentProgress();

    const progress = data?.overall_progress ?? 0;
    const lessons = data?.lessons ?? [];
    const avg = avgRating(lessons);
    const status = statusFromProgress(progress);

    // وهمي — متوسط النجوم المملوء
    const filledAvg = Math.round(avg);

    return (
        <>
            <style>{`
                @keyframes up-shimmer { to { background-position: -200% 0; } }
                @keyframes up-rise    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
                @keyframes up-pulse   { 0%,100%{opacity:1} 50%{opacity:.45} }
                @keyframes up-grow    { from { width:0% } }

                .up-card {
                    background: #fff;
                    border-radius: 18px;
                    box-shadow: 0 2px 16px rgba(0,0,0,.05);
                    overflow: hidden;
                    animation: up-rise .5s cubic-bezier(.16,1,.3,1) both;
                }
                .up-grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 16px; margin-bottom: 16px; }
                .up-grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px,1fr)); gap: 12px; margin-bottom: 16px; }

                .up-mini-card {
                    background: var(--n50, #f8fafc);
                    border: 1px solid var(--n200, #e2e8f0);
                    border-radius: 14px;
                    padding: 14px 16px;
                    animation: up-rise .5s cubic-bezier(.16,1,.3,1) both;
                }
                .up-mini-lbl { font-size: 10.5px; color: var(--n400,#94a3b8); font-weight: 600; margin-bottom: 4px; }
                .up-mini-val { font-size: 22px; font-weight: 900; color: var(--n900,#0f172a); line-height: 1; }

                .up-lesson-row {
                    display: flex; gap: 12px; align-items: flex-start;
                    padding: 12px 0; border-bottom: 1px solid var(--n100,#f1f5f9);
                    transition: background .15s;
                }
                .up-lesson-row:last-child { border-bottom: none; }
                .up-lesson-row:hover { background: #f8fffe; border-radius: 10px; padding: 12px 8px; margin: 0 -8px; }

                .up-day-badge {
                    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
                    background: linear-gradient(135deg, #0f6e56, #1a9e7a);
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; font-size: 11px; font-weight: 800;
                }
                .up-lesson-body { flex: 1; min-width: 0; }
                .up-lesson-title { font-size: 13px; font-weight: 700; color: var(--n900,#0f172a); margin-bottom: 2px; }
                .up-lesson-sub   { font-size: 11px; color: var(--n400,#94a3b8); }
                .up-lesson-mem   { font-size: 11.5px; color: var(--g700,#047857); font-weight: 600; margin-top: 3px; }
                .up-lesson-note  { font-size: 11px; color: var(--n600,#475569); font-style: italic; margin-top: 3px; }

                .up-note-row {
                    display: flex; gap: 10px; align-items: flex-start;
                    padding: 10px 0; border-bottom: 1px solid var(--n100,#f1f5f9);
                }
                .up-note-row:last-child { border-bottom: none; }
                .up-note-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--g400,#34d399); flex-shrink: 0; margin-top: 5px; }

                .up-progress-ring-wrap { position: relative; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; width: 120px; height: 120px; }
                .up-progress-ring-num  { position: absolute; font-size: 26px; font-weight: 900; color: var(--g600,#059669); }

                .up-encourage {
                    background: linear-gradient(135deg,#fefce8,#fef9c3);
                    border: 1px solid #fcd34d;
                    border-radius: 14px;
                    padding: 14px 18px;
                    display: flex; align-items: center; gap: 14px;
                    margin-bottom: 16px;
                    animation: up-rise .4s both;
                }
            `}</style>

            <div className="content">
                <div className="page-body">
                    {/* ── Error ── */}
                    {error && (
                        <div
                            style={{
                                background: "#fff5f5",
                                border: "1px solid #fecaca",
                                borderRadius: 12,
                                padding: "12px 16px",
                                color: "#7f1d1d",
                                fontSize: 13,
                                fontWeight: 600,
                                marginBottom: 16,
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    {/* ── رسالة تشجيعية ── */}
                    <div className="up-encourage">
                        <span style={{ fontSize: 28 }}>🏆</span>
                        <div>
                            <div
                                style={{
                                    fontWeight: 800,
                                    fontSize: 13,
                                    color: "#92400e",
                                }}
                            >
                                {loading
                                    ? "جاري تحميل تقدمك..."
                                    : progress >= 50
                                      ? "تقدم رائع! استمر في التفوق"
                                      : "أنت في الطريق الصحيح، لا تتوقف!"}
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#b45309",
                                    marginTop: 2,
                                }}
                            >
                                كل حصة تقربك من الهدف الكبير
                            </div>
                        </div>
                    </div>

                    {/* ── الأوسمة ── */}
                    <Medals />

                    {/* ── Mini stats ── */}
                    <div className="up-grid3">
                        {[
                            {
                                lbl: "عدد الحصص",
                                val: loading ? "—" : String(lessons.length),
                                delay: ".05s",
                            },
                            {
                                lbl: "نسبة الإنجاز",
                                val: loading ? "—" : `${progress}%`,
                                delay: ".1s",
                            },
                            {
                                lbl: "متوسط التقييم",
                                val: loading ? "—" : `${avg.toFixed(1)} ★`,
                                delay: ".15s",
                            },
                            {
                                lbl: "حصص مكتملة",
                                val: loading
                                    ? "—"
                                    : String(
                                          lessons.filter((l) => l.rating >= 3)
                                              .length,
                                      ),
                                delay: ".2s",
                            },
                        ].map((m, i) => (
                            <div
                                key={i}
                                className="up-mini-card"
                                style={{ animationDelay: m.delay }}
                            >
                                <div className="up-mini-lbl">{m.lbl}</div>
                                {loading ? (
                                    <Skeleton h={22} w="60%" r={6} />
                                ) : (
                                    <div className="up-mini-val">{m.val}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="up-grid2">
                        {/* ── مستوى التقدم ── */}
                        <div
                            className="up-card"
                            style={{ animationDelay: ".1s" }}
                        >
                            <div className="wh">
                                <span className="wh-t">مستوى التقدم</span>
                            </div>
                            <div className="wb">
                                {loading ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 12,
                                        }}
                                    >
                                        <Skeleton h={100} r={12} />
                                        <Skeleton h={12} r={8} />
                                        <Skeleton h={40} r={10} />
                                    </div>
                                ) : (
                                    <>
                                        {/* Ring */}
                                        <div className="up-progress-ring-wrap">
                                            <svg
                                                width="120"
                                                height="120"
                                                style={{
                                                    transform: "rotate(-90deg)",
                                                }}
                                            >
                                                <circle
                                                    cx="60"
                                                    cy="60"
                                                    r="50"
                                                    fill="none"
                                                    stroke="#e2e8f0"
                                                    strokeWidth="10"
                                                />
                                                <circle
                                                    cx="60"
                                                    cy="60"
                                                    r="50"
                                                    fill="none"
                                                    stroke="url(#gProg)"
                                                    strokeWidth="10"
                                                    strokeDasharray={
                                                        2 * Math.PI * 50
                                                    }
                                                    strokeDashoffset={
                                                        2 *
                                                        Math.PI *
                                                        50 *
                                                        (1 -
                                                            Math.min(
                                                                progress,
                                                                100,
                                                            ) /
                                                                100)
                                                    }
                                                    strokeLinecap="round"
                                                    style={{
                                                        transition:
                                                            "stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)",
                                                    }}
                                                />
                                                <defs>
                                                    <linearGradient
                                                        id="gProg"
                                                        x1="0%"
                                                        y1="0%"
                                                        x2="100%"
                                                        y2="0%"
                                                    >
                                                        <stop
                                                            offset="0%"
                                                            stopColor="#34d399"
                                                        />
                                                        <stop
                                                            offset="100%"
                                                            stopColor="#0f6e56"
                                                        />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="up-progress-ring-num">
                                                {progress}%
                                            </div>
                                        </div>

                                        {/* Status chip */}
                                        <div
                                            style={{
                                                textAlign: "center",
                                                marginBottom: 16,
                                            }}
                                        >
                                            <Chip
                                                label={status.label}
                                                color={status.color}
                                                bg={status.bg}
                                            />
                                        </div>

                                        {/* Bar */}
                                        <PBar
                                            pct={progress}
                                            h={10}
                                            color="linear-gradient(90deg,#34d399,#0f6e56)"
                                        />

                                        {/* تفاصيل */}
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: 10,
                                                marginTop: 14,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    background:
                                                        "var(--n50,#f8fafc)",
                                                    border: "1px solid var(--n200,#e2e8f0)",
                                                    borderRadius: 10,
                                                    padding: "10px 12px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 10.5,
                                                        color: "var(--n400,#94a3b8)",
                                                        fontWeight: 600,
                                                        marginBottom: 3,
                                                    }}
                                                >
                                                    عدد الحصص
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 18,
                                                        fontWeight: 900,
                                                        color: "var(--n900,#0f172a)",
                                                    }}
                                                >
                                                    {lessons.length}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    background:
                                                        "var(--n50,#f8fafc)",
                                                    border: "1px solid var(--n200,#e2e8f0)",
                                                    borderRadius: 10,
                                                    padding: "10px 12px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 10.5,
                                                        color: "var(--n400,#94a3b8)",
                                                        fontWeight: 600,
                                                        marginBottom: 5,
                                                    }}
                                                >
                                                    متوسط التقييم
                                                </div>
                                                <StarRow rating={avg} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ── ملاحظات المعلمين ── */}
                        <div
                            className="up-card"
                            style={{ animationDelay: ".15s" }}
                        >
                            <div className="wh">
                                <span className="wh-t">ملاحظات المعلمين</span>
                            </div>
                            <div className="wb">
                                {loading ? (
                                    [1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: "10px 0",
                                                borderBottom:
                                                    "1px solid var(--n100,#f1f5f9)",
                                            }}
                                        >
                                            <Skeleton h={14} r={6} />
                                            <div style={{ marginTop: 6 }}>
                                                <Skeleton
                                                    h={10}
                                                    w="50%"
                                                    r={5}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : lessons.filter((l) => l.note).length ===
                                  0 ? (
                                    <Empty
                                        icon="📝"
                                        title="لا توجد ملاحظات بعد"
                                    />
                                ) : (
                                    lessons
                                        .filter((l) => l.note)
                                        .slice(0, 4)
                                        .map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className="up-note-row"
                                            >
                                                <div className="up-note-dot" />
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            color: "var(--n800,#1e293b)",
                                                        }}
                                                    >
                                                        {lesson.note}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: "var(--n400,#94a3b8)",
                                                            marginTop: 2,
                                                        }}
                                                    >
                                                        {lesson.surah_name} —{" "}
                                                        {lesson.attendance_date}
                                                    </div>
                                                    <StarRow
                                                        rating={lesson.rating}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                )}
                                {!loading &&
                                    lessons.filter((l) => l.note).length ===
                                        0 && (
                                        /* وهمي — لو مافيش ملاحظات */
                                        <div
                                            style={{
                                                marginTop: 8,
                                                padding: "10px 12px",
                                                background: "#f0fdf4",
                                                border: "1px dashed #bbf7d0",
                                                borderRadius: 10,
                                                fontSize: 12,
                                                color: "#065f46",
                                                fontWeight: 600,
                                            }}
                                        >
                                            💡 سيظهر هنا تعليقات المعلم بعد كل
                                            حصة
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* ── آخر الحصص (مفصّلة) ── */}
                    <div className="up-card" style={{ animationDelay: ".2s" }}>
                        <div className="wh">
                            <span className="wh-t">آخر الحصص</span>
                            {!loading && lessons.length > 0 && (
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "var(--n400,#94a3b8)",
                                        fontWeight: 600,
                                    }}
                                >
                                    {lessons.length} حصة
                                </span>
                            )}
                        </div>
                        <div
                            className="wb"
                            style={{ padding: "8px 20px 16px" }}
                        >
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            gap: 12,
                                            padding: "12px 0",
                                            borderBottom:
                                                "1px solid var(--n100,#f1f5f9)",
                                        }}
                                    >
                                        <Skeleton h={36} w="36px" r={10} />
                                        <div style={{ flex: 1 }}>
                                            <Skeleton h={13} r={6} />
                                            <div style={{ marginTop: 6 }}>
                                                <Skeleton
                                                    h={10}
                                                    w="40%"
                                                    r={5}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : lessons.length === 0 ? (
                                <Empty
                                    icon="📚"
                                    title="لا توجد حصص مسجلة بعد"
                                />
                            ) : (
                                lessons.slice(0, 6).map((lesson, idx) => (
                                    <div
                                        key={lesson.id}
                                        className="up-lesson-row"
                                    >
                                        <div className="up-day-badge">
                                            {String(idx + 1).padStart(2, "0")}
                                        </div>
                                        <div className="up-lesson-body">
                                            <div className="up-lesson-title">
                                                {lesson.surah_name || "—"}
                                            </div>
                                            <div className="up-lesson-sub">
                                                {lesson.attendance_date}
                                            </div>
                                            {lesson.new_memorization && (
                                                <div className="up-lesson-mem">
                                                    🎯 {lesson.new_memorization}
                                                </div>
                                            )}
                                            {lesson.review_memorization && (
                                                <div
                                                    className="up-lesson-mem"
                                                    style={{ color: "#0369a1" }}
                                                >
                                                    🔄 مراجعة:{" "}
                                                    {lesson.review_memorization}
                                                </div>
                                            )}
                                            {lesson.note && (
                                                <div className="up-lesson-note">
                                                    "{lesson.note}"
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                flexShrink: 0,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "flex-end",
                                                gap: 4,
                                            }}
                                        >
                                            <StarRow rating={lesson.rating} />
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    padding: "2px 8px",
                                                    borderRadius: 20,
                                                    background:
                                                        lesson.rating >= 4
                                                            ? "#d1fae5"
                                                            : lesson.rating >= 2
                                                              ? "#fef9c3"
                                                              : "#fee2e2",
                                                    color:
                                                        lesson.rating >= 4
                                                            ? "#065f46"
                                                            : lesson.rating >= 2
                                                              ? "#713f12"
                                                              : "#7f1d1d",
                                                }}
                                            >
                                                {lesson.rating >= 4
                                                    ? "ممتاز"
                                                    : lesson.rating >= 2
                                                      ? "جيد"
                                                      : "يحتاج مراجعة"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── تحليل وهمي بالذكاء الاصطناعي ── */}
                    <div
                        className="up-card"
                        style={{ animationDelay: ".25s", marginTop: 16 }}
                    >
                        <div className="wh">
                            <span
                                className="wh-t"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <RiRobot2Fill
                                    style={{ color: "#7c3aed", fontSize: 16 }}
                                />
                                تحليل ذكي
                            </span>
                            <span
                                style={{
                                    fontSize: 10,
                                    background: "#ede9fe",
                                    color: "#7c3aed",
                                    padding: "2px 8px",
                                    borderRadius: 20,
                                    fontWeight: 700,
                                }}
                            >
                                تجريبي
                            </span>
                        </div>
                        <div className="wb">
                            {loading ? (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                    }}
                                >
                                    <Skeleton h={14} r={6} />
                                    <Skeleton h={14} w="80%" r={6} />
                                    <Skeleton h={14} w="60%" r={6} />
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 12,
                                    }}
                                >
                                    {[
                                        {
                                            icon: "📈",
                                            title: "مستوى الأداء",
                                            desc:
                                                progress >= 70
                                                    ? "أداؤك فوق المتوسط، استمر بنفس الوتيرة!"
                                                    : "هناك فرصة للتحسن، ركز على المراجعة اليومية.",
                                        },
                                        {
                                            icon: "⭐",
                                            title: "التقييم العام",
                                            desc:
                                                avg >= 4
                                                    ? "تقييماتك ممتازة! معلمك راضٍ عن مستواك."
                                                    : avg >= 2
                                                      ? "تقييماتك جيدة، حاول تحسين جودة الحفظ."
                                                      : "ننصح بالتواصل مع المعلم لمعرفة نقاط الضعف.",
                                        },
                                        {
                                            icon: "🎯",
                                            title: "التوصية",
                                            desc:
                                                lessons.length > 0
                                                    ? `أكملت ${lessons.length} حصة حتى الآن، الهدف الجاري تجاوز التقدم لـ ${Math.min(progress + 20, 100)}%.`
                                                    : "ابدأ أول حصة لك وستظهر هنا توصياتك!",
                                        },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: "flex",
                                                gap: 12,
                                                padding: "10px 14px",
                                                background:
                                                    "var(--n50,#f8fafc)",
                                                border: "1px solid var(--n200,#e2e8f0)",
                                                borderRadius: 12,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 20,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {item.icon}
                                            </span>
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: 800,
                                                        color: "var(--n900,#0f172a)",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    {item.title}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "var(--n600,#475569)",
                                                        lineHeight: 1.6,
                                                    }}
                                                >
                                                    {item.desc}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProgress;
