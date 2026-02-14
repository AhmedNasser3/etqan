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
    teacher_name?: string;
    teacher_role?: string;
}

const TeacherSessionsTable: React.FC = () => {
    const [session, setSession] = useState<SessionType | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // ✅ الـ editing states
    const [editing, setEditing] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState<"حاضر" | "غائب">(
        "غائب",
    );
    const [note, setNote] = useState("");
    const [rating, setRating] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [csrfToken, setCsrfToken] = useState("");

    const fetchTeacherSessions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/v1/teachers/student-sessions", {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            const data: TeacherSessionsData = await response.json();

            if (data.success && data.session) {
                setSession(data.session);
                if (data.total === 1) {
                    toast.success("تم جلب الجلسة الحالية بنجاح");
                }
            } else if (data.success && data.total === 0) {
                setSession(null);
                toast.success("لا توجد جلسات قيد الانتظار حالياً");
            } else {
                toast.error(data.message || "فشل في جلب البيانات");
                setSession(null);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("حدث خطأ في الاتصال");
            setSession(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ جلب CSRF Token
    const fetchCsrfToken = useCallback(async () => {
        try {
            const response = await fetch("/sanctum/csrf-cookie");
            const metaToken = document.querySelector(
                'meta[name="csrf-token"]',
            ) as HTMLMetaElement;
            if (metaToken) {
                setCsrfToken(metaToken.getAttribute("content") || "");
            }
        } catch (error) {
            console.error("Failed to fetch CSRF token:", error);
        }
    }, []);

    useEffect(() => {
        fetchCsrfToken();
        fetchTeacherSessions();
    }, [fetchTeacherSessions, fetchCsrfToken]);

    const formatTime = (timeString: string) => {
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        } catch {
            return timeString;
        }
    };

    // ✅ تحديث الجلسة مع CSRF Token
    const updateSessionStatus = async () => {
        if (!session) return;

        setUpdating(true);
        try {
            const response = await fetch(
                "/api/v1/teachers/student-sessions/update",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN": csrfToken, // ✅ CSRF Token
                    },
                    body: JSON.stringify({
                        session_id: session.id,
                        status:
                            session.status === "قيد الانتظار"
                                ? "مكتمل"
                                : "قيد الانتظار",
                        attendance_status: attendanceStatus,
                        note: note,
                        rating: rating,
                    }),
                },
            );

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                setEditing(false);
                fetchTeacherSessions();
            } else {
                toast.error(data.message || "فشل في التحديث");
            }
        } catch (error: any) {
            console.error("Error:", error);
            if (error.message.includes("CSRF")) {
                toast.error("خطأ في رمز الحماية، يرجى إعادة تحميل الصفحة");
                fetchCsrfToken();
            } else {
                toast.error("حدث خطأ في التحديث");
            }
        } finally {
            setUpdating(false);
        }
    };

    const stats = session
        ? {
              total: 1,
              current: 1,
              day: session.day_number,
          }
        : {
              total: 0,
              current: 0,
              day: 0,
          };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "مكتمل":
                return "bg-green-100 text-green-800";
            case "قيد الانتظار":
                return "bg-yellow-100 text-yellow-800";
            case "إعادة":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">
                        جاري تحميل الجلسات...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="userProfile__plan" style={{ padding: "0 15%" }}>
                {/* Stats Cards */}
                <div className="plan__stats">
                    <div className="stat-card">
                        <div className="stat-icon purpleColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>إجمالي الجلسات</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon greenColor">
                            <i>
                                <GrStatusGood />
                            </i>
                        </div>
                        <div>
                            <h3>الحالية</h3>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.current}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon yellowColor">
                            <i>
                                <GrStatusCritical />
                            </i>
                        </div>
                        <div>
                            <h3>اليوم رقم</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                {stats.day}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div
                    className="plan__daily-table"
                    style={{ paddingBottom: "24px" }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">الجلسة الحالية</h2>
                        <input
                            type="search"
                            placeholder="البحث بالطالب أو الحالة..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-3 py-2 border rounded-lg w-64"
                            disabled={!session}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table>
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        الطالب
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        اليوم
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        الوقت
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        الحالة
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        الحفظ الجديد
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        المراجعة
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {!session ||
                                (search &&
                                    !session.student_name.includes(search)) ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-12 text-gray-500"
                                        >
                                            <div className="space-y-2">
                                                <RiLoader4Line className="w-12 h-12 text-gray-300 mx-auto" />
                                                <p>
                                                    {session
                                                        ? `لا توجد نتائج لـ "${search}"`
                                                        : "لا توجد جلسات قيد الانتظار حالياً"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : session ? (
                                    <tr
                                        key={session.id}
                                        className="plan__row active hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            {session.student_image ? (
                                                <img
                                                    src={session.student_image}
                                                    alt={session.student_name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {session.student_name.charAt(
                                                        0,
                                                    )}
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-900">
                                                {session.student_name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-purple-600">
                                            {session.day_number}
                                        </td>
                                        <td className="px-4 py-3 text-blue-600 font-medium">
                                            {formatTime(session.session_time)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editing ? (
                                                <select
                                                    value={session.status}
                                                    onChange={(e) =>
                                                        setSession({
                                                            ...session,
                                                            status: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="px-3 py-1 border rounded-full text-xs font-medium bg-white"
                                                >
                                                    <option value="قيد الانتظار">
                                                        قيد الانتظار
                                                    </option>
                                                    <option value="مكتمل">
                                                        مكتمل
                                                    </option>
                                                    <option value="إعادة">
                                                        إعادة
                                                    </option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition-all ${getStatusColor(
                                                        session.status,
                                                    )}`}
                                                    onClick={() =>
                                                        setEditing(true)
                                                    }
                                                >
                                                    {session.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-green-600 font-medium">
                                            {session.new_memorization || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-purple-600">
                                            {session.review_memorization || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="font-medium text-gray-700">
                                                        الحضور:
                                                    </span>
                                                    {editing ? (
                                                        <select
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
                                                            className="px-2 py-1 border rounded text-xs bg-white"
                                                        >
                                                            <option value="حاضر">
                                                                حاضر
                                                            </option>
                                                            <option value="غائب">
                                                                غائب
                                                            </option>
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                                attendanceStatus ===
                                                                "حاضر"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {attendanceStatus}
                                                        </span>
                                                    )}
                                                </div>
                                                {editing ? (
                                                    <textarea
                                                        value={note}
                                                        onChange={(e) =>
                                                            setNote(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="اكتب ملاحظتك..."
                                                        className="w-32 p-2 border rounded text-xs resize-none"
                                                        rows={2}
                                                        maxLength={200}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-500 max-w-32 truncate">
                                                        {note || "لا ملاحظات"}
                                                    </span>
                                                )}
                                                {editing && (
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setRating(
                                                                            star,
                                                                        )
                                                                    }
                                                                    className={`text-lg ${
                                                                        star <=
                                                                        rating
                                                                            ? "text-yellow-400"
                                                                            : "text-gray-300 hover:text-yellow-400"
                                                                    }`}
                                                                >
                                                                    ⭐
                                                                </button>
                                                            ),
                                                        )}
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            {rating || 0}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    {session && (
                        <div className="flex justify-end mt-6 gap-3">
                            {editing ? (
                                <>
                                    <button
                                        onClick={updateSessionStatus}
                                        disabled={updating}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                                    >
                                        <GrStatusGood className="w-4 h-4" />
                                        {updating
                                            ? "جاري الحفظ..."
                                            : "حفظ التغييرات"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setNote("");
                                            setRating(0);
                                            setAttendanceStatus("غائب");
                                        }}
                                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 text-sm"
                                    >
                                        إلغاء
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                                >
                                    تعديل الجلسة
                                </button>
                            )}
                            <button
                                onClick={fetchTeacherSessions}
                                disabled={loading || updating}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <RiLoader4Line
                                    className={`w-4 h-4 ${loading || updating ? "animate-spin" : ""}`}
                                />
                                تحديث
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TeacherSessionsTable;
