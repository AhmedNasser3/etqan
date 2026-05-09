// TeacherMeetCard.tsx
import React, { useState } from "react";
import Profile from "./widgets/dashboard/profile";
import { useTeacherTodayMeet } from "./widgets/TeahcerRoom/hooks/useTeacherTodayMeet";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    FiVideo,
    FiCopy,
    FiCheck,
    FiClock,
    FiCalendar,
    FiUser,
} from "react-icons/fi";
import TeacherPlan from "./widgets/teacherPlan/TeacherPlan";
import QuickCheckinPage from "./widgets/QuickCheckin/QuickCheckinPage";

// ─── Time helper ──────────────────────────────────────────────────────────────

function to12h(t: string | null | undefined): string {
    if (!t) return "";
    if (t.includes("صباحاً") || t.includes("مساءً")) return t;
    let timePart = t;
    if (t.includes("T")) timePart = t.split("T")[1];
    const [hStr, mStr] = timePart.split(":");
    const h = parseInt(hStr, 10);
    const suffix = h >= 12 ? "مساءً" : "صباحاً";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${(mStr ?? "00").slice(0, 2)} ${suffix}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TeacherMeetCard: React.FC = () => {
    const { meetData, loading, error, refetch } = useTeacherTodayMeet();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const copyRoomLink = async () => {
        try {
            await navigator.clipboard.writeText(meetData?.jitsi_url ?? "");
            setCopied(true);
            toast.success("تم نسخ رابط الحصة!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("فشل في نسخ الرابط");
        }
    };

    const joinMeeting = () => {
        if (meetData?.id) {
            navigate(`/teacher-dashboard/room?schedule=${meetData.id}`);
        } else {
            toast.error("لا يمكن الدخول - معرف الحصة مفقود");
        }
    };

    return (
        <>
            <TeacherPlan />

            <div
                style={{
                    fontFamily: "'Tajawal', sans-serif",
                    direction: "rtl",
                    padding: "0 24px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                {/* ── Today's Session Card ──
                {loading || error || !meetData ? (

                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            border: "1px solid #e2e8f0",
                            overflow: "hidden",
                            boxShadow: "0 2px 16px #0001",
                        }}
                    >
                        <div style={{ height: 4, background: "#e2e8f0" }} />
                        <div
                            style={{
                                padding: "32px 24px",
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    background: "#f1f5f9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <FiVideo size={20} color="#94a3b8" />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: "#1e293b",
                                    }}
                                >
                                    لا توجد حصص اليوم
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#94a3b8",
                                        marginTop: 3,
                                    }}
                                >
                                    لم يتم جدولة أي حصة لهذا اليوم
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            border: "1px solid #e2e8f0",
                            overflow: "hidden",
                            boxShadow: "0 2px 16px #0001",
                        }}
                    >
                        <div
                            style={{
                                height: 4,
                                background:
                                    "linear-gradient(90deg, #1e293b, #0f6e56)",
                            }}
                        />

                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg, #1e293b, #0f4c35)",
                                padding: "14px 20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 8,
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
                                    backgroundSize: "20px 20px",
                                    pointerEvents: "none",
                                }}
                            />
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "rgba(255,255,255,0.12)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    borderRadius: 999,
                                    padding: "5px 14px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#fff",
                                    position: "relative",
                                }}
                            >
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: "#86efac",
                                        boxShadow:
                                            "0 0 0 2px rgba(134,239,172,.3)",
                                        animation: "pulse-dot 2s infinite",
                                        flexShrink: 0,
                                    }}
                                />
                                حلقتي اليوم
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        fontSize: 12,
                                        color: "rgba(255,255,255,.6)",
                                        fontWeight: 600,
                                    }}
                                >
                                    <FiCalendar size={12} />
                                    <span>{meetData.schedule_date}</span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        fontSize: 12,
                                        color: "rgba(255,255,255,.6)",
                                        fontWeight: 600,
                                    }}
                                >
                                    <FiClock size={12} />
                                    <span>{to12h(meetData.start_time)}</span>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "20px 20px",
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{ position: "relative", flexShrink: 0 }}
                            >
                                <div
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: "50%",
                                        background: "#E1F5EE",
                                        color: "#085041",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 18,
                                        fontWeight: 900,
                                    }}
                                >
                                    {meetData.student_name?.charAt(0) || "ط"}
                                </div>
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 1,
                                        left: 1,
                                        width: 12,
                                        height: 12,
                                        borderRadius: "50%",
                                        background: "#16a34a",
                                        border: "2px solid #fff",
                                    }}
                                />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 900,
                                        color: "#1e293b",
                                    }}
                                >
                                    {meetData.student_name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#94a3b8",
                                        marginTop: 2,
                                    }}
                                >
                                    {meetData.circle_name || "طالب الحلقة"}
                                </div>
                            </div>

                            <div
                                style={{
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 12,
                                    padding: "10px 16px",
                                    flexShrink: 0,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "#94a3b8",
                                        fontWeight: 700,
                                        marginBottom: 3,
                                        letterSpacing: ".5px",
                                    }}
                                >
                                    موضوع الحصة
                                </div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: "#1e293b",
                                    }}
                                >
                                    {meetData.jitsi_room_name || "حصة قرآنية"}
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                padding: "0 20px 20px",
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                onClick={joinMeeting}
                                style={{
                                    flex: 1,
                                    minWidth: 120,
                                    height: 46,
                                    background:
                                        "linear-gradient(135deg, #1e293b, #0f4c35)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 12,
                                    fontFamily: "'Tajawal', sans-serif",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    transition: "opacity .15s",
                                }}
                            >
                                <FiVideo size={16} /> دخول الحصة
                            </button>

                            <button
                                onClick={copyRoomLink}
                                style={{
                                    flex: 1,
                                    minWidth: 120,
                                    height: 46,
                                    background: copied ? "#dcfce7" : "#f8fafc",
                                    color: copied ? "#166534" : "#475569",
                                    border: `1px solid ${copied ? "#bbf7d0" : "#e2e8f0"}`,
                                    borderRadius: 12,
                                    fontFamily: "'Tajawal', sans-serif",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    transition: "all .2s",
                                }}
                            >
                                {copied ? (
                                    <>
                                        <FiCheck size={15} /> تم!
                                    </>
                                ) : (
                                    <>
                                        <FiCopy size={15} /> نسخ الرابط
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
 */}
                {/* ── Quick Checkin ── */}
                <QuickCheckinPage />
            </div>

            <style>{`
                @keyframes pulse-dot {
                    0%, 100% { box-shadow: 0 0 0 2px rgba(134,239,172,.3); }
                    50%       { box-shadow: 0 0 0 5px rgba(134,239,172,.1); }
                }
            `}</style>
        </>
    );
};

export default TeacherMeetCard;
