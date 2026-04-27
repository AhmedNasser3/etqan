// UserMeetCard.tsx
import React, { useState } from "react";
import { useUserNextMeet } from "./hooks/useUserNextMeet";
import { useNavigate } from "react-router-dom";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { IoCopy } from "react-icons/io5";
import toast from "react-hot-toast";
import { ICO } from "../../icons"; // افترض إنه موجود

const UserMeetCard: React.FC = () => {
    const { meetData, loading, error, refetch } = useUserNextMeet();
    const navigate = useNavigate();
    const [attended, setAttended] = useState(false);
    const [copied, setCopied] = useState(false);

    if (error || !meetData) {
        return (
            <div className="sc">
                <div className="sc-strip">
                    <div className="sc-live-badge">
                        <div className="sc-live-dot" />
                        لا توجد حصص قادمة
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
            navigate(`/user-dashboard/room?schedule=${meetData.id}`);
        } else {
            toast.error("❌ لا يمكن الدخول - معرف الحصة مفقود");
        }
    };

    const NEXT_SESSION = {
        date: meetData.schedule_date,
        time: meetData.start_time,
        teacherName: meetData.teacher_name,
        teacherTitle: meetData.circle_name || "معلم الحلقة",
        subject: meetData.jitsi_room_name || "حصة قرآنية",
        duration: "",
    };

    return (
        <div className="sc">
            <div className="sc-strip">
                <div className="sc-live-badge">
                    <div className="sc-live-dot" />
                    الحصة القادمة
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
                {/* Teacher */}
                <div className="sc-teacher">
                    <div className="sc-tav">
                        <span className="sc-tinit">أ</span>
                        <div className="sc-online" />
                    </div>
                    <div>
                        <div className="sc-tname">
                            {NEXT_SESSION.teacherName}
                        </div>
                        <div className="sc-ttitle">
                            {NEXT_SESSION.teacherTitle}
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
                    {!attended ? (
                        <button
                            className="attend-now"
                            onClick={() => setAttended(true)}
                            style={{ fontSize: "12px" }}
                        >
                            تسجيل الحضور
                        </button>
                    ) : (
                        <div className="attended-ok">تم تسجيل الحضور</div>
                    )}
                    <button className="enter-btn" onClick={joinMeeting}>
                        {ICO.video || <SiGoogledisplayandvideo360 />} دخول الحصة
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
    );
};

export default UserMeetCard;
