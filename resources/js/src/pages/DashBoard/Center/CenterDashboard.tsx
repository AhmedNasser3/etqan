import { useState, useCallback } from "react";
import { ICO } from "../icons";
import { useCenterDashboard } from "./hooks/useCenterStats";
import { useToast } from "../../../../contexts/ToastContext";
import CreateCustomSalaryModal from "./TeacherCustomSalaries/models/CreateCustomSalaryModal";
import CreateCirclePage from "./Circles/models/CreateCirclePage";
import FinancialDashboard from "../Financial/Dashboard/FinancialDashboard";

interface AttRecord {
    id: number;
    name: string;
    role: string;
    status: string;
    time: string;
    note: string;
}

const ATTENDANCE_DATA: AttRecord[] = [
    {
        id: 1,
        name: "أحمد ناصر مصطفي",
        role: "معلم قرآن",
        status: "حاضر",
        time: "08:15",
        note: "",
    },
    {
        id: 2,
        name: "فاطمة عبدالله الزهراني",
        role: "مشرفة",
        status: "متأخر",
        time: "09:05",
        note: "ازدحام مروري",
    },
    {
        id: 3,
        name: "سارة محمد الغامدي",
        role: "شؤون الطلاب",
        status: "حاضر",
        time: "08:00",
        note: "",
    },
];

const CenterDashboard: React.FC = () => {
    const { stats, recentCircles, loading } = useCenterDashboard();
    const { notifySuccess } = useToast();
    const [attRunning, setAttRunning] = useState(false);
    const [showCreateSalary, setShowCreateSalary] = useState(false);
    const [showCreateCircle, setShowCreateCircle] = useState(false);
    const [showAttModal, setShowAttModal] = useState(false);

    const today = new Date();
    const pres = ATTENDANCE_DATA.filter((a) => a.status === "حاضر").length;
    const late = ATTENDANCE_DATA.filter((a) => a.status === "متأخر").length;
    const abs = ATTENDANCE_DATA.filter((a) => a.status === "غائب").length;
    const total = ATTENDANCE_DATA.length;
    const rate = total ? Math.round(((pres + late) / total) * 100) : 0;

    const toggleAtt = useCallback(() => setAttRunning((p) => !p), []);

    // ── KPI cards ─────────────────────────────────────────────────────────
    const kpiCards = [
        {
            ico: "student",
            cls: "ic-g",
            trend: stats?.students.trend === "up" ? "t-up" : "t-fl",
            trv: stats?.students.diff ? `▲ ${stats.students.diff}` : "● 0",
            n: loading ? "..." : String(stats?.students.total ?? 0),
            lbl: "إجمالي الطلاب",
        },
        {
            ico: "globe",
            cls: "ic-b",
            trend: "t-fl",
            trv: "● 0%",
            n: loading ? "..." : String(stats?.circles.total ?? 0),
            lbl: "الحلقات النشطة",
        },
        {
            ico: "mosque",
            cls: "ic-a",
            trend: "t-fl",
            trv: `● ${stats?.mosques ?? 0}`,
            n: loading ? "..." : String(stats?.mosques ?? 0),
            lbl: "المساجد",
        },
        {
            ico: "money",
            cls: "ic-p",
            trend: "t-up",
            trv: "▲ 5%",
            n: loading ? "..." : `${stats?.total_balance ?? 0} ر.س`,
            lbl: "المستحقات",
        },
    ];

    // ── Quick actions ──────────────────────────────────────────────────────
    const quickActions = [
        {
            lbl: "إنشاء راتب مخصص",
            ico: "money",
            col: "var(--g100)",
            icol: "var(--g600)",
            action: () => setShowCreateSalary(true),
        },
        {
            lbl: "حلقة جديدة",
            ico: "globe",
            col: "#dbeafe",
            icol: "#2563eb",
            action: () => setShowCreateCircle(true),
        },
        {
            lbl: "تسجيل حضور",
            ico: "check",
            col: "var(--g100)",
            icol: "var(--g600)",
            action: () => setShowAttModal(true),
        },
        {
            lbl: "مهمة جديدة",
            ico: "clip",
            col: "#fef3c7",
            icol: "#d97706",
            action: () => notifySuccess("قادمة قريباً"),
        },
        {
            lbl: "إنجاز طالب",
            ico: "star",
            col: "#ede9fe",
            icol: "#7c3aed",
            action: () => notifySuccess("قادمة قريباً"),
        },
        {
            lbl: "الطلبات المعلقة",
            ico: "clipboard",
            col: "#fee2e2",
            icol: "#ef4444",
            action: () => {
                window.location.href = "/center-dashboard/booking-manegment";
            },
        },
    ];

    return (
        <div className="content" id="contentArea">
            {/* ── Modals ──────────────────────────────────────────────────── */}
            {showCreateSalary && (
                <CreateCustomSalaryModal
                    onClose={() => setShowCreateSalary(false)}
                    onSuccess={() => {
                        notifySuccess("تم إضافة الراتب المخصص بنجاح");
                        setShowCreateSalary(false);
                    }}
                />
            )}

            {showCreateCircle && (
                <CreateCirclePage
                    onClose={() => setShowCreateCircle(false)}
                    onSuccess={() => {
                        notifySuccess("تم إنشاء الحلقة بنجاح");
                        setShowCreateCircle(false);
                    }}
                />
            )}

            {showAttModal && (
                <AttendanceModal
                    data={ATTENDANCE_DATA}
                    onClose={() => setShowAttModal(false)}
                />
            )}

            <div
                className="widget"
                style={{ background: "transparent", border: "none" }}
            >
                <div className="cc">
                    {/* ── Hero ──────────────────────────────────────────────── */}
                    <div className="dark-hero" style={{ marginBottom: 13 }}>
                        <div className="dhi">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 12,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 800,
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 7,
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: "var(--g300)",
                                                width: 16,
                                                height: 16,
                                                display: "inline-flex",
                                            }}
                                        >
                                            {ICO.check}
                                        </span>
                                        جلسة الحضور
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "9.5px",
                                            color: "rgba(255,255,255,.35)",
                                            marginTop: 2,
                                        }}
                                    >
                                        {today.toLocaleDateString("ar-SA", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    {attRunning && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 5,
                                                background:
                                                    "rgba(255,255,255,.08)",
                                                padding: "3px 10px",
                                                borderRadius: 100,
                                                fontSize: 10,
                                                color: "rgba(255,255,255,.8)",
                                            }}
                                        >
                                            <span className="pulse-dot" /> جارية
                                        </div>
                                    )}
                                    <button
                                        className="btn bp bsm"
                                        onClick={toggleAtt}
                                        style={
                                            attRunning
                                                ? { background: "var(--red)" }
                                                : {}
                                        }
                                    >
                                        {attRunning
                                            ? "إيقاف الجلسة"
                                            : "بدء الجلسة"}
                                    </button>
                                </div>
                            </div>

                            <div className="att-stats">
                                {[
                                    { n: pres, l: "حاضر" },
                                    { n: late, l: "متأخر", c: "#fbbf24" },
                                    { n: abs, l: "غائب", c: "#f87171" },
                                    { n: rate + "%", l: "النسبة" },
                                ].map((s, i) => (
                                    <div key={i} className="att-stat">
                                        <div
                                            className="att-stat-n"
                                            style={s.c ? { color: s.c } : {}}
                                        >
                                            {s.n}
                                        </div>
                                        <div className="att-stat-l">{s.l}</div>
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "rgba(0,0,0,.2)",
                                    borderRadius: 9,
                                    padding: "10px 14px",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 9,
                                            color: "rgba(255,255,255,.4)",
                                        }}
                                    >
                                        مدة الجلسة
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button
                                        className="btn bsm"
                                        style={{
                                            background: "rgba(255,255,255,.1)",
                                            color: "#fff",
                                        }}
                                        onClick={() => setShowAttModal(true)}
                                    >
                                        عرض التفاصيل
                                    </button>
                                    <button
                                        className="btn bsm"
                                        style={{
                                            background: "rgba(255,255,255,.08)",
                                            color: "#fff",
                                        }}
                                    >
                                        تصدير PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── KPI Grid ──────────────────────────────────────────── */}
                    <div className="kpi-grid">
                        {kpiCards.map((k, i) => (
                            <div key={i} className="kpi">
                                <div className="kpi-top">
                                    <div className={`kpi-ico ${k.cls}`}>
                                        {ICO[k.ico as keyof typeof ICO]}
                                    </div>
                                    <span className={`kpi-trend ${k.trend}`}>
                                        {k.trv}
                                    </span>
                                </div>
                                <div className="kpi-num">{k.n}</div>
                                <div className="kpi-lbl">{k.lbl}</div>
                            </div>
                        ))}
                    </div>

                    <div className="g2">
                        {/* ── Quick Actions ─────────────────────────────────── */}
                        <div className="widget">
                            <div className="wh">
                                <span className="wh-l">إجراءات سريعة</span>
                            </div>
                            <div className="wb">
                                <div className="g3">
                                    {quickActions.map((q, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                background: "var(--n50)",
                                                border: "1px solid var(--n200)",
                                                borderRadius: 9,
                                                padding: 11,
                                                textAlign: "center",
                                                cursor: "pointer",
                                                transition: ".15s",
                                            }}
                                            onMouseEnter={(e) => {
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.background = q.col;
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.borderColor =
                                                    q.icol + "30";
                                            }}
                                            onMouseLeave={(e) => {
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.background =
                                                    "var(--n50)";
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.borderColor =
                                                    "var(--n200)";
                                            }}
                                            onClick={q.action}
                                        >
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    background: q.col,
                                                    borderRadius: 7,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    margin: "0 auto 6px",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: q.icol,
                                                        width: 14,
                                                        height: 14,
                                                        display: "inline-flex",
                                                    }}
                                                >
                                                    {
                                                        ICO[
                                                            q.ico as keyof typeof ICO
                                                        ]
                                                    }
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: "var(--n600)",
                                                }}
                                            >
                                                {q.lbl}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Recent Circles ────────────────────────────────── */}
                        <div className="widget">
                            <div className="wh">
                                <span className="wh-l">الحلقات النشطة</span>
                                <button
                                    className="btn bp bsm"
                                    onClick={() =>
                                        (window.location.href =
                                            "/center-dashboard/circle-manegment")
                                    }
                                >
                                    إدارة الكل
                                </button>
                            </div>
                            <div style={{ padding: "0 14px" }}>
                                {loading ? (
                                    <div
                                        style={{
                                            padding: 20,
                                            textAlign: "center",
                                            color: "var(--n400)",
                                            fontSize: 13,
                                        }}
                                    >
                                        جاري التحميل...
                                    </div>
                                ) : recentCircles.length > 0 ? (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>اسم الحلقة</th>
                                                <th>المسجد</th>
                                                <th>المعلم</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentCircles.map((c) => (
                                                <tr key={c.id}>
                                                    <td
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {c.name}
                                                    </td>
                                                    <td>{c.mosque_name}</td>
                                                    <td>{c.teacher_name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div
                                        style={{
                                            padding: 20,
                                            textAlign: "center",
                                            color: "var(--n400)",
                                            fontSize: 13,
                                        }}
                                    >
                                        لا توجد حلقات بعد
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Financial ─────────────────────────────────────────── */}
                    <div className="widget">
                        <div className="wh">
                            <span className="wh-l">مستحقات الرواتب</span>
                            <button
                                className="btn bp bsm"
                                onClick={() =>
                                    (window.location.href =
                                        "/center-dashboard/financial-dashboard")
                                }
                            >
                                الكل
                            </button>
                        </div>
                        <div className="wb">
                            <FinancialDashboard />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Attendance Modal ───────────────────────────────────────────────────────
function AttendanceModal({
    data,
    onClose,
}: {
    data: AttRecord[];
    onClose: () => void;
}) {
    const statusColor = (s: string) =>
        s === "حاضر"
            ? { bg: "var(--g100)", color: "var(--g700)" }
            : s === "متأخر"
              ? { bg: "#fef3c7", color: "#92400e" }
              : { bg: "#fee2e2", color: "#ef4444" };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 3000,
                background: "rgba(0,0,0,.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 28,
                    maxWidth: 540,
                    width: "92%",
                    direction: "rtl",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                    }}
                >
                    <h3 style={{ fontWeight: 500, fontSize: 17, margin: 0 }}>
                        تفاصيل الحضور
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 22,
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        ×
                    </button>
                </div>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                borderBottom:
                                    "1px solid var(--color-border-tertiary)",
                            }}
                        >
                            <th
                                style={{
                                    textAlign: "right",
                                    padding: "6px 8px",
                                    fontWeight: 600,
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                الاسم
                            </th>
                            <th
                                style={{
                                    textAlign: "right",
                                    padding: "6px 8px",
                                    fontWeight: 600,
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                الدور
                            </th>
                            <th
                                style={{
                                    textAlign: "right",
                                    padding: "6px 8px",
                                    fontWeight: 600,
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                الحالة
                            </th>
                            <th
                                style={{
                                    textAlign: "right",
                                    padding: "6px 8px",
                                    fontWeight: 600,
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                الوقت
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((a) => {
                            const sc = statusColor(a.status);
                            return (
                                <tr
                                    key={a.id}
                                    style={{
                                        borderBottom:
                                            "1px solid var(--color-border-tertiary)",
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: "8px 8px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {a.name}
                                    </td>
                                    <td
                                        style={{
                                            padding: "8px 8px",
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {a.role}
                                    </td>
                                    <td style={{ padding: "8px 8px" }}>
                                        <span
                                            style={{
                                                padding: "3px 10px",
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 500,
                                                background: sc.bg,
                                                color: sc.color,
                                            }}
                                        >
                                            {a.status}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            padding: "8px 8px",
                                            direction: "ltr",
                                            textAlign: "left",
                                        }}
                                    >
                                        {a.time}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 20,
                    }}
                >
                    <button className="btn bs" onClick={onClose}>
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CenterDashboard;
