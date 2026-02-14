import React from "react";
import { FaStar } from "react-icons/fa";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { IoCopy } from "react-icons/io5";
import { useUserNextMeet } from "./hooks/useUserNextMeet";
import { useNavigate } from "react-router-dom";

const UserMeetCard: React.FC = () => {
    const { meetData, loading, error } = useUserNextMeet();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="userProfile__meet">
                <div className="userProfile__inner">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#666",
                        }}
                    >
                        ⏳ جاري تحميل الحصة القادمة...
                    </div>
                </div>
            </div>
        );
    }

    if (error || !meetData) {
        return (
            <div className="userProfile__meet">
                <div className="userProfile__inner">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#999",
                            background: "#f8f9fa",
                            borderRadius: "12px",
                        }}
                    >
                        لا توجد حصص قادمة حالياً
                    </div>
                </div>
            </div>
        );
    }

    const copyRoomLink = () => {
        navigator.clipboard.writeText(meetData.jitsi_url);
        // toast.success('تم نسخ رابط الحصة!');
    };

    const joinMeeting = () => {
        window.open(meetData.jitsi_url, "_blank", "noopener,noreferrer");
    };

    const formatTimeRemaining = (timeStr: string) => {
        return timeStr; // "6 ساعات و 22 دقيقة"
    };

    return (
        <div className="userProfile__meet">
            <div className="userProfile__inner">
                <div className="userProfile__meetContainer">
                    {/* معلومات المعلم */}
                    <div className="userProfile__meet">
                        <div className="userProfile__meetImg">
                            <img
                                src={
                                    meetData.teacher_image ||
                                    "https://png.pngtree.com/png-vector/20230705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp"
                                }
                                alt={meetData.teacher_name}
                            />
                        </div>
                        <div className="userProfile__meetContent">
                            <div className="userProfile__meetName">
                                <h1>{meetData.teacher_name}</h1>
                            </div>
                            <div className="userProfile__rating">
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                                <i>
                                    <FaStar />
                                </i>
                            </div>
                        </div>
                    </div>

                    {/* تفاصيل الحصة */}
                    <div className="userProfile__meetDetails">
                        <div className="userProfile__meetDate">
                            <h1>الحصة بعد:</h1>
                            <span>
                                {formatTimeRemaining(meetData.time_remaining)}
                            </span>
                        </div>

                        <div className="userProfile__meetConatin">
                            <div className="userProfile__meetDescription">
                                <h2 className="userProfile__meetDescription active">
                                    محتوى الحصة
                                </h2>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: meetData.notes,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* أزرار الحصة */}
                    <div className="userProfile__meetBtn">
                        <div
                            className="userProfile__meetBtnUrl"
                            onClick={copyRoomLink}
                        >
                            <i>
                                <IoCopy />
                            </i>
                            <h1>{meetData.jitsi_room_name}</h1>
                        </div>
                        <button onClick={joinMeeting}>
                            دخول الحصة
                            <i>
                                <SiGoogledisplayandvideo360 />
                            </i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserMeetCard;
