// StudentBookingsManagement.tsx — نسخة مُعاد تصميمها
import React, { useState, useCallback, useMemo } from "react";
import { useToast } from "../../../../../contexts/ToastContext";
import {
    useStudentBookings,
    StudentBookingType,
} from "./hooks/useStudentBookings";
import {
    FiSearch,
    FiX,
    FiGrid,
    FiList,
    FiRotateCcw,
    FiCheckCircle,
    FiXCircle,
} from "react-icons/fi";

type ViewMode = "table" | "cards";
type CapacityFilter = "" | "available" | "full";

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

const CapacityBadge = ({ booking }: { booking: StudentBookingType }) => {
    const ok = booking.can_confirm;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: ok ? "#dcfce7" : "#fee2e2",
                color: ok ? "#15803d" : "#b91c1c",
                border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}`,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap" as const,
            }}
        >
            <span
                style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: ok ? "#16a34a" : "#ef4444",
                    display: "inline-block",
                }}
            />
            {booking.remaining_slots === null
                ? "غير محدود"
                : ok
                  ? `${booking.remaining_slots} متاح`
                  : "مكتمل"}
        </span>
    );
};

const formatTime = (timeRange: string) => {
    try {
        return timeRange
            .split(" - ")
            .map((t) => {
                const [, time] = t.split(" ");
                const [h, m] = time.split(":");
                const hour12 = parseInt(h) % 12 || 12;
                return `${hour12}:${m.padStart(2, "0")} ${parseInt(h) >= 12 ? "م" : "ص"}`;
            })
            .join(" - ");
    } catch {
        return timeRange;
    }
};

const StudentBookingsManagement: React.FC = () => {
    const {
        bookings = [],
        loading,
        pagination,
        currentPage,
        searchBookings,
        goToPage,
        confirmBooking,
        refetch,
    } = useStudentBookings();
    const { notifySuccess, notifyError } = useToast();

    const [search, setSearch] = useState("");
    const [capacityFilter, setCapacityFilter] = useState<CapacityFilter>("");
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [confirmingId, setConfirmingId] = useState<number | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingBooking, setPendingBooking] =
        useState<StudentBookingType | null>(null);
    const [confirming, setConfirming] = useState(false);

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            searchBookings(value);
        },
        [searchBookings],
    );

    const filteredBookings = useMemo(
        () =>
            bookings.filter((b) => {
                const matchCapacity =
                    capacityFilter === "" ||
                    (capacityFilter === "available" && b.can_confirm) ||
                    (capacityFilter === "full" && !b.can_confirm);
                return matchCapacity;
            }),
        [bookings, capacityFilter],
    );

    const totalAvailable = bookings.filter((b) => b.can_confirm).length;
    const totalFull = bookings.filter((b) => !b.can_confirm).length;

    const handleConfirmClick = (booking: StudentBookingType) => {
        if (!booking.can_confirm) {
            notifyError("عدد الطلاب مكتمل في هذه الحلقة");
            return;
        }
        setPendingBooking(booking);
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        if (!pendingBooking) return;
        setConfirming(true);
        try {
            const result = await confirmBooking(pendingBooking.id);
            if (result.success) {
                notifySuccess(result.message);
                refetch();
                setShowConfirmModal(false);
                setPendingBooking(null);
            } else {
                notifyError(result.message || "فشل في قبول الطالب");
            }
        } catch (error: any) {
            notifyError(error.message || "حدث خطأ في قبول الطالب");
        } finally {
            setConfirming(false);
        }
    };

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < (pagination?.last_page || 1);

    const TH: React.CSSProperties = {
        padding: "10px 16px",
        textAlign: "right",
        color: "#64748b",
        fontWeight: 700,
        fontSize: 11,
        whiteSpace: "nowrap",
        borderBottom: "1px solid #f1f5f9",
        background: "#f8fafc",
    };
    const TD: React.CSSProperties = {
        padding: "13px 16px",
        borderBottom: "1px solid #f8fafc",
        verticalAlign: "middle",
        fontSize: 13,
        color: "#1e293b",
    };

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
            {/* ── Confirm Modal ── */}
            {showConfirmModal && pendingBooking && (
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
                            background: "#fff",
                            borderRadius: 20,
                            padding: "32px 28px",
                            maxWidth: 440,
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 20px 60px #0003",
                        }}
                    >
                        <div
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: "50%",
                                background: "#dcfce7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                            }}
                        >
                            <FiCheckCircle size={24} color="#16a34a" />
                        </div>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 900,
                                color: "#1e293b",
                                marginBottom: 8,
                            }}
                        >
                            قبول الطالب
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "#64748b",
                                marginBottom: 6,
                            }}
                        >
                            هل تريد قبول الطالب
                        </div>
                        <div
                            style={{
                                fontSize: 15,
                                fontWeight: 900,
                                color: "#0C447C",
                                marginBottom: 6,
                            }}
                        >
                            {pendingBooking.student_name}
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "#64748b",
                                marginBottom: 24,
                            }}
                        >
                            في الخطة <strong>{pendingBooking.plan_name}</strong>
                            ؟
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                onClick={handleConfirmSubmit}
                                disabled={confirming}
                                style={{
                                    padding: "8px 24px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#0f6e56",
                                    color: "#fff",
                                    cursor: confirming
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    opacity: confirming ? 0.7 : 1,
                                }}
                            >
                                {confirming ? "جاري القبول..." : "قبول الطالب"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setPendingBooking(null);
                                }}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: 10,
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    color: "#64748b",
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
                                طلبات الطلاب
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                مراجعة وقبول طلبات انضمام الطلاب للخطط والحلقات
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            {
                                label: "إجمالي الطلبات",
                                value: pagination?.total || bookings.length,
                                color: "#4ade80",
                            },
                            {
                                label: "يمكن قبولهم",
                                value: totalAvailable,
                                color: "#fbbf24",
                            },
                            {
                                label: "الحلقة مكتملة",
                                value: totalFull,
                                color: "#f87171",
                            },
                            {
                                label: "الصفحة الحالية",
                                value: `${currentPage} / ${pagination?.last_page || 1}`,
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
                                    minWidth: 88,
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
                        <div
                            style={{
                                flex: 1,
                                minWidth: 180,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                gap: 6,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "rgba(255,255,255,.5)",
                                }}
                            >
                                نسبة الطلبات القابلة للقبول
                            </div>
                            <div
                                style={{
                                    height: 8,
                                    background: "rgba(255,255,255,.1)",
                                    borderRadius: 4,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: bookings.length
                                            ? `${(totalAvailable / bookings.length) * 100}%`
                                            : "0%",
                                        background:
                                            "linear-gradient(90deg,#4ade80,#22d3ee)",
                                        borderRadius: 4,
                                        transition: "width .6s ease",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════
                TABLE / CARDS
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
                            قائمة الطلبات
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#94a3b8",
                                    fontWeight: 400,
                                    marginRight: 6,
                                }}
                            >
                                ({bookings.length} طلب)
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            عرض {filteredBookings.length} من {bookings.length}{" "}
                            طلب
                        </div>
                    </div>
                </div>

                {/* toolbar */}
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
                            onChange={handleSearch}
                            placeholder="بحث بالطالب أو الخطة..."
                            disabled={loading}
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
                                onClick={() => {
                                    setSearch("");
                                    searchBookings("");
                                }}
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

                    <select
                        value={capacityFilter}
                        onChange={(e) =>
                            setCapacityFilter(e.target.value as CapacityFilter)
                        }
                        style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 10,
                            padding: "7px 12px",
                            fontSize: 12,
                            fontFamily: "inherit",
                            background: "#fff",
                            color: "#1e293b",
                            cursor: "pointer",
                            outline: "none",
                            minWidth: 140,
                        }}
                    >
                        <option value="">كل الطلبات</option>
                        <option value="available">يمكن قبولهم</option>
                        <option value="full">الحلقة مكتملة</option>
                    </select>

                    {(search || capacityFilter) && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setCapacityFilter("");
                                searchBookings("");
                            }}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 12px",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: "#fff",
                                color: "#64748b",
                                cursor: "pointer",
                                fontSize: 12,
                                fontFamily: "inherit",
                            }}
                        >
                            <FiRotateCcw size={11} /> مسح الفلاتر
                        </button>
                    )}

                    <span
                        style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginRight: "auto",
                        }}
                    >
                        {filteredBookings.length} نتيجة
                    </span>

                    <div
                        style={{
                            display: "flex",
                            gap: 3,
                            background: "#f1f5f9",
                            borderRadius: 10,
                            padding: 3,
                        }}
                    >
                        {(
                            [
                                ["table", <FiList size={12} />, "جدول"],
                                ["cards", <FiGrid size={12} />, "بطاقات"],
                            ] as [ViewMode, React.ReactNode, string][]
                        ).map(([v, ico, lbl]) => (
                            <button
                                key={v}
                                onClick={() => setViewMode(v)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "5px 12px",
                                    borderRadius: 7,
                                    border: "none",
                                    cursor: "pointer",
                                    background:
                                        viewMode === v
                                            ? "#1e293b"
                                            : "transparent",
                                    color: viewMode === v ? "#fff" : "#64748b",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    transition: "all .15s",
                                }}
                            >
                                {ico} {lbl}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── TABLE VIEW ── */}
                {viewMode === "table" && (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={{ ...TH, width: 60 }}>الطالب</th>
                                    <th style={TH}>الاسم</th>
                                    <th style={TH}>الهاتف</th>
                                    <th style={TH}>الخطة</th>
                                    <th style={TH}>الحلقة</th>
                                    <th style={TH}>المدرس</th>
                                    <th style={TH}>التاريخ</th>
                                    <th style={TH}>الوقت</th>
                                    <th style={{ ...TH, width: 110 }}>السعة</th>
                                    <th style={TH}>تاريخ الطلب</th>
                                    <th style={{ ...TH, width: 130 }}>
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            style={{
                                                textAlign: "center",
                                                padding: 40,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    margin: "0 auto",
                                                    border: "3px solid #dbeafe",
                                                    borderTopColor: "#2563eb",
                                                    borderRadius: "50%",
                                                    animation:
                                                        "sbm-spin 0.7s linear infinite",
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={11}>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    padding: "40px 0",
                                                    color: "#94a3b8",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 30,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    📋
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {search || capacityFilter
                                                        ? "لا توجد نتائج مطابقة"
                                                        : "لا يوجد طلبات قيد الانتظار"}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((b, idx) => (
                                        <tr
                                            key={b.id}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#f8fafc")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    "#fff")
                                            }
                                            style={{
                                                transition: "background .1s",
                                            }}
                                        >
                                            <td style={TD}>
                                                <Avatar
                                                    name={b.student_name}
                                                    idx={idx}
                                                />
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontWeight: 800,
                                                        fontSize: 13,
                                                        color: "#0C447C",
                                                    }}
                                                >
                                                    {b.student_name}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {b.student_phone}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        color: "#1e293b",
                                                    }}
                                                >
                                                    {b.plan_name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#94a3b8",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    ({b.plan_months} شهر)
                                                </div>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {b.circle_name}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {b.teacher_name}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {new Date(
                                                        b.schedule_date,
                                                    ).toLocaleDateString(
                                                        "ar-EG",
                                                    )}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        background: "#eff6ff",
                                                        color: "#1e40af",
                                                        border: "1px solid #dbeafe",
                                                        padding: "3px 10px",
                                                        borderRadius: 20,
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {formatTime(b.time_range)}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <CapacityBadge booking={b} />
                                            </td>
                                            <td style={TD}>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#94a3b8",
                                                    }}
                                                >
                                                    {new Date(
                                                        b.booked_at,
                                                    ).toLocaleDateString(
                                                        "ar-EG",
                                                    )}
                                                </span>
                                            </td>
                                            <td style={TD}>
                                                <button
                                                    onClick={() =>
                                                        handleConfirmClick(b)
                                                    }
                                                    disabled={
                                                        !b.can_confirm ||
                                                        loading
                                                    }
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        padding: "6px 14px",
                                                        borderRadius: 8,
                                                        border: "none",
                                                        background:
                                                            b.can_confirm
                                                                ? "#0f6e56"
                                                                : "#e2e8f0",
                                                        color: b.can_confirm
                                                            ? "#fff"
                                                            : "#94a3b8",
                                                        cursor: b.can_confirm
                                                            ? "pointer"
                                                            : "not-allowed",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                        opacity: loading
                                                            ? 0.6
                                                            : 1,
                                                    }}
                                                >
                                                    {b.can_confirm ? (
                                                        <>
                                                            <FiCheckCircle
                                                                size={11}
                                                            />{" "}
                                                            قبول
                                                        </>
                                                    ) : (
                                                        "مكتمل"
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── CARDS VIEW ── */}
                {viewMode === "cards" && (
                    <div style={{ padding: "16px 20px" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: 40 }}>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        margin: "0 auto",
                                        border: "3px solid #dbeafe",
                                        borderTopColor: "#2563eb",
                                        borderRadius: "50%",
                                        animation:
                                            "sbm-spin 0.7s linear infinite",
                                    }}
                                />
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px 0",
                                    color: "#94a3b8",
                                }}
                            >
                                <div style={{ fontSize: 30, marginBottom: 8 }}>
                                    📋
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>
                                    {search || capacityFilter
                                        ? "لا توجد نتائج مطابقة"
                                        : "لا يوجد طلبات"}
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fill,minmax(260px,1fr))",
                                    gap: 12,
                                }}
                            >
                                {filteredBookings.map((b, idx) => {
                                    const av =
                                        AV_COLORS[idx % AV_COLORS.length];
                                    return (
                                        <div
                                            key={b.id}
                                            style={{
                                                background: "#f8fafc",
                                                borderRadius: 14,
                                                border: "1px solid #e2e8f0",
                                                borderRight: `4px solid ${b.can_confirm ? "#16a34a" : "#ef4444"}`,
                                                padding: "16px",
                                                transition: "all .15s",
                                            }}
                                            onMouseEnter={(e) => {
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.background = "#fff";
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.boxShadow =
                                                    "0 4px 16px #0001";
                                            }}
                                            onMouseLeave={(e) => {
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.background = "#f8fafc";
                                                (
                                                    e.currentTarget as HTMLDivElement
                                                ).style.boxShadow = "none";
                                            }}
                                        >
                                            {/* top row */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                    marginBottom: 12,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <Avatar
                                                        name={b.student_name}
                                                        idx={idx}
                                                    />
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontSize: 14,
                                                                fontWeight: 900,
                                                                color: "#0C447C",
                                                            }}
                                                        >
                                                            {b.student_name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#94a3b8",
                                                            }}
                                                        >
                                                            {b.student_phone}
                                                        </div>
                                                    </div>
                                                </div>
                                                <CapacityBadge booking={b} />
                                            </div>

                                            {/* body */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 6,
                                                    marginBottom: 14,
                                                }}
                                            >
                                                {[
                                                    {
                                                        label: "📚 الخطة",
                                                        value: `${b.plan_name} (${b.plan_months} شهر)`,
                                                    },
                                                    {
                                                        label: "🕌 الحلقة",
                                                        value: b.circle_name,
                                                    },
                                                    {
                                                        label: "👨‍🏫 المدرس",
                                                        value: b.teacher_name,
                                                    },
                                                    {
                                                        label: "📅 الموعد",
                                                        value: `${new Date(b.schedule_date).toLocaleDateString("ar-EG")} — ${formatTime(b.time_range)}`,
                                                    },
                                                    {
                                                        label: "🗓 الطلب",
                                                        value: new Date(
                                                            b.booked_at,
                                                        ).toLocaleDateString(
                                                            "ar-EG",
                                                        ),
                                                    },
                                                ].map((row) => (
                                                    <div
                                                        key={row.label}
                                                        style={{
                                                            display: "flex",
                                                            gap: 8,
                                                            alignItems:
                                                                "flex-start",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#94a3b8",
                                                                width: 60,
                                                                flexShrink: 0,
                                                                marginTop: 1,
                                                            }}
                                                        >
                                                            {row.label}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: 12,
                                                                color: "#475569",
                                                                flex: 1,
                                                                lineHeight: 1.5,
                                                            }}
                                                        >
                                                            {row.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* action */}
                                            <div
                                                style={{
                                                    paddingTop: 12,
                                                    borderTop:
                                                        "1px solid #f1f5f9",
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleConfirmClick(b)
                                                    }
                                                    disabled={
                                                        !b.can_confirm ||
                                                        loading
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        gap: 6,
                                                        padding: "8px 0",
                                                        borderRadius: 9,
                                                        border: "none",
                                                        background:
                                                            b.can_confirm
                                                                ? "#0f6e56"
                                                                : "#e2e8f0",
                                                        color: b.can_confirm
                                                            ? "#fff"
                                                            : "#94a3b8",
                                                        cursor: b.can_confirm
                                                            ? "pointer"
                                                            : "not-allowed",
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                    }}
                                                >
                                                    {b.can_confirm ? (
                                                        <>
                                                            <FiCheckCircle
                                                                size={13}
                                                            />{" "}
                                                            قبول الطالب
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiXCircle
                                                                size={13}
                                                            />{" "}
                                                            الحلقة مكتملة
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                            padding: "12px 20px",
                            borderTop: "1px solid #f1f5f9",
                        }}
                    >
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            عرض {bookings.length} من {pagination.total} طلب ·
                            الصفحة <strong>{currentPage}</strong> من{" "}
                            <strong>{pagination.last_page}</strong>
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={!hasPrev || loading}
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    cursor: !hasPrev
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 12,
                                    fontFamily: "inherit",
                                    opacity: !hasPrev ? 0.4 : 1,
                                }}
                            >
                                السابق
                            </button>
                            <button
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: 8,
                                    border: "none",
                                    background: "#1e293b",
                                    color: "#fff",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                }}
                            >
                                {currentPage}
                            </button>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={!hasNext || loading}
                                style={{
                                    padding: "5px 14px",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    cursor: !hasNext
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 12,
                                    fontFamily: "inherit",
                                    opacity: !hasNext ? 0.4 : 1,
                                }}
                            >
                                التالي
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes sbm-spin  { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default StudentBookingsManagement;
