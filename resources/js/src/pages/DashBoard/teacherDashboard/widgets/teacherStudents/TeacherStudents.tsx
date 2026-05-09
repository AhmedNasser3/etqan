import React, { useState } from "react";
import {
    FiSearch,
    FiUsers,
    FiUserCheck,
    FiUserX,
    FiTrendingUp,
    FiRefreshCw,
    FiInbox,
    FiCheckCircle,
    FiXCircle,
} from "react-icons/fi";
import { useTeacherStudents } from "./hooks/useTeacherStudents";

interface Student {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    progress?: number;
    status: "active" | "paused";
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AV_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
    { bg: "#EEEDFE", color: "#3C3489" },
];

const AvatarInitials = ({ name, idx }: { name: string; idx: number }) => {
    const av = AV_COLORS[idx % AV_COLORS.length];
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
    return (
        <div
            style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: av.bg,
                color: av.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
                fontFamily: "'Tajawal', sans-serif",
            }}
        >
            {initials}
        </div>
    );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({
    label,
    value,
    icon,
    accent,
    sub,
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    accent: string;
    sub?: string;
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px 22px",
            boxShadow: "0 2px 12px #0001",
            borderTop: `4px solid ${accent}`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
        }}
    >
        <div style={{ color: accent, fontSize: 20 }}>{icon}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#1e293b" }}>
            {value}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>
            {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>}
    </div>
);

// ─── btnStyle helper ──────────────────────────────────────────────────────────

const btnStyle = (
    bg: string,
    color: string,
    border = "none",
    extra: React.CSSProperties = {},
): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 14px",
    borderRadius: 10,
    border,
    background: bg,
    color,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'Tajawal', sans-serif",
    transition: "opacity .15s",
    ...extra,
});

// ─── Main Component ───────────────────────────────────────────────────────────

const TeacherStudents: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const { students, totalCount, loading, error, toggleStudentStatus } =
        useTeacherStudents();

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const activeCount = students.filter((s) => s.status === "active").length;
    const pausedCount = students.filter((s) => s.status === "paused").length;
    const avgProgress =
        students.length > 0
            ? Math.round(
                  students.reduce((acc, s) => acc + (s.progress || 0), 0) /
                      students.length,
              )
            : 0;

    const TH: React.CSSProperties = {
        padding: "10px 14px",
        textAlign: "right",
        color: "#64748b",
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
        borderBottom: "1px solid #f1f5f9",
    };

    const TD: React.CSSProperties = {
        padding: "12px 14px",
        borderBottom: "1px solid #f8fafc",
        verticalAlign: "middle",
    };

    return (
        <div
            style={{
                fontFamily: "'Tajawal', sans-serif",
                direction: "rtl",
                background: "#f8fafc",
                minHeight: "100vh",
                padding: 24,
            }}
        >
            {/* ── Hero Header ── */}
            <div
                style={{
                    background: "linear-gradient(135deg, #1e293b, #0f4c35)",
                    borderRadius: 24,
                    padding: "32px 36px",
                    marginBottom: 24,
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.06,
                        backgroundImage:
                            "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                        pointerEvents: "none",
                    }}
                />
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            fontSize: 13,
                            color: "#86efac",
                            marginBottom: 4,
                        }}
                    >
                        لوحة المعلم
                    </div>
                    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>
                        قائمة الطلاب
                    </h1>
                    <p
                        style={{
                            margin: "6px 0 0",
                            color: "#94a3b8",
                            fontSize: 13,
                        }}
                    >
                        إدارة الطلاب · متابعة الحالة · تفعيل أو إيقاف الاشتراك
                    </p>
                </div>
            </div>

            {/* ── Stats ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 14,
                    marginBottom: 24,
                }}
            >
                <StatCard
                    label="إجمالي الطلاب"
                    value={students.length}
                    icon={<FiUsers />}
                    accent="#1e293b"
                />
                <StatCard
                    label="طلاب نشطون"
                    value={activeCount}
                    icon={<FiUserCheck />}
                    accent="#16a34a"
                />
                <StatCard
                    label="طلاب موقوفون"
                    value={pausedCount}
                    icon={<FiUserX />}
                    accent="#dc2626"
                />
                <StatCard
                    label="متوسط التقدم"
                    value={`${avgProgress}%`}
                    icon={<FiTrendingUp />}
                    accent="#9333ea"
                    sub="عبر جميع الطلاب"
                />
            </div>

            {/* ── Error ── */}
            {error && (
                <div
                    style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        borderRadius: 12,
                        padding: "12px 16px",
                        marginBottom: 14,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <FiXCircle size={14} /> {error}
                </div>
            )}

            {/* ── Table Card ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 2px 16px #0001",
                    border: "1px solid #e2e8f0",
                }}
            >
                {/* Search Bar */}
                <div
                    style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1e293b",
                        }}
                    >
                        {filteredStudents.length} طالب
                        {searchTerm && ` — نتائج "${searchTerm}"`}
                    </span>
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#f8fafc",
                            borderRadius: 10,
                            padding: "8px 14px",
                            border: "1px solid #e2e8f0",
                            minWidth: 220,
                        }}
                    >
                        <FiSearch size={14} color="#94a3b8" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="البحث بالاسم..."
                            style={{
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: 13,
                                flex: 1,
                                fontFamily: "'Tajawal', sans-serif",
                                color: "#1e293b",
                                direction: "rtl",
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    color: "#94a3b8",
                                    display: "flex",
                                    padding: 0,
                                }}
                            >
                                ×
                            </button>
                        )}
                    </label>
                </div>

                {/* Table */}
                {loading ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#94a3b8",
                        }}
                    >
                        <FiRefreshCw
                            size={28}
                            style={{
                                display: "block",
                                margin: "0 auto 12px",
                                color: "#0f6e56",
                            }}
                        />
                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                            جارٍ تحميل البيانات...
                        </div>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            color: "#94a3b8",
                        }}
                    >
                        <FiInbox
                            size={40}
                            style={{ display: "block", margin: "0 auto 12px" }}
                        />
                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                            {searchTerm
                                ? `لا توجد نتائج لـ "${searchTerm}"`
                                : "لا يوجد طلاب"}
                        </div>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 13,
                                fontFamily: "'Tajawal', sans-serif",
                            }}
                        >
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    <th style={TH}>#</th>
                                    <th style={TH}>الطالب</th>
                                    <th style={TH}>التقدم</th>
                                    <th style={TH}>الحالة</th>
                                    <th style={{ ...TH, cursor: "default" }}>
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        style={{
                                            background:
                                                idx % 2 === 0
                                                    ? "#fff"
                                                    : "#fafafa",
                                            transition: "background .15s",
                                        }}
                                    >
                                        {/* # */}
                                        <td style={TD}>
                                            <span
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: "50%",
                                                    background: "#E1F5EE",
                                                    color: "#085041",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {idx + 1}
                                            </span>
                                        </td>

                                        {/* الطالب */}
                                        <td style={TD}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                }}
                                            >
                                                {item.avatar ? (
                                                    <img
                                                        src={item.avatar}
                                                        alt={item.name}
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                ) : (
                                                    <AvatarInitials
                                                        name={item.name}
                                                        idx={idx}
                                                    />
                                                )}
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: 700,
                                                            fontSize: 13,
                                                            color: "#1e293b",
                                                        }}
                                                    >
                                                        {item.name}
                                                    </div>
                                                    {item.email && (
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#94a3b8",
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            {item.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* التقدم */}
                                        <td style={TD}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    minWidth: 100,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        height: 6,
                                                        background: "#f1f5f9",
                                                        borderRadius: 999,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            height: "100%",
                                                            width: `${item.progress ?? 0}%`,
                                                            background:
                                                                (item.progress ??
                                                                    0) >= 80
                                                                    ? "#16a34a"
                                                                    : (item.progress ??
                                                                            0) >=
                                                                        50
                                                                      ? "#d97706"
                                                                      : "#dc2626",
                                                            borderRadius: 999,
                                                            transition:
                                                                "width .3s",
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        color: "#475569",
                                                        minWidth: 30,
                                                    }}
                                                >
                                                    {item.progress ?? 0}%
                                                </span>
                                            </div>
                                        </td>

                                        {/* الحالة */}
                                        <td style={TD}>
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 5,
                                                    padding: "4px 12px",
                                                    borderRadius: 999,
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    background:
                                                        item.status === "active"
                                                            ? "#dcfce7"
                                                            : "#fee2e2",
                                                    color:
                                                        item.status === "active"
                                                            ? "#166534"
                                                            : "#dc2626",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {item.status === "active" ? (
                                                    <FiCheckCircle size={11} />
                                                ) : (
                                                    <FiXCircle size={11} />
                                                )}
                                                {item.status === "active"
                                                    ? "نشط"
                                                    : "متوقف"}
                                            </span>
                                        </td>

                                        {/* الإجراءات */}
                                        <td style={TD}>
                                            <button
                                                onClick={() =>
                                                    toggleStudentStatus(item.id)
                                                }
                                                style={
                                                    item.status === "active"
                                                        ? btnStyle(
                                                              "#fee2e2",
                                                              "#dc2626",
                                                              "1px solid #fecaca",
                                                              {
                                                                  fontSize: 11,
                                                                  padding:
                                                                      "5px 12px",
                                                              },
                                                          )
                                                        : btnStyle(
                                                              "#dcfce7",
                                                              "#166534",
                                                              "1px solid #bbf7d0",
                                                              {
                                                                  fontSize: 11,
                                                                  padding:
                                                                      "5px 12px",
                                                              },
                                                          )
                                                }
                                            >
                                                {item.status === "active" ? (
                                                    <>
                                                        <FiUserX size={11} />{" "}
                                                        وقف الطالب
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiUserCheck
                                                            size={11}
                                                        />{" "}
                                                        تنشيط الطالب
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherStudents;
