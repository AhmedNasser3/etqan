// StudentApproval.tsx — نسخة مُعاد تصميمها
import React, { useState, useEffect, useMemo } from "react";
import ParentModel from "./modals/ParentModel";
import {
    usePendingStudents,
    useConfirmStudent,
    useRejectStudent,
} from "./hooks/usePendingStudents";
import { useToast } from "../../../../../../contexts/ToastContext";
import {
    FiSearch,
    FiX,
    FiGrid,
    FiList,
    FiRotateCcw,
    FiCheckCircle,
    FiXCircle,
    FiUser,
} from "react-icons/fi";

interface StudentType {
    id: number;
    name: string;
    id_number: string;
    grade_level: string;
    circle: string;
    center?: { name: string };
    created_at: string;
    guardian?: { name: string };
    user?: { name: string; status: string; avatar?: string };
    avatar?: string;
}

type ViewMode = "table" | "cards";

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
            {initials || "؟"}
        </div>
    );
};

const StudentApproval: React.FC = () => {
    const {
        students: studentsFromHook = [],
        loading: studentsLoading,
        refetch,
    } = usePendingStudents();
    const { confirmStudent } = useConfirmStudent();
    const { rejectStudent } = useRejectStudent();
    const { notifySuccess, notifyError } = useToast();

    const [students, setStudents] = useState<StudentType[]>([]);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [showParentModal, setShowParentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(
        null,
    );
    const [confirmLoadingIds, setConfirmLoadingIds] = useState<Set<number>>(
        new Set(),
    );
    const [rejectLoadingIds, setRejectLoadingIds] = useState<Set<number>>(
        new Set(),
    );

    /* Reject modal */
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
    const [rejecting, setRejecting] = useState(false);

    useEffect(() => {
        setStudents(studentsFromHook);
    }, [studentsFromHook]);

    const filteredStudents = useMemo(
        () =>
            students.filter((s) => {
                const q = search.trim().toLowerCase();
                return (
                    !q ||
                    (s.name || "").toLowerCase().includes(q) ||
                    (s.id_number || "").toLowerCase().includes(q) ||
                    (s.grade_level || "").toLowerCase().includes(q) ||
                    (s.circle || "").toLowerCase().includes(q) ||
                    (s.guardian?.name || "").toLowerCase().includes(q) ||
                    (s.center?.name || "").toLowerCase().includes(q)
                );
            }),
        [students, search],
    );

    /* Stats */
    const total = students.length;

    const handleApprove = async (id: number) => {
        setConfirmLoadingIds((prev) => new Set([...prev, id]));
        try {
            await confirmStudent(id);
            notifySuccess("تم اعتماد الطالب بنجاح!");
            setStudents((prev) => prev.filter((s) => s.id !== id));
        } catch (error: any) {
            notifyError(error.message || "خطأ في اعتماد الطالب");
        } finally {
            setConfirmLoadingIds((prev) => {
                const s = new Set(prev);
                s.delete(id);
                return s;
            });
        }
    };

    const handleRejectClick = (id: number) => {
        setRejectTargetId(id);
        setShowRejectModal(true);
    };

    const handleRejectConfirm = async () => {
        if (!rejectTargetId) return;
        setRejecting(true);
        try {
            await rejectStudent(rejectTargetId);
            notifySuccess("تم رفض طلب الطالب بنجاح!");
            setStudents((prev) => prev.filter((s) => s.id !== rejectTargetId));
            setShowRejectModal(false);
            setRejectTargetId(null);
        } catch (error: any) {
            notifyError(error.message || "خطأ في رفض الطالب");
        } finally {
            setRejecting(false);
        }
    };

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

    if (studentsLoading && students.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 400,
                    gap: 14,
                    fontFamily: "'Tajawal',sans-serif",
                }}
            >
                <div
                    style={{
                        width: 44,
                        height: 44,
                        border: "4px solid #dbeafe",
                        borderTopColor: "#2563eb",
                        borderRadius: "50%",
                        animation: "sa-spin 0.8s linear infinite",
                    }}
                />
                <span style={{ color: "#64748b", fontSize: 14 }}>
                    جاري تحميل الطلاب...
                </span>
                <style>{`@keyframes sa-spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

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
            {/* Reject Modal */}
            {showRejectModal && (
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
                            maxWidth: 420,
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
                                background: "#fee2e2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                            }}
                        >
                            <FiXCircle size={24} color="#b91c1c" />
                        </div>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 900,
                                color: "#1e293b",
                                marginBottom: 8,
                            }}
                        >
                            رفض طلب الطالب
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "#64748b",
                                marginBottom: 24,
                            }}
                        >
                            هل أنت متأكد من رفض طلب هذا الطالب؟ لا يمكن التراجع.
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                onClick={handleRejectConfirm}
                                disabled={rejecting}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "#dc2626",
                                    color: "#fff",
                                    cursor: rejecting
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                    opacity: rejecting ? 0.7 : 1,
                                }}
                            >
                                {rejecting ? "جاري الرفض..." : "رفض الطلب"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectTargetId(null);
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

            {/* Parent Modal */}
            {showParentModal && selectedStudent && (
                <ParentModel
                    isOpen={showParentModal}
                    onClose={() => {
                        setShowParentModal(false);
                        setSelectedStudent(null);
                    }}
                    student={selectedStudent}
                />
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
                                اعتماد الطلاب الجدد
                            </h1>
                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#94a3b8",
                                    fontSize: 12,
                                }}
                            >
                                مراجعة طلبات الطلاب الجدد واعتمادهم أو رفضهم
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            {
                                label: "إجمالي الطلبات",
                                value: total,
                                color: "#4ade80",
                            },
                            {
                                label: "المعروضون الآن",
                                value: filteredStudents.length,
                                color: "#fbbf24",
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
                                نسبة الظاهرين من الإجمالي
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
                                        width: total
                                            ? `${(filteredStudents.length / total) * 100}%`
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
                            قائمة الطلاب المعلقين
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#94a3b8",
                                    fontWeight: 400,
                                    marginRight: 6,
                                }}
                            >
                                ({students.length} طالب)
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                            }}
                        >
                            عرض {filteredStudents.length} من {students.length}{" "}
                            طالب
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
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث بالاسم أو رقم الهوية أو الحلقة أو المجمع..."
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

                    {search && (
                        <button
                            onClick={() => setSearch("")}
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
                            <FiRotateCcw size={11} /> مسح البحث
                        </button>
                    )}

                    <span
                        style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            marginRight: "auto",
                        }}
                    >
                        {filteredStudents.length} نتيجة
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
                                    <th style={{ ...TH, width: 60 }}>الصورة</th>
                                    <th style={TH}>الاسم الرباعي</th>
                                    <th style={TH}>رقم الهوية</th>
                                    <th style={TH}>الصف</th>
                                    <th style={TH}>الحلقة</th>
                                    <th style={TH}>المجمع</th>
                                    <th style={TH}>ولي الأمر</th>
                                    <th style={TH}>تاريخ التقديم</th>
                                    <th style={{ ...TH, width: 200 }}>
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsLoading ? (
                                    <tr>
                                        <td
                                            colSpan={9}
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
                                                        "sa-spin 0.7s linear infinite",
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={9}>
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
                                                    🎓
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {search
                                                        ? "لا توجد نتائج مطابقة"
                                                        : "لا يوجد طلاب معلقين"}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((item, idx) => {
                                        const name =
                                            item.name ||
                                            item.user?.name ||
                                            "غير محدد";
                                        const isConfirmLoading =
                                            confirmLoadingIds.has(item.id);
                                        const isRejectLoading =
                                            rejectLoadingIds.has(item.id);
                                        return (
                                            <tr
                                                key={item.id}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "#f8fafc")
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "#fff")
                                                }
                                                style={{
                                                    transition:
                                                        "background .1s",
                                                }}
                                            >
                                                <td style={TD}>
                                                    <Avatar
                                                        name={name}
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
                                                        {name}
                                                    </span>
                                                </td>
                                                <td style={TD}>
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#475569",
                                                        }}
                                                    >
                                                        {item.id_number || "—"}
                                                    </span>
                                                </td>
                                                <td style={TD}>
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#475569",
                                                        }}
                                                    >
                                                        {item.grade_level ||
                                                            "—"}
                                                    </span>
                                                </td>
                                                <td style={TD}>
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#475569",
                                                        }}
                                                    >
                                                        {item.circle || "—"}
                                                    </span>
                                                </td>
                                                <td style={TD}>
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#475569",
                                                        }}
                                                    >
                                                        {item.center?.name ||
                                                            "—"}
                                                    </span>
                                                </td>
                                                <td style={TD}>
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#15803d",
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {item.guardian?.name ||
                                                            "غير محدد"}
                                                    </span>
                                                </td>
                                                <td style={TD}>
                                                    <span
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#94a3b8",
                                                        }}
                                                    >
                                                        {
                                                            (
                                                                item.created_at ||
                                                                ""
                                                            ).split("T")[0]
                                                        }
                                                    </span>
                                                </td>
                                                <td style={TD}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: 5,
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                setSelectedStudent(
                                                                    item,
                                                                );
                                                                setShowParentModal(
                                                                    true,
                                                                );
                                                            }}
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 4,
                                                                padding:
                                                                    "5px 10px",
                                                                borderRadius: 8,
                                                                border: "1px solid #e2e8f0",
                                                                background:
                                                                    "#f8fafc",
                                                                color: "#475569",
                                                                cursor: "pointer",
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                fontFamily:
                                                                    "inherit",
                                                            }}
                                                        >
                                                            <FiUser size={10} />{" "}
                                                            ولي
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    item.id,
                                                                )
                                                            }
                                                            disabled={
                                                                isConfirmLoading
                                                            }
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 4,
                                                                padding:
                                                                    "5px 10px",
                                                                borderRadius: 8,
                                                                border: "none",
                                                                background:
                                                                    isConfirmLoading
                                                                        ? "#e2e8f0"
                                                                        : "#0f6e56",
                                                                color: isConfirmLoading
                                                                    ? "#94a3b8"
                                                                    : "#fff",
                                                                cursor: isConfirmLoading
                                                                    ? "not-allowed"
                                                                    : "pointer",
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                fontFamily:
                                                                    "inherit",
                                                            }}
                                                        >
                                                            {isConfirmLoading ? (
                                                                "..."
                                                            ) : (
                                                                <>
                                                                    <FiCheckCircle
                                                                        size={
                                                                            10
                                                                        }
                                                                    />{" "}
                                                                    اعتماد
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleRejectClick(
                                                                    item.id,
                                                                )
                                                            }
                                                            disabled={
                                                                isRejectLoading
                                                            }
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 4,
                                                                padding:
                                                                    "5px 10px",
                                                                borderRadius: 8,
                                                                border: "1px solid #fecaca",
                                                                background:
                                                                    "#fee2e2",
                                                                color: "#b91c1c",
                                                                cursor: isRejectLoading
                                                                    ? "not-allowed"
                                                                    : "pointer",
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                fontFamily:
                                                                    "inherit",
                                                            }}
                                                        >
                                                            {isRejectLoading ? (
                                                                "..."
                                                            ) : (
                                                                <>
                                                                    <FiXCircle
                                                                        size={
                                                                            10
                                                                        }
                                                                    />{" "}
                                                                    رفض
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── CARDS VIEW ── */}
                {viewMode === "cards" && (
                    <div style={{ padding: "16px 20px" }}>
                        {studentsLoading ? (
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
                                            "sa-spin 0.7s linear infinite",
                                    }}
                                />
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px 0",
                                    color: "#94a3b8",
                                }}
                            >
                                <div style={{ fontSize: 30, marginBottom: 8 }}>
                                    🎓
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>
                                    {search
                                        ? "لا توجد نتائج مطابقة"
                                        : "لا يوجد طلاب معلقين"}
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
                                {filteredStudents.map((item, idx) => {
                                    const name =
                                        item.name ||
                                        item.user?.name ||
                                        "غير محدد";
                                    const av =
                                        AV_COLORS[idx % AV_COLORS.length];
                                    const isConfirmLoading =
                                        confirmLoadingIds.has(item.id);
                                    const isRejectLoading =
                                        rejectLoadingIds.has(item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            style={{
                                                background: "#f8fafc",
                                                borderRadius: 14,
                                                border: "1px solid #e2e8f0",
                                                borderRight: `4px solid ${av.color}`,
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
                                            {/* top */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    marginBottom: 12,
                                                }}
                                            >
                                                <Avatar name={name} idx={idx} />
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            fontWeight: 900,
                                                            color: "#0C447C",
                                                        }}
                                                    >
                                                        {name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#94a3b8",
                                                        }}
                                                    >
                                                        {
                                                            (
                                                                item.created_at ||
                                                                ""
                                                            ).split("T")[0]
                                                        }
                                                    </div>
                                                </div>
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
                                                        label: "🆔 الهوية",
                                                        value:
                                                            item.id_number ||
                                                            "—",
                                                    },
                                                    {
                                                        label: "📚 الصف",
                                                        value:
                                                            item.grade_level ||
                                                            "—",
                                                    },
                                                    {
                                                        label: "🕌 الحلقة",
                                                        value:
                                                            item.circle || "—",
                                                    },
                                                    {
                                                        label: "🏛 المجمع",
                                                        value:
                                                            item.center?.name ||
                                                            "—",
                                                    },
                                                    {
                                                        label: "👨‍👦 ولي الأمر",
                                                        value:
                                                            item.guardian
                                                                ?.name ||
                                                            "غير محدد",
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
                                                                width: 64,
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
                                                            }}
                                                        >
                                                            {row.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* actions */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 6,
                                                    paddingTop: 12,
                                                    borderTop:
                                                        "1px solid #f1f5f9",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(
                                                            item,
                                                        );
                                                        setShowParentModal(
                                                            true,
                                                        );
                                                    }}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        padding: "6px 12px",
                                                        borderRadius: 8,
                                                        border: "1px solid #e2e8f0",
                                                        background: "#f8fafc",
                                                        color: "#475569",
                                                        cursor: "pointer",
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                    }}
                                                >
                                                    <FiUser size={11} /> بيانات
                                                    ولي
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleApprove(item.id)
                                                    }
                                                    disabled={isConfirmLoading}
                                                    style={{
                                                        flex: 1,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        gap: 4,
                                                        padding: "6px 0",
                                                        borderRadius: 8,
                                                        border: "none",
                                                        background:
                                                            isConfirmLoading
                                                                ? "#e2e8f0"
                                                                : "#0f6e56",
                                                        color: isConfirmLoading
                                                            ? "#94a3b8"
                                                            : "#fff",
                                                        cursor: isConfirmLoading
                                                            ? "not-allowed"
                                                            : "pointer",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                    }}
                                                >
                                                    {isConfirmLoading ? (
                                                        "جاري..."
                                                    ) : (
                                                        <>
                                                            <FiCheckCircle
                                                                size={12}
                                                            />{" "}
                                                            اعتماد
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleRejectClick(
                                                            item.id,
                                                        )
                                                    }
                                                    disabled={isRejectLoading}
                                                    style={{
                                                        padding: "6px 14px",
                                                        borderRadius: 8,
                                                        border: "1px solid #fecaca",
                                                        background: "#fee2e2",
                                                        color: "#b91c1c",
                                                        cursor: isRejectLoading
                                                            ? "not-allowed"
                                                            : "pointer",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        fontFamily: "inherit",
                                                    }}
                                                >
                                                    {isRejectLoading ? (
                                                        "..."
                                                    ) : (
                                                        <>
                                                            <FiXCircle
                                                                size={12}
                                                            />{" "}
                                                            رفض
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
            </div>

            <style>{`
                @keyframes sa-spin  { to { transform: rotate(360deg); } }
                @keyframes sa-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
            `}</style>
        </div>
    );
};

export default StudentApproval;
