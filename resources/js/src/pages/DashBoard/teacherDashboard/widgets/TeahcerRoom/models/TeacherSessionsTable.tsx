import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GrStatusGood, GrStatusCritical } from "react-icons/gr";
import { RiLoader4Line } from "react-icons/ri";

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
    session: SessionType | null;
    total: number;
    message?: string;
}

const TeacherSessionsTable: React.FC = () => {
    const [session, setSession] = useState<SessionType | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState<"حاضر" | "غائب">(
        "غائب",
    );
    const [sessionStatus, setSessionStatus] = useState<
        "مكتمل" | "غائب" | "قيد الانتظار" | "إعادة"
    >("قيد الانتظار");
    const [note, setNote] = useState("");
    const [rating, setRating] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [csrfToken, setCsrfToken] = useState("");

    const fetchTeacherSessions = useCallback(async () => {
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
            if (data.success && data.session) {
                setSession(data.session);
                setAttendanceStatus(
                    data.session.status === "غائب" ? "غائب" : "حاضر",
                );
                setSessionStatus(data.session.status as any);
                setNote("");
                setRating(0);
                if (data.total === 1)
                    toast.success("تم جلب الجلسة الحالية بنجاح");
            } else if (data.success && data.total === 0) {
                setSession(null);
                toast.success("لا توجد جلسات قيد الانتظار");
            } else {
                toast.error(data.message || "فشل في جلب البيانات");
                setSession(null);
            }
        } catch {
            toast.error("حدث خطأ في الاتصال");
            setSession(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCsrf = useCallback(async () => {
        try {
            await fetch("/sanctum/csrf-cookie");
            const meta = document.querySelector(
                'meta[name="csrf-token"]',
            ) as HTMLMetaElement;
            if (meta) setCsrfToken(meta.getAttribute("content") || "");
        } catch {}
    }, []);

    useEffect(() => {
        fetchCsrf();
        fetchTeacherSessions();
    }, [fetchTeacherSessions, fetchCsrf]);

    const formatTime = (t: string) => {
        try {
            return new Date(t).toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        } catch {
            return t;
        }
    };

    const updateSession = async () => {
        if (!session) return;
        setUpdating(true);
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
                        status: sessionStatus,
                        attendance_status: attendanceStatus,
                        note: note || null,
                        rating: rating || 0,
                    }),
                },
            );
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setEditing(false);
                fetchTeacherSessions();
            } else toast.error(data.message || "فشل في التحديث");
        } catch (e: any) {
            if (e?.message?.includes("CSRF")) {
                toast.error("خطأ في رمز الحماية");
                fetchCsrf();
            } else toast.error("حدث خطأ في التحديث");
        } finally {
            setUpdating(false);
        }
    };

    const badgeClass = (s: string) => {
        if (["مكتمل", "حاضر"].includes(s)) return "ts-badge--green";
        if (s === "قيد الانتظار") return "ts-badge--amber";
        return "ts-badge--red";
    };

    const stats = {
        total: session ? 1 : 0,
        current: session ? 1 : 0,
        day: session?.day_number ?? 0,
    };

    if (loading) {
        return (
            <div className="ts-wrap">
                <div className="ts-card">
                    <div className="ts-header">
                        <span className="ts-title">الجلسة الحالية</span>
                    </div>
                    <div className="ts-loading">
                        <div className="ts-spinner" />
                        <p>جارٍ تحميل الجلسة...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        fontFamily: "inherit",
                        fontSize: 13,
                        direction: "rtl",
                    },
                }}
            />
            <div className="ts-wrap">
                <div className="ts-card">
                    {/* ── هيدر ── */}
                    <div className="ts-header">
                        <span className="ts-title">الجلسة الحالية</span>
                        <div className="ts-header-actions">
                            <input
                                className="ts-search"
                                placeholder="بحث بالطالب أو الحالة..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={!session}
                            />
                            <button
                                className="ts-btn ts-btn--primary"
                                onClick={fetchTeacherSessions}
                                disabled={loading || updating}
                            >
                                تحديث
                            </button>
                        </div>
                    </div>

                    {/* ── إحصائيات ── */}
                    <div className="ts-stats">
                        <div className="ts-stat">
                            <div className="ts-stat-ico ts-stat-ico--purple">
                                <GrStatusGood size={15} />
                            </div>
                            <div>
                                <div className="ts-stat-lbl">
                                    إجمالي الجلسات
                                </div>
                                <div className="ts-stat-val ts-stat-val--purple">
                                    {stats.total}
                                </div>
                            </div>
                        </div>
                        <div className="ts-stat">
                            <div className="ts-stat-ico ts-stat-ico--green">
                                <GrStatusGood size={15} />
                            </div>
                            <div>
                                <div className="ts-stat-lbl">الحالية</div>
                                <div className="ts-stat-val ts-stat-val--green">
                                    {stats.current}
                                </div>
                            </div>
                        </div>
                        <div className="ts-stat">
                            <div className="ts-stat-ico ts-stat-ico--amber">
                                <GrStatusCritical size={15} />
                            </div>
                            <div>
                                <div className="ts-stat-lbl">اليوم رقم</div>
                                <div className="ts-stat-val ts-stat-val--amber">
                                    {stats.day}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── الجدول ── */}
                    <div className="ts-table-wrap">
                        <table className="ts-table">
                            <thead>
                                <tr>
                                    <th>الطالب</th>
                                    <th>اليوم</th>
                                    <th>الوقت</th>
                                    <th>الحالة</th>
                                    <th>الحفظ الجديد</th>
                                    <th>المراجعة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!session ||
                                (search &&
                                    !session.student_name.includes(search)) ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="ts-empty">
                                                <RiLoader4Line className="ts-empty-ico" />
                                                <p>
                                                    {session
                                                        ? `لا نتائج لـ "${search}"`
                                                        : "لا توجد جلسات قيد الانتظار"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr className="ts-row">
                                        {/* الطالب */}
                                        <td>
                                            <div className="ts-student">
                                                {session.student_image ? (
                                                    <img
                                                        src={
                                                            session.student_image
                                                        }
                                                        alt={
                                                            session.student_name
                                                        }
                                                        className="ts-av-img"
                                                    />
                                                ) : (
                                                    <div className="ts-av">
                                                        {session.student_name.charAt(
                                                            0,
                                                        )}
                                                    </div>
                                                )}
                                                <span className="ts-student-name">
                                                    {session.student_name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* اليوم */}
                                        <td className="ts-day">
                                            {session.day_number}
                                        </td>

                                        {/* الوقت */}
                                        <td className="ts-time">
                                            {formatTime(session.session_time)}
                                        </td>

                                        {/* الحالة */}
                                        <td>
                                            {editing ? (
                                                <select
                                                    className="ts-select"
                                                    value={sessionStatus}
                                                    onChange={(e) =>
                                                        setSessionStatus(
                                                            e.target
                                                                .value as any,
                                                        )
                                                    }
                                                >
                                                    <option value="قيد الانتظار">
                                                        قيد الانتظار
                                                    </option>
                                                    <option value="مكتمل">
                                                        مكتمل
                                                    </option>
                                                    <option value="غائب">
                                                        غائب
                                                    </option>
                                                    <option value="إعادة">
                                                        إعادة
                                                    </option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`ts-badge ${badgeClass(session.status)}`}
                                                    onClick={() =>
                                                        setEditing(true)
                                                    }
                                                    title="اضغط للتعديل"
                                                >
                                                    {session.status}
                                                </span>
                                            )}
                                        </td>

                                        {/* الحفظ */}
                                        <td className="ts-hifz">
                                            {session.new_memorization || "—"}
                                        </td>

                                        {/* المراجعة */}
                                        <td className="ts-review">
                                            {session.review_memorization || "—"}
                                        </td>

                                        {/* الإجراءات */}
                                        <td>
                                            <div className="ts-actions-col">
                                                {editing ? (
                                                    <>
                                                        <select
                                                            className="ts-select ts-select--sm"
                                                            value={
                                                                attendanceStatus
                                                            }
                                                            onChange={(e) =>
                                                                setAttendanceStatus(
                                                                    e.target
                                                                        .value as
                                                                        | "حاضر"
                                                                        | "غائب",
                                                                )
                                                            }
                                                        >
                                                            <option value="حاضر">
                                                                حاضر
                                                            </option>
                                                            <option value="غائب">
                                                                غائب
                                                            </option>
                                                        </select>
                                                        <textarea
                                                            className="ts-textarea"
                                                            value={note}
                                                            onChange={(e) =>
                                                                setNote(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="ملاحظة..."
                                                            rows={2}
                                                            maxLength={200}
                                                        />
                                                        <div className="ts-stars">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((s) => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    className={`ts-star${s <= rating ? " ts-star--on" : ""}`}
                                                                    onClick={() =>
                                                                        setRating(
                                                                            s,
                                                                        )
                                                                    }
                                                                >
                                                                    ★
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span
                                                            className={`ts-badge ${badgeClass(attendanceStatus)}`}
                                                        >
                                                            {attendanceStatus}
                                                        </span>
                                                        <span className="ts-note-preview">
                                                            {note ||
                                                                "لا ملاحظات"}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── الزخرفة الإسلامية ── */}
                    <div className="ts-ornament">۞ ـــ ۞ ـــ ۞</div>

                    {/* ── الإجراءات السفلية ── */}
                    {session && (
                        <div className="ts-footer">
                            {editing ? (
                                <>
                                    <button
                                        className="ts-btn ts-btn--primary"
                                        onClick={updateSession}
                                        disabled={updating}
                                    >
                                        {updating
                                            ? "جارٍ الحفظ..."
                                            : "حفظ التغييرات"}
                                    </button>
                                    <button
                                        className="ts-btn ts-btn--ghost"
                                        onClick={() => {
                                            setEditing(false);
                                            setAttendanceStatus(
                                                session.status === "غائب"
                                                    ? "غائب"
                                                    : "حاضر",
                                            );
                                            setSessionStatus(
                                                session.status as any,
                                            );
                                            setNote("");
                                            setRating(0);
                                        }}
                                    >
                                        إلغاء
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="ts-btn ts-btn--ghost"
                                    onClick={() => {
                                        setEditing(true);
                                        setAttendanceStatus(
                                            session.status === "غائب"
                                                ? "غائب"
                                                : "حاضر",
                                        );
                                        setSessionStatus(session.status as any);
                                    }}
                                >
                                    تعديل الجلسة
                                </button>
                            )}
                            <button
                                className="ts-btn ts-btn--outline"
                                onClick={fetchTeacherSessions}
                                disabled={loading || updating}
                            >
                                تحديث الصفحة
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TeacherSessionsTable;
