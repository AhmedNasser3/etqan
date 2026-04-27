// TeacherMeetCard.tsx
import React, { useState } from "react";
import Profile from "./widgets/dashboard/profile";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { IoCopy } from "react-icons/io5";
import { useTeacherTodayMeet } from "./widgets/TeahcerRoom/hooks/useTeacherTodayMeet"; //  المسار الصحيح
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { ICO } from "../icons";
import TeacherPlan from "./widgets/teacherPlan/TeacherPlan";
import TeacherAttendance from "./widgets/TeacherAttendance/TeacherAttendance";
import QuickCheckinPage from "./widgets/QuickCheckin/QuickCheckinPage";

const TeacherMeetCard: React.FC = () => {
    const { meetData, loading, error, refetch } = useTeacherTodayMeet();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    if (loading || error || !meetData) {
        return (
            <div className="sc">
                <div className="sc-strip">
                    <div className="sc-live-badge">
                        <div className="sc-live-dot" />
                        لا توجد حصص اليوم
                    </div>
                </div>
            </div>
        );
    }

    const copyRoomLink = async () => {
        try {
            await navigator.clipboard.writeText(meetData.jitsi_url);
            setCopied(true);
            toast.success("تم نسخ رابط الحصة!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("فشل في نسخ الرابط:", err);
            toast.error("❌ فشل في نسخ الرابط");
        }
    };

    const joinMeeting = () => {
        if (meetData.id) {
            navigate(`/teacher-dashboard/room?schedule=${meetData.id}`);
        } else {
            toast.error("❌ لا يمكن الدخول - معرف الحصة مفقود");
        }
    };

    const NEXT_SESSION = {
        date: meetData.schedule_date,
        time: meetData.start_time,
        studentName: meetData.student_name,
        studentTitle: meetData.circle_name || "طالب الحلقة",
        subject: meetData.jitsi_room_name || "حصة قرآنية",
        duration: "",
    };

    return (
        <div className="content" id="contentArea">
            <div className="sc">
                <div className="sc-strip">
                    <div className="sc-live-badge">
                        <div className="sc-live-dot" />
                        حلقتي اليوم
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11.5,
                            color: "rgba(255,255,255,.4)",
                            fontWeight: 600,
                        }}
                    >
                        {ICO.clock}
                        <span>
                            {NEXT_SESSION.date} · {NEXT_SESSION.time}
                        </span>
                    </div>
                </div>
                <div className="sc-body">
                    {/* Student */}
                    <div className="sc-teacher">
                        <div className="sc-tav">
                            <span className="sc-tinit">
                                {meetData.student_name?.charAt(0) || "ط"}
                            </span>
                            <div className="sc-online" />
                        </div>
                        <div>
                            <div className="sc-tname">
                                {NEXT_SESSION.studentName}
                            </div>
                            <div className="sc-ttitle">
                                {NEXT_SESSION.studentTitle}
                            </div>
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="sc-subject">
                        <div className="sc-slbl">موضوع الحصة</div>
                        <div className="sc-sval">{NEXT_SESSION.subject}</div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 11.5,
                                color: "var(--n400)",
                                marginTop: 4,
                            }}
                        >
                            {ICO.clock}
                            <span>{NEXT_SESSION.duration}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="sc-acts">
                        <button className="enter-btn" onClick={joinMeeting}>
                            {ICO.video || <SiGoogledisplayandvideo360 />} دخول
                            الحصة
                        </button>
                        <button className="copy-btn" onClick={copyRoomLink}>
                            {copied ? (
                                <>{ICO.check} تم!</>
                            ) : (
                                <>{ICO.copy || <IoCopy />} نسخ الرابط</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <TeacherPlan />
            <TeacherAttendance />
            <QuickCheckinPage />
        </div>
    );
};

export default TeacherMeetCard;
