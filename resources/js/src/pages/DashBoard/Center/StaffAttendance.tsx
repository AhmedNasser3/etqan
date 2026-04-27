// StaffAttendance.tsx - النسخة المتوافقة مع تصميم CertificatesManagement
import { useState } from "react";

const StaffAttendance: React.FC = () => {
    return (
        <div>
            {/* بطاقة جلسة الحضور */}
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
                                </span>{" "}
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
                                        background: "rgba(255,255,255,.08)",
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
                                        ? {
                                              background: "var(--red)",
                                          }
                                        : {}
                                }
                            >
                                {attRunning ? "إيقاف الجلسة" : "بدء الجلسة"}
                            </button>
                        </div>
                    </div>
                    <div className="att-stats">
                        {[
                            { n: pres, l: "حاضر" },
                            { n: late, l: "متأخر", c: "#fbbf24" },
                            { n: abs, l: "غائب", c: "#f87171" },
                            {
                                n: rate ? rate + "%" : "—",
                                l: "النسبة",
                            },
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
                            <div className="att-timer-big">{attTimer}</div>
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
                                onClick={() => nav("attendance")}
                            >
                                عرض التفاصيل
                            </button>
                            <button
                                className="btn bsm"
                                style={{
                                    background: "rgba(255,255,255,.08)",
                                    color: "#fff",
                                }}
                                onClick={() =>
                                    toast("تم تصدير تقرير الحضور", "ok")
                                }
                            >
                                تصدير PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* بطاقات KPI */}
            <div className="kpi-grid">
                {[
                    {
                        ico: "student",
                        cls: "ic-g",
                        trend: "t-up",
                        trv: "▲ 2",
                        n: d.students.length,
                        l: "إجمالي الطلاب",
                    },
                    {
                        ico: "globe",
                        cls: "ic-b",
                        trend: "t-fl",
                        trv: "● 0%",
                        n: d.circles.filter((c: Circle) => c.status === "نشطة")
                            .length,
                        l: "الحلقات النشطة",
                    },
                    {
                        ico: "clip",
                        cls: "ic-a",
                        trend: pendTasks > 3 ? "t-up" : "t-fl",
                        trv: pendTasks + " معلقة",
                        n: d.tasks.length,
                        l: "المهام الكلية",
                    },
                    {
                        ico: "money",
                        cls: "ic-p",
                        trend: "t-up",
                        trv: "▲ 5%",
                        n: totalDue.toLocaleString(),
                        l: "المستحقات (ر.س)",
                    },
                ].map((k, i) => (
                    <div key={i} className="kpi">
                        <div className="kpi-top">
                            <div className={`kpi-ico ${k.cls}`}>
                                {ICO[k.ico]}
                            </div>
                            <span className={`kpi-trend ${k.trend}`}>
                                {k.trv}
                            </span>
                        </div>
                        <div className="kpi-num">{k.n}</div>
                        <div className="kpi-lbl">{k.l}</div>
                    </div>
                ))}
            </div>
            <div className="g2">
                {/* إجراءات سريعة */}
                <div className="widget">
                    <div className="wh">
                        <span className="wh-l">إجراءات سريعة</span>
                    </div>
                    <div className="wb">
                        <div className="g3">
                            {[
                                {
                                    lbl: "طالب جديد",
                                    ico: "student",
                                    fn: () =>
                                        setModal({
                                            type: "addStudent",
                                        }),
                                    col: "var(--g100)",
                                    icol: "var(--g600)",
                                },
                                {
                                    lbl: "حلقة جديدة",
                                    ico: "globe",
                                    fn: () =>
                                        setModal({
                                            type: "addCircle",
                                        }),
                                    col: "#dbeafe",
                                    icol: "#2563eb",
                                },
                                {
                                    lbl: "تسجيل حضور",
                                    ico: "check",
                                    fn: () =>
                                        setModal({
                                            type: "recordAtt",
                                        }),
                                    col: "var(--g100)",
                                    icol: "var(--g600)",
                                },
                                {
                                    lbl: "مهمة جديدة",
                                    ico: "clip",
                                    fn: () =>
                                        setModal({
                                            type: "addTask",
                                        }),
                                    col: "#fef3c7",
                                    icol: "#d97706",
                                },
                                {
                                    lbl: "إنجاز طالب",
                                    ico: "star",
                                    fn: () =>
                                        setModal({
                                            type: "addIncentive",
                                        }),
                                    col: "#ede9fe",
                                    icol: "#7c3aed",
                                },
                                {
                                    lbl: "الطلبات المعلقة",
                                    ico: "clipboard",
                                    fn: () => nav("student-requests"),
                                    col: "#fee2e2",
                                    icol: "#ef4444",
                                },
                            ].map((q, i) => (
                                <div
                                    key={i}
                                    onClick={q.fn}
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
                                        ).style.borderColor = q.icol + "30";
                                    }}
                                    onMouseLeave={(e) => {
                                        (
                                            e.currentTarget as HTMLDivElement
                                        ).style.background = "var(--n50)";
                                        (
                                            e.currentTarget as HTMLDivElement
                                        ).style.borderColor = "var(--n200)";
                                    }}
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
                                            {ICO[q.ico]}
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
                {/* الحلقات النشطة */}
                <div className="widget">
                    <div className="wh">
                        <span className="wh-l">الحلقات النشطة</span>
                        <button
                            className="btn bp bsm"
                            onClick={() => nav("circles")}
                        >
                            إدارة الكل
                        </button>
                    </div>
                    <div style={{ padding: "0 14px" }}>
                        {d.circles.map((c: Circle, i: number) => (
                            <div
                                key={c.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 9,
                                    padding: "9px 0",
                                    borderBottom: "1px solid var(--n100)",
                                }}
                            >
                                <Av name={c.name} size={34} idx={i} />
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontSize: "11.5px",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {c.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "var(--n400)",
                                        }}
                                    >
                                        {c.teacher} · {c.students} طالب
                                    </div>
                                </div>
                                <BadgeStatus s={c.status} />
                                <button
                                    className="btn bs bxs"
                                    onClick={() =>
                                        toast("تعديل الحلقة قريباً", "inf")
                                    }
                                >
                                    تعديل
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* المهام المعلقة */}
            <div className="widget">
                <div className="wh">
                    <span className="wh-l">المهام المعلقة</span>
                    <button className="btn bp bsm" onClick={() => nav("tasks")}>
                        الكل
                    </button>
                </div>
                <div className="wb">
                    {d.tasks
                        .filter((t: Task) => !t.done)
                        .slice(0, 4)
                        .map((t: Task) => (
                            <TaskItemComp
                                key={t.id}
                                t={t}
                                mini
                                onToggle={toggleTask}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default StaffAttendance;
