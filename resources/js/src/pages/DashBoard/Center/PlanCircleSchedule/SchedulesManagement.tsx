// SchedulesManagement.tsx — نسخة مُعاد تصميمها
import React, { useState, useEffect, useCallback } from "react";
import UpdateSchedulePage from "./models/UpdateSchedulePage";
import CreateSchedulePage from "./models/CreateSchedulePage";
import { usePlanSchedules, ScheduleType } from "./hooks/usePlanSchedules";
import { ICO } from "../../icons";
import { useToast } from "../../../../../contexts/ToastContext";
import {
    FiPlus,
    FiSearch,
    FiX,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiUsers,
    FiCopy,
    FiBook,
} from "react-icons/fi";

/* ══════════════════════════════════════════════
   Types
══════════════════════════════════════════════ */
interface ConfirmModalProps {
    title: string;
    desc?: string;
    cb: () => void;
}

/* ══════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════ */
const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

const Avatar = ({ name, idx }: { name: string; idx: number }) => {
    const av = AV_COLORS[idx % AV_COLORS.length];
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
    return (
        <div
            style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: av.bg,
                color: av.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
                fontFamily: "'Tajawal',sans-serif",
            }}
        >
            {initials}
        </div>
    );
};

/* ══════════════════════════════════════════════
   Main
══════════════════════════════════════════════ */
const SchedulesManagement: React.FC = () => {
    const {
        schedules: schedulesFromHook,
        loading,
        refetch,
    } = usePlanSchedules();
    const { notifySuccess, notifyError } = useToast();

    const [search, setSearch] = useState("");
    const [schedules, setSchedules] = useState<ScheduleType[]>([]);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] =
        useState<ScheduleType | null>(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
        null,
    );
    const [confirm, setConfirm] = useState<ConfirmModalProps | null>(null);
    const [sessionRunning, setSessionRunning] = useState(false);

    useEffect(() => {
        setSchedules(schedulesFromHook);
    }, [schedulesFromHook]);

    const filteredSchedules = schedules.filter(
        (s) =>
            s.plan.plan_name.toLowerCase().includes(search.toLowerCase()) ||
            (s.circle?.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (s.teacher?.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()),
    );

    /* helpers */
    const getCircleName = (s: ScheduleType) => s.circle?.name || "غير محدد";
    const getTeacherName = (s: ScheduleType) => s.teacher?.name || "غير محدد";
    const getAvailabilityText = (s: ScheduleType) => {
        if (!s.is_available) return { text: "غير متاح", avail: false };
        if (s.max_students === null) return { text: "مفتوح", avail: true };
        const rem = (s.max_students || 0) - s.booked_students;
        return { text: `${rem} / ${s.max_students}`, avail: rem > 0 };
    };

    /* stats */
    const totalSchedules = schedules.length;
    const availableCount = schedules.filter((s) => s.is_available).length;
    const bookedCount = schedules.reduce(
        (acc, s) => acc + (s.booked_students || 0),
        0,
    );
    const unavailCount = schedules.filter((s) => !s.is_available).length;

    /* handlers */
    const handleEdit = (s: ScheduleType) => {
        setSelectedSchedule(s);
        setSelectedScheduleId(s.id);
        setShowUpdateModal(true);
    };

    const handleDelete = (id: number) => {
        setConfirm({
            title: "حذف الموعد",
            desc: "هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع.",
            cb: async () => {
                try {
                    const csrf = document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content");
                    if (!csrf) {
                        notifyError("فشل في جلب رمز الحماية");
                        setConfirm(null);
                        return;
                    }
                    const res = await fetch(`/api/v1/plans/schedules/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                            "X-CSRF-TOKEN": csrf,
                        },
                    });
                    const result = await res.json();
                    if (res.ok && result.success) {
                        notifySuccess("تم حذف الموعد بنجاح");
                        setSchedules((prev) => prev.filter((s) => s.id !== id));
                    } else {
                        notifyError(result.message || "فشل في حذف الموعد");
                    }
                } catch {
                    notifyError("حدث خطأ في الحذف");
                } finally {
                    setConfirm(null);
                }
            },
        });
    };

    const handleCopyJitsiUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        notifySuccess("تم نسخ رابط الغرفة!");
    };

    /* ── shared card button style ── */
    const editBtn: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 12px",
        borderRadius: 8,
        border: "1px solid #B5D4F4",
        background: "#E6F1FB",
        color: "#0C447C",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "inherit",
    };
    const delBtn: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 12px",
        borderRadius: 8,
        border: "1px solid #fecaca",
        background: "#fee2e2",
        color: "#b91c1c",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "inherit",
    };

    /* ════════════════════════════════════════
       RENDER
    ════════════════════════════════════════ */
    return (
        <div
            style={{
                fontFamily: "'Tajawal',sans-serif",
                direction: "rtl",
                background: "#f8fafc",
                minHeight: "100vh",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            {/* ── Modals ── */}
            {showUpdateModal && selectedSchedule && selectedScheduleId && (
                <UpdateSchedulePage
                    scheduleId={selectedScheduleId}
                    initialSchedule={selectedSchedule}
                    onClose={() => {
                        setShowUpdateModal(false);
                        setSelectedSchedule(null);
                        setSelectedScheduleId(null);
                    }}
                    onSuccess={() => {
                        notifySuccess("تم تحديث الموعد بنجاح");
                        refetch();
                    }}
                />
            )}
            {showCreateModal && (
                <CreateSchedulePage
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        notifySuccess("تم إضافة الموعد بنجاح");
                        refetch();
                    }}
                />
            )}

            {/* ── Confirm Modal ── */}
            {confirm && (
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
                        padding: 16,
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            padding: "28px 28px 24px",
                            maxWidth: 400,
                            width: "100%",
                            textAlign: "center",
                            boxShadow: "0 8px 40px #0002",
                        }}
                    >
                        <div
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: "50%",
                                background: "#fee2e2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                                color: "#dc2626",
                                fontSize: 22,
                            }}
                        >
                            <FiTrash2 size={22} />
                        </div>
                        <div
                            style={{
                                fontSize: 16,
                                fontWeight: 900,
                                color: "#1e293b",
                                marginBottom: 8,
                            }}
                        >
                            {confirm.title}
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "#64748b",
                                marginBottom: 24,
                                lineHeight: 1.6,
                            }}
                        >
                            {confirm.desc}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                onClick={confirm.cb}
                                style={{
                                    padding: "9px 24px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#dc2626",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                تأكيد الحذف
                            </button>
                            <button
                                onClick={() => setConfirm(null)}
                                style={{
                                    padding: "9px 24px",
                                    borderRadius: 10,
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontFamily: "inherit",
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════
                HERO HEADER
            ══════════════════════════════ */}
            <div
                style={{
                    background: "linear-gradient(135deg,#1e293b,#0f4c35)",
                    borderRadius: 24,
                    padding: "28px 32px",
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.05,
                        backgroundImage:
                            "radial-gradient(circle at 20% 50%,#fff 1px,transparent 1px)",
                        backgroundSize: "24px 24px",
                        pointerEvents: "none",
                    }}
                />
                <div style={{ position: "relative" }}>
                    {/* top row */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 16,
                            marginBottom: 22,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#86efac",
                                    marginBottom: 4,
                                    letterSpacing: ".5px",
                                }}
                            >
                                ﷽ — منصة إتقان
                            </div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: 22,
                                    fontWeight: 900,
                                }}
                            >
                                مواعيد الحلقات
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                إدارة وجدولة مواعيد حلقات الحفظ والمراجعة
                            </p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexWrap: "wrap",
                            }}
                        >
                            {sessionRunning && (
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        background: "rgba(255,255,255,.1)",
                                        padding: "5px 12px",
                                        borderRadius: 20,
                                        fontSize: 11,
                                        color: "rgba(255,255,255,.8)",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: "50%",
                                            background: "#4ade80",
                                            display: "inline-block",
                                            animation:
                                                "schd-pulse 1.4s ease-in-out infinite",
                                        }}
                                    />
                                    جلسة جارية
                                </span>
                            )}
                            <button
                                onClick={() => setSessionRunning((p) => !p)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "7px 14px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,.2)",
                                    background: sessionRunning
                                        ? "#dc2626"
                                        : "rgba(255,255,255,.12)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                {sessionRunning ? (
                                    <>
                                        <FiXCircle size={12} /> إيقاف الجلسة
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle size={12} /> بدء الجلسة
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "7px 14px",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,.2)",
                                    background: "rgba(255,255,255,.12)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                <FiPlus size={12} /> موعد جديد
                            </button>
                        </div>
                    </div>

                    {/* stats bar */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            {
                                label: "إجمالي المواعيد",
                                value: totalSchedules,
                                color: "rgba(255,255,255,.9)",
                            },
                            {
                                label: "متاح",
                                value: availableCount,
                                color: "#4ade80",
                            },
                            {
                                label: "غير متاح",
                                value: unavailCount,
                                color: "#f87171",
                            },
                            {
                                label: "إجمالي الحجوزات",
                                value: bookedCount,
                                color: "#38bdf8",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                style={{
                                    background: "rgba(255,255,255,.07)",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    textAlign: "center",
                                    minWidth: 80,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 900,
                                        color: s.color,
                                        lineHeight: 1,
                                    }}
                                >
                                    {s.value}
                                </div>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "rgba(255,255,255,.45)",
                                        marginTop: 3,
                                    }}
                                >
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════
                TOOLBAR + CARDS
            ══════════════════════════════ */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    boxShadow: "0 2px 14px #0001",
                    overflow: "hidden",
                }}
            >
                {/* header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        flexWrap: "wrap",
                        gap: 10,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontWeight: 900,
                                fontSize: 15,
                                color: "#1e293b",
                            }}
                        >
                            قائمة المواعيد
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            {search
                                ? `${filteredSchedules.length} نتيجة من ${totalSchedules}`
                                : `${totalSchedules} موعد`}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 16px",
                            borderRadius: 10,
                            border: "none",
                            background: "#0f6e56",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "inherit",
                        }}
                    >
                        <FiPlus size={14} /> موعد جديد
                    </button>
                </div>

                {/* search toolbar */}
                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        padding: "12px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        background: "#fafbfc",
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            background: "#fff",
                            borderRadius: 10,
                            padding: "7px 12px",
                            flex: 1,
                            minWidth: 200,
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <FiSearch size={13} color="#94a3b8" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث بالخطة أو الحلقة أو المعلم..."
                            style={{
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: 12,
                                flex: 1,
                                fontFamily: "inherit",
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    color: "#94a3b8",
                                    display: "flex",
                                    padding: 0,
                                }}
                            >
                                <FiX size={11} />
                            </button>
                        )}
                    </label>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {filteredSchedules.length} نتيجة
                    </span>
                </div>

                {/* cards list */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                margin: "0 auto",
                                border: "3px solid #dbeafe",
                                borderTopColor: "#2563eb",
                                borderRadius: "50%",
                                animation: "schd-spin .7s linear infinite",
                            }}
                        />
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "50px 20px",
                            color: "#94a3b8",
                        }}
                    >
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🗓️</div>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                marginBottom: 4,
                            }}
                        >
                            {search
                                ? "لا توجد نتائج مطابقة"
                                : "لا توجد مواعيد بعد"}
                        </div>
                        <div style={{ fontSize: 12, marginBottom: 20 }}>
                            أضف أول موعد لحلقاتك الآن
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "9px 20px",
                                borderRadius: 10,
                                border: "none",
                                background: "#0f6e56",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiPlus size={14} /> إضافة موعد
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {filteredSchedules.map(
                            (s: ScheduleType, idx: number) => {
                                const av = getAvailabilityText(s);
                                const circle = getCircleName(s);
                                const teacher = getTeacherName(s);
                                return (
                                    <div
                                        key={s.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 14,
                                            padding: "14px 20px",
                                            borderBottom: "1px solid #f8fafc",
                                            transition: "background .1s",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background =
                                                "#f8fafc")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background =
                                                "#fff")
                                        }
                                    >
                                        {/* time block */}
                                        <div
                                            style={{
                                                minWidth: 60,
                                                background: "#E1F5EE",
                                                border: "1px solid #9FE1CB",
                                                borderRadius: 10,
                                                padding: "8px 6px",
                                                textAlign: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 900,
                                                    color: "#085041",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {s.start_time?.slice(0, 5)}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    color: "#0F6E56",
                                                    marginTop: 3,
                                                }}
                                            >
                                                → {s.end_time?.slice(0, 5)}
                                            </div>
                                        </div>

                                        {/* avatar */}
                                        <Avatar name={circle} idx={idx} />

                                        {/* info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: 13,
                                                    color: "#1e293b",
                                                    marginBottom: 3,
                                                }}
                                            >
                                                {circle}
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    flexWrap: "wrap",
                                                    fontSize: 11,
                                                    color: "#64748b",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 3,
                                                    }}
                                                >
                                                    <FiBook
                                                        size={10}
                                                        style={{
                                                            color: "#0f6e56",
                                                        }}
                                                    />{" "}
                                                    {s.plan.plan_name}
                                                </span>
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 3,
                                                    }}
                                                >
                                                    <FiUsers
                                                        size={10}
                                                        style={{
                                                            color: "#2563eb",
                                                        }}
                                                    />{" "}
                                                    {teacher}
                                                </span>
                                                {s.jitsi_room_url && (
                                                    <button
                                                        onClick={() =>
                                                            handleCopyJitsiUrl(
                                                                s.jitsi_room_url!,
                                                            )
                                                        }
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 3,
                                                            border: "none",
                                                            background: "none",
                                                            color: "#7c3aed",
                                                            cursor: "pointer",
                                                            fontSize: 11,
                                                            fontFamily:
                                                                "inherit",
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <FiCopy size={10} /> نسخ
                                                        رابط الغرفة
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* availability badge */}
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 5,
                                                padding: "4px 10px",
                                                borderRadius: 20,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                whiteSpace: "nowrap",
                                                background: av.avail
                                                    ? "#dcfce7"
                                                    : "#fee2e2",
                                                color: av.avail
                                                    ? "#15803d"
                                                    : "#b91c1c",
                                                border: `1px solid ${av.avail ? "#bbf7d0" : "#fecaca"}`,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 5,
                                                    height: 5,
                                                    borderRadius: "50%",
                                                    background: av.avail
                                                        ? "#16a34a"
                                                        : "#dc2626",
                                                    display: "inline-block",
                                                }}
                                            />
                                            {av.text}
                                        </span>

                                        {/* action buttons */}
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 6,
                                                flexShrink: 0,
                                            }}
                                        >
                                            <button
                                                style={editBtn}
                                                onClick={() => handleEdit(s)}
                                            >
                                                <FiEdit2 size={11} /> تعديل
                                            </button>
                                            <button
                                                style={delBtn}
                                                onClick={() =>
                                                    handleDelete(s.id)
                                                }
                                            >
                                                <FiTrash2 size={11} /> حذف
                                            </button>
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                )}

                {/* footer add button */}
                {filteredSchedules.length > 0 && (
                    <div
                        style={{
                            padding: "12px 20px",
                            borderTop: "1px solid #f1f5f9",
                            background: "#fafbfc",
                        }}
                    >
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "7px 16px",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                color: "#0f6e56",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiPlus size={13} /> إضافة موعد آخر
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes schd-spin  { to { transform: rotate(360deg); } }
                @keyframes schd-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
            `}</style>
        </div>
    );
};

export default SchedulesManagement;
