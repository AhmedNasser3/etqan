import { useState, useEffect, useCallback } from "react";

interface SessionType {
    id: number;
    day_number: number;
    session_time: string;
    status: string;
    new_memorization: string | null;
    review_memorization: string | null;
    circle_student_booking_id: number;
    plan_id: number;
    circle_id: number;
    plan_circle_schedule_id: number;
    student_name: string;
    student_id: number | null;
    student_image: string | null;
}

interface TeacherSessionsData {
    success: boolean;
    sessions: SessionType[]; // ✅ sessions وليس session
    total: number;
    message?: string;
}

type ToastKind = "success" | "error" | "info";
interface ToastMsg {
    id: number;
    kind: ToastKind;
    text: string;
}
let _tid = 0;
function useToast() {
    const [toasts, setToasts] = useState<ToastMsg[]>([]);
    const push = useCallback((kind: ToastKind, text: string) => {
        const id = ++_tid;
        setToasts((p) => [...p, { id, kind, text }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    }, []);
    return { toasts, push };
}

function Avatar({ name, img }: { name: string; img: string | null }) {
    const colors = [
        "#5803d",
        "#0891b2",
        "#059669",
        "#d97706",
        "#dc2626",
        "#9333ea",
        "#0284c7",
    ];
    const color = colors[(name.charCodeAt(0) || 0) % colors.length];
    const initials = name
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
    if (img)
        return (
            <img
                src={img}
                alt={name}
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${color}44`,
                    flexShrink: 0,
                }}
            />
        );
    return (
        <div
            style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: color + "18",
                border: `2px solid ${color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color,
                flexShrink: 0,
            }}
        >
            {initials}
        </div>
    );
}

type RowStatus = "قيد الانتظار" | "مكتمل" | "غائب" | "إعادة";

interface RowState {
    status: RowStatus;
    note: string;
    rating: number;
    saved: boolean;
    saving: boolean;
    expanded: boolean;
}

const STATUS_OPTIONS: RowStatus[] = ["قيد الانتظار", "مكتمل", "غائب", "إعادة"];

const STATUS_STYLE: Record<
    RowStatus,
    { color: string; bg: string; dot: string }
> = {
    "قيد الانتظار": { color: "#92400e", bg: "#fef3c7", dot: "#f59e0b" },
    مكتمل: { color: "#15803d", bg: "#dcfce7", dot: "#22c55e" },
    غائب: { color: "#991b1b", bg: "#fee2e2", dot: "#ef4444" },
    إعادة: { color: "#1e40af", bg: "#dbeafe", dot: "#3b82f6" },
};

const TeacherSessionsTable: React.FC = () => {
    const [sessions, setSessions] = useState<SessionType[]>([]);
    const [rows, setRows] = useState<Record<number, RowState>>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [csrfToken, setCsrfToken] = useState("");
    const { toasts, push } = useToast();

    const fetchCsrf = useCallback(async () => {
        try {
            await fetch("/sanctum/csrf-cookie");
            const meta = document.querySelector(
                'meta[name="csrf-token"]',
            ) as HTMLMetaElement;
            if (meta) setCsrfToken(meta.getAttribute("content") || "");
        } catch {}
    }, []);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/v1/teachers/student-sessions", {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            const data: TeacherSessionsData = await res.json();
            if (data.success) {
                // ✅ data.sessions هي array مباشرة
                const list: SessionType[] = data.sessions ?? [];
                setSessions(list);

                const init: Record<number, RowState> = {};
                list.forEach((s) => {
                    init[s.id] = {
                        status: (s.status as RowStatus) ?? "قيد الانتظار",
                        note: "",
                        rating: s.attendance_rating ?? 0,
                        saved: false,
                        saving: false,
                        expanded: false,
                    };
                });
                setRows(init);

                if (list.length) push("success", `${list.length} جلسة جاهزة`);
                else push("info", "لا توجد جلسات حالياً");
            } else {
                push("error", data.message || "فشل في جلب البيانات");
            }
        } catch {
            push("error", "خطأ في الاتصال");
        } finally {
            setLoading(false);
        }
    }, [push]);

    useEffect(() => {
        fetchCsrf();
        fetchSessions();
    }, [fetchSessions, fetchCsrf]);

    const setRow = (id: number, patch: Partial<RowState>) =>
        setRows((p) => ({ ...p, [id]: { ...p[id], ...patch } }));

    const saveRow = async (session: SessionType) => {
        const row = rows[session.id];
        if (!row) return;
        setRow(session.id, { saving: true });
        try {
            const res = await fetch(
                "/api/v1/teachers/student-sessions/update",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify({
                        session_id: session.id,
                        status: row.status,
                        attendance_status:
                            row.status === "غائب" ? "غائب" : "حاضر",
                        note: row.note || null,
                        rating: row.rating || 0,
                    }),
                },
            );
            const data = await res.json();
            if (data.success) {
                setRow(session.id, {
                    saved: true,
                    saving: false,
                    expanded: false,
                });
                push("success", data.message || "تم الحفظ");
            } else {
                push("error", data.message || "فشل");
                setRow(session.id, { saving: false });
            }
        } catch {
            push("error", "خطأ في الحفظ");
            setRow(session.id, { saving: false });
        }
    };

    const filtered = sessions.filter(
        (s) => !search || s.student_name.includes(search),
    );

    const formatTime = (t: string) => {
        try {
            return new Date(t).toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch {
            return t;
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        @keyframes hq-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes hq-spin{to{transform:rotate(360deg)}}
        @keyframes hq-toast{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
        @keyframes hq-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes hq-expand{from{opacity:0;transform:scaleY(.9);transform-origin:top}to{opacity:1;transform:scaleY(1)}}

        .hq-wrap{
          direction:rtl;font-family:'Tajawal',sans-serif;
        }
        .hq-card{
          background:#fff;border-radius:16px;
          border:1px solid #ede9fe;
          box-shadow:0 2px 16px #5803d14;
          margin:0 auto;
          animation:hq-fadein .4s ease;
          overflow:hidden;
        }

        /* header */
        .hq-hdr{
          display:flex;align-items:center;justify-content:space-between;
          flex-wrap:wrap;gap:10px;
          padding:14px 20px;
          background:#1a6b4a;
        }
        .hq-title{font-size:16px;font-weight:700;color:#fff;display:flex;align-items:center;gap:7px}
        .hq-count{
          background:#ffffff28;border-radius:99px;
          font-size:12px;padding:2px 9px;color:#ddd6fe;font-weight:600;
        }
        .hq-hdr-right{display:flex;align-items:center;gap:8px}
        .hq-search{
          background:#ffffff22;border:1px solid #ffffff33;border-radius:99px;
          padding:6px 14px;font-size:13px;color:#fff;outline:none;
          font-family:'Tajawal',sans-serif;width:160px;transition:width .3s;
        }
        .hq-search::placeholder{color:#15803d}
        .hq-search:focus{width:200px;background:#ffffff33}
        .hq-btn-ref{
          background:#ffffff22;border:1px solid #ffffff33;border-radius:99px;
          padding:6px 13px;font-size:13px;color:#fff;cursor:pointer;
          font-family:'Tajawal',sans-serif;transition:all .2s;
        }
        .hq-btn-ref:hover{background:#ffffff33}
        .hq-btn-ref:disabled{opacity:.5;cursor:not-allowed}

        /* table */
        .hq-table-wrap{overflow-x:auto}
        table.hq-tbl{width:100%;border-collapse:collapse;font-size:13px}
        table.hq-tbl thead tr{background:#faf8ff;border-bottom:2px solid #ede9fe}
        table.hq-tbl th{
          padding:10px 14px;color:#1a6b4a;font-weight:700;
          font-size:12px;text-align:right;white-space:nowrap;
        }
        table.hq-tbl td{
          padding:0;border-bottom:1px solid #f5f3ff;
          vertical-align:middle;
        }
        .hq-row-main td{padding:10px 14px}
        .hq-row-main:hover{background:#fdfcff}
        .hq-row-expand td{padding:0}
        .hq-row-expand-inner{
          padding:12px 20px 16px;
          background:#faf8ff;border-bottom:2px solid #ede9fe;
          animation:hq-expand .25s ease;
          display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end;
        }

        /* student cell */
        .hq-student{padding:14px 6px ;display:flex;align-items:center;gap:9px;white-space:nowrap}
        .hq-name{font-size:13px;font-weight:700;color:#1f2937}
        .hq-time{font-size:11px;color:#9ca3af;margin-top:1px}

        /* memo cell */
        .hq-memo{
          font-size:12px;color:#374151;max-width:140px;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        }
        .hq-memo-empty{color:#d1d5db;font-style:italic}

        /* status select inline */
        .hq-status-sel{
          appearance:none;
          border:1.5px solid transparent;
          border-radius:99px;
          padding:3px 10px;font-size:12px;font-weight:700;
          font-family:'Tajawal',sans-serif;cursor:pointer;
          outline:none;transition:all .2s;background-size:0;
        }
        .hq-status-sel:focus{box-shadow:0 0 0 3px #1a6b4a22}

        /* stars inline */
        .hq-stars{display:flex;gap:1px}
        .hq-star{
          background:none;border:none;cursor:pointer;
          font-size:16px;padding:0;line-height:1;
          transition:transform .15s,color .15s;color:#e5e7eb;
        }
        .hq-star--on{color:#f59e0b}
        .hq-star:hover{transform:scale(1.2)}

        /* action buttons */
        .hq-actions{display:flex;align-items:center;gap:6px}
        .hq-btn{
          padding:5px 12px;border-radius:8px;font-size:12px;font-weight:700;
          font-family:'Tajawal',sans-serif;cursor:pointer;border:none;
          transition:all .2s;white-space:nowrap;
        }
        .hq-btn:active{transform:scale(.96)}
        .hq-btn:disabled{opacity:.5;cursor:not-allowed}
        .hq-btn--edit{background:#f3f0ff;color:#1a6b4a}
        .hq-btn--edit:hover{background:#ede9fe}
        .hq-btn--save{background:#1a6b4a;color:#fff}
        .hq-btn--save:hover:not(:disabled){background:#0e4b32}
        .hq-btn--cancel{background:#f3f4f6;color:#6b7280}
        .hq-btn--cancel:hover{background:#e5e7eb}
        .hq-btn--saved{background:#f0fdf4;color:#15803d;cursor:default}

        /* expand note field */
        .hq-note-inp{
          width:100%;padding:7px 10px;border-radius:8px;
          border:1.5px solid #ddd6fe;font-family:'Tajawal',sans-serif;
          font-size:13px;outline:none;background:#fff;color:#374151;
          transition:border-color .2s;
        }
        .hq-note-inp:focus{border-color:#1a6b4a;box-shadow:0 0 0 3px #1a6b4a12}
        .hq-note-inp::placeholder{color:#d1d5db}
        .hq-exp-status-sel{
          width:100%;padding:7px 10px;border-radius:8px;
          border:1.5px solid #ddd6fe;font-family:'Tajawal',sans-serif;
          font-size:13px;outline:none;background:#fff;color:#374151;cursor:pointer;
        }
        .hq-exp-status-sel:focus{border-color:#1a6b4a;box-shadow:0 0 0 3px #1a6b4a12}

        /* empty / loading */
        .hq-empty{text-align:center;padding:36px;color:#9ca3af;font-size:14px}
        .hq-spinner{
          display:inline-block;width:28px;height:28px;border-radius:50%;
          border:3px solid #ede9fe;border-top-color:#5803d;
          animation:hq-spin .7s linear infinite;
        }

        /* saved dot */
        .hq-dot{
          display:inline-block;width:8px;height:8px;border-radius:50%;
          margin-left:4px;flex-shrink:0;
        }

        /* ornament */
        .hq-orn{text-align:center;font-size:16px;color:#15803d;padding:10px;letter-spacing:5px}

        /* toast */
        .hq-toasts{position:fixed;bottom:20px;left:20px;z-index:9999;display:flex;flex-direction:column;gap:7px;pointer-events:none}
        .hq-toast{
          display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;
          font-size:13px;font-weight:600;font-family:'Tajawal',sans-serif;
          pointer-events:all;animation:hq-toast .3s ease;
          box-shadow:0 3px 14px #0002;min-width:180px;
        }
        .hq-toast--success{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}
        .hq-toast--error{background:#fff1f2;color:#be123c;border:1px solid #fecdd3}
        .hq-toast--info{background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe}

        @media(max-width:600px){
          .hq-col-memo,.hq-col-review{display:none}
          .hq-row-expand-inner{grid-template-columns:1fr;grid-template-rows:auto}
        }
      `}</style>

            {/* Toasts */}
            <div className="hq-toasts" dir="rtl">
                {toasts.map((t) => (
                    <div key={t.id} className={`hq-toast hq-toast--${t.kind}`}>
                        {t.kind === "success"
                            ? "✓"
                            : t.kind === "error"
                              ? "✕"
                              : "ℹ"}{" "}
                        {t.text}
                    </div>
                ))}
            </div>

            <div className="hq-wrap">
                <div className="hq-card">
                    {/* Header */}
                    <div className="hq-hdr">
                        <div className="hq-title">
                            ☽ جلسات الحصة
                            <span className="hq-count">
                                {filtered.length} طالب
                            </span>
                        </div>
                        <div className="hq-hdr-right">
                            <input
                                className="hq-search"
                                type="search"
                                placeholder="بحث..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                className="hq-btn-ref"
                                onClick={fetchSessions}
                                disabled={loading}
                            >
                                {loading ? "⏳" : "↻"} تحديث
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="hq-table-wrap">
                        <table className="hq-tbl">
                            <thead>
                                <tr>
                                    <th>الطالب</th>
                                    <th className="hq-col-memo">الحفظ اليوم</th>
                                    <th className="hq-col-review">المراجعة</th>
                                    <th>الحالة</th>
                                    <th>التقييم</th>
                                    <th>إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="hq-empty">
                                                <div className="hq-spinner" />
                                                <br />
                                                جارٍ التحميل...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="hq-empty">
                                                {search
                                                    ? `لا نتائج لـ "${search}"`
                                                    : "لا توجد جلسات حالياً"}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((s) => {
                                        const row = rows[s.id] ?? {
                                            status: s.status as RowStatus,
                                            note: "",
                                            rating: 0,
                                            saved: false,
                                            saving: false,
                                            expanded: false,
                                        };
                                        const st =
                                            STATUS_STYLE[row.status] ??
                                            STATUS_STYLE["قيد الانتظار"];

                                        return (
                                            <>
                                                {/* ── Main row ── */}
                                                <tr
                                                    key={`r-${s.id}`}
                                                    className="hq-row-main"
                                                >
                                                    {/* الطالب */}
                                                    <td>
                                                        <div className="hq-student">
                                                            <Avatar
                                                                name={
                                                                    s.student_name
                                                                }
                                                                img={
                                                                    s.student_image
                                                                }
                                                            />
                                                            <div>
                                                                <div className="hq-name">
                                                                    {
                                                                        s.student_name
                                                                    }
                                                                </div>
                                                                <div className="hq-time">
                                                                    {formatTime(
                                                                        s.session_time,
                                                                    )}{" "}
                                                                    · يوم{" "}
                                                                    {
                                                                        s.day_number
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* الحفظ */}
                                                    <td className="hq-col-memo">
                                                        <div
                                                            className={`hq-memo${!s.new_memorization ? " hq-memo-empty" : ""}`}
                                                        >
                                                            {s.new_memorization ||
                                                                "—"}
                                                        </div>
                                                    </td>

                                                    {/* المراجعة */}
                                                    <td className="hq-col-review">
                                                        <div
                                                            className={`hq-memo${!s.review_memorization ? " hq-memo-empty" : ""}`}
                                                        >
                                                            {s.review_memorization ||
                                                                "—"}
                                                        </div>
                                                    </td>

                                                    {/* الحالة — select سريع */}
                                                    <td>
                                                        <select
                                                            className="hq-status-sel"
                                                            value={row.status}
                                                            style={{
                                                                background:
                                                                    st.bg,
                                                                color: st.color,
                                                                borderColor:
                                                                    st.bg,
                                                            }}
                                                            onChange={(e) =>
                                                                setRow(s.id, {
                                                                    status: e
                                                                        .target
                                                                        .value as RowStatus,
                                                                    saved: false,
                                                                })
                                                            }
                                                        >
                                                            {STATUS_OPTIONS.map(
                                                                (o) => (
                                                                    <option
                                                                        key={o}
                                                                        value={
                                                                            o
                                                                        }
                                                                    >
                                                                        {o}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </td>

                                                    {/* النجوم */}
                                                    <td>
                                                        <div className="hq-stars">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((n) => (
                                                                <button
                                                                    key={n}
                                                                    type="button"
                                                                    className={`hq-star${n <= row.rating ? " hq-star--on" : ""}`}
                                                                    onClick={() =>
                                                                        setRow(
                                                                            s.id,
                                                                            {
                                                                                rating: n,
                                                                                saved: false,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    ★
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    {/* الإجراءات */}
                                                    <td>
                                                        <div className="hq-actions">
                                                            {row.saved ? (
                                                                <span className="hq-btn hq-btn--saved">
                                                                    ✓ محفوظ
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        className="hq-btn hq-btn--edit"
                                                                        onClick={() =>
                                                                            setRow(
                                                                                s.id,
                                                                                {
                                                                                    expanded:
                                                                                        !row.expanded,
                                                                                },
                                                                            )
                                                                        }
                                                                        title="ملاحظة"
                                                                    >
                                                                        {row.expanded
                                                                            ? "▲"
                                                                            : "✎ ملاحظة"}
                                                                    </button>
                                                                    <button
                                                                        className="hq-btn hq-btn--save"
                                                                        onClick={() =>
                                                                            saveRow(
                                                                                s,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            row.saving
                                                                        }
                                                                    >
                                                                        {row.saving
                                                                            ? "..."
                                                                            : "حفظ"}
                                                                    </button>
                                                                </>
                                                            )}
                                                            <span
                                                                className="hq-dot"
                                                                style={{
                                                                    background:
                                                                        st.dot,
                                                                }}
                                                                title={
                                                                    row.status
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* ── Expand row: ملاحظة ── */}
                                                {row.expanded && (
                                                    <tr
                                                        key={`e-${s.id}`}
                                                        className="hq-row-expand"
                                                    >
                                                        <td colSpan={6}>
                                                            <div className="hq-row-expand-inner">
                                                                <div>
                                                                    <div
                                                                        style={{
                                                                            fontSize: 11,
                                                                            color: "#5803d",
                                                                            fontWeight: 700,
                                                                            marginBottom: 5,
                                                                        }}
                                                                    >
                                                                        الحالة
                                                                        التفصيلية
                                                                    </div>
                                                                    <select
                                                                        className="hq-exp-status-sel"
                                                                        value={
                                                                            row.status
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setRow(
                                                                                s.id,
                                                                                {
                                                                                    status: e
                                                                                        .target
                                                                                        .value as RowStatus,
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        {STATUS_OPTIONS.map(
                                                                            (
                                                                                o,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        o
                                                                                    }
                                                                                    value={
                                                                                        o
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        o
                                                                                    }
                                                                                </option>
                                                                            ),
                                                                        )}
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <div
                                                                        style={{
                                                                            fontSize: 11,
                                                                            color: "#5803d",
                                                                            fontWeight: 700,
                                                                            marginBottom: 5,
                                                                        }}
                                                                    >
                                                                        ملاحظة
                                                                        (اختياري)
                                                                    </div>
                                                                    <input
                                                                        className="hq-note-inp"
                                                                        type="text"
                                                                        value={
                                                                            row.note
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setRow(
                                                                                s.id,
                                                                                {
                                                                                    note: e
                                                                                        .target
                                                                                        .value,
                                                                                },
                                                                            )
                                                                        }
                                                                        placeholder="اكتب ملاحظة..."
                                                                        maxLength={
                                                                            200
                                                                        }
                                                                    />
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        gap: 6,
                                                                    }}
                                                                >
                                                                    <button
                                                                        className="hq-btn hq-btn--save"
                                                                        onClick={() =>
                                                                            saveRow(
                                                                                s,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            row.saving
                                                                        }
                                                                    >
                                                                        {row.saving
                                                                            ? "..."
                                                                            : "💾 حفظ"}
                                                                    </button>
                                                                    <button
                                                                        className="hq-btn hq-btn--cancel"
                                                                        onClick={() =>
                                                                            setRow(
                                                                                s.id,
                                                                                {
                                                                                    expanded: false,
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        إلغاء
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="hq-orn">۞ ـ ۞ ـ ۞</div>
                </div>
            </div>
        </>
    );
};

export default TeacherSessionsTable;
