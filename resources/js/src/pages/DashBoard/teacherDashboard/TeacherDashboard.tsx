import React from "react";
import Profile from "./widgets/dashboard/profile";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import { IoCopy } from "react-icons/io5";
import TeacherTodayCircle from "./widgets/TeacherTodayCircle/TeacherTodayCircle";
import { useTeacherTodayMeet } from "./widgets/TeahcerRoom/hooks/useTeacherTodayMeet"; // ✅ المسار الصحيح
import { useNavigate } from "react-router-dom";
import TeacherSessionsTable from "./widgets/TeahcerRoom/models/TeacherSessionsTable";
import QuickCheckinPage from "./widgets/QuickCheckin/QuickCheckinPage";

const TeacherDashboard: React.FC = () => {
    const { meetData, loading, error } = useTeacherTodayMeet();
    const navigate = useNavigate();

    const copyRoomLink = () => {
        if (meetData?.jitsi_url) {
            navigator.clipboard.writeText(meetData.jitsi_url);
        }
    };

    // ✅ زر دخول الحصة يفتح TeacherRoom مع schedule_id
    const joinMeeting = () => {
        if (meetData?.id) {
            // ينتقل لصفحة TeacherRoom مع schedule_id في URL
            navigate(`/teacher-dashboard/room?schedule=${meetData.id}`);
        }
    };

    if (loading) {
        return (
            <div className="teacherDashboard">
                <div className="teacherDashboard__inner">
                    <Profile />
                    <div className="userProfile__plan">
                        <div
                            className="testimonials__mainTitle"
                            style={{ marginBottom: "0" }}
                        >
                            <h1>حلقتي اليوم</h1>
                        </div>
                        <div
                            className="userProfile__meet"
                            style={{ padding: "0" }}
                        >
                            <div
                                className="userProfile__inner"
                                style={{ width: "100%" }}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "2rem",
                                        color: "#666",
                                    }}
                                >
                                    ⏳ جاري تحميل حصة اليوم...
                                </div>
                            </div>
                        </div>
                    </div>
                    <TeacherTodayCircle />
                </div>
            </div>
        );
    }

    return (
        <div className="teacherDashboard">
            <div className="teacherDashboard__inner">
                <Profile />
                <div className="userProfile__plan">
                    <QuickCheckinPage />
                    <div
                        className="testimonials__mainTitle"
                        style={{ marginBottom: "0" }}
                    >
                        <h1>حلقتي اليوم</h1>
                    </div>

                    {error || !meetData ? (
                        <div
                            className="userProfile__meet"
                            style={{ padding: "0" }}
                        >
                            <div
                                className="userProfile__inner"
                                style={{ width: "100%" }}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "2rem",
                                        color: "#999",
                                        background: "#f8f9fa",
                                        borderRadius: "8px",
                                    }}
                                >
                                    لا توجد حصص اليوم
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="userProfile__meet"
                            style={{ padding: "0" }}
                        >
                            <div
                                className="userProfile__inner"
                                style={{ width: "100%" }}
                            >
                                <div className="userProfile__meetContainer">
                                    {/* صورة الطالب */}
                                    <div className="userProfile__meet">
                                        <div className="userProfile__meetImg">
                                            <img
                                                src={
                                                    meetData.student_image ||
                                                    "https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-a-saudi-man-traditional-attire-middle-aged-wearing-white-thobe-and-png-image_16610073.webp"
                                                }
                                                alt={meetData.student_name}
                                            />
                                        </div>
                                        <div className="userProfile__meetContent">
                                            <div className="userProfile__meetName">
                                                <h1>{meetData.student_name}</h1>
                                            </div>
                                        </div>
                                    </div>

                                    {/* تفاصيل الحصة */}
                                    <div className="userProfile__meetDetails">
                                        <div className="userProfile__meetDate">
                                            <h1>الطالب/</h1>
                                            <span>{meetData.student_name}</span>
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
                                        {/* ✅ زر دخول الحصة يفتح TeacherRoom */}
                                        <button
                                            className="userProfile__button"
                                            onClick={joinMeeting}
                                            style={{
                                                background: "#007bff",
                                                color: "white",
                                                border: "none",
                                                padding: "12px 24px",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontSize: "16px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            دخول الحصة
                                            <i>
                                                <SiGoogledisplayandvideo360 />
                                            </i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
