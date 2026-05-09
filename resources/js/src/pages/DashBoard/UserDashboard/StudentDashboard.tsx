import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// ── Types ──────────────────────────────────────────────────────────────────
interface DashStats {
    attendance_rate: number;
    present_count: number;
    total_sessions: number;
    total_points: number;
    quran_progress: number;
    completed_days: number;
    total_plan_days: number;
}
interface NextSession {
    id: number;
    schedule_date: string;
    start_time: string;
    end_time: string;
    circle_name: string;
    teacher_name: string;
}
interface PendingDetail {
    id: number;
    schedule_date: string;
    start_time: string;
    end_time: string;
    circle_name: string;
    teacher_name: string;
    detail_status: "قيد الانتظار" | "إعادة";
    new_memorization: string | null;
    review_memorization: string | null;
    day_number: number;
}
interface PlanDetail {
    id: number;
    session_date: string;
    new_memorization: string | null;
    review_memorization: string | null;
    status: "مكتمل" | "قيد الانتظار" | "إعادة";
    day_number: number;
}
interface Badge {
    achievement_type: string;
    earned_at: string;
    pts: number;
}
interface DashData {
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
        gender: string | null;
        phone: string | null;
        status: string;
    };
    student: any;
    stats: DashStats;
    next_session: NextSession | null;
    pending_detail: PendingDetail | null;
    recent_details: PlanDetail[];
    badges: Badge[];
}

// ── Badge config ────────────────────────────────────────────────────────────
const BADGE_MAP: Record<
    string,
    { icon: string; label: string; color: string; bg: string }
> = {
    monthly_student: {
        icon: "🏆",
        label: "طالب الشهر",
        color: "#b45309",
        bg: "#fef3c7",
    },
    perfect_attendance: {
        icon: "⭐",
        label: "حضور مثالي",
        color: "#0369a1",
        bg: "#e0f2fe",
    },
    top_score: {
        icon: "💎",
        label: "أعلى درجة",
        color: "#7c3aed",
        bg: "#ede9fe",
    },
    memorization_star: {
        icon: "📖",
        label: "نجم الحفظ",
        color: "#059669",
        bg: "#d1fae5",
    },
    committed: {
        icon: "👑",
        label: "الملتزم",
        color: "#dc2626",
        bg: "#fee2e2",
    },
};

const STATUS_COLOR: Record<string, { bg: string; col: string; dot: string }> = {
    مكتمل: { bg: "#d1fae5", col: "#065f46", dot: "#10b981" },
    "قيد الانتظار": { bg: "#fef9c3", col: "#713f12", dot: "#f59e0b" },
    إعادة: { bg: "#fee2e2", col: "#7f1d1d", dot: "#ef4444" },
};

// ── Student Illustration ────────────────────────────────────────────────────
const StudentIllustration = ({
    gender = "male",
    size = 80,
}: {
    gender?: string;
    size?: number;
}) => {
    const isFemale = gender === "female";
    return (
        <svg
            viewBox="0 0 120 140"
            width={size}
            height={size}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <ellipse
                cx="60"
                cy="115"
                rx="38"
                ry="28"
                fill={isFemale ? "#6d28d9" : "#1a5c3a"}
            />
            {isFemale && (
                <ellipse cx="60" cy="118" rx="32" ry="22" fill="#7c3aed" />
            )}
            <rect x="53" y="60" width="14" height="14" rx="4" fill="#e8b97a" />
            <ellipse cx="60" cy="46" rx="22" ry="24" fill="#e8b97a" />
            {isFemale ? (
                <>
                    <ellipse cx="60" cy="30" rx="22" ry="10" fill="#4c1d95" />
                    <path
                        d="M38 40 Q38 70 52 74 Q38 72 36 50Z"
                        fill="#4c1d95"
                    />
                    <path
                        d="M82 40 Q82 70 68 74 Q82 72 84 50Z"
                        fill="#4c1d95"
                    />
                </>
            ) : (
                <path
                    d="M38 35 C38 18 82 18 82 35 L82 30 C82 12 38 12 38 30Z"
                    fill="#1a1a2e"
                    fillOpacity=".85"
                />
            )}
            <circle cx="52" cy="46" r="3.5" fill="#fff" />
            <circle cx="68" cy="46" r="3.5" fill="#fff" />
            <circle cx="53" cy="47" r="2" fill="#1a0f0a" />
            <circle cx="69" cy="47" r="2" fill="#1a0f0a" />
            <circle cx="53.8" cy="46.2" r=".7" fill="#fff" />
            <circle cx="69.8" cy="46.2" r=".7" fill="#fff" />
            <path
                d="M48 41 Q52 39 56 41"
                stroke="#2C1810"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M64 41 Q68 39 72 41"
                stroke="#2C1810"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M54 55 Q60 60 66 55"
                stroke="#b87040"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
            <ellipse cx="38" cy="47" rx="3" ry="4" fill="#e8b97a" />
            <ellipse cx="82" cy="47" rx="3" ry="4" fill="#e8b97a" />
            <rect
                x="38"
                y="92"
                width="20"
                height="26"
                rx="3"
                fill="#fff"
                fillOpacity=".9"
            />
            <rect x="40" y="95" width="7" height="1.5" rx="1" fill="#0f6e56" />
            <rect x="40" y="99" width="14" height="1" rx="1" fill="#94a3b8" />
            <rect x="40" y="102" width="11" height="1" rx="1" fill="#94a3b8" />
            <rect x="40" y="105" width="13" height="1" rx="1" fill="#94a3b8" />
            <text x="88" y="30" fontSize="10" fill="#f59e0b">
                ✦
            </text>
            <text x="18" y="25" fontSize="7" fill="#10b981">
                ✦
            </text>
            <text x="98" y="55" fontSize="6" fill="#6366f1">
                ✦
            </text>
        </svg>
    );
};

// ── Ring ────────────────────────────────────────────────────────────────────
const Ring = ({
    pct,
    size = 64,
    stroke = 7,
    color = "#10b981",
}: {
    pct: number;
    size?: number;
    stroke?: number;
    color?: string;
}) => {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(pct, 100) / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={stroke}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease" }}
            />
        </svg>
    );
};

// ── Skeleton ────────────────────────────────────────────────────────────────
const Skeleton = ({
    w = "100%",
    h = 16,
    r = 8,
}: {
    w?: string | number;
    h?: number;
    r?: number;
}) => (
    <div
        style={{
            width: w,
            height: h,
            borderRadius: r,
            background:
                "linear-gradient(90deg,#f0f0ef 25%,#e4e4e3 50%,#f0f0ef 75%)",
            backgroundSize: "200% 100%",
            animation: "sk-shimmer 1.4s infinite",
        }}
    />
);

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("ar-EG");

// ── Main Component ───────────────────────────────────────────────────────────
const StudentDashboard: React.FC = () => {
    const [data, setData] = useState<DashData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        "overview" | "sessions" | "badges"
    >("overview");
    const [sessionCopied, setSessionCopied] = useState(false);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get("/api/v1/student/dash/dashboard");
            setData(res.data);
        } catch {
            setError("تعذر تحميل البيانات — يُعرض محتوى تجريبي");
            setData({
                user: {
                    id: 1,
                    name: "عبدالله محمد القحطاني",
                    email: "student@etqan.com",
                    avatar: null,
                    gender: "male",
                    phone: "0501234567",
                    status: "active",
                },
                student: {
                    grade_level: "الثالث الابتدائي",
                    reading_level: "متوسط",
                    session_time: "asr",
                },
                stats: {
                    attendance_rate: 94,
                    present_count: 47,
                    total_sessions: 50,
                    total_points: 1247,
                    quran_progress: 38,
                    completed_days: 19,
                    total_plan_days: 50,
                },
                next_session: null,
                pending_detail: {
                    id: 2,
                    schedule_date: "2026-05-01",
                    start_time: "16:30",
                    end_time: "17:30",
                    circle_name: "حلقة النور",
                    teacher_name: "الشيخ أحمد فهد",
                    detail_status: "قيد الانتظار",
                    new_memorization: "61-71 البقرة",
                    review_memorization: "50-61 البقرة",
                    day_number: 2,
                },
                recent_details: [
                    {
                        id: 1,
                        session_date: "2026-05-01",
                        new_memorization: "50-61 البقرة",
                        review_memorization: "40-50 البقرة",
                        status: "مكتمل",
                        day_number: 1,
                    },
                    {
                        id: 2,
                        session_date: "2026-05-01",
                        new_memorization: "61-71 البقرة",
                        review_memorization: "50-61 البقرة",
                        status: "قيد الانتظار",
                        day_number: 2,
                    },
                    {
                        id: 3,
                        session_date: "2026-05-01",
                        new_memorization: "71-81 البقرة",
                        review_memorization: "50-61 البقرة",
                        status: "إعادة",
                        day_number: 3,
                    },
                ],
                badges: [
                    {
                        achievement_type: "monthly_student",
                        earned_at: "2026-04-01",
                        pts: 100,
                    },
                    {
                        achievement_type: "perfect_attendance",
                        earned_at: "2026-03-15",
                        pts: 50,
                    },
                ],
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // الـ session ID — يشتغل مع next_session أو pending_detail
    const sessionId =
        data?.next_session?.id ?? data?.pending_detail?.id ?? null;

    const copySessionLink = async () => {
        if (!sessionId) return;
        await navigator.clipboard
            .writeText(
                `${window.location.origin}/user-dashboard/room?schedule=${sessionId}`,
            )
            .catch(() => {});
        setSessionCopied(true);
        setTimeout(() => setSessionCopied(false), 2000);
    };

    const joinSession = () => {
        if (!sessionId) return;
        window.location.href = `/user-dashboard/room?schedule=${sessionId}`;
    };

    const allBadgeTypes = Object.keys(BADGE_MAP);
    const earnedTypes = (data?.badges ?? []).map((b) => b.achievement_type);
    const S = data?.stats;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap');
                @keyframes sk-shimmer  { to { background-position: -200% 0; } }
                @keyframes sd-rise     { to { opacity:1; transform:translateY(0); } }
                @keyframes sd-pop      { 0%{transform:scale(0)} 70%{transform:scale(1.08)} 100%{transform:scale(1)} }
                @keyframes sd-pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
                @keyframes sd-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
                @keyframes sd-gradmove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

                .sd-root { font-family:'Tajawal',sans-serif; direction:rtl; background:#f8fafc; min-height:100vh; padding:20px; box-sizing:border-box; }

                /* Hero */
                .sd-hero { background:linear-gradient(135deg,#0f2027,#0f6e56,#1a9e7a); background-size:300% 300%; animation:sd-gradmove 8s ease infinite; border-radius:28px; padding:32px 32px 24px; margin-bottom:20px; position:relative; overflow:hidden; color:#fff; }
                .sd-hero-dots { position:absolute; inset:0; pointer-events:none; background-image:radial-gradient(circle,rgba(255,255,255,.06) 1px,transparent 1px); background-size:22px 22px; }
                .sd-hero-glow { position:absolute; top:-60px; left:-60px; width:260px; height:260px; background:radial-gradient(circle,rgba(74,222,128,.18) 0%,transparent 70%); border-radius:50%; pointer-events:none; }
                .sd-hero-inner { position:relative; display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap; }
                .sd-hero-ill { animation:sd-float 4s ease-in-out infinite; filter:drop-shadow(0 8px 24px rgba(0,0,0,.25)); flex-shrink:0; }
                .sd-hero-info { flex:1; min-width:180px; }
                .sd-hero-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25); border-radius:20px; padding:4px 12px; font-size:11px; font-weight:700; margin-bottom:10px; color:#a7f3d0; }
                .sd-live-dot { width:7px; height:7px; border-radius:50%; background:#4ade80; animation:sd-pulse 1.5s ease infinite; }
                .sd-hero-name { font-size:24px; font-weight:900; margin-bottom:4px; }
                .sd-hero-sub  { font-size:13px; color:rgba(255,255,255,.65); margin-bottom:16px; }
                .sd-hero-pills { display:flex; flex-wrap:wrap; gap:8px; }
                .sd-hero-pill { background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); border-radius:20px; padding:4px 12px; font-size:11.5px; font-weight:700; display:flex; align-items:center; gap:5px; }
                .sd-hero-quickstats { display:flex; gap:14px; margin-top:20px; flex-wrap:wrap; }
                .sd-qs { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); border-radius:14px; padding:10px 16px; text-align:center; flex:1; min-width:80px; }
                .sd-qs-num { font-size:22px; font-weight:900; color:#fff; }
                .sd-qs-lbl { font-size:10.5px; color:rgba(255,255,255,.6); font-weight:600; margin-top:2px; }

                /* Tabs */
                .sd-tabs { display:flex; background:#fff; border-radius:16px; padding:6px; box-shadow:0 2px 12px rgba(0,0,0,.05); margin-bottom:20px; overflow-x:auto; gap:4px; }
                .sd-tab { flex:1; min-width:90px; padding:10px 16px; border:none; border-radius:12px; font-family:'Tajawal',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all .2s; white-space:nowrap; background:transparent; color:#94a3b8; }
                .sd-tab.active { background:linear-gradient(135deg,#0f6e56,#1a9e7a); color:#fff; box-shadow:0 4px 14px rgba(15,110,86,.3); }

                /* Grid */
                .sd-grid3 { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; margin-bottom:20px; }
                .sd-grid2 { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; margin-bottom:20px; }

                /* Widget */
                .sd-widget { background:#fff; border-radius:20px; box-shadow:0 2px 16px rgba(0,0,0,.05); overflow:hidden; animation:sd-rise .5s cubic-bezier(.16,1,.3,1) forwards; opacity:0; transform:translateY(16px); }
                .sd-wh { display:flex; align-items:center; justify-content:space-between; padding:18px 20px 14px; border-bottom:1px solid #f8fafc; }
                .sd-wh-t { font-size:13.5px; font-weight:800; color:#1e293b; }
                .sd-wb { padding:16px 20px 20px; }

                /* Stat */
                .sd-stat { display:flex; flex-direction:column; gap:6px; position:relative; overflow:hidden; }
                .sd-stat-accent { position:absolute; top:0; right:0; width:60px; height:60px; border-radius:50%; opacity:.07; transform:translate(20px,-20px); }
                .sd-stat-ring { display:flex; align-items:center; justify-content:center; margin-bottom:4px; position:relative; }
                .sd-stat-ring-num { position:absolute; font-size:13px; font-weight:900; display:flex; align-items:center; justify-content:center; }
                .sd-stat-val { font-size:32px; font-weight:900; }
                .sd-stat-lbl { font-size:12px; color:#94a3b8; font-weight:600; }
                .sd-stat-sub { font-size:11px; color:#cbd5e1; }

                /* Progress bar */
                .sd-bar { height:8px; background:#f1f5f9; border-radius:100px; overflow:hidden; }
                .sd-bar-fill { height:100%; border-radius:100px; transition:width 1s ease; }

                /* Session */
                .sd-session { border-radius:16px; padding:16px; margin-bottom:16px; }
                .sd-session-next    { background:linear-gradient(135deg,#f0fdf4,#ecfdf5); border:1.5px solid rgba(16,185,129,.2); }
                .sd-session-pending { background:linear-gradient(135deg,#fffbeb,#fef9c3); border:1.5px solid rgba(245,158,11,.25); }
                .sd-session-retry   { background:linear-gradient(135deg,#fff5f5,#fee2e2); border:1.5px solid rgba(239,68,68,.2); }
                .sd-session-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:8px; }
                .sd-session-badge { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:800; border-radius:20px; padding:4px 12px; }
                .sd-session-info { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
                .sd-session-tile { background:#fff; border-radius:12px; padding:10px 13px; border:1px solid rgba(0,0,0,.06); }
                .sd-session-tile-lbl { font-size:10px; color:#94a3b8; font-weight:600; margin-bottom:3px; }
                .sd-session-tile-val { font-size:13px; font-weight:800; color:#1e293b; }
                .sd-session-acts { display:flex; gap:8px; flex-wrap:wrap; }
                .sd-btn-join { flex:1; padding:11px; border-radius:12px; border:none; cursor:pointer; background:linear-gradient(135deg,#0f6e56,#1a9e7a); color:#fff; font-family:'Tajawal',sans-serif; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:7px; box-shadow:0 4px 14px rgba(15,110,86,.3); transition:transform .15s,box-shadow .15s; }
                .sd-btn-join:hover { transform:translateY(-2px); box-shadow:0 7px 20px rgba(15,110,86,.35); }
                .sd-btn-copy { padding:11px 16px; border-radius:12px; border:1.5px solid #d1fae5; background:#fff; color:#065f46; font-family:'Tajawal',sans-serif; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all .2s; }
                .sd-btn-copy:hover { background:#d1fae5; }

                /* Plan row */
                .sd-plan-row { display:flex; gap:12px; align-items:flex-start; padding:12px 0; border-bottom:1px solid #f8fafc; transition:background .15s; }
                .sd-plan-row:last-child { border-bottom:none; }
                .sd-plan-row:hover { background:#f8fffe; border-radius:10px; padding:12px 8px; margin:0 -8px; }
                .sd-plan-num { width:34px; height:34px; border-radius:10px; flex-shrink:0; background:linear-gradient(135deg,#0f6e56,#1a9e7a); display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:800; }
                .sd-plan-body { flex:1; min-width:0; }
                .sd-plan-date { font-size:10.5px; color:#94a3b8; font-weight:600; margin-bottom:4px; }
                .sd-plan-mem  { font-size:13px; font-weight:700; color:#1e293b; }
                .sd-plan-rev  { font-size:11.5px; color:#64748b; margin-top:2px; }
                .sd-status-chip { display:inline-flex; align-items:center; gap:5px; border-radius:20px; padding:3px 10px; font-size:11px; font-weight:700; white-space:nowrap; flex-shrink:0; margin-top:2px; }
                .sd-status-dot  { width:6px; height:6px; border-radius:50%; }

                /* Badge */
                .sd-badge-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:10px; }
                .sd-badge-item { border-radius:16px; padding:16px 12px; text-align:center; border:2px solid transparent; transition:all .25s cubic-bezier(.34,1.56,.64,1); cursor:default; position:relative; overflow:hidden; }
                .sd-badge-item.earned { animation:sd-pop .4s cubic-bezier(.34,1.56,.64,1) forwards; }
                .sd-badge-item.earned:hover { transform:translateY(-4px) scale(1.03); }
                .sd-badge-item.locked { opacity:.4; filter:grayscale(1); }
                .sd-badge-ico { font-size:30px; margin-bottom:6px; display:block; }
                .sd-badge-lbl { font-size:11px; font-weight:800; }
                .sd-badge-ck  { position:absolute; top:8px; left:8px; width:18px; height:18px; border-radius:50%; background:#10b981; display:flex; align-items:center; justify-content:center; color:#fff; font-size:9px; font-weight:900; }

                /* Misc */
                .sd-empty { text-align:center; padding:40px 20px; color:#94a3b8; }
                .sd-empty-ico { font-size:40px; margin-bottom:10px; }
                .sd-empty-t { font-size:14px; font-weight:700; }
                .sd-error { background:#fff8f0; border:1px solid #fed7aa; border-radius:12px; padding:10px 14px; font-size:12.5px; color:#92400e; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
                .sd-refresh { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25); border-radius:10px; padding:7px 14px; color:#fff; font-family:'Tajawal',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:background .2s; margin-top:4px; }
                .sd-refresh:hover { background:rgba(255,255,255,.25); }
                .sd-no-session { background:#f8fafc; border:1.5px dashed #e2e8f0; border-radius:16px; padding:24px; text-align:center; color:#94a3b8; font-size:13px; font-weight:600; }

                @media (max-width:500px) {
                    .sd-root { padding:12px; }
                    .sd-hero { padding:20px 16px 16px; }
                    .sd-hero-name { font-size:18px; }
                }
            `}</style>

            <div className="sd-root">
                {/* Error Banner */}
                {error && (
                    <div className="sd-error">
                        ⚠️ {error}
                        <button
                            onClick={fetchDashboard}
                            style={{
                                marginRight: "auto",
                                background: "none",
                                border: "none",
                                color: "#92400e",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontWeight: 700,
                                fontSize: 12,
                            }}
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                )}

                {/* ── Hero ── */}
                <div className="sd-hero">
                    <div className="sd-hero-dots" />
                    <div className="sd-hero-glow" />
                    <div className="sd-hero-inner">
                        <div className="sd-hero-ill">
                            {loading ? (
                                <div
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,.1)",
                                    }}
                                />
                            ) : (
                                <StudentIllustration
                                    gender={data?.user.gender ?? "male"}
                                    size={88}
                                />
                            )}
                        </div>
                        <div className="sd-hero-info">
                            <div className="sd-hero-badge">
                                <div className="sd-live-dot" />
                                {loading
                                    ? "جاري التحميل..."
                                    : data?.student?.session_time === "asr"
                                      ? "حلقة العصر"
                                      : "حلقة المغرب"}
                            </div>
                            <div className="sd-hero-name">
                                {loading ? (
                                    <Skeleton w={220} h={28} />
                                ) : (
                                    (data?.user.name ?? "الطالب")
                                )}
                            </div>
                            <div className="sd-hero-sub">
                                {loading ? (
                                    <Skeleton w={160} h={16} />
                                ) : (
                                    (data?.user.email ?? "")
                                )}
                            </div>
                            <div className="sd-hero-pills">
                                {data?.student?.grade_level && (
                                    <span className="sd-hero-pill">
                                        📚 {data.student.grade_level}
                                    </span>
                                )}
                                {data?.student?.reading_level && (
                                    <span className="sd-hero-pill">
                                        📖 مستوى: {data.student.reading_level}
                                    </span>
                                )}
                            </div>
                            <button
                                className="sd-refresh"
                                onClick={fetchDashboard}
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <polyline points="1 4 1 10 7 10" />
                                    <polyline points="23 20 23 14 17 14" />
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                                </svg>
                                تحديث
                            </button>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="sd-hero-quickstats">
                        {loading
                            ? [1, 2, 3].map((i) => (
                                  <div key={i} className="sd-qs">
                                      <Skeleton w="100%" h={40} />
                                  </div>
                              ))
                            : [
                                  {
                                      num: `${S?.attendance_rate ?? 0}%`,
                                      lbl: "نسبة الحضور",
                                  },
                                  {
                                      num: fmt(S?.total_points ?? 0),
                                      lbl: "نقاطي",
                                  },
                                  {
                                      num: `${S?.quran_progress ?? 0}%`,
                                      lbl: "تقدم الحفظ",
                                  },
                              ].map((q, i) => (
                                  <div key={i} className="sd-qs">
                                      <div className="sd-qs-num">{q.num}</div>
                                      <div className="sd-qs-lbl">{q.lbl}</div>
                                  </div>
                              ))}
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="sd-tabs">
                    {(
                        [
                            ["overview", "🏠 نظرة عامة"],
                            ["sessions", "📋 جلساتي"],
                            ["badges", "🏅 إنجازاتي"],
                        ] as const
                    ).map(([key, label]) => (
                        <button
                            key={key}
                            className={`sd-tab${activeTab === key ? " active" : ""}`}
                            onClick={() => setActiveTab(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── OVERVIEW ── */}
                {activeTab === "overview" && (
                    <>
                        {/* Stat cards */}
                        <div className="sd-grid3">
                            {loading
                                ? [1, 2, 3].map((i) => (
                                      <div key={i} className="sd-widget">
                                          <div className="sd-wb">
                                              <Skeleton h={100} />
                                          </div>
                                      </div>
                                  ))
                                : [
                                      {
                                          label: "تقدم الحفظ",
                                          val: `${S?.quran_progress ?? 0}%`,
                                          sub: `${fmt(S?.completed_days ?? 0)} من ${fmt(S?.total_plan_days ?? 0)} يوم`,
                                          ring: S?.quran_progress ?? 0,
                                          ringColor: "#10b981",
                                          ringFg: "#065f46",
                                          accent: "#10b981",
                                      },
                                      {
                                          label: "الحضور",
                                          val: `${S?.attendance_rate ?? 0}%`,
                                          sub: `${fmt(S?.present_count ?? 0)} من ${fmt(S?.total_sessions ?? 0)} جلسة`,
                                          ring: S?.attendance_rate ?? 0,
                                          ringColor: "#3b82f6",
                                          ringFg: "#1d4ed8",
                                          accent: "#3b82f6",
                                      },
                                      {
                                          label: "نقاطي",
                                          val: fmt(S?.total_points ?? 0),
                                          sub: "نقاط مكتسبة",
                                          ring: Math.min(
                                              ((S?.total_points ?? 0) / 2500) *
                                                  100,
                                              100,
                                          ),
                                          ringColor: "#8b5cf6",
                                          ringFg: "#7c3aed",
                                          accent: "#8b5cf6",
                                      },
                                  ].map((c, i) => (
                                      <div
                                          key={i}
                                          className="sd-widget"
                                          style={{
                                              animationDelay: `${i * 0.1}s`,
                                          }}
                                      >
                                          <div className="sd-wb sd-stat">
                                              <div
                                                  className="sd-stat-accent"
                                                  style={{
                                                      background: c.accent,
                                                  }}
                                              />
                                              <div className="sd-stat-ring">
                                                  <Ring
                                                      pct={c.ring}
                                                      size={72}
                                                      stroke={7}
                                                      color={c.ringColor}
                                                  />
                                                  <div
                                                      className="sd-stat-ring-num"
                                                      style={{
                                                          color: c.ringFg,
                                                      }}
                                                  >
                                                      {c.ring >= 100
                                                          ? "✓"
                                                          : `${Math.round(c.ring)}%`}
                                                  </div>
                                              </div>
                                              <div
                                                  className="sd-stat-val"
                                                  style={{ color: c.accent }}
                                              >
                                                  {c.val}
                                              </div>
                                              <div className="sd-stat-lbl">
                                                  {c.label}
                                              </div>
                                              <div className="sd-stat-sub">
                                                  {c.sub}
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                        </div>

                        <div className="sd-grid2">
                            {/* ── الحصة القادمة ── */}
                            <div
                                className="sd-widget"
                                style={{ animationDelay: ".15s" }}
                            >
                                <div className="sd-wh">
                                    <span className="sd-wh-t">
                                        الحصة القادمة
                                    </span>
                                </div>
                                <div className="sd-wb">
                                    {loading ? (
                                        <Skeleton h={160} />
                                    ) : data?.next_session ? (
                                        /* حصة مجدولة فعلاً */
                                        <div className="sd-session sd-session-next">
                                            <div className="sd-session-head">
                                                <span
                                                    className="sd-session-badge"
                                                    style={{
                                                        background: "#d1fae5",
                                                        color: "#065f46",
                                                    }}
                                                >
                                                    <div
                                                        className="sd-live-dot"
                                                        style={{
                                                            background:
                                                                "#10b981",
                                                        }}
                                                    />
                                                    جلسة قادمة
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#64748b",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {
                                                        data.next_session
                                                            .schedule_date
                                                    }
                                                </span>
                                            </div>
                                            <div className="sd-session-info">
                                                {[
                                                    {
                                                        l: "المعلم",
                                                        v: data.next_session
                                                            .teacher_name,
                                                    },
                                                    {
                                                        l: "الحلقة",
                                                        v: data.next_session
                                                            .circle_name,
                                                    },
                                                    {
                                                        l: "البداية",
                                                        v: data.next_session
                                                            .start_time,
                                                    },
                                                    {
                                                        l: "النهاية",
                                                        v: data.next_session
                                                            .end_time,
                                                    },
                                                ].map((t, i) => (
                                                    <div
                                                        key={i}
                                                        className="sd-session-tile"
                                                    >
                                                        <div className="sd-session-tile-lbl">
                                                            {t.l}
                                                        </div>
                                                        <div className="sd-session-tile-val">
                                                            {t.v}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="sd-session-acts">
                                                <button
                                                    className="sd-btn-join"
                                                    onClick={joinSession}
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <polygon points="23 7 16 12 23 17 23 7" />
                                                        <rect
                                                            x="1"
                                                            y="5"
                                                            width="15"
                                                            height="14"
                                                            rx="2"
                                                            ry="2"
                                                        />
                                                    </svg>
                                                    دخول الحصة
                                                </button>
                                                <button
                                                    className="sd-btn-copy"
                                                    onClick={copySessionLink}
                                                >
                                                    {sessionCopied ? (
                                                        "✓ تم!"
                                                    ) : (
                                                        <>
                                                            <svg
                                                                width="13"
                                                                height="13"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <rect
                                                                    x="9"
                                                                    y="9"
                                                                    width="13"
                                                                    height="13"
                                                                    rx="2"
                                                                />
                                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                            </svg>
                                                            نسخ الرابط
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : data?.pending_detail ? (
                                        /* تسميعة معلقة (إعادة أو قيد الانتظار) */
                                        (() => {
                                            const isRetry =
                                                data.pending_detail
                                                    .detail_status === "إعادة";
                                            return (
                                                <div
                                                    className={`sd-session ${isRetry ? "sd-session-retry" : "sd-session-pending"}`}
                                                >
                                                    <div className="sd-session-head">
                                                        <span
                                                            className="sd-session-badge"
                                                            style={{
                                                                background:
                                                                    isRetry
                                                                        ? "#fee2e2"
                                                                        : "#fef9c3",
                                                                color: isRetry
                                                                    ? "#7f1d1d"
                                                                    : "#713f12",
                                                            }}
                                                        >
                                                            <div
                                                                className="sd-live-dot"
                                                                style={{
                                                                    background:
                                                                        isRetry
                                                                            ? "#ef4444"
                                                                            : "#f59e0b",
                                                                }}
                                                            />
                                                            {
                                                                data
                                                                    .pending_detail
                                                                    .detail_status
                                                            }
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#64748b",
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            اليوم{" "}
                                                            {
                                                                data
                                                                    .pending_detail
                                                                    .day_number
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="sd-session-info">
                                                        {[
                                                            {
                                                                l: "المعلم",
                                                                v: data
                                                                    .pending_detail
                                                                    .teacher_name,
                                                            },
                                                            {
                                                                l: "الحلقة",
                                                                v: data
                                                                    .pending_detail
                                                                    .circle_name,
                                                            },
                                                            {
                                                                l: "الحفظ المطلوب",
                                                                v:
                                                                    data
                                                                        .pending_detail
                                                                        .new_memorization ??
                                                                    "—",
                                                            },
                                                            {
                                                                l: "المراجعة",
                                                                v:
                                                                    data
                                                                        .pending_detail
                                                                        .review_memorization ??
                                                                    "—",
                                                            },
                                                        ].map((t, i) => (
                                                            <div
                                                                key={i}
                                                                className="sd-session-tile"
                                                            >
                                                                <div className="sd-session-tile-lbl">
                                                                    {t.l}
                                                                </div>
                                                                <div className="sd-session-tile-val">
                                                                    {t.v}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="sd-session-acts">
                                                        <button
                                                            className="sd-btn-join"
                                                            onClick={
                                                                joinSession
                                                            }
                                                        >
                                                            <svg
                                                                width="14"
                                                                height="14"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <polygon points="23 7 16 12 23 17 23 7" />
                                                                <rect
                                                                    x="1"
                                                                    y="5"
                                                                    width="15"
                                                                    height="14"
                                                                    rx="2"
                                                                    ry="2"
                                                                />
                                                            </svg>
                                                            دخول الحصة
                                                        </button>
                                                        <button
                                                            className="sd-btn-copy"
                                                            onClick={
                                                                copySessionLink
                                                            }
                                                        >
                                                            {sessionCopied ? (
                                                                "✓ تم!"
                                                            ) : (
                                                                <>
                                                                    <svg
                                                                        width="13"
                                                                        height="13"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                    >
                                                                        <rect
                                                                            x="9"
                                                                            y="9"
                                                                            width="13"
                                                                            height="13"
                                                                            rx="2"
                                                                        />
                                                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                                    </svg>
                                                                    نسخ الرابط
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="sd-no-session">
                                            <div
                                                style={{
                                                    fontSize: 32,
                                                    marginBottom: 8,
                                                }}
                                            >
                                                📅
                                            </div>
                                            لا توجد حصص قادمة مجدولة حالياً
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── آخر التسميعات ── */}
                            <div
                                className="sd-widget"
                                style={{ animationDelay: ".2s" }}
                            >
                                <div className="sd-wh">
                                    <span className="sd-wh-t">
                                        آخر التسميعات
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: "#94a3b8",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {data?.recent_details.length ?? 0} سجل
                                    </span>
                                </div>
                                <div
                                    className="sd-wb"
                                    style={{ padding: "8px 20px 16px" }}
                                >
                                    {loading ? (
                                        [1, 2, 3].map((i) => (
                                            <Skeleton key={i} h={56} r={12} />
                                        ))
                                    ) : (data?.recent_details ?? []).length ===
                                      0 ? (
                                        <div className="sd-empty">
                                            <div className="sd-empty-ico">
                                                📖
                                            </div>
                                            <div className="sd-empty-t">
                                                لا توجد تسميعات مسجلة
                                            </div>
                                        </div>
                                    ) : (
                                        (data?.recent_details ?? []).map(
                                            (d) => {
                                                const sc =
                                                    STATUS_COLOR[d.status] ??
                                                    STATUS_COLOR[
                                                        "قيد الانتظار"
                                                    ];
                                                return (
                                                    <div
                                                        key={d.id}
                                                        className="sd-plan-row"
                                                    >
                                                        <div className="sd-plan-num">
                                                            {String(
                                                                d.day_number,
                                                            ).padStart(2, "0")}
                                                        </div>
                                                        <div className="sd-plan-body">
                                                            <div className="sd-plan-date">
                                                                {d.session_date}
                                                            </div>
                                                            <div className="sd-plan-mem">
                                                                {d.new_memorization ??
                                                                    "—"}
                                                            </div>
                                                            {d.review_memorization && (
                                                                <div className="sd-plan-rev">
                                                                    مراجعة:{" "}
                                                                    {
                                                                        d.review_memorization
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div
                                                            className="sd-status-chip"
                                                            style={{
                                                                background:
                                                                    sc.bg,
                                                                color: sc.col,
                                                            }}
                                                        >
                                                            <div
                                                                className="sd-status-dot"
                                                                style={{
                                                                    background:
                                                                        sc.dot,
                                                                }}
                                                            />
                                                            {d.status}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── SESSIONS ── */}
                {activeTab === "sessions" && (
                    <div className="sd-widget">
                        <div className="sd-wh">
                            <span className="sd-wh-t">
                                سجل التسميعات الكامل
                            </span>
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "#94a3b8",
                                    fontWeight: 600,
                                }}
                            >
                                {data?.recent_details.length ?? 0} جلسة
                            </span>
                        </div>
                        <div
                            className="sd-wb"
                            style={{ padding: "8px 20px 20px" }}
                        >
                            {loading ? (
                                [1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} h={64} r={12} />
                                ))
                            ) : (data?.recent_details ?? []).length === 0 ? (
                                <div className="sd-empty">
                                    <div className="sd-empty-ico">📋</div>
                                    <div className="sd-empty-t">
                                        لا توجد جلسات مسجلة بعد
                                    </div>
                                </div>
                            ) : (
                                (data?.recent_details ?? []).map((d) => {
                                    const sc =
                                        STATUS_COLOR[d.status] ??
                                        STATUS_COLOR["قيد الانتظار"];
                                    return (
                                        <div key={d.id} className="sd-plan-row">
                                            <div className="sd-plan-num">
                                                {String(d.day_number).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </div>
                                            <div className="sd-plan-body">
                                                <div className="sd-plan-date">
                                                    📅 {d.session_date}
                                                </div>
                                                <div className="sd-plan-mem">
                                                    🎯{" "}
                                                    {d.new_memorization ??
                                                        "لا يوجد حفظ جديد"}
                                                </div>
                                                {d.review_memorization && (
                                                    <div className="sd-plan-rev">
                                                        🔄 مراجعة:{" "}
                                                        {d.review_memorization}
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className="sd-status-chip"
                                                style={{
                                                    background: sc.bg,
                                                    color: sc.col,
                                                }}
                                            >
                                                <div
                                                    className="sd-status-dot"
                                                    style={{
                                                        background: sc.dot,
                                                    }}
                                                />
                                                {d.status}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* ── BADGES ── */}
                {activeTab === "badges" && (
                    <>
                        <div className="sd-widget" style={{ marginBottom: 16 }}>
                            <div className="sd-wb">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 10,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "#1e293b",
                                        }}
                                    >
                                        {earnedTypes.length} /{" "}
                                        {allBadgeTypes.length} وسام مكتسب
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: "#10b981",
                                        }}
                                    >
                                        {allBadgeTypes.length > 0
                                            ? Math.round(
                                                  (earnedTypes.length /
                                                      allBadgeTypes.length) *
                                                      100,
                                              )
                                            : 0}
                                        %
                                    </span>
                                </div>
                                <div className="sd-bar">
                                    <div
                                        className="sd-bar-fill"
                                        style={{
                                            width:
                                                allBadgeTypes.length > 0
                                                    ? `${(earnedTypes.length / allBadgeTypes.length) * 100}%`
                                                    : "0%",
                                            background:
                                                "linear-gradient(90deg,#34d399,#10b981)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sd-widget">
                            <div className="sd-wh">
                                <span className="sd-wh-t">
                                    🏅 مجموعة الأوسمة
                                </span>
                            </div>
                            <div className="sd-wb">
                                {loading ? (
                                    <div className="sd-badge-grid">
                                        {[1, 2, 3, 4].map((i) => (
                                            <Skeleton key={i} h={100} r={16} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="sd-badge-grid">
                                        {allBadgeTypes.map((type) => {
                                            const cfg = BADGE_MAP[type];
                                            const isEarned =
                                                earnedTypes.includes(type);
                                            const earnedData = (
                                                data?.badges ?? []
                                            ).find(
                                                (b) =>
                                                    b.achievement_type === type,
                                            );
                                            return (
                                                <div
                                                    key={type}
                                                    className={`sd-badge-item ${isEarned ? "earned" : "locked"}`}
                                                    style={{
                                                        background: isEarned
                                                            ? cfg.bg
                                                            : "#f8fafc",
                                                        border: `2px solid ${isEarned ? cfg.color + "44" : "#e2e8f0"}`,
                                                    }}
                                                    title={
                                                        isEarned
                                                            ? `مكتسب — ${earnedData?.pts ?? 0} نقطة`
                                                            : "غير مكتسب بعد"
                                                    }
                                                >
                                                    <span className="sd-badge-ico">
                                                        {cfg.icon}
                                                    </span>
                                                    <div
                                                        className="sd-badge-lbl"
                                                        style={{
                                                            color: isEarned
                                                                ? cfg.color
                                                                : "#94a3b8",
                                                        }}
                                                    >
                                                        {cfg.label}
                                                    </div>
                                                    {isEarned && (
                                                        <>
                                                            <div className="sd-badge-ck">
                                                                ✓
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize: 10,
                                                                    color: cfg.color,
                                                                    fontWeight: 700,
                                                                    marginTop: 4,
                                                                }}
                                                            >
                                                                +
                                                                {earnedData?.pts ??
                                                                    0}{" "}
                                                                نقطة
                                                            </div>
                                                        </>
                                                    )}
                                                    {!isEarned && (
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                color: "#cbd5e1",
                                                                marginTop: 4,
                                                            }}
                                                        >
                                                            🔒 مقفل
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default StudentDashboard;
